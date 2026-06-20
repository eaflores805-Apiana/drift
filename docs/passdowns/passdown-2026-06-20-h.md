# Passdown — 2026-06-20 (session H)
*CS Engineer. Filed Eng1's seed-items v0.2.0 (adds p041–p045) + the smoke patch from the handoff. Smoke now **51 pass / 0 expected-fail / 0 fail · exit 0**. Check 43 auto-cleared (XFAIL → PASS, no exemption removed). Live-meaning gate still PO's call.*

## What I did

1. **Filed `seed-items.json` v0.2.0** to `playground/data/seed-items.json` — adds 5 accounts + 5 items (p041 Rolling Pin Bakery / p042 Ventura County Library / p043 Ventura Farmers Market / p044 Harbor Threads / p045 Anacapa Middle School).
2. **Filed Eng1's handoff memo** to `docs/correspondence/eng1-seed-items-p041-p045-handoff-2026-06-20.md`.
3. **Applied the 4-line smoke patch** per the handoff: introduced `const N = items.length;` and switched Checks 1/15/16/17 to derive their counts from `N` (and `2*N` for the after-bump cache size in Check 17). Same "don't hardcode what you can compute" lesson as Check 43 — corpus growth no longer requires editing the smoke.

That's the whole turn. No code in `scoringEngine.ts`, no live calls, no formula touched.

## Reporting (measured, per `governance/reporting-standards.md`)

### The 4 patched checks under the new N=45 corpus
```
[PASS] Check 1:  All 45 seed items load  (got 45)
[PASS] Check 15: First meaning pass populates the cache (45 misses)  (size=45, misses=45, hits=0)
[PASS] Check 16: Second meaning pass reuses the cache (45 hits, 0 misses)  (size=45, hits=45, misses=0)
[PASS] Check 17: prompt_version bump invalidates cache (45 fresh misses)  (misses=45, hits=0, total size=90)
```

### Check 43 auto-cleared
```
[PASS] Check 43: every labeled id exists in seed-items.json (corpus integrity)
       (checked 15 labeled ids against 45 seed items)
```

Yesterday's `[XFAIL] missing: [p041, p042, p043, p044, p045]` is now `[PASS]`. **No exemption was added or removed** — the check went green because the underlying condition resolved, exactly the self-clearing behavior the harness was designed for.

### Summary (measured)

| | Before this turn | After |
|---|---:|---:|
| pass | 50 | **51** *(Check 43 promoted from XFAIL)* |
| expected-fail (XFAIL) | 1 | **0** |
| unexpected fail | 0 | **0** |
| total | 51 | 51 |
| exit code | 0 | **0** |

Typecheck clean. `npm run build` 245 KB / 72 KB-gzip.

### Bucket summary (measured)

`drop: 1 (p002) · ambient: 44 · voiced: 0 · expandable: 0`

Was: drop 1 · ambient 39. The 5 new items all reach scoring (per Eng1's design, `audience_scope: "public"` passes consent; they land ambient because they're not in `listener.closeness_map` so they default to closeness=0.2). No item rose to voiced or expandable, which is expected — the current bench formula is still the multiplicative-with-boosters baseline, not v3.

## What stays gated

Step 1.3 (constant fitting) is still blocked on two things, in order:

1. **Live meaning pass on p041–p045.** The five new items don't have cached meaning yet. The triple-gated live client is the right safeguard here — and per the user's Senior memo this turn, **opening the gate is a PO/environment decision, not CS's to self-authorize**, because flipping `ENABLE_LIVE_MEANING=true` + providing the API key is what turns on real API spend. Default call cap of 50 is fine for 5 items + retries (correcting my earlier "bump to 10" — moot at default).
   - When the gate opens, the run is one line: `npm run meaning:live -- --items p041,p042,p043,p044,p045`. Then I report back the cached magnitude / sensitivity / confidence for the five.
2. **Formula reconciliation.** TL's W_community ruling, then Eng1's v3 promotion in `rules-and-format.md` Part 3 (multiplicative marked superseded), then the Step 1.3 task spec gets rewritten as threshold fitting by route.

CS does **not** fit constants, wire v3 into `scoringEngine.ts`, or build the eligibility-structural check yet. The eligibility check is design-dependent on the W_community ruling and on Eng1's note that "magnitude is the real discriminator" (per the handoff) — can't write enforcement for a mechanism still under review.

## Design flags from Eng1's handoff (worth surfacing — asserted summary)

- **Closeness held constant by design.** New accounts are NOT in `listener.closeness_map`, so they default to *unknown* (0.2). Deliberate so that **magnitude becomes the single discriminator** Step 1.3 fits the route threshold against. Optional cosmetic move: add each `account_id` to `closeness_map` as `"followed"`; moves scores by ~0.02 under additive v3 — not load-bearing.
- **p044 uses `audience_scope: "public"` (consent vocabulary), not "commercial-promo" (label vocabulary).** Schema-vs-label tension made concrete: gold's descriptive strings are NOT the consent vocabulary. p044 correctly **passes consent** and lands ambient today; it only **drops** once the lower eligibility/magnitude floor is wired. *Do not "fix" by setting `commercial-promo` — that would drop at consent for the wrong reason and rob it of its job (testing the floor's blindness to the #ShopLocal disguise).*
- **Eligibility-stays-structural check (logged for Step 1.3 PR) needs to key on `source_type + magnitude`, not just `audience_scope`.** All five new items are `audience_scope: "public"`; civic-vs-commercial split is carried by `source_type` + magnitude. **Magnitude is the real discriminator** (achievement vs promo). Design the gate accordingly when TL rules.
- **p045 names four fictional minors in `raw_text` on purpose.** Has `entity { type: "minor" }` for the meaning/treatment layer. **Stripping happens at the on-air/treatment layer (Phase 3), not in the scorer** — don't expect Step 2 to do it.

## Self-audit (per `governance/reporting-standards.md`)

- *measured:* corpus count (45), smoke counts (51 pass / 0 xfail / 0 fail / exit 0), bucket counts (drop 1 / ambient 44 / voiced 0 / expandable 0), build size (245 KB / 72 KB-gzip). All reproducible by anyone with the repo at this commit.
- *measured:* the four `40 → N` patches landed in checks 1/15/16/17 (verifiable via `grep` for `=== N` in `scripts/smoke-test.ts`).
- *measured:* Check 43 transition XFAIL → PASS — bullet quoted above.
- *asserted:* "no other check moved" — based on the count diff (50 pass → 51 pass, +1 from the Check 43 promotion; XFAIL 1 → 0; total 51 → 51) plus scrolling the smoke output. If any prior check silently changed status, the exit code would still be 0 but the diff would show; nothing did.
- *unverified — no check covers this yet:* nothing programmatically asserts "no prior check changed status across two consecutive runs." Could add a diff-against-last-run check, but it's overkill for a single turn — flagging only.

## What's NOT done

- **No live API call.** Holding for PO to open the gate (`ENABLE_LIVE_MEANING=true` + key); per the user's framing memo this is not CS's call. Until then, p041–p045 have no cached meaning and the formula track also can't move on p042's magnitude question.
- **No formula change.** `scoringEngine.ts` untouched; v3 still in the standalone `formula-shape-test.ts`.
- **No spec promotion.** `rules-and-format.md` Part 3 still says multiplicative. Eng1's job after TL rules.
- **No eligibility-structural check.** Gated on TL's W_community ruling.
- **No `listener.closeness_map` edits.** Eng1 marked the constant-closeness as deliberate; cosmetic-only change otherwise.

## Repo state at end of turn
- Branch: `main`
- Remote: `https://github.com/eaflores805-Apiana/drift` (public — from session F)
- Local HEAD = Remote HEAD (verified in turn summary)
- `_INBOX/` empty
- Smoke: **51 pass · 0 expected-fail (51 total) · exit 0**
- Typecheck clean · build 245 KB
- Corpus: 45 items · gold labels: 10 `labels[]` + 8 `community_cluster[]` (15 unique ids, all in corpus)
