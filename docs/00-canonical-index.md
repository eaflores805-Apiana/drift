# Drift — Canonical Source-of-Truth Index
### Which documents you build on, and which are history

> **STATUS: CANONICAL · v1.0.0** · 2026-06-21 · the standing manifest. Tier is reflected by **folder** (`docs/` = canonical or supporting; `docs/archive/` = archived) and by the `STATUS:` line in each doc's masthead. Every new doc gets tiered here on arrival.
>
> *Built from the PO-ratified canonical reorganization (`po-cs-green-light-execute-canonical-reorg-2026-06-21.md`, ratified at commit `a9fcb5b`; executed across commits `69f4a86` and onward). The full content-audit + reversal narrative is captured in `correspondence/eng1-cs-task-execute-canonical-reorg-verified-2026-06-21.md` and `correspondence/eng1-canonical-source-of-truth-index-proposal-2026-06-21.md`.*

---

## The four tiers

- **CANONICAL** — current, binding, **build on this.** The source of truth for what Drift is and how it works.
- **SUPPORTING** — reference and methodology. Feeds canonical docs; correct and current; but you don't *build on* it, you *consult* it.
- **ARCHIVE / SUPERSEDED** — historical. Was useful or was canonical; now replaced or overtaken. **Do not build on.** Kept for provenance.
- **CORRESPONDENCE** — memos, task specs, run reports, passdowns. **Never canonical.** These *feed* canonical docs but are inputs, not the record.

## The convention (decided 2026-06-21)

- **Filenames are stable permanent addresses.** Version lives in the masthead (`STATUS: CANONICAL · vX.Y.Z`), never in the filename. Bumping a version never breaks a cross-reference.
- **One line per doc** in the masthead: `STATUS: CANONICAL · vX.Y.Z` / `STATUS: SUPPORTING` / `STATUS: ARCHIVED — superseded by <doc>`.
- **Tier = folder.** Canonical and supporting live in `docs/`; archive lives in `docs/archive/`.

---

## CANONICAL — build on these

| Doc | Version | Role |
|---|---|---|
| `00-product-description.md` | v0.1.0 | The "start here" vision + product definition. The north star. |
| `01-product-principles.md` | v0.2.1 | The binding product principles (station-not-chatbot, restraint, etc.). |
| `02-record-and-plan.md` | v0.1.0 (experience layer) | **The UI / experience model.** Attention ladder, one-card layout, focus-modes-as-threshold-reweighting. Sole canonical home of the experience surface until/unless a dedicated experience-spec supersedes it. |
| `03-rules-and-format.md` | v0.2.0 | **The engine spec.** v3 scoring canonical (additive base × confidence × sensitivity_damper), per-route thresholds, schema. The most load-bearing doc in the repo. |
| `04-architecture-review.md` | v0.1.0 | **The origin spec of the claim-grounding / output gate (R2b)** plus hybrid-scoring (R1) and gold-first (R3). R1/R2/R3 are now formalized as ADRs L1/L2/L3 in `07-decision-log.md` (filed 2026-06-21). This doc remains the canonical source of the reasoning; L1-L3 are the binding decision records. |
| `05-promotion-playground-spec.md` | v0.1.0 | The buildable spec for the CS Engineer — the bench. |
| `07-decision-log.md` | CANONICAL (last appended 2026-06-21 — section L) | **The binding ADR record.** Sections L1-L3 (foundational architecture: hybrid scoring · two-checkpoint safety · gold-first eval — formerly the R1/R2/R3 of `04-architecture-review.md`, promoted to first-class ADRs); J1-J3 (Layer-1 scoring: route-aware ranking · no-W_community · utility deferred); K1-K2 (persona/generation: gravitational-center prompt · Variant B grave rule); plus earlier I-sections. House format for any new decision-of-record. |
| `08-value-and-moat.md` | v0.2.0 | The strategic thesis (two-axis moat, build-to-acquire). Binding for GTM/strategy. |
| `09-break-structure-spec.md` | v0.5.0 | **The Layer-2 spec.** Frame, unit budget, residual load, set/break currency, six-shape vocabulary, hour-as-composition. |
| `10-life-event-taxonomy.md` | v0.1.0 | **Engine material** — the grave-doorway protocol, treatment zones. Feeds meaning-pass + generation. Binding safety. |
| `build-map.md` | v0.2.1 | The forward-looking route from here to the destination, gated by phase. The plan of record. (Supersedes the earlier `00-roadmap.md`, now archived.) |
| `design.md` | v0.1.0 (architecture & strategy) | **The system architecture + risk register.** Sole home of the full system architecture (§5), the interaction gate / barge-in loop, the communal layer, the reciprocal opt-out, the hard-problems risk register (§6), the buyer/sellability analysis (§7), and the MVP wedge (§8). |
| `dj-persona-v0.md` | v0 FROZEN | **The frozen persona foundation that gates generation.** FROZEN for Phase 2. |

---

## SUPPORTING — consult, don't build on

| Doc | Version | Role |
|---|---|---|
| `06-gold-labeling-guide.md` | (no version) | The labeling methodology. Consult to *make labels*, not a spec built to. Flaggable to CANONICAL-as-IP if the team decides the labeling discipline itself is asset-grade — single-word change. |
| `scoring-explained.md` | v0.1.0 | Plain-language teaching companion to `03-rules-and-format.md` Part 3. Onboarding aid; the rules doc is the source. |
| `signal-routing-meta-spec.md` | v0.1.0 | The two-axis frame (source_kind × route) — names what the per-route specs are instances of. **Do not build from this; build from the per-route specs it frames.** |
| `dj-persona-built-on-eight.md` | (no version) | **Audit-and-grading material** per ADR K1 — teaches the persona to the team, grades generated output, feeds the future output gate. Not loaded into the runtime prompt at generation time. |
| `README.md` (docs + root) | — | Navigation. |
| `drift-current-state-flowchart.png` | — | Project flowchart (figure). |
| `drift-v3-score-map.svg` | — | v3 scoring figure (referenced by `scoring-explained.md`). |
| `grounding-gate-spec.md` | v0.1.0 | The buildable Box 8 output-grounding-gate spec (decompose→classify→verdict). Implements R2b / ADR L2; sibling to `05-promotion-playground-spec.md`. Next critical-path build (Phase 2.2). |
| `drift-brain-pipeline.svg` / `.png` | — | Radio-brain pipeline figure (full flow). |
| `drift-pipeline-figure-v1.1.1.svg` / `.png` | — | Pipeline figure v1.1.1 (supersedes the v1.0.0 svg, retained as provenance). |

---

## ARCHIVE / SUPERSEDED — do not build on

| Doc | Superseded by | Note |
|---|---|---|
| `archive/00-roadmap.md` | `build-map.md` | Archived 2026-06-21 per Q3. Phase-A `[DONE]` content distributed across the canonical docs; Open-decisions list captured in `07-decision-log.md`. One sub-item flagged on archive: Phase E "Private test" (20-50 listeners) is not currently a build-map phase — promote separately if the team wants it. |

---

## CORRESPONDENCE — inputs, never the record

All of `docs/correspondence/*` (Eng1 memos, CS task specs, CS run reports, team rulings) and all of `docs/passdowns/*` (session logs).

**These feed canonical docs and must never be built on directly.** A CS run report drives an ADR in the decision log; that *ADR* is canonical, not the report. When correspondence settles something, the settlement is promoted into a canonical doc and the correspondence becomes provenance. *(The passdowns are the session history — invaluable for "how did we get here," never for "what is true now.")*

---

## The governing discipline

1. **Build on CANONICAL only.** If a build decision rests on a correspondence file or an archived doc, it rests on sand — promote the decision into a canonical doc first.
2. **Correspondence feeds canonical; it never *is* canonical.** Reports → ADRs. Memos → specs. The promotion is the act that makes it binding.
3. **Every new artifact gets tiered on creation** — and ideally retires or supersedes one. The repo's failure mode is proliferation; the cure is that nothing floats untiered. *(This index is the ledger that enforces it.)*
4. **Version + status on every canonical doc.** A canonical doc with no version or a "draft" label is a contradiction — fix the label.
5. **Don't archive blind.** Before archiving, content-read the candidate and verify nothing live is orphaned. *(The reorg lesson: a metadata-only first pass over-archived three docs whose content audit revealed live, build-critical material.)*

---

## How to update this index

- **New canonical doc lands** → add a row to the CANONICAL table; include version + role.
- **Doc gets bumped to a new minor/major version** → update the version column here AND in the doc's STATUS line.
- **Doc gets archived** → move file to `docs/archive/`, set its STATUS to `ARCHIVED — superseded by <doc>`, move the row in this index, name the supersedor.
- **Tier change** → update the STATUS line in the doc + move the row to the new table here.

— CS Engineer, 2026-06-21
