# Passdown — 2026-06-19 (session B)
*CS Engineer second session of the day. Senior's repo restructure executed; two new canonical docs filed; meta-docs updated to the new paths.*

## What I did this session

**Filed Senior's migration plan + approval memo**
- `docs/correspondence/eng1-migration-plan-2026-06-19.md` (the plan)
- `docs/correspondence/eng1-migration-approval-2026-06-19.md` (the approval / follow-up)

**Executed the full migration per Senior's v0.1.0 plan + my 5 gap calls (all approved):**
- Flattened numbered subfolders into numbered files at `docs/` root: `00-roadmap`, `02-record-and-plan`, `03-rules-and-format`, `04-architecture-review`, `06-gold-labeling-guide`, `07-decision-log`. Stripped `drift-` prefix on every file.
- Renamed `experiments/` → `playground/` with the spec'd internal layout (`data/`, `src/{scoring,safety,prompts,ui}/`, `runs/`).
- Moved HTML mockups + reference images to `prototypes/`.
- Moved passdowns to `docs/passdowns/` (dropped the `04-` prefix; passdowns aren't in the linear reading order). The earlier passdown is now `passdown-2026-06-19-a.md`.
- Created `docs/correspondence/` for dated memos / reviews / letters (pulled the two Eng1 letters out of `03-decisions/`).
- Created `examples/` with `.gitkeep` (awaiting `dj-lines.md` from Senior).
- Did NOT create `archive/` — Senior said skip importing `product-plan.md`.

**Filed the two newly-dropped source files:**
- `_INBOX/drift-design.md` → `docs/design.md` (background, unnumbered)
- `_INBOX/drift-promotion-playground-spec.md` → `docs/05-promotion-playground-spec.md` (the buildable v1 spec for CS)

**Updated meta-docs to the new paths:**
- Root `README.md` — repo layout block + path to decision log + roadmap
- `docs/README.md` — full rewrite as a numbered-doc table; ★ markers preserved; future-doc placeholders noted; pointers to `playground/data/`, `prototypes/`, `examples/`
- `ONBOARDING-CS.md` — passdown path + decision-log path
- `_INBOX/README.md` — naming-hints table rewritten for the new structure (drift-prefix stripping noted)
- `governance/inbox-workflow.md` — FILED-definition path list updated

**Housekeeping:** removed a stale `docs/03-decisions/drift-eng1-migration-plan-2026-06-19 2.md` duplicate (OS-generated artifact from an earlier overwrite).

## Decisions awaiting sign-off

1. **Persona call** *(Senior is blocked on this)* — fishing/BBQ listener vs. indie-pop/surf listener already defined in the corpus. Senior needs the call from the Acting Manager or Engineer 2 before splitting `seed-corpus.json` into `listener.json` / `seed-items.json` / `gold-labels.json` and drafting `product-principles.md`, `playground/README.md`, `examples/dj-lines.md`.
2. **OPEN-2 wording in the decision log** *(carried from passdown -a)* — still recommend tightening to make explicit that repo-public is collaboration ergonomics, not GTM posture; GTM posture itself remains open until Phase F.
3. **Phase nomenclature in `02-record-and-plan.md`** *(carried from passdown -a)* — record-and-plan still uses 0/1/2 numbering; roadmap is canonical with A–G. Engineer 2 / Acting Manager call whether to reconcile in-text.

## What's next

- **Acting Manager / Eng2:** resolve the persona question so Senior can deliver `01-product-principles.md`, `playground/README.md`, `examples/dj-lines.md`, and the seed-corpus split.
- **Senior (Eng1):** drop the four artifacts into `_INBOX/` once the persona is decided.
- **CS (me):** read `docs/05-promotion-playground-spec.md` end-to-end before any build work; remain in support mode (inbox sweep, filing, doc hygiene) until the split data lands and the spec is on the build path.

## Open questions / blockers
- Persona call (blocks Senior's next four drops).
- `06-gold-labeling-guide.md` references an inline label template in the seed corpus that it supersedes — when the corpus is split, make sure `gold-labels.json` starts ~empty and the guide is the only source of label structure.

## Repo state at end of turn
- Branch: `main`
- Remote: `https://github.com/eaflores805-Apiana/drift` (public)
- Local HEAD = Remote HEAD (verified in turn summary)
- `_INBOX/` empty (only its own `README.md` remains)
- Working tree clean after this passdown's commit
