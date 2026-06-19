import { z } from "zod";
import { type IngestedItem } from "../data/schemas";

/**
 * ModelDerived — the strict Step 3 contract.
 *
 * Mirrors the output schema of `playground/meaning-pass-v1.md`
 * (`prompt_version: meaning-pass-v0.1.0`) so the mock client returns
 * the same shape the real client will produce. Step 3A validates mock
 * output against this schema before handing it to the cache.
 */

export const ContextCandidateSchema = z.object({
  context: z.string(),
  allowed_use: z.enum(["world_texture", "direct_context", "do_not_use"]),
  reason: z.string(),
});
export type ContextCandidate = z.infer<typeof ContextCandidateSchema>;

export const RationaleSchema = z.object({
  category: z.string(),
  magnitude: z.string(),
  sensitivity: z.string(),
  confidence: z.string(),
  context_candidates: z.string(),
  connection_read: z.string(),
});
export type Rationale = z.infer<typeof RationaleSchema>;

/**
 * Sensitivity tier — `low | medium | high`, aligned with `meaning-pass-v1.md`.
 *
 * Important per the 2026-06-19 team ruling: **"low" does not mean "zero risk
 * forever".** It means the item is normal to speak about (no special restraint
 * around the topic), but the rest of the safety machinery still applies to
 * every item — consent gate, claim-grounding, proximity-routes-behavior, the
 * glad-test. There is no "none" tier; the previous `none|low|high` schema
 * was widened to match the prompt.
 */
export const SensitivitySchema = z.enum(["low", "medium", "high"]);
export type Sensitivity = z.infer<typeof SensitivitySchema>;

export const ModelDerivedSchema = z.object({
  category: z.string(),
  magnitude: z.number().min(0).max(1),
  sensitivity: SensitivitySchema,
  confidence: z.number().min(0).max(1),
  context_candidates: z.array(ContextCandidateSchema),
  connection_read: z.string(),
  rationale: RationaleSchema,
  allowed_claims: z.array(z.string()),
  forbidden_inferences: z.array(z.string()),
});
export type ModelDerived = z.infer<typeof ModelDerivedSchema>;

/**
 * MeaningClient — the abstract surface both `MockMeaningClient` (Step 3A)
 * and `RealMeaningClient` (Step 3B, gated) implement. The cache is keyed
 * by `{ item_id, client.prompt_version }`, so bumping `prompt_version`
 * invalidates the cache.
 */
export interface MeaningClient {
  readonly id: string;             // human-readable identifier for logging
  readonly prompt_version: string; // participates in the cache key
  judge(item: IngestedItem): Promise<ModelDerived>;
}
