# CS Engineer → Eng1, TL, PO — Step 1.3 deliverable: fitted route thresholds

**Date:** 2026-06-20
**Re:** `eng1-cs-task-step-1.3-fit-route-thresholds-2026-06-20.md`
**Status:** **Filed for review.** Thresholds fit, over-suppression resolved-for-good within fitted scope (community + doorway, excl. p045), probe regression still passes. Awaiting team accept.

---

## TL;DR

| route | fitted threshold | rule |
|---|---:|---|
| **doorway** | `0.100` | score ≥ 0.100 ⇒ voiced |
| **community** (highlight, community-pride flavor) | `0.532` | score ≥ 0.532 ⇒ voiced (the maybe is in) |

- **Over-suppression resolution:** 3/3 community gold-voiced items now voice (p018, p041, p042). 1/1 doorway gold-voiced item now voices (p004). 2/2 community gold-ambient items held below threshold (p043, p044). **Yes — shown by the math, not asserted.**
- **p045 (sens-damped, 0.336)** is flagged-and-excluded from the threshold search per spec; remains on the separate de-risk track. Step 1.3 does not address p045 by design.
- **Probe regression** (per ADR J1): v3 probe `0.223` ≤ strong_candidate v3 max `0.836` → **OK** (the global safety invariant still holds).
- **Smoke** still 51/51 PASS · 0 XFAIL · 0 fail · exit 0. Build clean. No code in `scoringEngine.ts` touched (this turn is fitting on the bench, not wiring).

---

## 1. Inputs (measured)

All v3 scores are **measured** from `playground/scripts/formula-shape-test.ts` run at HEAD this turn. The script reads:

- frozen cached meaning (`playground/.meaning-cache/`, 13 entries, gitignored — same set as the live pass in passdown-2026-06-20-i)
- locked gold (`playground/data/gold-labels.json` v0.4.0: 10 `labels[]` + 6 `community_cluster[]`)
- v3 canonical formula per `docs/03-rules-and-format.md` Part 3 (v0.2.0, promoted this turn)

The script is path-independent (anchors via `import.meta.url`), and the cache is read-only (the test client throws if a live judgment is requested — no model calls).

### Community cluster v3 scores (measured)

```
p018  0.580  voiced            strong_candidate   low
p041  0.560  voiced            strong_candidate   low
p042  0.532  voiced (the maybe) candidate         low
p045  0.336  voiced_at_group_level_only  strong_candidate   high   ← sens-damped
p043  0.180  ambient           not_voiceworthy    low
p044  0.129  drop              not_voiceworthy    low
```

(Reconciles to the table in `cs-community-cluster-scoring-table-2026-06-20.md`, commit `112e21c` — same numbers, no drift.)

### Doorway cluster v3 scores (measured)

```
p004  0.159  doorway, strong_candidate  (mag 0.45, close 0.90, conf 0.50, sens high)
```

Single labeled doorway item in v0.4.0 gold. Sens-damped (high) + confidence-damped (0.50) → 0.159.

### Silent-route v3 ceiling (measured, context only)

```
p016  0.036  silent, not_voiceworthy   (highest score among silent-route items)
p030  0.028  silent, not_voiceworthy
p010  0.021  silent, not_voiceworthy
```

Silent items live on a different route (per ADR J1, routes rank within themselves) so the doorway threshold doesn't bucket them. Shown for **margin context** only.

---

## 2. Fitting (computed)

### 2.1 Community threshold

**Spec rule (verbatim, from the Step 1.3 task spec §"What you actually do, in order"):**

> "Fit the threshold so p018 and p041 clear it (voiced community wins); p042 (0.532) sits as the genuine 'maybe' — at or just at the line."

**Boundary cases.** Three plausible threshold positions for p042:

| candidate threshold | p042 (0.532) bucket | p018 (0.580) | p041 (0.560) | rationale |
|---:|---|---|---|---|
| `0.532` | **voiced (at the line)** | voiced | voiced | "the maybe is in" — boundary case voiced by ≥ convention |
| `0.533` | ambient (just out) | voiced | voiced | "the maybe is out" — p042 holds at the line as ambient |
| `0.546` (mid of p041↔p042) | ambient | voiced | voiced | center-of-gap split; treats p042 as squarely ambient |

**Choice: `0.532` (the maybe is in).** Two reasons:
1. Spec wording "p042 sits at the line" + ≥ convention = at-the-line goes voiced.
2. Community gold dispositions are: p018 voiced, p041 voiced, p042 *"candidate (voiced-or-ambient — the maybe)"*. The "maybe" label is closer to *contingent voicing* than to *contingent ambience* — the literature in v0.4.0 PO notes treats the maybe as the inclusive boundary.

If team prefers "the maybe is out," flip to `0.533` — pure constant change, no formula or code shape change.

**Separation gap (computed):** `p042 (0.532) − p043 (0.180) = 0.352`. The fitted threshold sits ~0.35 above the noise ceiling — a flat threshold cleanly separates the cluster.

### 2.2 Doorway threshold

**Spec rule (verbatim):** "Doorway-route threshold → fit against the sensitive cluster (the locked labels: p004 etc.)"

**Constraint.** Only one labeled doorway item today (p004 at 0.159). The fit is underdetermined — any value in `(silent_ceiling, p004_score]` = `(0.036, 0.159]` satisfies the single-item constraint.

**Choice: `0.100`.** Two reasons:
1. **Comfortable margin both sides.** `+0.064` over silent ceiling (no silent item crosses); `−0.059` under p004 (p004 doesn't sit on the line). Either way, a calibration drift of ±0.05 in either direction wouldn't flip the bucket.
2. **Round number that survives p004's particular profile.** p004 is high-mag (0.45) but heavily damped (sens=high → 0.60, conf=0.50). New doorway items will tend to look like this — high-sens, confidence-uncertain — and `0.100` is below the band where damping is doing most of the work.

This is the threshold **most exposed to revision** when more doorway items land (single point underdetermines). Flagged for re-fit when p019-tier doorway items get labeled.

### 2.3 Why no W_community fitting

Per ADR J2 (this turn): no separate community floor constant. The community threshold (0.532) is the entire community-side fit. Step 1.3 fits route thresholds, not floor constants.

---

## 3. Bucket placement under fitted thresholds (computed)

### Doorway route (≥ 0.100)

| id | name | v3 | bucket | gold | match? |
|---|---|---:|---|---|---|
| p004 | Mateo rough week | 0.159 | **voiced** | strong_candidate (voiced) | ✓ |

### Community route (≥ 0.532)

| id | name | v3 | bucket | gold | match? |
|---|---|---:|---|---|---|
| p018 | Buena CIF | 0.580 | **voiced** | voiced | ✓ |
| p041 | Rolling Pin bakery wins | 0.560 | **voiced** | voiced | ✓ |
| p042 | Library 1k kids | 0.532 | **voiced (at the line)** | candidate / the maybe | ✓ (per spec convention) |
| p045 | Anacapa science team | 0.336 | ambient (under fit) | voiced_at_group_level_only | **N/A — deferred to de-risk track** |
| p043 | Farmers market peak | 0.180 | ambient | ambient | ✓ |
| p044 | Harbor Threads sale | 0.129 | ambient | drop | ✓ (drop handled upstream; ambient is the right under-threshold bucket) |

---

## 4. Over-suppression — resolved for good, shown (measured)

Pre-Step-1.3 (default settings, multiplicative-with-boosters), Check 42 confirmed **5 gold-voiced items scored ambient** (p004, p008, p018, p020, p025). That check still passes (it's instrumentation, not a regression).

Under fitted v3 + the two route thresholds, restricted to the fitted scope (community + doorway, excluding p045 per spec):

```
community gold-voiced (excl. p045): p018, p041, p042  →  voicing under fit: 3/3
community gold-ambient:              p043, p044        →  held ambient:      2/2
doorway gold-voiced:                 p004              →  voicing under fit: 1/1
```

**Resolved for good** within the fitted scope. The phrase "for good" carries the following load (per the spec):

- *Not asserted from a curve fit* — every bucket placement is the result of an arithmetic comparison against the fitted threshold, shown in §3.
- *Not gamed by a hand-picked threshold* — the community threshold sits at the spec-named boundary (`0.532` = p042's exact score = "the maybe"); the doorway threshold sits in the middle of an underdetermined band, not threading the needle.
- *No gold-voiced suppressed, no gold-ambient promoted, no gold-drop voiced.* Full count above.

**p045 is the explicit exception.** It is sens-damped from 0.560 (its undamped v3) to 0.336 by the `high → 0.6` multiplier. No route threshold in the community band of (0.180, 0.532] can pull p045 above the line without also pulling p043 (the ambient floor) above it. **p045's voicing is a damper question, not a threshold question** — handled separately on the earned de-risk recalculation track (TL ruling pending, `eng1-tl-proposal-derisk-recalc-2026-06-20.md`). p045 *not* being voiced under Step 1.3's fit is correct behavior per spec.

The other items still listed by Check 42 (p008, p020, p025) live on routes (highlight, utility) that aren't fit by Step 1.3 — they were never inside this PR's scope. Their resolution belongs to subsequent fitting passes on those routes.

---

## 5. Probe regression (measured)

Per ADR J1: the high-magnitude / low-confidence probe must never out-voice a strong_candidate.

```
probe v3 score:               0.223
strong_candidate v3 max:      0.836  (p008)
probe ≤ max (must pass):      OK
```

The probe sits **within** the strong_candidate v3 band — neither above (the failure mode the ruling prevents) nor below (which would mean the damper is over-suppressing). Step 1.3's fit does **not** change probe inputs and does **not** change strong_max → the assertion's pass/fail mechanics are unchanged.

This assertion will move from `formula-shape-test.ts` into `smoke-test.ts` as part of the v3 wiring PR (per passdown-2026-06-20-c §"Three things flagged for when Step 1.3 unblocks"), so every bench commit runs it. Not done this turn — fitting only.

---

## 6. Checks cited (measured)

- **Check 43 (corpus integrity, smoke):** PASS — 15 labeled ids ⊂ 45 seed items. No gold label points at a missing item. Means the community cluster the fit operates on is real, not a label-without-corpus phantom.
- **Probe regression (formula-shape-test):** PASS — see §5.
- **Cross-tier check (v3, formula-shape-test):** strong_candidate min `0.159` vs candidate max `0.532` → NO (as expected — p004's high sens+confidence damping suppresses it below candidates; ADR J1 explicitly accepts this and moves cross-route ordering to Layer 2). Reported, not a failure.

Two checks **still missing** at end of turn (flagged, do not block):

1. **`formula:test` npm script.** Currently the test runs via `npx tsx scripts/formula-shape-test.ts`. Adding an npm alias would make CI/handoff cleaner. Mechanical add; can land with the v3 wiring PR.
2. **Eligibility-structural smoke check.** Per spec §4: "the route-threshold gates fire only when audience_scope is public/local-civic AND magnitude is appropriate." Per passdown-2026-06-20-c §3.2, planned for the v3 wiring PR. Not load-bearing for Step 1.3's fit (this is bench arithmetic on labeled items, where eligibility is already settled).

---

## 7. Decision classes & escalation

| change | class | who decides |
|---|---|---|
| `COMMUNITY_THRESHOLD = 0.532` | Class 2 (CS-owned, asserted; spec named the boundary) | CS proposes, team accepts/revises |
| `DOORWAY_THRESHOLD = 0.100` | Class 2 (CS-owned, underdetermined fit) | CS proposes, team accepts/revises |
| v3 stays canonical, no W_community | Class 1 / ADR J2 (already ratified) | already decided this turn |
| Probe regression assertion lives in `formula-shape-test.ts` | Class 3 (escalate-if-changed) | unchanged this turn |

If either threshold is revised, change the two constants at the top of the Step 1.3 section in `formula-shape-test.ts` and re-run — no formula edit, no schema edit, no smoke wiring change.

---

## 8. Self-audit (per `governance/reporting-standards.md`)

- *measured:* all v3 scores in §1 quoted from `npx tsx playground/scripts/formula-shape-test.ts` run at HEAD this turn. Reproducible by anyone with the repo checked out, the cache populated (13 entries already on the machine), and `tsx` installed.
- *measured:* "smoke 51/51 PASS · exit 0" — verified by `npm run -s smoke` at end of turn. Output tail captured in the matching passdown.
- *measured:* Check 43 PASS, 15 labeled ids ⊂ 45 seed items — verbatim from smoke output.
- *computed:* the over-suppression resolution counts in §4 — three single-pass counts over the fitted scope.
- *computed:* separation gap `0.532 − 0.180 = 0.352` — single subtraction.
- *computed:* margins in §1 and §2.2 — single subtractions.
- *asserted:* the choice of `0.532` over `0.533` (the maybe-is-in vs maybe-is-out reading of the spec). The spec wording supports both; I picked one and flagged the alternative for trivial revision.
- *asserted:* the choice of `0.100` over any other value in `(0.036, 0.159]`. Single labeled doorway item underdetermines; rationale given in §2.2.
- *asserted:* "over-suppression resolved for good within fitted scope" is a claim about the **fitted scope** (community + doorway, excl. p045), not a claim about the whole corpus or the other routes. Highlight + utility routes aren't touched by Step 1.3 by design; their over-suppression status is unchanged.
- *unverified — no programmatic check covers this yet:* there is no smoke check today that asserts "the fitted thresholds in `formula-shape-test.ts` match the thresholds wired in `scoringEngine.ts`." Not load-bearing today (the constants aren't wired into the engine yet — Step 1.3 is bench-side fitting, not deployment). When the v3 wiring PR lands, that check should land with it.

---

## 9. What this turn unblocks (and doesn't)

**Unblocks:**
- **v3 wiring PR.** Two constants are now defensible: a community threshold the team can accept or counter, a doorway threshold the team can accept or counter. The wiring PR (`scoringEngine.ts` switch from current multiplicative-with-boosters to v3 + route thresholds) is the next bounded task.
- **Probe-assertion migration into smoke.** Trigger condition (v3 going live on the bench) is now imminent — once team accepts these thresholds, the migration belongs in the wiring PR.

**Doesn't unblock:**
- **p045's voicing.** Stays on the de-risk track, gated on TL ruling. Step 1.3 was not the right tool.
- **Highlight + utility route fitting.** Those routes weren't in Step 1.3's scope. Subsequent fitting passes per route, each with its own corpus discipline.
- **Layer 2 (session programmer).** Still on its own roadmap; Layer 1 isn't done — it's one route-fit closer to done.

---

## 10. Repo state at end of turn

- Branch: `main`
- Remote: `https://github.com/eaflores805-Apiana/drift` (public — for new Senior onboarding)
- Local HEAD = post-push (to be verified after push at end of turn)
- `_INBOX/` empty (4 inbox files filed earlier this turn: `03-rules-and-format.md` overwrite, ADR J2 source memo, Step 1.3 task spec rewrite, flowchart PNG)
- Smoke: **51 pass · 0 expected-fail (51 total) · exit 0**
- Typecheck: clean
- Disk cache: 13 entries (gitignored, on this machine)

---

— CS Engineer, 2026-06-20
