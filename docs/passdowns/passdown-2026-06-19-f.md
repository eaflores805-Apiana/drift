# Passdown — 2026-06-19 (session F)
*CS Engineer. Required timeliness patch applied per Team Lead passdown of session E. Step 2 now fully accepted; CS authorized for Step 3A.*

## What I did this session

**Patched `timeliness()` so no-expiry items decay by post age.** Previously, an item without `expires_at` returned `baseline` forever — "no expiry" was treated as eternal freshness. That was the seam Senior flagged.

### Code changes

- `playground/src/scoring/timeliness.ts` — new signature `timeliness(timestamp, expires_at, baseline, nowMs?)`. Returns the existing fields plus `hours_since_post` and `decay_band` (string label of which band produced the value, for inspectability).
- `playground/src/scoring/scoringEngine.ts` — passes `item.timestamp` into the call; `buildReason` now uses `decay_band` in the per-item reason line so the breakdown explains which band applied.
- `playground/scripts/smoke-test.ts` — updated existing Check 8 to the new signature; added Checks **8a / 8b / 8c** for the no-expiry decay behavior.

### Decay shape (no-expiry items)

The Team Lead's suggested shape, made baseline-relative so the existing `timelinessBaseline` slider keeps its meaning:

| post age      | value          | band label                       |
|---------------|----------------|----------------------------------|
| ≤ 24h         | baseline       | "≤24h since post (neutral)"      |
| ≤ 72h         | baseline × 0.7 | "≤72h since post"                |
| ≤ 168h (7d)   | baseline × 0.4 | "≤7d since post"                 |
| > 168h        | baseline × 0.2 | ">7d since post"                 |

At default `baseline=0.5` these match the team-suggested numbers exactly: 0.5 → 0.35 → 0.20 → 0.10. The `timelinessBaseline` slider now tunes the "neutral value" for recent no-expiry items; older posts decay relative to it.

Expiry-driven branch is unchanged (≤6h→1.0, ≤24h→0.85, ≤72h→0.55, >72h→0.35, past→0).

## Smoke test — 17/17 pass

```
[PASS] Check 8:  Timeliness uses expires_at (soon=1, recent-no-exp=0.5, expired=0)
[PASS] Check 8a: Recent no-expiry is fresher than older no-expiry (recent=0.5, ~2d-old=0.35)
[PASS] Check 8b: ~1-week-old no-expiry decays from baseline (value=0.2, band='≤7d since post')
[PASS] Check 8c: ~2-week-old no-expiry decays further than 1-week-old (value=0.1, band='>7d since post')
```

All other Step 2 checks (closeness lookup, novelty dedup, focus-as-weighting, slider motion, score breakdown, p002 stays dropped under aggressive sliders, zero model calls) remain green. `npm run typecheck` clean; `npm run build` 222 KB / 65 KB-gzip in <400 ms.

Side effect of the patch: the slider-motion check went from 36 → 31 items in voiced/expandable at the lowered threshold (`voice=0.05, exp=0.20`). That's the expected drop — older posts that previously held `baseline` for timeliness now decay, so a few items don't quite clear the lowered bar. Healthy signal, not a regression.

## Class 1 status

The Team Lead's session-E passdown approved the following as **provisional**:
- tier-to-numeric map
- bucket boundaries
- scoring formula structure
- `ScoringSettings` schema as a working surface

This session adds (also provisional, awaiting later review):
- `timeliness()` two-branch behavior + decay shape (per team-suggested numbers)
- Extended `TimelinessResult` with `hours_since_post` and `decay_band`

## What's next — Step 3A

Per the Team Lead's session-E ruling: **Step 3A is authorized.** Scope per the ruling:

> Step 3A may build mock/cache/model-client interfaces.

Specifically — no live model calls yet. CS will build:
1. **Cache layer interface** — keyed by `{item_id, prompt_version}`. Storage: in-memory map for the bench; later a file-backed cache (JSON on disk) when Step 3B lands.
2. **Model-client interface** — a `MeaningClient` protocol with two implementations: `MockMeaningClient` (deterministic, returns hand-stubbed values per item — wraps the existing `handStubbedMeaning`) and `RealMeaningClient` (stubbed for 3A, **throws if invoked** so we can't accidentally make a real call).
3. **Meaning-pass orchestration** — for each item: check cache → call client → write back to cache. Cache invalidation on `prompt_version` bump.
4. **Wire into scoringEngine** so it consumes cached `ModelDerived` rather than calling `handStubbedMeaning` directly. The seam stays the same.
5. **Smoke checks**: cache hit/miss behavior, no real network call on any code path, `prompt_version` bump invalidates the cache.

**Step 3B (live calls)** still requires explicit team approval for: `.env` handling, API key storage, model selection, cost cap estimate, cache location on disk, retry/schema validation behavior, per-run call cap. I will not ship any code that imports the Anthropic SDK or reads an API key without an explicit go-ahead.

## Repo state at end of turn
- Branch: `main`
- Remote: `https://github.com/eaflores805-Apiana/drift` (public)
- Local HEAD = Remote HEAD (verified in turn summary)
- `_INBOX/` empty
- Working tree clean after this passdown's commit
