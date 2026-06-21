import { z } from "zod";

// === Listener ===
export const CalendarEntrySchema = z.object({
  title: z.string(),
  when: z.string(),
});

export const ListenerSchema = z.object({
  id: z.string(),
  name: z.string(),
  location: z.string().optional(),
  interests: z.array(z.string()).default([]),
  followed_entities: z.array(z.string()).default([]),
  calendar: z.array(CalendarEntrySchema).default([]),
  closeness_map: z.record(z.string(), z.string()).default({}),
});
export type Listener = z.infer<typeof ListenerSchema>;

// === IngestedItem — Connection Point 1 (input contract per ARCHITECTURE.md) ===
export const SourceTypeSchema = z.enum([
  "friend",
  "family",
  "coworker",
  "local_org",
  "brand",
  "creator",
  "news",
  "weather",
  "calendar",
]);
export type SourceType = z.infer<typeof SourceTypeSchema>;

export const EntitySchema = z.object({
  type: z.string(),
  value: z.string(),
});
export type Entity = z.infer<typeof EntitySchema>;

export const IngestedItemSchema = z.object({
  id: z.string(),
  source_type: SourceTypeSchema,
  source_name: z.string(),
  account_id: z.string().optional(),
  // permissive on purpose: the consent gate is the enforcement point and must
  // be able to fail-closed on missing / blank / unknown values per BUILD.md.
  audience_scope: z.string(),
  timestamp: z.string(),
  expires_at: z.string().nullable().optional(),
  raw_text: z.string(),
  entities: z.array(EntitySchema).default([]),
  location: z.string().nullable().optional(),
  novelty_key: z.string(),
});
export type IngestedItem = z.infer<typeof IngestedItemSchema>;

// === Bucket + Decision — Connection Point 2 (output contract) ===
export const BucketSchema = z.enum(["drop", "ambient", "voiced", "expandable"]);
export type Bucket = z.infer<typeof BucketSchema>;

export const SafetyCheckSchema = z.object({
  passed: z.boolean(),
  grounded_claims: z.array(z.string()).default([]),
  rejected_reason: z.string().nullable().optional(),
});
export type SafetyCheck = z.infer<typeof SafetyCheckSchema>;

export const DecisionLinesSchema = z.object({
  primary: z.string().optional(),
  safe_alternate: z.string().optional(),
  expanded: z.string().optional(),
});
export type DecisionLines = z.infer<typeof DecisionLinesSchema>;

/**
 * Route assigned by the structural classifier (Layer 1 stage-4 of the
 * meta-spec). Empty for consent-dropped and missing-meaning decisions
 * (the classifier doesn't run). See `playground/src/scoring/routes.ts`.
 */
export const RouteSchema = z.enum(["silent", "highlight", "doorway", "utility"]);
export type RouteValue = z.infer<typeof RouteSchema>;

export const DecisionSchema = z.object({
  item_id: z.string(),
  bucket: BucketSchema,
  score: z.number(),
  score_breakdown: z.record(z.string(), z.number()),
  route: RouteSchema.optional(),
  reason: z.string(),
  lines: DecisionLinesSchema.optional(),
  allowed_claims: z.array(z.string()).default([]),
  forbidden_inferences: z.array(z.string()).default([]),
  safety_check: SafetyCheckSchema,
});
export type Decision = z.infer<typeof DecisionSchema>;
