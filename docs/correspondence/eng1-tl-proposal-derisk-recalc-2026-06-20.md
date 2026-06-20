# Eng1 → TL — Proposal: Earned De-Risk Recalculation for Separable-Risk Items

> **Correspondence / proposal requesting a TL ruling. Not yet ratified.** Eng1 (Senior), 2026-06-20.
> Proposed as a **required** safety rule, not an optional optimization. If TL concurs (PO's position is already yes), it becomes binding and is **documented + enforced** per the closing section — a required safety rule lives in the spec and the test suite, never in correspondence alone.

## Context

The live meaning pass on the community cluster produced one safety win and one formula question.

**The safety win — p045.** A local school post names four minors and includes their photo. The meaning pass recognized the community achievement, marked the item high sensitivity, and forbade identifying or spotlighting any named minor in a DJ line. The cage worked.

**The formula question.** Under v3, p045 is scored through the high-sensitivity damper, which suppresses it below its same-magnitude low-sensitivity peer p041 (0.336 vs 0.560 — the entire 0.224 gap is the damper). That treats the *minor-risk signal* as *reduced voiceworthiness*. But p045 is a strong community win that should voice group-level; the risk is the names, not the importance. This memo separates those two concerns without weakening the floor.

## The standing policy this implements

The mechanism exists to serve one scope rule for minor-involved community content (this is the policy; the mechanism below is how it's enforced in scoring/treatment):

```
Public + positive + group/institutional achievement
  → IN SCOPE, group-level only, names and faces ALWAYS stripped,
    FAIL CLOSED to silence if the strip is not provably clean.

Private, OR negative, OR anything that spotlights an individual
  → NEVER voiced, regardless of separability.
```

p045 (a public, positive, group achievement) is on the "in scope" side. A minor's private struggle ("worried about my boy") is on the "never" side — and note the rule reaches that correctly *for free*: a private struggle is not separable from the child, so it fails the separability test below and stays silent. The line does its job in both directions.

## The mechanism

Introduce an **earned de-risk recalculation** path for items whose risk is separable from the public payload.

```
identify AND separate  → recalc on the safe residual
can't identify, OR can't separate  → fail closed
```

A recalc is allowed only when **both** hold:

1. **The system can identify the risk** — names, faces, private identifiers, individual minor references, or other content that cannot be aired.
2. **The system can cleanly separate it from the public payload** — the risky material can be stripped, a safe residual claim remains, the residual is still meaningful enough to voice, and **no indirect identifier remains**.

Only when both are true does the scorer evaluate voiceworthiness on the **safe residual** rather than the raw input.

## What "fail" means (it is conservative, not fatal)

Fail does **not** mean the item dies. It means the item is **not granted the de-risk bonus** and falls back to current cautious treatment: fully sensitive, gentle routing, sensitivity damper applies, possibly silent. The failure reads as *"we could not prove a safe residual, so we refused the shortcut"* — never *"we guessed it was probably safe and scored it higher."* The recalc is a bonus a cleanly-separable item earns; failing it costs only the bonus, never safety.

## The trust model (load-bearing — the part TL must rule on explicitly)

**"Can separate" must be a deterministic verification, not a model assertion.**

The dangerous version of this feature is an overconfident strip: the model cuts "Maya R." but misses "the coach's daughter," asserts the residual is clean, recalcs high, and now a voiced score rides on residual risk. To prevent that:

- the model may **propose** a safe residual;
- a **deterministic gate must verify it is clean** before the recalc is honored;
- **uncertainty fails closed.**

"Demonstrably clean" means *demonstrated to a check* — not *the model felt sure*. This is the same shape as every other load-bearing decision in the system (the eligibility gate is "structural, never a model opinion"); the separability decision must not be the one place we put a model opinion on the safety path. **A ruling that approves the mechanism without specifying this trust model would bless a model-opinion safety gate by omission — which is the one thing we have consistently refused.**

## Relationship to the sensitivity damper (this is NOT a hole in it)

We always apply the damper. When recalc fires, the **safe residual gets its own sensitivity rating** — and for a stripped public achievement ("Anacapa's science team won the county fair") that rating is *low*, so the damper is 1.0 **for the thing that actually airs.** We are not skipping the damper or carving an exception into the safety multiplier; we are applying it to the residual instead of the raw input. The raw input's high sensitivity did its job — it triggered the strip — and then the damper evaluates what's left.

## Guardrails (strict, fail-closed)

A recalc is **forbidden** if any holds:

- the risky content cannot be fully identified;
- any name, face, private identifier, or **indirect** identifier would remain;
- the safe residual depends on the risky content (strip it and the payload collapses);
- the item involves private suffering, grief, illness, family conflict, or any other **non-separable** sensitive event;
- the separability cannot be **verified deterministically** (model assertion alone is not sufficient);
- the system is uncertain.

**Uncertain is a fail. Partial is a fail. Probably-clean is a fail. Only demonstrably-clean earns the recalc.**

**The seed source is never edited.** The de-risk is a processing step on the *aired* form — the residual is derived for airing; the corpus entry (which contains the names and the photo reference) stays intact. The fixture's entire value is that the source offers the names and the system refuses them; stripping them from the seed data would delete the test.

## Examples

**Allowed recalc — public school team win, named minors (p045).**
Risk identified: named minors, photo/likeness, individual spotlighting.
Safe residual (derived for airing; source unchanged): *"Anacapa Middle School's science team won first place at the county science fair."*
Result: recalc allowed (residual verified clean) → voiceworthiness evaluated on the residual → routes voiced, group-level only, names forbidden.

**No recalc — grief / death.** *"Mateo shared that his dad passed away."* The sensitive content **is** the payload; there is no residual that preserves the meaning while removing the sensitive event. Result: no recalc; treat as fully sensitive / grave doorway.

**No recalc — indirect identifier remains.** *"The coach's daughter won the county science fair."* Even with no name, "the coach's daughter" may identify the minor locally. Result: no recalc unless the residual can fully remove the indirect identifier — e.g. *"A local school science team won first place"* — and if that residual is too vague to remain meaningful, no recalc.

## Relationship to v3

This avoids prematurely removing the sensitivity damper. It asks a narrower question: should p045 feed the damper as a *fully sensitive raw item*, or be transformed into a *verified safe residual first* and then scored? If TL approves, **the p045 issue is solved as a meaning/treatment calibration, not a v3 shape change** (v3 stays `additive × confidence × sens_damper`; it is simply fed the residual's sensitivity). If the mechanism is rejected, the damper question returns as a real formula-shape ruling.

## Test & enforcement — two permanent regressions (both required)

The mechanism's safety lives in the *fail* branch, so we prove both directions:

1. **p045 — the separable-risk regression (proves the bonus fires).** Raw source triggers minor treatment → de-risk identifies named minors → residual produced and **verified clean** → recalc runs → routes voiced group-level → generator remains forbidden from naming/spotlighting. Must pass.
2. **Constructed inseparable-sensitivity probe — the guard (proves the refusal holds).** A grief or illness item where the sensitive thing *is* the payload. The recalc must **refuse** it — forever. This is the exact mirror of the high-magnitude/low-confidence probe that guards the damper: a regression that *should* fail and confirms it does. Without it we have locked down the convenient half (recalc fires) and left the dangerous half (recalc must refuse) untested.

If either probe fails, the mechanism is not sound and does not ship.

## Documentation & enforcement path (the "required rule" requirement)

This is a required rule, so on ratification it lands in two places, not in correspondence:

- **An ADR in `docs/07-decision-log.md`** records the binding decision (the mechanism, the trust model, the fail-closed default, the standing scope policy), decision-class ESCALATE-IF-CHANGED.
- **The operational detail** lands in the canonical safety spec (the life-event taxonomy's minor-treatment section and/or `rules-and-format.md`), so the rule is where engineers reading the spec will find it.
- **`playground/scripts/smoke-test.ts`** carries both probes (p045 separable + the inseparable grief probe) as permanent safety regressions.

A required safety rule is documented in the spec **and** enforced in the suite. This memo is the proposal; ratification produces those three artifacts.

## Requested TL ruling

```
1. May Drift recalculate voiceworthiness on a safe residual ONLY when the
   system can both IDENTIFY and CLEANLY SEPARATE the risky material?

2. Must separability be a DETERMINISTIC verification (model proposes,
   a structural check verifies), never a model assertion?
```

Recommended ruling: **Yes to both, with strict fail-closed separability.**

Non-negotiable: **if the residual cannot be PROVEN clean by a check, no recalc occurs.** Uncertain fails closed.

## Why this is the safer option

It preserves the safety floor while preventing positive public community wins from being suppressed solely because the source included *removable* risky identifiers. And it keeps the architecture honest:

```
importance       decides whether the item can rise
treatment        decides how it may be voiced
safety gates     decide what is forbidden — above the math, always
```

The de-risk recalc is not a shortcut around safety. It is a controlled, deterministically-verified way to score the *safe version* of an item after safety has already done its job.
