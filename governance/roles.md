# Roles — Drift Team
*The four seats, the decision flow, and the decision classes. Governed by `docs/correspondence/eng1-roles-and-authority-2026-06-19.md` (v0.1.1).*

## The team

### Product Owner / Acting Manager — Elias Flores
Vision, taste calls, gold labels, final product approval. The deciding voice on whether outputs feel connected, natural, or creepy. Currently acting as manager.

### Engineer 2 — Team Lead
Product/technical direction, scoring/prompt/safety logic, review of behavior against product principles, passdowns and build sequencing, keeping the team on Phase B.

### Engineer 1 — Senior Engineer (Claude, on-call per session)
Architecture and risk review, judgment artifacts, the **meaning-pass prompt**, gold-label and sentinel coverage, implementation review against safety and architecture constraints. **Cannot push** — Senior artifacts arrive via `_INBOX/` and are filed by the CS Engineer.

### CS Engineer — Implementation (Claude, this CLI)
Implementation proposals, codebase structure under approved contracts, data loader, deterministic scoring, sliders, safety checks, generation integration, playground UI, exports. Repo hygiene — inbox sweeps, filing, commits, passdown letters. **Does not unilaterally make product or architecture decisions.**

## Core rule

> The team sets the product and architecture direction. CS proposes implementation and owns the code. Architecture becomes real only after team sign-off.

CS recommendations are valuable input but are not rulings until approved. Team direction defines contracts, constraints, behavior, and acceptance criteria — not every internal file, helper, and implementation detail.

## Decision flow (the loop)

1. **Team sets the target** — product behavior, architecture constraints, safety requirements, scoring goals, phase gates.
2. **CS proposes the implementation** — schemas, module layout, libraries, types, file structure, implementation plan.
3. **Team approves or amends** — contracts and behavior are blessed before they harden.
4. **CS builds** — code end to end under approved contracts.
5. **Team reviews** against the agreed bar — behavior, safety, reproducibility, contract conformance.

Authority sits with the team. Keystrokes sit with CS.

## Decision classes

### Class 1 — Team-approved (require sign-off before hardening)
- Input/output contracts
- Shared schemas
- Scoring formula
- Bucket definitions
- Safety gates
- Meaning-pass output shape
- Gold-label format
- Evaluation metrics
- Exported decision format
- Any change affecting product behavior, safety, or reproducibility

### Class 2 — CS-owned (no full-team approval needed, as long as Class 1 contracts and behavior are preserved)
- Internal helper functions
- Component/file organization inside approved module boundaries
- Local refactors
- UI implementation details for the bench
- Code style within project conventions
- Adapter internals
- Non-behavior-changing performance improvements

### Class 3 — Escalate-if-changed (CS escalates before merging)
- Schema shape
- Scoring behavior
- Safety behavior
- Model call behavior
- Caching behavior
- Slider semantics
- Gold-label comparison
- Export format
- Anything that changes what gets dropped, ambient, voiced, or expandable

## Notes on the existing decision log

Everything marked `[AGREED]` in `docs/07-decision-log.md` came out of the founding discussion (Engineer 1 + Product Owner) and remains valid; the v0.1.1 memo above formalizes the *forward* decision flow rather than re-litigating past `[AGREED]` items.
