/**
 * Step 1.4 wiring report — runs the LIVE meaning cache through the
 * post-v3 scoringEngine and prints the per-item route/score/bucket
 * table the wiring task spec §10 requires.
 *
 * Diagnostic script, not part of the regression suite. Run with:
 *   npx tsx playground/scripts/wiring-report.ts
 */

import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadSimulated } from "../src/data/adapters/simulatedAdapter";
import { DEFAULT_SETTINGS, scoreBatch } from "../src/scoring/scoringEngine";
import { DiskMeaningCache } from "../src/meaning/diskCache";
import { cacheKeyFor } from "../src/meaning/keyFor";
import { type MeaningClient, type ModelDerived } from "../src/meaning/types";
import { loadGoldLabels, loadCommunityCluster } from "../src/evaluation/goldLabels";

class CachedRO implements MeaningClient {
  readonly id = "cached-ro";
  readonly prompt_version = "meaning-pass-v0.1.0";
  readonly model_id = "claude-sonnet-4-6";
  async judge(): Promise<ModelDerived> {
    throw new Error("wiring-report: cached-only, no live judgments");
  }
}

const TARGETS = ["p004", "p008", "p018", "p020", "p025", "p041", "p042", "p043", "p044", "p045"];

async function main() {
  const scriptDir = dirname(fileURLToPath(import.meta.url));
  const cacheDir = resolve(scriptDir, "..", ".meaning-cache");
  const cache = new DiskMeaningCache(cacheDir);
  const client = new CachedRO();
  const { listener, items } = loadSimulated();
  const itemsById = new Map(items.map((i) => [i.id, i]));
  const goldLabels = loadGoldLabels();
  const community = loadCommunityCluster();

  const meaningMap = new Map<string, ModelDerived>();
  const missing: string[] = [];
  for (const id of TARGETS) {
    const it = itemsById.get(id);
    if (!it) {
      missing.push(`${id} (not in seed)`);
      continue;
    }
    const k = await cacheKeyFor(it, client);
    const m = cache.get(k);
    if (m) meaningMap.set(id, m);
    else missing.push(`${id} (no cached meaning)`);
  }
  if (missing.length > 0) {
    console.log("# Missing from local cache:");
    for (const m of missing) console.log(`  - ${m}`);
    console.log("");
  }

  const targetItems = items.filter((i) => meaningMap.has(i.id));
  const decisions = scoreBatch(targetItems, listener, meaningMap, DEFAULT_SETTINGS);
  const byId = new Map(decisions.map((d) => [d.item_id, d]));

  console.log("# Step 1.4 — v3 Wiring Report (live cache, per-item)");
  console.log("");
  console.log(`> route_thresholds: ${JSON.stringify(DEFAULT_SETTINGS.routeThresholds)}; expandable_threshold: ${DEFAULT_SETTINGS.expandableThreshold}`);
  console.log("");
  console.log("| id | route | v3 score | route_threshold | bucket | gold disposition | agrees? |");
  console.log("|---|---|---:|---:|---|---|---|");

  for (const id of TARGETS) {
    const d = byId.get(id);
    const lbl = goldLabels.get(id);
    const cc = community.get(id);
    const goldDisp = lbl?.desired_bucket ?? cc?.disposition ?? "—";
    if (!d) {
      console.log(`| ${id} | — | — | — | — | ${goldDisp} | (no decision) |`);
      continue;
    }
    const thr = d.score_breakdown.route_threshold;
    const thrStr = thr === undefined ? "—" : thr.toFixed(3);
    // expandable IS voiced+ — a stronger form of voicing, not a different
    // direction. Treat as agreement against gold=voiced.
    const goldVoiced = goldDisp === "voiced";
    const engVoicedTier = d.bucket === "voiced" || d.bucket === "expandable";
    const agrees =
      goldDisp === d.bucket
        ? "✓"
        : goldVoiced && engVoicedTier
        ? "✓ (engine=expandable)"
        : goldVoiced && d.bucket === "ambient"
        ? "no (suppressed)"
        : goldDisp === "ambient" && d.bucket === "ambient"
        ? "✓"
        : "no";
    console.log(`| ${id} | ${d.route ?? "—"} | ${d.score.toFixed(3)} | ${thrStr} | ${d.bucket} | ${goldDisp} | ${agrees} |`);
  }
}

main().catch((e) => {
  console.error("wiring-report crashed:", e);
  process.exit(1);
});
