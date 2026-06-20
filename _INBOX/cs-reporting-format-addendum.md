# CS Reporting Format — Self-Auditing Numbers
> For `governance/` (or appended to `ONBOARDING-CS.md`). Drafted by Engineer 1, 2026-06-19. Standing addition to how CS reports computed results — not a one-off request. Reason: as the project moved from prose decisions into computed artifacts (scores, tables, cache stats), team review shifted from "verifying the work" to "trusting CS's arithmetic." This makes the arithmetic checkable on its face, so the team can depend on incoming data without independently re-running it.

## The principle
> **Every reported number ships with enough of its derivation that a reader can recompute it by hand. Every load-bearing finding cites the deterministic check that protects it.**

A number without its inputs is something the team has to *trust*. A number with its inputs is something the team can *verify*. Default to verifiable.

## What this requires, concretely

### 1. Computed values carry their inputs
When reporting a score, gap, rate, or any derived figure, show the formula and the inputs that produced it — not just the result.

- **Not enough:** `p018 effective score 0.110`
- **Self-auditing:** `p018: magnitude 0.65 × closeness 0.30 × relevance 1.0 × timeliness 1.0 × focus 1.0 = 0.195 raw → 0.110 effective [bucket boundary applied]` — show each step that isn't obvious, including any transform between raw and effective.

If a value passes through a non-obvious transform (raw→effective, decay curve, tier→numeric map), name the transform so the reader can follow raw inputs all the way to the reported number. The test: could a teammate with the table and the formula reproduce this row with a calculator? If not, a step is missing.

### 2. Load-bearing findings cite the check that protects them
When a packet asserts something the team will *act on* — "the floor is safe," "p002 never airs," "no model calls fired" — name the deterministic check that backs it, so the claim rests on a test, not on CS's assurance.

- **Not enough:** "Sliders don't trigger model calls."
- **Self-auditing:** "Sliders don't trigger model calls — asserted by smoke check #N (no model client imported in the slider path; verified 0 calls at all threshold settings)."

If a load-bearing claim has *no* check protecting it, say so explicitly: **"unverified — no check covers this yet."** That flag is itself valuable; it tells the team exactly where a number rests on trust rather than test, and where a check should be added before the finding is relied on.

### 3. Structural ceilings / impossibility claims show the bound
When CS reports that something *can't* happen ("no global threshold voices all five without raising junk"), show the arithmetic that proves the bound — the way the 0.300 followed-tier ceiling was shown (`1.0 × 0.3 × 1.0 × 1.0 = 0.300`). An impossibility claim with its bound shown is a proof the team can check; without it, it's an assertion.

### 4. Distinguish measured from computed from asserted
Tag where a number came from, because the three carry different trust:
- **measured** — came out of an actual run (cache stats, call counts, retry counts).
- **computed** — derived by the formula from inputs (scores, gaps). Show inputs (rule 1).
- **asserted** — CS's reasoning/judgment about the above (diagnoses, "most consistent with combination fixes"). Clearly the *interpretation* layer, distinct from the data it sits on.

The scoring packet did this well in spirit (diagnoses were marked "observation, not prescription"). Make it a habit: the reader should always be able to tell which lines are data and which are CS's read of the data.

## What stays the same
This is a *reporting* norm, not new process or oversight. It doesn't expand what the team approves, doesn't slow CS down (the inputs already exist — this is about *showing* them), and doesn't touch the decision classes. CS still implements and owns the code; this only changes the shape of the report so its numbers audit themselves.

## The one-row reconcile (team side)
Complementary habit for the team, not a CS task: when a packet carries a load-bearing finding, the PO or Team Lead (who have repo access) reconciles **one** row by hand — confirm the table's inputs produce the table's number. One row reconciling is strong evidence the formula encoding is sound; one row failing catches the exact class of error a description-only review is blind to. Pick the load-bearing row (e.g. the one the formula decision hinges on).

## One-line rule
> **Show the inputs, cite the check, flag the unverified. A number the team can recompute is a number the team can depend on.**
