/**
 * Drift — A/B Editorial-Restraint run (change set v0.1.1, passes A1 + A2).
 * NON-MERGED DRAFT EXPERIMENT. v0.3.2 / box8-v0 stay frozen and untouched.
 *
 *   ARM A (A1): FROZEN v0.3.2 prompt  (#0576f0811b4d)  + augmented packets
 *   ARM B (A2): v0.4.0-draft prompt   (#bbef63ed8a7e)  + IDENTICAL augmented packets
 *
 * The user message is byte-identical across arms — the SYSTEM PROMPT is the only
 * variable. The model is NEVER shown the raw post, and never the *_evidence spans
 * (those stay code-side; renderEditorialPolicyForModel omits them).
 *
 * Scope: the items where the editorial rules can act — category ambiguous +
 * tier sensitive/grave. ≥3 generations each (all hard-tier).
 *
 * Measures (lexically-detectable rates only; CS does NOT score goodness — that's
 * the two-reviewer pass):
 *   - adjudication-tic rate  (APPROVAL_DENYLIST hits)        ← Rule 1 target
 *   - declined-framing imposition rate (§3b lexical hits)    ← Rule 2 target
 *   - manual-review-flag rate (the residual semantic gap §5 must close)
 * Compared ARM A vs ARM B. ARM A also serves as a sanity re-check against the
 * frozen run's known tic pattern.
 *
 * Triple-gated. Zero-call plan:  npx tsx scripts/run-ab-editorial.ts --plan
 * Live fire:                     ... --fire   (needs the three live env gates)
 */
import Anthropic from "@anthropic-ai/sdk";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { homedir } from "node:os";

import { GOLD_PACKETS_V04 } from "./gold-packets-augmented";
import { tierOf, generationCount, renderPacketForModel } from "../src/safety/packet";
import {
  type PacketV04, renderEditorialPolicyForModel,
} from "../src/safety/draft/packet-v0.4-draft";
import {
  FROZEN_V032_SYSTEM, FROZEN_V032_HASH, SYSTEM_V040, PROMPT_HASH_V040,
} from "../src/safety/draft/prompt-v0.4.0-draft";
import { routeGateV04, APPROVAL_DENYLIST } from "../src/safety/draft/routeGate-v0.4-draft";

function loadDotenv(path: string): void {
  if (!existsSync(path)) return;
  for (const rawLine of readFileSync(path, "utf-8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq < 0) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

const MODEL_ID = "claude-sonnet-4-6";
const MAX_TOKENS = 400;
const sha = (s: string) => createHash("sha256").update(s).digest("hex").slice(0, 12);

interface Arm { id: "A" | "B"; label: string; system: string; hash: string; }
const ARMS: Arm[] = [
  { id: "A", label: "frozen v0.3.2", system: FROZEN_V032_SYSTEM, hash: FROZEN_V032_HASH },
  { id: "B", label: "v0.4.0-draft", system: SYSTEM_V040, hash: PROMPT_HASH_V040 },
];

/** the user message both arms share — packet + model-facing policy block (no evidence). */
function userMessageFor(p: PacketV04): string {
  return renderPacketForModel(p) + "\n\n" + renderEditorialPolicyForModel(p);
}

function inScope(p: PacketV04): boolean {
  const t = tierOf(p);
  return p.category === "ambiguous" || t === "sensitive" || t === "grave";
}

interface GenRec {
  arm: "A" | "B"; item_id: string; gen: number; raw: string;
  approval_hits: string[]; declined_framing_hits: string[]; v04_disposition: string;
  manual_review_reason?: string; outTokens: number; stop: string | null;
}

async function main() {
  const args = process.argv.slice(2);
  const plan = args.includes("--plan");
  const fire = args.includes("--fire");
  if (!plan && !fire) throw new Error("pass --plan (zero-call) or --fire (live)");

  loadDotenv(resolve(".env"));
  const packets = GOLD_PACKETS_V04.filter(inScope);
  const perArm = packets.reduce((n, p) => n + generationCount(p), 0);
  const projected = perArm * ARMS.length;

  console.log("=".repeat(72));
  console.log(`Drift A/B Editorial-Restraint — ${plan ? "PLAN (0 calls)" : "LIVE FIRE"}`);
  console.log(`ARM A ${ARMS[0].label} #${ARMS[0].hash}  ·  ARM B ${ARMS[1].label} #${ARMS[1].hash}`);
  console.log(`in-scope items: ${packets.length}  (${packets.map((p) => p.item_id).join(" ")})`);
  console.log(`gens/arm: ${perArm}  ·  arms: ${ARMS.length}  ·  PROJECTED CALLS: ${projected}`);
  console.log("=".repeat(72));

  // Leak guard. Two checks:
  //  (1) HARD: the full raw post must never appear in the message.
  //  (2) DRAFT-SCOPED: the v0.4 layer (renderEditorialPolicyForModel) must not
  //      introduce any *_evidence span that isn't ALREADY model-visible via the
  //      frozen channels (permitted_source_spans or allowed_claims). This isolates
  //      "did the DRAFT leak" from frozen boundary/claim prose, which legitimately
  //      paraphrases the source and is reviewed, intended, already-run behavior.
  let leakProblems = 0;
  for (const p of packets) {
    const u = userMessageFor(p);
    if (u.includes(p.audit_raw_post)) { console.log(`LEAK(hard): raw post in message for ${p.item_id}`); leakProblems++; }
    const mine = renderEditorialPolicyForModel(p).toLowerCase();
    const alreadyPermitted = (s: string) =>
      p.permitted_source_spans.some((x) => x.toLowerCase().includes(s.toLowerCase())) ||
      p.allowed_claims.some((x) => x.toLowerCase().includes(s.toLowerCase()));
    const evid = [...p.declined_framing_evidence, ...p.outreach_evidence, ...p.questions_evidence, ...p.advice_evidence];
    for (const s of evid) {
      if (mine.includes(s.toLowerCase()) && !alreadyPermitted(s)) {
        console.log(`LEAK(draft): v0.4 layer exposes evidence span "${s}" for ${p.item_id}`); leakProblems++;
      }
    }
  }
  console.log(leakProblems === 0 ? "leak guard: CLEAN (no raw post; v0.4 layer adds no source text beyond permitted/allowed)" : `leak guard: ${leakProblems} PROBLEMS`);
  if (leakProblems > 0) throw new Error("leak guard failed — aborting");

  if (plan) {
    console.log("\nPLAN OK. Re-run with --fire (and the three live env gates) to execute.");
    return;
  }

  // ---- live gates ----
  const masterSwitch = process.env.ENABLE_LIVE_GENERATION === "true";
  if (!masterSwitch) throw new Error("ENABLE_LIVE_GENERATION=true must be set.");
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || !apiKey.startsWith("sk-")) throw new Error("ANTHROPIC_API_KEY missing or malformed.");
  if (process.env.__DRIFT_GENERATION_LIVE_CLI !== "1") throw new Error("CLI sentinel not set.");

  const anthropic = new Anthropic({ apiKey });
  const recs: GenRec[] = [];
  let calls = 0;

  for (const arm of ARMS) {
    console.log(`\n##### ARM ${arm.id} — ${arm.label} (#${arm.hash}) #####`);
    for (const p of packets) {
      const user = userMessageFor(p);
      if (user.includes(p.audit_raw_post)) throw new Error(`LEAK GUARD: raw post in message for ${p.item_id}`);
      const tier = tierOf(p);
      const nGen = generationCount(p);
      for (let g = 1; g <= nGen; g++) {
        calls++;
        const resp = await anthropic.messages.create({
          model: MODEL_ID, max_tokens: MAX_TOKENS, system: arm.system,
          messages: [{ role: "user", content: user }],
        });
        const raw = resp.content.map((b) => (b.type === "text" ? b.text : "")).join("");
        const usage = resp.usage as { output_tokens: number };
        const stop = (resp.stop_reason as string | null) ?? null;
        const r = routeGateV04(raw, tier as any, p.boundaries, p, p.permitted_source_spans);
        recs.push({
          arm: arm.id, item_id: p.item_id, gen: g, raw,
          approval_hits: r.approval_hits, declined_framing_hits: r.declined_framing_hits,
          v04_disposition: r.v04_disposition, manual_review_reason: r.manual_review_reason,
          outTokens: usage.output_tokens, stop,
        });
        console.log(`[${arm.id}] ${p.item_id} g${g}/${nGen} tics=${r.approval_hits.length} declined=${r.declined_framing_hits.length} disp=${r.v04_disposition} :: ${JSON.stringify(raw.slice(0, 120))}`);
      }
    }
  }

  // ---- metrics per arm ----
  const today = new Date().toISOString().slice(0, 10);
  const metric = (arm: "A" | "B") => {
    const a = recs.filter((r) => r.arm === arm);
    const tic = a.filter((r) => r.approval_hits.length > 0).length;
    const decl = a.filter((r) => r.declined_framing_hits.length > 0).length;
    const flag = a.filter((r) => r.v04_disposition === "manual_review_flag").length;
    return { n: a.length, tic, decl, flag };
  };
  const mA = metric("A"), mB = metric("B");
  const pct = (x: number, n: number) => `${x}/${n} (${(100 * x / n).toFixed(0)}%)`;

  console.log("\n" + "=".repeat(72));
  console.log("RESULTS (lexically-detectable rates; goodness is the two-reviewer pass)");
  console.log(`adjudication tics:        A ${pct(mA.tic, mA.n)}   B ${pct(mB.tic, mB.n)}`);
  console.log(`declined-framing imposed: A ${pct(mA.decl, mA.n)}   B ${pct(mB.decl, mB.n)}`);
  console.log(`manual-review flags:      A ${pct(mA.flag, mA.n)}   B ${pct(mB.flag, mB.n)}`);
  console.log("=".repeat(72));

  // ---- write report (in-repo) ----
  const path = resolve("..", "docs", "correspondence", `cs-ab-editorial-results-${today}.md`);
  mkdirSync(dirname(path), { recursive: true });
  let md =
    `# CS Engineer → PO/TL — A/B Editorial-Restraint run (passes A1 + A2)\n\n` +
    `**Date:** ${today} · **Model:** \`${MODEL_ID}\` · **max_tokens:** ${MAX_TOKENS} · **total calls:** ${calls}\n` +
    `**ARM A:** frozen v0.3.2 (\`${ARMS[0].hash}\`) · **ARM B:** v0.4.0-draft (\`${ARMS[1].hash}\`)\n` +
    `**Scope:** ${packets.length} items (ambiguous + sensitive + grave), ≥3 gens. User message byte-identical across arms; prompt the only variable. Model never shown raw post or evidence spans.\n\n` +
    `> Lexically-detectable rates only. CS does NOT score goodness — that is the two-reviewer pass. The manual-review-flag rate is the residual semantic gap §5 must close, by construction not caught lexically.\n\n` +
    `## Headline (A → B)\n\n` +
    `| metric | ARM A (v0.3.2) | ARM B (v0.4.0) |\n|---|---|---|\n` +
    `| adjudication tics | ${pct(mA.tic, mA.n)} | ${pct(mB.tic, mB.n)} |\n` +
    `| declined-framing imposed | ${pct(mA.decl, mA.n)} | ${pct(mB.decl, mB.n)} |\n` +
    `| manual-review flags | ${pct(mA.flag, mA.n)} | ${pct(mB.flag, mB.n)} |\n\n` +
    `## Per-generation log\n\n| arm | item | gen | tics | declined | disposition | line |\n|---|---|---|---|---|---|---|\n`;
  for (const r of recs) {
    md += `| ${r.arm} | ${r.item_id} | ${r.gen} | ${r.approval_hits.join(",") || "—"} | ${r.declined_framing_hits.join(",") || "—"} | ${r.v04_disposition} | ${JSON.stringify(r.raw.slice(0, 200))} |\n`;
  }
  md += `\n— CS Engineer, ${today}\n`;
  writeFileSync(path, md, "utf-8");

  // ---- machine dump (out-of-repo) ----
  const outDir = process.env.DRIFT_OUT_DIR || join(homedir(), ".drift-diagnostic-runs");
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, `cs-ab-editorial-${today}.json`), JSON.stringify({
    model: MODEL_ID, date: today, calls,
    armA: { ...ARMS[0], metrics: mA }, armB: { ...ARMS[1], metrics: mB },
    denylist: APPROVAL_DENYLIST, recs,
  }, null, 2), "utf-8");

  console.log(`\nreport: ${path}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
