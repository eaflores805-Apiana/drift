# Drift — Documentation Map
*Start here to understand what we built and why.*

Read these in order and you should walk away knowing what Drift is, why it works the way it does, and where to find any detail you need.

## Reading order

### 1. The vision — what & why
`00-vision/drift-record-and-plan.md`
The clean record + the phased execution plan. The spine of the product.

### 2. The decisions — the discussion record
`03-decisions/drift-decision-log.md`
Founding discussion: every `[AGREED]` item, why it was agreed, what was rejected, what's deferred, what's still `OPEN`.

`03-decisions/drift-eng1-architecture-review.md`
Engineer 1's architecture review of the Promotion Playground v1 plan. Establishes the three required changes — **R1** hybrid scoring (model judges meaning, code computes the score), **R2** fail-closed two-layer safety (consent gate at ingest + post-generation claim-grounding check), **R3** eval-first (gold labels before scoring) — and the schema refinements that the v1 spec must reflect.

### 3. The engine spec — how it works
`01-spec/drift-rules-and-format.md`
The engine spec in detail: attention ladder, eligibility gate, promotion score, host behavior rules, schemas (Item / Score / Segment / spoken format / interaction events), and the tunable parameters.

### 4. The design — what it looks like
- `02-design/drift-onecard.html` — current locked one-card prototype
- `02-design/drift-demo.html` — earlier exploration prototype
- `02-design/reference-images/` — the visual target references

### 5. The passdowns — what just happened
`04-passdowns/` — chronological CS Engineer session letters. Latest = current state.

## Known gaps (documents referenced but not yet filed)

- `drift-design` — referenced by the decision log as "the original strategy + system design (deep version)." Not in repo yet.
- **Engineer 2's Promotion Playground v1 spec** — referenced by the Eng1 architecture review. Expected to land in `01-spec/` once R1–R3 are incorporated.
