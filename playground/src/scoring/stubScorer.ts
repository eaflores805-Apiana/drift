import { type Bucket, type Decision, type IngestedItem } from "../data/schemas";
import { consentGate } from "../safety/consentGate";

/**
 * Step 1 stub scorer. NOT real scoring.
 *
 * Runs the consent gate first; dropped items get bucket=drop with the gate's
 * reason surfaced. Passing items are distributed deterministically across
 * ambient / voiced / expandable by id digit, so all four columns get
 * population for visual verification.
 *
 * Real scoring lands in Step 2; this stub will be swapped out.
 * Makes ZERO model calls.
 */
export function stubScore(item: IngestedItem): Decision {
  const consent = consentGate(item);
  if (!consent.passes) {
    return {
      item_id: item.id,
      bucket: "drop",
      score: 0,
      score_breakdown: {},
      reason: `consent gate drop: ${consent.reason}`,
      allowed_claims: [],
      forbidden_inferences: [],
      safety_check: {
        passed: false,
        grounded_claims: [],
        rejected_reason: consent.reason,
      },
    };
  }

  return {
    item_id: item.id,
    bucket: stubBucket(item.id),
    score: 0.5,
    score_breakdown: { stub: 0.5 },
    reason: "stub scorer (Step 1) — placeholder, not real scoring",
    allowed_claims: [],
    forbidden_inferences: [],
    safety_check: {
      passed: true,
      grounded_claims: [],
      rejected_reason: null,
    },
  };
}

function stubBucket(id: string): Exclude<Bucket, "drop"> {
  const m = id.match(/(\d+)$/);
  const n = m ? parseInt(m[1], 10) : id.charCodeAt(0);
  const slot = n % 3;
  if (slot === 0) return "ambient";
  if (slot === 1) return "voiced";
  return "expandable";
}
