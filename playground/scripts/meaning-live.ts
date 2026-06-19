import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { loadSimulated } from "../src/data/adapters/simulatedAdapter";
import type { IngestedItem } from "../src/data/schemas";
import { DiskMeaningCache } from "../src/meaning/diskCache";
import { meaningFor } from "../src/meaning/meaningPass";
import { RealMeaningClient } from "../src/meaning/realClient";

/**
 * Minimal `.env` loader (no dependency). Reads `playground/.env` if present,
 * sets process.env from KEY=VALUE lines, preserves values already set in the
 * shell so prefix-style invocation (`ENABLE_LIVE_MEANING=true npm run …`)
 * still wins. Lines starting with `#` and blank lines are ignored. Values
 * may be surrounded by matching quotes.
 */
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

/**
 * CLI runner for live meaning-pass calls.
 *
 * Run only via: `npm run meaning:live -- --items p008,p018,p004`
 * (or `--limit N` for a head slice).
 *
 * Triple-gated safety per team ruling 2026-06-19:
 *   - ENABLE_LIVE_MEANING=true
 *   - ANTHROPIC_API_KEY set
 *   - CLI sentinel `__DRIFT_MEANING_LIVE_CLI=1` (set here)
 *
 * No flag, no call. No key, no call. No CLI invocation, no call.
 */

const SEP = "=".repeat(60);

type Args = {
  items?: string;
  limit?: string;
  model?: string;
  cacheDir?: string;
};

function parseArgs(argv: string[]): Args {
  const out: Args = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--items") out.items = argv[++i];
    else if (a === "--limit") out.limit = argv[++i];
    else if (a === "--model") out.model = argv[++i];
    else if (a === "--cache-dir") out.cacheDir = argv[++i];
  }
  return out;
}

function loadMeaningPrompt(): { text: string; version: string } {
  // CWD when invoked via `npm run meaning:live` is the `playground/` directory.
  const path = resolve("meaning-pass-v1.md");
  const file = readFileSync(path, "utf-8");
  const promptMatch = file.match(/=== PROMPT START ===\n([\s\S]*?)\n=== PROMPT END ===/);
  if (!promptMatch) {
    throw new Error(`Could not find PROMPT START/END markers in ${path}`);
  }
  const versionMatch = file.match(/prompt_version:\s*([\w\-.]+)/);
  if (!versionMatch) {
    throw new Error(`Could not find 'prompt_version: ...' in ${path}`);
  }
  return { text: promptMatch[1].trim(), version: versionMatch[1] };
}

async function main(): Promise<void> {
  // Load .env from playground/.env if present. Shell-set values take
  // precedence so users can override per-invocation.
  // CWD is `playground/` when invoked via `npm run meaning:live`.
  loadDotenv(resolve(".env"));

  const args = parseArgs(process.argv.slice(2));

  // Set the CLI sentinel BEFORE constructing RealMeaningClient. The
  // safety check inside the client looks for this; nothing else in the
  // codebase sets it, so any non-CLI import will fail the check.
  process.env.__DRIFT_MEANING_LIVE_CLI = "1";

  const { items: allItems } = loadSimulated();
  let targets: IngestedItem[];
  if (args.items) {
    const ids = new Set(args.items.split(",").map((s) => s.trim()).filter(Boolean));
    targets = allItems.filter((i) => ids.has(i.id));
    const missing = Array.from(ids).filter((id) => !targets.some((t) => t.id === id));
    if (missing.length > 0) {
      console.error(`[live] requested ids not found in corpus: ${missing.join(", ")}`);
      process.exit(2);
    }
  } else if (args.limit) {
    targets = allItems.slice(0, parseInt(args.limit, 10));
  } else {
    console.error(
      "[live] usage: npm run meaning:live -- --items p008,p018,p004\n" +
        "       npm run meaning:live -- --limit 3"
    );
    process.exit(2);
  }

  const { text: promptText, version: promptVersion } = loadMeaningPrompt();
  // Resolved relative to playground/ (the npm script's cwd).
  const cacheDir = resolve(
    args.cacheDir ?? process.env.MEANING_CACHE_DIR ?? ".meaning-cache"
  );
  const callCap = parseInt(process.env.MEANING_CALL_CAP ?? "50", 10);
  const modelId = args.model ?? process.env.MEANING_MODEL ?? "claude-sonnet-4-6";

  if (targets.length > callCap) {
    console.error(
      `[live] refusing: ${targets.length} items > MEANING_CALL_CAP=${callCap}. ` +
        `Raise the cap explicitly if you mean it.`
    );
    process.exit(2);
  }

  const cache = new DiskMeaningCache(cacheDir);
  // Construct the client AFTER the sentinel is set. Will throw with a
  // clear message if ENABLE_LIVE_MEANING / ANTHROPIC_API_KEY are missing.
  const client = new RealMeaningClient({
    promptText,
    promptVersion,
    modelId,
    callCap,
  });

  console.log(SEP);
  console.log(`Drift — live meaning pass`);
  console.log(`  model:        ${modelId}`);
  console.log(`  prompt:       ${promptVersion}`);
  console.log(`  cache dir:    ${cacheDir}`);
  console.log(`  call cap:     ${callCap}`);
  console.log(`  items (${targets.length}): ${targets.map((t) => t.id).join(", ")}`);
  console.log(SEP);

  for (const item of targets) {
    console.log(`\n[${item.id}] ${item.source_name} (${item.source_type})`);
    console.log(`  "${item.raw_text.slice(0, 100)}${item.raw_text.length > 100 ? "…" : ""}"`);
    try {
      const meaning = await meaningFor(item, client, cache);
      console.log(`  category:        ${meaning.category}`);
      console.log(`  magnitude:       ${meaning.magnitude.toFixed(2)}`);
      console.log(`  sensitivity:     ${meaning.sensitivity}`);
      console.log(`  confidence:      ${meaning.confidence.toFixed(2)}`);
      console.log(`  connection_read: ${meaning.connection_read}`);
      console.log(`  context_candidates: ${meaning.context_candidates.length}`);
      for (const cc of meaning.context_candidates) {
        console.log(`    - [${cc.allowed_use}] ${cc.context}`);
        console.log(`        why: ${cc.reason}`);
      }
      console.log(`  allowed_claims: ${meaning.allowed_claims.length}`);
      for (const c of meaning.allowed_claims) console.log(`    + ${c}`);
      console.log(`  forbidden_inferences: ${meaning.forbidden_inferences.length}`);
      for (const f of meaning.forbidden_inferences) console.log(`    − ${f}`);
    } catch (e) {
      console.error(`  [error] ${e instanceof Error ? e.message : String(e)}`);
      // Per team ruling: don't cache failures. meaningFor throws before set().
      // Continue to the next item rather than crashing the whole run.
    }
  }

  const stats = cache.stats();
  console.log("\n" + SEP);
  console.log(
    `Done. ${client.callCount()} model call(s). Cache: size=${stats.size} hits=${stats.hits} misses=${stats.misses}.`
  );
  console.log(SEP);
}

main().catch((e) => {
  console.error("[live] fatal:", e instanceof Error ? e.message : e);
  process.exit(1);
});
