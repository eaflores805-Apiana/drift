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

export type GoldLabel = {
  item_id: string;
  desired_bucket: Bucket;
  tone: GoldTone;
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
