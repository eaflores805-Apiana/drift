import { type Bucket, type Decision, type IngestedItem, type Listener } from "../data/schemas";
import { type ModelDerived } from "../meaning/types";
import { type GoldLabel } from "./goldLabels";

/**
 * Typed mismatch labels per the team's diagnostic-board spec.
 *
 * `label_review_needed` is the heuristic flag for UNLABELED items where the
 * engine restraint looks possibly miscalibrated (followed-brand time-bound
 * drops landing ambient, local-event-in-listener's-town landing ambient).
 * Surfaced so the PO has a worklist; NOT a claim that the engine is wrong.
 */
export type MismatchType =
  | "over_suppression"
  | "close_friend_over_suppression"
  | "useful_local_underpromotion"
  | "commercial_underpromotion"
  | "false_voice"
  | "high_sensitivity_false_voice"
  | "junk_promoted"
  | "commercial_overpromotion"
  | "sensitive_underprotected"
  | "label_review_needed";

/**
 * One comparison result per item. `mismatch` is null when the engine agrees
 * with gold or when there's no gold and no heuristic flag. The surface
 * renders this in a NEUTRAL color (not the safety palette).
 */
export type Comparison = {
  hasGold: boolean;
  goldBucket?: Bucket;
  engineBucket: Bucket;
  agreement?: boolean; // only meaningful when hasGold
  mismatch: MismatchType | null;
  reason: string;
};

const VOICED: ReadonlyArray<Bucket> = ["voiced", "expandable"];
const NON_VOICED: ReadonlyArray<Bucket> = ["ambient", "drop"];

export function classifyComparison(
  item: IngestedItem,
  decision: Decision,
  gold: GoldLabel | undefined,
  meaning: ModelDerived | undefined,
  listener: Listener
): Comparison {
  if (!gold) return classifyUnlabeled(item, decision, meaning, listener);
  return classifyAgainstGold(item, decision, gold, meaning, listener);
}

function classifyAgainstGold(
  item: IngestedItem,
  decision: Decision,
  gold: GoldLabel,
  meaning: ModelDerived | undefined,
  listener: Listener
): Comparison {
  const base = {
    hasGold: true as const,
    goldBucket: gold.desired_bucket,
    engineBucket: decision.bucket,
  };

  if (decision.bucket === gold.desired_bucket) {
    return {
      ...base,
      agreement: true,
      mismatch: null,
      reason: "engine bucket matches gold",
    };
  }

  // Disagreement — type it.
  const goldVoiced = VOICED.includes(gold.desired_bucket);
  const engineVoiced = VOICED.includes(decision.bucket);

  // Over-suppression: gold wants voiced/expandable, engine gave ambient/drop.
  if (goldVoiced && !engineVoiced) {
    const tier = listener.closeness_map[item.account_id ?? ""];
    if (tier === "close") {
      return {
        ...base,
        agreement: false,
        mismatch: "close_friend_over_suppression",
        reason: `gold=${gold.desired_bucket}, engine=${decision.bucket}, closeness=close`,
      };
    }
    return {
      ...base,
      agreement: false,
      mismatch: "over_suppression",
      reason: `gold=${gold.desired_bucket}, engine=${decision.bucket}`,
    };
  }

  // False voice: gold wants ambient/drop, engine gave voiced/expandable.
  if (!goldVoiced && engineVoiced) {
    if (meaning?.sensitivity === "high") {
      return {
        ...base,
        agreement: false,
        mismatch: "high_sensitivity_false_voice",
        reason: `gold=${gold.desired_bucket}, engine=${decision.bucket}, sensitivity=high`,
      };
    }
    if (meaning && meaning.magnitude < 0.2) {
      return {
        ...base,
        agreement: false,
        mismatch: "junk_promoted",
        reason: `gold=${gold.desired_bucket}, engine=${decision.bucket}, magnitude=${meaning.magnitude.toFixed(2)}`,
      };
    }
    if (item.source_type === "brand") {
      return {
        ...base,
        agreement: false,
        mismatch: "commercial_overpromotion",
        reason: `gold=${gold.desired_bucket}, engine=${decision.bucket}, brand`,
      };
    }
    return {
      ...base,
      agreement: false,
      mismatch: "false_voice",
      reason: `gold=${gold.desired_bucket}, engine=${decision.bucket}`,
    };
  }

  // Minor disagreement (e.g., voiced vs expandable, ambient vs drop) — no specific type.
  return {
    ...base,
    agreement: false,
    mismatch: null,
    reason: `gold=${gold.desired_bucket}, engine=${decision.bucket} (within-tier disagreement)`,
  };
}

function classifyUnlabeled(
  item: IngestedItem,
  decision: Decision,
  meaning: ModelDerived | undefined,
  listener: Listener
): Comparison {
  const base = {
    hasGold: false as const,
    engineBucket: decision.bucket,
  };

  const enginePassive = NON_VOICED.includes(decision.bucket);

  // Heuristic: useful local event in the listener's town, time-bound, held ambient.
  const cityHint = listener.location?.split(",")[0]?.trim().toLowerCase();
  const itemCity = item.location?.toLowerCase();
  const isLocalSource = item.source_type === "local_org" || item.source_type === "news";
  const isInListenerCity = !!cityHint && !!itemCity && itemCity.includes(cityHint);
  const isTimeBound = !!item.expires_at;

  if (enginePassive && isLocalSource && isInListenerCity && isTimeBound) {
    return {
      ...base,
      mismatch: "label_review_needed",
      reason: "looks like useful_local_underpromotion (time-bound, listener's town) — please add a gold label",
    };
  }

  // Heuristic: followed brand with a time-bound drop, held ambient.
  const tier = listener.closeness_map[item.account_id ?? ""];
  const isFollowedBrand = item.source_type === "brand" && tier === "followed";
  if (enginePassive && isFollowedBrand && isTimeBound) {
    return {
      ...base,
      mismatch: "label_review_needed",
      reason: "looks like commercial_underpromotion (followed brand, time-bound) — please add a gold label",
    };
  }

  // Heuristic: high-sensitivity item voiced or expandable without a gold label.
  if (!enginePassive && meaning?.sensitivity === "high") {
    return {
      ...base,
      mismatch: "label_review_needed",
      reason: "high-sensitivity item voiced/expandable without a gold label — please confirm",
    };
  }

  return {
    ...base,
    mismatch: null,
    reason: "no gold label; no heuristic flag",
  };
}
