import { type IngestedItem } from "../data/schemas";
import { type ModelDerived } from "../meaning/types";
import { type Route } from "./routes";

/**
 * Structural route classifier (meta-spec stage 4 in code).
 *
 * Deterministic. Fail-closed. Reads only:
 *   - `item.source_type` (structural)
 *   - `item.audience_scope` (structural; the consent gate has already passed)
 *   - `item.expires_at` (structural — presence + near-term decides "actionable")
 *   - `meaning.sensitivity` (structural value from the meaning pass: low|medium|high)
 *
 * Does NOT read the gold label (the engine cannot see labels at runtime).
 * Does NOT invoke a model opinion at runtime (the meaning pass already ran).
 * Unknown / unclassifiable items fall through to "silent" — fail-closed
 * default; silent has no voiced bar (per `routes.ts`).
 *
 * Decision class: this is a structural mapping, not a tunable knob.
 * Threshold values are tunable (per route); route assignment is structural.
 */

export function classifyRoute(
  item: IngestedItem,
  meaning: ModelDerived
): Route {
  const src = item.source_type;
  const personal = src === "friend" || src === "family" || src === "coworker";

  // (1) Doorway — sensitive interpersonal. Friend/family/coworker items
  //     with elevated sensitivity (medium or high) route to the gentle
  //     doorway treatment. Doorway = default to restraint.
  if (personal && (meaning.sensitivity === "high" || meaning.sensitivity === "medium")) {
    return "doorway";
  }

  // (2) Utility — time-bound actionable items. calendar / weather are
  //     inherently utility kinds; news / local_org / brand with a near-
  //     term `expires_at` are utility events (street fair tonight, sale
  //     until 6 pm, advisory through tomorrow). Per ADR J3 utility has
  //     no voiced bar today — these go ambient by design until relevance
  //     lands and a utility cluster is authored.
  if (src === "calendar" || src === "weather") {
    return "utility";
  }
  if ((src === "news" || src === "local_org" || src === "brand") && hasNearTermExpiry(item)) {
    return "utility";
  }

  // (3) Highlight — community / public-civic + community-pride brand
  //     events + personal positive events. news / local_org / brand
  //     WITHOUT a near-term expiry route here: a community-pride
  //     announcement, a finals win, a brand's state-level competition
  //     win. (Generic low-magnitude promo content from brand sources
  //     also lands here but cannot voice — v3 magnitude separates events
  //     from promos, and the route threshold gates accordingly.)
  //     Friend / family / coworker low-sensitivity items (life events,
  //     milestones) also route to highlight. Per ADR J2 this covers
  //     community without a separate route.
  if (src === "news" || src === "local_org" || src === "brand") {
    return "highlight";
  }
  if (personal && meaning.sensitivity === "low") {
    return "highlight";
  }

  // (4) Fail-closed default: silent. Creator is parked per meta-spec
  //     ("may behave like subscribed media; its own future question");
  //     anything else also lands here. Silent has no voiced bar — the
  //     score still computes for visibility, but the bucket caps at
  //     ambient.
  return "silent";
}

/**
 * "Near-term" = expires within 48h of the item's own timestamp. Captures
 * actionable utility (street fair tonight, advisory through tomorrow)
 * while letting a multi-day community campaign route to highlight.
 *
 * Tunable in principle; 48h chosen as a structural prior, not fitted —
 * see ADR J3 for what fitting utility would actually require.
 */
function hasNearTermExpiry(item: IngestedItem): boolean {
  if (!item.expires_at) return false;
  const start = Date.parse(item.timestamp);
  const end = Date.parse(item.expires_at);
  if (!Number.isFinite(start) || !Number.isFinite(end)) return false;
  const hours = (end - start) / (1000 * 60 * 60);
  return hours > 0 && hours <= 48;
}
