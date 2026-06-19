import { type IngestedItem } from "../data/schemas";
import { type MeaningClient, type ModelDerived } from "./types";

/**
 * RealMeaningClient — the future Step 3B path. EXISTS, but THROWS on call.
 *
 * Step 3A is plumbing only. Live API calls require explicit team approval
 * for: `.env` strategy, API key handling, model selection, cost cap,
 * disk-backed cache location, retry/validation behavior, and a per-run
 * call cap. Until then, this class lives at the seam so the scoring path
 * can be typed against `MeaningClient`, but it cannot accidentally fire.
 *
 * The `prompt_version` here matches the `prompt_version` header in
 * `playground/meaning-pass-v1.md` so the cache key will be stable once
 * Step 3B replaces the body of `judge()` with a real API call.
 */
export class RealMeaningClient implements MeaningClient {
  readonly id = "real";
  readonly prompt_version = "meaning-pass-v0.1.0";

  async judge(_item: IngestedItem): Promise<ModelDerived> {
    throw new Error(
      "RealMeaningClient.judge() called in Step 3A. " +
        "Live API calls are Step 3B and require explicit team approval " +
        "(.env, API key handling, model selection, cost cap, cache " +
        "location, retry, call cap). See passdown-2026-06-19-f.md."
    );
  }
}
