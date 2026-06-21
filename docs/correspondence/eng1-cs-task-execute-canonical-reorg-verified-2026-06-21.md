# CS Task — Execute the Canonical Reorganization (VERIFIED)
### Promote, reconcile, version — built from a full content audit

> **2026-06-21 · Eng1 → CS. ⛔ BLOCKED ON PO RATIFICATION — do not execute any file move, rename, or merge until the PO signs off on the specific calls below.** This list comes from **reading the actual contents** of every candidate doc, not their version markers. That reading **reversed three of four original archive calls** — docs that looked superseded by metadata turned out to hold live, un-promoted, build-critical content. Files are the build instructions; a wrong move buries a live decision. Hence the gate.

---

## Correction to the record (why this list isn't "archive four docs")

The first-pass index classified four docs as archive-eligible on **metadata** (version markers, "draft" labels, filename overlap). A full content read found that was wrong in a consistent direction — **it over-archived.** Verified reality:

| Doc | First-pass call | **Verified call** | Why it changed |
|---|---|---|---|
| `04-architecture-review.md` | archive? | **PROMOTE → canonical** | It is the **origin spec of the claim-grounding / output gate** (R2b) — the exact unbuilt keystone we keep citing — plus the hybrid-scoring and gold-first decisions. Most complete description of the gate anywhere. |
| `02-record-and-plan.md` | archive? | **PROMOTE → canonical (experience)** | **Sole home of the UI/experience model**: the attention ladder, the one-card layout, focus-modes-as-threshold-reweighting. No other canonical doc owns the UI spec. |
| `design.md` | archive? | **PROMOTE → canonical (architecture/strategy)** | **Sole home of**: the full system architecture (§5), the **interaction gate / barge-in loop**, the **communal layer**, the reciprocal opt-out, the **hard-problems risk register** (§6), the **buyer/sellability analysis** (§7), and the **MVP wedge** (§8). Richest strategy+architecture doc in the repo; mislabeled "draft." |
| `00-roadmap.md` | archive | **ARCHIVE — conditional** | The one real archive. Overlaps `build-map.md` (two roadmaps). **Condition:** confirm `build-map` carries forward anything still load-bearing from `00-roadmap`'s Phase-A `[DONE]` record before archiving. |

**Canonical core — content-verified, internally current:** `03-rules-and-format` (multiplicative formula properly retired to a labeled "superseded — do not use" block; legacy 0.45 threshold flagged), `signal-routing-meta-spec` (honest about its dashed stages 4 + relevance), `07-decision-log` (honest, but **missing the persona/generation ADR** — see merge 3.2). No stale sections found in the core.

---

## The convention (decide once, apply everywhere)

**Versioning: version lives IN THE DOC HEADER, never in the filename.** Filenames stay **stable permanent addresses**; the masthead carries `vX.Y.Z`. *Do not* create `rules-and-format-v0.2.0.md` — version-in-filename breaks every cross-reference on each bump and leaves duplicate `-vX` files. Easy access comes from **stable names + a clear status line + folder = tier**, not filename suffixes.

**Status: every canonical doc header carries one line** — `STATUS: CANONICAL · vX.Y.Z` / `STATUS: SUPPORTING` / `STATUS: ARCHIVED — superseded by <doc>`. Tier is also reflected by folder (canonical in `docs/`, archive in `docs/archive/`).

---

## 1 — Promotions + relabels *(each gated on PO ratification)*

1a. **`04-architecture-review.md`** → relabel `STATUS: CANONICAL`. *(Optional, PO's call: also extract R1/R2/R3 as a referenced ADR in the decision log so the gate decision is in the ADR record, not only in a review doc. Recommend yes — the claim-grounding gate is about to be built and should be a first-class ADR.)*

1b. **`02-record-and-plan.md`** → relabel `STATUS: CANONICAL (experience layer)`. Drop "working draft." This is the UI source of truth until/unless a dedicated experience-spec supersedes it.

1c. **`design.md`** → relabel `STATUS: CANONICAL (architecture & strategy)`. Drop "working." Consider renaming to a clearer canonical name (e.g. `00b-system-design.md`) **only if** the PO wants the numbering to signal tier — otherwise leave the name stable and just relabel.

1d. **`07-decision-log.md`** → drop "draft" from the header. It is the binding ADR record. `STATUS: CANONICAL`.

1e. **`dj-persona-v0.md`** → relabel `Draft` → `STATUS: CANONICAL · v0 FROZEN`. It is the frozen foundation that gates generation.

1f. **`03-rules-and-format.md`** → rename masthead from "Tentative Rules & Format" is optional, but add `STATUS: CANONICAL · v0.2.0` explicitly. Content already current.

---

## 2 — The one conditional archive *(gated on a check, not just ratification)*

2a. **`00-roadmap.md`** → move to `docs/archive/00-roadmap.md`, header `STATUS: ARCHIVED — superseded by build-map.md`. **Pre-condition:** verify `build-map.md` carries forward anything still live from `00-roadmap`'s Phase-A `[DONE]` record + its "Open decisions" list. If something is orphaned there, promote it into `build-map` **first**, then archive. *(Do not archive blind — this is the lesson of the whole list.)*

---

## 3 — Content merges *(the three capture gaps)*

3a. **Layer-2 v0.5.0** → fold the set/break currency + six-shape vocabulary + hour-as-composition into **`09-break-structure-spec.md`**; bump to **v0.5.0**. Source content drafted: `drift-layer2-set-shapes-v0.5.0-FOLD-INTO-break-spec.md`. *(Not a new doc — merge.)* The hour-format reframe (music-anchored, not clock) is part of this same merge.

3b. **Persona/generation ADR → new section K in `07-decision-log.md`.** Record formally (the way J1–J3 record scoring): **grave-content rule = Variant B** (validated on the 11-item probe), and **center-as-runtime-brief / detailed-document-as-audit** (validated on the 30-run A/B + 5-run clean-room). This closes the asymmetry — scoring decisions are banked, persona decisions are not. *(Eng1 to draft the ADR body; CS files.)*

3c. **Canonical index** → file the ratified index as `docs/00-canonical-index.md` (or a section in the docs README) as the **standing manifest** — every future doc gets tiered here on arrival.

---

## 4 — What NOT to do *(guardrails)*

- **Do not put versions in filenames.** Stable names; version in header. (See convention above.)
- **Do not move `docs/correspondence/*` or `docs/passdowns/*`.** They are *already* isolated in their own folders and are correctly NEVER canonical — they feed canonical docs. The index states the rule; no move needed.
- **Do not archive `02`, `04`, or `design.md`.** The content audit verified they hold live build content. Archiving them buries the gate spec, the UI model, and the architecture/risk register.
- **Do not execute anything before PO ratification** of: the four reclassifications (§1a–c, §2a), the two relabels (§1d–e), and the `00-roadmap` pre-condition check (§2a).

---

## What the PO must ratify before CS moves

1. **Promote** `04-architecture-review`, `02-record-and-plan`, `design.md` to canonical (reversing the original archive calls). ✅/✏️
2. **Archive** `00-roadmap` — *conditional* on the build-map carry-forward check. ✅/✏️
3. **Relabels:** decision log + persona drop "draft." ✅/✏️
4. **`06-gold-labeling-guide`** — CANONICAL or SUPPORTING? (self-marked canonical; functionally methodology). ✅/✏️
5. **The convention:** version-in-header, status-line, folder-as-tier. ✅/✏️

Once ratified, CS executes §1–§3 in order, runs the §2a pre-condition check, and files the index as the standing manifest. Until then: **filed, not executed.**
