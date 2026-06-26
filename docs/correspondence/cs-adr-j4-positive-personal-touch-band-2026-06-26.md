# ADR J4 — Positive Personal Touch band + exclusion bands for realistic friend-feed calibration

**Date:** 2026-06-26
**Author:** CS Engineer (implementation)
**Decision class:** ESCALATE-IF-CHANGED / **Class 1** (changes what may be voiced)
**Status:** Implemented on `box8-grounding-gate`; ratification by Eng1/Eng2 pending.
**Supersedes nothing; refines:** ADR J1 (route-local ranking), ADR J2 (highlight carries personal + community pride under one bar), ADR J3 (utility deferred).

---

## 1. What prompted this

The first run of Drift's brain on a realistic synthetic friend-feed (`world ventura-v2`, 57 posts, live Sonnet meaning pass) voiced **2 of 57** posts — and they were the **wrong two**. The DJ would have aired routine venting while staying silent on genuine good news:

| Post | meaning mag | old route | score | old bar | old result |
|---|---|---|---|---|---|
| Nico — first-ever surf podium | 0.65 | highlight | **0.528** | 0.532 | ❌ ambient (missed by 0.004) |
| Lena — gallery opening night | 0.65 | highlight | 0.527 | 0.532 | ❌ ambient |
| Sam — passed cert exam | 0.55 | highlight | 0.468 | 0.532 | ❌ ambient |
| Mark — pitch win | 0.55 | highlight | 0.390 | 0.532 | ❌ ambient |
| Dana — kid cross-country logistics | 0.25 | doorway | 0.172 | 0.100 | ✅ **voiced** |
| Sam — "design files corrupted, cool cool cool" | 0.25 | doorway | 0.132 | 0.100 | ✅ **voiced** |

*(scores: measured from `runs/world-brain/decisions-ventura-v2.json`, pre-J4 run.)*

**Root cause = a route-taxonomy gap, not a generation bug and not a threshold that needs nudging.** Two structural facts collided:

1. The old classifier sent **every** low-sensitivity personal post to `highlight` (48/57), gated by the community-pride bar **0.532**. That bar was fitted on the old 50-item seed corpus where community-pride items sit at 0.56–0.58; it does not transfer to a friends-feed where genuine personal highlights cluster at **0.45–0.53 — right under it**.
2. The old classifier sent **every** medium-sensitivity personal post to `doorway` (bar 0.100), so routine stress squeaked through while good news died.

Hand-dropping 0.532 to rescue Nico would have been overfitting one data point. The real fix is taxonomy.

## 2. Decision (TL direction + PO refinements, 2026-06-26)

Add a **treatment-band layer** between the structural route and the voiced bar:

- **`positive_personal_touch`** (highlight-family) — ordinary personal wins the community-pride bar buried. Voiced-eligible on **its own** bar (0.30), distinct from community pride (0.532) even though both share the `highlight` route.
- **`community_highlight`** — community / civic / brand-pride. Keeps the fitted **0.532** bar (unchanged).
- **`doorway_sensitive`** — genuine sensitive / relationship-check. Keeps the **0.100** bar (unchanged).
- **`mild_stress`** — EXCLUSION/ambient. Routine medium-sensitivity venting. Off the mic unless substantive enough to escalate to `doorway_sensitive`.
- **`everyday_texture`** — EXCLUSION/ambient. Low-value personal chatter.
- **`utility` / `silent`** — as before; no voiced bar today.

**Route semantics are unchanged** (highlight = positive/pride, doorway = gentle/sensitive, utility = time-bound, silent = no mic). Bands are a finer grouping *over* the 4-value gold route vocabulary; `Decision.route` still emits one of the 4 gold routes.

### PO refinements honored

1. **Closeness is NOT a second gate.** Per refinement #1, closeness already lives in the v3 score; band classification does **not** re-apply it (no double-damp). The `mild_stress → doorway_sensitive` escalation is keyed on **magnitude (substance), not closeness**. A closeness-based second gate would require team sign-off — not coded. Closeness modulates **treatment depth** (block size) at the packet stage, downstream of here.
2. **Thresholds are demo scaffolding.** Every J4 magnitude floor and band threshold is stamped, in code, `FITTED ON WORLD VENTURA ONLY — INVALID FOR PRODUCTION — RE-DERIVE ON A HUMAN / REALISTIC CORPUS`.
3. **Success is structural, not six-item bingo.** Verified against the 7 criteria below, not against whether each named example lands exactly as predicted.

## 3. Implementation

- **New** `playground/src/scoring/bands.ts` — `Band` type, `classifyBand(item, meaning)`, `BAND_ROUTE`, `DEFAULT_BAND_THRESHOLDS`, the two magnitude floors. Deterministic; reads only structural fields + meaning pass `sensitivity`/`magnitude`. Does **not** switch on `meaning.category` (it is free-form text on the live run, e.g. "close-friend creative event / art opening" — unswitchable). High sensitivity continues to mean real weight → `doorway_sensitive`, so a future grave-but-low-sensitivity item cannot land in a celebratory band.
- **`scoringEngine.ts`** — `scoreOne` now classifies the band, derives `route = BAND_ROUTE[band]`, and resolves the bar **band-first**: `settings.bandThresholds[band] ?? settings.routeThresholds[route]`. New `bandThresholds` field on `ScoringSettings` (default `{ positive_personal_touch: 0.30 }`). `band` added to the `Decision` and the reason string.
- **`routeClassifier.ts`** — `hasNearTermExpiry` exported for reuse; `classifyRoute` itself **untouched** (still used by smoke Check 45).
- **`schemas.ts`** — `Decision.band?: string` (free-form, to avoid enum coupling with the 4-value gold `Route`).
- **`scripts/world-brain-run.ts`** — reports band distribution + `band→voiced`.

### Threshold derivation (not overfit)

- `POSITIVE_TOUCH_MAG_FLOOR = 0.40` *(asserted, World-Ventura-only).* Genuine wins sit at mag 0.45–0.65; texture at ≤0.35. 0.40 sits in the **wide** gap.
- `positive_personal_touch` bar `= 0.30` *(computed/asserted).* Derived from the band's own magnitude floor under typical damping — the mag≥0.40 membership gate does the selecting; the bar is a light backstop. On World Ventura the nearest excluded items are in *other* bands, so nothing sits between 0.30 and the win cluster (0.365–0.528): this threads no two items.
- `MILD_STRESS_DOORWAY_MAG = 0.50` *(asserted, World-Ventura-only).* No medium-sensitivity personal post on this feed reaches it; future-proofs against burying a substantive sensitive moment.

## 4. Verification

**Deterministic guard — bench smoke: 53 pass / 0 fail / 0 xfail (`npx tsx scripts/smoke-test.ts`).** Typecheck clean (`tsc --noEmit`). Notably preserved by design (mismatch classifier keys on bucket/closeness/sensitivity/magnitude/source_type, never route):
- Check 33: p004 ("rough week", close) → high sensitivity → `doorway_sensitive` → **still voices**.
- Checks 39/40: p008 / p018 still over-suppressed under mock (mock mag crude); mismatch types unchanged.
- Check 45: `classifyRoute` determinism/fail-closed intact.

**World-Ventura rerun (cached meaning, 0 API calls — 57 hits / 0 misses).** Voiced **6 of 57**, all `positive_personal_touch`:

```
buckets:     {"ambient":51,"voiced":6}
bands:       {community_highlight:20, mild_stress:5, everyday_texture:22, silent:4, positive_personal_touch:6}
band→voiced: {positive_personal_touch:6}
```

| # | Success criterion | Result |
|---|---|---|
| 1 | Nico podium + Lena opening no longer miss on the old bar | ✅ both voice (0.528, 0.527) |
| 2 | Some ordinary positive milestones become candidates | ✅ 6 (podium, 2× opening, cert, pitch, reading) |
| 3 | Mild stress does not voice | ✅ 5 `mild_stress`, 0 voiced |
| 4 | Everyday texture does not contaminate voiced lanes | ✅ 22 `everyday_texture`, 0 voiced |
| 5 | Doorway no longer voices routine medium-sens stress | ✅ `band→voiced` = `{positive_personal_touch:6}` only |
| 6 | No safety gates relaxed | ✅ consent gate + sensitivity dampers untouched; smoke 53/53 |
| 7 | Band thresholds logged as World-Ventura-only | ✅ stamped in `bands.ts` |

The two previously mis-voiced items (Dana cross-country, Sam corrupted files) are now `mild_stress` → ambient. *(all rerun numbers: measured from `runs/world-brain/decisions-ventura-v2.json`, post-J4 run; runs/ is git-ignored.)*

## 5. Firewall

Preserved. The rerun reads only the public feed; `runs/world-bible/hidden-arcs.json` and the answer key remain git-ignored and were never read. Cache reuse made the rerun free and changed no meaning judgments (the calibration is entirely Layer-1 scoring, downstream of meaning).

## 6. Open items for Eng1 / Eng2

- **Ratify J4** as the route/treatment taxonomy, or amend the band boundaries.
- **Closeness-as-second-gate** (PO refinement #1): if the team wants medium-sensitivity *close-tie* posts to escalate to doorway, that is a deliberate second closeness gate — decide explicitly before coding.
- **Re-derivation**: all three J4 constants must be re-fit on a human/realistic corpus before any real-feed use. They are demo scaffolding by stamp.

— CS Engineer, 2026-06-26
