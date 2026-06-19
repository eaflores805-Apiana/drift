import { type IngestedItem } from "../data/schemas";
import { handStubbedMeaning } from "./handStubbedMeaning";
import {
  type MeaningClient,
  type ModelDerived,
  ModelDerivedSchema,
} from "./types";

/**
 * MockMeaningClient — deterministic, no network. Wraps `handStubbedMeaning`
 * and validates its output against `ModelDerivedSchema` so the mock can't
 * silently drift from the Step 3 contract.
 *
 * `prompt_version` and `model_id` distinguish mock entries from live entries
 * in the cache. Override `prompt_version` via constructor to simulate
 * prompt-version bumps (used in the cache-invalidation smoke test).
 */
export class MockMeaningClient implements MeaningClient {
  readonly id = "mock";
  readonly prompt_version: string;
  readonly model_id = "mock";

  constructor(prompt_version: string = "meaning-pass-mock-v0.1.0") {
    this.prompt_version = prompt_version;
  }

  async judge(item: IngestedItem): Promise<ModelDerived> {
    const out = handStubbedMeaning(item);
    const parsed = ModelDerivedSchema.safeParse(out);
    if (!parsed.success) {
      throw new Error(
        `MockMeaningClient output failed ModelDerived schema for ${item.id}: ${parsed.error.message}`
      );
    }
    return parsed.data;
  }
}
