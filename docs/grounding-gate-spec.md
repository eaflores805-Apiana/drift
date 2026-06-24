# Drift — Output Grounding Gate (Box 8)
### Buildable spec · the safety net between generation and air

> **v0.1.0 · 2026-06-22 · BUILDABLE.** The gate that checks the DJ's *aired line* against what the source actually supports, and fails closed before anything reaches a listener. This is the next build on the critical path (Phase 2.2): the wall between "it generates" and "it generates *safely*." Grounded in the real Prompt B output shape (`scripts/persona-pressure-100-ab.ts`) and the consent gate it sits downstream of (`src/safety/consentGate.ts`). Test set = the world-sim snapshot + answer key.
>
> **Status of inputs:** Prompt B output shape — verified in repo **[M]**. World-sim snapshot + answer-key format — **not in repo at HEAD** (CS, uncommitted); §5/§7 are specced against the *expected* shape and must be confirmed against the real artifact before the harness is wired.

---

## §0 — What the gate actually receives (grounded reality, not assumption)

From `persona-pressure-100-ab.ts`, the generation path today is:

- **Input to the DJ:** `{ who, post, category }` — who posted, the post text, a category tag. Not the full `IngestedItem`; no pre-extracted field list.
- **Output of the DJ (Prompt B):** **raw prose** (`response.content → text`), or **silence** ("stay quiet" is an allowed, correct output).

Two consequences that shape everything below:

1. **The post text is the floor of truth.** With no rich field list, the primary thing a claim is grounded *against* is the post string itself (plus `who`, plus any entities the meaning pass extracted upstream). The gate's question is: *is every factual assertion in the aired line supported by the source the DJ was actually given?*
2. **The line is prose, so decomposition is a model step.** You cannot regex "Jake got into UCLA's grad program" into a checkable proposition. The gate therefore contains a model (the decomposer). That is fine — but it means **the gate's own accuracy is a measured quantity, not an assumption** (§5).

---

## §1 — The contract, and the two roles of the answer key

**The gate is a binary, fail-closed validator on the aired line — not a soft scoring modifier.** A line either clears the gate or it does not reach the listener. Default on any doubt is silence.

**The answer key has two roles that must never be confused:**

| Role | When | Use |
|---|---|---|
| **Grounding source** | runtime + test | **NEVER the answer key.** The DJ knows only the *public post* (+ approved enrichment). Grounding a claim means matching it to the post text / meaning-pass entities / `IngestedItem` fields — things the DJ was actually given. |
| **Gate grader** | **test only** | The world-sim answer key holds the *hidden truth* a post may have stated or withheld. It is used **solely to score whether the gate's verdicts were correct** — did it pass a line that asserted something the post never stated? did it reject a clean one? |

This is the load-bearing discipline: **if the gate's grounding check reads the answer key, it passes the bench and cannot ship** — production has no key. Grounding is against the item; the key only grades. (Same hollow-test trap we flagged on the paper, one layer down.)

---

## §2 — Pipeline placement

```
… → routing/verdict (Layer 1, built) → generation (Prompt B) → [OUTPUT GATE] → air
                                                                      │
                                                          REJECT ─────┴──→ silence (more music)
```

- The gate runs on the **generated line**, every time, after generation, before air.
- **Silence in → silence out, trivially.** If the DJ chose to stay quiet, there are no claims; the gate passes it (nothing asserted is always grounded). The gate must handle empty output as a clean pass, not an error.

---

## §3 — Mechanism: decompose → classify → verdict

**Step 1 — Decompose (model).** Turn the aired line into a list of *atomic factual claims*. Exclude generic warmth ("that's no small thing", "here's one easy to sit with") — those assert nothing about the world and need no grounding. Extract only checkable propositions: named entities, events, attributes, quantities, causal/temporal claims, claims about the listener's or subject's state.

**Step 2 — Classify each claim against the source** (post text + meaning-pass entities + any `IngestedItem` fields), into exactly one of:

- **`grounded`** — supported by the source the DJ was given.
- **`unsupported`** — not in the source, not contradicted (an *added flourish* — invented business name, invented next-song, a prestige claim the post didn't make, an assumed listener feeling).
- **`contradicted`** — asserts something the source rules out (names the wrong person, states a death/diagnosis the post did not state, invents a fact against the post).

**Step 3 — Verdict** (the three-branch resolution — see §4).

Generic-warmth detection and the `unsupported` vs `contradicted` split are the two judgments that carry the gate's value. Both are checked at test time against the key (§5).

---

## §4 — Three verdicts, not two

A binary REJECT-everything gate is *safe* but it silences the DJ on good content — most ungrounded claims aren't lies, they're flourishes the showcase already documented (the prestige claim, the invented urgency), and the showcase's own rule is *drop the unsupported claim, keep the grounded warmth.* So:

| Verdict | Trigger | Action |
|---|---|---|
| **`PASS`** | every claim `grounded` (or generic warmth) | air the line as-is |
| **`REPAIR`** | one or more `unsupported` claims, **zero** `contradicted` | strip the unsupported claim(s); if a grounded, coherent remainder survives, air it; else → `REJECT` |
| **`REJECT → silent`** | **any** `contradicted` claim, **or** the segment's core is ungrounded, **or** REPAIR leaves nothing coherent | do not air; default to silence/more music |

**Fail-closed is the default branch.** `contradicted` is the hard kill — a falsely-stated death, the wrong person, an invented fact — and is never repaired, only rejected. `unsupported` is the repair case. This keeps the DJ *alive* (it can still say the grounded warmth) while making invention unairable.

*(Note for grave-route lines: per the life-event taxonomy, a grave-doorway line that asserts an unstated death/diagnosis is `contradicted` → hard REJECT. The grave route also carries the forbidden-vocabulary denylist as a separate, earlier check; the gate's claim-grounding is in addition to it, not a replacement.)*

---

## §5 — The gate has a model in it, so the gate is itself tested

Because Step 1 (decompose) and Step 2 (classify) are model judgments, the gate can err — pass an inventing line, or over-reject a clean one. **The world-sim snapshot + answer key is the gate's test set.** At test time:

- Run generated lines for snapshot items through the gate.
- Use the answer key to label each item's *ground truth* (what the post stated vs. withheld).
- Score the gate's verdicts: **REJECT-precision** (of lines it rejected, how many genuinely invented/contradicted?) and **REJECT-recall** (of lines that genuinely invented, how many did it catch?). Recall is the safety-critical metric — a missed invention reaches the listener.
- The headline gate metric is **zero ungrounded claims aired** on the test set (recall = 1.0 on `contradicted`); REPAIR correctness is the secondary metric (did it strip the right claim and keep coherent warmth?).

`[expected key shape — confirm with CS]`: the gate-grader needs, per snapshot item, the post text, the hidden truth, and a realized-disclosure flag (stated / partial / withheld — the auditor field from the world-gen design). If the world-sim key emits that triple per event, the harness wires directly; if its shape differs, this section adjusts.

---

## §6 — Test cases (drawn from the showcase + world-sim)

1. **Clean celebration (PASS).** A Jake/Dana-style line whose every claim is in the post → must `PASS` untouched. Guards against over-rejection.
2. **The flourish (REPAIR).** The showcase's own bad examples — the institutional prestige claim ("UCLA doesn't hand those out"), the invented urgency ("selling out fast"), the ungrounded next-song — must be classified `unsupported` and **stripped**, with the grounded warmth aired. Guards against silencing good content.
3. **Mark — two separate cases, two separate layers (do not conflate):**
   - *Upstream (Layer 1, already built — not the gate):* did routing surface Mark's one heavy clause ("gonna… figure some stuff out") at all, against six surface posts? That's a scoring/routing test; if it fails, debug Layer 1, not the gate.
   - *Gate:* **given** the clause, does the aired line stay anchored to it, or invent the backstory to smooth over a one-clause source? Any added relocation narrative the post didn't state → `unsupported`/`contradicted` → REPAIR or REJECT. The gate's job is to forbid the filler, not to find the signal.
4. **Grave case (REJECT, graded by key).** A grave-route item whose post *withheld* the truth: any line that asserts the unstated death/diagnosis is `contradicted` → hard REJECT. The key (withheld flag) is what lets the test confirm the gate rejected correctly — and that the gate did **not** reach into the key to "help."

---

## §7 — Dependencies and open items

- **World-sim snapshot + answer-key format** (CS, uncommitted) — needed to wire §5. Spec assumes a `{post, hidden_truth, realized_disclosure}` triple per event; confirm.
- **Generation → `IngestedItem` wiring** (Phase 2.1, separate task) — today generation takes `{who, post, category}`; the gate should be written to accept the richer `IngestedItem` source set (post text + entities + fields) so it doesn't need rework when 2.1 lands. Build the gate against the *union* (post text always present; structured fields optional).
- **Decomposer model choice** — generator ≠ evaluator discipline applies: the decompose/classify model should not be the same instance/model as Prompt B's generator, to avoid correlated blind spots (a generator and its own grader sharing a hallucination).
- **REPAIR coherence** — stripping a claim can leave a stub. Define the minimum-coherent-remainder rule (if strip leaves < a worthwhile sentence, REJECT). Tune against output, not on paper.

---

## §8 — Build order (for CS)

1. **Skeleton + silence path.** Gate function `(line, source) → {verdict, airedLine}`; silence/empty → PASS. Lands the interface.
2. **Decompose + classify** against post text only (the floor of truth), three labels. Model step; log every claim + label for inspection (self-auditing standard).
3. **Three-verdict resolution** (PASS/REPAIR/REJECT), fail-closed default.
4. **Wire the world-sim test set** (pending §7 key shape) → score REJECT-recall/precision + REPAIR correctness.
5. **Extend the source** to meaning-pass entities + `IngestedItem` fields as Phase 2.1 makes them available.

Headline done-condition: **on the world-sim test set, zero ungrounded claims reach air (REJECT-recall = 1.0 on contradictions), and clean lines are not over-rejected** — the proof that generation can be made safe without being silenced.
