# Team Ruling — Route-Aware Ranking as the Layer 1 Scoring Contract
*Audience: CS Engineer. Delivered via chat 2026-06-20. Closes Step 1.1 (formula-shape) and answers the open question CS surfaced about cross-tier vs route-aware ranking. Binding architectural decision.*

## Status

Step 1.1 is accepted as delivered.

The formula-shape question is now closed:

* Carry **v3 additive-with-dampers** forward.
* Do **not** reopen v1 or v2.
* Do **not** add asymmetric dampers to rescue p004 globally.
* Treat the high-magnitude / low-confidence probe as a permanent regression test.
* Adopt **route-aware ranking** as the Layer 1 scoring contract.

## Binding decision

Drift adopts route-aware ranking as the Layer 1 scoring contract.

Layer 1 ranks candidates **within their route**. It answers:

> Is this item eligible, how strong is it for its route, and is it safe enough to consider?

Layer 2 owns **cross-route airtime**. It answers:

> Given the music, recent breaks, tone, repetition, airtime budget, and session arc — should this route speak now?

A single global voiceworthiness ranking is rejected.

## Reason

The global-score interpretation was the wrong abstraction.

Drift is not rebuilding the feed with a prettier leaderboard. A doorway beat, a local-pride beat, a utility nudge, and a music-history beat do not compete in one raw global pool. They have different airtime jobs, risk profiles, and treatments.

The scorer should not be forced to solve a radio-programming problem. That belongs to Layer 2.

## p004 resolution

p004 is not a v3 failure under the accepted contract.

Its apparent failure came from testing p004 against utility items in a global cross-tier ordering. Under the actual contract, p004 only needs to rank correctly inside the doorway route. It was never required to out-rank a utility candidate because they do not share a route pool.

Therefore:

* Do not tune v3 to make p004 beat utility globally.
* Do not add asymmetric dampers for this purpose.
* Treat the p004 result as evidence that the global test shape was wrong, not that the formula shape was wrong.

## Crucial invariant

Voiceworthiness is route-local.

Safety is global.

Within each route:

```txt
strong_candidate > candidate > not_voiceworthy
```

Across routes:

```txt
no strict global ordering required
```

Global safety invariant:

```txt
low-confidence high-magnitude items must never out-voice safe,
well-grounded candidates simply because magnitude is high
```

The high-magnitude / low-confidence probe protects this global safety property and must remain a regression test on every formula change.

Absolute safety gates remain outside the score:

* consent
* allowed claims
* forbidden inference
* grounding
* high-sensitivity false-voice prevention

Route-aware ranking is not a safety relaxation.

## Step 1.3 direction

Proceed to Step 1.3 only after the community-cluster labeling exists.

When unblocked:

1. Carry v3 forward.
2. Fit constants **by route**, not by global ordering.
3. Keep absolute safety gates outside the score.
4. Preserve the probe as a must-pass regression.
5. Treat cross-route choice as a Layer 2/session-programmer responsibility.
6. Do not tune v3 to make p004 beat utility globally.

## Build-map note

The ADR creates one explicit future dependency:

Layer 2 now formally owns cross-route airtime competition.

This does not change build order. Layer 2 is still gated on generation across routes. But when Layer 2 is reached, the session programmer must be designed to own route selection deliberately: music fit, tone, recent breaks, repetition, airtime budget, and session arc.

## Immediate blocker

Step 1.3 is gated on the PO's community-cluster labeling.

Once those labels are available, run the route-aware v3 constant-fitting pass.

---

*Filed by CS Engineer, 2026-06-20. Adds ADR J1 to `docs/07-decision-log.md`. Probe assertion added to `playground/scripts/formula-shape-test.ts` (script-level regression — fails loudly if any future damper tweak lets the probe out-voice the strong_candidate band). Step 1.3 stays in standby state.*
