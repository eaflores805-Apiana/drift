# Decision Log — Section L (foundational architecture) — DRAFT for `07-decision-log.md`

> **2026-06-21 · Eng1 → CS to file as section L of `docs/07-decision-log.md`.** Banks the three foundational architecture decisions (R1/R2/R3) from `docs/04-architecture-review.md` — now promoted to canonical — as first-class ADRs, in the J/K house format. These **pre-date J and K chronologically** but are recorded now as the architecture foundations *underneath* them (the §1a action from the reorg). **R1 and R3 are already realized in the engine; R2b — the claim-grounding gate — is UNBUILT and is the next [EVIDENCE] step on the critical path.** Recording it as an ADR puts the next build's spec in the decision record.

---

## L — Foundational architecture decisions (the bench architecture review)

*Source: `docs/04-architecture-review.md` (Eng1's review of the original Promotion-Playground plan), promoted to canonical in the 2026-06-21 reorg. These three "required changes" have governed the build since; they are formalized here so the foundations are in the ADR record, not only in a review doc. Scope: Phase 1 (judgment) + Phase 2 (generation). They do not change Phase D production ADRs (I) or the absolute safety gates, which stand.*

---

### L1 — Hybrid scoring: the model judges *meaning*, code computes the *score* `[ACCEPTED — foundational; realized]`

**Status:** Accepted as the scoring architecture; **realized** in the live engine. **Decision class:** `ESCALATE-IF-CHANGED`. **Scope:** Layer 1. **Proposed by:** Eng1 (architecture review, R1). **Ratified by:** PO. **Realized:** `scoringEngine.ts` + the meaning cache (Phase 1).

**Ruling.** The LLM **never emits the final score or the bucket.** Every factor is split by its nature:
- **Model-derived (judged once per item, then cached/frozen):** `category`, `magnitude`, `sensitivity`, `confidence`, `context_candidates`, the connection read — the things that need world understanding.
- **Computed deterministically at scoring time (pure functions, recomputed on every slider move):** `closeness` (lookup against the defined social graph — data we set, not a judgment), `timeliness` (math on `posted_at`/`expires_at`), `novelty` (dedup on `novelty_key`), `focus_boost`, and the final `score` + `bucket`.

The scoring function is a transparent deterministic combiner over those fields (the v3 formula, ADR J1/J2).

**Reason.** A model emitting the score is "a black box wearing a schema" — not inspectable, not reproducible, not tunable against a stable target. The split gives: the LLM judges **once at load** and the result caches → moving a slider triggers **zero model calls** (instant local recompute) → (a) a responsive bench, (b) near-zero tuning cost, (c) reproducible runs that can be compared across tuning changes, (d) a line-by-line explanation of why each item landed where it did. *Inspectable instead of magical.* (Verified: the cache-behavior proof — 3 hits / 0 model calls on re-score — confirms the architecture in running code.)

**Why it's load-bearing.** Every later scoring decision (J1 route-local ranking, J2 no-`W_community`, J3 utility-deferred) presupposes L1 — they are all tunable *because* the score is deterministic code over cached meaning. L1 is the floor those stand on.

**Non-impact.** Does not change the v3 formula shape, the route thresholds, or the safety gates.

**Companion artifacts.** `docs/04-architecture-review.md` R1 (source); `docs/03-rules-and-format.md` Part 6 (the three-group schema is R1 made concrete); the cache-proof passdown (`docs/passdowns/passdown-2026-06-19-j.md`).

---

### L2 — Safety is a deterministic, fail-closed layer in two places — never a model judgment `[ACCEPTED — foundational; (a) realized, (b) UNBUILT — next build]`

**Status:** Accepted as the safety architecture. **(a) consent gate: realized.** **(b) claim-grounding gate: UNBUILT — the next [EVIDENCE] step.** **Decision class:** `ESCALATE-IF-CHANGED` (safety-critical). **Scope:** Layer 1 (ingest) + Phase 2 (generation). **Proposed by:** Eng1 (architecture review, R2). **Ratified by:** PO.

**Ruling.** Safety has **two hard, deterministic, fail-closed checkpoints**, neither of which is ever a model judgment:

**(a) Consent gate — at ingest, before anything else *(realized).*** `audience_scope != published` → **dropped.** Deterministic, fail-closed (unknown/ambiguous scope = treated as private). Private content never reaches the scoring or voicing engine at all. *(Built; enforced as Part 2 eligibility in `03-rules-and-format.md`.)*

**(b) Claim-grounding gate — on the aired line, after generation *(UNBUILT).*** After the DJ line is generated, a checker **verifies every claim in the line traces to the item's structured fields or to explicitly-allowed world-context.** If a line asserts anything ungrounded — a motive, a private state, an unstated fact — it is **rejected and regenerated safer, or downgraded.** This is the engineering implementation of *"texture about the world, never invention about the soul"* and the *"no claim without a source row"* rule. **Implementation:** extract the line's factual claims → check each against `entities` + item fields + an allowlist of world-context → fail closed.

**Reason.** A fabricated private claim about a real person, narrated authoritatively into someone's ear, is **the fatal failure mode** — unrecoverable (the product cannot un-say it) and asymmetric (categorically worse than a bad item in a silent feed the eye skips). This **cannot** be left to the generator's good intentions or to human spot-checking. It needs a **programmatic guard on the output**, not just a good prompt on the input. *The buffer between "the model wrote it" and "the listener heard it" is the safety margin* (cf. ADR I1, the safety queue).

**Why (b) is the next build — and why it's UNBUILT-but-specified.** The persona generation tests proved the input-side prompt is necessary but insufficient: the gravitational-center prompt (ADR K1) produces a consistent host **and** produces claims-beyond-source ~10% of the time *by design* (the clean-room slips: "good people," "let's keep that feeling going"; the pass-two slips: a wrong date, a hallucinated song). K2's grave denylist is only a *guarantee* when mechanically enforced on the aired line, not left to the prompt. **Both K1 and K2 named this gate as their pending dependency.** L2(b) is the gate that catches that residue — it is the first piece of *generation-side safety machinery* the project builds, and it is now specified (extract claims → check against source → fail closed) and ready to build as **Phase 2.2**.

**Accumulated gate test cases (from the persona tests — real generated failures, not invented):** claims-beyond-source ("good things happening to good people"); listener-feeling claims ("let's keep that feeling going"); **relational inversion** ("Elena's in your corner, you're in hers" — a relationship the source never stated); grounding slips (a "this morning" for a "yesterday" source; a hallucinated next-song); grave-denylist vocabulary ("brave," "fight" as the host's word). These are the gate's first regression set.

**Non-impact.** Does not change ADR I1 (the safety queue — L2(b) is its claim-grounding component), the consent gate (already built), or the absolute safety gates.

**Companion artifacts.** `docs/04-architecture-review.md` R2 (source); ADR I1 (safety queue); ADRs K1/K2 (which name this gate as pending); the persona test results (`docs/correspondence/cs-persona-center-test-results-2026-06-21.md`, `cs-persona-stress-test-pass-one/two-results-2026-06-21.md`) — source of the test cases.

---

### L3 — Gold/eval set first, not last `[ACCEPTED — foundational; realized]`

**Status:** Accepted as the evaluation methodology; **realized** (gold labels exist and drive the bench). **Decision class:** Class 1 (methodology). **Scope:** Phase 1 + the corpus track. **Proposed by:** Eng1 (architecture review, R3). **Ratified by:** PO.

**Ruling.** Human labeling moves to the **front**, not the end. A **gold set** (desired bucket + desired tone for a representative subset) is established *before/while* building scoring. The engine is built against that target and **measured by agreement with the gold labels** — not tuned against nothing and judged at the end. The bench's headline metric: **"how well does the engine's bucketing match the gold labels?"** Eval stops being end-of-line QA and becomes the **spec**. The **PO owns the gold labels** (the taste calls).

**Reason.** Per the value thesis, the **labeled eval set *is* the asset and *is* the target** — a measurable judgment system + a labeled set is the defensible thing, not the prompts. Building against a target makes divergence *diagnostic* (a scored item missing its gold label drives an architectural question — the routing-before-thresholds discipline), rather than leaving "is the judgment good?" to vibes at the end.

**Why it's load-bearing.** The entire Phase-1 method — formula-shape test against the 8 locked labels, route-threshold fitting against clusters, the over-suppression diagnosis — exists *because* gold labels came first. L3 is why Phase 1 could be **measured** rather than asserted.

**Non-impact.** Does not change the formula, the routes, or the safety gates.

**Companion artifacts.** `docs/04-architecture-review.md` R3 (source); `docs/06-gold-labeling-guide.md` (the methodology); the locked gold labels (`playground/data/gold-labels.json`).

---

## What this section banks — and what it points at

L records the **architecture foundations** the rest of the engine stands on: scoring is deterministic code over cached meaning (L1), safety is two fail-closed checkpoints (L2), and the engine is measured against gold labels (L3). **L1 and L3 are realized. The one unbuilt piece — L2(b), the claim-grounding gate — is now specified in the ADR record and is the next [EVIDENCE] step**: the output-side guard that K1 and K2 both depend on, with its first regression set already collected from the persona tests. The hygiene arc closes here; the build resumes at the gate.
