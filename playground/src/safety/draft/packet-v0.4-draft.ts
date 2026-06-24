/**
 * v0.4.0-DRAFT packet extension — Editorial-Restraint change set v0.1.1, §2.
 * NON-MERGED DRAFT. Frozen `packet.ts` / v0.3.2 / box8-v0 are NOT touched.
 *
 * Adds the four DECOMPOSED editorial-permission fields (TL correction 2 — no two
 * fields govern the same concept) plus their EVIDENCE SPANS (TL: a claimed
 * boundary that points at no source span is not a real boundary). The asymmetry
 * (TL): a populated field adds caution; an EMPTY field is NEVER read as "no
 * boundary exists" — under-extraction is the dangerous direction and becomes
 * load-bearing the moment these fields are used to *lift* the grave/sensitive
 * blanket.
 *
 * Pure string/policy work — zero model calls.
 */
import type { Packet } from "../packet";
import { tierOf } from "../packet";

export type ValencePolicy =
  | "preserve_source"        // report the source's own framing, add no coloring
  | "do_not_resolve"         // ambiguous-tier contract: hold valence open
  | "factual_only"           // strictest: state the fact, no coloring at all
  | "celebratory_allowed"    // warmth/celebration permitted (clear good news)
  | "gentle_negative_allowed";
export type DeclinedFraming = "celebration" | "sympathy";
export type OutreachPolicy = "route_permitted" | "source_requested" | "prohibited";
export type AdvicePolicy = "source_requested" | "prohibited";
// TL additions (G47 ruling, generalized to §2 schema):
/** how WIDE a source_requested permission is — never wider than the poster made it. */
export type OutreachScope = "specified_only" | "broad";
/** the heavy channel (questions/probing), decomposed OUT of outreach_policy. */
export type QuestionsPolicy = "route_permitted" | "prohibited";
/** affirmative assertion that boundary extraction was CHECKED — converts an empty
 *  field from "maybe-missed / maybe-absent" into "verified-absent". The guard for
 *  the under-extraction risk that becomes load-bearing on any future blanket lift. */
export type ExtractionStatus = "verified_complete" | "unverified";

export interface EditorialPolicy {
  valence_policy: ValencePolicy;
  declined_framings: DeclinedFraming[];
  declined_framing_evidence: string[];
  outreach_policy: OutreachPolicy;
  outreach_evidence: string[];
  /** required when outreach_policy === source_requested (TL): scope the permission. */
  outreach_scope?: OutreachScope;
  /** the named channel the poster opened (e.g. "dog pictures"). Required when source_requested. */
  requested_response?: string;
  /** the heavy channel, decomposed from outreach_policy (TL two-channel finding). */
  questions_policy: QuestionsPolicy;
  questions_evidence: string[];
  advice_policy: AdvicePolicy;
  advice_evidence: string[];
  /** verified_complete only after a human (TL/PO) confirmed the extraction. */
  extraction_status: ExtractionStatus;
  /** CS flag where the annotation is a judgment call PO/TL should confirm. */
  review_note?: string;
}

export type PacketV04 = Packet & EditorialPolicy;

/**
 * Tier defaults. These are the values that need NO evidence span (the safe
 * baseline). Anything that DEVIATES from the default is a non-default policy and
 * MUST carry evidence (enforced by preflightV04).
 *
 * Defaults are chosen conservative-by-tier:
 *  - advice is ALWAYS prohibited by default (never volunteer advice); only
 *    source_requested is non-default (and needs evidence).
 *  - outreach defaults to route_permitted (the route decides); prohibited /
 *    source_requested are non-default.
 *  - valence default tracks the tier's airing contract.
 */
export function defaultPolicyFor(p: Packet): EditorialPolicy {
  const tier = tierOf(p);
  let valence_policy: ValencePolicy;
  switch (p.category) {
    case "celebration": valence_policy = "celebratory_allowed"; break;
    case "ambiguous":   valence_policy = "do_not_resolve"; break;
    default:
      valence_policy = tier === "low" ? "preserve_source"
        : "preserve_source"; // sensitive/grave default to preserve_source unless declined
  }
  return {
    valence_policy,
    declined_framings: [],
    declined_framing_evidence: [],
    outreach_policy: "route_permitted",
    outreach_evidence: [],
    questions_policy: "route_permitted",
    questions_evidence: [],
    advice_policy: "prohibited",
    advice_evidence: [],
    // default is UNVERIFIED: an empty boundary field is not trusted as "absent"
    // until a human affirms it. verified_complete is set only on review.
    extraction_status: "unverified",
  };
}

export function isDefaultPolicy(p: Packet, e: EditorialPolicy): boolean {
  const d = defaultPolicyFor(p);
  return e.valence_policy === d.valence_policy
    && e.declined_framings.length === 0
    && e.outreach_policy === "route_permitted"
    && e.advice_policy === "prohibited";
}

export interface PolicyPreflightResult {
  pass: boolean;
  rejects: string[];
}

/**
 * v0.4-draft policy preflight (the auditable-boundary check). Runs alongside the
 * frozen preflight. Enforces TL's evidence-span contract:
 *   - every NON-DEFAULT policy carries ≥1 evidence span; and
 *   - every evidence span actually occurs in the audit post (so the Meaning Pass
 *     can't manufacture an unauditable boundary).
 * Reading the audit post here is fine — this is code, not the model.
 */
export function preflightV04(p: PacketV04): PolicyPreflightResult {
  const rejects: string[] = [];
  const post = p.audit_raw_post.toLowerCase();
  const spanExists = (s: string) => post.includes(s.toLowerCase().trim());

  // declined framings → need evidence, and evidence must be in the post
  if (p.declined_framings.length && p.declined_framing_evidence.length === 0) {
    rejects.push(`declined_framings ${JSON.stringify(p.declined_framings)} but no evidence span`);
  }
  for (const s of p.declined_framing_evidence) {
    if (!spanExists(s)) rejects.push(`declined_framing_evidence not found in source: "${s}"`);
  }
  // outreach prohibited / source_requested → non-default, need evidence
  if (p.outreach_policy !== "route_permitted" && p.outreach_evidence.length === 0) {
    rejects.push(`outreach_policy ${p.outreach_policy} but no evidence span`);
  }
  for (const s of p.outreach_evidence) {
    if (!spanExists(s)) rejects.push(`outreach_evidence not found in source: "${s}"`);
  }
  // TL rule: source_requested must be SCOPED to exactly what the poster opened —
  // an explicit scope + named channel, so the permission is never wider than the request.
  if (p.outreach_policy === "source_requested") {
    if (!p.outreach_scope) rejects.push(`outreach_policy source_requested but no outreach_scope`);
    if (!p.requested_response || !p.requested_response.trim()) {
      rejects.push(`outreach_policy source_requested but no requested_response (named channel)`);
    }
    const tier = tierOf(p);
    if ((tier === "sensitive" || tier === "grave") && p.outreach_scope !== "specified_only") {
      rejects.push(`source_requested on ${tier} item must be scope=specified_only (got ${p.outreach_scope})`);
    }
  }
  // questions prohibited → the heavy channel, needs its own evidence span
  if (p.questions_policy === "prohibited" && p.questions_evidence.length === 0) {
    rejects.push(`questions_policy prohibited but no evidence span`);
  }
  for (const s of p.questions_evidence) {
    if (!spanExists(s)) rejects.push(`questions_evidence not found in source: "${s}"`);
  }
  // advice source_requested → non-default, need evidence (prohibited is default)
  if (p.advice_policy === "source_requested" && p.advice_evidence.length === 0) {
    rejects.push(`advice_policy source_requested but no evidence span`);
  }
  for (const s of p.advice_evidence) {
    if (!spanExists(s)) rejects.push(`advice_evidence not found in source: "${s}"`);
  }
  return { pass: rejects.length === 0, rejects };
}

/**
 * MODEL-FACING render — the policy block the model actually sees (appended after
 * BOUNDARIES). DELIBERATELY OMITS all *_evidence spans and extraction_status:
 * evidence spans are source fragments and stay code/audit-side (the load-bearing
 * mapping — the model gets ALLOWED CLAIMS + PERMITTED SPANS + policy DECISIONS,
 * never raw source text it wasn't permitted). extraction_status is an audit/meta
 * field, not an instruction. (Design call flagged for the §2 review.)
 */
export function renderEditorialPolicyForModel(p: PacketV04): string {
  const lines = [
    `VALENCE POLICY:       ${p.valence_policy}`,
    `DECLINED FRAMINGS:    ${p.declined_framings.length ? p.declined_framings.join(", ") : "none"}`,
    `OUTREACH POLICY:      ${p.outreach_policy}`,
  ];
  if (p.outreach_policy === "source_requested") {
    lines.push(`OUTREACH SCOPE:       ${p.outreach_scope ?? "specified_only"}`);
    lines.push(`REQUESTED RESPONSE:   ${p.requested_response ?? "none"}`);
  }
  lines.push(`QUESTIONS:            ${p.questions_policy}`);
  lines.push(`ADVICE POLICY:        ${p.advice_policy}`);
  return lines.join("\n");
}

/** FULL render incl. evidence + extraction_status — for AUDIT / checkpoint display only, never the model. */
export function renderEditorialPolicy(p: PacketV04): string {
  const j = (xs: string[]) => (xs.length ? xs.map((s) => `"${s}"`).join("; ") : "none");
  return [
    `VALENCE POLICY:       ${p.valence_policy}`,
    `DECLINED FRAMINGS:    ${p.declined_framings.length ? p.declined_framings.join(", ") : "none"}`,
    `DECLINED FRAMING EVIDENCE: ${j(p.declined_framing_evidence)}`,
    `OUTREACH POLICY:      ${p.outreach_policy}`,
    `OUTREACH SCOPE:       ${p.outreach_scope ?? "n/a"}`,
    `REQUESTED RESPONSE:   ${p.requested_response ?? "none"}`,
    `OUTREACH EVIDENCE:    ${j(p.outreach_evidence)}`,
    `QUESTIONS:            ${p.questions_policy}`,
    `QUESTIONS EVIDENCE:   ${j(p.questions_evidence)}`,
    `ADVICE POLICY:        ${p.advice_policy}`,
    `ADVICE EVIDENCE:      ${j(p.advice_evidence)}`,
    `POLICY EXTRACTION STATUS: ${p.extraction_status}`,
  ].join("\n");
}
