# Drift — Project Index (README)
> **v0.1.0** · updated 2026-06-19 · the entry point. Start here, then follow the reading order.

**What Drift is:** a music-first personal radio station where a DJ lightly connects the people, places, companies, creators, and news you care about — drawn only from what people have published. The promise is a *feeling*: your world feels alive while your music plays.

**Where we are:** Phase B — proving the brain (the Promotion Playground). Current task: gold-labeling. Live status is always in the **roadmap**.

**The one rule:** for any new idea — *"Later. Does it help prove the brain?"* If not, it waits.

---

## How to read this repo (as a whole, in order)
1. **roadmap** — the map: phases, where we are, the gate to advance. *(orientation)*
2. **record-and-plan** — the full current-state record + the phased build plan. *(the what)*
3. **decision-log** — every major decision, its rationale, and the alternatives we rejected. *(the why)*
4. **rules-and-format** ★ — the engine spec: schemas, scoring formula, host rules. *(the how)*
5. **architecture-review** ★ — the technical architecture: hybrid scoring, fail-closed safety, eval-first, schema grouping. *(how to build it)*
6. **gold-labeling-guide** ★ — the instrument for the current task; defines the eval target. *(the now)*
7. **seed-corpus.json** ★ — the actual messy data the bench loads. *(the data)*

Background, read if you want the deep origin story: **design** (original strategy + system design — some of it superseded by the docs above, but it's where the thinking started).

★ = **build-critical for the CS engineer.** If you read only four, read those four.

---

## The files, grouped

### Canonical — active (all v0.1.0)
| File | What it is | Who needs it |
|---|---|---|
| `roadmap.md` | The operating map: phases, status, exit criteria | Everyone |
| `record-and-plan.md` | Current-state record + phased plan | Everyone |
| `decision-log.md` | Decisions + rationale + rejected alternatives | Everyone (context) |
| `rules-and-format.md` ★ | Engine spec: schemas, scoring, host rules | CS Engineer, Eng 2 |
| `architecture-review.md` ★ | Architecture decisions (R1–R3), schema grouping | CS Engineer |
| `gold-labeling-guide.md` ★ | Labeling instrument; the eval target | PO, reviewers |
| `seed-corpus.json` ★ | Seed dataset + defined listener | CS Engineer |

### Background — context, not build-from
| File | What it is |
|---|---|
| `design.md` | Original strategy + full system design (deep origin; partly superseded) |

### Prototypes — reference only, NOT the build
| File | What it is |
|---|---|
| `onecard.html` | The one-card UI direction — reference for **Phase D**, not now |
| `demo.html` | Earlier stacked-feed prototype — **archived**, superseded by onecard |

### Superseded — ignore
| File | Replaced by |
|---|---|
| `product-plan.md` | `record-and-plan.md` |

---

## Suggested folder layout
So the repo reads as a whole. (Current files carry a `drift-` prefix; rename as you like when they move into the `drift/` folder — the version line inside each is the source of truth, not the filename.)

```
drift/
├── README.md                  ← this index
├── docs/                      ← read these as a set
│   ├── roadmap.md
│   ├── record-and-plan.md
│   ├── decision-log.md
│   ├── rules-and-format.md
│   ├── architecture-review.md
│   ├── gold-labeling-guide.md
│   └── design.md              (background)
├── data/
│   └── seed-corpus.json
├── prototypes/                ← reference only
│   ├── onecard.html
│   └── demo.html              (archived)
└── archive/
    └── product-plan.md        (superseded)
```

---

## Versioning convention
- Format: `vMAJOR.MINOR.PATCH`. Everything is currently **v0.1.0** (pre-1.0 working drafts).
- **PATCH** = small fix · **MINOR** = new section / real content change · **MAJOR** = restructure or lock-as-final.
- The version lives **inside each doc's header**. When a file changes, its version bumps there and the change is called out in chat — so you only re-pull the file that moved.
- **Heads-up for CS:** the `roadmap` is the most recently edited (it absorbed Engineer 2's review edits and the expanded Phase A). Make sure the repo copy is the current on-disk one.
