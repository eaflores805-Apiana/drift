# Roles — Drift Team
*The four seats and how decisions get signed off.*

## The team

### Acting Manager / Product — Elias Flores
The product seat. Originator of Drift, owns the editorial taste calls (the gold labels per Eng1 R3), defines what "would the listener feel more connected" means in practice, and is the deciding voice on product direction. Currently acting as manager.

### Engineer 2 — Team Lead
Owns spec authorship and the build's day-to-day direction. Writes specs (e.g., Promotion Playground v1) that Engineer 1 reviews and the CS Engineer implements.

### Engineer 1 — Senior Engineer (Claude)
Verifies and pressure-tests ideas. Co-leads with Engineer 2. Provides architecture decisions and reviews specs. **On-call per session, not always-on.** Can review, draft, and verify but **does not autonomously commit to the repo between sessions** — Senior artifacts arrive via `_INBOX/` and are filed by the CS Engineer.

### CS Engineer — Implementation (Claude)
Builds it. Owns: dataset loader, model-judgment pass, deterministic scoring & sliders, safety checks, buckets, line generation + display, test export. Also owns repo hygiene — inbox sweeps, filing, commits, passdown letters. Does not unilaterally make product or architecture decisions.

## Sign-off process

Everything marked `[AGREED]` in the decision log came out of the founding discussion (Engineer 1 + product) and is **pending formal review by Engineer 2 and the CS Engineer**.

Going forward:

- **Product decisions** — Acting Manager decides, ratifies in the decision log.
- **Architecture decisions** — Engineer 1 proposes (e.g., R1–R3), Engineer 2 incorporates into spec, CS Engineer flags any implementation blockers.
- **Spec decisions** — Engineer 2 authors, Engineer 1 reviews and signs off, CS Engineer confirms buildability.
- **All three engineers sign off** on anything that touches the architecture or product spine.
