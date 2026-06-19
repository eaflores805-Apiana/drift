# Team Ruling — Step 3A Accepted; Step 3B Proposal Required
*Audience: CS Engineer. Delivered via chat 2026-06-19 (evening). Closes Step 3A; opens the Step 3B proposal phase.*

Good. **Step 3A is accepted.**

CS hit the right behavior:

* cache miss populates
* second run hits cache
* prompt version bump invalidates
* mock client deterministic
* mock output validates against `ModelDerivedSchema`
* real client throws instead of accidentally calling out
* scoring consumes cached meaning
* sliders do not touch meaning

That is exactly the layer we wanted before real model calls. Boring, modular, testable. Annoyingly responsible. Perfect.

## Team Lead ruling

**Step 3A is complete.**

`Sensitivity: none|low|high → low|medium|high` is approved as a contract alignment, because the meaning-pass prompt uses `low | medium | high`. The old `none` maps to `low`. No issue, as long as this is documented and nobody treats `low` as "zero risk forever." Low still means the item can be spoken normally, not that safety disappears.

## One catch before Step 3B hardens

CS used:

```text
cache key = item_id@@prompt_version
```

That is fine for Step 3A scaffolding.

For **live Step 3B**, the cache key needs to expand to:

```text
item_id + prompt_version + model_id + item_content_hash
```

Why? If we change the raw item but keep the same `item_id`, the old meaning output would be stale. And if we switch models, we need to know which model produced the cached judgment.

So: **accepted for 3A, must be upgraded for 3B.**

## Step 3B is still not authorized

CS should not make live API calls yet.

Next allowed action is a **Step 3B proposal**, not implementation.

That proposal should include:

1. Model provider/model choice.
2. `.env.example` plan.
3. Confirmation `.env` is gitignored.
4. Cache key shape: `item_id + prompt_version + model_id + item_content_hash`.
5. Persistent cache location.
6. Retry behavior for malformed JSON.
7. Call cap.
8. Cost estimate for 1 item, 5 items, and full surviving corpus.
9. First live run plan: 1–3 items only.
10. Safety switch so live calls cannot happen accidentally from normal UI use.

## Strong recommendation for live-call control

Do **not** make live API calls happen just because the app renders.

Use an explicit command or mode, something like:

```text
npm run meaning:live -- --limit 3
```

And require an environment flag:

```text
ENABLE_LIVE_MEANING=true
```

No flag, no call. No key, no call. No accidental React re-render bill. We are not here to donate money to the API gods.

## Current status

* Step 1: complete
* Consent ruling: complete
* Step 2: complete
* Timeliness patch: complete
* Step 3A: complete
* Step 3B: pending proposal/approval
* Product Owner labels: still active and important

## Direction

CS should now prepare the **Step 3B live meaning-pass proposal**.

You should keep labeling the 40. That remains the real answer key.

---

*Filed by CS Engineer, 2026-06-19. Proposal filed this turn at `docs/correspondence/cs-step3b-meaning-pass-proposal-2026-06-19.md`. Sensitivity-low semantics documented in `playground/src/meaning/types.ts`. Cache.ts gained a forward-pointing note about the key expansion required for 3B.*
