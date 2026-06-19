# Passdown — 2026-06-19 (session J)
*CS Engineer. Cache-behavior proof executed and PASSED. Mock-vs-real meaning comparison surfaces a real scoring gap on `p004` that matches Senior's "over-suppression" warning. No live API call this turn.*

## Cache-test result — exactly as expected

```bash
npm run meaning:live -- --items p008,p018,p004

============================================================
Done. 0 model call(s). Cache: size=3 hits=3 misses=0.
============================================================
```

- **3 cache hits** ✓
- **0 model calls** ✓
- **0 retries** ✓

Cost-control architecture is real, not a bedtime story. The disk cache at `playground/.meaning-cache/` serves prior judgments unchanged; rerunning the same command costs nothing.

## Validated `ModelDerived` (from cache)

The cache loaded successfully through `ModelDerivedSchema.safeParse` for all three items (the disk cache's `get()` returns `undefined` on schema mismatch, treating it as a miss; all three returned hits, so all three are schema-valid).

### p004 — Mateo, "Rough week. Holding my people close."
```
category:        sensitive close-friend emotional post
magnitude:       0.45
sensitivity:     high
confidence:      0.50
context_candidates: 1 (all do_not_use)
allowed_claims:  2 — exactly what Mateo said, nothing inferred
forbidden_inferences: 9 — explicitly lists cause, grief, illness,
                          breakup, job loss, family trouble, ...
                          AND "that Mateo is seeking outreach"
```
The "seeking outreach" forbidden inference is the exact product rule Senior named (no claim about Mateo's intent). Connection-read offers "a moment to be present for, gently" — a listener-side suggestion, not a Mateo-interior claim.

### p008 — Dana (sister), "I got the job!! New chapter starts in two weeks. Still shaking."
```
category:        family major life event — new job announcement
magnitude:       0.80
sensitivity:     low
confidence:      0.95
context_candidates: 4
  - world_texture: "starting a new job is a widely recognized milestone"
  - direct_context: the announced facts (official, 2-week start)
  - do_not_use: what the job is, field, what she left behind
  - do_not_use: "still shaking" beyond physical excitement
allowed_claims:  4 — only her published phrasing
forbidden_inferences: 6 — including "why she was shaking"
```
Bright-but-disciplined: 0.80 magnitude (not 0.90 — the model didn't max it out unprovoked), confidence 0.95, but tight on "what the job is."

### p018 — Buena High Athletics, CIF-bound
```
category:        local sports achievement (youth team)
magnitude:       0.65
sensitivity:     low
confidence:      0.95
context_candidates: 4
  - world_texture: what CIF qualification represents in CA HS sports
  - direct_context: 6am practices (publicly stated, team-level)
  - do_not_use: individual students' names / stories / details (minors)
  - world_texture: Ventura as a coastal community where school sports matter
allowed_claims:  3 — at team level only
forbidden_inferences: 4 — including "personal circumstances of any minor"
```
Notable: the model added the minors-protection forbidden_inference unprompted. That's the correct read; the prompt's "anything touching a minor's private life" instruction landed.

## Schema-on-first-try report

All three cached entries were valid `ModelDerived` on disk. The cache's `get()` would have returned `undefined` (miss) on any schema mismatch, forcing a fresh judgment — that didn't happen for any of the three. So either:
- All three judgments parsed and validated on first try in the original run, **OR**
- They needed the one repair retry in the original run but cached as valid

I don't have access to the original run's retry stats from this session (cache stores final values, not the path that got there). The user/Senior who ran the original batch has those numbers.

## Mock-vs-real scoring comparison

With the real meaning judgments now cached and the existing scoring engine, here's the head-to-head at default settings:

| item | source_type | mock<br>magnitude | real<br>magnitude | mock<br>score | real<br>score | bucket (both) |
|---|---|---:|---:|---:|---:|---|
| p004 (Mateo, close) | friend | 0.18 | **0.45** | 0.091 | **0.228** | ambient · ambient |
| p008 (Dana, close) | family | 0.18 | **0.80** | 0.091 | **0.405** | ambient · ambient |
| p018 (Buena, followed) | local_org | 0.60 | 0.65 | 0.101 | 0.110 | ambient · ambient |

Sensitivity matches across the board (mock keyword scan happened to hit "rough week" for p004 → high; real model also high). Categories differ in label but agree in spirit.

**Score deltas:**
- p004: real is **2.5×** mock (still ambient — 0.228 vs 0.45 threshold)
- p008: real is **4.4×** mock and *just* below the voice threshold (0.405 vs 0.45)
- p018: real is **+9%** over mock (closeness dominates: "followed" = 0.3 caps the score)

## The over-suppression gap Senior named — confirmed in the math

Senior's product rule: **p004 should be voiced, gentle, low-detail, with a check-in nudge.** The gold label agrees.

But at default settings, even with the real meaning pass (magnitude 0.45, high sensitivity, close friend), p004 lands ambient because:
```
score = magnitude(0.45) × closeness(0.9) × rel-boost(0.75) × time-boost(0.75) = 0.228
       < voiceThreshold(0.45) → ambient
```

That's the over-suppression Senior warned about. Three possible fixes (all team-level, not CS-unilateral):

1. **Lower the voice threshold for high-sensitivity-close items.** The principle is "restraint is the default" — but close-friend sensitive items are exactly the kind that *do* deserve the mic (gently). A different threshold by sensitivity tier could express that.
2. **Bump magnitude for high-sensitivity close-friend posts in the meaning pass.** The model rated p004 at 0.45 (modest event); if "Mateo is having a hard week" is a closeness-1.0 friend signal, magnitude maybe should reflect "this matters" not just "how big is the event."
3. **Adjust the scoring formula.** Currently `mag × closeness × boosters` — multiplicative. If closeness ≥ "close" *and* sensitivity = high, maybe `+ a sensitivity-aware floor`. Risky to over-tune; flag for team.

I am **not** making any of these changes. They're Class 1 (scoring formula / threshold) and need team approval. Flagging for the team's review.

## Suggested next batch (per Team Lead, awaiting explicit "Go")

```
p010, p020, p025, p030, p016
```

Purpose per Team Lead: test the opposite failure modes — junk, commercial, stale, spicy. CS will not run this until explicitly approved.

## Repo state at end of turn
- Branch: `main`
- Remote: `https://github.com/eaflores805-Apiana/drift` (public)
- Local HEAD = Remote HEAD (verified in turn summary)
- `_INBOX/` empty
- `playground/.env` exists locally (gitignored)
- `playground/.meaning-cache/` has 3 entries (gitignored)
- Working tree clean after this passdown's commit
