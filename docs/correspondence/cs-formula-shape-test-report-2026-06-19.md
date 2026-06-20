# CS Report — Step 1.1 Formula-Shape Test

*Author: CS Engineer · 2026-06-20 · response to Eng1 task spec `docs/correspondence/eng1-cs-task-step-1.1-formula-shape-test-2026-06-19.md`. Reported per `governance/reporting-standards.md`: show the inputs, cite the check, flag the unverified, tag measured/computed/asserted. Reproducible via `playground/scripts/formula-shape-test.ts`.*

---

## Setup *(measured)*

- **Items:** 8 locked v0.3.1 labels (p004, p008, p018, p020, p025, p010, p016, p030); p002 excluded (consent-blocked, no meaning).
- **Meaning fields:** cached real `ModelDerived` from `playground/.meaning-cache/` (prompt_version `meaning-pass-v0.1.0`, model `claude-sonnet-4-6`). All 8 items present in cache; no live calls made.
- **Closeness:** from `playground/data/listener.json` via `closeness()` (tier→numeric lookup). Per-item values shown in tables.
- **Timeliness:** from `timeliness()` with `FIXED_NOW = 2026-06-19T13:00:00`, `timelinessBaseline = 0.5`. Per-item values shown.
- **Relevance:** held at baseline 0.5 across all items (current code does not compute per-item relevance; no per-item rel labels exist yet).
- **Confidence + sensitivity:** from cached meaning. **Current scoring code does not apply either — flagged as unverified that the spec's "currently applied" clause matches code; in this report v1 omits both, v3 applies them as dampers.**

## Formula variants *(asserted — starting drafts per spec; CS to draft, team to amend)*

| Variant | Formula | Notes |
|---|---|---|
| **v1 multiplicative** (control) | `S = mag × close × rel × time` | Simpler than current code's booster form `mag × close × (0.5 + 0.5·rel) × (0.5 + 0.5·time)`. Used the spec-stated formula. |
| **v2 hierarchy-first additive** | `S = mag + α(close − 0.5) + β(rel − 0.5) + γ(time − 0.5)`, with `α = β = γ = 0.2` | Magnitude is the spine; each other factor is a ±0.1 personalization. No single factor can veto. **0.2 is an asserted starting prior; the team owns this constant — but the *shape* is what's being tested, not the value.** |
| **v3 additive-with-dampers** | `S = v2 × confidence × sens_damper` | Dampers: `low = 1.0`, `medium = 0.8`, `high = 0.6`. **Asserted prior; the team owns these.** Hypothesis: cannot over-voice low-confidence or high-sensitivity items even when magnitude is high. |

## v1 — multiplicative (control) *(computed)*

| id | route | voiceworthy | mag | close | rel | time | conf | sens | arithmetic | score |
|---|---|---|---:|---:|---:|---:|---:|---|---|---:|
| p004 | doorway | strong_candidate | 0.45 | 0.90 | 0.50 | 0.50 | 0.50 | high | mag 0.45 × close 0.90 × rel 0.50 × time 0.50 | **0.101** |
| p008 | highlight | strong_candidate | 0.80 | 0.90 | 0.50 | 0.50 | 0.95 | low | mag 0.80 × close 0.90 × rel 0.50 × time 0.50 | **0.180** |
| p018 | highlight | strong_candidate | 0.65 | 0.30 | 0.50 | 0.50 | 0.95 | low | mag 0.65 × close 0.30 × rel 0.50 × time 0.50 | **0.049** |
| p020 | utility | candidate | 0.30 | 0.30 | 0.50 | 1.00 | 0.95 | low | mag 0.30 × close 0.30 × rel 0.50 × time 1.00 | **0.045** |
| p025 | utility | candidate | 0.35 | 0.30 | 0.50 | 0.85 | 0.92 | low | mag 0.35 × close 0.30 × rel 0.50 × time 0.85 | **0.045** |
| p010 | silent | not_voiceworthy | 0.15 | 0.40 | 0.50 | 0.50 | 0.20 | medium | mag 0.15 × close 0.40 × rel 0.50 × time 0.50 | **0.015** |
| p016 | silent | not_voiceworthy | 0.20 | 0.50 | 0.50 | 0.50 | 0.30 | high | mag 0.20 × close 0.50 × rel 0.50 × time 0.50 | **0.025** |
| p030 | silent | not_voiceworthy | 0.10 | 0.30 | 0.50 | 0.35 | 0.95 | low | mag 0.10 × close 0.30 × rel 0.50 × time 0.35 | **0.005** |

## v2 — hierarchy-first additive *(computed)*

| id | route | voiceworthy | arithmetic | score |
|---|---|---|---|---:|
| p004 | doorway | strong_candidate | 0.45 + 0.2·(0.90 − 0.5) + 0.2·(0.50 − 0.5) + 0.2·(0.50 − 0.5) = 0.45 + 0.080 + 0 + 0 | **0.530** |
| p008 | highlight | strong_candidate | 0.80 + 0.2·(0.90 − 0.5) + 0.2·(0.50 − 0.5) + 0.2·(0.50 − 0.5) = 0.80 + 0.080 + 0 + 0 | **0.880** |
| p018 | highlight | strong_candidate | 0.65 + 0.2·(0.30 − 0.5) + 0.2·(0.50 − 0.5) + 0.2·(0.50 − 0.5) = 0.65 − 0.040 + 0 + 0 | **0.610** |
| p020 | utility | candidate | 0.30 + 0.2·(0.30 − 0.5) + 0.2·(0.50 − 0.5) + 0.2·(1.00 − 0.5) = 0.30 − 0.040 + 0 + 0.100 | **0.360** |
| p025 | utility | candidate | 0.35 + 0.2·(0.30 − 0.5) + 0.2·(0.50 − 0.5) + 0.2·(0.85 − 0.5) = 0.35 − 0.040 + 0 + 0.070 | **0.380** |
| p010 | silent | not_voiceworthy | 0.15 + 0.2·(0.40 − 0.5) + 0 + 0 = 0.15 − 0.020 | **0.130** |
| p016 | silent | not_voiceworthy | 0.20 + 0.2·(0.50 − 0.5) + 0 + 0 = 0.20 + 0 | **0.200** |
| p030 | silent | not_voiceworthy | 0.10 + 0.2·(0.30 − 0.5) + 0 + 0.2·(0.35 − 0.5) = 0.10 − 0.040 − 0.030 | **0.030** |

## v3 — additive-with-dampers *(computed)*

| id | route | voiceworthy | arithmetic | score |
|---|---|---|---|---:|
| p004 | doorway | strong_candidate | (0.530 from v2) × conf 0.50 × sens_damper 0.60 (high) | **0.159** |
| p008 | highlight | strong_candidate | (0.880 from v2) × conf 0.95 × sens_damper 1.00 (low) | **0.836** |
| p018 | highlight | strong_candidate | (0.610 from v2) × conf 0.95 × sens_damper 1.00 (low) | **0.580** |
| p020 | utility | candidate | (0.360 from v2) × conf 0.95 × sens_damper 1.00 (low) | **0.342** |
| p025 | utility | candidate | (0.380 from v2) × conf 0.92 × sens_damper 1.00 (low) | **0.350** |
| p010 | silent | not_voiceworthy | (0.130 from v2) × conf 0.20 × sens_damper 0.80 (medium) | **0.021** |
| p016 | silent | not_voiceworthy | (0.200 from v2) × conf 0.30 × sens_damper 0.60 (high) | **0.036** |
| p030 | silent | not_voiceworthy | (0.030 from v2) × conf 0.95 × sens_damper 1.00 (low) | **0.028** |

## Ranking, cross-tier check *(computed)*

Gold tiers (per v0.3.1): **strong_candidate** {p004, p008, p018} · **candidate** {p020, p025} · **not_voiceworthy** {p010, p016, p030}. Required cross-tier order: strong > candidate > not_voiceworthy. Within-tier the gold has ties.

| variant | full ranking (high→low) | strong_min > candidate_max? | candidate_min > not_max? |
|---|---|---:|---:|
| v1 | p008 0.180 · p004 0.101 · **p018 0.049** · p020 0.045 · p025 0.045 · p016 0.025 · p010 0.015 · p030 0.005 | **YES** (0.049 > 0.045 — razor-thin margin 0.004) | YES (0.045 > 0.025) |
| v2 | p008 0.880 · p018 0.610 · **p004 0.530** · p025 0.380 · p020 0.360 · p016 0.200 · p010 0.130 · p030 0.030 | **YES** (0.530 > 0.380, clean gap 0.150) | YES (0.360 > 0.200) |
| v3 | p008 0.836 · p018 0.580 · p025 0.350 · p020 0.342 · **p004 0.159** · p016 0.036 · p030 0.028 · p010 0.021 | **NO** (0.159 < 0.350) — **p004 ranks below both utility candidates** | YES (0.342 > 0.036) |

## Low-confidence probe (synthetic) *(computed, required by spec)*

Constructed item: high magnitude **0.85**, low confidence **0.30**, close tier **0.9**, **medium** sensitivity, baseline relevance + timeliness. The 8 locked items don't include a high-mag / low-conf case; this probe tests whether the favored variant prevents over-voicing it.

| variant | arithmetic | probe score | vs strong_candidate band |
|---|---|---:|---|
| v1 | mag 0.85 × close 0.90 × rel 0.50 × time 0.50 | **0.191** | **above all** strong_candidates [0.049, 0.180] — probe out-voices the labeled real strong_candidates |
| v2 | 0.85 + 0.2·(0.90 − 0.5) + 0 + 0 | **0.930** | **above all** strong_candidates [0.530, 0.880] — probe out-voices everyone |
| v3 | (0.930 from v2) × conf 0.30 × sens_damper 0.80 (medium) | **0.223** | **within** strong_candidate band [0.159, 0.836] — probe placed below p008/p018 but above p004; damper does its job |

**Probe finding:** only v3 correctly prevents the low-confidence high-magnitude probe from out-voicing labeled strong_candidates. v1 and v2 both over-voice it.

## Diagnosis *(asserted)*

### What worked
- **v2 cleanly satisfies cross-tier ordering** with comfortable margins (0.150 between strong_min and candidate_max). The hierarchy-first base does what it was designed to: high magnitude items can't be vetoed by low closeness, and the over-suppression cluster {p018, p020, p025} all lift above the junk floor.
- **v3 cleanly handles the low-confidence probe.** It's the only variant of the three where a high-mag / low-conf item is held inside the labeled-strong-candidate band rather than out-voicing it. The damper machinery works.

### What broke
- **v3 violates cross-tier order on p004 specifically.** p004 has both high sensitivity (damper 0.6) AND low confidence (0.50). The two dampers stack multiplicatively (0.6 × 0.50 = 0.30), crushing its v2 base of 0.530 down to 0.159 — below both utility candidates (p020 0.342, p025 0.350). The doorway-route item ends up ranked lower than the followed-brand commercial.
- **Two readings of the same data, both honest:**
  1. **Bug:** the dampers are too aggressive. p004 is exactly the kind of high-care close-friend moment Drift exists to voice (gently). If the formula can't surface it, the whole "doorway" route is degenerate.
  2. **Feature:** routes are separate competitions. p004 ranks low on the global score because it's not competing in the same pool as p020/p025; its real competition is other doorway items (of which there is one in this slice). The cross-tier check expects a single ordering but the team's design language has always said routes are separate paths.
- The 8-item slice can't distinguish between these readings — there's only one doorway item and no doorway-vs-doorway contest. **Reading (2) would be confirmed by a larger slice with multiple doorway items where intra-route ordering is sensible even if their absolute scores look low.**

### v1 mostly works but at razor-thin margins
v1's cross-tier checks pass technically, but the gap between strong_min (p018 0.049) and candidate_max (p020/p025 0.045) is **0.004**. Any noise — a different magnitude read, a small rel/time change — flips the order. Not a robust shape. Also v1 keeps the over-suppression problem (p018/p020/p025 cluster at 0.045–0.049, indistinguishable from the junk floor 0.025).

### Where each variant fails the project intent
- v1 fails on **robustness** (margins too thin, the over-suppression problem from the original diagnosis persists) and on **probe** (over-voices high-mag/low-conf).
- v2 fails on **probe** (no damper machinery; over-voices anything with high magnitude regardless of confidence/sensitivity).
- v3 fails on **doorway ranking** (high-sens × low-conf double-damper crushes p004 below candidate-tier items).

## Recommendation *(asserted — decision is the team's)*

**Carry v3 forward to Step 1.3 (constant fitting), with the explicit understanding that the damper magnitudes are the thing to fit.** Rationale:

1. **v3 is the only variant where the probe behaves correctly.** A formula that over-voices low-confidence items at scale is a louder failure mode than a formula that under-voices one labeled item — the existential bar from `00-product-description.md` §7 is "tactless or unsupported line is unrecoverable." A formula that lets a confident-sounding hallucination through is worse than one that misses a close-friend moment.
2. **v3's failure on p004 is interpretable as damper-magnitude-tuning, not as wrong-shape.** Two paths visible in the data:
   - Lighter dampers: try `high = 0.8, medium = 0.9` and re-test. p004 at `0.530 × 0.50 × 0.8 = 0.212` would still trail v2 but climb above p020/p025 at 0.342/0.350? No — still 0.212 < 0.342. Even with `high = 1.0` (no sensitivity damper), p004 = `0.530 × 0.50 × 1.0 = 0.265`, still below the utility band. **So damper-tuning alone does not fix p004.** The binding constraint is p004's **confidence = 0.5** — a single multiplicative damper at 0.5 halves the base, and that's already enough to lose to undamped utility items.
   - **Asymmetric damper** (damper only kicks below baseline; conf above 0.5 = no damper, below 0.5 = scaled damping). p004 at `0.530 × min(1.0, conf/0.5) × sens_damper = 0.530 × 1.0 × 0.6 = 0.318` — closer but still trails. Asymmetric shape is a real candidate but it's a different formula, not a constant tweak.
3. **Or accept v3 as-is and pair it with route-aware ranking** for the eventual Layer 2 session programmer. The cross-tier check is voiceworthiness-based; routes are a separate concept. If the session programmer picks "best item per route" rather than "top N by global score," v3's p004 rank doesn't matter.
4. **Constant fitting in 1.3 must include damper choice as a degree of freedom**, not just α/β/γ. Without that, 1.3 can't address the p004 failure.

**One thing the team must decide before 1.3:** is the cross-tier check (voiceworthiness ordering) what the formula is supposed to satisfy globally, or is route-aware ranking the actual contract? The answer determines whether v3 needs an asymmetric damper or whether it's already correct under a different interpretation.

## Cited checks + unverified flags *(per `governance/reporting-standards.md`)*

| Claim | Protected by | Notes |
|---|---|---|
| "8 items load from cache" | Check 15 (smoke) — first meaning pass populates the cache | Cache state preserved across this run |
| "p002 consent-blocked" | Check 3, 4 (smoke) — p002 drops at consent gate | Excluded from this test |
| "v0.3.1 labels load" | Check 32 (smoke) — loadGoldLabels returns 10 labels | Confirmed by `goldLabels.size` |
| "no live API calls made" | Check 20, 27 (smoke) — RealMeaningClient refuses; this script uses CachedReadOnlyClient that throws | Verified by script structure |
| "current code does not apply confidence/sensitivity to scoring" | **unverified — no check covers this yet.** Reading of `scoring/scoringEngine.ts` confirms neither field is read; recommend adding a smoke check that asserts this if it becomes load-bearing for the formula discussion. | |
| "v2 with α=β=γ=0.2 cross-tier passes" | **unverified by smoke** (this script is one-off, not in the smoke suite). Reproducible via `npx tsx playground/scripts/formula-shape-test.ts`. | |
| "v3 doorway-ranking failure is damper-stacking, not shape" | **unverified — asserted by arithmetic** (0.530 × 0.50 × 0.6 = 0.159). Confirms by computation, not by a check. | |

## What's NOT done *(per the freeze — lifted only for this job)*

- Scoring engine code unchanged. `scoringEngine.ts` still implements the current multiplicative-with-boosters; none of v1/v2/v3 are wired into the bench.
- No threshold tuning.
- No constants beyond the starting priors flagged above (α=β=γ=0.2; sens_damper 1.0/0.8/0.6).
- No generation work, no instrumentation extensions, no live calls.
- Smoke 47/47 unchanged.

## How to reproduce

```bash
cd playground
npx tsx scripts/formula-shape-test.ts > /tmp/formula-shape-test.md
```

Zero model calls; reads disk cache, gold labels, listener fixture. Re-run anytime.

---

*End of report. Awaiting team direction on the cross-tier-vs-route-aware question before Step 1.3.*
