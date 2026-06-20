/**
 * Step 1.1 — Formula-Shape Test (Eng1 → CS, 2026-06-19)
 *
 * Pure computation against frozen cached meaning + locked v0.3.1 gold
 * labels. No model calls. No threshold tuning. No constant fitting.
 * Tests three formula SHAPES and reports per-row arithmetic so any row
 * can be reconciled by hand.
 *
 * Three variants:
 *   v1 multiplicative   S = mag × close × rel × time
 *                       (current code uses booster form; this is the
 *                       simpler shape the spec asks be tested as the
 *                       control. Confidence/sensitivity are NOT applied
 *                       in current scoring — flagged.)
 *
 *   v2 hierarchy-first additive
 *                       S = mag + α(close − 0.5) + β(rel − 0.5) + γ(time − 0.5)
 *                       α = β = γ = 0.2 (asserted starting prior; CS's draft
 *                       per spec). High mag starts strong; no single factor
 *                       can veto.
 *
 *   v3 additive-with-dampers
 *                       S = v2_base × confidence × sensitivity_damper
 *                       sensitivity_damper: low=1.0, medium=0.8, high=0.6
 *                       (asserted prior; the hypothesis the team favors).
 *
 * Plus a synthesized low-confidence probe (high mag, low conf, plausible
 * closeness, medium sens) so the favored variant 3 is checked against the
 * gap not covered by the 8 labeled items.
 */

import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadSimulated } from "../src/data/adapters/simulatedAdapter";
import { type IngestedItem, type Listener } from "../src/data/schemas";
import {
  loadCommunityCluster,
  loadGoldLabels,
  type CommunityClusterLabel,
  type GoldLabel,
} from "../src/evaluation/goldLabels";
import { DiskMeaningCache } from "../src/meaning/diskCache";
import { cacheKeyFor } from "../src/meaning/keyFor";
import {
  type MeaningClient,
  type ModelDerived,
  type Sensitivity,
} from "../src/meaning/types";
import { closeness } from "../src/scoring/closeness";
import { timeliness } from "../src/scoring/timeliness";

class CachedReadOnlyClient implements MeaningClient {
  readonly id = "cached-readonly";
  readonly prompt_version = "meaning-pass-v0.1.0";
  readonly model_id = "claude-sonnet-4-6";
  async judge(): Promise<ModelDerived> {
    throw new Error("formula-shape-test: cached-only, no live judgments");
  }
}

const TARGETS = [
  { id: "p004", short: "Mateo rough week" },
  { id: "p008", short: "Dana got the job" },
  { id: "p018", short: "Buena CIF" },
  { id: "p020", short: "Driftwood coffee" },
  { id: "p025", short: "Ventura street fair" },
  { id: "p010", short: "Jordan vague" },
  { id: "p016", short: "Uncle Ray politics" },
  { id: "p030", short: "Kelp Surf promo" },
  // Community cluster — added per Eng1 task 2026-06-20.
  // Gold lives in community_cluster[], not labels[]; the resolver merges.
  { id: "p041", short: "Rolling Pin bakery wins" },
  { id: "p042", short: "Library 1k kids (maybe)" },
  { id: "p043", short: "Farmers market peak" },
  { id: "p044", short: "Harbor Threads sale" },
  { id: "p045", short: "Anacapa science team" },
];

// IDs that belong to the community cluster for the within-route ranking
// section. p018 is in BOTH labels[] (highlight) and community_cluster[]
// (highlight community-pride flavor); included here because the community
// section is about within-community ranking, not strict membership.
const COMMUNITY_CLUSTER_IDS = ["p018", "p041", "p042", "p043", "p044", "p045"];

/**
 * Unified gold lookup. labels[] takes precedence; falls through to
 * community_cluster[] for items only annotated there (e.g., p041–p045).
 * Maps community_cluster.disposition → desired_bucket so the rendering
 * path is unchanged.
 */
type GoldRow = {
  route: string;
  voiceworthiness: string;
  desired_bucket: string;
};
function resolveGold(
  id: string,
  labels: Map<string, GoldLabel>,
  community: Map<string, CommunityClusterLabel>
): GoldRow {
  const l = labels.get(id);
  if (l) {
    return {
      route: l.route ?? "—",
      voiceworthiness: l.voiceworthiness ?? "—",
      desired_bucket: l.desired_bucket ?? "—",
    };
  }
  const c = community.get(id);
  if (c) {
    return {
      route: c.route ?? "—",
      voiceworthiness: c.voiceworthiness ?? "—",
      desired_bucket: (c.disposition as string | undefined) ?? "—",
    };
  }
  return { route: "—", voiceworthiness: "—", desired_bucket: "—" };
}

const REL_BASELINE = 0.5;
const TIME_BASELINE = 0.5;
const ALPHA = 0.2; // closeness weight in v2/v3
const BETA = 0.2;  // relevance weight
const GAMMA = 0.2; // timeliness weight

const SENS_DAMPER: Record<Sensitivity, number> = {
  low: 1.0,
  medium: 0.8,
  high: 0.6,
};

type Inputs = {
  id: string;
  short: string;
  mag: number;
  close: number;
  rel: number;
  time: number;
  conf: number;
  sens: Sensitivity;
  route: string;
  voiceworthiness: string;
  desired_bucket: string;
};

type Variant = {
  score: number;
  arith: string;
};

function v1(i: Inputs): Variant {
  const score = i.mag * i.close * i.rel * i.time;
  return {
    score,
    arith: `mag ${fmt(i.mag)} × close ${fmt(i.close)} × rel ${fmt(i.rel)} × time ${fmt(i.time)} = ${fmt(score, 3)}`,
  };
}

function v2(i: Inputs): Variant {
  const cTerm = ALPHA * (i.close - 0.5);
  const rTerm = BETA * (i.rel - 0.5);
  const tTerm = GAMMA * (i.time - 0.5);
  const score = i.mag + cTerm + rTerm + tTerm;
  return {
    score,
    arith: `mag ${fmt(i.mag)} + ${ALPHA}·(close ${fmt(i.close)} − 0.5) + ${BETA}·(rel ${fmt(i.rel)} − 0.5) + ${GAMMA}·(time ${fmt(i.time)} − 0.5) = ${fmt(i.mag)} + ${fmtSigned(cTerm)} + ${fmtSigned(rTerm)} + ${fmtSigned(tTerm)} = ${fmt(score, 3)}`,
  };
}

function v3(i: Inputs): Variant {
  const v2r = v2(i);
  const damper = SENS_DAMPER[i.sens];
  const score = v2r.score * i.conf * damper;
  return {
    score,
    arith: `(${fmt(v2r.score, 3)} from v2) × conf ${fmt(i.conf)} × sens_damper ${fmt(damper)} (${i.sens}) = ${fmt(score, 3)}`,
  };
}

function fmt(n: number, places: number = 2): string {
  return n.toFixed(places);
}
function fmtSigned(n: number, places: number = 3): string {
  return (n >= 0 ? "+" : "") + n.toFixed(places);
}

async function buildInputs(
  item: IngestedItem,
  listener: Listener,
  meaning: ModelDerived,
  gold: GoldRow
): Promise<Inputs> {
  const close = closeness(item, listener);
  const time = timeliness(item.timestamp, item.expires_at, TIME_BASELINE);
  return {
    id: item.id,
    short: TARGETS.find((t) => t.id === item.id)?.short ?? item.id,
    mag: meaning.magnitude,
    close: close.value,
    rel: REL_BASELINE,
    time: time.value,
    conf: meaning.confidence,
    sens: meaning.sensitivity,
    route: gold.route,
    voiceworthiness: gold.voiceworthiness,
    desired_bucket: gold.desired_bucket,
  };
}

async function main(): Promise<void> {
  // Anchor cache path to the script's location so the script is
  // cwd-independent (works from repo root, from playground/, or via npm).
  const scriptDir = dirname(fileURLToPath(import.meta.url));
  const cacheDir = resolve(scriptDir, "..", ".meaning-cache");
  const cache = new DiskMeaningCache(cacheDir);
  const client = new CachedReadOnlyClient();
  const { listener, items } = loadSimulated();
  const itemsById = new Map(items.map((i) => [i.id, i]));
  const labels = loadGoldLabels();
  const community = loadCommunityCluster();

  // Build inputs for all TARGETS (labeled cluster + community cluster).
  // Gold resolves from labels[] first, then community_cluster[].
  const rows: Inputs[] = [];
  const missing: string[] = [];
  for (const t of TARGETS) {
    const item = itemsById.get(t.id);
    if (!item) {
      missing.push(`${t.id} (item not in seed)`);
      continue;
    }
    const key = await cacheKeyFor(item, client);
    const meaning = cache.get(key);
    if (!meaning) {
      missing.push(`${t.id} (no cached meaning at ${key.slice(0, 50)}…)`);
      continue;
    }
    rows.push(await buildInputs(item, listener, meaning, resolveGold(t.id, labels, community)));
  }

  // === Header ===
  const SEP = "=".repeat(70);
  console.log(SEP);
  console.log("Step 1.1 — Formula-Shape Test");
  console.log("Cached meaning · v0.3.1 gold labels · prompt meaning-pass-v0.1.0 · model claude-sonnet-4-6");
  console.log(SEP);

  if (missing.length > 0) {
    console.log("\n[cache miss / data gap]");
    for (const m of missing) console.log(`  - ${m}`);
  }

  // === Per-variant tables ===
  for (const [vname, vfn, vdesc] of [
    ["v1 — multiplicative (control)", v1, "S = mag × close × rel × time  (no boosters, no dampers)"],
    ["v2 — hierarchy-first additive", v2, `S = mag + α(close − 0.5) + β(rel − 0.5) + γ(time − 0.5),  α=β=γ=${ALPHA}`],
    ["v3 — additive-with-dampers", v3, `S = v2 × confidence × sens_damper  (low=1.0, medium=0.8, high=0.6)`],
  ] as const) {
    console.log(`\n## ${vname}`);
    console.log(`> ${vdesc}`);
    console.log("");
    console.log("| id | route | voiceworthy | mag | close | rel | time | conf | sens | arithmetic | score |");
    console.log("|---|---|---|---:|---:|---:|---:|---:|---|---|---:|");
    for (const i of rows) {
      const v = vfn(i);
      console.log(`| ${i.id} | ${i.route} | ${i.voiceworthiness} | ${fmt(i.mag)} | ${fmt(i.close)} | ${fmt(i.rel)} | ${fmt(i.time)} | ${fmt(i.conf)} | ${i.sens} | ${v.arith} | **${fmt(v.score, 3)}** |`);
    }
  }

  // === Ranking analysis ===
  console.log("\n## Ranking analysis");
  console.log("");
  console.log("Gold voiceworthiness tiers (per v0.3.1):");
  console.log("- strong_candidate: p004 (doorway), p008 (highlight), p018 (highlight)");
  console.log("- candidate: p020 (utility), p025 (utility)");
  console.log("- not_voiceworthy: p010, p016, p030 (all silent)");
  console.log("");
  console.log("Required ordering (cross-tier): strong_candidate > candidate > not_voiceworthy.");
  console.log("Within-tier the gold has TIES (no strict ordering).");
  console.log("");

  for (const [vname, vfn] of [
    ["v1 multiplicative", v1],
    ["v2 additive", v2],
    ["v3 additive-with-dampers", v3],
  ] as const) {
    const scored = rows.map((i) => ({ id: i.id, score: vfn(i).score, vw: i.voiceworthiness }));
    scored.sort((a, b) => b.score - a.score);
    console.log(`**${vname} ranking** (high → low):`);
    for (const s of scored) {
      console.log(`  ${fmt(s.score, 3).padStart(7)}  ${s.id}  (${s.vw})`);
    }
    // Cross-tier check: are all strong_candidates above all candidates above all not_voiceworthy?
    const strongMin = Math.min(...scored.filter((s) => s.vw === "strong_candidate").map((s) => s.score));
    const candidateMax = Math.max(...scored.filter((s) => s.vw === "candidate").map((s) => s.score));
    const candidateMin = Math.min(...scored.filter((s) => s.vw === "candidate").map((s) => s.score));
    const notMax = Math.max(...scored.filter((s) => s.vw === "not_voiceworthy").map((s) => s.score));
    const strongVsCandidate = strongMin > candidateMax;
    const candidateVsNot = candidateMin > notMax;
    console.log(`  cross-tier check: strong_candidate min (${fmt(strongMin, 3)}) > candidate max (${fmt(candidateMax, 3)})? ${strongVsCandidate ? "YES" : "NO"}; candidate min (${fmt(candidateMin, 3)}) > not_voiceworthy max (${fmt(notMax, 3)})? ${candidateVsNot ? "YES" : "NO"}`);
    console.log("");
  }

  // === Community-cluster within-route ranking (Eng1 task 2026-06-20) ===
  // Per ADR J1, routes rank within themselves. Show the community cluster's
  // v3 ordering against its gold dispositions so the W_community question
  // is decided on the official table rather than appendix arithmetic.
  console.log("## Community cluster — within-route v3 ranking");
  console.log("");
  console.log("All items use closeness=0.2 (unknown) by Eng1 design: new community accounts");
  console.log("are NOT in listener.closeness_map, so magnitude is the single discriminator.");
  console.log("");
  const communityRows = rows.filter((r) => COMMUNITY_CLUSTER_IDS.includes(r.id));
  const communityV3 = communityRows
    .map((r) => ({ id: r.id, short: r.short, score: v3(r).score, gold: r.desired_bucket, vw: r.voiceworthiness, sens: r.sens }))
    .sort((a, b) => b.score - a.score);
  console.log("| rank | id | name | v3 score | gold disposition | voiceworthiness | sens |");
  console.log("|---:|---|---|---:|---|---|---|");
  communityV3.forEach((r, idx) => {
    console.log(`| ${idx + 1} | ${r.id} | ${r.short} | **${fmt(r.score, 3)}** | ${r.gold} | ${r.vw} | ${r.sens} |`);
  });
  console.log("");
  // Gap analysis between the highest "noise" item and the lowest "wins" item
  // (treating wins as everything labeled voiced/candidate, noise as ambient/drop).
  const winsIds = ["p018", "p041", "p042", "p045"];
  const noiseIds = ["p043", "p044"];
  const winsScores = communityV3.filter((r) => winsIds.includes(r.id)).map((r) => r.score);
  const noiseScores = communityV3.filter((r) => noiseIds.includes(r.id)).map((r) => r.score);
  if (winsScores.length > 0 && noiseScores.length > 0) {
    const winsMin = Math.min(...winsScores);
    const noiseMax = Math.max(...noiseScores);
    const gap = winsMin - noiseMax;
    console.log(`Wins band (${winsIds.join(",")}) min v3 = ${fmt(winsMin, 3)}.`);
    console.log(`Noise band (${noiseIds.join(",")}) max v3 = ${fmt(noiseMax, 3)}.`);
    console.log(`Separation gap = ${fmt(gap, 3)} (positive ⇒ a flat threshold cleanly separates wins from noise in this cluster).`);
  }
  console.log("");

  // === Low-confidence probe ===
  console.log("## Low-confidence probe (synthetic — required by spec)");
  console.log("");
  console.log("Constructed item: high magnitude (0.85), low confidence (0.30), close tier (0.9), medium sensitivity, baseline rel + time.");
  console.log("Purpose: the 8 labeled items don't include a high-mag / low-conf case. This probe tests whether v3's confidence damper prevents over-voicing a low-confidence item.");
  console.log("");
  const probe: Inputs = {
    id: "probe1",
    short: "synthetic — high mag, low conf",
    mag: 0.85,
    close: 0.9,
    rel: REL_BASELINE,
    time: TIME_BASELINE,
    conf: 0.3,
    sens: "medium",
    route: "—",
    voiceworthiness: "n/a (synthetic)",
    desired_bucket: "—",
  };
  const probeV1 = v1(probe);
  const probeV2 = v2(probe);
  const probeV3 = v3(probe);
  console.log(`- v1: ${probeV1.arith} = **${fmt(probeV1.score, 3)}**`);
  console.log(`- v2: ${probeV2.arith} = **${fmt(probeV2.score, 3)}**`);
  console.log(`- v3: ${probeV3.arith} = **${fmt(probeV3.score, 3)}**`);
  console.log("");

  // Compare probe to strong_candidate band for each variant
  for (const [vname, vfn] of [
    ["v1", v1],
    ["v2", v2],
    ["v3", v3],
  ] as const) {
    const strongScores = rows.filter((r) => r.voiceworthiness === "strong_candidate").map((r) => vfn(r).score);
    const strongMin = Math.min(...strongScores);
    const strongMax = Math.max(...strongScores);
    const probeScore = vfn(probe).score;
    const probeVsStrong = probeScore > strongMax ? "**above all** strong_candidates" :
                          probeScore > strongMin ? "**within** strong_candidate band" :
                          "**below** strong_candidate band";
    console.log(`- ${vname}: probe ${fmt(probeScore, 3)} vs strong_candidate band [${fmt(strongMin, 3)}, ${fmt(strongMax, 3)}] → ${probeVsStrong}`);
  }
  console.log("");

  // === REGRESSION ASSERTION (per team ruling 2026-06-20, ADR J1) ===
  // The high-magnitude / low-confidence probe protects a GLOBAL safety
  // property per the route-aware-ranking ruling: low-confidence high-
  // magnitude items must never out-voice safe, well-grounded candidates
  // simply because magnitude is high.
  //
  // For the formula carried forward (v3), the probe must NOT exceed the
  // strong_candidate band ceiling. Any future constant tweak that breaks
  // this fails this script with exit 1.
  const v3StrongScores = rows
    .filter((r) => r.voiceworthiness === "strong_candidate")
    .map((r) => v3(r).score);
  const v3StrongMax = Math.max(...v3StrongScores);
  const v3ProbeScore = v3(probe).score;
  console.log("## Regression assertion (per ADR J1)");
  console.log("");
  console.log(`  probe v3 score:               ${fmt(v3ProbeScore, 3)}`);
  console.log(`  strong_candidate v3 max:      ${fmt(v3StrongMax, 3)}`);
  console.log(`  probe ≤ max (must pass):      ${v3ProbeScore <= v3StrongMax ? "OK" : "FAIL — global safety invariant violated"}`);
  if (v3ProbeScore > v3StrongMax) {
    console.error("");
    console.error("[REGRESSION] v3 probe out-voices strong_candidate max. The high-magnitude /");
    console.error("low-confidence probe is a must-pass regression per ADR J1 (2026-06-20).");
    console.error("A damper tweak has let a low-confidence high-magnitude item rise above the");
    console.error("safe-candidate band. This is the exact failure mode the dampers exist to");
    console.error("prevent.");
    process.exit(1);
  }
}

main().catch((e) => {
  console.error("formula-shape-test crashed:", e);
  process.exit(1);
});
