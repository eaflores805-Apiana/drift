# Drift — Documentation Map
*Start here to understand what we built and why.*

If you read these in order you should walk away knowing what Drift is, where we are, why it works the way it does, and where to find any detail you need.

**The one rule:** for any new idea — *"Later. Does it help prove the brain?"* If not, it waits.

## Reading order (the numbered docs)

| # | File | What it is |
|---|---|---|
| 0 | `00-roadmap.md` | The map — phases A–G, where we are now, exit criteria |
| 1 | `01-product-principles.md` *(forthcoming — Engineer 1)* | The product principles distilled |
| 2 | `02-record-and-plan.md` | Clean record + original phased plan (Phase 0/1/2/3+ numbering predates the roadmap's A–G) |
| 3 | `03-rules-and-format.md` ★ | Engine spec: schemas, scoring, host rules |
| 4 | `04-architecture-review.md` ★ | Eng1 architecture: R1 hybrid scoring, R2 fail-closed safety, R3 eval-first; the Ingested / ModelDerived / Computed / Decision schema groupings |
| 5 | `05-promotion-playground-spec.md` ★ | Buildable v1 spec for the bench |
| 6 | `06-gold-labeling-guide.md` ★ | The labeling instrument — the eval target |
| 7 | `07-decision-log.md` | Founding decisions, rationale, rejected alternatives, OPEN items |

★ = build-critical for the CS Engineer. If reading only four, read these four.

## Background (unnumbered)

- `design.md` — original strategy + full system design (deep origin; partly superseded by the numbered docs)

## Other doc subfolders

- `correspondence/` — dated memos, reviews, letters (not canonical decisions; kept out of the decision log to keep it clean)
- `passdowns/` — chronological CS Engineer session letters; latest date = current state

## Data + prototypes (live outside `docs/`)

- `../playground/data/seed-corpus.json` — 40-account simulated corpus + defined listener. Engineer 1 to split into `listener.json` + `seed-items.json` + `gold-labels.json` once the persona call is resolved.
- `../prototypes/onecard.html` — locked one-card UI reference (Phase D target, not now)
- `../prototypes/demo.html` — archived earlier prototype
- `../prototypes/reference-images/` — visual target references
- `../examples/dj-lines.md` *(forthcoming — Engineer 1)* — sample DJ outputs
