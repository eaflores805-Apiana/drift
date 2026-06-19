# Drift — Promotion Playground: Build & Verification
> **v0.1.0** · updated 2026-06-19 · for the CS Engineer (build) and the team (check). The design is in `docs/05-promotion-playground-spec.md`; this is the **order** and the **checks**. Build in sequence — don't start a step until the previous step's "done-when" passes.

## How we use this
- CS builds a step, then demos its **done-when** check.
- Engineer 1 verifies the technical checks; the PO spot-checks how it *feels*.
- The seed data has planted cases on purpose — we use them as acceptance tests, so "it works" has a concrete meaning instead of a vibe.

---

## Step 1 — Shell + consent gate
**Build:** load `listener.json` + `seed-items.json`; run the consent gate; render items in four columns (drop / ambient / voiced / expandable) using a **stub scorer** (fixed or random numbers — real scoring comes later).
**Consent gate (eligible-audience semantics, per team ruling 2026-06-19):** pass items that are published to the listener's eligible audience (`public`, `published`, or fixture-valid `friends`). Drop private, unknown, blank, missing, or unsupported scope. Audience scope must remain attached to the item for later safety/tone decisions. The gate is *only* "is this eligible to enter the system?" — whether/how to voice, sensitivity, and detail-level happen downstream. See `docs/correspondence/team-consent-gate-ruling-2026-06-19.md`.
**Done-when:**
- All 40 items and `listener_001` load.
- **`p002` (the private DM) never appears in any column** — it's dropped at the gate. *(hard check)*
- A `friends`-scoped item such as `p004` or `p036` **passes** the consent gate and reaches scoring.
- Blank out one item's `audience_scope` as a test → it drops too (fail-closed on unknown).
- The gate makes **no model call**.
**Who checks:** Engineer 1 confirms p002 is gone, a friends item survives, and the gate is deterministic.

## Step 2 — Deterministic scorer + sliders
**Build:** the scoring function over structural fields (closeness from `listener.closeness_map`, timeliness from `timestamp`/`expires_at`, novelty from `novelty_key`, focus weights) plus *hand-stubbed* ModelDerived fields for now. Wire sliders for the weights and thresholds.
**Done-when:**
- Moving any slider recomputes the buckets **instantly, with zero model calls**. *(hard check — watch the log/network)*
- `closeness` is a **lookup** from the closeness_map, not a guessed number.
- Each item shows a **score breakdown** (what each factor contributed).
**Who checks:** Engineer 1 verifies no model calls on slider move and that the breakdown math is inspectable.

## Step 3 — Cached meaning pass
**Build:** the LLM meaning pass (needs the **meaning-pass prompt** — see dependency below) that fills ModelDerived per item: category, magnitude, sensitivity, confidence, context_candidates, connection_read, **plus a one-line rationale per judged field**. Cache and freeze the result, stamped with model + `prompt_version`.
**Done-when:**
- Each surviving item gets its meaning fields **once**, then served from cache.
- Re-running without changing the item or prompt does **not** re-call the model.
- Bumping `prompt_version` invalidates the cache.
**Who checks:** Engineer 1 + Engineer 2 sanity-read a sample of meaning outputs; confirm caching behaves.

## Step 4 — Real scoring
**Build:** swap the stubbed ModelDerived for the real cached values; set sensible default weights/thresholds.
**Done-when:**
- Buckets are now driven by real meaning + structural fields.
- Sliders are **still instant** (still zero model calls — meaning is cached).
- First real **bucket-agreement number** against `gold-labels.json` is produced.
**Who checks:** the team reads the first agreement number together — this is the first real signal.

## Step 5 — Line generation + claim-grounding
**Build:** generate primary / safe_alternate / expanded lines + `intended_claims` for voiced/expandable items. Then the **post-generation claim-grounding check**: every claim must trace to item fields or `context_candidates`; on failure → regenerate safer → if it fails again → downgrade to ambient/drop.
**Done-when:**
- Voiced items produce three lines + intended_claims.
- **Plant a test: force a line that asserts a motive or private cause → the check must reject or downgrade it.** *(hard check)*
- No ungrounded claim ever reaches output.
**Who checks:** Engineer 1 verifies the grounding check catches a deliberate fabrication; the PO reads the lines for voice (against `examples/dj-lines.md`).

## Step 6 — Gold comparison + export
**Build:** compare each decision to its gold label; show bucket-agreement %, the mismatch list, and **any high-sensitivity false-voice flagged in red**; export the full run (decisions + score breakdowns + safety results + gold comparison + the slider settings used).
**Done-when:**
- Run summary shows agreement %, the mismatches, and red flags for high-sensitivity false-voices.
- The run is **reproducible** from the export + the frozen meaning cache.
**Who checks:** the whole team reviews the run summary against the Phase B done-gate below.

---

## Phase B is DONE when (the gate — from `docs/00-roadmap.md`)
- Gold-labeled subset complete.
- Bucket agreement clears the target threshold.
- **Zero** high-sensitivity false-voices. *(hard fail if any)*
- Sliders recompute instantly with no model calls.
- Every voiced line has grounded claims.
- Every decision has an inspectable reason.
- PO agrees the top voiced examples feel natural — not like a hit list.

## The four checks we never skip
1. **`p002` never airs** — the consent gate works. (Step 1)
2. **Sliders never call the model** — scoring is deterministic and cheap. (Step 2/4)
3. **A planted fabrication gets rejected** — claim-grounding works. (Step 5)
4. **Zero high-sensitivity false-voices** in the final run. (Step 6)

## Dependency
Steps 3 onward need the **meaning-pass prompt** (the model layer that produces the ModelDerived fields). Steps 1–2 (shell, consent gate, deterministic scorer, sliders) do **not** — CS can start those now. The meaning-pass prompt is the next deliverable from Engineer 1.
