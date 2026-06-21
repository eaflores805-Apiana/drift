/**
 * Route — Layer 1 editorial treatment slot.
 *
 * Matches `GoldRoute` in `goldLabels.ts` exactly so labels and engine speak
 * the same vocabulary. Per the signal-routing meta-spec, route is the
 * stage-4 assignment (treatment axis); it is decided by the structural
 * classifier from `source_type` + `audience_scope` + `ModelDerived` —
 * never from the gold label, never from a model opinion at runtime.
 *
 * Per ADR J1 (route-aware ranking): scores are route-local. A 0.100
 * doorway score and a 0.532 highlight score are different units — they
 * are not comparable; there is no global leaderboard.
 *
 * Per ADR J2: "highlight" carries both personal highlights and community-
 * pride items under one fitted threshold (0.532) — no separate community
 * route or W_community term.
 *
 * Per ADR J3: "utility" has no voiced bar today (relevance is uncomputed,
 * Step-3 dependency). Items routed to utility always land in `ambient`.
 *
 * "silent" is the fail-closed default for items the classifier cannot
 * confidently place. Silent also has no voiced bar.
 */
export type Route = "silent" | "highlight" | "doorway" | "utility";

export const ROUTES: readonly Route[] = ["silent", "highlight", "doorway", "utility"] as const;
