# Passdown — 2026-06-19 (session H)
*CS Engineer. Filed Team Lead's Step 3A acceptance + Step 3B proposal. No new code; awaiting team go/no-go on the proposal before any live API work.*

## What I did this session

**Filed two correspondence docs:**
- `docs/correspondence/team-step3a-acceptance-2026-06-19.md` — the Team Lead's ruling (Step 3A accepted; sensitivity widening approved; cache-key must expand for 3B; 10-item proposal required; live-call control recommendation).
- `docs/correspondence/cs-step3b-meaning-pass-proposal-2026-06-19.md` — my full Step 3B proposal answering all 10 items.

**Documented the sensitivity-low semantics in code:**
- `playground/src/meaning/types.ts` — added a doc-comment on `SensitivitySchema` making explicit per the team ruling: "low" means *normal to speak about*, **not** "zero risk forever." Safety machinery (consent gate, claim-grounding, proximity routing, glad-test) still applies to every item.

**Forward-pointing note on cache key expansion:**
- `playground/src/meaning/cache.ts` — added a NOTE block describing the 3B expansion: `${item_id}@@${prompt_version}@@${model_id}@@${content_hash}`. The Step 3A cache stays at the 2-part key (mock has fixed `prompt_version`, no model swap to track), but the comment ensures whoever implements 3B doesn't forget.

**Updated:**
- `docs/README.md` — added a callout in the correspondence section pointing at the live-meaning-pass proposal.
- Project memory (`drift_project.md`) — recorded Steps 1, 2, 3A complete; smoke 25/25; persona resolved; the 3B-pending-approval state with the gating rules.

**Verified clean:** smoke 25/25 PASS, typecheck clean — doc-comment edits introduce no regressions.

## Step 3B proposal — TL;DR for the team

The full doc is at `docs/correspondence/cs-step3b-meaning-pass-proposal-2026-06-19.md`. Headlines:

| # | Item | My recommendation |
|---|---|---|
| 1 | Model | `claude-sonnet-4-6` (default). Opus 4.7 selectable for A/B; Haiku not the floor for this task. |
| 2 | `.env.example` | At `playground/.env.example`, committed, no secrets — keys: `ANTHROPIC_API_KEY`, `ENABLE_LIVE_MEANING`, `MEANING_MODEL`, `MEANING_CALL_CAP`, `MEANING_CACHE_DIR`. |
| 3 | `.env` gitignored | Already covered by root `.gitignore`; will add `playground/.meaning-cache/`. |
| 4 | Cache key | `${item_id}@@${prompt_version}@@${model_id}@@${content_hash}` (per team ruling). `content_hash` = SHA-256 of canonical JSON of the prompt-relevant fields. |
| 5 | Cache location | `playground/.meaning-cache/` (gitignored), one file per entry, filename = SHA of the key. |
| 6 | Retry on malformed JSON | One retry with a stronger "JSON only" instruction; if it fails again, throw. Schema-validation failures throw immediately (no retry). |
| 7 | Call cap | `MEANING_CALL_CAP` env, default 50. Counts retries. Refuses batch start over cap. |
| 8 | Cost (Sonnet 4.6 estimates) | 1 item ~$0.011 · 5 items ~$0.06 · 40-item corpus ~$0.44. First-run only; cached re-runs free. Verify current pricing. |
| 9 | First live run | 3 items only: `p008` (life event), `p018` (local pride / connection-over-importance), `p004` (high sensitivity / texture-not-soul). ~$0.03. |
| 10 | Safety switch | Three required conditions, ALL of: env flag `ENABLE_LIVE_MEANING=true` + valid `ANTHROPIC_API_KEY` + CLI invocation via `npm run meaning:live`. UI never imports `RealMeaningClient` and cannot make a call no matter how many times it re-renders. |

## What I'm explicitly NOT doing

- No SDK install (`@anthropic-ai/sdk` not added).
- No `.env.example` file written yet.
- No `RealMeaningClient.judge()` implementation — it still throws.
- No `meaning-live` script.
- No disk cache code.
- No `keyFor.ts` helper.

All of the above are listed in the proposal as "files this proposal will touch if approved." I'll write them once the team signs off.

## Pending team decisions to unblock 3B

A go/no-go on each of the 10 items, plus any of:
- A different model than Sonnet 4.6
- A different call cap than 50
- Different first-run items than `p008` / `p018` / `p004`
- A different cache directory than `playground/.meaning-cache/`
- A different live-call control pattern than "CLI + env flag + UI uses mock-or-cache"

## What's next (assuming proposal approval)

When the team signs off on the proposal:
1. Add `@anthropic-ai/sdk` + write `.env.example`.
2. Implement `keyFor.ts` (4-part cache key) and widen `MeaningCache` API.
3. Implement `diskCache.ts` (disk-backed `MeaningCache`).
4. Implement `realClient.ts.judge()` with retry + schema validation + 3-condition safety switch.
5. Implement `scripts/meaning-live.ts` (CLI runner).
6. Add smoke checks: 4-part key separation (model swap = miss; content edit = miss), 3-condition safety switch, retry-and-throw on malformed JSON.
7. Do not run the live 3-item batch until the team explicitly asks for it.

Reminder per the Team Lead: **PO labeling the 40 remains the real answer key.** Step 3B's live judgments are only useful when there's a labeled target to measure them against.

## Repo state at end of turn
- Branch: `main`
- Remote: `https://github.com/eaflores805-Apiana/drift` (public)
- Local HEAD = Remote HEAD (verified in turn summary)
- `_INBOX/` empty
- Working tree clean after this passdown's commit
- Smoke: 25/25 PASS · typecheck clean
