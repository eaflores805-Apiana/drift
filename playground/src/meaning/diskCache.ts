import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { type CacheStats, type MeaningCacheLike } from "./cache";
import { type ModelDerived, ModelDerivedSchema } from "./types";

/**
 * Disk-backed meaning cache (Node only).
 *
 * One file per entry. Filename = SHA-256 hex of the composed cache key, so
 * filenames are filesystem-safe regardless of how exotic the key gets. Each
 * file is human-readable JSON for postmortem inspection.
 *
 * Per team ruling 2026-06-19: gitignored location (default
 * `playground/.meaning-cache/`). Reads from disk on lookup; writes through
 * on set. Survives process restarts so `npm run meaning:live` results don't
 * get re-billed on the next CLI run.
 */
type DiskEntry = {
  key: string;
  judged_at: string;
  model_response: ModelDerived;
};

export class DiskMeaningCache implements MeaningCacheLike {
  private hits = 0;
  private misses = 0;

  constructor(private dir: string) {
    mkdirSync(this.dir, { recursive: true });
  }

  get(key: string): ModelDerived | undefined {
    const file = this.fileFor(key);
    if (!existsSync(file)) {
      this.misses++;
      return undefined;
    }
    try {
      const raw = JSON.parse(readFileSync(file, "utf-8")) as DiskEntry;
      const parsed = ModelDerivedSchema.safeParse(raw.model_response);
      if (!parsed.success) {
        // Bad cached entry — treat as miss so the caller refreshes.
        this.misses++;
        return undefined;
      }
      this.hits++;
      return parsed.data;
    } catch {
      this.misses++;
      return undefined;
    }
  }

  set(key: string, value: ModelDerived): void {
    const entry: DiskEntry = {
      key,
      judged_at: new Date().toISOString(),
      model_response: value,
    };
    writeFileSync(this.fileFor(key), JSON.stringify(entry, null, 2), "utf-8");
  }

  has(key: string): boolean {
    return existsSync(this.fileFor(key));
  }

  stats(): CacheStats {
    const size = existsSync(this.dir)
      ? readdirSync(this.dir).filter((f) => f.endsWith(".json")).length
      : 0;
    return { size, hits: this.hits, misses: this.misses };
  }

  resetStats(): void {
    this.hits = 0;
    this.misses = 0;
  }

  private fileFor(key: string): string {
    const hex = createHash("sha256").update(key).digest("hex");
    return join(this.dir, `${hex}.json`);
  }
}
