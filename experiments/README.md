# Experiments
*Phase 0 / 1 / 2 work products per the execution plan in `docs/00-vision/drift-record-and-plan.md` Part II.*

- `phase-0-corpus/` — 40 simulated accounts (~3 posts/day each, varied complexity) + a defined fictional listener (location, interests, calendar, followed orgs/creators, closeness map). The messy raw material the bench tests against.
- `phase-1-bench/` — the measured promotion bench. THE experiment: items flow in, scored live against the rules per Eng1 R1 (hybrid scoring) + R2 (two-layer safety), with the dials exposed and scores compared against the gold labels per Eng1 R3.
- `phase-2-tuning/` — voice tuning runs and validated DJ outputs (the accumulated good corpus that may later become the LoRA training set, if we ever distill).

Phase 3 (UI wrap) and Phase 4+ (production) are not represented here — they live in a future `src/`.
