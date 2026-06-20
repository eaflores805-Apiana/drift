# Drift — Documentation Map
*Start here to understand what we built and why.*

If you read these in order you should walk away knowing what Drift is, where we are, why it works the way it does, and where to find any detail you need.

**The one rule:** for any new idea — *"Later. Does it help prove the brain?"* If not, it waits.

## Reading order (the numbered docs)

| # | File | What it is |
|---|---|---|
| **start** | **`00-product-description.md`** | **Team-alignment doc — "what Drift is, what it is for, how it works, and what we are actually building right now."** Single source of truth; explicitly the start-here doc per its own §0. v0.1.0, 2026-06-19. |
| 0 | `00-roadmap.md` | The map — phases A–G, where we are now, exit criteria. Operational sibling to the product description. |
| 1 | `01-product-principles.md` | The product principles distilled — the guardrail against "an AI that reads your feed out loud" (subsumed by 00-product-description §6–7; retained as the longer treatment) |
| 2 | `02-record-and-plan.md` | Clean record + original phased plan (Phase 0/1/2/3+ numbering predates the roadmap's A–G; substantially subsumed by 00-product-description) |
| 3 | `03-rules-and-format.md` ★ | Engine spec: schemas, scoring, host rules |
| 4 | `04-architecture-review.md` ★ | Eng1 architecture: R1 hybrid scoring, R2 fail-closed safety, R3 eval-first; the Ingested / ModelDerived / Computed / Decision schema groupings |
| 5 | `05-promotion-playground-spec.md` ★ | Buildable v1 spec for the bench |
| 6 | `06-gold-labeling-guide.md` ★ | The labeling instrument — the eval target |
| 7 | `07-decision-log.md` | Founding decisions, rationale, rejected alternatives, OPEN items |
| 8 | `08-value-and-moat.md` | Where the value is — the asset and the moat. The "social graph" data dependency and what it forces strategically (substantially subsumed by 00-product-description §10) |

★ = build-critical for the CS Engineer. If reading only four, read these four.

## Background (unnumbered)

- `design.md` — original strategy + full system design (deep origin; partly superseded by the numbered docs)

## Other doc subfolders

- `correspondence/` — dated memos, reviews, letters from Engineer 1, the team, or CS (not canonical decisions; kept out of the decision log to keep it clean). Notable as of 2026-06-19: the eligible-audience consent-gate ruling, the roles-and-authority v0.1.1 memo, Step 3A acceptance, and the **Step 3B live meaning-pass proposal** (`cs-step3b-meaning-pass-proposal-2026-06-19.md`) awaiting team sign-off before any live API call.
- `passdowns/` — chronological CS Engineer session letters; latest date = current state

## The bench (`playground/`)

- `../playground/README.md` — technical entry point for the bench
- `../playground/ARCHITECTURE.md` — **approved principles** (modular pipeline, `IngestedItem` + `Decision` contracts, test-mode/real-mode parity, "model calls are services, not source of truth"). The specifics — exact schemas, module layout, libraries — are CS's to propose and the team's to approve, per the roles-and-authority memo.
- `../playground/BUILD.md` — build sequence + verification checks (Steps 1–6, with done-when criteria and the four checks we never skip)
- `../playground/meaning-pass-v1.md` — the meaning-pass prompt (v1, owned by Engineer 1). `prompt_version: meaning-pass-v0.1.0`. Unblocks Step 3+; judges meaning only, code decides the bucket
- `../playground/{package.json,tsconfig.json,vite.config.ts,index.html}` + `../playground/src/` — the bench code (Step 1 complete as of 2026-06-19; TypeScript + Vite + React + Zod). Run `npm install && npm run smoke` inside `playground/` to verify the acceptance checks; `npm run dev` to open the UI.
- `../playground/data/listener.json` — Listener Fixture 001 (Alex Rivera, Ventura, CA)
- `../playground/data/seed-items.json` — the simulated item corpus
- `../playground/data/gold-labels.json` — the gold-label eval set (seeds; grows as the team labels)
- `../playground/data/corpus-coverage-pack.json` — safety sentinels + time-decay cases for Phase B exit; **not for bench construction**, integrated before claiming the brain works

## Prototypes + examples (live outside `docs/`)

- `../prototypes/onecard.html` — locked one-card UI reference (Phase D target, not now)
- `../prototypes/demo.html` — archived earlier prototype
- `../prototypes/reference-images/` — visual target references
- `../examples/dj-lines.md` — DJ voice reference (the voice bible — what good sounds like, what stays silent)
