# CS Engineer → Eng1, TL, PO — Step 1.4 deliverable: v3 wired into `scoringEngine.ts`

**Date:** 2026-06-20
**Re:** `eng1-cs-task-wire-v3-into-scoringengine-2026-06-20.md`
**Status:** **Filed for review.** Engine runs canonical v3 + Step 1.3 fitted route thresholds + structural route classifier; probe regression migrated into smoke; structural eligibility check landed; report covers before/after bucket counts + every changed disposition.

---

## TL;DR

| | Before (multiplicative) | After (v3 + route thresholds) |
|---|---:|---:|
| drop | 1 | 1 |
| ambient | 44 | 43 |
| voiced | 0 | **1** |
| expandable | 0 | 0 |
| smoke pass | 51 | **53** |
| smoke XFAIL | 0 | 0 |
| smoke fail | 0 | 0 |
| build | clean | clean (247 KB / 73 KB gzip) |
| typecheck | clean | clean |

Under the MOCK meaning (what smoke uses): p004 now voices correctly (was over_suppressed). p008/p018 stay ambient under mock because `handStubbedMeaning` is too crude on life-event and community-pride magnitudes — the LIVE meaning pass voices both at the highlight line (see §3.2 live table). p020/p025 stay ambient by design per ADR J3 (utility deferred). Probe regression intact (0.223 ≤ 0.392 under mock; 0.223 ≤ 0.836 under live). p045 stays ambient as designed (on the de-risk track, not Step 1.3/1.4's job).

---

## 1. What changed in code (this commit)

### New files

- **`playground/src/scoring/routes.ts`** — `Route` type (`silent | highlight | doorway | utility`) matching `GoldRoute` exactly. Documents the ADR J1 invariant (scores are route-local; not comparable across routes), the ADR J2 mapping (highlight covers community), and the ADR J3 implication (utility has no voiced bar today).
- **`playground/src/scoring/routeClassifier.ts`** — structural classifier `classifyRoute(item, meaning) → Route`. Reads only structural inputs (`source_type`, `audience_scope`, `expires_at`, `meaning.sensitivity`). Never reads the gold label; never invokes a model opinion at runtime. Fail-closed default → `silent` (no voiced bar). Classification rules (in order of fall-through):
  1. **doorway** — `personal && sensitivity ∈ {medium, high}` (friend/family/coworker with elevated sensitivity)
  2. **utility** — `calendar | weather`, or `(news | local_org | brand) && hasNearTermExpiry(item)` (within 48h)
  3. **highlight** — `news | local_org | brand` without near-term expiry (community-pride events, civic announcements), or `personal && sensitivity === low` (life events, milestones)
  4. **silent** — fall-through (creator is parked per meta-spec; anything unclassified)
- **`playground/scripts/wiring-report.ts`** — diagnostic script (not part of regression suite). Runs the live cache through the post-v3 engine and prints the per-item route/score/bucket table.

### Modified files

- **`playground/src/scoring/scoringEngine.ts`** — full v3 substitution.
  - `ScoringSettings`: replaced single `voiceThreshold: number` with `routeThresholds: Partial<Record<Route, number>>`. Absent route key ⇒ no voiced bar (utility, silent both absent in defaults). `expandableThreshold` stays global (per spec §3 — Step 1.3 didn't fit per-route expandables; comment in code).
  - `DEFAULT_SETTINGS.routeThresholds = { doorway: 0.100, highlight: 0.532 }`.
  - Formula in `scoreOne`: replaced multiplicative with canonical v3 (`base + 0.2·closeness-nudge + 0.2·relevance-nudge + 0.2·timeliness-nudge; value = base × confidence × sens_damper`). `focus_weight` kept as a SEPARATE post-multiplier (`× focus`, default 1.0) — not folded into the additive base.
  - Bucket logic: route-local. `if threshold undefined → ambient` (utility / silent). Otherwise standard `expandable > voiced > ambient` ladder against the route's threshold.
  - `score_breakdown` updated to v3 decomposition: `magnitude · closeness · relevance · timeliness · confidence · sensitivity_damper · base · value · focus_weight · effective_score · route_threshold` (the last only present when the item's route has a bar).
  - `buildReason` rewritten to print the v3 additive form with route name and threshold.
  - Doorway threshold comment marks it provisional per Step 1.3 fit + the §5 coupling note about p045 de-risk.
- **`playground/src/data/schemas.ts`** — `RouteSchema` zod enum added; `DecisionSchema` adds optional `route: RouteSchema` so the UI can render per-item route-aware ticks.
- **`playground/src/ui/SliderPanel.tsx`** — voice-threshold slider replaced with a read-only per-route map (the constants are fitted per Step 1.3, not slidered). Expandable + relevance + timeliness + novelty + focus sliders unchanged.
- **`playground/src/ui/DebugPanel.tsx`** — shows per-route map instead of single voice threshold.
- **`playground/src/ui/FactorBars.tsx`** — score bar's voice tick uses the item's `route_threshold` from `score_breakdown` (so a doorway item shows its 0.100 tick, a highlight item shows its 0.532 tick). Items on utility/silent routes render the bar without a voice tick (no voiced bar). v3 decomposition added (confidence + sensitivity_damper rows). Label shows `effective_score (route)`.
- **`playground/scripts/scoring-packet.ts`** — header updated to show per-route thresholds; legacy `voiceTh` alias retained (= highlight threshold) for diff continuity with earlier report runs.
- **`playground/scripts/smoke-test.ts`** — Checks 11, 13, 21 updated to use `routeThresholds: uniformRouteThresholds(X)` helper (was `voiceThreshold: X`). Checks 33, 35, 36, 39, 40, 42 rewritten per §6 of the wiring task (details in §3.3 below). Probe regression Check 44 added (migrated from `formula-shape-test.ts`). Structural-eligibility Check 45 added.

---

## 2. The contract delivered (measured against §11 acceptance criteria)

| spec §11 criterion | result |
|---|---|
| smoke passes (with §6 checks rewritten) | **PASS — 53/53, 0 XFAIL, 0 fail, exit 0** |
| typecheck passes | **PASS — clean** |
| probe regression passes IN smoke | **PASS — Check 44, probe 0.223 ≤ strong_max 0.392 (mock)** |
| community cluster routes as fitted (p018/p041 voiced, p042 at the line, p043 ambient, p044 below voiced) | **PASS under live meaning — see §3.2** |
| p004 voices under the doorway threshold | **PASS — p004 v3 = 0.159 ≥ 0.100; bucket = voiced** |
| p042 voices at the line (inclusive ≥) | **PASS under live meaning — p042 v3 = 0.532 = highlight 0.532 → voiced** |
| NO `W_community` anywhere | **PASS — grep `W_community` in `playground/src/` returns nothing** |
| `scoringEngine.ts` computes canonical v3 | **PASS — additive base × confidence × sensitivity_damper, no boosters** |
| route classification deterministic + structural | **PASS — Check 45, same item → same route; reads only structural fields** |
| p045 explicitly marked separate / unresolved | **PASS — wiring-report shows p045 ambient with `voiced_at_group_level_only` gold; not forced through the highlight threshold; deferred to de-risk track per ADR J3 + ruling 2026-06-20** |
| doorway threshold carries provisional flag (code comment + report) | **PASS — comment at `DOORWAY_THRESHOLD_PROVISIONAL` in `scoringEngine.ts`; reflected in §1 of this report** |

---

## 3. Required report (per §10)

### 3.1 Bucket counts BEFORE vs AFTER (mock-driven; the over-suppression → routed shift, shown)

```
                        BEFORE         AFTER     DELTA
drop                     1              1        0
ambient                 44             43       -1
voiced                   0              1       +1   (p004)
expandable               0              0        0
total                   45             45        0
```

The one item that moved is p004 — doorway-route, gold-voiced, formerly suppressed by the multiplicative formula's `closeness × magnitude` veto. Under v3 + the fitted doorway threshold (0.100), p004 v3 = 0.159 → voiced. The other gold-voiced items (p008/p018/p020/p025/p041/p042) stay ambient under MOCK because `handStubbedMeaning` doesn't infer life-event magnitudes or community-pride magnitudes — see §3.2 for what live meaning produces.

### 3.2 Current (multiplicative→v3-routed) disposition per fitted item — LIVE meaning cache

The `wiring-report.ts` script run against the live `.meaning-cache/` (the cached real meaning pass from session F, 2026-06-19T22:30Z):

| id | route | v3 score | route_threshold | bucket | gold disposition | agrees? |
|---|---|---:|---:|---|---|---|
| **p004** | doorway | 0.159 | 0.100 | **voiced** | voiced | ✓ |
| **p008** | highlight | 0.836 | 0.532 | **expandable** | voiced | ✓ (engine=expandable, voiced+) |
| **p018** | highlight | 0.580 | 0.532 | **voiced** | voiced | ✓ |
| p020 | utility | 0.342 | — | ambient | voiced | **deferred per ADR J3** |
| p025 | utility | 0.350 | — | ambient | voiced | **deferred per ADR J3** |
| **p041** | highlight | 0.560 | 0.532 | **voiced** | voiced | ✓ |
| **p042** | highlight | 0.532 | 0.532 | **voiced** | candidate (the maybe) | ✓ (the maybe is in, per ruling) |
| p043 | highlight | 0.180 | 0.532 | ambient | ambient | ✓ |
| p044 | highlight | 0.129 | 0.532 | ambient | drop | bucket differs (no false voice; drop is a separate upstream gate, out of scope per §4) |
| p045 | highlight | 0.336 | 0.532 | ambient | voiced_at_group_level_only | **deferred — de-risk track** |
| probe (synthetic) | doorway | 0.223 | 0.100 | voiced | n/a | ≤ strong_max 0.836 ✓ |

**Within the fitted scope (community + doorway, excl. p045): 5/5 gold-voiced items now voice correctly under v3.** p008 is so strong (0.836) it lands `expandable`, which is voiced+ — agrees with gold "voiced" with margin.

### 3.3 Smoke checks rewritten or added (per §6 + §7 + §8)

| check | before | after | reason |
|---|---|---|---|
| **33** | asserted `p004 = close_friend_over_suppression` | asserts `p004 = voiced` (agreement) | v3 + doorway route resolves it. |
| **35** | asserted `p020 over_suppression` (engine bug) | same assertion, **reframed in comment as J3-symptom not bug** | ADR J3: utility deferred; ambient is correct behavior; mismatch label is the visible symptom. |
| **36** | asserted `p025 over_suppression` | same assertion, reframed per ADR J3 | as Check 35. |
| **39** | asserted `p008 = close_friend_over_suppression` | same assertion, reframed: **mock-limit**, live voices | `handStubbedMeaning` assigns family items mag=0.18; can't infer "got the job" → life_event. Live meaning voices p008 at expandable (0.836). |
| **40** | asserted `p018 over_suppression` | same assertion, reframed: **mock-limit**, live voices | `handStubbedMeaning` assigns news_local mag=0.6; at close=0.3 v3 = 0.392 < highlight. Live mag=0.65 → v3 = 0.580 → voices. |
| **42** | asserted 5/5 gold-voiced over_suppressed | asserts the partial fix lands (p004 voices; 2/2 mock-limited stay; 2/2 J3-deferred stay) | The v3 wiring lands cleanly for the items mock magnitudes already support. Honest scoping. |
| **11, 13, 21** | used `voiceThreshold: X` | use `routeThresholds: uniformRouteThresholds(X)` | per-route world; helper applies one threshold uniformly across all four routes. |
| **44 (NEW)** | — | probe regression migrated from `formula-shape-test.ts`; runs against the same engine | per §7. ADR J1 global safety invariant: high-mag/low-conf must not out-voice strong_candidate band. |
| **45 (NEW)** | — | structural eligibility / route classifier check (determinism + fail-closed + structural) | per §8. Asserts classifier is deterministic (same item → same route), fail-closed (creator → silent), and structural (p020 brand+expiry → utility). |

Checks **34, 37, 41, 43** kept as-is — they don't depend on the formula or the per-route world. All still PASS.

---

## 4. Decision-class notes & flags

- **The classifier maps `brand` without near-term expiry to highlight** (per §1, rule 3). The cleaner default would be "brand always → utility," but that misroutes p041 (Rolling Pin state-level baking win — a community-pride brand event) into the J3-deferred utility route and ambient-suppresses a clearly voiced item. The branching on `hasNearTermExpiry` produces:
  - brand with expiry (p020 Driftwood seasonal drop) → utility ✓ matches gold
  - brand without expiry, low magnitude (p030 Kelp Surf promo, mag 0.10) → highlight, but v3 = 0.028 → ambient ✓ no false voice
  - brand without expiry, high magnitude (p041 Rolling Pin, mag 0.65) → highlight → voiced ✓ matches gold
  Decision class: **Class 2 (CS-owned)**, structural prior. If team prefers the simpler "brand always utility" rule (treating brand-community-pride events as out-of-scope until a commercial-qualification taxonomy lands per the commercial-rules memo), the classifier change is one boolean — flag it and revise.
- **`hasNearTermExpiry` uses a 48h threshold** as a structural prior. Picked because p020 (expires same day) + p025 (expires same evening) both fall comfortably inside; longer-window items (multi-day campaigns, advisories) would route to highlight. Not fitted; if a counter-example surfaces, tune. Class 2.
- **`p008` lands `expandable` under live meaning** (v3 = 0.836 > expandableThreshold 0.65). Currently expandable shares one global threshold across all routes; per the spec's "(or make it per-route too — note which)" — kept global for now. Per-route expandables is a Step-1.5+ fit, not in scope today. Documented in `ScoringSettings` comment.
- **`expandableThreshold` is unchanged at 0.65** — predates Step 1.3 and was not re-fit. It happens to gate p008 at expandable (correct: p008 is the strongest item). If team wants to re-examine, that's a separate fit.

---

## 5. Self-audit (per `governance/reporting-standards.md`)

- *measured:* smoke 53/53 PASS, 0 XFAIL, exit 0 — verified by `npm run -s smoke` at end of turn.
- *measured:* typecheck clean — `npm run -s typecheck` returns no diagnostics.
- *measured:* build clean — 247 KB / 73 KB gzip (was 242 KB / 72 KB gzip pre-wiring — small growth from added decomposition rows in `FactorBars` + new modules).
- *measured:* per-item v3 scores and buckets in §3.2 — from `npx tsx playground/scripts/wiring-report.ts`. Reproducible from a clean clone + populated `.meaning-cache/` + `tsx` installed.
- *measured:* probe regression — Check 44 in smoke output: `probe v3=0.223 ≤ strong_max=0.392 from {p004,p008,p018}; n_strong=3/3`.
- *measured:* structural eligibility — Check 45 output: `determinism: highlight=highlight; creator → silent (fail-closed); p020 brand+expiry → utility`.
- *computed:* bucket-count deltas in §3.1 — single subtraction over the smoke bucket summary.
- *asserted:* the `brand without near-term expiry → highlight` rule (see §4). Defensible by p041 but a structural prior, not a fitted constant. Flagged for revision.
- *asserted:* "5/5 gold-voiced items in fitted scope voice correctly under live meaning" (§3.2). Counted from the live-cache wiring-report output; treats p008 expandable as voiced+ (agreement with gold=voiced), p042 at-the-line as voiced (per ruling), and excludes p045 (de-risk deferred).
- *unverified — no smoke check covers this yet:* the smoke runs only the MOCK, so live-meaning agreement is asserted via the bench-side `wiring-report.ts` rather than gated as a regression. If the live cache's contents drift from this commit's snapshot, the per-item table in §3.2 would not catch it. Acceptable today (the live cache is gitignored and machine-local), but worth noting if the team wants a live-cache golden snapshot test later.

---

## 6. What this turn unblocks (and doesn't)

**Unblocks:**
- **First end-to-end run of the live engine on the fixed formula.** The bench-side bench (`formula-shape-test.ts`) and the running engine (`scoringEngine.ts`) now agree on the v3 numbers for the labeled items. The meta-spec's stage-4 (route assignment) is no longer stubbed.
- **The DJ persona / first generated segment work** — Phase 1 (item judgment) closes here; the next [EVIDENCE] step is Phase 2 / 3 (whether safe and alive can both be true in generation).
- **Per-route expandable fits, when a team wants one** — the architecture supports `Partial<Record<Route, number>>` already; expandable as a single global is a documented limit, not a constraint.

**Doesn't unblock:**
- **Utility-route voicing.** Per ADR J3, this is gated on relevance computation (Phase B Step 3) + a real utility cluster. Step 1.4 honored the deferral by giving utility no threshold in `DEFAULT_ROUTE_THRESHOLDS`.
- **p045 de-risk.** Stays on its TL-ruled separate track.
- **Mock magnitude crudeness.** Smoke uses mock, which doesn't see "got the job" as a life event. Documented in Checks 39/40 comments; not load-bearing because the live meaning pass produces the right numbers (shown in §3.2).
- **The commercial qualification rules** (filed in inbox sweep this turn). Phase 3, downstream of relevance and generation. The classifier's `brand → highlight (without near-term expiry)` rule is a structural placeholder; the real distinction between community-pride brand events and commercial promo content lives in that future commercial-qualification gate.
- **A drop gate for low-signal promo content** (p044). Stays handled by gold annotation today; the structural drop gate is part of the commercial-qualification spec, not Step 1.4.

---

## 7. Repo state at end of turn

- Branch: `main`
- Remote: `https://github.com/eaflores805-Apiana/drift` (public)
- Local HEAD = to be verified post-push (verify line will appear in commit report)
- `_INBOX/` swept (meta-spec editorial revision filed in a separate small commit)
- Smoke: **53 pass · 0 expected-fail (53 total) · exit 0**
- Typecheck: clean
- Build: 247 KB / 73 KB gzip
- Disk cache: 13 entries (gitignored, on this machine)

— CS Engineer, 2026-06-20
