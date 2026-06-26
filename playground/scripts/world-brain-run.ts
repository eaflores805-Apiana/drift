import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { loadFeedItems } from "../src/data/adapters/feedAdapter";
import { ListenerSchema } from "../src/data/schemas";
import { DiskMeaningCache } from "../src/meaning/diskCache";
import { meaningBatch } from "../src/meaning/meaningPass";
import { MockMeaningClient } from "../src/meaning/mockClient";
import { RealMeaningClient } from "../src/meaning/realClient";
import type { MeaningClient } from "../src/meaning/types";
import { scoreBatch, type MeaningMap } from "../src/scoring/scoringEngine";

/**
 * world-brain-run — stage 1 of building Drift's brain on a synthetic feed:
 * CANDIDATE SELECTION. Runs feed → IngestedItem → meaning pass → v3 scoring
 * and reports which posts the brain would voice, on which route. The next
 * stage (Decision → packet → Production C → Box 8 → voiced lines) builds on
 * the decisions this writes.
 *
 *   npx tsx scripts/world-brain-run.ts --mock         # free wiring check (stub meaning)
 *   ENABLE_LIVE_MEANING=true npx tsx scripts/world-brain-run.ts   # real Sonnet meaning pass
 *
 * Firewall: reads ONLY the public feed. Never touches runs/world-bible/ or the
 * answer key. The brain sees exactly what the listener's feed shows.
 */

// --- minimal .env loader (mirrors scripts/meaning-live.ts; shell wins) ---
function loadDotenv(path: string): void {
  if (!existsSync(path)) return;
  for (const rawLine of readFileSync(path, "utf-8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq < 0) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

function loadMeaningPrompt(): { text: string; version: string } {
  const path = resolve("meaning-pass-v1.md");
  const file = readFileSync(path, "utf-8");
  const promptMatch = file.match(/=== PROMPT START ===\n([\s\S]*?)\n=== PROMPT END ===/);
  if (!promptMatch) throw new Error(`Could not find PROMPT START/END markers in ${path}`);
  const versionMatch = file.match(/prompt_version:\s*([\w\-.]+)/);
  if (!versionMatch) throw new Error(`Could not find 'prompt_version: ...' in ${path}`);
  return { text: promptMatch[1].trim(), version: versionMatch[1] };
}

type Args = { mock: boolean; feed: string; model?: string };
function parseArgs(argv: string[]): Args {
  const out: Args = { mock: false, feed: "runs/post-writer/feed-ventura-v2.json" };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--mock") out.mock = true;
    else if (a === "--feed") out.feed = argv[++i];
    else if (a === "--model") out.model = argv[++i];
  }
  return out;
}

const SEP = "=".repeat(72);

async function main(): Promise<void> {
  loadDotenv(resolve(".env"));
  const args = parseArgs(process.argv.slice(2));

  const feedPath = resolve(args.feed);
  const { items, world_tag, listener_id } = loadFeedItems(feedPath);
  const listener = ListenerSchema.parse(
    JSON.parse(readFileSync(resolve("data/listener.json"), "utf-8"))
  );

  console.log(SEP);
  console.log(`Drift brain — candidate selection (${args.mock ? "MOCK meaning" : "LIVE meaning"})`);
  console.log(`  feed:      ${args.feed}  (world ${world_tag}, listener ${listener_id})`);
  console.log(`  items:     ${items.length}`);
  console.log(`  listener:  ${listener.name} — knows ${Object.keys(listener.closeness_map).length} accounts`);
  console.log(SEP);

  // --- meaning client ---
  let client: MeaningClient;
  const cache = new DiskMeaningCache(resolve(process.env.MEANING_CACHE_DIR ?? ".meaning-cache"));
  if (args.mock) {
    client = new MockMeaningClient();
  } else {
    // live path: set the CLI sentinel BEFORE constructing the real client.
    process.env.__DRIFT_MEANING_LIVE_CLI = "1";
    const { text, version } = loadMeaningPrompt();
    client = new RealMeaningClient({
      promptText: text,
      promptVersion: version,
      modelId: args.model ?? process.env.MEANING_MODEL,
      callCap: items.length, // cap to the feed size; reruns hit cache
    });
  }

  console.log(`meaning pass via ${client.id} (${client.model_id} / ${client.prompt_version})…`);
  let meaningMap: MeaningMap;
  try {
    meaningMap = await meaningBatch(items, client, cache);
  } catch (e) {
    console.error(`\n[meaning] failed: ${e instanceof Error ? e.message : String(e)}`);
    if (!args.mock) {
      console.error(
        "Live meaning needs ENABLE_LIVE_MEANING=true + ANTHROPIC_API_KEY (playground/.env). " +
          "Run with --mock for a free wiring check."
      );
    }
    process.exit(1);
  }
  const stats = cache.stats();
  console.log(`  done — cache size=${stats.size} hits=${stats.hits} misses=${stats.misses}\n`);

  // --- scoring ---
  const decisions = scoreBatch(items, listener, meaningMap);
  const itemById = new Map(items.map((i) => [i.id, i]));

  // --- report: airtime candidates first, then the rest ---
  const order = { expandable: 0, voiced: 1, ambient: 2, drop: 3 } as const;
  const ranked = [...decisions].sort(
    (a, b) => (order[a.bucket] - order[b.bucket]) || b.score - a.score
  );

  const byBucket: Record<string, number> = {};
  const byRoute: Record<string, number> = {};
  const byBand: Record<string, number> = {};
  // band → how many of that band's items cleared a voiced bar
  const bandVoiced: Record<string, number> = {};
  for (const d of decisions) {
    byBucket[d.bucket] = (byBucket[d.bucket] ?? 0) + 1;
    if (d.route) byRoute[d.route] = (byRoute[d.route] ?? 0) + 1;
    if (d.band) {
      byBand[d.band] = (byBand[d.band] ?? 0) + 1;
      if (d.bucket === "voiced" || d.bucket === "expandable") {
        bandVoiced[d.band] = (bandVoiced[d.band] ?? 0) + 1;
      }
    }
  }

  const voiced = ranked.filter((d) => d.bucket === "voiced" || d.bucket === "expandable");
  console.log(`AIRTIME CANDIDATES — ${voiced.length} of ${items.length} posts clear a voiced bar:\n`);
  for (const d of voiced) {
    const it = itemById.get(d.item_id)!;
    const mag = d.score_breakdown.magnitude?.toFixed(2) ?? "—";
    const close = d.score_breakdown.closeness?.toFixed(2) ?? "—";
    console.log(
      `  [${d.bucket.toUpperCase()}] ${d.score.toFixed(3)}  ${(d.band ?? d.route ?? "?").padEnd(24)} ` +
        `${it.source_name} (mag ${mag}, close ${close})`
    );
    console.log(`        "${it.raw_text.slice(0, 92)}${it.raw_text.length > 92 ? "…" : ""}"`);
  }

  console.log(`\n${SEP}`);
  console.log(`buckets: ${JSON.stringify(byBucket)}`);
  console.log(`routes:  ${JSON.stringify(byRoute)}`);
  console.log(`bands:   ${JSON.stringify(byBand)}`);
  console.log(`band→voiced: ${JSON.stringify(bandVoiced)}  (ADR J4: voiced should be positive_personal_touch / doorway_sensitive only)`);
  console.log(SEP);

  // --- persist decisions (runs/ is git-ignored; safe, no hidden context) ---
  const outDir = resolve("runs/world-brain");
  mkdirSync(outDir, { recursive: true });
  const outPath = resolve(outDir, `decisions-${world_tag}.json`);
  writeFileSync(
    outPath,
    JSON.stringify(
      {
        world_tag,
        listener_id,
        meaning_client: { id: client.id, model: client.model_id, prompt: client.prompt_version },
        generated_at: new Date().toISOString(),
        decisions,
      },
      null,
      2
    )
  );
  console.log(`wrote ${outPath}`);
}

main().catch((e) => {
  console.error("[world-brain-run] fatal:", e instanceof Error ? e.message : e);
  process.exit(1);
});
