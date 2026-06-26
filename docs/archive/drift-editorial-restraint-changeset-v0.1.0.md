# Drift — Next-Cycle Change Set: Editorial Restraint (validation tic + declined valence)
### Prompt rules · packet fields · Box 8b denylists · the test passes · what's deferred

> **CHANGE SET · v0.1.0 · 2026-06-23.** For CS to implement and test. Addresses the two soft spots the 50-post draft read surfaced: **(1)** the validation/editorializing tic (the model grading the rightness of a feeling), and **(2)** imposing a framing the source declined (G40 gen3). Incorporates TL's two corrections and TL's packet/test design.
>
> **Hard boundary:** this targets a **NEW prompt version (v0.4.0-draft)** and a **new 8b ruleset**. The validated, frozen **v0.3.2 / box8-v0** is NOT touched. Nothing here merges until tested in the three bounded passes below and signed off (Class-1: TL + PO).
>
> **TL's two corrections, baked in:**
> - **Declined valence is only *partly* mechanical.** The packet can deterministically *state* a declined framing; deciding whether generated prose *reads* as that framing is semantic. v0 enforces the **obvious lexical forms** mechanically and **fails closed to a factual template** on uncertain cases. We do not pretend a boolean solved valence detection.
> - **Adjudication ≠ acknowledgment.** "That's fair / that makes sense / that's exactly right" *grade the correctness of a feeling* — forbidden. "That's a whole life" may be *generic acknowledgment of weight* — not necessarily forbidden. The rule targets **adjudicating someone's feelings or choices**, not all warmth. Blanket-removing acknowledgment trains the host into a court stenographer, which is its own failure (restraint as respect, not sterility).

---

## 1 — Prompt rules (route-scoped to sensitive + grave; added to v0.4.0-draft)

### Rule 1 — no adjudicating the interior
> Report the person's stated facts and framing without judging whether their feelings, choices, or reactions are right, fair, understandable, brave, or appropriate. Acknowledge the moment without grading it. Open the door and leave.

Targets the observed tic: *"That tracks." · "That's fair." · "That makes sense." · "That's exactly right." · "That's the right thing to be."*
Does **not** globally prohibit warmth on celebrations, and does **not** ban restrained acknowledgment in grave copy. The line is *grading the feeling* vs. *acknowledging the moment* — forbid the first, allow the second.

### Rule 2 — preserve declined framing
> If the packet says the source declined a framing, do not apply that framing or an equivalent one. If they say they are not celebrating, do not call the event good news, a win, or a reason to celebrate.

Targets the G40 error directly: the post explicitly rejected celebration ("not posting to celebrate"); gen3 overrode it with "Someone heard something good today." That is not harmless color — it is contradicting the person's chosen framing, and it needs its own constraint.

---

## 2 — Packet fields (new; the meaning pass derives them, the builder carries them)

Replace the single `declined_valence` boolean (rejected as too coarse) with three fields that describe the actual editorial permission:

```
VALENCE POLICY:        preserve_source | do_not_resolve | factual_only |
                       celebratory_allowed | gentle_negative_allowed
DECLINED FRAMINGS:     [ celebration | sympathy | outreach | advice ]   (list, may be empty)
OUTREACH POLICY:       allowed | source_requested | prohibited
```

Why three, not one: the real posts make distinctions a boolean can't carry.
- A source may **reject celebration but permit plain acknowledgment** (G40 — "not celebrating" ≠ "say nothing").
- A source may **share grief but prohibit outreach** (G46 "not ready to talk", G47 "don't ask" — the grief is shareable; the "reach out" doorway is not).
- `VALENCE POLICY: do_not_resolve` is the ambiguous-tier contract (hold valence open); `factual_only` is the strictest (state the fact, no coloring at all).

---

## 3 — Box 8b changes (new ruleset; route-scoped to sensitive + grave)

### 3a — Approval-construction denylist *(the mechanical floor for Rule 1)*
Block these constructions on sensitive/grave items unless the wording is a **permitted direct quote** (in PERMITTED SOURCE SPANS):
```
that's fair
that tracks
that makes sense
that's exactly right
that's the right thing
of course you feel
anyone would feel
you have every right to
```
Same machinery as the existing forbidden-vocabulary denylist. **Honest limit:** this catches the *observed forms*, not the *category* — it's whack-a-mole, raising the floor on the known phrasings while the durable category-fix (§5) is built. Worth having anyway, given the stakes, exactly as the forbidden-vocab list is.

### 3b — Declined-framing enforcement *(partly mechanical — fails closed)*
When `DECLINED FRAMINGS` contains `celebration`, block the obvious lexical forms:
```
good news
great news
a win
reason to celebrate
congratulations
something good happened
```
(Analogous block-lists for `sympathy`, `outreach`, `advice` when those are declined — e.g. declined `outreach` blocks "reach out to them," "send them a note," "check in on them.")

**The fail-closed rule (TL's correction):** if the line's *stance* is uncertain — it doesn't hit a denylisted form but may still read as the declined framing — **do not let the generation model judge its own compliance.** Route to a **factual template or silence.** We enforce the obvious; we fall back on the ambiguous; we never guess that ungrounded-but-not-denylisted prose is safe.

---

## 4 — The test (three bounded passes — never change prompt and gate at once)

```
A. PROMPT-ONLY RERUN
   New prompt (v0.4.0-draft), OLD gate, same sensitive/grave packets.
   Measure: validation-tic rate, valence-miss rate. Isolates the prompt's effect.

B. GATE REPLAY  (zero new model calls)
   Run BOTH the old run's outputs AND pass-A's outputs through the NEW 8b rules.
   Measure: denylist catches, false-blocks. Isolates the gate's effect on existing text.

C. COMBINED RUN
   New prompt + new packet fields + new gate, end to end.
```

**Success criteria (pre-registered):**
```
directness canary still holds            (stated-grave named, implied-grave vague — no regression)
implied cases remain vague
G40-style declined-valence violations = 0
approval / validation tics fall sharply
catastrophic aired = 0
false-block rate reviewed                (the denylist must not over-block grave acknowledgment)
grave copy does NOT become universally sterile   ← the court-stenographer guard
```
That last criterion is load-bearing: if the change makes grave copy *clinical*, the fix overshot. We want restraint, not sterility.

---

## 5 — Deferred to next gate-design step: **semantic claim coverage** (the durable #3 fix)

The denylist (§3a) catches phrasings, not the category. The durable fix is to check that *every clause* maps to permitted content — but once paraphrase enters, this is **not purely mechanical** (mapping "keeping that close" → "not ready to talk" is entailment, not string-matching). So it is named honestly as **semantic claim coverage**, not a deterministic clause mapper:
```
generated line
 → split into factual and editorial clauses
 → map each clause to:  allowed claim | approved generic warmth |
                        approved connective furniture | UNSUPPORTED editorial content
 → deterministic disposition
```
A bounded semantic classifier / entailment model may do the mapping. This does **not** violate the doctrine *provided*:
- the classifier provides **evidence, not permission**;
- the final state transition stays **deterministic**;
- **uncertainty fails closed**;
- it has a **frozen regression corpus**;
- it **cannot approve its own generated output** because the prose "feels fine."

This is the next gate-design step, not part of this change set.

---

## 6 — Not now: LoRA
Held. If the editorializing remains systematic *after* prompt + packet + gate improvements across a **much larger corpus**, fine-tuning becomes worth testing — as a *quality/consistency* lever (its right home is Phase-5 voice consistency), never as the safety mechanism. Right now we have cheaper, transparent levers that preserve attribution. The escalation order stands: prompt → packet → gate denylist → semantic claim coverage → (only then) LoRA.

---

## Summary for CS
Implement against a **new v0.4.0-draft prompt + new 8b ruleset** (frozen v0.3.2 / box8-v0 untouched): two route-scoped prompt rules, three packet fields (replacing the boolean), an approval-construction denylist + declined-framing block-lists in 8b with **fail-closed-to-template on uncertainty**. Test in **three bounded passes** (prompt-only → gate-replay → combined), pre-registered success criteria above, with the **court-stenographer guard** (grave copy must not go sterile) as a hard check. Put **semantic claim coverage** on the next gate-design step. Hold LoRA.
