# Passdown — 2026-06-19 (session D)
*CS Engineer. Short amendment session: applied the team ruling on consent-gate semantics; Step 1 now matches the eligible-audience rule.*

## What I did this session

**Filed the team ruling** at `docs/correspondence/team-consent-gate-ruling-2026-06-19.md`.

**Implemented the consent-gate amendment** per the ruling:
- `playground/src/safety/consentGate.ts` — eligible-audience allowlist: `{public, published, friends}` pass; private, unknown, blank, missing, unsupported drop. Fail-closed preserved.
- `playground/scripts/smoke-test.ts` — added Check 6 (friends items reach scoring), renumbered model-calls check to Check 7; expected counts updated.
- `playground/BUILD.md` — Step 1 now explicitly states the eligible-audience rule with a pointer to the ruling memo, plus an additional done-when ("a friends-scoped item passes and reaches scoring"). Future readers won't reintroduce the strict public-only interpretation.

## Acceptance checks (after amendment)

```
[PASS] Check 1: All 40 seed items load
[PASS] Check 2: listener_001 loads
[PASS] Check 3: p002 drops (private → bucket='drop')
[PASS] Check 4: p002 dropped by consent gate (reason populated)
[PASS] Check 5: Blanked audience_scope drops
[PASS] Check 6: Friends-scoped items reach scoring (p004 → 'voiced', p036 → 'ambient')
[PASS] Check 7: Zero model calls
```

Bucket distribution after amendment: **drop 1 · ambient 13 · voiced 14 · expandable 12.** Only p002 drops at the gate. (The stub's id-mod-3 placement of p004 in voiced and p036 in ambient happens to match the gold labels — coincidence with the stub, not real scoring.)

## Status of Class 1 contracts

The consent gate's behavior is now team-approved and codified. The other Class 1 contracts implemented in Step 1 (`IngestedItem` schema, `Decision` schema, stub bucket-assignment rule) remain proposals-by-implementation pending review — flagging again so they don't get treated as approved by default.

## What's next

**Step 2 — Deterministic scorer + sliders.** Authorized per the team ruling's closing line. Plan:

1. Replace `stubScorer` with `realScorer` (same `(IngestedItem) => Decision` signature so loader/UI don't change).
2. Compute `closeness` as a lookup from `listener.closeness_map` keyed by `account_id` (closeness is a lookup, not a guess — per Eng1 R1).
3. Compute `timeliness` from `timestamp` / `expires_at` (deterministic decay function; baseline 0.5 when `expires_at` is null).
4. Compute `novelty` by dedup on `novelty_key` within a configurable window.
5. Apply focus weights + threshold from sliders.
6. Hand-stub the ModelDerived fields (`category`, `magnitude`, `sensitivity`, `confidence`) — Step 3 will replace them with real cached model output.
7. Wire React sliders for: per-source-type focus weight, magnitude scale, threshold, timeliness baseline, novelty window. Sliders trigger pure local recompute; **zero model calls** on slider move (the hard check).
8. Each item's card surfaces a `score_breakdown` so the math is inspectable.

Step 2 schemas + slider semantics are Class 1 — I'll propose them in the implementation itself, with a sharp note in the passdown so the team can review-and-amend rather than approve in advance.

## Repo state at end of turn
- Branch: `main`
- Remote: `https://github.com/eaflores805-Apiana/drift` (public)
- Local HEAD = Remote HEAD (verified in turn summary)
- `_INBOX/` empty
- Working tree clean after this passdown's commit
