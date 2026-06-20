# CS Task Spec — Step 1.3: Fit v3's Constants by Route
### The next [EVIDENCE] step — pre-positioned, gated on PO community-cluster labels

> **2026-06-19 · Eng1 → CS · Scope: ONE bounded evidence task. HOLD until the PO community-cluster labels land, then run.** Per ADR J1 (route-aware ranking), the formula shape is settled (v3 additive-with-dampers). This step fits its constants — **by route, not by global ordering.** Pure calculation against labeled clusters. No shape change, no architecture change.
>
> **Gate to start:** the community-cluster labels exist. *(Doorway threshold can be fit against the 8 immediately; the floor constant needs the community cluster — so the whole job waits on those labels to run as one pass.)*
>
> **Report in the adopted format (`governance/reporting-standards.md`): show the inputs, cite the check, flag the unverified, tag measured/computed/asserted.**

---

## The question this answers
v3 is the chosen shape. **What constants make it rank each route's items the way the gold labels say?** Two constants, fit to two clusters:
- **Doorway-route threshold** → fit against the **sensitive cluster** (covered by the 8 locked labels).
- **Community-route floor constant** (the additive `W_community` weight) → fit against the **new community cluster**.

Per ADR J1: **fit by route. No global cross-tier ordering is required or sought.** The contract is within-route ranking; cross-route airtime is Layer 2's job.

---

## What to do

1. **Carry v3 forward exactly as tested.** Additive base + multiplicative confidence/sensitivity dampers. **No asymmetric dampers** (ADR J1). Do not reopen v1/v2.

2. **Fit the doorway threshold against the sensitive cluster.** The threshold that correctly separates the doorway route's `strong_candidate > candidate > not_voiceworthy` ordering within that route. p004 ranks *within the doorway route* — it does **not** need to beat utility items (ADR J1; p004 is not a failure under this contract).

3. **Fit the community floor constant against the community cluster.** The `W_community` weight that lands **p018 above the voiced line** (must clear) and **p030 below it** (must stay ambient — followed-brand keeps ambient eligibility, not a voiced moment). These two bracket the constant.
   - **Fit the constant to the *pattern* across the community cluster, never to p018/p030 as two single points.** p018 and p030 are the *brackets that bound* the search; the constant must hold for the whole cluster, not just thread the needle between two items. If a constant clears p018 and holds p030 but mis-ranks other community items, it's wrong — report that.

4. **Eligibility stays structural.** The community floor only fires on items whose `audience_scope` marks them public/local-civic (deterministic, never a model opinion); magnitude sized by the meaning pass; floor fires only when both agree (fail-closed). Confirm this gate holds for every community-cluster item.

5. **Keep absolute safety gates outside the score.** Consent, allowed-claims, forbidden-inference, grounding — pass/fail, never folded into the number. Unchanged.

6. **The probe stays a must-pass regression.** Re-run the high-magnitude/low-confidence probe under the fitted constants. It must remain in band (must not out-voice safe well-grounded candidates). If any fitted constant lets the probe breach the strong-candidate max, the fit is rejected — this is the ADR J1 global safety invariant, and it holds across all routes.

---

## Reporting requirements
- **Every fitted constant shows its arithmetic** — the score each cluster item gets under the candidate constant, inline, so a row reconciles by hand.
- **Within-route ranking per cluster** — confirm `strong_candidate > candidate > not_voiceworthy` holds *within* the doorway route and *within* the community route under the fitted constants. No global ordering claim.
- **The over-suppression check** — confirm the 5 previously over-suppressed items now rank correctly within their routes, and the 3 junk/promo items stay down. Cite the protecting check IDs.
- **The probe result under fitted constants** — cite the regression assertion.
- **Tag** measured / computed / asserted. **Flag** anything unverified.

---

## Done-condition
v3 with fitted route constants:
- ranks the doorway route correctly (within-route),
- ranks the community route correctly (within-route, p018 clears / p030 ambient, pattern holds across the cluster),
- keeps the 5 over-suppressed items correctly ranked and the 3 junk items down,
- keeps the probe in band.

Deliverable: the fitted constants, the per-cluster ranking tables with arithmetic shown, and a clear statement of **whether the over-suppression is resolved for good** — shown, not asserted.

---

## Logged for the migration trigger (from the last passdown)
When v3 replaces the current scoring (i.e. **after this step**, when v3 goes live on the bench), the probe regression assertion currently living in `scripts/formula-shape-test.ts` **must move into `scripts/smoke-test.ts`** so it runs on every bench commit. Until it's in smoke, the probe protection is written but not wired. This step is the trigger — flag it in the passdown when v3 goes live.

**Not in scope:** threshold tuning beyond the route fits, any generation work, any Layer 2 / session-programmer work, any instrumentation beyond the probe regression. One job: fit v3's constants by route, show the math, confirm the over-suppression is gone.
