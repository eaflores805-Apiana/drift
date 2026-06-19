# Passdown — 2026-06-19 (session I)
*CS Engineer. **Step 3B implementation built.** Both Team Lead tweaks integrated. Triple-gated safety verified. NO live API call has been made — awaiting explicit "run the 3-item batch" go-ahead.*

## What I built

A complete live-meaning-pass implementation, gated behind three independent conditions. The UI cannot trigger a single API call; only `npm run meaning:live` can.

### New files
```
playground/
├── .env.example                              NEW — config template, no secrets
├── package.json                              + @anthropic-ai/sdk dep + "meaning:live" script
└── src/meaning/
    ├── keyFor.ts                             NEW — cacheKeyFor() + contentHashOf() (SHA-256 via SubtleCrypto, works Node + browser)
    ├── diskCache.ts                          NEW — DiskMeaningCache, file-per-entry, filename = SHA(key)
    ├── parseModelResponse.ts                 NEW — parseAndValidate() returns {ok|parse-fail|schema-fail} for the retry layer
    ├── realClient.ts                         IMPLEMENTED — triple-gated; judge() with parse-retry AND schema-retry
    ├── mockClient.ts                         + model_id = "mock" (for the 4-part key)
    ├── types.ts                              MeaningClient interface gains model_id
    ├── cache.ts                              MeaningCacheLike interface; in-memory cache now takes opaque string key
    └── meaningPass.ts                        uses cacheKeyFor()
playground/scripts/
└── meaning-live.ts                           NEW — CLI runner: parses --items/--limit, sets the sentinel, loads prompt from meaning-pass-v1.md
```

Root `.gitignore` adds `.meaning-cache/` and `playground/.meaning-cache/`.

## The two Team-Lead tweaks — integrated

**Tweak 1: exact model ID + estimate labeling.**
- `RealMeaningClient` default model is exactly `claude-sonnet-4-6` (from system metadata, not marketing).
- `.env.example` lists the three valid IDs explicitly: `claude-sonnet-4-6`, `claude-opus-4-7`, `claude-haiku-4-5-20251001`.
- Cost estimates in the proposal doc are labeled "Estimate — verify against current provider pricing before live run."

**Tweak 2: one repair retry on schema-validation failure too.**
- `parseAndValidate()` distinguishes `parse` vs `schema` failures.
- `RealMeaningClient.judge()`:
  1. Call model.
  2. `parseAndValidate(response)`. If ok, return.
  3. Build a repair message that **names the failure mode** (parse vs schema) and the specific validator error.
  4. One retry call.
  5. If retry also fails: **throw**, name both failures in the error message.
- `meaningPass.meaningFor()` only calls `cache.set()` after a successful return. A thrown judge() never caches.

## Triple-gated safety switch

`RealMeaningClient` constructor checks, in order:

1. `process.env.ENABLE_LIVE_MEANING === "true"` → else throw, name flag.
2. `process.env.ANTHROPIC_API_KEY` set (or constructor arg) → else throw, name key.
3. `process.env.__DRIFT_MEANING_LIVE_CLI === "1"` → else throw, name `npm run meaning:live`.

The sentinel is set **only** by `scripts/meaning-live.ts`, before constructing the client. No other file in the codebase writes it. Smoke checks 20/26/27 prove each condition individually rejects.

Browser bundle confirmed clean: `grep -l "anthropic" dist/assets/*.js` returns empty. Vite tree-shakes `realClient.ts` because `App.tsx` only imports `MockMeaningClient`.

## Smoke — 34/34 PASS

All Step 1/2/3A carry-overs (22 checks) green. New Step 3B checks:

```
[PASS] Check 23: Cache key includes model_id (mock vs claude-sonnet-4-6 → different keys)
[PASS] Check 24: Cache key includes content_hash (edited item → different key)
[PASS] Check 25: DiskMeaningCache persists across instances
[PASS] Check 26: RealMeaningClient throws when ANTHROPIC_API_KEY missing
[PASS] Check 27: RealMeaningClient throws when CLI sentinel missing
[PASS] Check 28: parseAndValidate accepts valid ModelDerived
[PASS] Check 29: parseAndValidate distinguishes parse-failure
[PASS] Check 30: parseAndValidate distinguishes schema-failure
[PASS] Check 31: parseAndValidate strips markdown code fences
```

(Check 20 — RealMeaningClient throws when ENABLE_LIVE_MEANING missing — already covered in Step 3A and stays green.)

Typecheck clean. Vite build: 225 KB / 66 KB-gzip, no Anthropic SDK in the bundle.

## How to run the first live test (after explicit team approval)

```sh
# In playground/.env (created from .env.example, gitignored):
ANTHROPIC_API_KEY=sk-ant-...       # real key
ENABLE_LIVE_MEANING=true
MEANING_MODEL=claude-sonnet-4-6
MEANING_CALL_CAP=10                # comfortable for the 3-item run
MEANING_CACHE_DIR=.meaning-cache

# Then:
cd playground
npm run meaning:live -- --items p008,p018,p004
```

The CLI prints each item's judgment field-by-field for review. Disk cache survives the run; re-invoking with the same items hits cache (~0 cost, no API call).

Estimated first-run cost: **~$0.03 at Sonnet 4.6** (verify against current pricing).

## Hard boundaries respected (per Team Lead)

- ❌ No full-corpus call. Only `--items` or `--limit` allowed.
- ❌ No UI-triggered model calls. `App.tsx` imports `MockMeaningClient` only.
- ❌ No committed secrets. `.env.example` ships with placeholder; `.env` is gitignored at the root.
- ❌ No silent fallback. If `ENABLE_LIVE_MEANING` is unset, the client throws. There is no "fall back to mock" hidden in the live path.
- ❌ No caching malformed outputs. `meaningPass.meaningFor()` only calls `cache.set()` after a successful return; thrown judgments are never persisted.

## What's NOT done

- **No live call has been made.** I have not run `npm run meaning:live` against any item.
- **No `.env` file written.** Only `.env.example`.
- **PO labels are still active and important** — Step 3B's judgments are only useful against a labeled answer key.

## What I'm asking for

A single explicit "**go**" to run:

```sh
npm run meaning:live -- --items p008,p018,p004
```

After the team reviews the three returned `ModelDerived` blocks, the decision tree is:
- All three sane → expand the live runs.
- Anything off → halt, bump `prompt_version`, re-propose.

## Repo state at end of turn
- Branch: `main`
- Remote: `https://github.com/eaflores805-Apiana/drift` (public)
- Local HEAD = Remote HEAD (verified in turn summary)
- `_INBOX/` empty
- Working tree clean after this passdown's commit
- Smoke: 34/34 PASS · typecheck clean · build clean (SDK absent from browser bundle)
