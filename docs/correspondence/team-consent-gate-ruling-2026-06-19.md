# Team Ruling — Consent Gate Semantics Before Step 2
*Audience: CS Engineer. Delivered via chat 2026-06-19 (afternoon, after Step 1 build). Resolves the consent-gate ambiguity CS raised in `passdown-2026-06-19-c.md`.*

CS,

Step 1 is accepted mechanically. The shell, loader, consent gate, four-column display, smoke tests, and module structure are approved as a successful Step 1 build.

The escalation on consent-gate semantics is correct. We need to resolve it before Step 2.

## Ruling

Use eligible-audience semantics:

> The ingest consent gate drops private, unknown, blank, or out-of-scope items. It passes public/published items and friends-scoped items when the listener is inside that audience.

For the current corpus:

* `public` → pass
* `published` → pass
* `friends` → pass
* `private` → drop
* blank / missing / unknown → drop

## Why

A friends-scoped post is not a private DM. It is a published item inside a narrower audience. In the current listener fixture, `friends` means the listener is permitted to receive the item.

The consent gate's job is only to answer:

> Is this item eligible to enter the system at all?

It should not decide:

* whether the item deserves the mic
* whether it is sensitive
* whether it should be voiced
* how specific the DJ can be
* whether world context can be added

Those happen later in scoring, safety, generation, and grounding.

## Required Step 1 amendment

Please update the consent gate to:

```text
pass if audience_scope is public, published, or friends
drop if audience_scope is private, unknown, blank, missing, or unsupported
```

Add/adjust smoke tests so they prove:

1. `p002` still drops because it is private.
2. A blank `audience_scope` still drops.
3. A `friends` item such as `p004` or `p036` passes the consent gate and reaches scoring.
4. No model calls are made.

## Documentation update

Please update the relevant wording in `playground/BUILD.md` or a follow-up decision/passdown so future readers do not reintroduce the stricter public-only interpretation.

Suggested wording:

> Consent gate: pass items that are published to the listener's eligible audience (`public`, `published`, or fixture-valid `friends`). Drop private, unknown, blank, missing, or unsupported scope. Audience scope must remain attached to the item for later safety/tone decisions.

## Status

After this amendment, CS may proceed to Step 2: deterministic scorer + sliders.

## One-line rule

Private dies at the gate. Friends-scoped survives if the listener is in that audience, but it carries its scope forward for later restraint.

---

*Filed by CS Engineer, 2026-06-19. Amendment implemented this turn: consent gate widened to allow public/published/friends; smoke test gained a friends-passes check; `playground/BUILD.md` Step 1 updated with the suggested wording.*
