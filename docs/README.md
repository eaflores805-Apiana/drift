# Drift — Documentation Map
*Start here to understand what we built and why. Adopts the reading order proposed by Engineer 1 in `03-decisions/drift-senior-project-index-proposal.md`.*

If you read these in order you should walk away knowing what Drift is, where we are, why it works the way it does, and where to find any detail you need.

## Reading order

### 1. The map — where we are
`00-vision/drift-roadmap.md` ← canonical orientation
Phases A → G, current `[NOW]` marker, exit criteria for the current phase, and the on-task rule (*"Later. Does it help prove the brain?"*).

### 2. The record + plan — what & why
`00-vision/drift-record-and-plan.md`
The clean record + the original phased execution plan. *Note: the phase numbering in this doc (0/1/2/3/4+) predates the roadmap's A–G nomenclature; trust the roadmap as the live phase map.*

### 3. The decisions — the discussion record
`03-decisions/drift-decision-log.md`
Founding discussion: every `[AGREED]` item, why it was agreed, what was rejected, what's deferred, what's still `OPEN`.

`03-decisions/drift-eng1-architecture-review.md`
Engineer 1's architecture review. Establishes the three required changes — **R1** hybrid scoring (model judges meaning, code computes score), **R2** fail-closed two-layer safety (consent gate at ingest + post-generation claim-grounding), **R3** eval-first (gold labels before scoring) — and the schema refinements (Ingested / ModelDerived / Computed / Decision, listener as first-class object).

`03-decisions/drift-senior-project-index-proposal.md` *(proposal — awaiting Acting Manager call)*
Engineer 1's proposed v0.1.0 project index. Implies a docs restructure (flat `docs/`, separate `data/`, `prototypes/`, `archive/`, strip `drift-` prefix). Not yet adopted.

### 4. The engine spec — how it works  ★
`01-spec/drift-rules-and-format.md`
Attention ladder, eligibility gate, promotion score, host behavior rules, schemas (Item / Score / Segment / spoken format / interaction events), tunable parameters.

### 5. The gold labels — the eval target  ★
`01-spec/drift-gold-labeling-guide.md`
The labeling instrument. Defines what "correct" looks like for the bench — the asset per Eng1 R3. Supersedes any inline label template in the seed corpus.

### 6. The data — the messy raw material  ★
`experiments/phase-0-corpus/drift-seed-corpus.json`
The simulated 40-account corpus + the defined fictional listener. What the bench loads.

### 7. The design — what it looks like
- `02-design/drift-onecard.html` — current locked one-card prototype (reference for Phase D, **not now**)
- `02-design/drift-demo.html` — earlier stacked-feed prototype (archived, superseded by onecard)
- `02-design/reference-images/` — visual target references

### 8. The passdowns — what just happened
`04-passdowns/` — chronological CS Engineer session letters. Latest date = current state.

## Build-critical for the CS Engineer (★)
If reading only four: **rules-and-format**, **architecture-review**, **gold-labeling-guide**, **seed-corpus.json**.

## Known gaps (referenced but not yet filed)
- `design.md` — referenced as "original strategy + system design (deep version)." Background, not build-critical.
- **Engineer 2's Promotion Playground v1 spec** — referenced by Eng1's architecture review. Expected to land in `01-spec/` once R1–R3 are incorporated.
