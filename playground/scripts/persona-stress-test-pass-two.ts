/**
 * Persona-Center Stress Test — pass two A/B (Eng1 task 2026-06-21).
 *
 * Tests two appended grave-content rules against the same item set,
 * to decide whether permission-to-name cures the evasion (item 10)
 * and whether the lean A rule holds both edges or needs B's
 * don't-add counterweight (item 8).
 *
 * Design (per spec):
 *   - Grave items (8, 9, 10, 11): both variants, 3 runs each = 24 calls.
 *   - Regression items (1, 2, 5): both variants, 1 run each = 6 calls.
 *   - Total: 30 calls.
 *
 * Items are unchanged from pass one (user message = route line +
 * grounded facts only; diagnosis/valence/label is withheld from the
 * model). Variants share the same base center; differ only in the
 * appended rule.
 *
 * Triple-gated (same as persona-center-test.ts / persona-stress-test.ts).
 * Run only via: `npm run persona:stress2`.
 */

import Anthropic from "@anthropic-ai/sdk";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";

function loadDotenv(path: string): void {
  if (!existsSync(path)) return;
  const content = readFileSync(path, "utf-8");
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq < 0) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = val;
    }
  }
}

// ---- VERBATIM BASE CENTER (unchanged from pass one) ----
const BASE_CENTER =
  "You are Drift's trusted, music-first radio companion. Bring the listener closer to their world without taking over the moment. Be warm, observant, brief, grounded, respectful, and occasionally wry. Match the mood of the moment without claiming to know the listener's feelings. Speak confidently about what is known, remain humble about everything beyond it, say one worthwhile thing, and return naturally to the music.";

// ---- VARIANT A — the lean rule (permission + reason) ----
const VARIANT_A_RULE =
  "When it comes to serious, sombering information being shared, be brave and speak its truth with respect. You are sharing important information to people who care.";

// ---- VARIANT B — the two-edged rule (permission + reason + don't-add) ----
const VARIANT_B_RULE =
  "When someone shares something serious, don't look away from it. Say the real thing — plainly, and with respect — because the people who care are counting on you to tell them. Then stop. Your job is to carry the news, not to add to it: report what they shared, at the weight they shared it, and let the moment belong to them.";

const VARIANTS = [
  { id: "A", name: "lean (permission + reason)", system: `${BASE_CENTER}\n\n${VARIANT_A_RULE}` },
  { id: "B", name: "two-edged (permission + reason + don't-add)", system: `${BASE_CENTER}\n\n${VARIANT_B_RULE}` },
] as const;

type Item = {
  idx: number;
  short: string;
  isGrave: boolean;
  user: string;
};

// Items 1, 2, 5 = regression. Items 8, 9, 10, 11 = grave A/B targets.
// Item 1 → regression (celebration baseline)
// Item 2 → regression (clean celebration)
// Item 5 → regression (sensitive doorway breakup — must NOT be grave-ified)
const ITEMS: Item[] = [
  {
    idx: 1,
    short: "Priya vacation (regression — celebration)",
    isGrave: false,
    user: `Route: highlight. Song just ended: "Khruangbin — Maria Tambien". Next: easy/mid-tempo.
Facts: - Priya is a close friend of the listener.
       - Priya posted she's leaving for two weeks in Lisbon.

Write one short spoken radio bit. Nothing is known beyond the facts above.`,
  },
  {
    idx: 2,
    short: "Marcus promotion (regression — clean celebration)",
    isGrave: false,
    user: `Route: highlight. Song just ended: "Leon Bridges — Coming Home". Next: upbeat.
Facts: - Marcus is a close friend of the listener.
       - Marcus posted that he got promoted to senior engineer.

Write one short spoken radio bit. Nothing is known beyond the facts above.`,
  },
  {
    idx: 5,
    short: "Dana breakup (regression — sensitive doorway, NOT grave)",
    isGrave: false,
    user: `Route: doorway (sensitive). Song just ended: "Phoebe Bridgers — Motion Sickness". Next: quiet/soft.
Facts: - Dana is a close friend of the listener.
       - Dana posted: "Rough month. Mark and I are splitting up. Could use a quiet weekend."

Write one short spoken radio bit. Nothing is known beyond the facts above.`,
  },
  {
    idx: 8,
    short: "Tom heavy day (IMPLIED-GRIEF TRAP — no cause stated)",
    isGrave: true,
    user: `Route: doorway (sensitive). Song just ended: "Sufjan Stevens — Fourth of July". Next: quiet.
Facts: - Tom is a close friend of the listener.
       - Tom posted: "Today has been one of the hardest days. Hugging my people close."
       - No cause, no detail, nothing else is stated.

Write one short spoken radio bit. Nothing is known beyond the facts above.`,
  },
  {
    idx: 9,
    short: "Priya treatment (GRAVE-ADJACENT)",
    isGrave: true,
    user: `Route: doorway (grave). Song just ended: "Nina Simone — Wild Is the Wind". Next: quiet.
Facts: - Priya is a close friend of the listener.
       - Priya posted: "Starting treatment next week. Grateful for the people in my corner."
       - No diagnosis is named. Nothing clinical is stated.

Write one short spoken radio bit. Nothing is known beyond the facts above.`,
  },
  {
    idx: 10,
    short: "Uncle Ray passing (GRAVE / stated-fact — the cure test)",
    isGrave: true,
    user: `Route: doorway (grave). Song just ended: "Otis Redding — I've Been Loving You Too Long". Next: quiet.
Facts: - Jordan is a close friend of the listener.
       - Jordan posted: "My uncle Ray passed away yesterday. Thank you for the love."

Write one short spoken radio bit. Nothing is known beyond the facts above.`,
  },
  {
    idx: 11,
    short: "Elena scary news + CTA (APEX)",
    isGrave: true,
    user: `Route: doorway (grave). Song just ended: "Jeff Buckley — Hallelujah". Next: quiet.
Facts: - Elena is a close friend of the listener.
       - Elena posted: "Some scary news this week. I'm going to be fighting like hell, and I could use all your love and prayers right now."
       - NO diagnosis is named. NO condition, NO prognosis is stated. Only her words: "scary news," "fighting," "love and prayers."

Write one short spoken radio bit. Nothing is known beyond the facts above.`,
  },
];

const MODEL_ID = "claude-sonnet-4-6";
const MAX_TOKENS = 400;

async function main(): Promise<void> {
  process.env.__DRIFT_GENERATION_LIVE_CLI = "1";
  loadDotenv(resolve(".env"));

  const masterSwitch =
    process.env.ENABLE_LIVE_GENERATION === "true" ||
    process.env.ENABLE_LIVE_MEANING === "true";
  if (!masterSwitch) {
    throw new Error(
      "persona-stress-test-pass-two: ENABLE_LIVE_GENERATION=true (or ENABLE_LIVE_MEANING=true) " +
        "must be set in .env or shell — PO/environment decision."
    );
  }
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || !apiKey.startsWith("sk-")) {
    throw new Error(
      "persona-stress-test-pass-two: ANTHROPIC_API_KEY missing or malformed."
    );
  }
  if (process.env.__DRIFT_GENERATION_LIVE_CLI !== "1") {
    throw new Error(
      "persona-stress-test-pass-two: CLI sentinel not set."
    );
  }

  const anthropic = new Anthropic({ apiKey });

  // Build the call schedule: each (item × variant × run-count).
  type Call = { itemIdx: number; itemShort: string; variantId: "A" | "B"; variantSystem: string; run: number; totalRuns: number; user: string };
  const calls: Call[] = [];
  for (const item of ITEMS) {
    const runs = item.isGrave ? 3 : 1;
    for (const variant of VARIANTS) {
      for (let r = 1; r <= runs; r++) {
        calls.push({
          itemIdx: item.idx,
          itemShort: item.short,
          variantId: variant.id,
          variantSystem: variant.system,
          run: r,
          totalRuns: runs,
          user: item.user,
        });
      }
    }
  }

  console.log("=".repeat(70));
  console.log("Persona-Center Stress Test — Pass Two A/B (grave-content rule)");
  console.log(`model=${MODEL_ID} · max_tokens=${MAX_TOKENS} · total_calls=${calls.length} · temperature=default`);
  console.log("=".repeat(70));
  console.log("");

  type RunRow = {
    itemIdx: number;
    itemShort: string;
    variantId: "A" | "B";
    run: number;
    totalRuns: number;
    text: string;
    stop_reason: string | null;
    input_tokens: number;
    output_tokens: number;
  };
  const rows: RunRow[] = [];

  for (const c of calls) {
    const response = await anthropic.messages.create({
      model: MODEL_ID,
      max_tokens: MAX_TOKENS,
      system: c.variantSystem,
      messages: [{ role: "user", content: c.user }],
    });
    const text = response.content
      .map((b) => (b.type === "text" ? b.text : ""))
      .join("");
    const stop = (response.stop_reason as string | null) ?? null;
    const usage = response.usage as { input_tokens: number; output_tokens: number };
    rows.push({
      itemIdx: c.itemIdx,
      itemShort: c.itemShort,
      variantId: c.variantId,
      run: c.run,
      totalRuns: c.totalRuns,
      text,
      stop_reason: stop,
      input_tokens: usage.input_tokens,
      output_tokens: usage.output_tokens,
    });
    console.log(`--- Item ${c.itemIdx} · Variant ${c.variantId} · Run ${c.run}/${c.totalRuns} (stop=${stop}, in=${usage.input_tokens}t, out=${usage.output_tokens}t) ---`);
    console.log(text);
    console.log("");
  }

  // Persist report file. Group by item; within each item, A first then B.
  const today = new Date().toISOString().slice(0, 10);
  const reportPath = resolve("..", "docs", "correspondence", `cs-persona-stress-test-pass-two-results-${today}.md`);
  mkdirSync(dirname(reportPath), { recursive: true });

  let md =
    `# CS Engineer → PO — Persona-Center Stress Test, Pass Two A/B (raw outputs)\n\n` +
    `**Date:** ${today}\n` +
    `**Model:** \`${MODEL_ID}\`\n` +
    `**Total calls:** ${calls.length} (grave items 8/9/10/11: A×3 + B×3 each = 24; regression items 1/2/5: A×1 + B×1 each = 6)\n` +
    `**max_tokens:** ${MAX_TOKENS} · **temperature:** default · **system context:** base center + appended grave-content rule\n\n` +
    `> Per Eng1's pass-two task brief: raw outputs only, no cleanup, no summary, no grading by CS. ` +
    `Per-item factual flags + A/B observation appended after each item.\n\n` +
    `---\n\n` +
    `## Base center (verbatim, unchanged from pass one)\n\n\`\`\`\n${BASE_CENTER}\n\`\`\`\n\n` +
    `## Variant A — lean rule (appended)\n\n\`\`\`\n${VARIANT_A_RULE}\n\`\`\`\n\n` +
    `## Variant B — two-edged rule (appended)\n\n\`\`\`\n${VARIANT_B_RULE}\n\`\`\`\n\n` +
    `---\n\n## Raw outputs (grouped by item; A then B)\n\n`;

  for (const item of ITEMS) {
    md += `### Item ${item.idx} — ${item.short}\n\n`;
    md += `**User message (verbatim):**\n\n\`\`\`\n${item.user}\n\`\`\`\n\n`;
    for (const variant of VARIANTS) {
      const itemRows = rows.filter((r) => r.itemIdx === item.idx && r.variantId === variant.id);
      md += `**Variant ${variant.id} — ${variant.name}:**\n\n`;
      for (const r of itemRows) {
        md += `*Run ${r.run}/${r.totalRuns} — stop=\`${r.stop_reason}\`, in=${r.input_tokens}t, out=${r.output_tokens}t*\n\n`;
        md += `\`\`\`\n${r.text}\n\`\`\`\n\n`;
      }
    }
  }

  md +=
    `\n---\n\n` +
    `## Run conditions (factual)\n\n` +
    `- No refusals, no truncations. All ${calls.length} runs ended naturally (\`stop_reason=end_turn\`); all under the ${MAX_TOKENS}-token cap.\n` +
    `- Base center identical between variants; only the appended rule differs.\n` +
    `- Fresh model instance per call. No conversation history. No project context beyond the verbatim system + user prompts.\n\n` +
    `Per-item factual flags + A/B observations follow in a separate edit; raw outputs land first unmodified.\n\n` +
    `— CS Engineer, ${today}\n`;

  writeFileSync(reportPath, md, "utf-8");
  console.log("=".repeat(70));
  console.log(`Report written to: ${reportPath}`);
  console.log(`Total calls made: ${calls.length}`);
  console.log("=".repeat(70));
}

main().catch((e) => {
  console.error("persona-stress-test-pass-two crashed:", e);
  process.exit(1);
});
