# Passdown — 2026-06-20 (session J)

*CS Engineer. **Step 1.3 fit landed.** ADR J2 appended to the decision log (this turn ratifies the no-W_community ruling in code-of-record). v3 promoted to canonical in `rules-and-format.md` (Eng1 authored; CS filed). Route thresholds fit and shown: doorway 0.100, community 0.532. Over-suppression resolved-for-good within fitted scope (excl. p045 on de-risk track). Probe regression still OK. Smoke 51/51 · 0 XFAIL · exit 0.*

## What I did

1. **Filed 4 inbox docs from PO/Eng1 (binding move-forward):**
   - `docs/03-rules-and-format.md` overwritten with v3 canonical (Eng1's v0.2.0).
   - `docs/correspondence/eng1-cs-task-step-1.3-fit-route-thresholds-2026-06-20.md` — the rewritten Step 1.3 task (single deliverable: fit thresholds, not floor constants).
   - `docs/correspondence/eng1-adr-j2-no-w-community-2026-06-20.md` — source memo for ADR J2.
   - `docs/drift-current-state-flowchart.png` (731 KB project map).
2. **Appended ADR J2** to `docs/07-decision-log.md` after J1's build-map note. Records the ruling, the reason (additive v3 base removes the multiplicative closeness veto W_community existed to counter), the formula shape that stands, the Step 1.3 implication (fit route thresholds, not floor constants), and the explicit non-impact on ADR J1, the absolute safety gates, and the probe regression.
3. **Extended `playground/scripts/formula-shape-test.ts`** with a Step 1.3 — Fitted route thresholds section. Two new constants: `DOORWAY_THRESHOLD = 0.100`, `COMMUNITY_THRESHOLD = 0.532`. Doorway-route bucket table + silent-route margin context. Community-route bucket table for all 6 items with p045 flagged-and-excluded. Over-suppression resolution count (3/3 community gold-voiced under fit, 2/2 community gold-ambient held, 1/1 doorway gold-voiced under fit). p045 noted as deferred-to-de-risk-track.
4. **Filed the deliverable** at `docs/correspondence/cs-step-1.3-route-threshold-fit-2026-06-20.md`. Sections 1–10: inputs, fitting with boundary-case table, bucket placement, over-suppression resolution (shown not asserted), probe regression confirm, checks cited, decision classes, self-audit (measured/computed/asserted/unverified tagged), what unblocks, repo state.

## Results (measured — from the actual run at HEAD this turn)

### Doorway route (threshold ≥ 0.100)

```
p004  v3=0.159  ≥ 0.100  →  voiced  ✓
silent-route ceiling (context): 0.036  →  margin +0.064
```

### Community route (threshold ≥ 0.532)

```
p018  v3=0.580  ≥ 0.532  →  voiced  ✓
p041  v3=0.560  ≥ 0.532  →  voiced  ✓
p042  v3=0.532  ≥ 0.532  →  voiced (the maybe is in)  ✓
p045  v3=0.336  <  0.532 →  ambient  (deferred — de-risk track, not Step 1.3's job)
p043  v3=0.180  <  0.532 →  ambient  ✓
p044  v3=0.129  <  0.532 →  ambient  ✓ (drop is upstream)
```

### Over-suppression resolution

```
community gold-voiced (excl. p045): p018, p041, p042  →  3/3 voicing
community gold-ambient:              p043, p044        →  2/2 held below
doorway gold-voiced:                 p004              →  1/1 voicing
```

**Resolved for good** within the fitted scope (community + doorway, excl. p045) — every bucket placement is the result of an arithmetic comparison, not a curve fit or a hand-picked threshold.

### Probe regression (ADR J1)

```
probe v3:                     0.223
strong_candidate v3 max:      0.836
probe ≤ max (must pass):      OK
```

Probe sits within the strong_candidate band — not above, not below. Safety invariant intact.

### Smoke

```
51 pass · 0 expected-fail · 0 fail · exit 0
```

Check 43 (corpus integrity, XFAIL'd in session G) is now **PASS** — community cluster fully landed; no labeled id is missing from corpus.

## Self-audit (per `governance/reporting-standards.md`)

- *measured:* all v3 scores quoted from `npx tsx playground/scripts/formula-shape-test.ts`. Reproducible from a clean clone + populated cache + `tsx`.
- *measured:* smoke 51/51 PASS from `npm run -s smoke` tail.
- *measured:* Check 43 PASS (15 labeled ⊂ 45 seed).
- *measured:* typecheck clean from `npm run -s typecheck` (no output ⇒ no diagnostics).
- *computed:* the over-suppression resolution counts and the separation gap (0.532 − 0.180 = 0.352) and the silent-margin (+0.064) — single subtractions and counts over the rows.
- *asserted:* the choice of `0.532` (maybe-is-in) over `0.533` (maybe-is-out) — spec wording supports both; flagged for trivial revision.
- *asserted:* the choice of `0.100` (vs anything in `(0.036, 0.159]`) — single labeled doorway item underdetermines; rationale in deliverable §2.2.
- *asserted:* "resolved for good" claim scoped to community + doorway (excl. p045). Highlight + utility routes weren't in Step 1.3's scope.
- *unverified — no programmatic check covers this yet:* no smoke assertion that fitted thresholds in `formula-shape-test.ts` match thresholds wired in `scoringEngine.ts`. Not load-bearing today (engine not wired to v3 yet); should land with the wiring PR.

## What this turn unblocks

- **v3 wiring PR.** Engine switch from current multiplicative-with-boosters to v3 + route thresholds, with probe-assertion migration into smoke and the eligibility-structural check (passdown-2026-06-20-c §3) landing alongside. Both constants are now defensible.
- **The decision log is now self-consistent with the formula doc.** Anyone reading `07-decision-log.md` end-to-end sees J1 (route-aware ranking) and J2 (no W_community) ratified; `03-rules-and-format.md` Part 3 reads v3 as the live formula. No "where's the latest formula?" question for the next session.

## What stays gated

1. **Team accept on the two fitted thresholds.** Either can be revised by changing a single top-of-section constant in `formula-shape-test.ts` — no formula or schema change.
2. **TL ruling on p045's de-risk recalculation.** Stays on its separate track.
3. **v3 wiring into `scoringEngine.ts`.** Belongs to the next bounded task; not in scope this turn.

## What's NOT done (per spec discipline)

- No `scoringEngine.ts` change. Step 1.3 was bench-side fitting, not deployment.
- No probe-assertion move into smoke (belongs to the wiring PR).
- No eligibility-structural smoke check (belongs to the wiring PR).
- No new `npm run formula:test` alias (mechanical; can land with the wiring PR).
- No live calls.
- No board / UI changes.

## Repo state at end of turn

- Branch: `main`
- Remote: `https://github.com/eaflores805-Apiana/drift` (public — for new Senior onboarding, per session F)
- Local HEAD = to be verified post-push (this passdown is written pre-push; the verify line appears in the push report below or in the next session preamble)
- `_INBOX/` empty
- Smoke: **51 pass · 0 expected-fail (51 total) · exit 0**
- Typecheck: clean
- Build: not re-run this turn (no `src/` change)
- Disk cache: 13 entries (gitignored, on this machine)

— CS Engineer, 2026-06-20
