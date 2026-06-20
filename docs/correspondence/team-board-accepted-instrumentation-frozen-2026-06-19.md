# Team Ruling — Diagnostic Board Accepted; Freeze Instrumentation; Labels Next
*Audience: CS Engineer. Delivered via chat 2026-06-19 (evening). Closes the diagnostic-board task; freezes instrumentation; hands the next priority to the Product Owner.*

Diagnostic board accepted.

The work landed in the right shape: rough, bounded, tested, and clearly scoped as Phase B bench instrumentation. The 41/41 smoke checks passing is good, but the most important acceptance result is this:

> Gold-label mismatch does not reuse the safety red/green status vocabulary.

That was the line between a useful microscope and a tool that trains the team to overfit. The board now shows decision anatomy without drawing the conclusion for us.

## What is accepted

The diagnostic board is now part of the Phase B bench.

Accepted behavior:

* Pipeline strip is safety-coded only: `pass / caution / fail / na`
* Gold comparison is a separate neutral axis: `agreement / mismatch / review-needed`
* `p004` is correctly detected as `close_friend_over_suppression`.
* `p002` remains consent-dropped.
* `p020` and `p025` correctly show `label_review_needed`, not "engine wrong."
* `p010`, `p016`, and `p030` do not trigger false-voice mismatch.
* Threshold ticks on score bars are present.
* No scoring changes were made.
* No product UI was built.
* No filters, sort, search, export, animation, or polish were added.

Good restraint.

## Freeze instrumentation here

Do not extend the board right now.

No additional board features unless the team explicitly reopens instrumentation.

Do not add: filters · sorting · search · export · charts · animations · product-style UI polish · new mismatch categories · extra visual layers.

The board has done its job: it makes current scoring decisions inspectable. It is now a microscope, not the next frontier.

## Current priority

The next project priority is Product Owner labeling.

No more scoring changes.
No full-corpus live run.
No additional instrumentation.
No formula tuning.

The next useful signal is labels.

## Labeling slice (PO worklist)

1. `p004` — Mateo rough week
2. `p008` — Dana got the job
3. `p018` — Buena High girls wrestling CIF
4. `p020` — Driftwood coffee drop
5. `p025` — Ventura street fair tonight
6. `p010` — Jordan vague junk
7. `p016` — Uncle Ray politics
8. `p030` — Kelp Surf generic promo

This slice covers the current product tensions: relationship doorway · family highlight · local pride · useful commercial · useful local · vague junk · politics/sensitive · generic promo.

## Important labeling principle

Do not pre-build formula routes yet.

The team has a hypothesis that the eventual scoring system may need separate routes:
- highlight route
- doorway/check-in route
- utility route

But those are hypotheses, not current implementation directives.

The labels should describe desired listener behavior first: `drop`, `ambient`, `voiced`, `expandable`, `voiced-gentle`, `voiced-utility`, `voiced-celebratory`, `review/sensitive`. Let the route structure emerge from labels. Do not tune the scoring formula to match a route hypothesis yet.

## Load-bearing cases to watch

The most important cases for the upcoming formula discussion are:

### `p004`
Tests whether a close, sensitive friend moment can earn a gentle voiced doorway without becoming creepy or speculative.

### `p018` and `p025`
Together test the local/community threshold. `p018` is local pride with emotional weight. `p025` is local utility with time pressure. The distinction matters.

### `p020`
Tests whether followed commercial signal can be useful without turning Drift into ad radio. Followed brand + user interest + time-bound offer is not automatically voiced, but it may deserve more than the current formula gives it.

## Current directive

Stand by.

Use the board only as an inspection aid while labels are produced.

No scoring changes, no new runs, and no board extensions until the eight-item slice is labeled and reviewed by the team.

## Short version

Diagnostic board accepted.
Instrumentation frozen.
Labels next.

---

*Filed by CS Engineer, 2026-06-19. Compliance state: instrumentation frozen at commit `30153d4`. Cache state preserved (8 entries). No code action this turn beyond filing this ruling + the passdown. Standing by for the labeled slice.*
