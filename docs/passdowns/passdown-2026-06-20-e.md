# Passdown — 2026-06-20 (session E)
*CS Engineer. Filed v0.4.0 of the Layer 2 break-structure spec (was v0.2.0). Doc-only update — Layer 2 is still scoped as not-yet-built. No code action.*

## What changed

Replaced `docs/09-break-structure-spec.md` v0.2.0 with v0.4.0. Two version jumps. The spec's own change-notes (preserved at the top of the file):

- **v0.3.0** — added the airtime budget measured in **weighted units of listener load** (not seconds): the fail-if-over-units rule, v0 unit-cost + break-budget tables, and the grave/sensitive **"owns the break"** hard rule that sits *above* the arithmetic.
- **v0.4.0** — added **residual load** + **recovery arc** (load *across* breaks): cognitive dose decays-but-never-auto-resets, the dual check (a break can pass its own budget and still fail on session pressure), grave as a hard cross-break cooldown (not a computed decay), count-based v0 decay (mood-aware decay parked), the recovery arc (earn back to brighter on **fresh content only**, never replay), and the hard guardrail that this is **show-state memory**, *NOT* listener-mood inference.

## Notable design decisions worth surfacing (asserted summary)

These don't affect bench code today, but they signal where Layer 2 is headed:

1. **Airtime budget is cognitive load, not seconds.** Per-content-type unit costs (sensitive doorway = 2; grave = owns the whole break; music backsell = 0.5–1). Per-break budgets (standard = 2–3 units; top-of-hour = 4–5.5). A break fails if it exceeds the *unit* budget even when under the *time* budget.
2. **Grave-as-hard-rule beats arithmetic.** A grave beat next to even one light item is a tonal failure *regardless* of whether the math has room. Stated explicitly because "weighted units" alone can be gamed by a budget that happens to allow it.
3. **`residual_load` is computed only from emitted output.** The spec is explicit about the line: this is "memory of the *show's own pacing*, NOT inference of the listener's mood." The forbidden version is *"the listener is sad now, so adjust"*; the correct version is *"the session just aired a high-dose sensitive item, so reduce density for the next break."* Same safety floor as the "texture about the world, never invention about the soul" rule, applied at session scope.
4. **The dual check.** `break_dose ≤ break_budget` AND `break_dose + residual_load ≤ pressure_limit`. Catches the failure mode where every per-break decision passes and the whole hour still feels exhausting.
5. **Recovery climbs back on FRESH content, never replay.** The natural-but-wrong instinct after a sad beat is to recycle Jake's job or Buena's CIF for warmth. That's a no-repeat violation by design. Recovery uses music + new content + tonal warmth — not re-airing prior beats for emotional lift.
6. **"One faculty, two uses."** No-repeat tracking + residual-load meter are *the same kind of thing*: the show's memory of its own output. Both deterministic, both auditable, both on the safe side of the privacy/mood floor.

## Scope per the spec itself (unchanged)

The spec restates its own scope rule:
> *"Layer 2. It is **not built yet** and **must not be built** until Layer 1 (item judgment) reliably ranks candidates — you cannot assemble a good break until the engine can tell a strong candidate from a weak one. This spec is the target the session programmer is built toward, not a current work item."*

So this update doesn't unlock any CS build work. The freeze on Layer 2 stays. The bench remains a Layer 1 instrument; v3 with route-aware ranking is still the active Layer 1 conversation, gated on PO p041–p045 items.

## Self-audit (per `governance/reporting-standards.md`)

- *measured:* file size 25 KB (was 5.5 KB at v0.2.0); version line at line 4 of the new file reads `v0.4.0 · 2026-06-19`. Verifiable via `wc -c docs/09-break-structure-spec.md` and `head -4`.
- *measured:* inbox empty after `mv`; only its own `README.md` remains.
- *asserted:* the six "notable design decisions" summary above is my read of the spec — pointer for future-CS sessions reading this passdown, not a re-derivation.
- *unverified — no check covers this yet:* nothing in the bench enforces the Layer 2 unit-budget, the residual-load decay, or the show-state-not-mood guardrail; the spec is a target, not yet a constraint. When Layer 2 is built (post-Layer-1, post-generation), each of those will need its own enforcement mechanism + smoke check.

## What's NOT done (per the freeze + the spec's own scope)

- No code changes. `scoringEngine.ts` unchanged.
- No Layer 2 implementation work.
- No live calls. No board changes. No new mismatch types.
- Step 1.3 still blocked on PO p041–p045 seed items (separate gate, not this turn's content).

## Repo state at end of turn
- Branch: `main`
- Remote: `https://github.com/eaflores805-Apiana/drift` (private)
- Local HEAD = Remote HEAD (verified in turn summary)
- `_INBOX/` empty
- `docs/09-break-structure-spec.md` at v0.4.0
- Smoke: 50/50 PASS (unchanged — no code path touched)
