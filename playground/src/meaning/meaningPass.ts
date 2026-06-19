import { type IngestedItem } from "../data/schemas";
import { type MeaningCache } from "./cache";
import { type MeaningClient, type ModelDerived } from "./types";

/**
 * Meaning-pass orchestration. For each item: check cache → call client →
 * write back to cache. Cache key participates in `prompt_version`, so
 * bumping the client's version forces a recompute.
 *
 * Sliders do NOT call this — meaning runs once on load (and again when
 * the client changes), then scoring consumes the cached map. That's the
 * "cached meaning pass" property from BUILD.md Step 3.
 */

export async function meaningFor(
  item: IngestedItem,
  client: MeaningClient,
  cache: MeaningCache
): Promise<ModelDerived> {
  const cached = cache.get(item.id, client.prompt_version);
  if (cached) return cached;
  const judged = await client.judge(item);
  cache.set(item.id, client.prompt_version, judged);
  return judged;
}

export async function meaningBatch(
  items: IngestedItem[],
  client: MeaningClient,
  cache: MeaningCache
): Promise<Map<string, ModelDerived>> {
  const out = new Map<string, ModelDerived>();
  for (const item of items) {
    out.set(item.id, await meaningFor(item, client, cache));
  }
  return out;
}
