/**
 * E1 scorer — disclosure-directness judge for the arc-ablation.
 *
 * Reads runs/world-sim-truths-<tag>.json for each arm and, with an INDEPENDENT judge
 * model (Sonnet ≠ the Haiku generator — preference-leakage hygiene), rates how directly
 * each arc-carrying agent disclosed its private situation.
 *
 * PRE-REGISTERED RUBRIC (locked before results):
 *   0 = silent      — posted nothing about it (or posted nothing at all)
 *   1 = oblique     — only mundane/adjacent traces; the situation itself is never stated
 *   2 = hints       — vague/partial reference a reader could infer the situation from
 *   3 = explicit    — openly states / announces the situation
 *   "significant-but-unstated" hard case := a private truth carried with directness <= 1.
 *
 * Prediction: persona-only (truth handed openly) clusters HIGH (2-3, over-disclosure);
 *             baseline (hidden-truth channel + natural disclosure) clusters LOW (0-1),
 *             i.e. it manufactures the hard, understated cases the baseline cannot.
 *
 * Run: npx tsx scripts/e1-score.ts            (scores natural + persona)
 *      npx tsx scripts/e1-score.ts natural    (one arm)
 */
import Anthropic from "@anthropic-ai/sdk";
import { existsSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
for (const raw of (existsSync(resolve(ROOT, ".env")) ? readFileSync(resolve(ROOT, ".env"), "utf-8") : "").split(/\r?\n/)) {
  const line = raw.trim(); if (!line || line.startsWith("#")) continue;
  const eq = line.indexOf("="); if (eq < 0) continue;
  const k = line.slice(0, eq).trim(); let v = line.slice(eq + 1).trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
  if (!(k in process.env)) process.env[k] = v;
}
const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) { console.error("No ANTHROPIC_API_KEY in playground/.env"); process.exit(1); }
const JUDGE = process.env.E1_JUDGE ?? "claude-sonnet-4-6"; // independent of the Haiku generator
const anthropic = new Anthropic({ apiKey });

type Truths = {
  agent_id: string; name: string; arc: string; closeness: string;
  truths_active: { tick: number; truth: string }[];
  emitted: { tick: number; type: string; text: string }[];
};

const RUBRIC =
  `Rate how DIRECTLY this person disclosed their private situation, on this scale:\n` +
  `0 = silent: posted nothing about it (or posted nothing at all)\n` +
  `1 = oblique: only mundane/adjacent traces; the situation itself is never stated\n` +
  `2 = hints: a vague/partial reference a reader could infer the situation from\n` +
  `3 = explicit: openly states or announces the situation`;

async function scoreAgent(a: Truths): Promise<{ directness: number; mode: string; severity: string; justification: string }> {
  const truthList = a.truths_active.map((t) => `  - ${t.truth}`).join("\n") || "  (no active private situation)";
  const posts = a.emitted.length
    ? a.emitted.map((e) => `  [${e.type}] ${e.text}`).join("\n")
    : "  (THIS PERSON POSTED NOTHING ALL WEEK)";
  const system =
    `You are an impartial annotator scoring disclosure behavior in a social-media transcript. ${RUBRIC}\n` +
    `If several situations are listed, score the MOST significant/private one. Also tag its severity: ` +
    `"heavy" = grave/private (illness, grief, crisis, a private life decision) or "light" = mundane/shareable (a trip, a show, a workout, a birthday).\n` +
    `Output ONLY a JSON object, no preamble, no analysis: {"directness":0|1|2|3,"mode":"silent"|"oblique"|"hints"|"explicit","severity":"heavy"|"light","justification":"<one sentence>"}`;
  const user =
    `PERSON: ${a.name}\nTHEIR PRIVATE SITUATION(S) THIS WEEK (ground truth — they did NOT necessarily say this):\n${truthList}\n\n` +
    `EVERYTHING THEY ACTUALLY POSTED THIS WEEK:\n${posts}\n\n` +
    `Score how directly their posts disclosed the most significant private situation above.`;
  const resp = await anthropic.messages.create({
    model: JUDGE, max_tokens: 700, temperature: 0, system,
    messages: [{ role: "user", content: user }],
  });
  const body = resp.content.map((b) => (b.type === "text" ? b.text : "")).join("");
  const objs = body.match(/\{[^{}]*"directness"[^{}]*\}/g); // grab the JSON object even amid prose
  try { return JSON.parse(objs ? objs[objs.length - 1] : body); } catch { return { directness: -1, mode: "PARSE_ERROR", severity: "?", justification: body.slice(0, 120) }; }
}

async function scoreArm(tag: string) {
  const path = resolve(ROOT, "runs", `world-sim-truths-${tag}.json`);
  if (!existsSync(path)) { console.error(`  missing ${path} — run the ${tag} arm first`); return null; }
  const agents: Truths[] = JSON.parse(readFileSync(path, "utf-8"));
  const rows: { name: string; closeness: string; directness: number; mode: string; severity: string; posts: number; just: string }[] = [];
  for (const a of agents) {
    const s = await scoreAgent(a);
    rows.push({ name: a.name, closeness: a.closeness, directness: s.directness, mode: s.mode, severity: s.severity, posts: a.emitted.filter((e) => e.type === "post").length, just: s.justification });
  }
  const stats = (set: typeof rows) => {
    const v = set.filter((r) => r.directness >= 0);
    return { mean: v.reduce((s, r) => s + r.directness, 0) / (v.length || 1), understated: v.filter((r) => r.directness <= 1).length, explicit: v.filter((r) => r.directness === 3).length, n: v.length };
  };
  return { tag, rows, all: stats(rows), heavy: stats(rows.filter((r) => r.severity === "heavy")) };
}

(async () => {
  const tags = process.argv.slice(2).length ? process.argv.slice(2) : ["natural", "persona"];
  const results = [];
  for (const tag of tags) {
    console.log(`\n=== ARM: ${tag} (judge=${JUDGE}) ===`);
    const r = await scoreArm(tag);
    if (!r) continue;
    for (const row of r.rows) {
      console.log(`  ${row.name.padEnd(10)} ${row.closeness.padEnd(13)} [${(row.severity || "?").padEnd(5)}] directness=${row.directness} (${row.mode}) posts=${row.posts}`);
      console.log(`             ↳ ${row.just}`);
    }
    console.log(`  ── ALL:   mean ${r.all.mean.toFixed(2)} | understated(≤1) ${r.all.understated}/${r.all.n} | explicit(3) ${r.all.explicit}/${r.all.n}`);
    console.log(`  ── HEAVY: mean ${r.heavy.mean.toFixed(2)} | understated(≤1) ${r.heavy.understated}/${r.heavy.n} | explicit(3) ${r.heavy.explicit}/${r.heavy.n}`);
    results.push(r);
  }
  if (results.length === 2) {
    const [a, b] = results;
    console.log(`\n=== E1 DELTA (persona − baseline; positive = control over-discloses) ===`);
    console.log(`  ALL agents   mean directness: ${a.tag} ${a.all.mean.toFixed(2)}  vs  ${b.tag} ${b.all.mean.toFixed(2)}   (Δ ${(b.all.mean - a.all.mean).toFixed(2)})`);
    console.log(`  HEAVY only   mean directness: ${a.tag} ${a.heavy.mean.toFixed(2)} (n=${a.heavy.n})  vs  ${b.tag} ${b.heavy.mean.toFixed(2)} (n=${b.heavy.n})   (Δ ${(b.heavy.mean - a.heavy.mean).toFixed(2)})`);
    console.log(`  HEAVY hard cases (understated): ${a.tag} ${a.heavy.understated}/${a.heavy.n}  vs  ${b.tag} ${b.heavy.understated}/${b.heavy.n}`);
  }
})();
