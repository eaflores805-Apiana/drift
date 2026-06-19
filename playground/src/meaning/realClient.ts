import Anthropic from "@anthropic-ai/sdk";
import { type IngestedItem } from "../data/schemas";
import { parseAndValidate } from "./parseModelResponse";
import { type MeaningClient, type ModelDerived } from "./types";

/**
 * RealMeaningClient — the live Step 3B path.
 *
 * Triple-gated safety per team ruling 2026-06-19. Construction throws unless
 * ALL THREE are true (checked in this order so the error message names the
 * first missing condition):
 *
 *   1. `process.env.ENABLE_LIVE_MEANING === "true"`
 *   2. an Anthropic API key is available (constructor arg OR env)
 *   3. `process.env.__DRIFT_MEANING_LIVE_CLI === "1"` — the sentinel that
 *      `scripts/meaning-live.ts` sets so React re-renders can never invoke
 *      this client even if someone misimports it.
 *
 * `judge()` per team ruling: one parse-retry, one schema-retry. Both
 * failures throw, and `meaningPass` never caches a throw.
 */

const DEFAULT_MODEL = "claude-sonnet-4-6";
const DEFAULT_PROMPT_VERSION = "meaning-pass-v0.1.0";
const DEFAULT_MAX_TOKENS = 1024;

export type RealClientOptions = {
  apiKey?: string;
  modelId?: string;
  callCap?: number;
  promptText?: string;
  promptVersion?: string;
  maxTokens?: number;
};

export class RealMeaningClient implements MeaningClient {
  readonly id = "real";
  readonly prompt_version: string;
  readonly model_id: string;

  private readonly anthropic: Anthropic;
  private readonly promptText: string;
  private readonly callCap: number;
  private readonly maxTokens: number;
  private calls = 0;

  constructor(opts: RealClientOptions = {}) {
    // 1. Master safety switch.
    if (process.env.ENABLE_LIVE_MEANING !== "true") {
      throw new Error(
        "RealMeaningClient refused: ENABLE_LIVE_MEANING is not 'true'. " +
          "Live API calls require this env flag. See passdown-2026-06-19-h.md."
      );
    }
    // 2. Key present.
    const apiKey = opts.apiKey ?? process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error(
        "RealMeaningClient refused: ANTHROPIC_API_KEY not set. " +
          "Provide via env or constructor arg. Never commit a key."
      );
    }
    // 3. CLI sentinel — set by scripts/meaning-live.ts only. Prevents
    //    UI / smoke / accidental imports from instantiating a live client.
    if (process.env.__DRIFT_MEANING_LIVE_CLI !== "1") {
      throw new Error(
        "RealMeaningClient refused: must be invoked via `npm run meaning:live`. " +
          "The CLI script sets the sentinel; the UI cannot."
      );
    }

    if (!opts.promptText) {
      throw new Error(
        "RealMeaningClient refused: promptText is required. " +
          "The CLI loads it from playground/meaning-pass-v1.md."
      );
    }

    this.model_id = opts.modelId ?? process.env.MEANING_MODEL ?? DEFAULT_MODEL;
    this.prompt_version = opts.promptVersion ?? DEFAULT_PROMPT_VERSION;
    this.callCap = opts.callCap ?? parseInt(process.env.MEANING_CALL_CAP ?? "50", 10);
    this.maxTokens = opts.maxTokens ?? DEFAULT_MAX_TOKENS;
    this.promptText = opts.promptText;
    this.anthropic = new Anthropic({ apiKey });
  }

  callCount(): number {
    return this.calls;
  }

  async judge(item: IngestedItem): Promise<ModelDerived> {
    if (this.calls >= this.callCap) {
      throw new Error(`Call cap (${this.callCap}) reached before judging ${item.id}.`);
    }

    // First attempt.
    const firstRaw = await this.callModel(this.buildUserMessage(item));
    const first = parseAndValidate(firstRaw);
    if (first.ok) return first.data;

    // One repair retry per team ruling — name the failure mode in the repair.
    if (this.calls >= this.callCap) {
      throw new Error(
        `Call cap (${this.callCap}) reached during retry for ${item.id} ` +
          `(first attempt failed: ${first.kind} — ${first.error})`
      );
    }
    const repair = this.buildRepairMessage(item, first);
    const secondRaw = await this.callModel(repair);
    const second = parseAndValidate(secondRaw);
    if (second.ok) return second.data;

    // Both failed — throw, cache nothing.
    throw new Error(
      `Meaning pass failed for ${item.id} after one repair retry. ` +
        `First: ${first.kind} — ${first.error}. ` +
        `Second: ${second.kind} — ${second.error}. ` +
        `Raw retry response (first 200 chars): ${secondRaw.slice(0, 200)}`
    );
  }

  private async callModel(userMessage: string): Promise<string> {
    this.calls++;
    const response = await this.anthropic.messages.create({
      model: this.model_id,
      max_tokens: this.maxTokens,
      system: this.promptText,
      messages: [{ role: "user", content: userMessage }],
    });
    // We expect a single text content block. Coalesce defensively.
    const text = response.content
      .map((b) => (b.type === "text" ? b.text : ""))
      .join("");
    return text;
  }

  private buildUserMessage(item: IngestedItem): string {
    // Hand the model exactly the fields the prompt promises it'll get.
    const view = {
      source_type: item.source_type,
      source_name: item.source_name,
      raw_text: item.raw_text,
      entities: item.entities ?? [],
      location: item.location ?? null,
      timestamp: item.timestamp,
      expires_at: item.expires_at ?? null,
    };
    return `Here is the item to judge:\n\n${JSON.stringify(view, null, 2)}\n\nReturn the JSON object now.`;
  }

  private buildRepairMessage(
    item: IngestedItem,
    failure: Exclude<ReturnType<typeof parseAndValidate>, { ok: true }>
  ): string {
    const base = this.buildUserMessage(item);
    if (failure.kind === "parse") {
      return (
        base +
        "\n\nYour previous response was not valid JSON. Return only the JSON object, " +
        "no prose, no markdown fences. Your previous response began with: " +
        failure.raw.slice(0, 120)
      );
    }
    return (
      base +
      "\n\nYour previous response was valid JSON but did not match the required " +
      `schema. The validator reported: ${failure.error}. ` +
      "Return a corrected JSON object that matches the schema exactly. " +
      "No prose, no markdown fences."
    );
  }
}
