# Drift — Playground Architecture
> **v0.2.0** · updated 2026-06-19 · the **approved principles** that govern the playground build. What's binding is below. The specifics — exact schemas, type definitions, file structure, module names, libraries — are **CS's to propose and the team's to approve** before they harden, per `docs/correspondence/eng1-roles-and-authority-2026-06-19.md` (v0.1.1).

## Approved principles

1. **Modular pipeline of replaceable modules with stable contracts.** Drift is built as a sequence of independent modules connected by well-defined data shapes. No module should secretly do another module's job.

2. **Same interface, different adapter.** Simulated data now and real data later must normalize into the same input contract; test outputs and production outputs must use the same decision contract. Swap adapters, not the brain.

3. **Test mode and real mode share the brain.**
   - *Test mode:* seed JSON + Alex listener fixture + cached model outputs + gold labels + deterministic scoring + replayable runs + exports. **Purpose:** prove the brain.
   - *Real mode:* real source adapters + live or scheduled model calls + persistent storage + real profile/context + same scoring/safety/generation modules. **Purpose:** productize the proven brain.

4. **Two connection points exist explicitly:**
   - An **input contract** (`IngestedItem`-shape): everything entering the brain becomes the same shape regardless of source.
   - A **decision contract** (`Decision`-shape): everything leaving the brain becomes the same shape. The UI, the export system, the eval harness, and any future product surface all consume it.

5. **Non-negotiable — model calls are meaning/generation services, never the source of truth for scoring or safety.** The model can interpret category, magnitude, sensitivity, candidate context, candidate lines. **Code** decides consent, final score, final bucket, whether claims are grounded, whether output is allowed.

## Module responsibilities (high-level — exact names + file split are CS's to propose)

- **Data adapters** — load source data, normalize into the input contract. Adapters do not score, bucket, or generate.
- **Meaning** — run the model meaning pass once per item, cache the result, stamp with `prompt_version`. Does not decide the bucket.
- **Scoring** — pure deterministic functions over structural fields + cached model-derived fields. Sliders recompute without model calls. `closeness` is a lookup from the listener's closeness_map, not a model guess.
- **Safety** — deterministic, fail-closed. Two checkpoints: consent gate at ingest + post-generation claim-grounding.
- **Generation** — produce DJ lines only after an item qualifies. Does not decide whether it qualifies.
- **Evaluation** — compare decisions to gold labels; track bucket agreement, false-voices, high-sensitivity false-voices (Phase B hard fail), grounding failures, exportable runs.
- **UI** — display decisions. No scoring, safety, or prompt logic in the UI layer.

## What CS will propose for team approval

Per the roles-and-authority memo's decision-class taxonomy, the following are team-approved (Class 1) and require sign-off before hardening. CS will draft and submit:

- Language and runtime stack (Python vs. TypeScript vs. other)
- Library choices (UI framework, validation, model client, caching, export)
- Exact schemas for the input contract (`IngestedItem`) and decision contract (`Decision`), including types and required/optional fields
- File-level module layout under `playground/src/`
- Module names and the exact split between modules
- Caching strategy for meaning-pass outputs (key shape, invalidation rules, storage)
- Slider semantics and the surface that exposes them
- Export format for runs

CS-owned details (Class 2) — internal helpers, component/file organization inside approved module boundaries, code style, adapter internals, non-behavior-changing perf — do not require full-team approval as long as approved contracts and behavior are preserved.

## References

- Full original modular-architecture recommendation memo (the recommendation that produced the principles above): `docs/correspondence/eng1-modular-architecture-memo-2026-06-19.md`
- Roles & decision authority (the governing memo): `docs/correspondence/eng1-roles-and-authority-2026-06-19.md` (v0.1.1)
- Architecture review (R1–R3, schema groupings): `docs/04-architecture-review.md`
- Build sequence + verification checks: `BUILD.md`
