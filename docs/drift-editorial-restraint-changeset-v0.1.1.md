# Drift — Next-Cycle Change Set: Editorial Restraint (validation tic + declined valence)
### Prompt rules · packet fields · Box 8b denylists · the test passes · what's deferred

> **CHANGE SET · v0.1.1 · 2026-06-23.** For CS to implement and test. Addresses the two soft spots the 50-post draft read surfaced: **(1)** the validation/editorializing tic (the model grading the rightness of a feeling), and **(2)** imposing a framing the source declined (G40 gen3). Incorporates TL's corrections and TL's packet/test design.
>
> *v0.1.1 — TL's three corrections before hand-off: **(1)** Pass A split into A1/A2 (both on augmented packets), because the new prompt depends on the new packet fields, so "new prompt + old packets" would move two variables; **(2)** packet schema decomposed (DECLINED FRAMINGS no longer also carries outreach/advice — those get their own policy fields), and every non-default policy must carry an evidence span so the Meaning Pass can't manufacture an unauditable boundary; **(3)** "fail-closed on uncertain stance" removed as unimplementable on a lexical gate — the uncertain case is a measured manual-review flag, not an automatic gate action.*
>
> **Hard boundary:** this targets a **NEW prompt version (v0.4.0-draft)** and a **new 8b ruleset**. The validated, frozen **v0.3.2 / box8-v0** is NOT touched. Nothing here merges until tested in the three bounded passes below and signed off (Class-1: TL + PO).
>
> **TL's load-bearing corrections, baked in:**
> - **Declined valence is only *partly* mechanical.** The packet can deterministically *state* a declined framing (with an evidence span); deciding whether generated prose *reads* as that framing is semantic. v0 enforces the **obvious lexical forms** mechanically, routes `factual_only` items to a template, and **flags the uncertain-stance case for measured manual review** — it does *not* claim the gate auto-catches it. Full semantic detection is deferred to semantic claim coverage. We do not pretend a boolean solved valence detection, and we do not claim "fail-closed on uncertainty" the lexical gate can't deliver.
> - **Adjudication ≠ acknowledgment.** "That's fair / that makes sense / that's exactly right" *grade the correctness of a feeling* — forbidden. "That's a whole life" may be *generic acknowledgment of weight* — not necessarily forbidden. The rule targets **adjudicating someone's feelings or choices**, not all warmth. Blanket-removing acknowledgment trains the host into a court stenographer, which is its own failure (restraint as respect, not sterility).
> - **Boundaries must be auditable.** Every non-default policy carries the exact source span that justified it; an empty field is never read as "no boundary exists" (under-extraction is the dangerous direction, and it becomes load-bearing the moment these fields are used to *lift* the blanket).

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

Replace the single `declined_valence` boolean (rejected as too coarse) with fields that describe the actual editorial permission — **decomposed so no two fields govern the same concept** (TL correction 2):

```
VALENCE POLICY:        preserve_source | do_not_resolve | factual_only |
                       celebratory_allowed | gentle_negative_allowed
DECLINED FRAMINGS:     [ celebration | sympathy ]        (list, may be empty)
OUTREACH POLICY:       route_permitted | source_requested | prohibited
ADVICE POLICY:         source_requested | prohibited
```

**Every non-default policy MUST carry the exact source span that justified it** — otherwise the Meaning Pass can quietly manufacture a boundary nobody can audit:
```
DECLINED FRAMING EVIDENCE:  ["not posting to celebrate"]
OUTREACH EVIDENCE:          ["please don't message"]
ADVICE EVIDENCE:            [...]
```
This is the same discipline as PERMITTED SOURCE SPANS for claims, applied to *boundaries*: a claimed boundary that points at no span is not a real boundary. It makes the extraction **auditable** — you can check the span actually exists in the source — which is the guard the (model-based, otherwise unguarded) Meaning Pass layer needs.

**Why decomposed, not one list:** putting `outreach`/`advice` *inside* DECLINED FRAMINGS while *also* having an OUTREACH POLICY field creates conflicting authorities (two fields governing outreach, undefined when they disagree). One concept → one field → one authority. DECLINED FRAMINGS now carries only framings with no other home (celebration, sympathy); outreach and advice get their own policy fields.

Why these distinctions at all: the real posts make them.
- A source may **reject celebration but permit plain acknowledgment** (G40 — "not celebrating" ≠ "say nothing").
- A source may **share grief but prohibit outreach** (G46 "not ready to talk", G47 "don't ask" — the grief is shareable; the "reach out" doorway is not).
- `VALENCE POLICY: do_not_resolve` is the ambiguous-tier contract (hold valence open); `factual_only` is the strictest (state the fact, no coloring at all).

**Upstream trust rule (the asymmetry that matters):** these fields are trustworthy for *adding* caution (a populated DECLINED FRAMINGS → extra restraint), but an **empty field must NOT be read as "no boundary exists"** — the model may simply have missed it. Under-extraction is the dangerous direction. For grave/sensitive this is moot under the v0 blanket (everything routes away regardless), but it becomes load-bearing the moment these fields are used to *lift* the blanket — an under-extracted field would then be a path to airing something the person declined. Over-extraction is preferred over under-extraction; absence-of-boundary is never read as presence-of-permission. (Validation of the extraction itself is a stated next-cycle requirement, not assumed solved.)

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

### 3b — Declined-framing enforcement *(honest about what's lexical vs. semantic)*
When `DECLINED FRAMINGS` contains `celebration`, block the obvious lexical forms:
```
good news
great news
a win
reason to celebrate
congratulations
something good happened
```
(Analogous block-lists when `OUTREACH POLICY: prohibited` — "reach out to them," "send them a note," "check in on them" — and when `ADVICE POLICY: prohibited`.)

**The honest disposition (TL correction 3) — the lexical gate cannot detect that an *unlisted* phrase semantically imposes a declined framing, so we do not claim it does:**
```
Known lexical violation (hits a denylist form)        → BLOCK
VALENCE POLICY = factual_only                         → FACTUAL TEMPLATE
No lexical hit, but stance semantically uncertain     → MANUAL-REVIEW FLAG (in the experiment)
```
The uncertain-stance case is a **measured manual-review flag during this diagnostic**, *not* an automatic gate action — because the gate genuinely can't resolve it yet (that's precisely why semantic claim coverage is deferred, §5). Flagging it for human review *and counting how often it fires* is what tells us the size of the semantic gap, which is the data that decides how urgent §5 is. We enforce the obvious lexically; we route `factual_only` to a template; we flag-and-measure the uncertain rest. We do **not** let the generation model judge its own compliance, and we do **not** pretend the gate caught what it couldn't see.

---

## 4 — The test (three bounded passes — never change prompt and gate at once)

```
A. PROMPT ISOLATION  (the prompt change requires new packet fields, so "new prompt + old packets"
                      would change two variables — TL correction 1)
   A1: frozen v0.3.2 prompt + AUGMENTED packets + old gate
   A2: v0.4.0-draft prompt  + IDENTICAL augmented packets + old gate
   Compare A1 ↔ A2 — the only difference is the prompt. (The historical frozen run is CONTEXT, not a baseline.)
   Measure: validation-tic rate, valence-miss rate.

B. GATE REPLAY  (zero new model calls)
   Run BOTH the old run's 106 outputs AND pass-A's outputs through the NEW 8b rules.
   Measure: denylist catches, false-blocks, AND how often each denylist FIRES on the existing 106
            (real data on how conservative the denylist is before going live),
            AND how often the uncertain-stance manual-review flag fires (the size of the semantic gap).

C. COMBINED RUN
   v0.4.0-draft prompt + new packet fields + new gate, end to end.
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
Implement against a **new v0.4.0-draft prompt + new 8b ruleset** (frozen v0.3.2 / box8-v0 untouched): two route-scoped prompt rules; the decomposed packet fields (VALENCE POLICY · DECLINED FRAMINGS · OUTREACH POLICY · ADVICE POLICY, **each non-default policy carrying its evidence span**); an approval-construction denylist + declined-framing block-lists in 8b, with the **honest disposition** — block on lexical hit, template on `factual_only`, **measured manual-review flag on uncertain stance** (no overclaimed auto-catch). Test in **three bounded passes** — **A1/A2** (both on augmented packets, so the prompt is the only variable) → **gate-replay** (zero new calls; quantify denylist firing + flag rate on the 106) → **combined** — with pre-registered success criteria and the **court-stenographer guard** (grave copy must not go sterile) as a hard check. Put **semantic claim coverage** on the next gate-design step. Hold LoRA.
