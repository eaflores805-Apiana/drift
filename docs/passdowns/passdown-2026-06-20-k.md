# Passdown — 2026-06-20 (session K)

*CS Engineer. **v3 wiring landed.** Engine now runs the canonical formula end-to-end against per-route thresholds; structural route classifier built; probe regression migrated into smoke; structural eligibility check added. Phase-1 milestone: the live engine runs the fixed formula for the first time. Smoke 53/53 · 0 XFAIL · exit 0. Typecheck clean. Build 247 KB / 73 KB gzip.*

## What I did

1. **Filed inbox docs** (2026-06-20 morning drop): signal-routing meta-spec v0.1.0 (filed as `docs/signal-routing-meta-spec.md`); Eng1's commercial qualification rules v0 (filed to `docs/correspondence/`). Both are NOT-build documents per their own framing; recorded as such.
2. **Recorded ADR J3** in `docs/07-decision-log.md` — utility-route threshold deferred; relevance is uncomputed (Step-3 dependency). Cited `scoringEngine.ts:99` and the two cached meaning files (p020/p025) as evidence; PO ratified.
3. **Wired v3 into `scoringEngine.ts`** per the bounded task (`eng1-cs-task-wire-v3-into-scoringengine-2026-06-20.md`):
   - New `playground/src/scoring/routes.ts` — `Route` type matches `GoldRoute`.
   - New `playground/src/scoring/routeClassifier.ts` — deterministic, structural, fail-closed → silent. Routes on `source_type` + `audience_scope` + `expires_at` + `meaning.sensitivity`; never the gold label, never a model opinion at runtime.
   - `ScoringSettings` replaces `voiceThreshold: number` with `routeThresholds: Partial<Record<Route, number>>`. Defaults: `{ doorway: 0.100, highlight: 0.532 }`; utility/silent absent ⇒ no voiced bar.
   - `scoreOne` formula: canonical v3 (`base + 0.2·closeness-nudge + 0.2·relevance-nudge + 0.2·timeliness-nudge; value = base × confidence × sens_damper`); focus stays a separate post-multiplier.
   - `Decision` carries `route` (optional) for the UI.
   - UI updates: SliderPanel shows the per-route map read-only; DebugPanel displays the same; FactorBars uses per-item `route_threshold` for the voice tick (utility/silent items render bar without it).
4. **Migrated probe regression into smoke** (Check 44) — moves from `formula-shape-test.ts` to the always-run suite per spec §7.
5. **Added structural eligibility check** (Check 45) — asserts classifier determinism, fail-closed behavior, and a positive case (p020 brand+expiry → utility).
6. **Rewrote smoke checks per §6**: Check 33 (p004 now voices); Checks 35/36 reframed (utility ambient is correct per J3); Check 42 reframed (1 voices, 2 stay mock-limited, 2 J3-deferred); Checks 39/40 reframed (mock crudeness on life-event/news magnitudes, live meaning voices both); Checks 11/13/21 updated for per-route world.
7. **Wrote `playground/scripts/wiring-report.ts`** — diagnostic script that runs the live cache through the post-v3 engine. Per-item route/score/bucket table.
8. **Filed Step 1.4 deliverable** at `docs/correspondence/cs-step-1.4-v3-wiring-2026-06-20.md` — full §10 report, before/after bucket counts, per-item live-cache table, smoke check rewrites table, decision-class notes, self-audit.

## Results (measured)

### Under MOCK (what smoke runs)

```
                       BEFORE         AFTER     Δ
drop                     1              1       0
ambient                 44             43      -1
voiced                   0              1      +1   (p004)
expandable               0              0       0
smoke pass              51             53      +2   (probe + structural eligibility added)
smoke XFAIL              0              0       0
```

p004 (Mateo, doorway) v3 = 0.109 ≥ doorway 0.100 → voiced ✓. The 4 other gold-voiced items (p008/p018/p020/p025) stay ambient under mock: p008/p018 due to `handStubbedMeaning` crudeness (assigns family items mag=0.18 regardless of "got the job"; news_local mag=0.6 regardless of CIF state finals); p020/p025 by design per ADR J3 (utility deferred).

### Under LIVE meaning cache (per `wiring-report.ts`)

| id | route | v3 | bucket | gold | result |
|---|---|---:|---|---|---|
| p004 | doorway | 0.159 | voiced | voiced | ✓ |
| p008 | highlight | 0.836 | **expandable** | voiced | ✓ (voiced+) |
| p018 | highlight | 0.580 | voiced | voiced | ✓ |
| p020 | utility | 0.342 | ambient | voiced | deferred (J3) |
| p025 | utility | 0.350 | ambient | voiced | deferred (J3) |
| p041 | highlight | 0.560 | voiced | voiced | ✓ |
| p042 | highlight | 0.532 | voiced | maybe | ✓ (maybe is in) |
| p043 | highlight | 0.180 | ambient | ambient | ✓ |
| p044 | highlight | 0.129 | ambient | drop | bucket diff (no false voice; drop = separate upstream gate) |
| p045 | highlight | 0.336 | ambient | voiced_at_group_level | deferred (de-risk track) |

**5/5 gold-voiced items in fitted scope voice correctly under live meaning** (p004 doorway · p008 highlight-expandable · p018 highlight · p041 highlight · p042 highlight at the line). p045 ambient as designed.

### Probe regression (Check 44)

```
probe v3 (mag 0.85, conf 0.30, sens medium, close 0.9) = 0.223
strong_max (mock) = 0.392
probe ≤ strong_max → OK
```

Bench-side `formula-shape-test.ts` still shows `probe 0.223 ≤ strong_max 0.836` under live meaning. Both invariants intact.

### Structural eligibility (Check 45)

```
determinism: highlight = highlight (same item → same route)
fail-closed: creator → silent
structural:  p020 brand + near-term expiry → utility
```

## Self-audit (per `governance/reporting-standards.md`)

- *measured:* smoke 53/53 PASS from `npm run -s smoke` tail.
- *measured:* typecheck clean.
- *measured:* build 247 KB / 73 KB gzip (was 242 KB / 72 KB gzip pre-wiring; small growth from new modules + extra FactorBars rows).
- *measured:* per-item live-cache table from `wiring-report.ts` output, reproducible from clean clone + populated `.meaning-cache/` + `tsx`.
- *measured:* probe and structural-eligibility numbers from smoke output verbatim.
- *computed:* bucket-count deltas — single subtraction.
- *asserted:* classifier rule "brand without near-term expiry → highlight" is a structural prior, defensible by p041 but flagged in the deliverable §4 for revision if the team prefers stricter "brand always utility."
- *asserted:* `hasNearTermExpiry` uses 48h window — structural prior, not fitted.
- *asserted:* "5/5 gold-voiced in fitted scope voice correctly under live meaning" — counted from §3.2 of the deliverable; treats p008 expandable as voiced+ (agreement), p042 at-the-line as voiced (per ruling), excludes p045.
- *unverified — no programmatic check covers this yet:* smoke runs only mock; live-meaning agreement is asserted in the deliverable but not gated as a regression. If the live cache contents drift, the §3.2 table wouldn't catch it. Acceptable today; flag for "live-cache golden snapshot test" if the team ever wants one.

## What this turn unblocks

- **The DJ persona / first generated segment work.** Phase-1 (item judgment) closes here. Whether safe AND alive can both be true in generation is now the next testable question.
- **Per-route expandable fits.** The architecture supports per-route expandables already (`Partial<Record<Route, number>>` for `routeThresholds`; expandable could mirror); kept global today, documented in `ScoringSettings`.
- **A "live-cache golden snapshot" smoke check**, if the team wants regression coverage on the live numbers — small follow-on if useful.

## What stays gated

1. **Utility-route voicing.** ADR J3: relevance computation (Step 3) + a real utility cluster.
2. **p045 voicing.** TL-ruled separate de-risk track.
3. **Commercial qualification gate** (drop gate for promo content; the cleaner brand-vs-community-pride structural distinction). Per the filed v0 rules, Phase 3 + downstream of relevance.
4. **Mock magnitude crudeness.** Either improve `handStubbedMeaning` to detect life-event keywords (small mock-only change, hides nothing important), or accept that smoke is mock-shape and the live-cache wiring report is the source of truth for "voices correctly." Today: option B (documented in Checks 39/40 comments).

## What's NOT done (per spec discipline)

- No live calls.
- No `scoringEngine.ts` change beyond the v3 substitution + per-route thresholds + route classification.
- No threshold tuning (the constants are the Step 1.3 fits as-is).
- No retune of α/β/γ or the dampers.
- No p044 promo-drop gate.
- No Layer 2 / session work.
- No relevance computation.

## Repo state at end of turn

- Branch: `main`
- Remote: `https://github.com/eaflores805-Apiana/drift` (public)
- Local HEAD = to be verified post-push
- `_INBOX/` swept (meta-spec editorial revision rolled into a separate commit)
- Smoke: **53 pass · 0 expected-fail (53 total) · exit 0**
- Typecheck: clean
- Build: 247 KB / 73 KB gzip
- Disk cache: 13 entries (gitignored, on this machine)

— CS Engineer, 2026-06-20
