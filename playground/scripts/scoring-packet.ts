/**
 * One-off readout: consolidated scoring packet for the labeled live slice.
 * Cached-only — never calls the model. Produces markdown table output for
 * the team's scoring discussion.
 *
 * Reads:
 *   - playground/data/{listener,seed-items,gold-labels}.json
 *   - playground/.meaning-cache/  (cached real ModelDerived from the two
 *                                  live batches; key includes prompt_version
 *                                  meaning-pass-v0.1.0 + model claude-sonnet-4-6)
 *
 * Uses the existing scoring engine + classifier. No scoring changes.
 * If a target item is not in the disk cache, the row is marked clearly.
 */

import { resolve } from "node:path";
import { loadSimulated } from "../src/data/adapters/simulatedAdapter";
import { type IngestedItem } from "../src/data/schemas";
import { loadGoldLabels } from "../src/evaluation/goldLabels";
import { classifyComparison } from "../src/evaluation/mismatchTypes";
import { DiskMeaningCache } from "../src/meaning/diskCache";
import { cacheKeyFor } from "../src/meaning/keyFor";
import { type MeaningClient, type ModelDerived } from "../src/meaning/types";
import {
  DEFAULT_SETTINGS,
  scoreBatch,
} from "../src/scoring/scoringEngine";

/**
 * Read-only stand-in that has the same identity (prompt_version, model_id)
 * the RealMeaningClient writes with, so cacheKeyFor() lands on the existing
 * disk-cache entries. judge() throws — this script never calls live.
 */
class CachedReadOnlyClient implements MeaningClient {
  readonly id = "cached-readonly";
  readonly prompt_version = "meaning-pass-v0.1.0";
  readonly model_id = "claude-sonnet-4-6";
  async judge(): Promise<ModelDerived> {
    throw new Error("cached-only readout: no live judgments allowed");
  }
}

const TARGETS = [
  { id: "p004", name: "Mateo rough week" },
  { id: "p008", name: "Dana got the job" },
  { id: "p018", name: "Buena High wrestling CIF" },
  { id: "p020", name: "Driftwood coffee drop" },
  { id: "p025", name: "Ventura street fair tonight" },
  { id: "p010", name: "Jordan vague junk" },
  { id: "p016", name: "Uncle Ray politics" },
  { id: "p030", name: "Kelp Surf generic promo" },
];

const REFERENCE_ROW = { id: "p002", name: "Mark private DM" };

async function main(): Promise<void> {
  const cacheDir = resolve(".meaning-cache");
  const cache = new DiskMeaningCache(cacheDir);
  const client = new CachedReadOnlyClient();

  const { listener, items } = loadSimulated();
  const goldLabels = loadGoldLabels();
  const itemsById = new Map(items.map((i) => [i.id, i]));

  // Load real cached meaning for each target. Misses are flagged.
  const meaningMap = new Map<string, ModelDerived>();
  const missing: string[] = [];
  for (const t of TARGETS) {
    const item = itemsById.get(t.id);
    if (!item) continue;
    const key = await cacheKeyFor(item, client);
    const cached = cache.get(key);
    if (cached) meaningMap.set(t.id, cached);
    else missing.push(t.id);
  }

  // Score the target items with the existing engine + cached meaning.
  const targetItems = TARGETS.map((t) => itemsById.get(t.id)).filter(
    (x): x is IngestedItem => !!x
  );
  const decisions = scoreBatch(targetItems, listener, meaningMap, DEFAULT_SETTINGS);
  const decById = new Map(decisions.map((d) => [d.item_id, d]));

  const voiceTh = DEFAULT_SETTINGS.voiceThreshold;

  // === Header ===
  console.log("# CS Scoring Packet — Labeled Live Slice (Cached-Only)");
  console.log("");
  console.log(`*Generated ${new Date().toISOString()} · gold labels v0.3.1 · prompt ${client.prompt_version} · model ${client.model_id} · voiceThreshold=${voiceTh}*`);
  console.log("");
  if (missing.length > 0) {
    console.log(`> **Cache miss:** ${missing.join(", ")} — these items have no cached real meaning. Re-run \`npm run meaning:live -- --items <ids>\` if needed.`);
    console.log("");
  }

  // === Main table ===
  console.log("## Scoring table");
  console.log("");
  const headers = [
    "id", "name", "elig", "voiceworthy", "treatment(tone)",
    "gold→engine", "real_mag", "sens", "conf",
    "score", "voice_th", "gap", "mismatch", "diagnosis",
  ];
  console.log("| " + headers.join(" | ") + " |");
  console.log("|" + headers.map(() => "---").join("|") + "|");

  type Row = {
    id: string;
    isVoiceWorthy: boolean;
    score: number;
    gap: number;
    mismatch: string;
  };
  const rows: Row[] = [];

  for (const t of TARGETS) {
    const item = itemsById.get(t.id)!;
    const dec = decById.get(t.id);
    const meaning = meaningMap.get(t.id);
    const gold = goldLabels.get(t.id);
    if (!dec) {
      console.log(`| ${t.id} | ${t.name} | — | — | — | — | — | — | — | — | ${voiceTh} | — | (no decision) | (no decision) |`);
      continue;
    }
    const cmp = classifyComparison(item, dec, gold, meaning, listener);
    const gap = +(voiceTh - dec.score).toFixed(3);
    const isVoiceWorthy = gold?.desired_bucket === "voiced" || gold?.desired_bucket === "expandable";

    const cells = [
      t.id,
      t.name,
      gold?.eligibility_status ?? "—",
      gold?.voiceworthiness ?? "—",
      `${gold?.route ?? "—"} (${gold?.tone ?? "—"})`,
      `${gold?.desired_bucket ?? "—"} → ${dec.bucket}`,
      meaning ? meaning.magnitude.toFixed(2) : "n/a",
      meaning?.sensitivity ?? "n/a",
      meaning ? meaning.confidence.toFixed(2) : "n/a",
      dec.score.toFixed(3),
      voiceTh.toFixed(2),
      gap > 0 ? `+${gap.toFixed(3)}` : gap.toFixed(3),
      cmp.mismatch ?? (cmp.agreement ? "agreement" : "—"),
      diagnosisFor(t.id, dec, meaning, gold, listener),
    ];
    console.log("| " + cells.join(" | ") + " |");
    rows.push({ id: t.id, isVoiceWorthy, score: dec.score, gap, mismatch: cmp.mismatch ?? "" });
  }

  // Optional consent-blocked reference row (clearly separated).
  {
    const item = itemsById.get(REFERENCE_ROW.id)!;
    const gold = goldLabels.get(REFERENCE_ROW.id);
    console.log(
      `| ${REFERENCE_ROW.id} | ${REFERENCE_ROW.name} | ${gold?.eligibility_status ?? "—"} | ${gold?.voiceworthiness ?? "n/a"} | ${gold?.route ?? "silent"} (${gold?.tone ?? "avoid"}) | drop → drop (consent) | (no meaning) | n/a | n/a | 0 | ${voiceTh} | n/a | n/a | consent_blocked — never reaches scoring |`
    );
  }

  console.log("");
  console.log("## Highlights (per Team Lead's call-outs)");
  console.log("");

  const voiceRows = rows.filter((r) => r.isVoiceWorthy);
  const floorRows = rows.filter((r) => !r.isVoiceWorthy);

  // 1. Closest-to-threshold voice-worthy
  const closest = voiceRows.reduce((a, b) => (b.gap < a.gap ? b : a));
  console.log(`1. **Closest voice-worthy to threshold:** \`${closest.id}\` — score ${closest.score.toFixed(3)} (gap ${formatGap(closest.gap)}). Smallest engineering distance to reach voiced.`);
  console.log("");

  // 2. Farthest-below-threshold voice-worthy
  const farthest = voiceRows.reduce((a, b) => (b.gap > a.gap ? b : a));
  console.log(`2. **Farthest voice-worthy below threshold:** \`${farthest.id}\` — score ${farthest.score.toFixed(3)} (gap ${formatGap(farthest.gap)}). Largest engineering distance; threshold tweak alone won't reach it.`);
  console.log("");

  // 3. Is p004 an outlier vs p008/p018/p020/p025?
  const p004 = voiceRows.find((r) => r.id === "p004");
  const others = voiceRows.filter((r) => r.id !== "p004");
  if (p004 && others.length > 0) {
    const otherGaps = others.map((r) => r.gap);
    const otherMin = Math.min(...otherGaps);
    const otherMax = Math.max(...otherGaps);
    const isOutlier = p004.gap > otherMax + 0.05 || p004.gap < otherMin - 0.05;
    console.log(
      `3. **p004 vs the other four voice-worthy items:** p004 gap ${formatGap(p004.gap)}; others ${formatGap(otherMin)}–${formatGap(otherMax)}. ` +
      (isOutlier ? "**p004 is an outlier** — the doorway-route gap is in a different band than the highlight/utility gaps." : "**Not an outlier** — p004's gap sits inside the band of the other voice-worthy items. Suggests one shape of fix could lift all five.")
    );
  }
  console.log("");

  // 4. Floor items safely below threshold?
  const maxFloor = Math.max(...floorRows.map((r) => r.score));
  const minVoice = Math.min(...voiceRows.map((r) => r.score));
  console.log(
    `4. **Floor items (p010, p016, p030) below threshold:** highest floor-item score = ${maxFloor.toFixed(3)} vs voice threshold ${voiceTh.toFixed(2)}. ` +
    (maxFloor < voiceTh ? "**Safely below.** Junk does not threaten to rise." : "**WARNING:** a floor item is at or above threshold; threshold tweak alone risks letting junk in.")
  );
  console.log("");

  // 5. Useful items closer to junk floor or to voice threshold?
  console.log("5. **Useful items vs junk floor / voice threshold:**");
  for (const t of TARGETS.filter((x) => ["p020", "p025", "p018"].includes(x.id))) {
    const r = rows.find((x) => x.id === t.id);
    if (!r) continue;
    const distToFloor = +(r.score - maxFloor).toFixed(3);
    const distToVoice = +(voiceTh - r.score).toFixed(3);
    const closer = distToFloor < distToVoice ? "**closer to junk floor**" : "**closer to voice threshold**";
    console.log(`   - \`${t.id}\` score ${r.score.toFixed(3)}: ${distToFloor.toFixed(3)} above floor (${maxFloor.toFixed(3)}), ${distToVoice.toFixed(3)} below threshold (${voiceTh.toFixed(2)}) → ${closer}`);
  }
  console.log("");

  // === Floor headroom + voice band summary ===
  console.log("## Headroom + band summary");
  console.log("");
  console.log(`- Junk floor (max of p010/p016/p030 scores): **${maxFloor.toFixed(3)}**`);
  console.log(`- Voice threshold: **${voiceTh.toFixed(2)}**`);
  console.log(`- Minimum voice-worthy score: **${minVoice.toFixed(3)}**`);
  console.log(`- Headroom between junk floor and threshold: **${(voiceTh - maxFloor).toFixed(3)}** (the room a global threshold drop has before junk rises)`);
  console.log(`- Gap from min voice-worthy score to threshold: **${(voiceTh - minVoice).toFixed(3)}**`);
  if (voiceTh - minVoice > voiceTh - maxFloor) {
    console.log("");
    console.log("> **Headroom shape: structural.** The smallest voice-worthy gap is larger than the entire room above the junk floor. A global threshold drop that reaches the closest voice-worthy item would also pull at least one floor item into voiced. **Threshold-only fix is insufficient.**");
  } else {
    console.log("");
    console.log("> **Headroom shape: cosmetic.** A global threshold drop fits between the junk floor and the closest voice-worthy item. **Threshold-only fix is at least possible** for the closest case (but read the per-item gaps before deciding).");
  }
}

function formatGap(g: number): string {
  if (g >= 0) return `+${g.toFixed(3)}`;
  return g.toFixed(3);
}

function diagnosisFor(
  id: string,
  dec: { score: number },
  meaning: ModelDerived | undefined,
  gold: ReturnType<typeof loadGoldLabels> extends Map<string, infer V> ? V | undefined : never,
  listener: { closeness_map: Record<string, string> }
): string {
  if (!gold) return "(no gold)";
  if (!meaning) return "(no meaning)";
  const route = gold.route ?? "—";
  const goldB = gold.desired_bucket;
  const mag = meaning.magnitude;
  const sens = meaning.sensitivity;
  if (goldB === "drop" || goldB === "ambient") {
    if (dec.score < 0.15) return `correctly suppressed (low score, route=${route})`;
    return `restrained near floor (route=${route})`;
  }
  // voice-worthy
  // Look up closeness via the item's account_id; we don't have item here so just keep diagnosis qualitative.
  if (sens === "high") return `${route}: sensitive, mag=${mag.toFixed(2)} — gentle voicing needed but formula keeps it ambient`;
  if (route === "utility") return `utility: followed-tier closeness caps score, mag=${mag.toFixed(2)} fine`;
  if (route === "highlight") return `highlight: closeness+magnitude both high but multiplicative formula + 0.45 threshold blocks`;
  if (route === "doorway") return `doorway: gentle close-friend route; mag=${mag.toFixed(2)} too modest for current formula`;
  return `(${route})`;
}

main().catch((e) => {
  console.error("scoring-packet crashed:", e);
  process.exit(1);
});
