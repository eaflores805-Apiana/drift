# Passdown — 2026-06-19 (session G)
*CS Engineer. **Step 3A** built per Team Lead authorization: meaning cache + `MockMeaningClient` + `RealMeaningClient` (throws) + 8 acceptance checks. Zero live model calls.*

## What I built

A small `meaning/` module that sits between the data loader and the scoring engine. The `MeaningClient` interface unifies the mock (Step 3A) and the future real client (Step 3B, gated). The cache keys on `{item_id, prompt_version}` so a `prompt_version` bump invalidates entries. Scoring now consumes a `MeaningMap` instead of calling the meaning stub directly — the seam Step 3B will swap is in one place.

```
playground/src/meaning/
├── types.ts                  MeaningClient + Zod ModelDerivedSchema
│                             (mirrors meaning-pass-v1.md output exactly)
├── handStubbedMeaning.ts     deterministic stub; returns the FULL Step 3 shape
├── mockClient.ts             MockMeaningClient — wraps the stub + validates
├── realClient.ts             RealMeaningClient — throws clearly on call
├── cache.ts                  MeaningCache — in-memory, hit/miss stats
└── meaningPass.ts            meaningFor / meaningBatch orchestration
```

Touched: `scoring/scoringEngine.ts` (consumes `MeaningMap`; reason now includes sensitivity), `App.tsx` (async `useEffect` to run the meaning batch once on load), `ui/Playground.tsx` + `ui/DebugPanel.tsx` (surface client id + prompt_version + cache stats), `ui/styles.css` (loading state), `scripts/smoke-test.ts` (Step 3A acceptance checks added).

## The schema match — ModelDerived now mirrors the Step 3 contract

`meaning-pass-v1.md` (prompt_version: `meaning-pass-v0.1.0`) produces this exact shape, now codified as `ModelDerivedSchema`:

```ts
{
  category: string,
  magnitude: number (0–1),
  sensitivity: "low" | "medium" | "high",   // note: aligned with prompt; was "none|low|high" in Step 2
  confidence: number (0–1),
  context_candidates: { context, allowed_use, reason }[],
  connection_read: string,
  rationale: { category, magnitude, sensitivity, confidence, context_candidates, connection_read },
  allowed_claims: string[],
  forbidden_inferences: string[],
}
```

Mock returns the full shape (empty `context_candidates`, `connection_read = "stub: ..."`, etc.); validation in `MockMeaningClient.judge()` catches any drift from the contract.

## Step 3A acceptance checks — all 8 pass

| # | Check | Result |
|---|---|---|
| 15 | First meaning pass populates the cache (40 misses) | PASS — size=40, misses=40, hits=0 |
| 16 | Second pass reuses cache (40 hits, 0 misses) | PASS — size=40, hits=40, misses=0 |
| 17 | `prompt_version` bump invalidates (40 fresh misses, cache grows to 80) | PASS |
| 18 | Mock is deterministic (same item + same version → identical) | PASS |
| 19 | Mock output validates against `ModelDerivedSchema` | PASS |
| 20 | `RealMeaningClient` throws on invocation | PASS — error mentions Step 3B + the required approvals |
| 21 | Scoring consumes cached ModelDerived (claim fields propagate) | PASS |
| 22 | Sliders do **not** touch the meaning cache (0 hits / 0 misses across 3 rescores) | PASS |

Plus all 17 Step 1+2 carry-overs (1–14 with the 8a/b/c timeliness decays) remain green. **25/25 total.** `npm run typecheck` clean; `npm run build` 225 KB / 66 KB-gzip.

## Defenses against accidentally going live

- `RealMeaningClient.judge()` throws with a message that names Step 3B and lists the approvals needed (`.env`, API key handling, model selection, cost cap, cache location, retry, call cap). It cannot silently succeed.
- No SDK / `fetch` / `process.env` reads anywhere in `playground/src/meaning/`.
- No `.env` file; no `.env.example` written (per the Team Lead's "not yet").
- `App.tsx` instantiates `MockMeaningClient` only.

## Class 1 items implemented as proposals (pending review)

- `MeaningClient` interface (`id`, `prompt_version`, `judge`)
- `ModelDerivedSchema` (already exact-matched to the meaning-pass prompt, but the *encoding* of that shape in Zod is mine and worth a review)
- Cache key shape: `${item_id}@@${prompt_version}` — affects 3B cache hits
- `MeaningCache` API surface (`get`, `set`, `has`, `stats`, `resetStats`)
- `meaningBatch` serial iteration (parallel via `Promise.all` is a 1-line change when 3B's latency matters)
- `MissingMeaningDecision` ambient fallback for cache-miss items (dev guard; should never fire in normal flow)
- Sensitivity enum widened from `none|low|high` to `low|medium|high` to match the prompt — this is a behavior-affecting change worth team acknowledgement

## What's next — Step 3B (gated)

When the team approves, Step 3B needs:
1. `.env` strategy (gitignored) + `.env.example` with placeholder keys
2. API key handling (Anthropic env var name, error on missing)
3. Model selection (recommend `claude-sonnet-4-6` for the meaning pass — fast, accurate, low cost; can A/B with `claude-opus-4-7` later for quality comparison)
4. Cost cap estimate (for the 40-item bench: ~40 calls × ~1 KB in / ~500 B out — modest; per-run cost is sub-dollar at Sonnet rates)
5. Cache persistence — disk-backed JSON at `playground/.meaning-cache/` (gitignored) keyed identically to in-memory
6. Retry behavior + schema validation on the JSON the model returns (parse → `ModelDerivedSchema.safeParse` → retry once on parse failure → throw)
7. Per-run call cap (config flag) so a stuck loop can't burn budget

I will **not** implement any of the above without explicit team approval per the roles memo's Class 1 + 3 rules. Today's PR is plumbing only.

## Repo state at end of turn
- Branch: `main`
- Remote: `https://github.com/eaflores805-Apiana/drift` (public)
- Local HEAD = Remote HEAD (verified in turn summary)
- `_INBOX/` empty
- Working tree clean after this passdown's commit
