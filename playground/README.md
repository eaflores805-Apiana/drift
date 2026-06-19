# Drift — Promotion Playground
> **v0.1.0** · updated 2026-06-19 · technical entry point for the bench. The full buildable spec is `docs/05-promotion-playground-spec.md` — this is the orientation, not the spec.

## What this tests
The one gating question: **do the right things earn the microphone, said in a way that creates connection without inventing anything?** Given a messy pile of items and a listener, the bench decides drop / ambient / voiced / expandable, generates the DJ line for voiced items, and measures those decisions against human gold labels.

## The data (`data/`)
- `listener.json` — the listener fixture (currently `listener_001`, Alex Rivera). First test fixture only, not a market definition. Relevance is computed relative to this.
- `seed-items.json` — the world: 14 accounts (sources) + 40 raw items (Ingested fields only). The meaning pass and scorer fill the rest.
- `gold-labels.json` — the eval target. PO + reviewers label desired bucket + tone + allowed claims per item. 5 calibration seeds are in place; the rest get labeled by hand.

## Pipeline at a glance
```
data → [1] consent gate → [2] cached meaning pass → [3] deterministic scoring
     → [4] bucket → [5] DJ line (voiced only) → [6] claim-grounding → [7] decision + gold compare
```
The two non-negotiables (see spec for detail): **[1] and [6] are deterministic and fail-closed** (safety never depends on the model behaving), and **[3] recomputes instantly on slider moves with zero model calls** (the meaning pass is cached/frozen).

## What CS builds first (shell-first; gold-labeling runs in parallel)
1. **Shell** — load `listener.json` + `seed-items.json` → run the consent gate → show items in buckets, with a *stub* scorer. Proves the pipeline end-to-end. ← can start now
2. **Sliders** wired to the deterministic scorer (hand-stub the ModelDerived fields at first).
3. **Meaning pass** (once the meaning-pass prompt exists) → fills + caches ModelDerived.
4. **Real scoring** over ModelDerived + structural fields.
5. **Line generation + claim-grounding check.**
6. **Gold comparison + export.**

## How success is measured
The Phase B exit criteria in `docs/00-roadmap.md`: bucket agreement with gold clears threshold · **zero high-sensitivity false-voices** (hard fail) · sliders instant · every voiced line grounded · every decision has an inspectable reason · PO agrees the top voiced examples feel natural, not like a hit list.

## Out of scope (deferred, not rejected)
Full app UI · final name · real social integrations · public launch · shared rooms · message-the-DJ · real ad marketplace · local hosting · fine-tuning/LoRA · final TTS voice. The UI here should be ugly — if it looks too nice too early, we'll admire the wallpaper while the house is on fire.

## Voice reference
Worked DJ lines (and what stays silent) are in `examples/dj-lines.md`.
