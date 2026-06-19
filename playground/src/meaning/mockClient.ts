import { type IngestedItem } from "../data/schemas";
import { handStubbedMeaning } from "./handStubbedMeaning";
import {
  type MeaningClient,
  type ModelDerived,
  ModelDerivedSchema,
} from "./types";

/**
 * MockMeaningClient — deterministic, no network. Wraps `handStubbedMeaning`
 * and validates the output against `ModelDerivedSchema` so the mock can't
 * silently drift from the Step 3 contract.
 *
 * `prompt_version` defaults to a mock identifier so it doesn't collide with
 * the real prompt's version key in the cache. Override via constructor to
 * simulate `prompt_version` bumps (used in the cache-invalidation smoke test).
 */
export class MockMeaningClient implements MeaningClient {
  readonly id = "mock";
  readonly prompt_version: string;

  constructor(prompt_version: string = "meaning-pass-mock-v0.1.0") {
    this.prompt_version = prompt_version;
  }

  async judge(item: IngestedItem): Promise<ModelDerived> {
    const out = handStubbedMeaning(item);
    // Validate against the Step 3 contract — catches mock drift in dev.
    const parsed = ModelDerivedSchema.safeParse(out);
    if (!parsed.success) {
      throw new Error(
        `MockMeaningClient output failed ModelDerived schema for ${item.id}: ${parsed.error.message}`
      );
    }
    return parsed.data;
  }
}
