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
  _community_cluster_schema?: unknown;
  labels: GoldLabel[];
  community_cluster?: CommunityClusterLabel[];
  _for_CS?: unknown;
};

export function loadGoldLabels(): Map<string, GoldLabel> {
  const raw = goldData as RawGoldFile;
  const map = new Map<string, GoldLabel>();
  for (const label of raw.labels ?? []) {
    map.set(label.item_id, label);
  }
  return map;
}

/**
 * Community-cluster annotations (v0.4.0, PO ratified 2026-06-19).
 *
 * SEPARATE from `labels[]`. Lives in `community_cluster[]` and uses a richer
 * schema (summary, bracket, minor_treatment, disposition). Provides the
 * pattern-fit target for Step 1.3's W_community floor constant.
 *
 * Per v0.4.0 _meta: "magnitude / closeness / sensitivity / confidence are
 * produced by the cached meaning pass, NOT in this file." So fitting also
 * requires (a) seed-items.json entries for the NEW items p041–p045, and
 * (b) cached meaning for those items. Without both, Step 1.3 cannot run.
 *
 * NOT consumed by the classifier yet — annotation/fitting data only.
 */
export type CommunityDisposition =
  | "voiced"
  | "ambient"
  | "drop"
  | "candidate (voiced-or-ambient — the maybe)"
  | "voiced_at_group_level_only"
  | string;

/**
 * `minor_treatment` in v0.4.0 community_cluster is free-form text that
 * STARTS with one of the policy tokens below, then continues with inline
 * rationale. Examples:
 *   "group_level — celebrate the squad, never name or center an athlete"
 *   "group_level_STRIP_individuals — celebrate the school/team; do NOT
 *    name or center the kids EVEN THOUGH the source names them. SAFETY
 *    FLOOR, not a dial."
 *
 * Use the policy-token prefix for any code-level decisions; the rest is
 * for humans. Tokens currently in use:
 *   - "group_level"
 *   - "group_level_STRIP_individuals"  (SAFETY FLOOR — not revisable)
 */
export type MinorTreatment = string;

export type CommunityClusterLabel = {
  id: string;
  summary?: string;
  audience_scope?: string;
  community_cluster?: boolean;
  bracket?: string | null;
  minor_involved?: boolean;
  /**
   * NOTE: `group_level_STRIP_individuals` is a SAFETY FLOOR per v0.4.0
   * _meta — not subject to tuning. Disposition values are revisable;
   * this protection is not.
   */
  minor_treatment?: MinorTreatment | null;
  route?: string;
  eligibility_status?: EligibilityStatus;
  voiceworthiness?: Voiceworthiness;
  disposition?: CommunityDisposition;
  disposition_reason?: string;
  ratified?: boolean;
};

export function loadCommunityCluster(): Map<string, CommunityClusterLabel> {
  const raw = goldData as RawGoldFile;
  const map = new Map<string, CommunityClusterLabel>();
  for (const lbl of raw.community_cluster ?? []) {
    map.set(lbl.id, lbl);
  }
  return map;
}
