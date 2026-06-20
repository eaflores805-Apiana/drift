# CS Report — Community-Cluster v3 Scoring Table

*Author: CS Engineer · 2026-06-20 · response to Eng1 task in the same-day Senior memo. Reported per `governance/reporting-standards.md`: show the inputs, cite the check, flag the unverified, tag measured / computed / asserted. Reproducible via `npx --package=tsx -- tsx playground/scripts/formula-shape-test.ts`.*

---

## Setup (measured)

- **Script:** `playground/scripts/formula-shape-test.ts` (extended this turn to add p041–p045 to `TARGETS` and to resolve gold from both `labels[]` and `community_cluster[]` via a new `resolveGold()` helper).
- **Cache:** `playground/.meaning-cache/`, 13 entries (8 from prior live batches + 5 from yesterday's PO-gated batch on p041–p045). All entries validated against `ModelDerivedSchema` on disk reads (per `DiskMeaningCache.get()` — bad cached entries treat as miss; none did).
- **Closeness:** held constant at **0.2 (unknown)** for all five new community accounts. By Eng1 handoff design — the new account_ids are not in `listener.closeness_map`, so magnitude becomes the single discriminator within the community route.
- **No code in `scoringEngine.ts` touched.** No live calls (`CachedReadOnlyClient` throws by construction). No threshold moved. No constants fit. No `W_community` term added.

## Variant scores for the five new community items (computed, full arithmetic)

Where v1 = `mag × close × rel × time`, v2 = `mag + α(close − 0.5) + β(rel − 0.5) + γ(time − 0.5)` with α=β=γ=0.2, v3 = `v2 × confidence × sens_damper` with damper {low: 1.0, medium: 0.8, high: 0.6}. All have `close = 0.20`, `rel = 0.50`, `time = 0.50` (no expiry, recent timestamps).

| id | mag | conf | sens | v1 arithmetic | v1 | v2 arithmetic | v2 | v3 arithmetic | v3 |
|---|---:|---:|---|---|---:|---|---:|---|---:|
| **p041** | 0.65 | 0.95 | low | `0.65 × 0.20 × 0.50 × 0.50` | 0.033 | `0.65 + 0.2(0.20−0.5) + 0 + 0 = 0.65 − 0.06` | 0.590 | `0.590 × 0.95 × 1.00` | **0.560** |
| **p042** | 0.62 | 0.95 | low | `0.62 × 0.20 × 0.50 × 0.50` | 0.031 | `0.62 + 0.2(0.20−0.5) + 0 + 0 = 0.62 − 0.06` | 0.560 | `0.560 × 0.95 × 1.00` | **0.532** |
| **p043** | 0.25 | 0.95 | low | `0.25 × 0.20 × 0.50 × 0.50` | 0.013 | `0.25 + 0.2(0.20−0.5) + 0 + 0 = 0.25 − 0.06` | 0.190 | `0.190 × 0.95 × 1.00` | **0.180** |
| **p044** | 0.20 | 0.92 | low | `0.20 × 0.20 × 0.50 × 0.50` | 0.010 | `0.20 + 0.2(0.20−0.5) + 0 + 0 = 0.20 − 0.06` | 0.140 | `0.140 × 0.92 × 1.00` | **0.129** |
| **p045** | 0.65 | 0.95 | **high** | `0.65 × 0.20 × 0.50 × 0.50` | 0.033 | `0.65 + 0.2(0.20−0.5) + 0 + 0 = 0.65 − 0.06` | 0.590 | `0.590 × 0.95 × 0.60` | **0.336** |

p045 is the sensitivity-damper case: same magnitude as p041 (0.65), but `sens = high` multiplies by 0.60 instead of 1.00, dropping v3 from 0.560 → 0.336.

## Community-cluster within-route ranking (computed)

Includes p018 (carried from prior live batch — same community-pride route per `community_cluster[]`).

| rank | id | name | v3 score | gold disposition | voiceworthiness | sens |
|---:|---|---|---:|---|---|---|
| 1 | p018 | Buena CIF | **0.580** | voiced | strong_candidate | low |
| 2 | p041 | Rolling Pin bakery wins | **0.560** | voiced | strong_candidate | low |
| 3 | p042 | Library 1k kids (maybe) | **0.532** | candidate (voiced-or-ambient — the maybe) | candidate | low |
| 4 | p045 | Anacapa science team | **0.336** | voiced_at_group_level_only | strong_candidate | high |
| 5 | p043 | Farmers market peak | **0.180** | ambient | not_voiceworthy | low |
| 6 | p044 | Harbor Threads sale | **0.129** | drop | not_voiceworthy | low |

## Wins-vs-noise separation (computed)

Treating "wins" as gold-voiced or candidate items, "noise" as gold-ambient or gold-drop:

| framing | wins min | noise max | gap |
|---|---:|---:|---:|
| all wins (incl. p045 sens-damped) | p045 = 0.336 | p043 = 0.180 | **0.156** (positive — flat threshold separates) |
| wins excluding p045 (Senior's "0.53–0.56" framing) | p042 = 0.532 | p043 = 0.180 | **0.352** (positive — clean separation) |

Both framings show positive gap; the "exclude p045 as a sens-damped special case" framing is the wider one and matches Senior's predicted shape ("wins 0.53–0.56, noise 0.13–0.18").

## Probe regression (measured — protected by the script's ADR-J1 assertion)

```
probe v3 score:               0.223
strong_candidate v3 max:      0.836  (from p008 in labels[]; unchanged after adding p041–p045)
probe ≤ max (must pass):      OK
```

Adding the five community items did not move the strong_candidate v3 ceiling (still 0.836 from p008). p045 at 0.336 is well below it; p041 at 0.560 is well below it. The probe regression assertion (per ADR J1) holds — verified by the script exiting 0 instead of the non-zero "global safety invariant violated" path.

## Observations the data supports (asserted — not a ruling)

- **The community route's v3 ordering aligns with the gold dispositions on the non-sensitive items.** p018 > p041 > p042 > p043 > p044 matches voiced > voiced > candidate-maybe > ambient > drop. Pure threshold-only on v3, with a cut anywhere in the 0.18–0.53 band, would place the 5 non-sensitive items correctly (p018/p041/p042 voiced, p043 ambient — p044 still needs the lower drop gate, separate from the floor per v0.4.0 `_meta.what_the_floor_actually_fits`).
- **p045 is the sens-damped voiced-group-level case.** Its v3 (0.336) sits below p042 (0.532). Under ADR J1's route-aware ranking, this is the same family as the p004 doorway-suppression finding from Step 1.1: the sensitivity damper depresses voiced sensitive items; route-local ranking within sub-routes handles the rest. *Within community-pride specifically, p045's within-route rank ≠ its gold rank* — same data shape as p004.
- **The "wins" band (excluding p045 as a sens-damped case) is 0.532–0.580. The "noise" band is 0.129–0.180. Separation = 0.352.** Wide enough that any threshold in [0.18, 0.53] places non-sensitive community items correctly.

These observations are the *table*, not a *ruling*. They're the evidence Senior asked for; the `W_community` decision is the team's. Per Senior's same-day memo, this report is meant to "replace appendix hand-arithmetic with team-confirmed numbers" — that's what's above; everything else is the team's read.

## Self-audit (per `governance/reporting-standards.md`)

- *measured:* all v3 numbers reproducible by running the extended script against the disk cache. The same input rows (mag/close/rel/time/conf/sens) appear in the script's per-variant tables; the values above match.
- *measured:* probe regression status (`OK`) is the script's exit-0 condition; flipping any damper such that probe > 0.836 would fail the script with the named violation.
- *measured:* "strong_candidate v3 max = 0.836" — value from p008 in labels[], unchanged after extending TARGETS (verifiable by grep in script output).
- *computed:* wins-vs-noise gap (0.156 / 0.352) — single subtraction from the table rows.
- *asserted:* the "p045 is the same family as p004" framing is interpretation; the arithmetic is just the damper math (0.590 × 0.95 × 0.60 = 0.336).
- *unverified — no check covers this yet:* nothing programmatically asserts "wins min > noise max" for the community route. Could add as a Step 1.3 acceptance check once the route-fit pass runs. Not load-bearing today.

## What's NOT done (boundaries from the task spec)

- **No `scoringEngine.ts` change.** v3 still lives only in the standalone script.
- **No constant fitting.** Damper values (1.0/0.8/0.6), α/β/γ (0.2 each), and thresholds are all at the same starting priors as Step 1.1. Step 1.3 fits these per route.
- **No `W_community` term.** v3 ran as ratified — additive base × confidence × sens_damper, nothing else.
- **No threshold move.** No `voiceThreshold` / `expandableThreshold` was changed.
- **No spec promotion.** `rules-and-format.md` Part 3 still says multiplicative — Eng1's job after rulings clear.
- **No live calls.** `CachedReadOnlyClient` throws on `judge()`; cache is read-only for this script.

## Reproduce

```bash
npx --package=tsx -- tsx playground/scripts/formula-shape-test.ts > /tmp/community-cluster-table.md
```

Anchored to script directory via `import.meta.url`; works from any cwd. Reads gold from `playground/data/gold-labels.json`, items from `playground/data/seed-items.json`, meaning from `playground/.meaning-cache/`.

---

*End of report. Standing by — does not require a decision from CS. Senior's memo names the chain: this table + the de-risk recalc ruling → `W_community` call largely in Senior's hands with TL's nod → v3 promotion → Step 1.3 fit.*
