import { type IngestedItem } from "../data/schemas";
import { type MeaningClient } from "./types";

/**
 * Cache key composition per team ruling 2026-06-19:
 *   `${item_id}@@${prompt_version}@@${model_id}@@${content_hash}`
 *
 * The four parts answer "is this cache entry still valid for this item, this
 * prompt, this model, and the *current* content of the item?"
 *
 * `content_hash` = SHA-256 (hex) of canonical JSON of the prompt-relevant
 * fields. If any of those mutate, the hash changes and the entry misses,
 * forcing a fresh judgment. Works in both Node 18+ and modern browsers via
 * the Web Crypto API.
 */

const CANONICAL_FIELDS: ReadonlyArray<keyof IngestedItem> = [
  "raw_text",
  "entities",
  "location",
  "audience_scope",
  "timestamp",
  "expires_at",
];

export async function contentHashOf(item: IngestedItem): Promise<string> {
  const canonical: Record<string, unknown> = {};
  for (const k of CANONICAL_FIELDS) {
    const v = (item as Record<string, unknown>)[k];
    canonical[k] = v === undefined ? null : v;
  }
  const serialized = JSON.stringify(canonical);
  const buf = new TextEncoder().encode(serialized);
  const digest = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function cacheKeyFor(
  item: IngestedItem,
  client: MeaningClient
): Promise<string> {
  const hash = await contentHashOf(item);
  return `${item.id}@@${client.prompt_version}@@${client.model_id}@@${hash}`;
}
