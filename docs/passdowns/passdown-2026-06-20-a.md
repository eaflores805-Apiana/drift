# Passdown — 2026-06-20 (session A)
*CS Engineer. Filed the team-alignment Product Description & Vision doc as the new "start here" entry. No code, no scoring, no instrumentation changes.*

## What I did

- **Filed `docs/00-product-description.md`** (v0.1.0, 2026-06-19, ~26 KB). Moved from `_INBOX/drift-product-description.md` (plain mv since the inbox file was untracked).
- Updated `docs/README.md` doc map: added the new doc at the top of the reading order as the **start-here** entry; added a "substantially subsumed by 00-product-description" note on `01-product-principles.md`, `02-record-and-plan.md`, and `08-value-and-moat.md` since the new doc covers their material at a higher level.
- Updated `_INBOX/README.md` naming hints to route future `*product-description*` / `*vision*` / `*team-alignment*` drops to the right slot.

### Filename note (asserted)

Filed at `docs/00-product-description.md` rather than renumbering every existing doc +1. Rationale:
- The doc explicitly says "start here" (§0).
- Alphabetical sort within slot 00 puts `00-product-description.md` before `00-roadmap.md` (p < r), so the natural file-listing order matches the intent.
- Renumbering 8 existing docs would have churned every cross-reference in correspondence, decision log, and code comments.

If the team prefers a strict numeric renumber (so `00-product-description` is the only slot-0 doc, with roadmap → 01 and everything bumping +1), say the word and I'll do the migration in one commit with all the cross-reference fixes.

## What this doc is (asserted)

The team-alignment doc that subsumes the project's "what we're making and why" content. Per its §0 one-paragraph version: *"Drift is a music-first personal radio station with an AI DJ that makes you feel connected to your own world… The music is the carrier; the DJ is the product."*

Notable structural pieces the team may want to act on in future sessions:
- **§4 the three layers** (Item judgment → Session programming → On-air execution) makes explicit that Layer 1 is the current work; Layer 2 (session/airtime budget) and Layer 3 (on-air execution) are designed but deliberately not yet built. Codifies "not voiced ≠ silenced; it means another moment was more worth interrupting the music for — that is curation, not censorship."
- **§5 the four routes** are now in the team-alignment doc verbatim (highlight / doorway / utility / silent), matching the v0.3.x gold labels. The doc explicitly flags the over-suppression problem and the candidate hierarchy-first additive fix.
- **§6 the DJ** introduces machinery not yet in the bench: enrichment via tethered associative paths, vetted bridge libraries, news pipeline. Designed; not yet built. Flagged here for filing under Phase D / Layer 3 work.
- **§7 safety non-negotiables** restates and tightens prior ADRs (safety queue, programmed-first / closed-input). Aligns with the locked grading model (judgment graded, safety absolute).
- **§9 attainable vs real challenge** is honest about the unknowns — including that "alive AND safe in generation, on real oblique data" is a research question, not just engineering. Worth re-reading before any line-generation work starts.

## Consequences for existing docs (flagged, not acted on)

The new doc materially overlaps with three existing canonical docs:
- `01-product-principles.md` (subsumed by §6–7)
- `02-record-and-plan.md` (subsumed by §1–4 + §11)
- `08-value-and-moat.md` (subsumed by §10)

Per the freeze + decision authority, **I did not delete or merge these.** Three reasonable team-level paths forward:
1. Keep all four — the team-alignment doc is the executive summary; the others are the deeper treatments.
2. Consolidate into the team-alignment doc, archive the others under `docs/archive/`.
3. Refactor: the team-alignment doc replaces 01/02/08 and the remaining numbered docs (03 rules-and-format, 04 architecture-review, 05 spec, 06 gold-labels, 07 decisions) keep their numbered slots as supporting detail.

Any of those is a Class 1 structural decision. CS does not propose; the team picks when ready.

## Self-audit (per `governance/reporting-standards.md`)

The numbers / claims I quoted in this passdown:
- **measured:** file size (~26 KB by `wc -c`), v0.1.0 version line, 2026-06-19 date — all visible in the file header. Verifiable by reading the file.
- **asserted:** every "subsumes" claim is my read of the section content; the team owns whether to consolidate or keep separate.
- **unverified:** no smoke check covers "the new doc is the single source of truth" — that's a team-level statement that lives in the doc, not in code.

No load-bearing arithmetic in this turn (filing only).

## What's NOT done (per freeze)

- No scoring changes.
- No instrumentation changes.
- No live model calls.
- No `route` / `voiceworthiness` / `eligibility_status` consumed in code.
- No deletion or merging of the docs the new file subsumes.
- No renumbering of existing slots.

## Repo state at end of turn
- Branch: `main`
- Remote: `https://github.com/eaflores805-Apiana/drift` (private)
- Local HEAD = Remote HEAD (will verify in turn summary)
- `_INBOX/` empty (only its own `README.md` remains)
- Smoke: 47/47 PASS as of `ca2bcaf` (no code touched this turn; not re-run)
