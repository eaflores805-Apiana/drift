# Engineer 1 — Architecture Review: Promotion Playground v1
*Reviewer: Engineer 1 (Senior Engineer). Reviewing: Engineer 2's Promotion Playground v1 plan. For: the v1 spec + CS Engineer's build.*

## Sign-off
I approve the milestone, the north star ("do the right things earn the microphone?"), the 6-step build order, and the scope discipline. The plan is buildable as written. Below are **three required changes** (architecture/risk — my lane) and a set of **schema refinements**. They don't expand scope; two of them make the bench faster and cheaper. Once the v1 spec reflects R1–R3, I'll sign off on it.

---

## R1 — Hybrid scoring: the model judges *meaning*, code computes the *score*. (Required)
**Do not let the LLM emit the final scores or the bucket.** That's a black box wearing a schema — it isn't inspectable, isn't reproducible, and can't be tuned with sliders against a stable target.

Split every factor by its nature:
- **Model-derived (LLM, judged once per item, then cached/frozen):** `category`, `magnitude`, `sensitivity`, `confidence`, `context_candidates`, and the connection read. These need world understanding.
- **Computed deterministically at scoring time (pure functions, recomputed on every slider move):** `closeness` (a lookup against the defined social graph — it's data we set, not a judgment), `timeliness` (math on `timestamp`/`expires_at`), `novelty` (dedup on `novelty_key`), `focus_boost` (configured weight), and the final `score` + `bucket`.

The scoring function is then a transparent, deterministic combiner over those fields (the formula from `drift-rules-and-format`: `magnitude × closeness`, boosted by relevance & timeliness, focus re-weights the threshold per source).

**Why this matters for the build:** the LLM judges each item **once at load** and we cache the result. Moving a slider then triggers **zero LLM calls** — it's instant local recompute. That gives us (a) a responsive playground, (b) near-zero tuning cost, (c) reproducible runs so we can compare tuning changes, and (d) a real, line-by-line explanation of why each item landed where it did. Inspectable instead of magical, for real.

## R2 — Safety is a deterministic, fail-closed layer, in two places. Never a model judgment. (Required)
Engineer 2's step 4 gate is good but sits only on the *eligibility* side. Safety needs two hard checkpoints, and the second one is currently missing:

**(a) Consent gate — at ingest, before anything else.** `audience_scope != published` → dropped. Hard rule, deterministic, **fail-closed** (unknown/ambiguous scope = treat as private). This is never an LLM call.

**(b) Post-generation claim-grounding check — currently a gap.** After the DJ line is generated, a checker must verify that **every claim in the line traces to the item's structured fields or to explicitly-allowed world-context** — the engineering implementation of D14 ("texture about the world, never invention about the soul") and the "no claim without a source row" rule. If a line asserts anything ungrounded — a motive, a private state, an unstated fact — it is rejected and regenerated or downgraded.

This cannot be left to the generator's good intentions or to human spot-checking in step 6. A fabricated private claim is *the* fatal failure mode (asymmetric error cost). It needs a programmatic guard on the **output**, not just a good prompt on the input. Implementation: extract the line's factual claims, check each against `entities` + item fields + an allowlist of world-context; fail closed.

## R3 — Gold/eval set first, not last. (Required)
Move human labeling **to the front**, not step 6. Per C4, the labeled eval set *is* the asset and *is* the target — so we establish a **gold set** (desired bucket + desired tone for a representative subset) *before/while* building scoring. The engine is then built against a target and **measured by agreement with the gold labels**, rather than tuned against nothing and judged at the end.

The bench's headline metric becomes: **"how well does the engine's bucketing match the gold labels?"** Eval stops being end-of-line QA and becomes the spec. The Product Owner owns the gold labels (the taste calls); that's the highest-leverage use of their time.

---

## Schema refinements
Engineer 2's schema is close. Changes:

**Separate the schema into three tagged groups** (this *is* R1 made concrete):
```
# Ingested (given)
id · source_type · source_name · audience_scope · timestamp · expires_at?
raw_text · entities · location · novelty_key

# Model-derived (LLM, cached once per item)
category · magnitude · sensitivity · confidence · context_candidates

# Computed at scoring time (deterministic, recomputed on slider change)
closeness · timeliness · novelty · focus_boost · score · bucket

# Decision (output, structured for inspection)
bucket(drop|ambient|voiced|expandable)
score_breakdown{per-factor contributions}
reason(human-readable: why it rose or stayed quiet)
lines{primary, safe_alternate, expanded}
safety_check{passed, grounded_claims[], rejected_reason?}
```

Specific adds/fixes:
- **`expires_at` / time_horizon** — added; timeliness needs it (the event *tonight*, the free cups *today*). `timestamp` alone isn't enough.
- **`novelty_key`** — added; required for dedup/novelty.
- **Structured `Decision` object** — added; this is where the explanation, the generated lines, and the safety-check result live, so "why did this rise?" is inspectable.
- **Define `confidence`** — confidence in the magnitude/category judgment. Low confidence biases toward vague/ambient (operationalizes "vaguer when unsure").
- **`closeness` is a lookup, not a judgment** — it reads from the defined social graph; the LLM does not guess it.

**The listener is a first-class object** (not in Engineer 2's plan, and relevance can't be computed without it):
```
Listener { location · interests[] · followed_entities[] · calendar[] · closeness_map{account_id: tier} }
```
Relevance is always computed *relative to* this profile. The Phase 0 sim therefore needs a well-defined "you," not just 40 accounts.

---

## One risk on the record
**Relevance is the weakest factor and will be the most simulated.** Computing "does this touch *your* life" honestly needs real context we don't have; in the sim it's only as good as the listener profile. We should treat relevance scores with skepticism in eval and avoid over-tuning to them. (Tracks open item #4 in the decision log.)

## Proposed division (for this milestone)
- **Engineer 2** — drafts the Playground v1 spec, encoding R1–R3 and the schema above. (Spec authorship is yours.)
- **Engineer 1** — provided the architecture (this doc); will review the spec and sign off once it reflects hybrid scoring, fail-closed two-layer safety, and eval-first.
- **CS Engineer** — builds: dataset loader, the cached model-judgment pass, the deterministic scoring/sliders (instant recompute), the safety checks, the buckets, line generation + display, and test export.
- **Product Owner** — owns the gold labels and the taste calls.

**Net:** the plan is good. With R1–R3 it becomes inspectable, reproducible, safe-by-construction, and measurable — i.e., it builds the *asset* (a measured judgment system), not just a demo.
