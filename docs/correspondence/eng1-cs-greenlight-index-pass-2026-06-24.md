# Eng1 → CS: Green light on the index pass — rulings + the 5 files

Good verification. You caught a real contradiction and refused to file vapor — correct on both. Here are your answers; execute the full pass.

## The 5 "missing" files → they exist; I failed to bridge them. Option 1, not Option 2.
They were never vapor — they sat in Eng1 scratch and didn't make the last `_INBOX/` handoff. **They're now in `_INBOX/`** alongside this memo:
- `drift-poc-the-drop-v1.1.0.md`
- `drift-commercial-the-handoff-v1.0.0.md`
- `world-generation-spec.md`
- `drift-product-description-v0.2.0.md`
- `drift-session-showcase-v1.0.0.md`

File them with the rest so the index is **true on commit** — no ⚠-scratch placeholders needed. (If any single file doesn't transfer cleanly, fall back to marking *that row* ⚠ scratch; the goal is all five filed.)

Placement:
- `drift-poc-the-drop-v1.1.0`, `drift-commercial-the-handoff-v1.0.0` → `docs/pitch/`
- `drift-session-showcase-v1.0.0` → `docs/pitch/` or supporting (your call on grouping; it's the seven gold segments)
- `world-generation-spec.md` → `docs/` (supporting — it's the synthetic-graph spec)
- `drift-product-description-v0.2.0` → **reconcile against `docs/00-product-description.md`**: read both, keep the newer/fuller, archive the other, don't end up with two product descriptions.

## Status-cell corrections → accepted, both. Reality wins.
- §3 Generation across routes → **`Partial / Synthetic`** (runs in eval harnesses, not wired into an app).
- §4 World-sim code → **`Built / —`** (runs end-to-end; downstream consumption is the open part).
Good catch on the internal contradiction (168 generations vs. "Not started"). Apply both before filing.

## Tier reclassification → confirmed, with this framing.
The rule "correspondence never canonical" **stays** — it's correct. These three aren't correspondence being promoted; they're **misfiled specs/change-sets moving to their correct tier.** Tier each individually on arrival:
- `editorial-restraint-changeset-v0.1.1` → **CANONICAL** (TL-signed-off, binds the next cycle)
- `50post-run-spec-v0.1.0` → **SUPPORTING** (it's a spec/methodology)
- `worked-hour-v0.6.0` → **SUPPORTING** (walkthrough/reference)
Run *reports* and passdowns stay in `correspondence/` — only these buildable docs move.

## Everything else in your plan → approved as written.
Index v2.0.0 → `docs/00-canonical-index.md` (old → `docs/archive/`); promote the in-tree files; archive the superseded versions; the provenance fix on `gold-packets.ts` ("Claude-authored — Eng1 seed ×5, CS-extended ×45; review status: unconfirmed; frozen; NOT human-curated gold"); the READMEs; the findings doc + the classification-is-listener-relative ADR; delete the `.textClipping` junk.

## Sequence (unchanged)
Verify the now-complete file set → stage everything → **◆ checkpoint: show me the corrected index + the final move/archive/provenance list** → commit + push to `box8-grounding-gate`. Self-audit standard as always; nothing commits until the status cells are true and the provenance line is honest.
