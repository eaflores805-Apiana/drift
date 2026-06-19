# Passdown — 2026-06-19 (session E)
*CS Engineer. Promotion Playground **Step 2** built: deterministic scorer + sliders. All 7 Team-Lead hard checks verified.*

## What I did this session

**Built Step 2 end-to-end.** Replaced `stubScorer` with a deterministic `scoreBatch` pipeline; added scoring submodules; wired sliders that recompute decisions locally with zero model calls; surfaced score breakdowns per item.

New modules:
```
playground/src/
├── meaning/handStubbedMeaning.ts       hand-stub ModelDerived (replaced by Step 3)
├── scoring/
│   ├── closeness.ts                    LOOKUP from listener.closeness_map
│   ├── timeliness.ts                   deterministic decay from expires_at
│   ├── novelty.ts                      NoveltyTracker (dedup on novelty_key)
│   ├── focusWeights.ts                 per-source multiplicative boost
│   └── scoringEngine.ts                scoreBatch — the orchestration
└── ui/
    ├── SliderPanel.tsx                 voice/expandable thresholds, baselines,
    │                                   novelty window, 6 focus weights
    └── ScoreBreakdown.tsx              per-item factor breakdown + reason
```

Deleted: `playground/src/scoring/stubScorer.ts` (replaced by `scoringEngine.ts`).
Updated: `App.tsx` (slider state + recompute via `useMemo`), `Playground.tsx`, `ItemCard.tsx` (breakdown), `DebugPanel.tsx`, `styles.css`.

**Scoring formula** (per `docs/03-rules-and-format.md` Part 3):
```
raw       = magnitude × closeness × (0.5 + 0.5·relevance) × (0.5 + 0.5·timeliness)
effective = raw × focus_weight[source_type]
bucket    = expandable  if effective ≥ expandableThreshold (default 0.65)
          | voiced      if effective ≥ voiceThreshold      (default 0.45)
          | ambient     otherwise (or if not novel)
          | drop        if consent gate rejected the item
```

## Team-Lead hard checks — all verified

| # | Check | Smoke result |
|---|---|---|
| 1 | Closeness is a **lookup** from `listener.closeness_map`, not guessed | PASS (Check 7 — `mark` → tier=`close`, value=0.9) |
| 2 | Timeliness uses `expires_at` (soon-expiring > unexpiring > expired) | PASS (Check 8 — soon=1.0, none=0.5, expired=0) |
| 3 | Novelty dedups on `novelty_key` within configurable window | PASS (Check 9 — repeat-in-window → not novel; repeat-after-window → novel) |
| 4 | Focus modes are **weighting, not filters** | PASS (Check 10 — news items present + focus_weight=1.0 even when friend focus=2.0; friend items show focus_weight=2.0) |
| 5 | Sliders recompute locally and instantly with **zero model calls** | PASS (Check 14 structural; React `useMemo` recompute path imports nothing from a model client) |
| 6 | Score breakdown visible per item | PASS (Check 12 — all 39 scored items have ≥5 breakdown keys; `ScoreBreakdown` component renders the table + a one-line reason) |
| 7 | Consent-gated drops stay dead | PASS (Check 13 — even with voiceThreshold=0, expandableThreshold=0, all focus weights=2.0, `p002` still drops at the gate) |

Plus carry-overs from Step 1:
- Check 1 — 40 items load ✓
- Check 2 — `listener_001` loads ✓
- Check 3 — `p002` drops (private) ✓
- Check 4 — `p002` consent-gate drop with reason ✓
- Check 5 — blanked `audience_scope` drops ✓
- Check 6 — friends-scoped items reach scoring (p004, p036) ✓
- Check 11 (new) — sliders cause real bucket motion (lowering voice threshold to 0.05 → 36 items rise to voiced/expandable, proving the slider isn't a no-op)

**14/14 smoke checks pass.** `npm run typecheck` clean. `npm run build` = 221 KB / 65 KB-gzip in <500 ms.

## A note on the default bucket distribution

At default settings (`voiceThreshold=0.45`, all focus weights = 1.0), the bench shows:
```
drop       1   (p002 only)
ambient   39
voiced     0
expandable 0
```

This is **correct, not broken.** The canonical threshold from `03-rules-and-format.md` is 0.45 ("restraint is the default" — the bar is "worth interrupting the music for"). Combined with the crude category-by-source-type stubs in `handStubbedMeaning` (most items get magnitude 0.18 because they're tagged `daily`), the math compresses everything below 0.45. Lowering the voice threshold to ~0.10 in the UI immediately surfaces items — see the slider-motion check.

This will change naturally once Step 3 lands real magnitudes from the meaning-pass prompt (e.g., `p008` "I got the job!" gets `life_event` mag=0.9 not `daily` 0.18; `p018` Buena CIF gets a properly-weighted local-pride read). That's exactly what the Team Lead's "taste tuning comes after Step 3/4" boundary means.

## Class 1 items implemented as proposals (pending team review)

Per the decision-authority memo, these need team sign-off before they harden. Implemented in code as proposals:

- **Scoring formula** as encoded (above) — directly from `03-rules-and-format.md` Part 3.
- **Bucket definitions** for the four buckets (`drop` from consent, `ambient` below threshold or non-novel, `voiced` ≥ voiceThreshold and < expandableThreshold, `expandable` ≥ expandableThreshold).
- **Tier → numeric value** mapping in `closeness.ts` (`close`=0.9, `known`=0.5, `acquaintance`=0.4, `distant_family`=0.5, `followed`=0.3, unknown=0.2). The spec only gives `close`=0.9, `known/acquaintance`=0.5, `followed`=0.3; I added `acquaintance` slightly under `known` and `distant_family` at `known` level. Open to amendment.
- **Timeliness decay buckets** (≤6h→1.0, ≤24h→0.85, ≤72h→0.55, else 0.35). Pure proposal; the spec doesn't prescribe a shape.
- **`FIXED_NOW_MS = 2026-06-19T13:00:00`** for reproducible timeliness in the bench. Replaced by `Date.now()` in real mode.
- **`ScoringSettings` schema** — the surface the UI sliders bind to.

## CS-owned (Class 2) — logged, no approval needed

- `handStubbedMeaning` keyword heuristics for sensitivity (`grief`, `loss`, `political`, etc.). Pure scaffolding; Step 3 replaces it wholesale with model judgment.
- Source-type → category mapping in the stub.
- UI layout, slider ranges/steps, breakdown table format, color palette.

## What's next

**Step 3 — Cached meaning pass.** Per BUILD.md, needs:
- A model client (Anthropic SDK) reading the `meaning-pass-v1.md` prompt
- Per-item cache keyed by `{item_id, prompt_version}` (cache invalidates when `prompt_version` bumps)
- Replace `handStubbedMeaning` with the cached pass; `scoringEngine` already consumes `ModelDerived` so the swap is local
- Sanity-read of meaning outputs (Eng1 + Eng2 spot-check)

Step 3 is the first place real API keys + model calls land. CS will need a clear escalation point for that — likely a `.env` for the API key (gitignored) and a config flag to gate real-mode model calls vs. a "use cached only" mode for reproducibility.

## Repo state at end of turn
- Branch: `main`
- Remote: `https://github.com/eaflores805-Apiana/drift` (public)
- Local HEAD = Remote HEAD (verified in turn summary)
- `_INBOX/` empty
- Working tree clean after this passdown's commit
