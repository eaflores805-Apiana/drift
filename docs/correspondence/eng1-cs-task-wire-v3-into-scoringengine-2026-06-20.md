# CS Task — Wire v3 Route-Aware Scoring into the Bench
### The milestone step: v3 stops being a script report and starts driving `scoringEngine.ts`

> **2026-06-20 · Eng1 → CS.** Built from the PO's accepted requirements + a read of the current `scoringEngine.ts`. **Read §0 and §1 before touching code** — this is not a pure formula swap; three things the requirements assume don't yet exist in the engine, and one of them will turn the suite red if you don't handle it. Two items in §1 need a PO confirmation before you implement.
>
> **Report in the adopted format: show the inputs, cite the check, flag the unverified, tag measured/computed/asserted.**

---

## §0 — The contract (PO-accepted; do not reopen)

```
v3 shape:            additive base × confidence × sensitivity_damper   (α=β=γ=0.2)
doorway threshold:   0.100  (PROVISIONAL — see §5)
community threshold: 0.532
p042:                voices at the line  (≥ is inclusive)
W_community:         rejected — NO separate community term
p045:                excluded from the threshold; stays on the de-risk track, reported not resolved
routing:             ADR J1 — Layer 1 ranks within route; Layer 2 owns cross-route airtime
```
Do not reopen v1/v2, `W_community`, global ranking, or p045 de-risk semantics. Do not move Layer 2 logic into Layer 1. Do not solve p045 here.

---

## §1 — Three things the contract assumes that the engine doesn't have yet (READ FIRST)

**(a) The engine has no route concept.** `scoreOne` classifies nothing; `route` lives only in `goldLabels.ts` as a label (`GoldRoute = silent | highlight | doorway | utility`). To apply route-aware thresholds you must **build deterministic route classification** from structural fields — never from the gold label (the engine can't see labels at runtime) and never a model opinion. Proposed structural classifier (fail-closed; confirm with Eng1):
```
route(item, meaning):
  if meaning.sensitivity in {high, medium} AND source_type in {friend, family}
     AND category is sensitive/negative          → "doorway"
  elif source_type in {local_org, news} AND audience_scope public/local-civic
                                                  → "community"   (see decision below)
  elif source_type == brand AND commercial intent → "utility"
  elif positive personal life-event              → "highlight"
  else                                            → default ambient route (no voiced bar)
```

**(b) `confidence` and `sensitivity` are currently unconsumed.** The multiplicative formula never multiplies by them (they're in `meaning` but only `buildReason` reads `sensitivity`, for display). Wiring v3 means *adding* both as score inputs: `× confidence` and `× sensitivity_damper`.

**(c) Two decisions needed before you implement** (PO confirm):
- **Route taxonomy: is "community" the highlight route, or a distinct route?** `GoldRoute` has no `community` — the community-pride items (p018/p041/p042) are gold-route `highlight`. Recommended default: **the 0.532 threshold is the highlight-route threshold**, covering both community-pride and personal highlights (p008). If PO wants community as a *separate* bar from personal highlights, `GoldRoute` and the classifier need a `community` split first.
- **Utility threshold is unfit.** Step 1.3 fit doorway + community only. p020/p025 are `utility`; with no utility threshold they stay ambient (still over-suppressed) and checks 35/36 will *not* flip (see §6). Either fit a provisional utility threshold this task, or accept p020/p025 staying ambient and adjust those checks accordingly. PO call.

---

## §2 — v3 in `scoreOne` (`scoringEngine.ts`)

Replace the multiplicative block:
```
rawScore = magnitude × closeness × (0.5+0.5·relevance) × (0.5+0.5·timeliness)
effective = rawScore × focus
```
with the canonical v3 base + dampers:
```
base = magnitude
     + 0.2·(closeness  − 0.5)
     + 0.2·(relevance  − 0.5)
     + 0.2·(timeliness − 0.5)
value = base × confidence × sensitivity_damper
```
- `confidence` = `meaning.confidence`.
- `sensitivity_damper` from `meaning.sensitivity`: `none/low → 1.0 · medium → 0.8 · high → 0.6`.
- **`focus_weight`:** v3 as specified has no focus term. Keep `focus` as a *separate post-multiplier* (`× focus`, currently all 1.0 → no behavioral change) so the channel/learning gain stays wired for later, OR drop it — but state which. Recommend keep-as-1.0 post-multiplier; do not fold it into the additive base.
- Update `score_breakdown` to the v3 decomposition: `base`, `confidence`, `sensitivity_damper`, `value` (and keep `focus_weight`). Update `buildReason` to print the additive form.

---

## §3 — Route-aware thresholds

- Replace the single `voiceThreshold` in `ScoringSettings` with a **per-route threshold map**, e.g. `routeThresholds: { doorway: 0.100, highlight: 0.532, utility: <decided>, … }`, keep `expandableThreshold` (or make it per-route too — note which).
- In `scoreOne`: classify the item's route (§1a), look up that route's threshold, bucket against it. Items on the `silent`/default route get no voiced bar (ambient unless explicitly voiced elsewhere).
- **Within-route only (ADR J1).** No global leaderboard, no cross-route comparison. The threshold is the only cross-the-line test; *which route speaks now* is Layer 2's, out of scope.

---

## §4 — Bucket logic (drop vs ambient)

- **Consent drop stays exactly as-is** (the only path to `drop` today).
- **p044 "held below voiced" is satisfied by ambient.** Its true `drop` is the gold's "separate lower drop gate" — that gate is **not** built in this task. p044 landing ambient (below the community threshold) meets the contract; do not force-build a promo-drop gate here. (If a structural signal-floor drop is trivial and in-scope, fine — but it's optional, not required.)
- `missing-meaning → ambient` guard stays.

---

## §5 — The doorway threshold is provisional (bake the flag in)

0.100 is fit to **one** point (p004 voiced); the silent ceiling reference (p016) is **cross-route**, not an in-route doorway negative. Acceptable for wiring, but:
- Add a code comment at the doorway threshold marking it provisional + the reason.
- Re-fit when more doorway items land, **especially a true doorway-silent anchor**.
- **Coupling:** if the p045 de-risk track later moves where sensitivity is applied (out of the score), the doorway decompresses and this threshold must be re-fit. Note it.

---

## §6 — Smoke: the checks that FLIP (the part that turns the suite red if missed)

Wiring v3 makes the gold-voiced items voice — so the checks that currently assert they're *over-suppressed* (documenting the bug) must be rewritten to assert *correct routing* (confirming the fix). Bucket counts shift: more voiced, fewer ambient.

| check | current assertion | after v3 | action |
|---|---|---|---|
| 33 | p004 = `close_friend_over_suppression` | p004 voices (0.159 ≥ 0.100, doorway) | **rewrite** → agrees with gold (voiced) |
| 39 | p008 = `close_friend_over_suppression` | p008 voices (high base, highlight) | **rewrite** → voiced |
| 40 | p018 = `over_suppression` | p018 voices (0.580 ≥ 0.532) | **rewrite** → voiced |
| 42 | all 5 gold-voiced = over_suppression | the inverse — they now route correctly | **rewrite** → all gold-voiced route correctly |
| 35 | p020 = `over_suppression` (utility) | voices *only if* utility threshold fit | **conditional** — see §1c |
| 36 | p025 = `over_suppression` (utility) | voices *only if* utility threshold fit | **conditional** — see §1c |
| 34 | p002 consent-dropped (drop/drop) | unchanged | keep |
| 41 | p030 + p036 ambient/ambient | stay ambient under v3 (low scores) | keep — verify |
| 37 | junk (p016/p030/p010) no false-voice | stay low under v3 | keep — verify |

Do **not** delete the mismatch-classification machinery — it still guards against *false voice* (a junk item wrongly voicing) and `close_friend_over_suppression`. You're flipping the *expected outcomes* for the fixed items, not removing the comparison.

---

## §7 — Probe regression → into smoke (always-run invariant)

Move the high-magnitude/low-confidence probe assertion from `scripts/formula-shape-test.ts` into `scripts/smoke-test.ts` so it runs on every bench commit:
```
assert  v3_probe_score ≤ strong_candidate_v3_max
known passing:  probe 0.223 ≤ 0.836
```
This is the ADR J1 global safety invariant — it holds across all routes. If wiring changes any score such that the probe breaches the strong-candidate max, the wiring is rejected.

---

## §8 — Structural eligibility smoke check (fail-closed)

Community-route membership must be **structural and fail-closed** — `source_type` + `audience_scope` (+ route classification), never a model vibe. Add a smoke check asserting:
- a community-route item has `audience_scope` public/local-civic AND a community-eligible `source_type`;
- the gate is deterministic (same item → same eligibility every run);
- a non-eligible item (e.g. a private-scoped or non-civic source) is **not** admitted to the community route.

(Note from corpus authoring: every seed item is `audience_scope: "public"`, so eligibility keys on `source_type` + route, not audience_scope alone — design the assertion accordingly.)

---

## §9 — Corpus-integrity check (already done — keep)

Check 43 (every labeled/cluster id exists in `seed-items.json`) is already in smoke and self-clearing. Keep it; do not regress it. It caught a real gap once.

---

## §10 — Required report

```
smoke result (pass/total, any XFAIL)
typecheck result
bucket counts BEFORE vs AFTER (the over-suppression → routed shift, shown)
current(multiplicative) vs v3-routed disposition for each fitted item
probe regression result (now in smoke)
every changed disposition, named
which smoke checks were rewritten (§6) and why
```
Required table — `p004 · p018 · p041 · p042 · p043 · p044 · p045 · probe` — each with: route, v3 score, threshold applied, bucket, gold, agrees?. **p045 reported but NOT forced through the community threshold** — mark it `deferred / de-risk track`, score shown (0.336), not counted as a resolved routing.

---

## §11 — Acceptance criteria

```
smoke passes (with §6 checks rewritten)
typecheck passes
probe regression passes IN smoke
community cluster routes as fitted (p018/p041 voiced, p042 at the line, p043 ambient, p044 below voiced)
p004 voices under the doorway threshold
p042 voices at the line (inclusive ≥)
NO W_community anywhere
scoringEngine.ts computes canonical v3 (additive base × confidence × sensitivity_damper)
route classification is deterministic + structural (no gold-label lookup, no model opinion at runtime)
p045 explicitly marked separate / unresolved
doorway threshold carries its provisional flag (code comment + report)
```

---

## §12 — Out of scope / flags

- **Out of scope:** the p044 promo-drop gate (§4); the p045 de-risk recalc (separate track, TL ruling); Layer 2/session work; relevance computation; any retune of α/β/γ or the dampers.
- **Flags for the passdown:** doorway threshold provisional (§5); utility threshold + route-taxonomy decisions (§1c) — resolve with PO before/while implementing; if either is deferred, p020/p025 stay ambient and §6 checks 35/36 stay as-is.
- **Offer:** Eng1 can supply a reference implementation of the v3 `scoreOne` + the route classifier in a branch if useful — but the route-taxonomy decision (§1c) should land first so it's not built twice.
