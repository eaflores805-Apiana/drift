import goldData from "../../data/gold-labels.json";
import { type Bucket } from "../data/schemas";

/**
 * Gold label loader for the diagnostic decision board.
 *
 * Reads `playground/data/gold-labels.json` (seeded with calibration entries
 * the PO confirms or overrides). Returns a `Map<item_id, GoldLabel>` for
 * O(1) lookup by item id. Missing labels are simply absent from the map —
 * the comparison surface treats unlabeled items neutrally (no opinion).
 *
 * Per the team ruling on the diagnostic board: gold-label agreement is a
 * neutral measurement axis, NOT a green/red success status.
 */

export type GoldTone =
  | "celebratory" | "warm" | "playful" | "neutral" | "serious" | "gentle" | "avoid";
export type RiskLevel = "low" | "medium" | "high";
/**
 * Route added in gold-labels.json v0.2.0 — the four paths to (or away from)
 * the mic that the eventual scoring work needs to satisfy SEPARATELY.
 *   silent     — drop or ambient; never voiced
 *   highlight  — voiced as a celebration/important event
 *   doorway    — voiced as a check-in nudge back to a relationship (gentle)
 *   utility    — voiced as actionable information (commercial/local/event)
 */
export type GoldRoute = "silent" | "highlight" | "doorway" | "utility";

/**
 * Added in gold-labels.json v0.3.0 — three orthogonal axes the Team Lead
 * separated out so the labels carry the underlying judgment without
 * conflating it with the bucket. `desired_bucket` stays clean
 * (drop|ambient|voiced|expandable) so the current scorer + bucket-agreement
 * metric stay usable.
 *
 *   eligibility_status   — pre-scoring: did the item pass consent etc.?
 *                          ('blocked' = consent/safety failure; 'eligible' otherwise)
 *   voiceworthiness      — per-item merit, independent of bucket
 *                          ('strong_candidate' / 'candidate' / 'not_voiceworthy' / 'n/a')
 *   disposition_reason   — free-text rationale for the bucket placement
 *                          ('consent_blocked' / 'insufficient_signal' /
 *                           'low_connection_value' / 'ambient_only' /
 *                           'voiceworthy' / etc.)
 *
 * NOTE: per team freeze, none of these are consumed by the scoring formula
 * or the diagnostic board's mismatch classifier yet. They are labels, not
 * yet routes/gates/dispositions in code.
 */
export type EligibilityStatus = "eligible" | "blocked";
export type Voiceworthiness =
  | "strong_candidate" | "candidate" | "not_voiceworthy" | "n/a";

export type GoldLabel = {
  item_id: string;
  desired_bucket: Bucket;
  route?: GoldRoute;
  tone: GoldTone;
  eligibility_status?: EligibilityStatus;
  voiceworthiness?: Voiceworthiness;
  disposition_reason?: string;
  would_you_be_glad?: "yes" | "no";
  would_subject_be_ok?: "yes" | "no" | "n/a";
  risk_level?: RiskLevel;
  context_allowed?: "yes" | "no";
  should_connect_to_world?: "yes" | "no";
  allowed_claims?: string[];
  forbidden_inferences?: string[];
  example_good_line?: string;
  example_bad_line?: string;
  why?: string;
  _status?: string;
  _flag?: string;
};

type RawGoldFile = {
  _meta?: unknown;
  _schema?: unknown;
  labels: GoldLabel[];
};

export function loadGoldLabels(): Map<string, GoldLabel> {
  const raw = goldData as RawGoldFile;
  const map = new Map<string, GoldLabel>();
  for (const label of raw.labels ?? []) {
    map.set(label.item_id, label);
  }
  return map;
}
