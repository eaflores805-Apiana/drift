# Drift — Modular Architecture (original recommendation memo)
> **v0.1.0** · 2026-06-19 · received via the Acting Manager. The full recommendation that produced the approved principles now codified in `playground/ARCHITECTURE.md`. Preserved here verbatim for the historical record. **The example schemas, TypeScript types, and prescriptive module map below are *examples / starting points*, not binding spec** — per the `eng1-roles-and-authority-2026-06-19.md` ruling, the specifics are CS's to propose and the team's to approve.

---

You are **not wrong**. You are exactly right, and I'd make this a formal architecture rule now before the code grows legs and starts tap-dancing into a ditch.

The danger with Drift is that it can easily become a bowl of spaghetti:

* scoring logic tangled with UI
* prompts buried inside components
* API calls mixed with business rules
* test data shaped differently than real data
* safety checks added "later"
* model outputs trusted because they look smooth
* sliders changing things no one can reproduce

That would kill us. Quietly at first, then all at once, because that's how code debt likes to party.

## Your suggestion is right

We should build Drift in **modules with stable contracts**, and every module should support two modes:

1. **Test mode** — seeded/simulated data, cached model outputs, deterministic replay.
2. **Real mode** — actual sources/API/model calls later, same input/output contract.

The key phrase is:

> **Same interface, different adapter.**

That lets us test the brain now without painting ourselves into a prototype-only corner.

## Architecture principle

I would write it this way:

> Drift must be built as a pipeline of replaceable modules. Simulated data and real data must enter through the same contracts. Test implementations and production implementations can differ internally, but they must produce the same schema at the connection points.

That is how we avoid rebuilding everything when we move from fake social accounts to real data.

## The two connection points idea

I agree, and I'd define the two connection points very explicitly.

### Connection Point 1: Input contract

Everything entering the brain must become the same shape:

```text
IngestedItem
```

Whether the item came from:

* simulated social account
* real social API
* RSS feed
* local news
* product drop
* calendar
* weather
* brand account
* future Meta/X integration

…it must normalize into the same object.

Example:

```json
{
  "id": "p018",
  "source_type": "local_org",
  "source_name": "Buena High Athletics",
  "account_id": "buena_athletics",
  "audience_scope": "published",
  "timestamp": "2026-06-19T15:20:00-07:00",
  "expires_at": "2026-06-22T23:59:00-07:00",
  "raw_text": "Buena High girls wrestling is headed to CIF!",
  "entities": ["Buena High", "girls wrestling", "CIF"],
  "location": "Ventura, CA",
  "novelty_key": "buena_girls_wrestling_cif_2026"
}
```

The scoring engine should not care whether this came from a fake file or a real API.

### Connection Point 2: Decision contract

Everything leaving the brain must become the same shape:

```text
Decision
```

Example:

```json
{
  "item_id": "p018",
  "bucket": "voiced",
  "score": 0.86,
  "score_breakdown": {
    "magnitude": 0.75,
    "closeness": 0.65,
    "relevance": 0.85,
    "timeliness": 0.9,
    "focus_boost": 1.1,
    "sensitivity_drag": 0.95
  },
  "reason": "Local team achievement with high community relevance and low sensitivity when spoken at team level.",
  "lines": {
    "primary": "Big shoutout to Buena High girls wrestling — they're CIF-bound. That's months of work turning into a real moment. Ventura's got something to cheer for.",
    "safe_alternate": "Congrats to Buena High girls wrestling — they're headed to CIF. Big local pride moment for Ventura.",
    "expanded": "Buena High girls wrestling has made it to CIF, which turns this from a school update into a real community moment."
  },
  "safety_check": {
    "passed": true,
    "grounded_claims": [
      "Buena High girls wrestling is headed to CIF",
      "This is a local Ventura community achievement"
    ],
    "rejected_reason": null
  }
}
```

The UI should consume this. The test harness should consume this. The export system should consume this. Later, the polished app consumes this.

Same contract. Different surface.

## Recommended module map (example — CS to propose actual)

```text
playground/
  src/
    data/
      adapters/
        simulatedAdapter.ts
        realAdapter.ts
      schemas.ts
      validate.ts

    meaning/
      meaningClient.ts
      cachedMeaningStore.ts
      prompts.ts

    scoring/
      scoringEngine.ts
      focusWeights.ts
      timeliness.ts
      novelty.ts
      bucketRules.ts

    safety/
      consentGate.ts
      claimGrounding.ts
      forbiddenInference.ts

    generation/
      djLineGenerator.ts
      linePrompts.ts

    evaluation/
      goldLabels.ts
      agreement.ts
      metrics.ts
      exportResults.ts

    ui/
      playgroundShell
      itemTable
      bucketView
      scoreBreakdown
      decisionPanel
```

No module should secretly do another module's job.

The scoring engine should not call the LLM.
The UI should not calculate safety.
The prompt code should not know about sliders.
The line generator should not decide the bucket.
The adapters should not rewrite the product rules.

That separation will save us.

## The non-negotiable boundary

This is the most important technical boundary:

> **Model calls are meaning/generation services. They are not the source of truth for scoring or safety.**

The model can say:

* this seems like a local sports achievement
* this has medium sensitivity
* possible context: CIF, Ventura local pride
* possible line: "Big shoutout…"

But code decides:

* whether it passes consent
* final score
* final bucket
* whether unsupported claims exist
* whether it gets downgraded

That keeps the system inspectable.

## Test mode vs real mode

### Test mode
Uses: JSON seed corpus · Alex listener fixture · cached model meaning outputs · gold labels · deterministic scoring · replayable runs · exports.
**Purpose:** Prove the brain.

### Real mode
Eventually uses: real source adapters · live or scheduled model calls · persistent database · real user profile · real context sources · same scoring/safety/generation contracts.
**Purpose:** Productize the proven brain.

The important part is that real mode should not require rewriting the brain. It should only swap adapters.

## Acceptance criteria for CS build

The first implementation should prove:

* seed data loads through an adapter
* items validate against `IngestedItem`
* meaning pass can be cached
* scoring runs without model calls
* sliders recompute instantly
* buckets are inspectable
* decisions export as `Decision`
* gold labels can be compared
* safety checks are visible in the UI

## My honest feedback

Your instinct is not just good — it is necessary.

If we do not modularize now, we will almost certainly go in circles later because every new test will require touching five unrelated parts of the code. Then no one will know whether a bad result came from the data, the model, the scoring formula, the prompt, the UI, or some "temporary" hack that became permanent like mold under tile.

So yes: modular build, stable contracts, test adapter and real adapter. That is the correct engineering discipline.

---

*Filed by CS Engineer, 2026-06-19. Preserved verbatim as the original recommendation memo. The approved-principle distillation lives at `playground/ARCHITECTURE.md`. Per `eng1-roles-and-authority-2026-06-19.md` v0.1.1: the specifics (schemas, types, module names, file structure) are CS's to propose and the team's to approve.*
