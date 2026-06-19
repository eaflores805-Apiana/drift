import { type IngestedItem } from "../data/schemas";

/**
 * Hand-stubbed ModelDerived fields for Step 2.
 *
 * These are placeholders the real meaning-pass prompt (Step 3) will replace.
 * The point in Step 2 is to make the scoring pipeline run end-to-end with
 * plausible inputs — NOT to be accurate. Treat values here as scaffolding.
 *
 * When Step 3 lands, swap this module for the cached meaning-pass output
 * keyed by `prompt_version`.
 */

export type ModelDerived = {
  category: string;
  magnitude: number;            // 0..1
  sensitivity: "none" | "low" | "high";
  confidence: number;           // 0..1
};

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

// Crude keyword sensitivity heuristic — Step 3 will replace this with real judgment.
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

function inferSensitivity(item: IngestedItem): ModelDerived["sensitivity"] {
  const text = item.raw_text.toLowerCase();
  for (const kw of HIGH_SENSITIVITY_KEYWORDS) {
    if (text.includes(kw)) return "high";
  }
  return "none";
}
