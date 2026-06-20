# Passdown — 2026-06-20 (session B)
*CS Engineer. Step 1.1 closed; route-aware ranking ADR J1 filed; v3 carried forward; probe is now a permanent regression in `formula-shape-test.ts`. Step 1.3 standing-by on PO community-cluster labeling.*

## What I did

- **Filed the team ruling** at `docs/correspondence/team-route-aware-ranking-ruling-2026-06-20.md`.
- **Added ADR J1** to `docs/07-decision-log.md` (new Section J — Layer 1 engine architecture decisions, Phase B). Records the binding scoring contract, the p004 resolution, the invariants, and the Step 1.3 direction.
- **Added a regression assertion** to `playground/scripts/formula-shape-test.ts`: if any future damper tweak lets the v3 probe out-voice the strong_candidate band, the script exits 1 with a named violation pointing at ADR J1. Verified passing now: probe 0.223 ≤ strong_max 0.836.
- **Fixed a cwd bug in the script** (asserted): cache path was `resolve(".meaning-cache")` which broke when the script was run from any cwd other than `playground/`. Now anchored to the script's own directory via `import.meta.url`, so it works from anywhere. *(Caught in this turn while re-running to verify the regression assertion.)*

## Headlines from the ruling (asserted summary)

- **v3 additive-with-dampers** is the carried-forward shape. v1 and v2 not to be reopened.
- **No asymmetric dampers** to "rescue" p004 globally. CS's Step 1.1 recommendation suggested either asymmetric dampers OR route-aware ranking; the team chose route-aware ranking. The asymmetric-damper path is closed.
- **Voiceworthiness is route-local. Safety is global.** Within each route: `strong_candidate > candidate > not_voiceworthy`. Across routes: no strict global ordering required.
- **The high-mag / low-conf probe is a permanent regression test.** Protects the global safety property: *low-confidence high-magnitude items must never out-voice safe well-grounded candidates simply because magnitude is high.*
- **Layer 2** (session programmer) now formally owns cross-route airtime competition. Doesn't change build order; documents a future dependency.

## What this changes for me

| Was | Now |
|---|---|
| "Open question: cross-tier vs route-aware ranking?" (from Step 1.1 report) | **Closed.** Route-aware. |
| "Recommend v3 carry forward with damper magnitude as a degree of freedom" | **Confirmed.** Step 1.3 fits constants by route. |
| "p004 fails v3 cross-tier" | **Not a failure under the accepted contract.** Was the wrong test shape. |
| "Asymmetric damper path" | **Closed.** |
| Probe in one-off script only | **Regression-asserted in script** until v3 is wired into the bench (post-1.3), at which point it becomes a real smoke check. |

## Self-audit (per `governance/reporting-standards.md`)

- *measured:* probe 0.223 and strong_max 0.836 (`npx --package=tsx -- tsx playground/scripts/formula-shape-test.ts`, see tail of output). Asserted relationship `0.223 ≤ 0.836` holds.
- *measured:* typecheck clean on the script changes (`npm --prefix playground run typecheck`).
- *computed:* the ADR J1 narrative draws on the Step 1.1 arithmetic in `cs-formula-shape-test-report-2026-06-19.md`. All numbers there are reproducible via the same script.
- *asserted:* the script-bug diagnosis (cwd-dependence on `resolve(".meaning-cache")`). Verified by reproduction — script printed `v3StrongMax: -Infinity` when run from repo root, confirming no items loaded; printed normal results from `playground/` cwd; now works from both after the fix.
- *unverified — no check covers this yet:* the regression assertion lives only in `formula-shape-test.ts` (a one-off script), not in the bench smoke suite. **When v3 replaces the current scoring (post-1.3), this assertion must move into `playground/scripts/smoke-test.ts` so it runs on every bench commit.** Flagged here so it doesn't get forgotten.

## What's NOT done (Step 1.3 gated)

- **No formula change to `scoringEngine.ts`.** The bench still runs the current multiplicative-with-boosters formula. v3 lives only in the standalone script.
- **No constant fitting.** That's Step 1.3, gated on the PO community-cluster labeling.
- **No new live calls.**
- **No board changes.**
- Smoke still 47/47 (no bench code touched).

## What to do when Step 1.3 unblocks

Per ADR J1, when the PO community-cluster labels land:

1. Fit constants by route (not by global ordering).
2. Keep absolute safety gates outside the score.
3. The probe must pass.
4. Cross-route choice is deferred to Layer 2 — do not try to encode it in Layer 1.
5. Do not tune v3 to make p004 beat utility globally.

## Repo state at end of turn
- Branch: `main`
- Remote: `https://github.com/eaflores805-Apiana/drift` (private)
- Local HEAD = Remote HEAD (verified in turn summary)
- `_INBOX/` empty
- Smoke: 47/47 PASS (unchanged — no bench code touched)
- `playground/scripts/formula-shape-test.ts` is now cwd-independent and self-asserts the probe property
