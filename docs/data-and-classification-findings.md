# Drift — Data & Classification Findings
### What the data-problem session established about how Drift classifies, what a real feed is made of, and the limits of synthetic data

> **STATUS: SUPPORTING · v1.0.0** · 2026-06-25 · Banks the four structural findings surfaced in the 2026-06-25 data session into a canonical doc so they stop living only in chat and the index. These are about the **input layer and the classification metric** — the honest center of gravity right now (the engine runs on simulated data; whether it works on *real* data is unproven). The load-bearing finding (1) is formalized as **ADR M1** in `07-decision-log.md` (proposed for ratification).

---

## 1. Classification is listener-relative, not item-intrinsic

An item's value is **not a property of the item.** The same post is gold for one listener and noise for another. The operational form:

> **value ≈ (this listener's affinity for the subject) × (the item's genuine significance)**

Source-type and content are **weak proxies** for value; *affinity* is the real metric. A high-affinity brand/creator drop is **gold**; a low-affinity friend post is **noise**. This is why the affinity/listener model (currently a crude follow+interest lookup in `closeness.ts`) is the foundational under-built component — the rich revealed-preference model is what turns "what is this post" into "is this worth this listener's scarce airtime."

This formalizes, and sharpens, the existing product principle *"the metric is connection, not importance"* (`00-product-description.md` §5) into a computable contract. **Banked as ADR M1 (proposed).**

## 2. Real feeds are mostly noise + texture + a little signal

The synthetic corpus had the wrong **composition** — it was signal-dense, where a real feed is overwhelmingly not. The honest three-way sort, all **listener-relative**:

- **Signal** — the point. The few items worth surfacing.
- **Texture** — memes, levity, warmth. **Rate-limited; never floods.** Present so the world feels alive, not so it gets aired.
- **Noise** — discard.

A corpus that is mostly signal teaches the engine the wrong prior (everything is worth voicing). Realistic gem-to-noise ratio is a corpus-validity requirement, not a flavor (see `world-generation-spec.md` §3).

## 3. Graph-size dependency

Drift is rich for **large/active** graphs and thin for small ones. Thin graphs are backfilled — **local → recurring-warmth → followed-creators → (deferred) news** — *at a fixed quality bar.* The rule: **widen the net, never lower the bar.** A thin-graph listener gets fewer moments, not worse ones; the engine reaches further out for material rather than voicing weaker items.

## 4. Synthetic data can develop the engine but cannot validate it

Everything proven so far is on **model-generated input** judged by a model — a circularity that development tolerates and validation cannot. Breaking it requires **real human input**, which is acquisition-gated.

What survives the asterisk and what doesn't:

- **Structural conclusions hold regardless of input realism** — the gate fires, the canary mechanism works, fallback re-gates, the consent gate fails closed.
- **Rate/quality conclusions are provisional** — the canary rate, the 32% lexically-uncertifiable flag rate, and voice quality **carry an asterisk until re-measured on real data.**

This is the gap that gates trust and acquisition, and the reason the index marks the whole engine `VALIDATED: Synthetic`.

---

## Where these plug in

- **ADR M1** (`07-decision-log.md`) formalizes finding 1 as the classification contract (proposed for TL/PO ratification).
- **`world-generation-spec.md`** operationalizes findings 2–3 (the mix rule, the trap taxonomy) and raises the §1 closeness reconciliation that finding 1 depends on.
- **`00-canonical-index.md`** §"What's tested, and on what data" is the standing statement of finding 4.

— CS Engineer, 2026-06-25
