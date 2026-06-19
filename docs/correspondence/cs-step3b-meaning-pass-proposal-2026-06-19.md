# CS Proposal — Step 3B: Live Meaning Pass
*Author: CS Engineer. Audience: Product Owner, Engineer 1 (Senior), Engineer 2 (Team Lead). v0.1.0 · 2026-06-19. **No code shipped on this proposal yet.** Awaiting team sign-off on the items below before any live API call is wired up.*

## Summary

Step 3B replaces `MockMeaningClient` with a `RealMeaningClient` that calls the Anthropic API, executing the `meaning-pass-v1.md` prompt for each item and caching the result to disk. Live calls are gated behind an explicit CLI command + env flag — the UI **cannot** trigger them.

This proposal answers the 10 items from the Team Lead's session-G ruling, plus the recommended live-call control pattern.

---

## 1. Model provider and model choice

**Provider:** Anthropic (`@anthropic-ai/sdk`).

**Primary model:** `claude-sonnet-4-6`.

- Sonnet is the right tier for a structured-JSON judgment task with moderate nuance. Fast, accurate, ~$3/$15 per MTok input/output (verify current rates before approval).
- The meaning-pass prompt asks for category, magnitude, sensitivity, context_candidates, connection_read, rationale, allowed_claims, forbidden_inferences — that's a reasoning-heavy structured task; Haiku is likely too thin for it, Opus is overkill at 5x cost.
- Configurable via env var `MEANING_MODEL`; defaults to `claude-sonnet-4-6`.

**Quality A/B option:** keep `claude-opus-4-7` selectable for any item where Sonnet's `confidence` comes back low, or for a periodic full-corpus A/B run when we want to compare judgment quality. **Not** part of the default path.

**Not proposed:** Haiku as the default. The meaning task's failure mode (asserting "soul" claims) is exactly where the cheapest tier under-thinks. Sonnet is the floor.

## 2. `.env.example` plan

File at `playground/.env.example`, committed (it contains no secrets):

```
# === Drift Playground — live meaning pass configuration ===

# Anthropic API key. Required when ENABLE_LIVE_MEANING=true.
# Get one at https://console.anthropic.com/. Never commit a real key.
ANTHROPIC_API_KEY=sk-ant-REPLACE-ME

# Master safety switch. Live API calls happen ONLY when this is "true"
# AND a key is present AND the call is invoked through `npm run meaning:live`.
# Default is false. The UI never reads this.
ENABLE_LIVE_MEANING=false

# Model used by the live meaning pass.
# Options: claude-sonnet-4-6 (recommended), claude-opus-4-7, claude-haiku-4-5-20251001
MEANING_MODEL=claude-sonnet-4-6

# Maximum number of model calls allowed in a single live run.
# The runner refuses to start past this and refuses to make the (N+1)th call.
MEANING_CALL_CAP=50

# Where the disk cache lives, relative to playground/.
# The directory is gitignored.
MEANING_CACHE_DIR=.meaning-cache
```

Copy to `.env` (gitignored) and fill in the key before running `npm run meaning:live`.

## 3. `.env` is gitignored

Verified: root `.gitignore` already excludes `.env` and `.env.local`. Will add `playground/.meaning-cache/` to the same list as part of the Step 3B PR.

## 4. Cache key shape (as required by team ruling)

```
${item_id}@@${prompt_version}@@${model_id}@@${content_hash}
```

Where:
- `item_id`: human-readable (e.g., `p018`)
- `prompt_version`: from the meaning-pass-vN.md header (e.g., `meaning-pass-v0.1.0`)
- `model_id`: e.g., `claude-sonnet-4-6`
- `content_hash`: SHA-256 of canonical JSON of `{raw_text, entities, location, audience_scope, timestamp, expires_at}` — the fields the meaning pass actually reads. Stable across formatting changes that don't affect content.

Implementation: a new helper `cacheKeyFor(item, client, modelId)` in `playground/src/meaning/keyFor.ts`. The `MeaningCache.get/set` signature widens accordingly; the existing in-memory cache continues to work for `MockMeaningClient` (which will use an empty `model_id` or a fixed mock value).

**Cache hit guarantees** after this change:
- Same item, same prompt, same model → hit
- Same item, prompt bumped → miss (rerun)
- Same item, model swapped → miss (rerun, separate entry kept)
- Item edited (any of the fields above) → miss (content_hash differs)

## 5. Persistent cache location

**Path:** `playground/.meaning-cache/` (gitignored; per-developer; survives restarts).

**Layout:** one file per entry, filename = SHA-256 hex of the full key (avoids path-length and filename-charset issues). Each file's content:

```json
{
  "key": "p018@@meaning-pass-v0.1.0@@claude-sonnet-4-6@@<content_hash>",
  "item_id": "p018",
  "prompt_version": "meaning-pass-v0.1.0",
  "model_id": "claude-sonnet-4-6",
  "content_hash": "<sha256-hex>",
  "judged_at": "2026-06-19T19:30:00Z",
  "model_response": { /* the ModelDerived JSON */ }
}
```

**Why disk and not just memory:** survives `npm run dev` restarts and process exits, so we don't re-pay for judgments we already have. Reproducibility for run replays.

**Class:** `DiskMeaningCache implements MeaningCache` (same API; reads from disk on miss-then-write-through). The existing in-memory cache stays as the fast path; the disk cache backs it on cold start.

## 6. Retry behavior for malformed JSON

**Single retry**, then throw. Specifically:

1. Call model with the meaning-pass prompt + item context. Expect JSON-only output.
2. Try `JSON.parse` on the response. If it succeeds, validate against `ModelDerivedSchema.safeParse`.
   - Schema fail → **throw immediately** (the model returned valid JSON but the wrong shape; retrying without a stronger prompt is unlikely to help, and we don't want to mask a contract drift).
3. If JSON parse fails, **one retry** with an appended instruction: *"Your previous response was not valid JSON. Return only the JSON object, no prose, no markdown fences."*
4. If the retry also fails parse, **throw** with the raw response embedded in the error message for debugging.

Both calls count against the per-run cap (a bad item can't burn a budget loop).

## 7. Call cap

`MEANING_CALL_CAP` env var (default 50). The live runner:

- Counts every model call (including retries).
- Refuses to start if the requested batch size exceeds the cap.
- Refuses the next call when the running count hits the cap; surfaces clearly which items were skipped.

For the 40-item seed corpus with one retry budget per item, 50 is comfortable. A future full corpus (300–500 items per Senior's scaling note) needs the cap raised explicitly, not silently.

## 8. Cost estimate

Per-call sizing (approximate):
- Input tokens: ~700 (meaning-pass prompt ~500 + item context ~200)
- Output tokens: ~600 (ModelDerived JSON including rationale + context_candidates)

At assumed Sonnet 4.6 rates ($3 input / $15 output per MTok — verify current pricing before approval):

| Scope | Items | Cost (Sonnet 4.6) | Cost (Opus 4.7, ~5×) | Cost (Haiku 4.5, ~1/5×) |
|---|---|---|---|---|
| 1 item | 1 | ~$0.011 | ~$0.055 | ~$0.002 |
| 5 items | 5 | ~$0.055 | ~$0.28 | ~$0.011 |
| Surviving corpus (39) | 39 | ~$0.43 | ~$2.15 | ~$0.09 |
| Full Step 1+2 batch | 40 | ~$0.44 | ~$2.20 | ~$0.09 |

These are **per-run, uncached**. With the disk cache, the *first* full run costs ~$0.44 at Sonnet; subsequent runs are free until `prompt_version`, `model_id`, or item content changes.

The corpus-coverage-pack adds ~13 items for Phase B exit; budget another ~$0.14 when those land. Full Phase B exit budget at Sonnet ~ **$0.60**, ignoring re-runs after prompt iterations.

## 9. First live run plan

**Three items only.** Chosen to exercise the three failure modes the prompt is designed against:

1. **`p008`** — Dana sister: "I got the job!! New chapter starts in two weeks. Still shaking."
   - *Tests:* high-magnitude life event + close family + sister's published phrase. Expect `category=life_event`, `magnitude≈0.9`, `sensitivity=low`, `connection_read` with a "doorway" suggestion, `allowed_claims` includes "Dana got the job".
2. **`p018`** — Buena High Athletics: girls wrestling → CIF.
   - *Tests:* connection-over-importance, the "world texture" path. Expect `context_candidates` with `world_texture` entries about Ventura local pride + championship runs.
3. **`p004`** — Mateo: "Rough week. Holding my people close."
   - *Tests:* high-sensitivity, vague-but-real. Expect `sensitivity=high`, `connection_read` that hands off to the relationship, `forbidden_inferences` includes "the cause", "any specific event", and `context_candidates` mostly `do_not_use`.

**Procedure:**
1. `npm run meaning:live -- --items p008,p018,p004` (with `ENABLE_LIVE_MEANING=true` and `ANTHROPIC_API_KEY` in env).
2. CS prints the three returned `ModelDerived` blocks alongside the items.
3. Engineer 1 + Engineer 2 + PO read them, score against the prompt's "what to judge" guidance.
4. If all three look correct, expand: `npm run meaning:live -- --items p005,p007,...` to 10 items, then full corpus.
5. If any one looks wrong, halt; iterate on the prompt (bump `prompt_version`) before another live run.

**Estimated cost of the first run: ~$0.03.** I am willing to be wrong about taste; I am not willing to be wrong about money.

## 10. Safety switch — no accidental live calls

Three independent conditions, **all** required:

1. **Env flag:** `ENABLE_LIVE_MEANING=true`.
2. **Key present:** `ANTHROPIC_API_KEY` set and matches `sk-ant-` pattern.
3. **CLI invocation:** the call must come through `scripts/meaning-live.ts`, which sets a process-internal sentinel that `RealMeaningClient` checks on construction.

If any one is missing, `RealMeaningClient` throws *before* the SDK is even imported. The error message names the missing condition.

**The UI never imports `RealMeaningClient`.** `App.tsx` always uses `MockMeaningClient`. Live results reach the UI by:
- `npm run meaning:live` pre-warms the disk cache.
- Reload the dev server.
- The UI's `MockMeaningClient` checks the disk cache first; on hit, returns the cached (real-model) judgment. On miss, falls through to the stub.

Net effect: rendering the app — even reloading 100 times — cannot make a single API call. Live calls happen only when a human types `npm run meaning:live`.

(If we ever want a `dev:live` mode where the UI calls live, that's a separate proposal with its own approval. **Not** part of Step 3B.)

---

## Files this proposal will touch (if approved)

```
playground/
├── .env.example                            NEW
├── .gitignore                              + .meaning-cache/
├── package.json                            + @anthropic-ai/sdk, +"meaning:live" script
└── src/meaning/
    ├── keyFor.ts                           NEW — cacheKeyFor(item, client, model_id)
    ├── cache.ts                            widen MeaningCache key signature
    ├── diskCache.ts                        NEW — disk-backed implementation
    └── realClient.ts                       replace throw with real SDK call + JSON parse + schema validate + retry
playground/scripts/
└── meaning-live.ts                         NEW — CLI runner: parses --items/--limit, checks 3-condition safety switch, runs meaningBatch
```

## What I want from the team before I touch code

A go/no-go on each numbered item above, plus any of:

- Disagree with Sonnet 4.6 → name a different model.
- Disagree with the call cap → name a number.
- Disagree with the 3-item first run → name different items.
- Disagree with the cache directory → name a path.
- Disagree with the no-UI-live-mode → name the conditions you'd require.

After approval, I'll ship the code + a smoke test for the cache-key expansion + the safety-switch behavior. Live calls won't happen until I get an explicit "run the 3-item batch."
