# Decision-log entry — ADR J2 *(splice into `docs/07-decision-log.md`, section J, after J1)*

---

### J2 — No `W_community` term; the additive v3 base + route threshold handle community items `[ACCEPTED 2026-06-20]`

**Status:** Accepted as a binding amendment to the Layer 1 scoring contract. **Decision class:** `ESCALATE-IF-CHANGED`. **Scope:** Layer 1 (Phase B). **Proposed by:** Eng1. **Ratified by:** PO. **Concurrence:** TL (declining to add a term is not a formula shape change; PO ratify with TL nod).

**Ruling.** There is **no separate `W_community` floor constant** in the scoring formula.

**Reason.**
- The community cluster separates under **threshold-only v3**. Confirmed v3 scores (commit `112e21c`): voiced band p018 0.580 / p041 0.560 / p042 0.532; quiet band p043 0.180 / p044 0.129 — a ~0.35 gap, fittable by a single route threshold.
- `W_community` existed only to counter the **multiplicative closeness veto** (under the old `magnitude × closeness`, a low-closeness source crushed a high-magnitude community item).
- **v3's additive base already removes that veto** — closeness is a bounded ±0.2 nudge, not a multiplier. So the rescue term is solving a problem that no longer exists.
- A separate community term would be **unnecessary formula complexity** — a constant nobody can later explain (formula debt). Rejected.

**Formula shape (stands).** v3 additive-with-dampers:
```
value = ( magnitude + 0.2·(closeness−0.5) + 0.2·(relevance−0.5) + 0.2·(timeliness−0.5) )
        × confidence
        × sensitivity_damper          // low 1.0 / medium 0.8 / high 0.6
```
No `W_community`. No asymmetric dampers. (Now canonical in `rules-and-format.md` Part 3.)

**Step 1.3 implication.** Fit **route threshold(s)**, not a community floor constant. Community-route membership is set by the structural eligibility gate (`audience_scope` public/local-civic, deterministic); the route threshold decides voiced-vs-ambient within the route.

**p045 separation (does NOT reopen this).** p045's raw v3 score (0.336) is sensitivity-damped below the community voiced line. This is **not** a `W_community` problem — a uniform community lift would not close the p045↔p042 gap or restore the maybe-band. p045 is handled on a **separate track**: the earned de-risk recalculation (strip separable minor-exposure, verify the residual clean by a deterministic check, score the safe residual ≈0.560), gated on a TL ruling. `W_community` stays closed regardless of how that ruling lands.

**Non-impact.** Does not change ADR J1 (route-aware ranking), the absolute safety gates, or the probe regression (the high-magnitude/low-confidence safety invariant), all of which stand unchanged.

---

*Companion artifacts: the ratified formula in `docs/03-rules-and-format.md` Part 3 (v0.2.0); the evidence in `docs/correspondence/cs-community-cluster-scoring-table-2026-06-20.md`; the de-risk track (separate, open) in `docs/correspondence/eng1-tl-proposal-derisk-recalc-2026-06-20.md`.*
