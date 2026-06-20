# _INBOX — Drop Zone
*Files dropped here are swept, classified, and filed by the CS Engineer each session.*

## How it works

1. Anyone (acting manager, Engineer 1, Engineer 2) drops files into this folder during or between sessions.
2. The CS Engineer (Claude) reads each file at the start of the next session, classifies it, and moves it to its proper destination under `docs/`, `playground/`, `prototypes/`, or `examples/`.
3. After filing, the CS Engineer commits and pushes, then reports what landed where (with the post-push remote HEAD).
4. `_INBOX/` should be empty at the end of every CS Engineer turn.

## Naming hints

Filenames don't have to be perfect — the CS Engineer renames during filing — but a hint helps classification. Per Senior's migration plan v0.1.0, the `drift-` prefix is stripped on filing.

| Filename hint | Destination |
|---|---|
| `drift-product-description*`, `*vision*`, `*team-alignment*` | `docs/00-product-description.md` |
| `drift-roadmap*` | `docs/00-roadmap.md` |
| `drift-product-principles*` | `docs/01-product-principles.md` |
| `drift-record-*`, `drift-plan-*` | `docs/02-record-and-plan.md` |
| `drift-rules*`, engine schema/format | `docs/03-rules-and-format.md` |
| `drift-architecture-*` | `docs/04-architecture-review.md` |
| `drift-playground-spec*` | `docs/05-promotion-playground-spec.md` |
| `drift-break-structure*`, `*session-programmer*`, `*layer-2*` | `docs/09-break-structure-spec.md` |
| `drift-life-event*`, `*event-taxonomy*` | `docs/10-life-event-taxonomy.md` |
| `drift-build-map*` | `docs/build-map.md` (unnumbered) |
| `drift-dj-segments*`, `*showcase*` | `examples/dj-segments-showcase.md` |
| `drift-*-parked*` (parked future-work notes) | `docs/correspondence/eng1-*-parked-<date>.md` |
| `drift-gold-labeling*`, eval instrument | `docs/06-gold-labeling-guide.md` |
| `drift-decision-log*`, `drift-decisions*` | `docs/07-decision-log.md` |
| `drift-design*` (background origin doc) | `docs/design.md` |
| `drift-eng[12]-*` review / memo / letter (dated) | `docs/correspondence/<author>-<topic>-<date>.md` |
| `passdown-*` | `docs/passdowns/` |
| `*.html`, `*.png` UI mockups / reference imgs | `prototypes/` or `prototypes/reference-images/` |
| `dj-lines*`, sample DJ outputs | `examples/` |
| `listener.json`, `seed-items.json`, `gold-labels.json` | `playground/data/` |
| `bench-run-*`, tuning outputs | `playground/runs/` |
| Source code (scoring / safety / prompts / UI) | `playground/src/<area>/` |

## What does NOT go here

- Production code (after Phase B, lives in `playground/src/`; a future real `src/` may come later).
- Anything that should land on a feature branch — drop a passdown note instead.
- `.DS_Store` / OS junk (caught by `.gitignore`).
