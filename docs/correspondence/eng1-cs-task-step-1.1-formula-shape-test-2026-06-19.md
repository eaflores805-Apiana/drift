# CS Task Spec — Step 1.1: The Formula-Shape Test
### The first [EVIDENCE] step on the critical path

> **2026-06-19 · Eng1 → CS · Scope: ONE bounded evidence task. Lifts the freeze for this job only.** Per the build map, this is the first link in the chain — the formula-shape decision — and nothing downstream (generation, persona, voice) can begin until it's done. It is pure calculation against the locked labels. No architecture change, no new labeling required.
>
> **Report in the format just adopted (`governance/reporting-standards.md`): show the inputs, cite the check, flag the unverified, tag measured/computed/asserted.**

---

## The question this answers
The current multiplicative formula has a proven structural ceiling (over-suppression — the 0.300 cap at followed-tier closeness). **Which formula *shape* correctly ranks the candidates within their routes?** This test picks the shape. It does **not** fit final constants (that's 1.3, after the community cluster is labeled) and it does **not** tune thresholds.

**Judged on:** within-route ranking accuracy against the 8 locked labels — does each formula rank the items in each route the way the gold labels say they should rank? **NOT** on threshold-clearing (whether a global cutoff voices the right set). Ranking, not clearing.

---

## What to implement — three formula variants

Score all 8 locked items under each of these three shapes. Use the existing cached meaning-pass fields (magnitude, closeness, relevance, timeliness, confidence, sensitivity) as inputs — **no new model calls; this is arithmetic on frozen fields.**

1. **Multiplicative (the current baseline)** — `S = magnitude × closeness × relevance × timeliness` (with confidence/sensitivity as currently applied). This is the control; we already know it over-suppresses, but it's the baseline the others are measured against.

2. **Hierarchy-first additive** — events start from a magnitude-driven base; relationship / relevance / timeliness *personalize* (add or subtract) but cannot zero out a high-magnitude item. Exact term structure is CS's to draft from the meaning fields; the *property* being tested is "a single low factor no longer vetoes everything."

3. **Additive-with-dampers** — variant 2, but confidence and sensitivity remain **multiplicative dampers** on the additive base (so the formula still cannot over-voice a low-confidence or high-sensitivity item even when magnitude is high). This is the hypothesis Eng1/Eng2 favor; the test is whether it earns it.

---

## Required: the low-confidence probe (before any hardening)
The 8 labels do **not** contain a high-magnitude / *low-confidence* item — that's the gap most likely to break a formula that passes the 8. **Construct one probe item** (high magnitude, low confidence, plausible closeness) and report how each variant scores it. We are specifically checking that the favored variant (3) does **not** voice it loudly. Do not harden any formula until this probe is reported.

---

## Reporting requirements (per the new standard)
- **Every score shows its arithmetic inline** — e.g. `additive-with-dampers: (0.7 base + 0.2 rel − 0.1 time) × 0.6 conf = 0.48`, so a row can be reconciled by hand.
- **Within-route ranking reported per variant** — for each route, the item order each formula produces vs. the gold order. The headline number is *how many routes each variant ranks correctly*.
- **The over-suppression check** — confirm whether variants 2 and 3 lift the 5 previously over-suppressed items into correct ranking, and whether the 3 junk/promo items stay down. Cite the specific check IDs that protect these claims.
- **Tag each section** measured / computed / asserted.
- **Flag anything unverified** rather than asserting it.

---

## Done-condition
A comparison table: 3 variants × 8 items, each cell showing the score *and* its arithmetic, with within-route ranking accuracy per variant and the probe result. The deliverable is **a recommendation of which shape to carry forward to 1.3 (constant-fitting)** — with the evidence shown, not asserted.

**Not in scope:** fitting final constants (waits on community-cluster labeling), threshold tuning, any generation work, any instrumentation. One job: pick the shape, show the math.

When this returns, the chain has moved for the first time this session.
