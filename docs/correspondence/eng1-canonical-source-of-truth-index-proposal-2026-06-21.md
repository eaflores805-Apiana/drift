# Drift — Canonical Source-of-Truth Index
### Which documents you build on, and which are history

> **2026-06-21 · Eng1 · PROPOSED — needs PO ratification.** The repo has ~14 docs, ~30 correspondence files, ~30 passdowns, with inconsistent status markers (the *decision log itself* is marked "draft"; one guide self-declares "canonical"; persona docs say "Draft"/"parked"). This index exists so anyone building can answer one question instantly: **is this document the source of truth, or is it history?** Build only on CANONICAL. Everything else is reference, archive, or input.
>
> **This is a proposal.** The clear cases are classified with reasoning; the genuinely ambiguous ones are flagged **NEEDS PO RULING** rather than demoted unilaterally. Ratify, correct, and this becomes the map.

---

## The four tiers

- **CANONICAL** — current, binding, **build on this.** The source of truth for what Drift is and how it works.
- **SUPPORTING** — reference and methodology. Feeds canonical docs; correct and current; but you don't *build on* it, you *consult* it.
- **ARCHIVE / SUPERSEDED** — historical. Was useful or was canonical; now replaced or overtaken. **Do not build on.** Kept for provenance.
- **CORRESPONDENCE** — memos, task specs, run reports, passdowns. **Never canonical.** These *feed* canonical docs (a CS report drives an ADR; an Eng1 memo drives a spec) but are inputs, not the record.

---

## CANONICAL — build on these

| Doc | Version | Why it's canonical |
|---|---|---|
| `00-product-description.md` | v0.1.0 | The "start here" vision + product definition. The north star. |
| `01-product-principles.md` | v0.2.1 | The binding product principles (station-not-chatbot, restraint, etc.). |
| `03-rules-and-format.md` | v0.2.0 | **The engine spec.** v3 scoring canonical, route thresholds, schema. The most load-bearing doc in the repo. |
| `07-decision-log.md` | *(relabel)* | **The ADR record** — every binding architectural decision (I, J sections). Marked "draft" but it *is* the decision system of record. **Relabel to remove "draft."** |
| `08-value-and-moat.md` | v0.2.0 | The strategic thesis (two-axis moat, build-to-acquire). Binding for GTM/strategy. |
| `09-break-structure-spec.md` | v0.4.0 → **v0.5.0** | **The Layer-2 spec.** Frame, unit budget, residual load, and (pending merge) the set/break currency + shape vocabulary. |
| `10-life-event-taxonomy.md` | v0.1.0 | **Engine material** — the grave-doorway protocol, treatment zones. Feeds meaning-pass + generation. Binding safety. |
| `signal-routing-meta-spec.md` | v0.1.0 | The two-axis routing spec (source_kind × route). The backbone triad. |
| `build-map.md` | v0.2.0 | The route from here to the destination, gated by phase. The plan of record. |
| `dj-persona-v0.md` | *(relabel)* | **The frozen persona foundation.** Marked "Draft" but it is the v0 FROZEN foundation that gates generation. **Relabel to "v0 FROZEN."** |

---

## SUPPORTING — consult, don't build on

| Doc | Version | Role |
|---|---|---|
| `05-promotion-playground-spec.md` | v0.1.0 | The bench/playground spec. Reference for how the bench works. |
| `06-gold-labeling-guide.md` | (self-marked canonical) | The labeling methodology. Reference for *how* labels are made — feeds the gold sets, not the engine directly. *(Self-declares canonical; functionally it's methodology — PO may keep it CANONICAL if preferred.)* |
| `scoring-explained.md` | v0.1.0 | Plain-language explainer of v3, derived from `03-rules-and-format`. Onboarding aid; the rules doc is the source. |
| `dj-persona-built-on-eight.md` | parked | The Eng1 comparison build of the persona. Superseded-as-runtime by the gravitational-center model; keep as design provenance. |
| `README.md` (docs + root) | v0.1.0 | Navigation. |

---

## ARCHIVE / SUPERSEDED — do not build on

| Doc | Status | Note |
|---|---|---|
| `02-record-and-plan.md` | draft | Early record. Likely superseded by `build-map` + decision log. **NEEDS PO RULING** — confirm archive. |
| `04-architecture-review.md` | draft | Early architecture review. Likely overtaken by the meta-spec + ADR J. **NEEDS PO RULING** — confirm archive. |
| `00-roadmap.md` | (no version) | **Overlaps `build-map.md`.** Two roadmaps is one too many. **NEEDS PO RULING** — is `build-map` the canonical route and `00-roadmap` archived, or do they serve different scopes? |
| `design.md` | draft | Early design doc. Likely superseded by `signal-routing-meta-spec` + `03-rules-and-format`. **NEEDS PO RULING** — confirm archive. |

---

## CORRESPONDENCE — inputs, never the record

All of `docs/correspondence/*` (Eng1 memos, CS task specs, CS run reports, team rulings) and all of `docs/passdowns/*` (session logs).

**These feed canonical docs and must never be built on directly.** A CS run report drives an ADR in the decision log; that *ADR* is canonical, not the report. When correspondence settles something, the settlement is promoted into a canonical doc and the correspondence becomes provenance. *(The passdowns are the session history — invaluable for "how did we get here," never for "what is true now.")*

---

## The governing discipline

1. **Build on CANONICAL only.** If a build decision rests on a correspondence file or an archived draft, it rests on sand — promote the decision into a canonical doc first.
2. **Correspondence feeds canonical; it never *is* canonical.** Reports → ADRs. Memos → specs. The promotion is the act that makes it binding.
3. **Every new artifact must be tiered on creation** — and ideally retire or supersede one. The repo's failure mode is proliferation; the cure is that nothing floats untiered. *(This index is the ledger that enforces it.)*
4. **Version + status on every canonical doc.** A canonical doc with no version or a "draft" label is a contradiction — fix the label (see relabels above).

---

## Three capture gaps — where current thinking is AHEAD of the repo

The design has moved past the committed docs in three places. Each lands in an existing canonical doc — none needs a new file:

1. **Layer-2 set/break currency + shape vocabulary** → folds into `09-break-structure-spec.md` as **v0.5.0** (drafted: `drift-layer2-set-shapes-v0.5.0-FOLD-INTO-break-spec.md`).
2. **Persona decisions — grave-rule-B + center-as-runtime-brief / document-as-audit** → new **ADR section K** in `07-decision-log.md`. *(Currently the decision log records Layer-1 scoring decisions but NOT the persona/generation decisions — the asymmetry to close. Drafting this ADR is the next capture step.)*
3. **The hour-format reframe (music-anchored, not clock)** → part of the same `09` v0.5.0 merge.

Closing these three brings the repo level with where the work actually is — and banks the persona/structure decisions the way the scoring decisions are already banked.

---

## What to ratify

1. The four-tier classification above (correct any doc's tier).
2. The four **NEEDS PO RULING** archive calls (`02`, `04`, `00-roadmap`, `design.md`).
3. The two **relabels** (decision log: drop "draft"; persona: "v0 FROZEN").
4. `06-gold-labeling-guide` — CANONICAL or SUPPORTING?

Once ratified, this index goes in the repo as the top-level map (suggest `docs/00-canonical-index.md` or a section in the docs `README`), and every future doc gets tiered here on arrival.
