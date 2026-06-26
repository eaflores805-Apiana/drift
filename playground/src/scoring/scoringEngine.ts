import {
  type Bucket,
  type Decision,
  type IngestedItem,
  type Listener,
} from "../data/schemas";
import { consentGate } from "../safety/consentGate";
import { type ModelDerived, type Sensitivity } from "../meaning/types";
import { closeness, type ClosenessResult } from "./closeness";
import { timeliness, type TimelinessResult } from "./timeliness";
import { NoveltyTracker } from "./novelty";
import {
  DEFAULT_FOCUS_WEIGHTS,
  focusBoost,
  type FocusWeights,
} from "./focusWeights";
import { type Route } from "./routes";
import {
  type Band,
  type BandThresholds,
  BAND_ROUTE,
  classifyBand,
  DEFAULT_BAND_THRESHOLDS,
} from "./bands";

export type RouteThresholds = Partial<Record<Route, number>>;

export type ScoringSettings = {
  /**
   * Per-route voiced threshold (Step 1.3 fits, ADR J1 + J2).
   * Absent route = no voiced bar (always ambient): true today for
   * `utility` (ADR J3 — relevance uncomputed) and `silent` (fail-closed
   * default). Compared route-locally; values are NOT comparable across
   * routes (different units — meta-spec §"Scores are not comparable
   * across routes").
   */
  routeThresholds: RouteThresholds;
  /**
   * Per-BAND voiced threshold override (ADR J4). A band present here uses
   * this value; a band absent falls back to `routeThresholds[BAND_ROUTE[band]]`.
   * Lets `positive_personal_touch` carry its own bar (0.30) while sharing the
   * "highlight" treatment route with community-pride items (bar 0.532).
   * ⚠ The default values are World-Ventura-only demo scaffolding — see
   * `bands.ts` DEFAULT_BAND_THRESHOLDS. Re-derive on a realistic corpus.
   */
  bandThresholds: BandThresholds;
  /**
   * Voiced → expandable boundary. Currently global (Step 1.3 fit voiced
   * thresholds only; per-route expandables are a future fit per the
   * wiring task spec §3). Applied uniformly across routes that have a
   * voiced bar.
   */
  expandableThreshold: number;
  /**
   * Relevance baseline (0..1). Per ADR J3 + scoringEngine.ts comment,
   * relevance is uncomputed today (Phase B Step 3 dependency). All items
   * receive this constant. Under the canonical v3 formula it enters as
   * `+ 0.2·(rel − 0.5)`, so at 0.5 it contributes 0 (no lift, no drag).
   */
  relevanceBaseline: number;
  timelinessBaseline: number;
  noveltyWindowHours: number;
  focusWeights: FocusWeights;
};

/**
 * Provisional doorway threshold per Step 1.3 fit (commit 7906317 onward).
 * Fit against a single labeled doorway point (p004 v3 = 0.159); the
 * silent-ceiling margin (+0.064 over p016 = 0.036) is cross-route, not
 * an in-route doorway-silent anchor. Re-fit when more doorway items land
 * — especially a true doorway-silent anchor. If the p045 de-risk track
 * later moves sensitivity out of the score, the doorway decompresses
 * and this constant must be re-fit (see ADR J3 coupling note).
 */
const DOORWAY_THRESHOLD_PROVISIONAL = 0.10;
const HIGHLIGHT_THRESHOLD_FITTED = 0.532;

export const DEFAULT_ROUTE_THRESHOLDS: RouteThresholds = {
  doorway: DOORWAY_THRESHOLD_PROVISIONAL,
  highlight: HIGHLIGHT_THRESHOLD_FITTED,
  // utility intentionally absent — ADR J3 (relevance uncomputed).
  // silent intentionally absent — fail-closed (no voiced bar).
};

export const DEFAULT_SETTINGS: ScoringSettings = {
  routeThresholds: DEFAULT_ROUTE_THRESHOLDS,
  bandThresholds: DEFAULT_BAND_THRESHOLDS,
  expandableThreshold: 0.65,
  relevanceBaseline: 0.5,
  timelinessBaseline: 0.5,
  noveltyWindowHours: 24,
  focusWeights: DEFAULT_FOCUS_WEIGHTS,
};

/**
 * Sensitivity damper (canonical v3 per docs/03-rules-and-format.md Part 3
 * v0.2.0). Multiplicative tail factor; sits OUTSIDE the additive base.
 */
const SENSITIVITY_DAMPER: Record<Sensitivity, number> = {
  low: 1.0,
  medium: 0.8,
  high: 0.6,
};

export type MeaningMap = Map<string, ModelDerived>;

/**
 * Deterministic scorer (v3 wiring — Step 1.4).
 *
 * Canonical formula (ADR J1 + J2; docs/03-rules-and-format.md Part 3):
 *   base  = magnitude
 *         + 0.2·(closeness  − 0.5)
 *         + 0.2·(relevance  − 0.5)
 *         + 0.2·(timeliness − 0.5)
 *   value = base × confidence × sensitivity_damper
 *
 * Bucketing is route-local (ADR J1):
 *   route   = classifyRoute(item, meaning)     (structural; never gold)
 *   thresh  = settings.routeThresholds[route]   (absent ⇒ no voiced bar)
 *   if (!novel)                          → ambient
 *   else if (thresh undefined)           → ambient    (utility / silent)
 *   else if (value ≥ expandableThreshold) → expandable
 *   else if (value ≥ thresh)             → voiced
 *   else                                 → ambient
 *
 * `focus_weight` is a SEPARATE post-multiplier (`× focus`, default 1.0)
 * kept wired for later channel/learning gain — NOT folded into the
 * additive base (per wiring task §2 recommendation).
 *
 * Consent-gated items → drop, regardless of score (safety floor).
 * Items with no meaning entry → ambient (missing-meaning guard).
 * Makes ZERO model calls.
 */
export function scoreBatch(
  items: IngestedItem[],
  listener: Listener,
  meaningMap: MeaningMap,
  settings: ScoringSettings = DEFAULT_SETTINGS
): Decision[] {
  const tracker = new NoveltyTracker(settings.noveltyWindowHours);
  const sorted = [...items].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  const decisions: Decision[] = [];
  for (const item of sorted) {
    const ts = new Date(item.timestamp).getTime();
    const novel = tracker.isNovel(item.novelty_key, ts);
    decisions.push(scoreOne(item, listener, meaningMap, settings, novel));
  }
  return decisions;
}

function scoreOne(
  item: IngestedItem,
  listener: Listener,
  meaningMap: MeaningMap,
  settings: ScoringSettings,
  novel: boolean
): Decision {
  const consent = consentGate(item);
  if (!consent.passes) {
    return dropDecision(item, consent.reason);
  }

  const meaning = meaningMap.get(item.id);
  if (!meaning) {
    return missingMeaningDecision(item);
  }

  const close = closeness(item, listener);
  const time = timeliness(item.timestamp, item.expires_at, settings.timelinessBaseline);
  const relevance = settings.relevanceBaseline;
  const focus = focusBoost(item.source_type, settings.focusWeights);

  // Canonical v3 additive base + dampers.
  const cTerm = 0.2 * (close.value - 0.5);
  const rTerm = 0.2 * (relevance - 0.5);
  const tTerm = 0.2 * (time.value - 0.5);
  const base = meaning.magnitude + cTerm + rTerm + tTerm;
  const damper = SENSITIVITY_DAMPER[meaning.sensitivity];
  const value = base * meaning.confidence * damper;

  // Focus stays as a SEPARATE post-multiplier (not in the additive base).
  const effective = value * focus;

  // ADR J4: classify the treatment BAND, derive the structural route from it,
  // and resolve the voiced bar band-first (so positive_personal_touch carries
  // its own 0.30 bar while sharing the highlight route with community pride at
  // 0.532). Band absent from bandThresholds ⇒ fall back to the route threshold.
  const band = classifyBand(item, meaning);
  const route = BAND_ROUTE[band];
  const threshold = settings.bandThresholds[band] ?? settings.routeThresholds[route];

  let bucket: Bucket;
  if (!novel) {
    bucket = "ambient";
  } else if (threshold === undefined) {
    bucket = "ambient";
  } else if (effective >= settings.expandableThreshold) {
    bucket = "expandable";
  } else if (effective >= threshold) {
    bucket = "voiced";
  } else {
    bucket = "ambient";
  }

  const breakdown: Record<string, number> = {
    magnitude: meaning.magnitude,
    closeness: close.value,
    relevance,
    timeliness: time.value,
    confidence: meaning.confidence,
    sensitivity_damper: damper,
    base,
    value,
    focus_weight: focus,
    effective_score: effective,
  };
  if (threshold !== undefined) breakdown.route_threshold = threshold;

  return {
    item_id: item.id,
    bucket,
    score: effective,
    score_breakdown: breakdown,
    route,
    band,
    reason: buildReason({
      meaning, close, time, focus, base, value, effective,
      route, band, threshold, settings, novel, bucket,
    }),
    allowed_claims: meaning.allowed_claims,
    forbidden_inferences: meaning.forbidden_inferences,
    safety_check: {
      passed: true, // Step 2/3A do not run claim-grounding (Step 5 territory)
      grounded_claims: [],
      rejected_reason: null,
    },
  };
}

function dropDecision(item: IngestedItem, reason: string): Decision {
  return {
    item_id: item.id,
    bucket: "drop",
    score: 0,
    score_breakdown: {},
    reason: `consent gate drop: ${reason}`,
    allowed_claims: [],
    forbidden_inferences: [],
    safety_check: { passed: false, grounded_claims: [], rejected_reason: reason },
  };
}

function missingMeaningDecision(item: IngestedItem): Decision {
  return {
    item_id: item.id,
    bucket: "ambient",
    score: 0,
    score_breakdown: {},
    reason: "no meaning entry in the cache — defaulting to ambient (dev-only guard)",
    allowed_claims: [],
    forbidden_inferences: [],
    safety_check: { passed: true, grounded_claims: [], rejected_reason: null },
  };
}

function buildReason(ctx: {
  meaning: ModelDerived;
  close: ClosenessResult;
  time: TimelinessResult;
  focus: number;
  base: number;
  value: number;
  effective: number;
  route: Route;
  band: Band;
  threshold: number | undefined;
  settings: ScoringSettings;
  novel: boolean;
  bucket: Bucket;
}): string {
  if (!ctx.novel) {
    return `not novel (novelty_key seen within ${ctx.settings.noveltyWindowHours}h) → ambient`;
  }
  const thresholdStr =
    ctx.threshold === undefined
      ? "no voiced bar (route deferred / fail-closed)"
      : `voice=${ctx.threshold.toFixed(3)} / exp=${ctx.settings.expandableThreshold.toFixed(2)}`;
  return (
    `${ctx.meaning.category}(mag=${ctx.meaning.magnitude.toFixed(2)}, sens=${ctx.meaning.sensitivity}) ` +
    `+ 0.2·(close=${ctx.close.value.toFixed(2)}(${ctx.close.tier})−0.5) ` +
    `+ 0.2·(rel=${ctx.settings.relevanceBaseline.toFixed(2)}−0.5) ` +
    `+ 0.2·(time=${ctx.time.value.toFixed(2)}(${ctx.time.decay_band})−0.5) ` +
    `= base ${ctx.base.toFixed(3)}, ` +
    `× conf ${ctx.meaning.confidence.toFixed(2)} × sens_damper ${SENSITIVITY_DAMPER[ctx.meaning.sensitivity].toFixed(2)} ` +
    `= value ${ctx.value.toFixed(3)}, ` +
    `× focus(${ctx.focus.toFixed(2)}) = ${ctx.effective.toFixed(3)} ` +
    `[band=${ctx.band}, route=${ctx.route}, ${thresholdStr}] → ${ctx.bucket}`
  );
}
