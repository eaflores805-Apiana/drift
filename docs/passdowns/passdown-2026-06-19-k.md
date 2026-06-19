# Passdown — 2026-06-19 (session K)
*CS Engineer. Second approved live batch (5 items: junk / commercial / timeliness / promo / political). Junk discipline confirmed; restraint default holds; one nuance about model calibration vs stub worth surfacing.*

## Run summary

```
Items:        p010, p016, p020, p025, p030
Model calls:  5
Retries:      0
Cap:          6 (1 unused — fits with no margin if 2+ items had retried)
Cache:        was 3 entries (p004, p008, p018) → now 8 entries
Schema-on-first-try: 5/5
```

No retries means every model response parsed AND validated against `ModelDerivedSchema` on the first attempt. The repair path is built but didn't fire.

## Validated `ModelDerived` (live)

### p010 — Jordan, "ugh. can't believe it happened again 😩" (junk / signal floor)
```
category:        vague low-signal emotional post
magnitude:       0.15
sensitivity:     medium
confidence:      0.20
context_candidates: 1 (do_not_use — "no identifiable subject")
allowed_claims:  1 — "Jordan expressed frustration about something recurring"
forbidden_inferences: 6 — explicitly "what happened", "what 'again' refers to"
```
**Read:** very low magnitude + very low confidence is the right read for vague-emoji posts. Model refused to invent a subject. Pass.

### p016 — Uncle Ray, political rant (sensitive suppression test)
```
category:        family political opinion post
magnitude:       0.20
sensitivity:     high
confidence:      0.30
context_candidates: 1 (do_not_use)
allowed_claims:  1
forbidden_inferences: 7 — including "the listener's political views" and
                       "that the political topic is relevant to the listener"
```
**Read:** sensitivity=high AND low magnitude AND low confidence is exactly the "stays quiet" combination. The forbidden_inferences explicitly protect the listener from being roped into Uncle Ray's politics. Pass.

### p020 — Driftwood Roasters, "fall blend back, first 20 cups free, open til 6" (commercial / time-bound)
```
category:        local business product drop (time-limited seasonal return)
magnitude:       0.30
sensitivity:     low
confidence:      0.95
context_candidates: 3 (direct_context for the offer; world_texture about
                       seasonal returns; do_not_use for asserting listener desire)
allowed_claims:  5 — all factual, including expiry at 6 PM today
forbidden_inferences: 5 — including "that the listener wants the coffee or should go"
```
**Read:** moderate magnitude for an actionable local offer, high confidence on the facts, explicit "desire is for code to weigh, not for the meaning read." Disciplined commercial. Pass.

### p025 — Ventura News, "street fair tonight on Main, music ~8 PM" (timeliness)
```
category:        local public event (street fair)
magnitude:       0.35
sensitivity:     low
confidence:      0.92
context_candidates: 3 (direct_context with time-bound details;
                       world_texture about community gatherings; do_not_use for listener desire)
allowed_claims:  4 — including "expiring around 10 PM tonight"
forbidden_inferences: 4 — including "that the listener wants to go"
```
**Read:** street-fair magnitude 0.35 is well-calibrated — meaningful local event, not a major one. Confidence 0.92 on the facts. Pass.

### p030 — Kelp Surf Co, "20% off rash guards, code SUMMER" (generic promo)
```
category:        brand promotion / time-limited product discount
magnitude:       0.10
sensitivity:     low
confidence:      0.95
context_candidates: 2 (direct_context; do_not_use for assuming the listener surfs)
allowed_claims:  2 — the discount and the code
forbidden_inferences: 4 — including "that the listener surfs or owns a rash guard"
```
**Read:** magnitude 0.10 is the right floor for a generic promo. No assumed personal relevance. Pass.

## Mock-vs-real scoring comparison

Default settings (`voiceThreshold=0.45`, `expandableThreshold=0.65`, `relevanceBaseline=0.5`, `timelinessBaseline=0.5`, focus weights all 1.0). All five items land **ambient** in both modes — junk discipline holds.

| item | scope | closeness | mock<br>mag | real<br>mag | mock<br>score | real<br>score | bucket (both) |
|---|---|---|---:|---:|---:|---:|---|
| p010 | public | acquaintance (0.4) | 0.18 | 0.15 | 0.041 | 0.034 | ambient · ambient |
| p016 | public | distant_family (0.5) | 0.18 | 0.20 | 0.051 | 0.056 | ambient · ambient |
| p020 | public | followed (0.3), 5h to expiry → time=1.0 | 0.30 | 0.30 | 0.068 | 0.068 | ambient · ambient |
| p025 | public | followed (0.3), 9h to expiry → time=0.85 | 0.60 | **0.35** | 0.125 | **0.073** | ambient · ambient |
| p030 | public | followed (0.3), ~25h old → time=0.35 | 0.30 | **0.10** | 0.046 | **0.015** | ambient · ambient |

## Observations to flag (no CS action, per Team Lead "do not modify scoring")

**1. Junk discipline confirmed. Nothing rose.** Junk stayed junk, politics stayed quiet, generic promos stayed ambient. Score floor holds.

**2. Model is BETTER calibrated than the stub on commercial / news items.** Two of the five (p025, p030) have real magnitude *lower* than mock:
- **p025** street fair: real 0.35 < mock 0.60 (the stub treats every news_local item as 0.6; the model rates street fair as moderate, not major). Real is **42% lower** than mock.
- **p030** generic promo: real 0.10 < mock 0.30 (stub assigns brand → place=0.3; the model floors a generic discount). Real is **67% lower** than mock.

This is the *opposite* of the p004 gap. There the model was conservative and the *scoring* needed help; here the model is *more* discriminating than the stub on low-stakes items, which means real meaning actually *strengthens* restraint on junk/commercial.

**3. The "doorway" question Senior raised lurks in this batch too.**
- p020 (Driftwood coffee — listener follows brand, coffee is in interests, 5h to expiry) lands ambient at 0.068. Even with timeliness maxed at 1.0, the followed-tier closeness (0.3) caps the score below any reasonable threshold.
- p025 (street fair tonight — listener's town, time-bound) lands ambient at 0.073.

If "Alex's town has a thing happening tonight and a coffee shop he follows is giving away cups til 6" is *never* even ambient-voiced, that's restraint sliding into deafness. Same family of issue as p004 — but here the cause is **closeness ceiling for "followed" + no relevance signal** rather than threshold blocking a sensitive friend.

Flagging for the team's eventual formula conversation. Three possible fixes (none unilateral):
- Raise the closeness floor for "followed" entities the listener has in `interests`/`followed_entities` on the listener fixture.
- Compute `relevance` from listener interests + entity overlap (currently it's a flat baseline 0.5; this is the per-item relevance work Step 3+ never finished).
- Different bucket: ambient-with-context for time-bound followed-entity items, separate from "voiced highlight."

**4. p016's "ambient" is correct behavior here.** A political family rant *should* never voice. Score 0.056 with everything stacked against it is the right outcome. Senior's "polite corpse" failure mode applies to suppressed *relationship* moments; suppressed *politics* is the system doing its job.

## Schema-on-first-try

5/5 model responses parsed and validated cleanly. The retry path is exercised by the smoke test but has not fired in either live batch (3 items + 5 items = 8 live judgments, all clean).

## Cache state at end of turn

```
playground/.meaning-cache/  →  8 entries
  p004 (from batch 1)
  p008 (from batch 1)
  p018 (from batch 1)
  p010 (new)
  p016 (new)
  p020 (new)
  p025 (new)
  p030 (new)
```

Rerunning either batch now would be 8 hits / 0 calls / 0 retries.

## Standing by

Per Team Lead: **do not run the full corpus.** Standing by for explicit approval before any further live run. PO's `p004` gold-label lock (`voiced, gentle, check-in doorway`) is logged; the formula conversation it teases is a real conversation, not yet underway.

## Repo state at end of turn
- Branch: `main`
- Remote: `https://github.com/eaflores805-Apiana/drift` (public)
- Local HEAD = Remote HEAD (verified in turn summary)
- `_INBOX/` empty
- `playground/.env` exists locally (gitignored)
- `playground/.meaning-cache/` has 8 entries (gitignored)
- Working tree clean after this passdown's commit
