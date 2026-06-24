/**
 * v0.4.0-DRAFT Box 8b ruleset — Editorial-Restraint change set v0.1.1, §3.
 * NON-MERGED DRAFT. Composes OVER the frozen `routeGate` (box8-v0); does not
 * modify it. Route-scoped to sensitive + grave.
 *
 * Implements:
 *   §3a — approval-construction denylist (the mechanical FLOOR for Prompt Rule 1:
 *         "no adjudicating the interior"). Catches the observed adjudication tics,
 *         NOT the category (whack-a-mole; §5 semantic claim coverage is the
 *         durable fix). Acknowledgment of the moment is deliberately NOT listed
 *         (court-stenographer guard).
 *   §3b — declined-framing / outreach / advice block-lists, fired only when the
 *         packet's decomposed policy says so.
 *
 * THE HONEST DISPOSITION (TL correction 3 — do not overclaim a lexical gate):
 *   known lexical violation                        → BLOCK
 *   VALENCE POLICY = factual_only                  → FACTUAL TEMPLATE
 *   no lexical hit but stance can't be verified    → MANUAL-REVIEW FLAG (measured,
 *                                                    NOT an automatic gate action)
 * The flag is counted, not enforced — its firing rate measures the size of the
 * semantic gap §5 must eventually close. The generation model never judges its
 * own compliance.
 */
import { routeGate, type RouteTier, type Disposition } from "../routeGate";
import type { EditorialPolicy } from "./packet-v0.4-draft";

// §3a — approval-construction denylist (verbatim from change set §3a) + the one
// PO-approved addition. "sounds about right" / "about right" are added per PO,
// EXPLICITLY flagged as illustration of the category limit (every phrase we add
// proves the whack-a-mole point; it is not progress toward completeness — §5 is).
export const APPROVAL_DENYLIST: { form: string; note?: string }[] = [
  { form: "that's fair" },
  { form: "that tracks" },
  { form: "that makes sense" },
  { form: "that's exactly right" },
  { form: "that's the right thing" },
  { form: "of course you feel" },
  { form: "anyone would feel" },
  { form: "you have every right to" },
  { form: "sounds about right", note: "PO-added 2026-06-23 — category-limit illustration, not a completeness fix" },
  { form: "about right", note: "PO-added 2026-06-23 — category-limit illustration, not a completeness fix" },
];

// §3b — declined-framing lexical block-lists (verbatim from change set §3b).
// HONEST LIMIT (measured in the replay): these catch listed forms only; an
// unlisted phrase that semantically imposes the framing (e.g. G40 gen3
// "something good today") is NOT caught here — it lands on the manual-review flag.
export const DECLINED_CELEBRATION = [
  "good news", "great news", "a win", "reason to celebrate", "congratulations", "something good happened",
];
export const DECLINED_SYMPATHY = [
  "so sorry", "my condolences", "deepest sympathies", "thoughts and prayers", "so heartbreaking",
];
export const OUTREACH_PROHIBITED_FORMS = [
  "reach out to them", "reach out to her", "reach out to him",
  "send them a note", "send her a note", "send him a note",
  "check in on them", "check in on her", "check in on him", "drop them a line",
];
export const ADVICE_PROHIBITED_FORMS = [
  "you should", "what you need to do", "have you tried", "the best thing to do",
  "just try", "all you have to do",
];

const norm = (s: string) => s.toLowerCase().replace(/[“”]/g, '"').replace(/[’]/g, "'");

export interface DraftRouteResult {
  /** the frozen box8-v0 disposition (unchanged blanket behavior) */
  base_disposition: Disposition;
  base_passes: boolean;
  /** new §3a/§3b lexical hits (route-scoped sensitive/grave) */
  approval_hits: string[];
  declined_framing_hits: string[];
  outreach_hits: string[];
  advice_hits: string[];
  /** the honest disposition this line would receive under v0.4-draft */
  v04_disposition: "block_lexical" | "factual_template" | "manual_review_flag" | "base";
  /** why the manual-review flag fired (measured, not enforced) */
  manual_review_reason?: string;
}

/** Substring-scan, with quote-exemption: a form sitting inside a permitted span does not fire. */
function scan(forms: string[], line: string, permittedSpans: string[]): string[] {
  const t = norm(line);
  const permitted = permittedSpans.map(norm);
  return forms.filter((f) => t.includes(norm(f)) && !permitted.some((s) => s.includes(norm(f))));
}

/**
 * Evaluate a line under the v0.4-draft 8b ruleset. `tier`/`source` drive the
 * frozen base gate; `policy`/`permittedSpans` drive the new editorial rules.
 * Zero model calls.
 */
export function routeGateV04(
  line: string,
  tier: RouteTier,
  source: string,
  policy: EditorialPolicy,
  permittedSpans: string[],
): DraftRouteResult {
  const base = routeGate(line, tier, source);
  const scoped = tier === "sensitive" || tier === "grave";

  const approval_hits = scoped
    ? scan(APPROVAL_DENYLIST.map((d) => d.form), line, permittedSpans) : [];
  const declined_framing_hits = scoped
    ? [
        ...(policy.declined_framings.includes("celebration") ? scan(DECLINED_CELEBRATION, line, permittedSpans) : []),
        ...(policy.declined_framings.includes("sympathy") ? scan(DECLINED_SYMPATHY, line, permittedSpans) : []),
      ] : [];
  const outreach_hits = scoped && policy.outreach_policy === "prohibited"
    ? scan(OUTREACH_PROHIBITED_FORMS, line, permittedSpans) : [];
  const advice_hits = scoped && policy.advice_policy === "prohibited"
    ? scan(ADVICE_PROHIBITED_FORMS, line, permittedSpans) : [];

  const anyLexical = approval_hits.length || declined_framing_hits.length
    || outreach_hits.length || advice_hits.length;

  let v04_disposition: DraftRouteResult["v04_disposition"] = "base";
  let manual_review_reason: string | undefined;
  if (anyLexical) {
    v04_disposition = "block_lexical";
  } else if (policy.valence_policy === "factual_only") {
    v04_disposition = "factual_template";
  } else if (
    // the gate cannot verify compliance lexically when a declined framing or a
    // non-preserve valence is in play and nothing fired — flag for measured review.
    policy.declined_framings.length > 0 ||
    policy.valence_policy === "do_not_resolve"
  ) {
    v04_disposition = "manual_review_flag";
    manual_review_reason = policy.declined_framings.length
      ? `declined framing ${JSON.stringify(policy.declined_framings)} — lexical layer cannot certify compliance`
      : `valence do_not_resolve — lexical layer cannot certify the line held valence open`;
  }

  return {
    base_disposition: base.disposition,
    base_passes: base.passes,
    approval_hits,
    declined_framing_hits,
    outreach_hits,
    advice_hits,
    v04_disposition,
    manual_review_reason,
  };
}
