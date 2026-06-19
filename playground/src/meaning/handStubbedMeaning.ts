import { type IngestedItem } from "../data/schemas";
import { type ModelDerived, type Sensitivity } from "./types";

/**
 * Deterministic hand-stub of the Step 3 meaning-pass output.
 *
 * Returns the FULL `ModelDerived` shape so it validates against the same
 * contract the real client will produce. The judgments themselves are
 * scaffolding — Step 3B's real model output replaces these wholesale.
 *
 * Same item → same result (deterministic): pure function over `item`.
 */

const CATEGORY_MAGNITUDE: Record<string, number> = {
  life_event: 0.9,
  travel: 0.6,
  plans: 0.55,
  place: 0.3,
  daily: 0.18,
  food: 0.18,
  news_local: 0.6,
  news_topic: 0.5,
  calendar: 0.5,
};

const HIGH_SENSITIVITY_KEYWORDS = [
  "grief", "loss", "died", "death", "miss you", "memorial",
  "political", "politics", "rant",
  "rough week", "hard week", "carrying", "going through",
  "illness", "sick", "diagnosis",
];

export function handStubbedMeaning(item: IngestedItem): ModelDerived {
  const category = inferCategory(item);
  const magnitude = CATEGORY_MAGNITUDE[category] ?? 0.3;
  const sensitivity = inferSensitivity(item);
  return {
    category,
    magnitude,
    sensitivity,
    confidence: 0.7, // stub: modestly confident across the board
    context_candidates: [], // Step 3B real model adds these
    connection_read: "stub: no connection_read computed in Step 3A",
    rationale: {
      category: "stub: category inferred from source_type",
      magnitude: "stub: magnitude from CATEGORY_MAGNITUDE lookup",
      sensitivity: "stub: sensitivity from keyword scan",
      confidence: "stub: fixed 0.7 across the board",
      context_candidates: "stub: none computed",
      connection_read: "stub: none computed",
    },
    allowed_claims: [], // Step 3B real model derives from raw_text
    forbidden_inferences: [],
  };
}

function inferCategory(item: IngestedItem): string {
  switch (item.source_type) {
    case "friend":
    case "coworker":
    case "family":
      return "daily";
    case "local_org":
    case "news":
    case "weather":
      return "news_local";
    case "brand":
      return "place";
    case "creator":
      return "news_topic";
    case "calendar":
      return "calendar";
    default:
      return "daily";
  }
}

function inferSensitivity(item: IngestedItem): Sensitivity {
  const text = item.raw_text.toLowerCase();
  for (const kw of HIGH_SENSITIVITY_KEYWORDS) {
    if (text.includes(kw)) return "high";
  }
  return "low";
}
