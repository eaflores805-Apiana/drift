import { type ModelDerived } from "./types";

export type CacheStats = {
  size: number;
  hits: number;
  misses: number;
};

/**
 * In-memory meaning cache keyed by a composed `key: string`.
 *
 * Per team ruling 2026-06-19 the key shape is:
 *   `${item_id}@@${prompt_version}@@${model_id}@@${content_hash}`
 * composed by `keyFor.cacheKeyFor(item, client)`. The cache itself is
 * key-shape agnostic — it just stores by string.
 *
 * `DiskMeaningCache` (Node only) implements the same `MeaningCacheLike`
 * surface and writes to disk so judgments survive process restarts.
 */
export interface MeaningCacheLike {
  get(key: string): ModelDerived | undefined;
  set(key: string, value: ModelDerived): void;
  has(key: string): boolean;
  stats(): CacheStats;
  resetStats(): void;
}

export class MeaningCache implements MeaningCacheLike {
  private store = new Map<string, ModelDerived>();
  private hits = 0;
  private misses = 0;

  get(key: string): ModelDerived | undefined {
    const v = this.store.get(key);
    if (v) this.hits++;
    else this.misses++;
    return v;
  }

  set(key: string, value: ModelDerived): void {
    this.store.set(key, value);
  }

  has(key: string): boolean {
    return this.store.has(key);
  }

  stats(): CacheStats {
    return { size: this.store.size, hits: this.hits, misses: this.misses };
  }

  resetStats(): void {
    this.hits = 0;
    this.misses = 0;
  }
}
