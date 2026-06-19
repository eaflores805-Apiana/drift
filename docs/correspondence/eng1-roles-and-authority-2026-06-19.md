# Drift — Memo: Roles & Decision Authority

> **v0.1.1** · 2026-06-19 · for the team: Product Owner, Engineer 1, Engineer 2, CS Engineer

## Purpose

This memo clarifies who owns which decisions before the codebase hardens.

The project is moving well, and CS's instincts have been good. But we need to keep a clean boundary between:

* setting product/architecture direction,
* proposing implementation,
* writing code,
* and approving changes that affect Drift's judgment engine.

This prevents two failure modes:

1. the team accidentally writing CS's implementation for him, and
2. CS accidentally turning implementation choices into architecture without team approval.

Both are avoidable.

## Core rule

> **The team sets the product and architecture direction. CS proposes implementation and owns the code. Architecture becomes real only after team sign-off.**

CS recommendations are valuable input. They are not rulings until approved.

Likewise, team direction should define contracts, constraints, behavior, and acceptance criteria — not over-specify every internal file, helper, and implementation detail.

## Decision flow

The healthy loop is:

1. **Team sets the target**
   Product behavior, architecture constraints, safety requirements, scoring goals, and phase gates.

2. **CS proposes the implementation**
   Schemas, module layout, libraries, types, file structure, and implementation plan.

3. **Team approves or amends the proposal**
   Contracts and behavior are blessed before they harden.

4. **CS builds**
   CS owns the code end to end under the approved contracts.

5. **Team reviews against the agreed bar**
   Review focuses on behavior, safety, reproducibility, and whether the code matches the approved contracts.

## Decision classes

### 1. Team-approved decisions

These require team approval before they harden:

* input/output contracts
* shared schemas
* scoring formula
* bucket definitions
* safety gates
* meaning-pass output shape
* gold-label format
* evaluation metrics
* exported decision format
* any change affecting product behavior
* any change affecting safety or reproducibility

### 2. CS-owned implementation decisions

CS owns these without needing full-team approval, as long as approved contracts and behavior are preserved:

* internal helper functions
* component/file organization inside approved module boundaries
* local refactors
* UI implementation details for the bench
* code style within project conventions
* adapter internals
* non-behavior-changing performance improvements

### 3. Escalate-if-changed decisions

CS should escalate before merging or hardening changes that alter:

* schema shape
* scoring behavior
* safety behavior
* model call behavior
* caching behavior
* slider semantics
* gold-label comparison
* export format
* anything that changes what gets dropped, ambient, voiced, or expandable

## Roles

### Product Owner

Owns:

* vision
* taste calls
* gold labels
* final product approval
* whether outputs feel connected, natural, or creepy

### Engineer 2 / Team Lead

Owns:

* product/technical direction
* scoring/prompt/safety logic
* review of behavior against product principles
* passdowns and build sequencing
* keeping the team on Phase B

### Engineer 1 / Senior Engineer

Owns:

* architecture and risk review
* judgment artifacts
* meaning-pass prompt
* gold-label and sentinel coverage
* implementation review against safety and architecture constraints

### CS Engineer

Owns:

* implementation proposals
* codebase structure under approved contracts
* data loader
* deterministic scoring
* sliders
* safety checks
* generation integration
* playground UI
* exports
* keeping code modular and maintainable

## Ruling on modular architecture

The modular architecture recommendation is approved in principle.

Approved principles:

* Build as replaceable modules with stable contracts.
* Use the same interface for simulated data now and real adapters later.
* The model is a meaning/generation service, not the source of truth.
* Code owns consent, scoring, bucket assignment, and claim-grounding.
* Simulated and real data must normalize to the same input contract.
* Playground and future product surfaces should consume the same decision contract.

CS should now propose the specific schemas, module layout, types, and file structure for team approval.

## Current priority

The project is well-documented. The next thing that moves us forward is a running bench.

Immediate CS focus:

* playground skeleton
* seed data loader
* schema validation
* placeholder deterministic scoring
* buckets
* exportable `Decision` objects

Immediate Engineer 1 focus:

* meaning-pass prompt
* corpus coverage gaps
* sensitivity sentinel plan

Immediate Product Owner focus:

* gold-label current corpus

Immediate Engineer 2 focus:

* review proposals
* protect scope
* keep work tied to Phase B

## One line for the wall

> The team sets direction and approves contracts. CS proposes and owns implementation. Nothing becomes architecture until the team signs off.

---

*Filed by CS Engineer, 2026-06-19. Supersedes v0.1.0 (preserved in git history at commit 970d725). Drove this turn's correction: rewrite of `playground/ARCHITECTURE.md` from "binding spec" to "approved principles + CS-to-propose specifics," and the move of the original modular-architecture memo to `docs/correspondence/eng1-modular-architecture-memo-2026-06-19.md`.*
