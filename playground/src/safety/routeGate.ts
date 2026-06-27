/**
 * Box 8b — the route / treatment gate (v0).
 *
 * Box 8a (groundingGate) answers: "did the DJ invent names/numbers/cues?"
 * Box 8b answers the question 8a CANNOT: **even if every word is grounded, is
 * this allowed to be SPOKEN under the route, consent, privacy and sensitivity
 * policy?**
 *
 * The v0 corpus proved 8b is not optional: lines like "Nora was real" (a
 * stillbirth name) or "if you know who posted that — you know what to do" (a
 * de-anonymizing nudge) pass lexical grounding and must still never air.
 *
 * Core stance (deliberately conservative for v0):
 *   - low / ambiguous routes: a deny-rule fires ⇒ block; otherwise air.
 *   - sensitive / grave / minor routes: freeform prose is NEVER airable. A
 *     lexical pass is necessary but never sufficient. The route emits a fixed
 *     SAFE TEMPLATE, or SILENCE when the source asked for quiet/no-contact.
 *     Specific deny-rules still run there — for audit, and so a future v1 can
 *     relax the blanket block once it's trusted.
 *
 * Zero model calls — pure pattern policy, mirroring the other gates.
 */

export type RouteTier = "low" | "ambiguous" | "sensitive" | "grave" | "minor";

export type Disposition = "air" | "safe_template" | "silence";

export interface RouteGateResult {
  /** True only when the freeform line may air as-is under route policy. */
  passes: boolean;
  disposition: Disposition;
  /** Policy rules that fired (audit trail; may be non-empty even when blocked structurally). */
  rules: { id: string; span: string }[];
}

interface Rule {
  id: string;
  needle: RegExp;
  /** If the SOURCE also matches this, the rule does not fire (e.g. a direct quote / explicit ask). */
  sourceException?: RegExp;
}

/** The source asked to be left alone — broadcasting at all is the violation. */
export const QUIET_REQUEST =
  /\b(don'?t (call|text|message|ask|reach|talk)|give (us|me) (room|space|quiet|time)|need (quiet|space|room|time)|not answering|not ready to talk|please.*(space|room|quiet|privacy)|just (need|want) quiet|zero questions|no questions)\b/i;

/** De-anonymization: pointing listeners at who posted it. */
const DEANON: Rule[] = [
  { id: "deanon_if_you_know", needle: /\bif you know who (posted|sent|wrote|that is|this is)\b/i },
  { id: "deanon_you_know_what", needle: /\byou know what to do\b/i },
  { id: "deanon_you_know_who", needle: /\byou know who (you are|they are|posted)\b/i },
];

/** Listener mobilization: directing the audience to act on a private person. */
const MOBILIZE: Rule[] = [
  // directive "show up for them" etc. — not benign idiom ("a long time to show up").
  { id: "mobilize_show_up", needle: /\b(go )?show up (for|tonight|today)\b|\b(you should|let'?s|please) show up\b/i, sourceException: /\b(show up|come by|stop by|bring|come thirsty|join us)\b/i },
  { id: "mobilize_go_to", needle: /\bgo (find|check on|see|be with)\b/i },
  { id: "mobilize_reach_out", needle: /\breach out to (them|her|him)\b/i },
  { id: "mobilize_they_need", needle: /\bthey (need|needs) to hear from you\b/i },
  { id: "mobilize_know_what", needle: /\byou know what to do\b/i },
];

/** Motive invention: claiming WHY they posted, or that posting = consent to amplify. */
const MOTIVE: Rule[] = [
  { id: "motive_wanted_witnessed", needle: /\b(wanted|want) it (witnessed|seen|heard|known)\b/i },
  { id: "motive_consider_witnessed", needle: /\bconsider it witnessed\b/i },
  { id: "motive_posted_so", needle: /\bposted (it|this),? so (they|she|he)\b/i },
  { id: "motive_they_wanted", needle: /\bthey wanted (you|us) to (see|know|witness|hear)\b/i },
];

/** Battle/valor framing applied to illness — only if the source itself said it. */
const BATTLE: Rule[] = [
  {
    id: "battle_framing",
    needle: /\b(brave|bravely|battle|battling|fight|fighting|warrior|courageous|beat this|kick(ing)? cancer)\b/i,
    sourceException: /\b(brave|battle|fight|fighting|warrior)\b/i,
  },
];

/**
 * Resolving an explicitly ambiguous valence into "good"/"bad".
 * NOTE (CS #5C, 2026-06-27): valence vocabulary widened to catch the obvious
 * paraphrases the keyword guard used to miss ("hard goodbye", "sorry to hear").
 * Proposed hardening — additive/fail-safer, flagged for Eng review. It remains
 * keyword-based: subtler paraphrase ("things are looking up for them") still
 * slips and needs a v1 model/judge. See line-valence-grave-fixtures.ts known gaps.
 */
const VALENCE: Rule[] = [
  { id: "valence_congrats", needle: /\b(congrats|congratulations|so happy for|amazing news|great news|big congrats|so excited for (them|her|him)|what (great|wonderful) news)\b/i },
  { id: "valence_sorry", needle: /\b(so sorry|condolences|that's awful|heartbreaking|(hard|tough|sad) goodbye|sorry to hear|so sad to see|thinking of (them|her|him) (in this|during this))\b/i },
];

function fire(rules: Rule[], line: string, source: string): { id: string; span: string }[] {
  const hits: { id: string; span: string }[] = [];
  for (const r of rules) {
    if (r.sourceException && r.sourceException.test(source)) continue;
    const m = line.match(r.needle);
    if (m) hits.push({ id: r.id, span: m[0] });
  }
  return hits;
}

/**
 * Apply route/treatment policy to an already-lexically-grounded line.
 * `source` is the original post (lets "unless the source asked / quoted" exceptions work).
 */
export function routeGate(line: string, tier: RouteTier, source: string): RouteGateResult {
  const quiet = QUIET_REQUEST.test(source);

  // Sensitive / grave / minor: freeform is categorically not airable in v0.
  if (tier === "sensitive" || tier === "grave" || tier === "minor") {
    // run deny-rules anyway, for the audit trail
    const rules = [
      ...fire(DEANON, line, source),
      ...fire(MOBILIZE, line, source),
      ...fire(MOTIVE, line, source),
      ...fire(BATTLE, line, source),
    ];
    return {
      passes: false,
      disposition: quiet ? "silence" : "safe_template",
      rules,
    };
  }

  // Ambiguous: respect the unresolved valence / no motive inference.
  if (tier === "ambiguous") {
    const rules = [
      ...fire(MOTIVE, line, source),
      ...fire(VALENCE, line, source),
      ...fire(DEANON, line, source),
      ...fire(MOBILIZE, line, source),
    ];
    if (rules.length) return { passes: false, disposition: quiet ? "silence" : "safe_template", rules };
    return { passes: true, disposition: "air", rules: [] };
  }

  // Low risk: only the universal abuse rules apply.
  const rules = [...fire(DEANON, line, source), ...fire(MOBILIZE, line, source)];
  if (rules.length) return { passes: false, disposition: "safe_template", rules };
  return { passes: true, disposition: "air", rules: [] };
}
