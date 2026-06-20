# CS Reporting Standards — Self-Auditing Numbers
*Standing addition to how CS reports computed results. Drafted by Engineer 1, 2026-06-19. Applies to every packet, passdown, and chat reply that contains computed values or load-bearing findings.*

## The principle

> **Every reported number ships with enough of its derivation that a reader can recompute it by hand. Every load-bearing finding cites the deterministic check that protects it.**

A number without its inputs is something the team has to *trust*. A number with its inputs is something the team can *verify*. Default to verifiable.

## What this requires, concretely

### 1. Computed values carry their inputs

When reporting a score, gap, rate, or any derived figure, show the formula and the inputs that produced it — not just the result.

- **Not enough:** `p018 effective score 0.110`
- **Self-auditing:** `p018: magnitude 0.65 × closeness 0.30 × (0.5 + 0.5·relevance 0.5) × (0.5 + 0.5·timeliness 0.5) = 0.110 raw; × focus 1.0 = 0.110 effective`

If a value passes through a non-obvious transform (raw→effective, decay curve, tier→numeric map), name the transform so the reader can follow raw inputs all the way to the reported number.

**The test:** could a teammate with the table and the formula reproduce this row with a calculator? If not, a step is missing.

### 2. Load-bearing findings cite the check that protects them

When a packet asserts something the team will *act on* — "the floor is safe," "p002 never airs," "no model calls fired" — name the deterministic check that backs it, so the claim rests on a test, not on CS's assurance.

- **Not enough:** "Sliders don't trigger model calls."
- **Self-auditing:** "Sliders don't trigger model calls — asserted by Check 21 (`Sliders do not touch the meaning cache` — 0 hits / 0 misses after 3 rescores) and Check 14 (`Zero LIVE model calls in this smoke`)."

If a load-bearing claim has **no** check protecting it, say so explicitly:

> **"unverified — no check covers this yet."**

That flag is itself valuable. It tells the team exactly where a number rests on trust rather than test, and where a check should be added before the finding is relied on.

### 3. Structural ceilings / impossibility claims show the bound

When CS reports that something *can't* happen ("no global threshold voices all five without raising junk"), show the arithmetic that proves the bound — the way the 0.300 followed-tier ceiling was shown:

```
max possible raw score at closeness=0.3:
  mag(1.0) × closeness(0.3) × rel-boost(1.0) × time-boost(1.0)  =  0.300
```

An impossibility claim with its bound shown is a proof the team can check; without it, it's an assertion.

### 4. Distinguish measured from computed from asserted

Tag where a number came from, because the three carry different trust:

| Tag | Source | Example |
|---|---|---|
| **measured** | Out of an actual run | cache hits/misses, call counts, retry counts, smoke pass/fail |
| **computed** | Derived by the formula from inputs | scores, gaps, threshold-gap deltas. **Show inputs (rule 1).** |
| **asserted** | CS's reasoning/judgment about the above | diagnoses, "most consistent with combination fixes" |

The reader should always be able to tell which lines are data and which are CS's read of the data. The scoring packet on 2026-06-19 marked diagnoses as "observation, not prescription" — make that distinction a habit, not an occasional gesture.

## What stays the same

This is a *reporting* norm, not new process or oversight.

- It doesn't expand what the team approves.
- It doesn't slow CS down — the inputs already exist; this is about *showing* them.
- It doesn't touch the decision classes (Class 1 / 2 / 3 per the roles memo).

CS still implements and owns the code. This only changes the shape of the report so its numbers audit themselves.

## The one-row reconcile (team-side, not CS's task)

Complementary habit for the team: when a packet carries a load-bearing finding, the PO or Team Lead (who have repo access) reconciles **one** row by hand — confirm the table's inputs produce the table's number.

- One row reconciling = strong evidence the formula encoding is sound.
- One row failing = catches the exact class of error a description-only review is blind to.

Pick the load-bearing row (e.g. the one the formula decision hinges on).

## One-line rule

> **Show the inputs, cite the check, flag the unverified. A number the team can recompute is a number the team can depend on.**

---

*Filed by CS Engineer, 2026-06-19. Linked from `ONBOARDING-CS.md` standing orders so every session begins with this in view.*
