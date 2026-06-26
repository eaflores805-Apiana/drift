# Eng1 → CS: Make the repo self-explaining (canonical index v2.0.0 + cleanup)

> **Goal:** anyone can open the repo cold, understand the idea, and see what's built, what's tested, and what's still air. This is a **Class-1-adjacent housekeeping pass** (it touches the canonical index and doc tiers, not code logic) — but the **provenance correction (#4) is a factual fix to a safety-eval record and should not be skipped.** Hold the actual commit until you've checked each item against the real tree; flag anything where my draft's status differs from what the code actually shows.

---

## What I'm handing you

`drift-canonical-index-v2.0.0-DRAFT.md` (in Eng1 outputs — content pasted/attached). It's the **upgraded entry point**: function-grouped map, **two-axis status (BUILD × VALIDATED)**, explicit unbuilt rows, an honest "what's tested and on what data" section, and the authority rule. It keeps the v1.0.0 conventions (stable filenames, version-in-masthead, tier-as-folder).

---

## The changes, in order

### 1. File the new index as `docs/00-canonical-index.md` (v2.0.0), archive the old one
- Replace the current `docs/00-canonical-index.md` body with the v2.0.0 draft content.
- Preserve the old v1.0.0 index for provenance: move its content to `docs/archive/00-canonical-index-v1.0.0.md` (or note in the decision log that v2.0.0 supersedes it).
- **Before committing: verify every status cell against the real tree.** Where my draft says `Built / Synthetic`, confirm the code actually exists and that its only validation was synthetic. Where it says `Partial` or `Not started`, confirm. **Correct any cell I got wrong** — I drafted build/test status from what I can read of `docs/` and correspondence, not from running the code, so the engine/affinity/gate/world-sim rows are my best inference and need your ground-truth.

### 2. Promote the current working docs from Eng1 outputs into `docs/`
These are ratified/TL-signed-off but are sitting in Eng1 scratch, not the repo. File each with a `STATUS:` masthead and an index row:
- `drift-engineering-doctrine` **v1.1.0** → `docs/` (the doctrine)
- `drift-production-prompt` **v0.3.2** → `docs/` (ratified prompt, hash `0576f0811b4d`)
- `drift-editorial-restraint-changeset` **v0.1.1** → `docs/` (TL-signed-off next-cycle change set)
- `drift-50post-run-spec` **v0.1.0** → `docs/`
- `drift-poc-the-handoff` **v1.0.0**, `drift-poc-the-drop` **v1.1.0**, `drift-commercial-the-handoff` **v1.0.0** → `docs/` (a `docs/pitch/` sub-dir would group these cleanly)
- `drift-complete-pipeline` **v1.0.0** + `drift-pipeline-figure` **v1.1.1.svg** → `docs/` (reconcile against `design.md` — the figure may belong alongside it)
- `world-generation-spec.md`, `arc-driven-synthetic-social-DRAFT` **v0_4**, `grounding-gate-spec.md` → `docs/` (reconcile `grounding-gate-spec` against any existing gate doc)
- `drift-worked-hour` **v0.6.0** → `docs/`; archive v0.1.0–v0.5.0
- Reconcile `drift-product-description` v0.2.0 against `docs/00-product-description.md` (keep the newer; archive the other).

For any promotion, **read the body, don't just move the file** — confirm it doesn't duplicate or contradict an existing canonical doc; if it supersedes one, mark the old `ARCHIVED — superseded by <doc>`.

### 3. Retire superseded versions (do not delete — archive)
Move to `docs/archive/` (or confirm they're already out of the canonical path), so only the current version is build-on-able:
- engineering-doctrine v1.0.0 / v1.0.1 / v1.0.2
- production-prompt v0.2.0 / v0.3.0 / v0.3.1
- editorial-restraint-changeset v0.1.0
- pipeline-figure v1.0.0 / v1.1.0
- worked-hour v0.1.0 → v0.5.0
- arc-driven-synthetic-social v0_1 / v0_2 / v0_3
- poc-the-drop v1.0.0

### 4. Correct the gold-packets provenance — factual fix to a safety record
`playground/scripts/gold-packets.ts` masthead currently says **"Human-authored, frozen."** This is inaccurate. The true provenance (from `drift-50post-run-spec` and confirmed this session): **Claude-authored — the 5 seed packets by Eng1 in the run spec, the remaining ~45 extended to pattern by CS.** Not a human curator.
- Correct the masthead to the truth, e.g.: `// Provenance: Claude-authored (Eng1 seed ×5 from the run spec; CS-extended ×45 to pattern). Frozen. NOT human-curated gold — see docs/00-canonical-index.md §"What's tested, and on what data."`
- **Do not** invent a "human-reviewed" claim unless Elias confirms a review actually happened. If review status is unknown, say so: `review status: unconfirmed`.
- This matters because a safety eval's credibility rests on knowing its gold set is *not* model-authored. The honest label is the point.

### 5. Add sub-directory READMEs (the brief write-ups)
Each group/sub-dir gets a short `README.md` — 3–5 sentences: **(1)** what this group is, **(2)** its build+validation state in one line, **(3)** the one thing to know before reading, **(4)** which doc to start with. Keep them short enough to stay current. At minimum: `docs/pitch/README.md`, `docs/correspondence/README.md` (exists — refresh), and a short refresh of `docs/README.md` pointing at the v2.0.0 index as the entry point.

### 6. File the session's open findings into a canonical doc
The four findings in the index's §4 (listener-relative classification; feed composition signal/texture/noise; graph-size backfill; synthetic-can't-validate) are currently only in the index as a summary. **File them properly** — either as a new `docs/` doc (e.g. `docs/data-and-classification-findings.md`) or as decision-log entries — so the index can *point* to the record instead of *being* the record. The classification-is-listener-relative finding in particular sharpens the Layer-1 ranking contract and probably belongs as an ADR in `07-decision-log.md`.

---

## Self-audit standard (as always)
For each move, show: the file, the check you ran (did you read the body? does it duplicate anything? what's the real build/test status?), and flag anything unverified. **Nothing commits until the status cells reflect the real tree and the provenance line is true.** Where my draft and reality disagree, reality wins — correct the draft.

## Sequence
1. (no commit) Verify every status cell in the draft against the real tree; correct mine.
2. (no commit) Stage: index swap, promotions, archive moves, provenance fix, READMEs.
3. ◆ Checkpoint — show Elias the corrected index + the list of promote/archive/provenance moves before committing.
4. Commit + push to `box8-grounding-gate` (or the agreed branch). Class-1 doc-tier changes follow the standing sign-off rule.
