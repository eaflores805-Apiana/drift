# Passdown — 2026-06-19 (session O)
*CS Engineer. PO labels v0.2.0 filed. Diagnostic board freeze respected — type-only changes, no board features added. The new ground truth confirms the team's predicted failure mode: **every gold-voiced item is currently over-suppressed**.*

## What I did

- Filed `playground/data/gold-labels.json` v0.2.0 (10 labeled items, was 5; adds the v0.2.0 `route` field).
- Extended `GoldLabel` TypeScript type with optional `route?: GoldRoute` ("silent" | "highlight" | "doorway" | "utility") so JSON parses cleanly. **Code does not consume `route` yet** — per freeze; it's a label, not yet a route in code.
- Updated 2 existing smoke checks (p020/p025 are no longer label_review_needed — they're labeled now), added 5 new checks (32a, 39, 40, 41, 42) for the new ground truth.

No UI changes. No classifier changes. No scoring changes. No new live runs. Freeze respected.

## PO labels — v0.2.0 landscape

| item | desired_bucket | route | tone |
|---|---|---|---|
| p004 Mateo "rough week" | voiced | doorway | gentle |
| p008 Dana "got the job" | voiced | highlight | celebratory |
| p018 Buena CIF | voiced | highlight | celebratory |
| p020 Driftwood coffee drop | voiced | utility | playful |
| p025 Ventura street fair | voiced | utility | warm |
| p002 private DM | drop | silent | avoid |
| p010 Jordan vague junk | drop | silent | avoid |
| p016 Uncle Ray politics | drop | silent | avoid |
| p030 Kelp Surf generic promo | ambient | silent | neutral |
| p036 Jordan moving back | ambient | silent | warm |

PO _meta confirms: calibration seeds for p004/p010/p018 confirmed (lines matched the worked exemplars); added p008/p020/p025/p016 + resolved p030; p036 left as the open split-case.

The `route` field encodes the team's "highlight / doorway / utility / silent" hypothesis as machine-readable labels. **Not yet wired into scoring or the classifier** — per Team Lead's "do not pre-build formula routes yet."

## Smoke results — 46/46 PASS

Key new checks for the team's eventual formula discussion:

```
[PASS] Check 32: loadGoldLabels returns the labels (v0.2.0 has 10)
[PASS] Check 32a: GoldLabel includes the v0.2.0 'route' field (p004 route='doorway')
[PASS] Check 33: p004 detected as close_friend_over_suppression
[PASS] Check 34: p002 consent-dropped agrees with gold (drop/drop)
[PASS] Check 35: p020 now labeled — classified as over_suppression
[PASS] Check 36: p025 now labeled — classified as over_suppression
[PASS] Check 37: Junk/political/generic-promo don't trigger false-voice
[PASS] Check 38: Gold-comparison vocabulary distinct from safety palette
[PASS] Check 39: p008 (Dana close, life event) classified close_friend_over_suppression
[PASS] Check 40: p018 (Buena followed) classified over_suppression (NOT close_friend)
[PASS] Check 41: p030 + p036 both agree with engine (gold=ambient, engine=ambient)
[PASS] Check 42: All five gold-voiced items show as over_suppression at default settings
                 (5/5: p004/p008/p018/p020/p025 — flag for team formula discussion)
```

Typecheck clean. Vite build 241 KB / 71 KB-gzip in <450 ms.

## The headline finding — Check 42

**At default settings, the engine over-suppresses every gold-voiced item the PO labeled.**

| item | route | tier | closeness | mock score | mismatch type |
|---|---|---|---|---:|---|
| p004 Mateo | doorway | close | 0.9 | 0.091 | `close_friend_over_suppression` |
| p008 Dana | highlight | close | 0.9 | 0.091 | `close_friend_over_suppression` |
| p018 Buena | highlight | followed | 0.3 | 0.101 | `over_suppression` |
| p020 Driftwood | utility | followed | 0.3 | 0.068 | `over_suppression` |
| p025 Ventura News | utility | followed | 0.3 | 0.125 | `over_suppression` |

(Scores shown are mock-meaning, since the UI uses MockMeaningClient. Real-meaning scores for p004/p008/p018 from the live cache are slightly higher per the session-J comparison, but still all ambient.)

**Two distinct sub-failures show in the data:**

1. **Closeness ceiling for `followed`.** Every utility-route item is from a followed entity (driftwood, ventura_news), whose closeness=0.3 caps the score below threshold even with high timeliness and good magnitude. The current closeness map effectively says "things the listener follows aren't close enough to voice." That's the wrong shape for utility content.

2. **Threshold blocks close-friend gentle items.** p004 and p008 are close-friend (0.9), but the canonical 0.45 threshold + multiplicative formula keeps them below the bar. p008 (Dana getting the job) is a high-magnitude life event — the *least* surprising candidate for voicing — and it still falls short.

The route field gives the team three concrete shapes to consider:
- **doorway** (p004) — gentle, low-detail, route to relationship. Needs a path that respects sensitivity AND voices.
- **highlight** (p008, p018) — celebratory, bright. Needs the closeness × magnitude path to clear at high values.
- **utility** (p020, p025) — actionable, time-bound. Needs the timeliness × followed-tier path to clear.

All three currently route to silence. That's the polite-corpse failure mode named in evidence, not prose.

## What I did NOT do (freeze respected)

- No board features added.
- No classifier changes — the same `classifyComparison()` from session L; only the data is richer.
- No scoring formula changes.
- No new mismatch categories.
- No new visual surfaces (no `route` column, no filter, no chart).
- No live API call.
- No gold-label edits (PO wrote them; CS just filed).

The board now displays the new ground truth automatically through the existing surfaces:
- ItemCard's `<GoldComparison>` shows `mismatch — over_suppression` (or `close_friend_over_suppression`) on the 5 voiced items.
- DebugPanel's comparison summary now shows the by-type breakdown.

## Standing by

Per the freeze: scoring formula discussion is the next team-level conversation. CS does not propose formula changes; CS does not pre-build route-aware scoring. When the team is ready to reopen scoring, the diagnostic board + the v0.2.0 labels are the substrate the conversation runs on.

## Repo state at end of turn
- Branch: `main`
- Remote: `https://github.com/eaflores805-Apiana/drift` (private)
- Local HEAD = Remote HEAD (verified in turn summary)
- `_INBOX/` empty
- `playground/data/gold-labels.json` at v0.2.0 (10 labels, with `route`)
- `playground/.meaning-cache/` 8 entries (gitignored, unchanged)
- Smoke: 46/46 PASS · typecheck clean · build 241 KB
