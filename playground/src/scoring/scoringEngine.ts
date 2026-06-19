import {
  type Bucket,
  type Decision,
  type IngestedItem,
  type Listener,
} from "../data/schemas";
import { consentGate } from "../safety/consentGate";
import { type ModelDerived } from "../meaning/types";
import { closeness, type ClosenessResult } from "./closeness";
import { timeliness, type TimelinessResult } from "./timeliness";
import { NoveltyTracker } from "./novelty";
import {
  DEFAULT_FOCUS_WEIGHTS,
  focusBoost,
  type FocusWeights,
} from "./focusWeights";

export type ScoringSettings = {
  voiceThreshold: number;        // ambient → voiced boundary (default 0.45)
  expandableThreshold: number;   // voiced → expandable boundary (default 0.65)
  relevanceBaseline: number;     // 0..1, default 0.5 (Step 3 may compute per item)
  timelinessBaseline: number;    // 0..1, default 0.5 — "neutral value" for recent no-expiry posts
  noveltyWindowHours: number;    // default 24
  focusWeights: FocusWeights;
};

export const DEFAULT_SETTINGS: ScoringSettings = {
  voiceThreshold: 0.45,
  expandableThreshold: 0.65,
  relevanceBaseline: 0.5,
  timelinessBaseline: 0.5,
  noveltyWindowHours: 24,
  focusWeights: DEFAULT_FOCUS_WEIGHTS,
};

export type MeaningMap = Map<string, ModelDerived>;

/**
 * Deterministic scorer (Step 2 + Step 3A wiring).
 *
 * Consumes a `MeaningMap` (the cached meaning-pass output, keyed by item_id)
 * instead of calling the meaning client directly — that's the Step 3
 * "cache once, score many" property. Sliders trigger `scoreBatch` again
 * but never touch the meaning client or cache.
 *
 * Formula (from rules-and-format.md Part 3):
 *   value = magnitude × closeness × (0.5 + 0.5·relevance) × (0.5 + 0.5·timeliness)
 * Then effective = value × focus_weight[source_type].
 *
 * Bucket from effective:
 *   not novel              → ambient (suppressed by dedup)
 *   < voiceThreshold       → ambient
 *   < expandableThreshold  → voiced
 *   ≥ expandableThreshold  → expandable
 *
 * Consent-gated items always land in `drop`, regardless of score.
 * Items with no meaning entry (e.g., not yet judged) also drop into a
 * `missing-meaning` ambient bucket — guards against silent misses.
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

  const rawScore =
    meaning.magnitude *
    close.value *
    (0.5 + 0.5 * relevance) *
    (0.5 + 0.5 * time.value);

  const effective = rawScore * focus;

  let bucket: Bucket;
  if (!novel) {
    bucket = "ambient";
  } else if (effective >= settings.expandableThreshold) {
    bucket = "expandable";
  } else if (effective >= settings.voiceThreshold) {
    bucket = "voiced";
  } else {
    bucket = "ambient";
  }

  return {
    item_id: item.id,
    bucket,
    score: effective,
    score_breakdown: {
      magnitude: meaning.magnitude,
      closeness: close.value,
      relevance,
      timeliness: time.value,
      focus_weight: focus,
      raw_score: rawScore,
      effective_score: effective,
    },
    reason: buildReason({
      meaning, close, time, focus, rawScore, effective, settings, novel, bucket,
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
  rawScore: number;
  effective: number;
  settings: ScoringSettings;
  novel: boolean;
  bucket: Bucket;
}): string {
  if (!ctx.novel) {
    return `not novel (novelty_key seen within ${ctx.settings.noveltyWindowHours}h) → ambient`;
  }
  return (
    `${ctx.meaning.category}(mag=${ctx.meaning.magnitude.toFixed(2)}, sens=${ctx.meaning.sensitivity}) ` +
    `× closeness=${ctx.close.value.toFixed(2)}(${ctx.close.tier}) ` +
    `× rel-boost(${ctx.settings.relevanceBaseline.toFixed(2)}) ` +
    `× time-boost(${ctx.time.value.toFixed(2)}, ${ctx.time.decay_band}) ` +
    `= ${ctx.rawScore.toFixed(3)}, ` +
    `× focus(${ctx.focus.toFixed(2)}) = ${ctx.effective.toFixed(3)} ` +
    `vs voice=${ctx.settings.voiceThreshold.toFixed(2)} / exp=${ctx.settings.expandableThreshold.toFixed(2)} → ${ctx.bucket}`
  );
}
