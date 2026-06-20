# Passdown — 2026-06-20 (session G)
*CS Engineer. Added the labeled-but-not-in-corpus smoke guard (Check 43) per Eng1's bounded task. Smoke harness gained an XFAIL status so the expected blocker is recorded honestly without rotting into a green-by-exemption. Freeze respected — no scoring, no behavior change.*

## What I did

1. **Added an `xfail` status to the smoke harness** (`playground/scripts/smoke-test.ts`):
   - New `recordXFail(name, note)` helper.
   - Three-state results: `pass | fail | xfail`.
   - Summary line distinguishes: `N pass · M expected-fail · K UNEXPECTED FAIL (total)`.
   - **Exit code is non-zero only on unexpected fail.** XFAIL doesn't break the suite; the check turns green on its own when its blocker clears (no whitelist to forget about).
2. **Added Check 43 — corpus-integrity guard:**
   > For every entry in `gold-labels.json` (`labels[].item_id` ∪ `community_cluster[].id`), assert the id exists in `seed-items.json`. Skip underscore-prefixed meta keys.
   - Generic by construction — no hardcoded ids, no whitelist.
   - Uses the existing `loadGoldLabels()` + `loadCommunityCluster()` loaders, so meta keys are filtered upstream automatically.

## Report back (per the task's "Report back" line)

### Missing-id list (the check's actual output, measured)

```
[XFAIL] Check 43: every labeled id exists in seed-items.json (corpus integrity)
  missing in corpus: [p041, p042, p043, p044, p045].
  clears when these land in playground/data/seed-items.json
  (Step 1.3 corpus authoring, per passdown-2026-06-20-d item 4).
```

Exactly the 5 ids the v0.4.0 merge introduced and that don't have seed entries yet. Generic check; no hardcoding; the list will shrink to zero on its own as items are added.

### Typecheck

```
> drift-playground@0.1.0 typecheck
> tsc --noEmit
```
Clean. No diagnostics.

### No other check moved (measured)

Smoke counts:

| | Before this PR | After |
|---|---:|---:|
| pass | 50 | 50 |
| expected-fail (XFAIL) | 0 | 1 *(new Check 43)* |
| unexpected fail | 0 | 0 |
| total | 50 | 51 |
| exit code | 0 | 0 |

Every prior check still passes. The diff is purely additive.

### Build

`npm run build` clean — 242 KB / 72 KB-gzip. Same numbers as before.

## Self-audit (per `governance/reporting-standards.md`)

- *measured:* the XFAIL line above is verbatim from `npm run smoke`. Reproducible by anyone with the repo checked out at this commit.
- *measured:* exit code 0 — verified via `npm run smoke > /dev/null 2>&1; echo $?`.
- *measured:* typecheck output verbatim above.
- *measured:* 50 pass / 1 xfail / 0 fail / 51 total — counted from results array in the final summary line.
- *asserted:* "no other check moved" — based on the count comparison + scrolling the smoke output and seeing the same PASS lines as before. If a real regression slipped in elsewhere, the exit code would have been 1 (and someone reading this report could verify by running smoke locally).
- *unverified — no check covers this yet:* nothing programmatically asserts that "the only XFAIL is the corpus-integrity one." If a second XFAIL gets added later and the first one resolves, the suite could carry a stale expected-fail without anyone noticing. **Not a problem today (one XFAIL, fresh and clearly named), but worth knowing if XFAIL becomes a pattern.**

## Freeze-safety (asserted)

- Pure data-consistency check; no model calls.
- `scoringEngine.ts` untouched (not even imported by the new check).
- No threshold or formula touched.
- No new mismatch categories in the classifier.
- No board / UI changes.
- No live calls.

## What this check unlocks (and doesn't)

**Unlocks:**
- The "passdown prose only" status of the p041–p045 corpus gap is now recorded in the suite. Anyone running `npm run smoke` sees exactly which ids are missing and where they should land. The blocker can't be forgotten between sessions.
- Future merges that introduce labels for non-existent items will trip this check at PR time, not three sessions later.

**Doesn't unlock:**
- Step 1.3 fitting (still gated on the items existing + a live meaning pass).
- The community floor design (gated on TL's Option-A / Option-B ruling on `rules-and-format.md` Part 3).
- The probe migration into smoke (stays in the Step 1.3 PR; belongs with v3 going live).
- The eligibility-stays-structural check (waits on the floor ruling; can't write enforcement for a mechanism still under review).
- p041–p045 authoring (Eng1 / PO judgment, not a CLI task).

## What's NOT done (per the bounded scope)

- No corpus authoring (explicitly Eng1's / PO's job per the task spec).
- No v3 wiring.
- No probe-migration into smoke.
- No eligibility-floor check.
- No live calls.

## Repo state at end of turn
- Branch: `main`
- Remote: `https://github.com/eaflores805-Apiana/drift` (public — from session F earlier today)
- Local HEAD = Remote HEAD (verified in turn summary)
- `_INBOX/` empty
- Smoke: **50 pass · 1 expected-fail (51 total)** · exit 0 · typecheck clean · build 242 KB
- The XFAIL self-clears when p041–p045 land in `playground/data/seed-items.json`.
