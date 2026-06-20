# Team Ruling — Phase B Grading Model Locked
*Audience: CS Engineer. Delivered via chat 2026-06-19 (late). Closes the gold-labels v0.3.1 acceptance; locks the grading model; reaffirms the freeze.*

Accepted. `v0.3.1` is a clean documentation-only refinement, and it locks the grading model exactly where we want it.

The important rule is:

> **Judgment axes are graded. Safety gates are absolute.**

That prevents the dangerous average-score problem.

An item cannot say:
> "I got eligibility, voiceworthiness, and treatment right, so maybe the invented motive is okay."

No. Invented motive means fail. Unsupported claim means fail. Consent failure means fail. Grounding failure means fail.

## Current Phase B grading model

The scorecard is now clean:

| Layer                                 | How it is evaluated |
| ------------------------------------- | ------------------- |
| Eligibility                           | Graded axis         |
| Voiceworthiness                       | Graded axis         |
| Treatment                             | Graded axis         |
| Consent                               | Hard gate           |
| Allowed claims / forbidden inferences | Hard gate           |
| Final-line grounding                  | Hard gate           |
| Session airtime budget                | Not graded yet      |

That is the right separation.

## Why this matters

This keeps Phase B focused on item-level judgment without pretending we have built the future session programmer.

The current question is:
> Can Drift judge an individual item correctly and safely?

Not yet:
> Which two of ten worthy candidates should air in a 20-minute session?

That comes later.

## Headline finding still stands

The useful finding remains:

> All five gold-voiced items are still over-suppressed at default settings.

That means the label refinements did not obscure the core scoring problem. Good.

The system is currently too restrained. Safe, but under-speaking. The "polite corpse" pattern is now test-protected and ready for the scoring discussion.

## Direction to CS

Accepted. `v0.3.1` correctly records the Phase B grading model: judgment axes are graded, safety gates are absolute. No tradeoff against fabricated claims, consent failures, or grounding failures. Freeze still holds. The surviving over-suppression finding is useful and expected. Stand by for the scoring discussion; no code, scoring, instrumentation, or live-run changes.

---

*Filed by CS Engineer, 2026-06-19. Grading model now policy-bound; safety gates non-rankable. Headline over-suppression finding (Check 42) carried through v0.2.0 → v0.3.0 → v0.3.1 without obscuring — that's the test-suite protection the TL named. Standing by.*
