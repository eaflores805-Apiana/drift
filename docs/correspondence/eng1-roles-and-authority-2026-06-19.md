# Drift — Memo: Roles & Decision Authority

> **v0.1.0** · 2026-06-19 · from Engineer 1, for the team (Product Owner, Engineer 2, CS Engineer). Purpose: set the boundary on who decides the build, so authority and ownership are unambiguous before the code grows.

## Why this memo
The work is going well and CS's instincts are good. But the line between *deciding the build* and *building it* has blurred — including on our side, where specs got written that were really CS's to author. This memo makes the boundary explicit so nobody steps over it in either direction.

## The rule
**The build is decided by the Product Owner, Engineer 2, and Engineer 1. CS recommends and implements; CS does not decide architecture unilaterally.**

- A recommendation from CS is **input, not a ruling.** It comes to the team; the team approves, amends, or rejects it; *then* it is the plan.
- Nothing becomes architecture because it was written down. It becomes architecture when the team signs off.

## How decisions actually flow
This is a loop, and the direction matters:

1. **CS proposes** the implementation — schemas, module layout, types, the specifics of how a step gets built.
2. **The team approves or amends** the proposal. Contracts get blessed before they harden.
3. **CS builds** it.
4. **The team reviews** the result against the agreed contracts and the safety bar.

Authority sits with the team. Keystrokes sit with CS. Decisions flow *down* (from the team); code and proposals flow *up* (from CS for sign-off).

**Important — this is not a license to over-specify.** "The team decides the build" does **not** mean the team hands CS finished specs. Pre-writing every schema and file is how we slid into doing CS's job. The healthy form is: **CS proposes the implementation; the team approves or amends.** That keeps the authority with us and the actual engineering with CS — which is also how we find out whether the engineering is any good.

## Roles, briefly
- **Product Owner** — vision, taste calls, gold labels, final approval.
- **Engineer 2 (Team Lead)** — product/technical direction; scoring/prompt/safety logic; reviews.
- **Engineer 1 (Senior)** — architecture/risk review; owns the judgment artifacts (meaning-pass prompt, gold labels, sentinels, principles); reviews implementation against contracts.
- **CS Engineer** — proposes implementation, then builds it: data loader, scoring, sliders, safety checks, generation, UI, export. Owns the code end to end, under team-approved contracts.

## Ruling on the open item: CS's modular-architecture recommendation
CS's modular memo is a good recommendation. Per the rule above, here's the team ruling so it's settled rather than floating:

- **Approved — the principle.** Build as a pipeline of replaceable modules with stable contracts: *same interface, different adapter*, so simulated data now and real data later swap without rebuilding the brain. And the non-negotiable: **model calls are a meaning/generation service, never the source of truth for scoring or safety** — code owns consent, scoring, bucket assignment, and claim-grounding.
- **CS's to propose, team to approve — the specifics.** The exact schemas, type definitions, file structure, and module names are CS's to propose and ours to bless before they harden. Good instinct; CS owns the implementation of it.

## The healthiest next move
This project is well-documented — arguably over-documented. The next thing that moves us forward is **a running bench, not more prose.** CS builds Steps 1–2 (loader, deterministic scoring, sliders, buckets, export) and we react to something real. The one judgment artifact still genuinely outstanding is the **meaning-pass prompt**, which is Engineer 1's to draft and the team's to approve — and it's what CS needs before Step 3.

## One line for the wall
> The team decides the build. CS proposes and builds. Nothing is architecture until the team signs off — and deciding the build is not the same as writing CS's code.
