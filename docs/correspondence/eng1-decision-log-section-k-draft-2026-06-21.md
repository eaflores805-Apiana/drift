# Decision Log — Section K (persona & generation) — DRAFT for `07-decision-log.md`

> **2026-06-21 · Eng1 → CS to file as section K of `docs/07-decision-log.md`.** Records the persona/generation decisions formally, in the J-section house format. Closes the asymmetry: Layer-1 scoring decisions are banked as ADRs (J1–J3); the persona/generation decisions were not. These are **Phase 2 (generation) foundation** decisions, evidence-backed by the clean-room and stress tests run this session. Both are **v0 starting points** with explicit pending dependencies — recorded as such, not as final.

---

## K — Persona & generation architecture decisions (Phase 2)

*The DJ persona Foundation and the line-generation approach. Scoped to Phase 2 (generation). Do not change Phase 1 (Layer-1 judgment), which stands unchanged. Evidence is from uncontaminated generation tests: a fresh model instance (`claude-sonnet-4-6`), given only the prompt under test, with no project context, no showcase, no persona document — judged by the PO on raw output, not by the author (who knows the target voice and cannot judge it cleanly).*

---

### K1 — Gravitational-center prompt as runtime brief; detailed persona document as audit, not runtime instruction `[ACCEPTED 2026-06-21]`

**Status:** Accepted as the persona architecture for generation. **Decision class:** `ESCALATE-IF-CHANGED`. **Scope:** Phase 2 (generation). **Proposed by:** TL (gravitational-center model) + Eng1. **Ratified by:** PO. **Concurrence:** TL (authored the runtime prompt).

**Ruling.** The model-facing runtime instruction is a **compact gravitational-center prompt** — one center, the eight traits, the governing posture, the active route — **not** the full persona document. The detailed persona document (`dj-persona-v0.md`, `dj-persona-built-on-eight.md`) is **audit-and-grading material**: it teaches the persona to the team, grades generated output, and feeds the output gate. It is **not** loaded into the prompt at generation time.

The runtime center (verbatim, ratified):
```
You are Drift's trusted, music-first radio companion. Bring the listener closer to their world
without taking over the moment. Be warm, observant, brief, grounded, respectful, and occasionally
wry. Match the mood of the moment without claiming to know the listener's feelings. Speak
confidently about what is known, remain humble about everything beyond it, say one worthwhile
thing, and return naturally to the music.
```
The stack: **CENTER → TRAITS (8) → POSTURE (confident in delivery, humble in reach) → ACTIVE ROUTE → OUTPUT GATE.** The route module loads per route; the output gate runs on the generated line, downstream of the prompt.

**Reason (evidence-grounded, not asserted).**
- **The center evoked a consistent host with no document.** Clean-room test (5 cold runs, `claude-sonnet-4-6`, center-only prompt, Dana celebration item, commit `151c1db`): **5/5 produced the same host** — same five-beat shape, warmth-with-a-floor, brevity (43–55 tokens, self-limited without a length instruction), music bookends, doorway to the listener. The governing posture held **5/5** — every run spoke *about* the subject *to* the listener, none claimed the listener's feelings. The voice the showcase defines was produced by **two sentences**, by a model that had never seen the showcase.
- **The document's job is what the center can't hold.** The same 5 runs surfaced two soft slips ("good things happening to good people" — a character claim beyond the facts; "let's keep that feeling going" — a listener-feeling claim). These are exactly **claims-beyond-source** — the residue the output gate exists to catch. The center carries the voice (~the bulk); the gate catches the finest claims (~the residue). Loading the full document into the prompt does not fix this and risks the opposite failure (a prohibition-heavy prompt yields careful-but-dead output).
- **"Teaches vs. evokes" is the clean division.** The detailed document teaches the persona to the team (so the team agrees on it), grades output (the observable signatures), and feeds the gate (the mechanical safety lines). The center evokes the persona in the model. Two audiences, two artifacts; handing the model the artifact built for the team was the failure being corrected.

**Status as a starting point.** Validated for the **celebration route** on a first probe. The center is the runtime brief **with a documented boundary**: it carries celebration, utility, valence, and soft sensitive cases; it must **not** run bare on grave items (see K2). Pending: the output gate (unbuilt; catches the residual claims-beyond-source), and corpus pressure-testing as the item set grows.

**Non-impact.** Does not change Phase 1, the Layer-1 ADRs (J1–J3), or the absolute safety gates. Generation is downstream of judgment; this governs how the chosen item becomes a spoken line.

**Companion artifacts.** Frozen persona: `dj-persona-v0.md` (v0 FROZEN). Eng1 trait-build: `dj-persona-built-on-eight.md`. Clean-room task + results: `docs/correspondence/eng1-cs-task-persona-center-clean-room-test-2026-06-20.md`, `docs/correspondence/cs-persona-center-test-results-2026-06-21.md`.

---

### K2 — Grave-content rule = Variant B (permission-to-name plus the don't-add counterweight); route-loaded `[ACCEPTED 2026-06-21]`

**Status:** Accepted as the grave-content rule for the doorway route. **Decision class:** `ESCALATE-IF-CHANGED` (it is a safety-critical generation rule). **Scope:** Phase 2 generation, doorway (grave) route. **Proposed by:** PO (permission-and-reason) + Eng1 (the counterweight). **Ratified by:** PO.

**Ruling.** When a serious event is shared, the host follows **Variant B** — speak the stated fact *and* add nothing:
```
When someone shares something serious, don't look away from it. Say the real thing — plainly, and
with respect — because the people who care are counting on you to tell them. Then stop. Your job is
to carry the news, not to add to it: report what they shared, at the weight they shared it, and let
the moment belong to them.
```
This rule is **route-loaded** — it loads only when the doorway route is active on a grave item. It is **never** in a celebration, utility, or music prompt. *(Per the meta-spec's route-specific-treatment principle: a celebration prompt must never carry the grave rule, or it delivers good news from inside a courthouse.)*

**Reason (evidence-grounded, not asserted).**
- **The bare center failed the grave end by timidity, not recklessness.** Pass-one stress test (11 items, 19 runs, center-only, commit `7708e40`): the catastrophic failure — inventing a diagnosis the source did not state — **held 12/12 grave runs** (never said "cancer/illness" on the implied-grief items). But on the one item where a death was **explicitly stated** (uncle Ray), **all 3 runs evaded** — retreated to generic "carrying something heavy," never named the death a friend shared. Evasion is not safe; it is the host failing to relay what the listener needs and the person openly shared. The bare center had only "don't take over" and collapsed it into silence.
- **The fix is a general rule, not examples.** An example ("here's how to voice a death") teaches the model that example and fails the cases not written (miscarriage, relapse, remission, the unseen). The rule is **fidelity to the disclosure** — *report what was shared, at the weight shared; don't add meaning, don't withhold fact* — which is content-free and generalizes: it forces relaying the stated death, forbids inflating the vague post, and forbids supplying the unstated diagnosis (the diagnosis was not "what they shared").
- **A/B settled which phrasing.** Pass-two A/B (30 runs, commit `563486d`): **Variant A** (permission + reason only — "be brave, speak its truth") and **Variant B** (same + the don't-add counterweight). Both **cured the evasion** — item 10 went from 3/3 evading (pass one) to **6/6 naming Ray's death**. The original pivot worry (that "be brave" would push invention on the no-fact item 8) did **not** materialize — both held 6/6. **But B was strictly cleaner where they diverged:** item 9 (treatment) — A named the fact plainly 1/3 and tripped the denylist ("brave") 1/3, **B named it 3/3, no denylist**; item 11 (apex) — A added editorial overhead directing the listener's interior, **B closed clean and stopped**; item 5 (sensitive breakup) — A leaked the grave register into a non-grave item, **B stayed in its lane**. A is permission-to-speak only (cures evasion, leaves editorial-overhead/register-bleed); B holds both edges. The two edges are not redundant — *speak-the-fact* fails as evasion when missing, *don't-add* fails as editorial-bleed when missing — and the test exhibited both.

**Status as a starting point.** Validated on an 11-item probe. **Pending:** (1) the **output gate** — the grave denylist must be mechanically enforced on the aired line, not left to the prompt (A tripped it 1/12, B 0/N, but "mostly avoids" is insufficient for grief vocabulary — the gate is the guarantee); (2) the **router** — route-loading is enforced structurally in production, not by the in-center conditional this test used (item 5's mild bleed under A is why); (3) **corpus** — the cases the probe didn't contain.

**Two newly-found failure modes recorded** (the probe earning its keep — neither was on the original watch list): **evasion on a stated death** (the bare center's grave failure — fixed by K2), and **relational inversion** (item 11: the host inventing a relationship structure — "Elena's in your corner, you're in hers" — the source never stated; a third axis of fabrication beyond inventing-the-interior and inventing-the-fact). Relational inversion is a **gate test case** and a generation watch item.

**Two grounding slips recorded as gate test cases** (not prompt problems — ordinary factual-invention residue): a wrong-time slip (A R3 item 10: "this morning" for a "yesterday" source) and a hallucinated next-song (B R1 item 1: invented "Feist"). These are the **output gate's** job, confirming the gate is needed downstream regardless of the rule.

**Non-impact.** Does not change Phase 1, the Layer-1 ADRs, the grave-doorway protocol in `10-life-event-taxonomy.md` (this is its generation-rule form, consistent with it), or the absolute safety gates.

**Companion artifacts.** Grave-doorway protocol (canonical source): `docs/10-life-event-taxonomy.md`. Stress-test tasks + results: `docs/correspondence/eng1-cs-task-persona-center-stress-test-11-items-2026-06-20.md`, `eng1-cs-task-persona-stress-test-pass-two-grave-rule-ab-2026-06-21.md`, `cs-persona-stress-test-pass-one-results-2026-06-21.md`, `cs-persona-stress-test-pass-two-results-2026-06-21.md`. Frozen grave tier: `dj-persona-v0.md` (grave-doorway tier, route-loaded).

---

## What this section banks

Phase 1 closed with the judgment engine proven and its decisions recorded (J1–J3). Section K records the **Phase 2 foundation**: the persona generates (K1 — the center evokes a consistent host), and the hardest safety case has a general rule that survived first contact (K2 — fidelity-to-disclosure, Variant B). Both are **v0 starting points**, evidence-backed by uncontaminated tests, with their pending dependencies (output gate, router, corpus) named — not presented as final. The output gate is the next [EVIDENCE] step both ADRs point to.
