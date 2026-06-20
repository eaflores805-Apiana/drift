# Eng1 → CS / PO — Seed items p041–p045 (community cluster) authored & verified

> Eng1, 2026-06-20. Unblocks the corpus half of Step 1.3. Pairs with `gold-labels.json` v0.4.0 `community_cluster[]`.
> **Verified locally:** 45 items load with **zero** adapter warnings, JSON valid, **smoke 50/50** after one small smoke fix (below). The would-be corpus-integrity check (CS Check 43) now resolves green.

## What landed (`seed-items.json` → v0.2.0)

5 new accounts + 5 new items, matched to the ratified `community_cluster[]` intent:

| id | source (new account) | source_type | intent / gold disposition |
|---|---|---|---|
| p041 | Rolling Pin Bakery | brand | sourdough wins a State Fair blue ribbon — clear achievement → **voiced** community pride |
| p042 | Ventura County Library | local_org | literacy program reached 1,000 kids — the deliberate **maybe** (candidate, voiced-or-ambient) |
| p043 | Ventura Farmers Market | local_org | peak stone-fruit morning — low-side **ambient** local color |
| p044 | Harbor Threads | brand | "WEEKEND SALE 20% off #Ventura #ShopLocal" — the local-hashtag-disguise **drop** |
| p045 | Anacapa Middle School | local_org | science team takes 1st; **source names + pictures the four kids** → **voiced, group-level, names stripped** |

All `audience_scope: "public"`, `expires_at: null`, `location: "Ventura, CA"`, recent timestamps (within the fixed-now 24h window).

## CS actions on merge (in order)

1. **Commit `seed-items.json` v0.2.0.** (Or splice the 5 accounts + 5 items into your working copy — your call. The file here is the verified full version.)
2. **Patch 4 hardcoded count literals in `scripts/smoke-test.ts`.** Growing the corpus 40→45 trips Checks 1, 15, 16, 17 (they assert literal `40`). Verified fix — derive the count instead of bumping the literal (same "don't hardcode what you can compute" lesson as Check 43). Add once, near the top of the checks block:
   ```ts
   const N = items.length; // corpus size, derived — no hardcoded count
   ```
   Then:
   - Check 1: `items.length === 40` → `items.length === N`
   - Check 15: `stats1.size === 40 && stats1.misses === 40` → `=== N && === N`
   - Check 16: `stats2.size === 40 && stats2.hits === 40` → `=== N && === N`
   - Check 17: `stats3.misses === 40 && ... stats3.size === 80` → `=== N && ... === 2 * N`

   **Apply on top of your Check-43 version — do not overwrite it.** My clone predates Check 43, so I'm handing this as a described patch, not a file, to avoid clobbering your work. Verified: with this patch, smoke returns **50/50**.
3. **Check 43 (corpus-integrity) self-clears.** With p041–p045 now in the corpus, the XFAIL you added this turn flips XFAIL→PASS on its own. No exemption to remove — exactly the self-clearing behavior we designed.
4. **Then** `npm run meaning:live -- --items p041,p042,p043,p044,p045` (raise `MEANING_CALL_CAP` to ~10 for 5 items × one retry), **then** Step 1.3 — but Step 1.3 still gates on the formula reconciliation (TL's `W_community` ruling + the `rules-and-format.md` v3 promotion). Corpus is ready; the formula isn't yet.

## Eng1 design decisions — flagged, not buried (PO can override any)

- **Closeness held constant by design.** The new community sources are **not** in `listener.closeness_map`, so they default to *unknown* (0.2). Deliberate: it holds closeness ~constant across the whole cluster so **magnitude** (from the meaning pass) is the single discriminating variable Step 1.3 fits the route threshold against. To make them read as followed local institutions (0.3, like Buena/Ventura News), add each `account_id` to `closeness_map` as `"followed"` — but under additive v3 that moves scores by ~0.02, so it's cosmetic, not load-bearing.
- **p044 is `audience_scope: "public"`, not "commercial-promo".** This is the schema-vs-label tension from the repo review, made concrete: the gold's descriptive `audience_scope` strings ("commercial-promo", "public / local-civic") are **not** the consent vocabulary (`public` / `published` / `friends`). I used the consent vocabulary so the consent gate behaves correctly. Consequence: p044 **passes consent** and (with cached meaning) lands **ambient** under the current engine — same as p010/p016 — and only **drops** once the lower eligibility/magnitude floor is wired. Its drop is a floor decision, not a consent drop. Do not "fix" it by setting `commercial-promo` — that would drop it at the consent gate for the wrong reason and rob it of its job (testing the floor's blindness to the #ShopLocal disguise).
- **Eligibility-keying note (for CS's logged "eligibility-stays-structural" check).** That check can't key purely on `audience_scope == "public/local-civic"` — all five items are `"public"`. The civic-vs-commercial split is carried by `source_type` (local_org vs brand) **plus magnitude**. But note p041 (bakery, `brand`) is voiced community pride, so `source_type` alone doesn't gate community-eligibility either — **magnitude is the real discriminator** (achievement vs promo). Design the eligibility gate accordingly; it's downstream of TL's ruling.
- **p045 names four (fictional) minors in `raw_text` on purpose.** The fixture's entire value is verifying the DJ **strips** them (`group_level_STRIP_individuals`) even though the source hands them over with a photo. An `entity` of `type: "minor"` is attached to signal minor-involvement to the meaning/treatment layer. Stripping happens at the on-air/treatment layer (Phase 3), not in the scorer — flagging so nobody expects Step 2 to do it.
