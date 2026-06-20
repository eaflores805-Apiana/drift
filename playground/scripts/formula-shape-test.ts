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

import { resolve } from "node:path";
import { loadSimulated } from "../src/data/adapters/simulatedAdapter";
import { type IngestedItem, type Listener } from "../src/data/schemas";
import { loadGoldLabels, type GoldLabel } from "../src/evaluation/goldLabels";
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
];

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
  gold: GoldLabel | undefined
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
    route: gold?.route ?? "—",
    voiceworthiness: gold?.voiceworthiness ?? "—",
    desired_bucket: gold?.desired_bucket ?? "—",
  };
}

async function main(): Promise<void> {
  const cacheDir = resolve(".meaning-cache");
  const cache = new DiskMeaningCache(cacheDir);
  const client = new CachedReadOnlyClient();
  const { listener, items } = loadSimulated();
  const itemsById = new Map(items.map((i) => [i.id, i]));
  const gold = loadGoldLabels();

  // Build inputs for the 8 targets.
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
    rows.push(await buildInputs(item, listener, meaning, gold.get(t.id)));
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

  // Compare probe to median-of-strong-candidate for each variant
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
}

main().catch((e) => {
  console.error("formula-shape-test crashed:", e);
  process.exit(1);
});
