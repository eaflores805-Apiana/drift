# ADR — Route-Aware Ranking as the Layer 1 Scoring Contract
### And the resolution of the formula-shape test (Step 1.1)

> **2026-06-19 · Decision class: ESCALATE-IF-CHANGED.** Binding. Resolves the open question surfaced by the Step 1.1 formula-shape test (`cs-formula-shape-test-report-2026-06-19.md`, commit 49f25a3). Decided by PO/team. Eng1 + Eng2 + CS concur.

---

## Context
The Step 1.1 test scored three formula shapes against the 8 locked labels plus a constructed high-magnitude/low-confidence probe. **v3 (additive-with-dampers) was the only shape that kept the probe in band** (0.223) while v1 (0.191) and v2 (0.930) both over-voiced it. But v3 ranked p004 (Mateo's sensitive doorway item) *below* utility items in a **global** cross-tier ranking — and CS proved by arithmetic that this is **not** fixable by damper tuning (even with the sensitivity damper at 1.0, p004 = 0.265, below the utility band).

CS correctly surfaced the real question rather than tuning past it: *is global voiceworthiness-ordering the contract the formula must satisfy, or is route-aware ranking the actual contract?*

---

## Decision
**Drift adopts route-aware ranking as the Layer 1 scoring contract.**

- **Layer 1 (scorer) ranks candidates *within* their route.** It answers: *is this item eligible, how strong is it for its route, and is it safe enough to consider?*
- **Layer 2 (session programmer) decides *cross-route* airtime.** It answers: *given the music, recent breaks, tone, repetition, airtime budget, and session arc — should this route speak now?*

A single global voiceworthiness ranking is rejected.

---

## Reason
Routes represent different airtime jobs, risk profiles, and treatments. A gentle doorway beat, a local-pride beat, a utility nudge, and a music-history beat do **not** compete in one raw global pool — forcing them to would flatten taste back into a single leaderboard, which **is the feed problem Drift exists to escape.** Drift is sparse, programmed radio, not a ranked notification feed: the few spoken minutes per hour are valuable because they are *programmed*, not because everything was dumped into one ranking and the top number won. A global score forces the scorer to solve a *programming* problem that belongs to Layer 2.

---

## Formula direction
- **Carry v3 (additive-with-dampers) forward.** Do not reopen v1/v2.
- **The high-magnitude / low-confidence probe becomes a permanent regression test** — must pass on every formula change.
- **No asymmetric dampers.** Adding them would contort the scorer to make a doorway item beat a utility item *globally* — solving the wrong problem, because the test was asking the formula to do Layer 2's job.

---

## The p004 reclassification
**p004 is not a v3 failure under the accepted contract.** It is evidence that *global cross-tier ranking was the wrong test shape.* p004 ranks correctly *within the doorway route*; it was never meant to out-rank a utility item, because they don't share a pool. The result corrected our *interpretation*, not our formula — which is why it resolved with zero tuning.

---

## The crucial invariant: voiceworthiness is route-local, safety is global
Route-aware ranking partitions the **voiceworthiness** question. It must **not** partition the **safety** question.

```
Within each route:
  strong_candidate > candidate > not_voiceworthy

Across routes:
  no strict global ordering required

GLOBAL safety invariant (holds across ALL routes):
  low-confidence high-magnitude items must never out-voice safe,
  well-grounded candidates simply because magnitude is high
```

The probe protects this global safety property. Safety invariants do not live inside routes — they hold across all of them. This is the line that must never blur: **route-aware ranking is a voiceworthiness decision, not a safety relaxation.** Absolute safety gates (consent, allowed-claims, forbidden-inference, grounding) remain *outside* the score entirely, as before.

---

## Step 1.3 direction (gated on community-cluster labeling)
1. Carry v3 forward.
2. **Fit constants by route, not by global ordering.**
3. Keep absolute safety gates outside the score.
4. Preserve the probe as a must-pass regression.
5. Treat cross-route choice as a Layer 2 / session-programmer responsibility.
6. Do **not** tune v3 to make p004 beat utility globally.

**Still gated on:** the community-cluster labeling (PO task) for the floor constant. The sensitive cluster (via the 8) fits the doorway route.

---

## Consequence to make with eyes open
This commits a real boundary: the **scorer ranks within-route; the session programmer owns cross-route airtime competition.** That is a clean separation and it matches the architecture — but it formally hands cross-route airtime to Layer 2, which must be built to own it. Recorded deliberately, not as a side effect of resolving p004.
