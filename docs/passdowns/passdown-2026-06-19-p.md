# Passdown — 2026-06-19 (session P)
*CS Engineer. Acknowledgment turn. Grading model locked: judgment axes graded, safety gates absolute. Freeze re-affirmed. No code changes.*

## What I did

- Filed the Team Lead's grading-model ruling at `docs/correspondence/team-grading-model-locked-2026-06-19.md`.
- Wrote this passdown.

That's it. No code, no smoke run (no changes), no live calls, no instrumentation, no scoring.

## The locked grading model

| Layer | How it is evaluated |
|---|---|
| Eligibility | **Graded axis** |
| Voiceworthiness | **Graded axis** |
| Treatment | **Graded axis** |
| Consent | **Hard gate** |
| Allowed claims / forbidden inferences | **Hard gate** |
| Final-line grounding | **Hard gate** |
| Session airtime budget | Not graded yet |

The rule: judgment can be graded; safety cannot be averaged. An item that gets eligibility / voiceworthiness / treatment right but invents a motive inside `allowed_claims` is a **fail**, not an "almost right." Same for consent failures, ungrounded claims, and ungrounded final lines. No tradeoffs.

## What Phase B asks (and doesn't)

Currently asking:
> Can Drift judge an individual item correctly and safely?

Not yet asking:
> Which two of ten worthy candidates air in a 20-minute session?

(Session airtime budget is a future layer; explicitly not graded yet.)

## State carried into the scoring discussion

The headline finding survived all three label revisions (v0.2.0 → v0.3.0 → v0.3.1) without obscuring:

> **At default settings, all five gold-voiced items (p004, p008, p018, p020, p025) are classified as `over_suppression`.**

Two distinct shapes within that:
- `close_friend_over_suppression` (p004, p008) — closeness=close, but threshold + multiplicative formula keeps both ambient. Includes Dana's "I got the job" life event.
- `over_suppression` (p018, p020, p025) — closeness=followed (0.3), which caps the score regardless of magnitude/timeliness.

Check 42 in the smoke suite is the test-suite protection the TL named — the metric survives label refinement.

## What stays frozen (per TL)

- No scoring formula changes.
- No tuning of thresholds, weights, tier map.
- No new live `meaning:live` runs.
- No board extensions (filters/sort/search/export/charts/animations/polish/new mismatch categories/extra visual layers).
- No pre-built formula routes (the `route` field is in labels; not yet in code).
- No use of new v0.3 fields (`eligibility_status`, `voiceworthiness`, `disposition_reason`) by classifier or scoring.

## What CS continues to do

- Sweep `_INBOX/` if anything drops.
- File team correspondence cleanly.
- Use the board as inspection aid if asked about a specific item.
- Re-run smoke if shared code changes (none planned).

## Repo state at end of turn
- Branch: `main`
- Remote: `https://github.com/eaflores805-Apiana/drift` (private)
- Local HEAD = Remote HEAD (verified in turn summary)
- `_INBOX/` empty
- `playground/data/gold-labels.json` at v0.3.1 (10 labels; same data as v0.3.0; new _meta with grading-model rule)
- `playground/.meaning-cache/` 8 entries (gitignored, unchanged)
- Smoke: 47/47 PASS · typecheck clean · build 242 KB
