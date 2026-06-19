# Drift

A music-first personal radio station with an AI DJ that lightly connects the people, places, companies, creators, and news you care about — without ever feeling like a feed.

> **The promise:** Drift makes your world feel alive while your music plays.

> **Code name:** Drift. The public name is TBD — the name "Drift" is taken by an unrelated AI/software company and must change before any public-facing step. See `docs/03-decisions/drift-decision-log.md` (OPEN item #1).

## Team

- **Acting Manager / Product** — Elias Flores
- **Engineer 2 — Team Lead**
- **Engineer 1 — Senior Engineer** (Claude, on-call per session)
- **CS Engineer — Implementation** (Claude, this CLI)

See `governance/roles.md` for what each seat does and how decisions get signed off.

## Where to start

- **Want to understand what Drift is and why?** → `docs/README.md` (the doc map)
- **Returning CS Engineer starting a session?** → `ONBOARDING-CS.md`
- **Dropping new docs or artifacts?** → `_INBOX/README.md`

## Current phase

**Phase B — Prove the brain (the Promotion Playground).** Current `[NOW]` step: gold-labeling (Product Owner + 1–2 reviewers). Live status lives in `docs/00-vision/drift-roadmap.md` (the canonical phase map; phases run A → G).

**The one rule:** for any new idea — *"Later. Does it help prove the brain?"* If not, it waits.

## Repo layout

```
_INBOX/         Drop zone — CS Engineer sweeps and files each session
docs/           Source of truth (vision, spec, design, decisions, passdowns)
experiments/    Phase 0/1/2 work products (corpus, bench, tuning)
governance/     How the team works (roles, inbox workflow)
```
