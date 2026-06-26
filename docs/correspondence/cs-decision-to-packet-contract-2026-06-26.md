# Decision → Packet contract (the generation pipe)

**Date:** 2026-06-26
**Author:** CS Engineer
**Decision class:** Class 1 (defines what a selected item hands to generation) — **ratification requested**
**Status:** Contract proposed. No adapter code written yet (by design — see §7).
**Scope guard:** Candidate-agnostic. Does **not** consume the six World-Ventura J4 picks, does **not** generate any line, does **not** create J4-dependent demo evidence. Honors the PO freeze.

---

## 1. Why this, why now

PO mechanism item #1: *"Define exactly what a selected item must hand to generation… This does not require generating from the six candidates. It just defines the pipe."*

The pipe has two ends that already exist independently and have **never been connected**:

- **LEFT — `Decision`** (`playground/src/data/schemas.ts`): what the scorer emits per item (now carrying `band` + `route` after ADR J4).
- **RIGHT — `Packet`** (`playground/src/safety/packet.ts`): what Production C v0.3.2 writes from, and what `preflight()` / the Box 8 gates consume.

There is **no adapter** between them. `scripts/scoring-packet.ts` is a markdown readout, not a builder. The 50 `GOLD_PACKETS` (`scripts/gold-packets.ts`) are hand-authored. `world-brain-run.ts` says so in its own header: *"The next stage (Decision → packet → Production C → Box 8 → voiced lines) builds on the decisions this writes."* That stage is the gap.

This doc defines that adapter as a ratifiable contract instead of silently inventing the half-dozen mappings it needs.

## 2. As-found inventory (so we build to existing design, not a parallel one)

| Piece | State | Location |
|---|---|---|
| Packet shape | **BUILT, mature** (Doctrine v1.1.0, TL-confirmed 2026-06-23) | `safety/packet.ts` |
| `preflight()` (7 deterministic packet-defect checks) | **BUILT** | `safety/packet.ts:125` |
| `renderPacketForModel()` (omits `audit_raw_post`) | **BUILT** | `safety/packet.ts:209` |
| `groundingSourceFor` / `routeSourceFor` (permitted-inputs-only mappers) | **BUILT** | `safety/packet.ts:181,197` |
| Gold packet fixtures (50, every category/route/block) | **BUILT** (frozen, review-unconfirmed) | `scripts/gold-packets.ts` |
| Box 8a grounding gate + harness | **BUILT** | `safety/groundingGate.ts`, `scripts/grounding-harness.ts` |
| Box 8b route/policy gate | **BUILT** | `safety/routeGate.ts` |
| Production C v0.3.2 prompt (ratified, #0576f0811b4d) | **BUILT** | `docs/drift-production-prompt-v0.3.2.md` |
| **Decision → Packet adapter** | **MISSING — this contract** | — |

Conclusion: #1 and #2 (preflight) are **not** "build from scratch." The shape + preflight + fixtures + gates exist. The single missing link is the adapter, and the contract that governs it.

## 3. The two ends, and what already exists on each

**LEFT — what the `Decision` already hands over** (no schema change needed for these):

| PO #1 field | Source on `Decision` today | Status |
|---|---|---|
| `decision_id` | `item_id` | ✅ present |
| `route` | `route` (silent/highlight/doorway/utility) | ✅ present |
| `band` | `band` (J4) | ✅ present |
| `score` | `score` | ✅ present |
| `threshold_used` | `score_breakdown.route_threshold` | ✅ present (when a bar exists) |
| `allowed_claims` | `allowed_claims` (from meaning pass) | ✅ present |
| `forbidden_inferences` | `forbidden_inferences` (from meaning pass) | ✅ present |
| `sensitivity` | `meaning.sensitivity` (string) | ⚠ on the meaning, not the Decision — see §6 note A |
| `closeness` | `score_breakdown.closeness` (number) | ✅ present |
| `treatment_depth` | — (not formally spec'd) | 🟡 PROPOSE — = packet `block` + `block_contract`, §5 |
| `source_visibility` | — | 🔴 HOLD (identity_policy) |
| `identity_policy` | — | 🔴 HOLD (unratified Class-1) |
| `voice_payload` | — | 🔴 HOLD (unratified Class-1) |

The load-bearing safety content — `allowed_claims` and `forbidden_inferences` — is **already produced by the meaning pass and already on the Decision.** That is the part that must be right; it is present.

## 4. Field-by-field mapping (Decision/item/meaning/listener → Packet)

The adapter's inputs are exactly what `scoring-packet.ts` already loads: `Decision[]` + `IngestedItem[]` + `MeaningMap` + `Listener`. Status legend: ✅ DERIVABLE-NOW (safe default) · 🟡 PROPOSE-CLASS-1 · 🔴 UNRATIFIED-HOLD.

| Packet field | Derivation | Status |
|---|---|---|
| `item_id` | `decision.item_id` | ✅ |
| `audit_raw_post` | `item.raw_text` (audit only; never rendered) | ✅ |
| `allowed_claims` | `decision.allowed_claims` | ✅ |
| `forbidden_inferences` | `decision.forbidden_inferences` | ✅ |
| `sensitivity` | `meaning.sensitivity` → packet `Sensitivity` (low/med/high pass through; `extreme` needs a rule — default: map nothing to extreme yet) | ✅ (extreme deferred) |
| `relationship` | closeness tier of `item.account_id` in `listener.closeness_map` (close/known/acquaintance/…) | ✅ |
| `source_kind` | `item.source_type` (friend/family/local_org/news/brand/…) | ✅ |
| `voiced` | `decision.bucket ∈ {voiced, expandable}` | ✅ |
| `music_context` | `{}` (scheduling stage supplies later) | ✅ default |
| `recently_aired` | `"none"` (airtime-history stage supplies later) | ✅ default |
| `boundaries` | `QUIET_REQUEST.test(raw)` ? extracted quiet/no-contact phrase : `"none"` (reuse `routeGate.QUIET_REQUEST` — same detector preflight rule #5 uses) | ✅ |
| `permitted_source_spans` | **`[]`** (fail-closed: model may not echo specific phrasing). Richer auto-extraction = §5. | ✅ safe default |
| `plainly_stated_serious_fact` | **`"none"`** for all J4 (non-grave) bands. Grave extraction = §5. | ✅ safe default |
| `source_name` | **`"none"`** (matches all 50 gold packets — tie carried by `relationship`). Name disclosure = §6 HOLD. | ✅ safe default |
| `category` | **band → category map** (§5.1) | 🟡 PROPOSE |
| `route` (packet) | **band/route → packet route** (§5.2; splits `doorway`→`doorway_sensitive`/`doorway_grave`) | 🟡 PROPOSE |
| `block` | from category (§5.3, gold-packet-derived) | 🟡 PROPOSE |
| `block_contract` | from category (§5.3, gold-packet-derived) = **treatment_depth** | 🟡 PROPOSE |
| `register_hint` | from band + sensitivity (gold-packet pattern, e.g. ambiguous → "weary; do NOT read as celebration or grief") | 🟡 PROPOSE |
| `target_length` | from block (standard→short, synthesis_anchor→anchor) | 🟡 PROPOSE |
| `provenance` | **source_type → provenance map** (§5.4) — drives preflight rule #4 | 🟡 PROPOSE |
| `identity_policy` / `voice_payload` | — | 🔴 HOLD |

**Every field has a fail-closed default**, so a buildable adapter is more restrictive than the hand-authored gold (no echoed spans, name withheld, no serious-fact assertion) — it can only under-share, never over-share. The 🟡 items are the mappings that need a yes/no, not new safety surface.

## 5. Class-1 mappings proposed for ratification (stamped World-Ventura-provisional, re-derive on a human corpus)

### 5.1 band → packet `category`
| J4 band | proposed `category` | rationale |
|---|---|---|
| `positive_personal_touch` | `celebration` | personal win |
| `community_highlight` | `celebration` | civic/brand pride (shares celebration tier) |
| `doorway_sensitive` | `sensitive` | gentle relationship-check |
| `mild_stress` | `everyday` | ambient; not voiced today |
| `everyday_texture` | `everyday` | ambient |
| `utility` | `utility` | time-bound |
| `silent` | (n/a — not voiced) | — |
> ⚠ **Safety note:** `category` drives `CATEGORY_TIER` → `RouteTier` → Box 8b strictness. A future **grave** item must NOT be reachable from a celebratory band. J4's `classifyBand` already sends all high-sensitivity personal items to `doorway_sensitive`, never a positive band, so no grave→celebration path exists today. `grave` / `grave_implied` / `ambiguous` categories are **not produced by this map** — they require a meaning-level grave/ambiguity signal we have not wired (out of scope; propose separately).

### 5.2 → packet `route`
`highlight`→`highlight`; `utility`→`utility`; `doorway`→`doorway_sensitive` (the only doorway J4 emits today; `doorway_grave` requires the grave signal above, not produced here); `silent`→ not voiced.

### 5.3 category → `block` + `block_contract` (derived from the gold packets, not invented)
| category | block | block_contract (cap/co_items/tonal_turn/doorway/cooldown) | target_length |
|---|---|---|---|
| celebration | `standard` | 1 / no / no / true / none | short |
| ambiguous | `standard` | 1 / no / no / optional / none | short |
| sensitive | `sensitive_doorway` | 1 / no / **yes** / true / light_breather | short |
| utility | `utility_pin` | 1 / no / no / **false** / none | short |
| commercial | `commercial_signal` | 1 / no / no / false / none | short |
> Source: `GOLD_PACKETS` G01–G04 et al. These are the ratified-by-use reference contracts. Adopting them is a confirmation, not an invention.

### 5.4 source_type → `provenance`
friend/family/coworker/creator (self-post) → `subject_authored`; local_org/news/weather/calendar → `official_source`; brand → `official_source`; post clearly *about* a third party → `third_party`/`unclear`. ⚠ Drives preflight rule #4 (`third_party`+high-sensitivity must not voice). Default when unsure: `unclear` (fail-closed).

### 5.5 (PROPOSE, deferred — safe default holds today)
- `permitted_source_spans` auto-extraction policy (what wording the model may echo). Default `[]` is safe; richer extraction is a real safety surface — propose separately, likely via `extractSpecifics.ts`.
- `plainly_stated_serious_fact` extraction for grave items. Default `"none"` is safe for all J4 bands.

## 6. Unratified holds (explicitly NOT built)
- **A. `sensitivity`/`closeness` self-containment (note).** To build packets from a persisted `decisions-*.json` alone, the Decision would need `sensitivity` (string) + `magnitude` surfaced on it; today the adapter reads them from the `MeaningMap` (same inputs `scoring-packet.ts` uses), so **no schema change is required**. Surfacing them onto `Decision` is a minor convenience option — flagging, not doing.
- **B. `identity_policy` / `source_visibility`** — when (if ever) to expose `source_name`. Gold default is `"none"`. Marked Class-1 unratified in `world-ventura-v0-review/README.md`. **HOLD.**
- **C. `voice_payload`** — persona/voice scaffolding handed to generation. Marked Class-1 unratified. **HOLD.**

## 7. Why no adapter code yet (and what unblocks it)
Per the Drift Decision-Authority rule and the PO's own #1 instruction — *"if a field is genuinely undefined, propose it as a Class-1 contract item for team approval rather than silently inventing it"* — the band→`category` (5.1) and source_type→`provenance` (5.4) maps affect Box 8b strictness, so they get a yes/no first. I also committed to *report the contract for your eyes before moving to preflight.*

**On ratification of §5.1–5.4, the adapter is mechanical** (~1 pure function, zero model calls): `decisionToPacket(decision, item, meaning, listener) → Packet`, validated by round-tripping representative cases through the existing `preflight()` + Box 8 gates — using **synthetic fixtures, not the six picks**.

## 8. Firewall + verification
This is a contract document. No code, no runs, no model calls, no `runs/` reads. Firewall untouched. The proposed adapter consumes only public-feed-derived `Decision`/`item`/`meaning`/`listener` — never `runs/world-bible/` or any answer key.

## 9. Ratification ask (Eng1 / Eng2 / PO)
1. Adopt the **band→`category`** map (§5.1) and **source_type→`provenance`** map (§5.4) as World-Ventura-provisional (re-derive on a human corpus)?
2. Confirm the **gold-packet-derived `block`/`block_contract`** table (§5.3) as the reference treatment-depth contract?
3. Agree the **fail-closed defaults** (§4) — `source_name:"none"`, `permitted_source_spans:[]`, `serious_fact:"none"` — ship as the v0 adapter behavior, with §5.5 + §6.B/C deferred?

On yes, I land `decisionToPacket` + a gold-packet/synthetic round-trip test (candidate-agnostic). Until then, this holds — and #3 (Box 8 fixture extension) is buildable now with **zero** new contracts if you'd rather I take that first.

— CS Engineer, 2026-06-26
