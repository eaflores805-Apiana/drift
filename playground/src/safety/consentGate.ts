import { type IngestedItem } from "../data/schemas";

export type ConsentResult =
  | { passes: true }
  | { passes: false; reason: string };

/**
 * Deterministic, fail-closed consent gate.
 *
 * Eligible-audience semantics, per the 2026-06-19 team ruling
 * (`docs/correspondence/team-consent-gate-ruling-2026-06-19.md`):
 *
 *   pass: audience_scope ∈ { "public", "published", "friends" }
 *   drop: anything else, including private, blank, missing, unknown, unsupported
 *
 * The gate's only job is "is this eligible to enter the system at all?"
 * Whether/how to voice, sensitivity, tone, and detail-level all happen
 * downstream — the item's audience_scope is preserved on the item for
 * those later decisions.
 *
 * Makes ZERO model calls.
 */
const ELIGIBLE_SCOPES: ReadonlySet<string> = new Set(["public", "published", "friends"]);

export function consentGate(item: IngestedItem): ConsentResult {
  const scope = (item.audience_scope ?? "").trim();
  if (ELIGIBLE_SCOPES.has(scope)) {
    return { passes: true };
  }
  if (!scope) {
    return {
      passes: false,
      reason: "audience_scope is blank or missing (fail-closed)",
    };
  }
  return {
    passes: false,
    reason: `audience_scope='${scope}' (eligible: ${Array.from(ELIGIBLE_SCOPES).join(", ")})`,
  };
}
