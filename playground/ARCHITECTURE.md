# Drift — Playground Architecture Rule
> **v0.1.0** · updated 2026-06-19 · binding architecture guidance for the CS Engineer. Received via the Acting Manager; author attribution to be confirmed (likely Engineer 1, possibly co-authored with Engineer 2). Governs how `playground/src/` is structured and what contracts must hold between modules. Complements but does not replace `docs/04-architecture-review.md` (R1–R3) and `playground/BUILD.md` (build sequence).

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

## Recommended module map

I'd split the code like this:

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

Here's how I'd define it.

### Test mode

Uses:

* JSON seed corpus
* Alex listener fixture
* cached model meaning outputs
* gold labels
* deterministic scoring
* replayable runs
* exports

Purpose:

> Prove the brain.

### Real mode

Eventually uses:

* real source adapters
* live or scheduled model calls
* persistent database
* real user profile
* real context sources
* same scoring/safety/generation contracts

Purpose:

> Productize the proven brain.

The important part is that real mode should not require rewriting the brain. It should only swap adapters.

## What we should send CS

I'd send this as a formal passdown.

# Passdown — Modular Architecture Rule for Drift Playground

## Summary

We should build the Promotion Playground as a modular pipeline with stable contracts between modules.

The goal is to avoid prototype spaghetti and make sure simulated data and future real data can use the same brain.

Core rule:

> Same interface, different adapter.

Simulated sources and real sources may differ internally, but they must normalize into the same input schema. Test outputs and production outputs must use the same decision schema.

## Why this matters

Drift's value is the editorial judgment engine, not the UI. If scoring, prompts, safety, data loading, and UI get tangled together, we will lose inspectability and make the system hard to test.

We need:

* reproducible runs
* cached model outputs
* deterministic scoring
* instant slider recompute
* clear safety checks
* gold-label comparison
* exportable decisions
* future real-data compatibility

## Required connection points

### 1. Input contract: `IngestedItem`

Every source must normalize into this shape before entering the brain.

Sources can include:

* simulated social accounts
* local news
* global news
* product drops
* brands
* creators
* calendar
* weather
* future social API sources

The scoring engine should not care where the item came from.

Example fields:

```ts
type IngestedItem = {
  id: string;
  source_type: "friend" | "family" | "coworker" | "local_org" | "brand" | "creator" | "news" | "weather" | "calendar";
  source_name: string;
  account_id?: string;
  audience_scope: "published" | "private" | "unknown";
  timestamp: string;
  expires_at?: string;
  raw_text: string;
  entities: string[];
  location?: string;
  novelty_key: string;
};
```

### 2. Output contract: `Decision`

Every item should produce an inspectable decision object.

```ts
type Decision = {
  item_id: string;
  bucket: "drop" | "ambient" | "voiced" | "expandable";
  score: number;
  score_breakdown: Record<string, number>;
  reason: string;
  lines?: {
    primary?: string;
    safe_alternate?: string;
    expanded?: string;
  };
  allowed_claims: string[];
  forbidden_inferences: string[];
  safety_check: {
    passed: boolean;
    grounded_claims: string[];
    rejected_reason?: string | null;
  };
};
```

The UI, export system, evaluation harness, and future product surface should all consume this same `Decision` object.

## Module boundaries

Recommended module layout:

```text
playground/src/
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
    playgroundShell/
    itemTable/
    bucketView/
    scoreBreakdown/
    decisionPanel/
```

## Responsibilities by module

### Data adapters

Load source data and normalize it into `IngestedItem`.

Adapters should not score, bucket, or generate DJ lines.

### Meaning module

Runs the model meaning pass once per item and caches the result.

The model may produce:

* category
* magnitude
* sensitivity
* confidence
* context_candidates
* connection_read

The model must not decide the final bucket.

### Scoring module

Pure deterministic functions.

Computes:

* closeness
* timeliness
* novelty
* relevance
* focus boost
* score
* bucket

Slider changes must recompute without model calls.

### Safety module

Deterministic and fail-closed.

Includes:

1. Consent gate at ingest
   Private or unknown scope drops.

2. Post-generation claim grounding
   Every factual claim in the DJ line must trace to item fields or approved world context.

### Generation module

Generates DJ lines only after an item qualifies.

It does not decide whether the item deserves the microphone.

### Evaluation module

Compares decisions against gold labels.

Tracks:

* bucket agreement
* false voiced items
* high-sensitivity false-voice
* over-suppression
* grounding failures
* exportable run results

### UI module

Displays decisions.

UI should not contain scoring, safety, or prompt logic.

## Test mode vs real mode

### Test mode

Uses:

* seed JSON files
* Alex listener fixture
* cached model outputs
* gold labels
* deterministic scoring
* replayable runs

### Real mode later

Uses:

* real source adapters
* real profile/context sources
* same `IngestedItem` schema
* same scoring/safety/generation modules
* same `Decision` schema

## Non-negotiable architecture rule

> Model calls are meaning/generation services. They are not the source of truth for scoring or safety.

The LLM can help interpret meaning and write candidate DJ lines. Code owns consent, scoring, bucket assignment, claim grounding, and final decision handling.

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

*Filed by CS Engineer, 2026-06-19. Binding architecture rule for the playground build. Note: the module-map examples use `.ts` extensions and TypeScript syntax; that may be schematic or it may indicate a stack preference — language choice for Steps 1–2 is still outstanding with the Acting Manager.*
