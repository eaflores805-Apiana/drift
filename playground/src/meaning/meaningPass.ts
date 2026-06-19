import { type IngestedItem } from "../data/schemas";
import { type MeaningCacheLike } from "./cache";
import { cacheKeyFor } from "./keyFor";
import { type MeaningClient, type ModelDerived } from "./types";

/**
 * Meaning-pass orchestration. For each item: compose the 4-part key →
 * check cache → call client → write back to cache. Per team ruling,
 * the cache key participates in `prompt_version`, `model_id`, and a
 * `content_hash`, so any of those changing forces a recompute.
 *
 * Sliders do NOT call this — meaning runs once on load (and again when
 * the client changes), then scoring consumes the cached map. That's the
 * "cached meaning pass" property from BUILD.md Step 3.
 *
 * Note: if `client.judge()` throws, `set()` is NOT called — bad judgments
 * are never cached (Step 3B requirement).
 */

export async function meaningFor(
  item: IngestedItem,
  client: MeaningClient,
  cache: MeaningCacheLike
): Promise<ModelDerived> {
  const key = await cacheKeyFor(item, client);
  const cached = cache.get(key);
  if (cached) return cached;
  const judged = await client.judge(item);
  cache.set(key, judged);
  return judged;
}

export async function meaningBatch(
  items: IngestedItem[],
  client: MeaningClient,
  cache: MeaningCacheLike
): Promise<Map<string, ModelDerived>> {
  const out = new Map<string, ModelDerived>();
  for (const item of items) {
    out.set(item.id, await meaningFor(item, client, cache));
  }
  return out;
}
