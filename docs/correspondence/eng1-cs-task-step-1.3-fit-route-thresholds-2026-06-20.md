# CS Task Spec — Step 1.3: Fit v3's Route Thresholds *(rev 2026-06-20)*
### The next [EVIDENCE] step — now UNBLOCKED (community cluster authored + scored)

> **2026-06-20 · Eng1 → CS · Scope: ONE bounded evidence task.** Supersedes the 2026-06-19 version, which fit a `W_community` floor constant. Per **ADR J2**, there is **no `W_community` term** — the additive v3 base separates the community cluster on its own. This step fits **route thresholds**, not a floor constant. Per **ADR J1**, fit **by route**, not by global ordering. Pure calculation; no shape change, no architecture change.
>
> **Gate:** cleared. The community cluster (p041–p045) exists in `seed-items.json` and has cached meaning; the v3 scoring table is confirmed (commit `112e21c`). Run when the v3 promotion lands in `rules-and-format.md` Part 3 (Eng1, this turn).
>
> **Report in the adopted format (`governance/reporting-standards.md`): show the inputs, cite the check, flag the unverified, tag measured / computed / asserted.**

---

## The question this answers
v3 is the ratified shape (`additive base × confidence × sensitivity_damper`, no `W_community`). **What threshold makes each route rank its items the way the gold says?** Thresholds are fit **per route, against that route's cluster** — not one global bar.

- **Doorway-route threshold** → fit against the **sensitive cluster** (the locked labels: p004 etc.).
- **Community-route threshold** → fit against the **community cluster** (p018/p041–p045/p030).

Per ADR J1: **within-route ranking is the contract.** No global cross-tier ordering is required or sought (p004 ranking below a utility item is *not* a failure — cross-route airtime is Layer 2's job).

---

## What to do

1. **Carry v3 forward exactly as ratified.** Additive base + multiplicative confidence/sensitivity dampers. No asymmetric dampers, no `W_community`, no shape drift. Do not reopen v1/v2.

2. **Fit the doorway threshold against the sensitive cluster.** The threshold that correctly orders the doorway route's `strong_candidate > candidate > not_voiceworthy` *within that route*. p004 ranks within the doorway route; it does not need to beat utility (ADR J1).

3. **Fit the community-route threshold against the community cluster.** From the confirmed v3 scores: the voiced band (**p018 0.580 · p041 0.560 · p042 0.532**) and the quiet band (**p043 0.180 · p044 0.129**) are separated by a ~0.35 gap. Fit the threshold so:
   - **p018 and p041 clear it** (voiced community wins);
   - **p042 (0.532) sits as the genuine "maybe"** — at or just at the line, the deliberate uncertain middle (do not force it firmly either way);
   - **p043 stays ambient, p044 stays down** (p044 also fails the lower signal/eligibility gate → drop).
   - **Fit to the *pattern* across the cluster, never to two points.** p018/p030 bracket the search; the threshold must hold for the whole cluster. A threshold that clears p018 but mis-ranks another community item is wrong — report it.

4. **p045 is NOT fit by this threshold — flag and exclude it from the threshold search.** p045's raw v3 score is **0.336** (sensitivity-damped: 0.590 × 0.95 × 0.60), which sits *below* the community voiced line by construction. **Do not lower the community threshold to capture p045's raw score** — that would over-voice the band. p045 is a `strong_candidate` whose placement is resolved by the **earned de-risk / treatment track** (gated on TL's ruling): once the separable minor-exposure is stripped and the residual verified clean, it scores ≈0.560 and clears on its own. Until then, report p045 as *"correctly flagged; placement deferred to the de-risk track, not the threshold."* Fitting the threshold to the clean band (step 3) is correct and complete without it.

5. **Eligibility stays structural.** Community-route membership is gated by `audience_scope` (public/local-civic — deterministic, never a model opinion); magnitude is sized by the meaning pass. There is **no floor weight** — the gate decides *route membership*, the threshold decides *voiced-vs-ambient within the route*. Confirm the gate holds for every community-cluster item (fail-closed).

6. **Keep absolute safety gates outside the score.** Consent, allowed-claims, forbidden-inference, grounding — pass/fail, never folded into the number. Unchanged.

7. **The probe stays a must-pass regression.** Re-run the high-magnitude/low-confidence probe under the fitted thresholds. It must remain in band (must not breach the strong-candidate ceiling, confirmed 0.836). If any fitted threshold lets the probe breach, the fit is rejected — ADR J1 global safety invariant, holds across all routes.

---

## Reporting requirements
- **Every fitted threshold shows its arithmetic** — the score each cluster item gets and which side of the threshold it lands, inline, so a row reconciles by hand.
- **Within-route ranking per cluster** — confirm `strong_candidate > candidate > not_voiceworthy` holds *within* the doorway route and *within* the community route under the fitted thresholds. No global ordering claim.
- **The over-suppression check** — confirm the 5 previously over-suppressed items now rank correctly within their routes, and the junk/promo items stay down. Cite the protecting check IDs.
- **p045 status** — explicitly reported as flagged / deferred-to-de-risk, not as a fit failure.
- **The probe result under fitted thresholds** — cite the regression assertion.
- **Tag** measured / computed / asserted. **Flag** anything unverified.

---

## Done-condition
v3 with fitted route thresholds:
- ranks the doorway route correctly (within-route),
- ranks the community route correctly (within-route: p018/p041 voiced, p042 the maybe at the line, p043/p044 down, pattern holds across the cluster),
- keeps the previously over-suppressed items correctly ranked and the junk items down,
- keeps the probe in band,
- reports p045 as correctly flagged and deferred to the de-risk track.

Deliverable: the fitted route thresholds, per-cluster ranking tables with arithmetic shown, and a clear statement of **whether the over-suppression is resolved for good** — shown, not asserted.

---

## Logged for the migration trigger
When v3 replaces the current scoring on the bench (i.e. when v3 goes live in `scoringEngine.ts`, **after** this step's thresholds are fit and reviewed), the probe regression in `scripts/formula-shape-test.ts` **must move into `scripts/smoke-test.ts`** so it runs on every bench commit. Until it's in smoke, the probe protection is written but not wired. Flag it in the passdown when v3 goes live.

**Not in scope:** wiring v3 into `scoringEngine.ts` (separate, post-fit step); any `W_community` term (rejected, ADR J2); generation; Layer 2 / session-programmer work; the de-risk recalc mechanism (separate track, gated on TL). One job: fit v3's route thresholds, show the math, confirm the over-suppression is gone.
