import { type ModelDerived } from "./types";

export type CacheStats = {
  size: number;
  hits: number;
  misses: number;
};

/**
 * In-memory meaning cache keyed by `{item_id, prompt_version}`.
 *
 * Bumping `prompt_version` on the client invalidates entries — the new
 * key won't match any existing entry, so the next lookup is a miss
 * and the new judgment is computed and stored.
 *
 * Step 3A: in-memory only. Step 3B will introduce a disk-backed cache
 * (location TBD via team approval) so meaning passes survive restarts.
 */
export class MeaningCache {
  private store = new Map<string, ModelDerived>();
  private hits = 0;
  private misses = 0;

  get(item_id: string, prompt_version: string): ModelDerived | undefined {
    const v = this.store.get(this.key(item_id, prompt_version));
    if (v) this.hits++;
    else this.misses++;
    return v;
  }

  set(item_id: string, prompt_version: string, value: ModelDerived): void {
    this.store.set(this.key(item_id, prompt_version), value);
  }

  has(item_id: string, prompt_version: string): boolean {
    return this.store.has(this.key(item_id, prompt_version));
  }

  stats(): CacheStats {
    return { size: this.store.size, hits: this.hits, misses: this.misses };
  }

  resetStats(): void {
    this.hits = 0;
    this.misses = 0;
  }

  private key(item_id: string, prompt_version: string): string {
    return `${item_id}@@${prompt_version}`;
  }
}
