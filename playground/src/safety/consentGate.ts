import { type IngestedItem } from "../data/schemas";

export type ConsentResult =
  | { passes: true }
  | { passes: false; reason: string };

/**
 * Deterministic, fail-closed consent gate.
 *
 * Per BUILD.md Step 1: audience_scope === "public" or "published" passes;
 * anything else (including missing, blank, or unknown) drops before scoring.
 * Makes ZERO model calls.
 */
export function consentGate(item: IngestedItem): ConsentResult {
  const scope = (item.audience_scope ?? "").trim();
  if (scope === "public" || scope === "published") {
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
    reason: `audience_scope='${scope}' (only 'public' or 'published' pass)`,
  };
}
