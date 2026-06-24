/**
 * v0.4.0-DRAFT augmented packets — the REVIEWABLE ARTIFACT for the checkpoint.
 * NON-MERGED DRAFT. Imports the frozen GOLD_PACKETS unchanged and layers the
 * decomposed editorial-policy fields (change set v0.1.1 §2) on top.
 *
 * Tier defaults come from `defaultPolicyFor`. Everything that DEVIATES is here in
 * POLICY_OVERRIDES — keyed by item_id, each with the exact source EVIDENCE SPAN
 * that justifies it. preflightV04 verifies every span actually occurs in the
 * audit post (auditable-boundary contract). `review_note` marks the judgment
 * calls PO/TL should confirm.
 *
 * Non-default items (10): G28 G30 G32 G38 G39 G40 G46 G47 G48 G49.
 * Everything else takes the tier default (no boundary the source did not state).
 */
import { GOLD_PACKETS } from "./gold-packets";
import {
  type PacketV04, type EditorialPolicy, defaultPolicyFor,
} from "../src/safety/draft/packet-v0.4-draft";

type Override = Partial<EditorialPolicy>;

// All 10 non-default annotations were reviewed by PO/TL this cycle, so each carries
// extraction_status: "verified_complete". The 40 tier-default packets keep the
// default "unverified" — the honest flag that no human affirmed those have no
// boundary (the under-extraction surface that becomes load-bearing on a lift).
const POLICY_OVERRIDES: Record<string, Override> = {
  // ambiguous
  G28: {
    outreach_policy: "prohibited",
    outreach_evidence: ["not ready to talk about it yet"],
    extraction_status: "verified_complete",
  },
  // G30 RESOLVED (PO): "send memes ... please" is an explicit imperative REQUEST →
  // source_requested, scoped to the exact channel; the question-ban is the SEPARATE
  // heavy channel (two-channel decomposition). The earlier [sympathy] tag is DROPPED
  // (tone inference, no explicit decline).
  G30: {
    outreach_policy: "source_requested",
    outreach_scope: "specified_only",
    requested_response: "memes",
    outreach_evidence: ["send memes"],
    questions_policy: "prohibited",
    questions_evidence: ["zero questions"],
    extraction_status: "verified_complete",
  },
  G32: {
    outreach_policy: "prohibited",
    outreach_evidence: ["please don't message"],
    extraction_status: "verified_complete",
  },
  // sensitive
  G38: {
    outreach_policy: "prohibited",
    outreach_evidence: ["need quiet for a few days"],
    extraction_status: "verified_complete",
    review_note: "source also explicitly declined advice (‘don't send fixes’); advice_policy stays prohibited (the default) — recording the explicit decline here.",
  },
  G39: {
    outreach_policy: "prohibited",
    outreach_evidence: ["taking the weekend offline"],
    extraction_status: "verified_complete",
  },
  G40: {
    valence_policy: "factual_only",
    declined_framings: ["celebration"],
    declined_framing_evidence: ["not posting to celebrate"],
    outreach_policy: "prohibited",
    outreach_evidence: ["don't bring it up"],
    extraction_status: "verified_complete",
    review_note: "the canonical Rule-2 case. factual_only because they declined celebration AND said ‘just exhausted’. Name-privacy is held by existing forbidden_inferences.",
  },
  // grave (implied)
  G46: {
    outreach_policy: "prohibited",
    outreach_evidence: ["not ready to talk about it"],
    extraction_status: "verified_complete",
  },
  // G47 RESOLVED (TL): explicit specific request honored, but scoped to ONLY the
  // poster's channel — the mirror of G40 (G40 imposed a declined framing; refusing
  // this would suppress a requested one). declined_framings:[sympathy] CONFIRMED via
  // "act normal" (= no performative sympathy; plain acknowledgment still allowed).
  // questions:prohibited is the separate heavy channel. Does NOT lift the v0 blanket;
  // records the correct narrow permission for a future consent-gated lift.
  G47: {
    valence_policy: "preserve_source",
    declined_framings: ["sympathy"],
    declined_framing_evidence: ["act normal"],
    outreach_policy: "source_requested",
    outreach_scope: "specified_only",
    requested_response: "dog pictures",
    outreach_evidence: ["send dog pics"],
    questions_policy: "prohibited",
    questions_evidence: ["please don't ask"],
    extraction_status: "verified_complete",
    review_note: "TL ruling 2026-06-23: honor the specific request, scoped specified_only. declined sympathy = no performative pity, plain acknowledgment OK (court-stenographer scalpel). Future-lift spec: dog pics only, no questions, no general reach-out, no advice.",
  },
  G48: {
    outreach_policy: "source_requested",
    outreach_scope: "specified_only",
    requested_response: "love and prayers",
    outreach_evidence: ["love and prayers"],
    extraction_status: "verified_complete",
    review_note: "RESOLVED (PO): poster's OWN words AND an explicit request — sympathy welcomed (declined_framings empty), outreach source_requested scoped to the named channel.",
  },
  G49: {
    outreach_policy: "prohibited",
    outreach_evidence: ["don't call tonight"],
    extraction_status: "verified_complete",
  },
};

export const GOLD_PACKETS_V04: PacketV04[] = GOLD_PACKETS.map((p) => {
  const base = defaultPolicyFor(p);
  const ov = POLICY_OVERRIDES[p.item_id] ?? {};
  return { ...p, ...base, ...ov } as PacketV04;
});

export const DRY_RUN_PACKETS_V04: PacketV04[] = GOLD_PACKETS_V04.filter((p) => p.dry);
