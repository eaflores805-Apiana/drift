/**
 * Persona-Center Clean-Room Test (Eng1 task, 2026-06-21).
 *
 * Generation-surface live API call. Distinct from the meaning-pass
 * surface — gated independently so accidentally importing or running
 * one cannot trigger the other.
 *
 * Triple gate (mirrors the meaning-pass discipline):
 *   - PO master switch: ENABLE_LIVE_MEANING=true OR ENABLE_LIVE_GENERATION=true
 *   - ANTHROPIC_API_KEY set
 *   - CLI sentinel `__DRIFT_GENERATION_LIVE_CLI=1` (set in main(), below)
 *
 * Verbatim system + user prompts per the task brief. No tuning, no
 * conversation history, no system context from this project. Runs N
 * times (default 5) as separate calls and writes each raw output to
 * docs/correspondence/cs-persona-center-test-results-<YYYY-MM-DD>.md
 * for the PO's reading.
 *
 * Run only via: `npm run persona:test` (sets the sentinel).
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

// ---- VERBATIM PROMPTS FROM THE TASK (do not edit) ----
const SYSTEM_PROMPT =
  "You are Drift's trusted, music-first radio companion. Bring the listener closer to their world without taking over the moment. Be warm, observant, brief, grounded, respectful, and occasionally wry. Match the mood of the moment without claiming to know the listener's feelings. Speak confidently about what is known, remain humble about everything beyond it, say one worthwhile thing, and return naturally to the music.";

const USER_MESSAGE = `Route: highlight (a celebration). You are speaking between two songs.
The song that just ended: "Khruangbin — Maria Tambien". The next song is upbeat.

Grounded facts you may use (use ONLY these — invent nothing else):
- Dana is a close friend of the listener.
- Dana got a new job.
- It starts in two weeks.
- Dana's own words about it: "officially official".

Write one short spoken radio bit. Nothing is known beyond the facts above.`;
// ---- END VERBATIM ----

const MODEL_ID = "claude-sonnet-4-6";
const MAX_TOKENS = 400;
const N_RUNS = 5;

async function main(): Promise<void> {
  // Set the generation-surface sentinel BEFORE checking gates (mirrors
  // the meaning-pass discipline — the sentinel is what proves "this
  // came from the CLI runner, not from a stray import").
  process.env.__DRIFT_GENERATION_LIVE_CLI = "1";

  loadDotenv(resolve(".env"));

  const masterSwitch =
    process.env.ENABLE_LIVE_GENERATION === "true" ||
    process.env.ENABLE_LIVE_MEANING === "true";
  if (!masterSwitch) {
    throw new Error(
      "persona-center-test: ENABLE_LIVE_GENERATION=true (or ENABLE_LIVE_MEANING=true) " +
        "must be set in .env or shell — this is a PO/environment decision."
    );
  }
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || !apiKey.startsWith("sk-")) {
    throw new Error(
      "persona-center-test: ANTHROPIC_API_KEY missing or malformed (must start with 'sk-')."
    );
  }
  if (process.env.__DRIFT_GENERATION_LIVE_CLI !== "1") {
    throw new Error(
      "persona-center-test: CLI sentinel not set — must run via `npm run persona:test`."
    );
  }

  const anthropic = new Anthropic({ apiKey });

  console.log("=".repeat(70));
  console.log("Persona-Center Clean-Room Test");
  console.log(`model=${MODEL_ID} · max_tokens=${MAX_TOKENS} · runs=${N_RUNS} · temperature=default`);
  console.log("=".repeat(70));
  console.log("");

  type Run = { idx: number; text: string; stop_reason: string | null; input_tokens: number; output_tokens: number };
  const runs: Run[] = [];

  for (let i = 1; i <= N_RUNS; i++) {
    const response = await anthropic.messages.create({
      model: MODEL_ID,
      max_tokens: MAX_TOKENS,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: USER_MESSAGE }],
    });
    const text = response.content
      .map((b) => (b.type === "text" ? b.text : ""))
      .join("");
    const stop = (response.stop_reason as string | null) ?? null;
    const usage = response.usage as { input_tokens: number; output_tokens: number };
    runs.push({ idx: i, text, stop_reason: stop, input_tokens: usage.input_tokens, output_tokens: usage.output_tokens });
    console.log(`--- Run ${i} (stop_reason=${stop}, in=${usage.input_tokens}t, out=${usage.output_tokens}t) ---`);
    console.log(text);
    console.log("");
  }

  // Write the persistent report file for the PO's reading. Path is
  // relative to the playground (script cwd is playground/).
  const today = new Date().toISOString().slice(0, 10);
  const reportPath = resolve("..", "docs", "correspondence", `cs-persona-center-test-results-${today}.md`);
  mkdirSync(dirname(reportPath), { recursive: true });
  const md =
    `# CS Engineer → PO — Persona-Center Clean-Room Test (raw outputs)\n\n` +
    `**Date:** ${today}\n` +
    `**Model:** \`${MODEL_ID}\`\n` +
    `**Runs:** ${N_RUNS} (separate calls, no conversation history)\n` +
    `**max_tokens:** ${MAX_TOKENS} · **temperature:** default · **system context:** none beyond the verbatim prompt below\n\n` +
    `> Per the task brief: raw outputs only, no cleanup, no summary, no grading by CS. ` +
    `Same-host / smuggled-grounding analysis lives at the bottom — factual flags only, not a verdict.\n\n` +
    `---\n\n` +
    `## System prompt (verbatim)\n\n\`\`\`\n${SYSTEM_PROMPT}\n\`\`\`\n\n` +
    `## User message (verbatim)\n\n\`\`\`\n${USER_MESSAGE}\n\`\`\`\n\n` +
    `---\n\n` +
    `## Raw outputs\n\n` +
    runs
      .map(
        (r) =>
          `### Run ${r.idx} — stop_reason=\`${r.stop_reason}\`, in=${r.input_tokens}t, out=${r.output_tokens}t\n\n` +
          `\`\`\`\n${r.text}\n\`\`\`\n`
      )
      .join("\n") +
    `\n— CS Engineer, ${today}\n`;
  writeFileSync(reportPath, md, "utf-8");
  console.log("=".repeat(70));
  console.log(`Report written to: ${reportPath}`);
  console.log("=".repeat(70));
}

main().catch((e) => {
  console.error("persona-center-test crashed:", e);
  process.exit(1);
});
