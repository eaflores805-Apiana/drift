# CS Green Light — Execute the Canonical Reorganization
### Ratifications recorded + two audit-surfaced edits + execution order

> **2026-06-21 · PO (via Eng1) → CS. ✅ RATIFIED — execute.** The five reorg questions are ruled, the two optionals decided, and the full line-by-line read of the canonical core surfaced two additional small edits (one relabel, one status update). CS may now execute the reorganization in the order below. Repo currently at `a9fcb5b`.

---

## Ratifications (the five questions)

| Q | Ruling |
|---|---|
| **Q1 — Convention** | ✅ **ADOPT.** Version-in-header, status-line, folder-as-tier. Filenames stay stable. `STATUS: CANONICAL · vX.Y.Z` / `SUPPORTING` / `ARCHIVED — superseded by <doc>` in the masthead; tier = folder (`docs/` vs `docs/archive/`). |
| **Q2 — Three promotions** | ✅ **PROMOTE all three to CANONICAL.** `04-architecture-review.md`, `02-record-and-plan.md`, `design.md`. This **reverses the original archive calls** — the content audit verified each holds unique, live, build-critical content (the claim-grounding/output gate spec; the UI/experience model; the system architecture + risk register + MVP wedge). |
| **Q3 — Conditional archive** | ✅ **ARCHIVE `00-roadmap.md` — conditional.** Only after the build-map carry-forward check (see execution step 2). If anything live is orphaned in `00-roadmap`'s Phase-A record or Open-decisions list, promote it into `build-map.md` first, then archive. |
| **Q4 — Relabels** | ✅ **RELABEL.** `07-decision-log.md` → `STATUS: CANONICAL` (drop "draft"). `dj-persona-v0.md` → `STATUS: CANONICAL · v0 FROZEN`. |
| **Q5 — Gold-labeling-guide tier** | → **SUPPORTING.** (`06-gold-labeling-guide` is methodology you consult to make labels, not a spec you build to.) *PO note: flaggable to CANONICAL-as-IP if preferred — one-word change; SUPPORTING is the call unless overridden.* |

## Optionals

- **§1a — extract R1/R2/R3 as a referenced ADR:** ✅ **YES.** Pull the hybrid-scoring (R1), two-checkpoint safety incl. the **claim-grounding gate** (R2), and gold-first (R3) decisions from `04-architecture-review.md` into the decision log as a first-class referenced ADR. Reason: the claim-grounding / output gate is the **next thing on the critical path** — its decision belongs in the ADR record, findable, not buried in a review doc. *(Eng1 to draft the ADR body; CS files — same pattern as section K.)*
- **§1c — rename `design.md`:** ❌ **NO.** Relabel only; do **not** rename. Renaming for tier-signaling is the filename-churn the convention exists to avoid (breaks references for cosmetic ordering). The status line + folder already signal tier.

---

## Two audit-surfaced edits (from the full read of the canonical core)

The line-by-line read of `03-rules-and-format`, `signal-routing-meta-spec`, and `build-map` confirmed all three are the correct files and content-current — **with two exceptions, both label/status, neither substantive:**

- **Edit A — `03-rules-and-format.md` masthead.** Drop "**Tentative** Rules & Format" / "Working draft" → it is the **canonical engine spec**, contents verified current (v3 formula correct, multiplicative properly retired, all ADR refs accurate). Set `STATUS: CANONICAL · v0.2.0`. *(Title was stale; contents were not.)*
- **Edit B — `build-map.md` "where we stand" + Phase-1 marker.** **Stale and now false.** It reads *"the scoring formula is not yet chosen… we are mid-Phase-1, at the formula decision."* Reality: **v3 was chosen, ratified (J1/J2), and wired into the live engine; Phase 1 is effectively closed; the persona Foundation is built; we are mid-Phase-2 at the output gate.** Update the "where we stand" paragraph and the "▶ YOU ARE HERE" / "(we are here)" markers to reflect this. *(The map structure is correct; only its self-location is stale.)*

*(`signal-routing-meta-spec.md` read clean — no edit needed.)*

---

## Execution order

1. **Apply Q1 convention** — add the `STATUS:` line + version to every canonical doc's header.
2. **Build-map carry-forward check (Q3 pre-condition)** — diff `00-roadmap.md`'s Phase-A `[DONE]` record + Open-decisions list against `build-map.md`. Anything live not carried → promote into `build-map` first. *(Do not archive blind.)*
3. **Promotions + relabels (Q2, Q4):** `04-architecture-review`, `02-record-and-plan`, `design.md` → CANONICAL; decision log + persona drop "draft."
4. **Edit A** — relabel `03-rules-and-format` masthead.
5. **Edit B** — update `build-map` "where we stand" + you-are-here markers.
6. **Archive (Q3):** move `00-roadmap.md` → `docs/archive/` (only after step 2 clears).
7. **Tier `06-gold-labeling-guide`** → SUPPORTING (per Q5, unless PO flips).
8. **Content merge §3a** — fold `drift-layer2-set-shapes-v0.5.0-FOLD-INTO-break-spec.md` into `09-break-structure-spec.md`; bump to **v0.5.0**. *(Section K already filed at `a9fcb5b`.)*
9. **File the canonical index** as `docs/00-canonical-index.md` — the **standing manifest**, reflecting the now-ratified state. Every future doc gets tiered here on arrival.
10. **Pending separately (not blocking this pass):** the §1a ADR body (R1/R2/R3) — Eng1 to draft, CS files when it lands.

---

## What was verified, so the record is honest

The canonical core (`03-rules-and-format`, `signal-routing-meta-spec`, `build-map`) was **read in full, line by line**, and confirmed: these are the correct files, and their *contents* are current. The only currency issues found were **Edit A (a stale title) and Edit B (a stale status section)** — both label-level, both fixed in this pass. The four margin docs were content-audited earlier (reversing three archive calls). After this pass, every canonical doc has been opened and verified — the file-integrity concern is closed: map and terrain aligned.

*One honest caveat retained: the canonical core was read in full; the SUPPORTING-tier docs were classified by role, not line-read. If a SUPPORTING doc later needs to be built on, read it first.*
