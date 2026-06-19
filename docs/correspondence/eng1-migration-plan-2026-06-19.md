# Drift — Repo Structure & Migration Plan
> **v0.1.0** · updated 2026-06-19 · for the CS Engineer. Reconciles the three folder layouts that emerged into one. Goal: every file has exactly one home, the docs read in order, and nothing gets regenerated — existing files are **moved/renamed**, not recreated.

## Principles
1. **Keep the workflow.** `_INBOX/` (drop zone) and `governance/` (roles) stay exactly as they are.
2. **One home per thing.** No duplicate READMEs, no two homes for the bench, no superseded files sitting next to live ones.
3. **Reading order is encoded.** Docs are numbered so the folder lists itself in the order a newcomer should read it. (Numbers are a convenience — drop them if you prefer and lean on `docs/README.md` instead.)
4. **Don't regenerate.** The version line inside each doc is the source of truth, not the filename — so renaming is free and loses nothing.

## Target structure
```
drift/
├── README.md                          ← root orientation (what / where / team / phase)
├── ONBOARDING-CS.md                   ← keep
├── _INBOX/                            ← keep (drop zone)
│   └── README.md
├── docs/                             ← source of truth, numbered = reading order
│   ├── README.md                      ← the doc map / index
│   ├── 00-roadmap.md
│   ├── 01-product-principles.md       ← NEW (to create)
│   ├── 02-record-and-plan.md
│   ├── 03-rules-and-format.md
│   ├── 04-architecture-review.md
│   ├── 05-promotion-playground-spec.md
│   ├── 06-gold-labeling-guide.md
│   ├── 07-decision-log.md
│   └── design.md                      ← background (unnumbered)
├── playground/                       ← the bench (Phase B build)
│   ├── README.md                      ← NEW (to create)
│   ├── data/
│   │   ├── listener.json              ← split from seed-corpus
│   │   ├── seed-items.json            ← split from seed-corpus
│   │   └── gold-labels.json           ← split from seed-corpus (starts ~empty)
│   ├── src/
│   │   ├── scoring/
│   │   ├── safety/
│   │   ├── prompts/
│   │   └── ui/
│   └── runs/                          ← tuning/export outputs (replaces experiments/)
├── examples/
│   └── dj-lines.md                    ← NEW (to create)
├── prototypes/                       ← reference only, NOT the build
│   ├── onecard.html                   ← Phase D UI reference
│   └── demo.html                      ← archived earlier prototype
├── archive/                          ← superseded, do not use
│   └── product-plan.md
├── governance/                       ← keep
│   └── roles.md
├── LICENSE
└── .gitignore
```

## File-by-file mapping
| Existing file | → New location | Action |
|---|---|---|
| `drift-roadmap.md` | `docs/00-roadmap.md` | move + rename |
| *(none yet)* | `docs/01-product-principles.md` | **create** |
| `drift-record-and-plan.md` | `docs/02-record-and-plan.md` | move + rename |
| `drift-rules-and-format.md` | `docs/03-rules-and-format.md` | move + rename |
| `drift-eng1-architecture-review.md` | `docs/04-architecture-review.md` | move + rename |
| `drift-promotion-playground-spec.md` | `docs/05-promotion-playground-spec.md` | move + rename |
| `drift-gold-labeling-guide.md` | `docs/06-gold-labeling-guide.md` | move + rename |
| `drift-decision-log.md` | `docs/07-decision-log.md` | move + rename |
| `drift-design.md` | `docs/design.md` | move |
| `drift-seed-corpus.json` | `playground/data/{listener,seed-items,gold-labels}.json` | **split** into 3 |
| *(none yet)* | `playground/README.md` | **create** |
| *(none yet)* | `examples/dj-lines.md` | **create** |
| `drift-onecard.html` | `prototypes/onecard.html` | move |
| `drift-demo.html` | `prototypes/demo.html` | move |
| `drift-product-plan.md` | `archive/product-plan.md` | move (superseded) |
| `drift-README.md` | — | **retire** (fold into root `README.md` + `docs/README.md`) |

## Reconciliations CS should make
- **Three READMEs → two.** Keep the repo's root `README.md` (orientation) and `docs/README.md` (the doc map). Retire my `drift-README.md`; pull anything useful from it into `docs/README.md`. No third README.
- **`experiments/` → `playground/`.** The bench has one home. Move any work products into `playground/runs/` and drop `experiments/`.
- **Flatten `docs/00-vision/`, `docs/03-decisions/`** (the numbered *subfolders* currently in the repo) into the numbered *files* above. Most categories are one file, so subfolders just add empty nesting.

## What still needs creating (the real gaps)
Only four things don't exist yet. I'll draft them next once you confirm this layout:
1. `docs/01-product-principles.md`
2. `playground/README.md`
3. `examples/dj-lines.md`
4. the three split data files (content already exists in `seed-corpus.json` — I'll also reconcile the listener persona, since an earlier note proposed different interests than the listener that's already defined).

Everything else is **move/rename only.** Nothing regenerated, nothing to re-download.
```
```
