import { type SourceType } from "../data/schemas";

/**
 * Per-source focus weights. Multiplicative boost applied to the raw score.
 *
 * Per Eng1 R1 and the team-lead ruling on Step 2 hard check #4:
 * focus modes are WEIGHTING, not filters. Friend focus raises friend-weight;
 * it does not delete local/news/product items. Items from any source can
 * still rise above the threshold.
 */
export type FocusWeights = Record<SourceType, number>;

export const DEFAULT_FOCUS_WEIGHTS: FocusWeights = {
  friend: 1.0,
  family: 1.0,
  coworker: 1.0,
  local_org: 1.0,
  brand: 1.0,
  creator: 1.0,
  news: 1.0,
  weather: 1.0,
  calendar: 1.0,
};

export function focusBoost(source_type: SourceType, weights: FocusWeights): number {
  return weights[source_type] ?? 1.0;
}
