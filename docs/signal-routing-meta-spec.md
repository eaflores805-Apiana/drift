# Drift — Signal Routing Meta-Spec
### Source kinds, routes, and the shared judgment spine

> **v0.1.0 · 2026-06-20 · SUPPORT architecture — the unifying frame, not a build task.** This is the meta-spec the existing route docs are *instances* of. It **names what is already decided** (ADR J1 route-aware ranking, ADR J2 no-`W_community`, the v3 spine in `03-rules-and-format.md` Part 3, the four routes in `GoldRoute`, the commercial gate, the de-risk track) and connects them under one structure. It **invents no new mechanism** and it **does not move the build** — it makes future routes cheap and stops a recurring confusion at its root. **Do not build from this; build from the per-route specs it frames.** Ruled by TL 2026-06-20.

---

## The thesis (one paragraph)

> **Drift does not have one global score.** It has **source-kind–specific *meaning*** and **route-specific *treatment***, connected by one shared judgment spine. The two stay on separate axes. Collapsing them — using one word to mean both "where the signal came from" and "how it gets treated" — is the single recurring confusion in the route work (the "is commercial its own route?" / "is community the highlight route?" questions are the *same* question, and it's a category error). Separating the axes answers all of them at once.

---

## The two axes

The code already tells us these are different. `GoldRoute` has exactly **four** values — `silent · highlight · doorway · utility` — and "community" and "commercial" **are not among them.** That's not an omission; it's the tell. Community and commercial aren't *treatments* — they're *kinds of source* that get *routed to* one of the four treatments. Two axes, not one list.

### Axis 1 — Source kind · *"what kind of thing is this?"*

Describes the **origin semantics** of an item. **Owns:**
```
eligibility_predicate      — the structural, fail-closed gate for "may this be considered at all?"
magnitude_definition       — what "big" MEANS for this kind (the measuring stick)
source_safety_checks       — kind-specific safety (e.g. minor-exposure for civic, hype-grounding for commercial)
```
The kinds (extensible):
```
personal_social      community_civic      commercial_brand
local_news           world_news           music_context        device_context
( creator — parked: may behave like subscribed media, not advertising; its own future question )
```

### Axis 2 — Route / treatment · *"how should Drift treat it?"*

Describes the **editorial treatment**. **Owns:**
```
threshold                  — route-local, fitted (NOT comparable across routes — see below)
treatment / tone / format  — bright / gentle / brief-actionable / quiet / silent; the spoken shape
load (unit) cost           — how much airtime/space it spends
route_safety_overlays      — treatment-level constraints (e.g. grave-doorway denylist, group-level-only)
fail_closed_behavior       — what "uncertain" does on this route
```
The routes (grounded in `GoldRoute`):
```
highlight    doorway    utility    silent
( + ambient as a footprint LEVEL within a route; + music_hosting for the carrier itself )
```

**The rule that keeps them separate:** a `source_kind` is *interpreted first* (eligibility + magnitude), then *assigned to a route* (threshold + treatment). One kind can map to several routes depending on the item.

---

## The shared spine (the pipeline every item runs)

Every item, regardless of kind or route, runs the same eight stages. Only two slots are filled per-kind; the rest is shared:

```
1. source_kind classification          ← which kind is this?
2. source-kind ELIGIBILITY             ← structural, fail-closed  (KIND-OWNED slot)
3. source-kind MAGNITUDE / materiality ← the kind's measuring stick (KIND-OWNED slot)
4. route assignment                     ← which of the 4 treatments?
5. route-local THRESHOLD                ← voiced vs ambient, route-local (ADR J1)  (ROUTE-OWNED slot)
6. TREATMENT                            ← tone / format / load (ROUTE-OWNED slot)
7. safety / final gates                 ← above BOTH axes (consent, allowed-claims, forbidden-inference, grounding)
8. fail closed                          ← uncertain → less surface, never more
```

Stages 1–3 are the *source-kind* half; stages 4–6 are the *route* half; stage 7 is the *safety overlay* that sits above both; stage 8 is the universal direction. The **v3 formula** (`03-rules-and-format.md` Part 3) is the engine of stage 5 — additive base × confidence × sensitivity_damper, compared to the route-local threshold. Magnitude (stage 3) is the additive base's lead term, *defined by the kind*; the threshold (stage 5) is *owned by the route*.

---

## The backbone rule (the triad) — in axis-split form

The three-organ separation, stated two equivalent ways:

```
Scoring decides WHETHER.       ≡   Source kind decides what "big" means.
Treatment decides HOW.         ≡   Route decides what "enough" means and how it sounds.
Safety decides what's FORBIDDEN. ≡  Safety decides what can never be said — above both axes.
```

Three separate organs. The system only works because they give *independent* answers — see the p045 proof case, where all three answer differently and a correct outcome requires keeping them apart.

---

## The discipline rule (the keeper)

> **Source kinds and routes get their own eligibility predicates, magnitude definitions, thresholds, and treatments. They do NOT get arbitrary new scoring knobs unless evidence proves the shared spine cannot place them.**

This is not a new principle — it's the one we've already obeyed twice, now named:
- **No `W_community`** (ADR J2): the additive spine placed community without a new term. A floor knob was *rejected* because the spine sufficed.
- **Utility deferred, not knob-hacked**: utility under-scores because relevance (a spine input) is uncomputed — the fix is to build relevance (Step 3), *not* to bolt a utility-specific compensator onto the score.

The instinct was right both times; the rule just makes it explicit so we stop re-deriving it route by route.

---

## Scores are not comparable across routes

A `0.532` highlight score and a `0.100` doorway score are **different units** — volts and pounds. Both are floats; that does not make them the same quantity. Software's standing temptation is to compare them *because* they share a type; resist it. Ranking is **route-local only** (ADR J1). There is **no global leaderboard** — cross-route airtime (which route speaks now, given the music and recent breaks) is **Layer 2's** job, not the score's. The spine says "each route has a threshold"; it pointedly does **not** say the thresholds are comparable.

---

## What a source kind is (the template — fill these three)

```
source_kind: <name>
  eligibility_predicate:   <structural, deterministic, fail-closed>
  magnitude_definition:    <what "big" means here — numeric or bounded-judgment>
  source_safety_checks:    <kind-specific>
```

Worked instances (from the existing docs):
```
commercial_brand:
  eligibility:  followed/allowed brand + a real MATERIAL event (anchor + materiality; commercial gate doc)
  magnitude:    materiality of the commercial change (discount %, event-shape; graded none/registers/strong)
  safety:       hype-grounding (stronger grounding before voice than before ambient)

community_civic:
  eligibility:  public / local-civic + group-safe
  magnitude:    local / community significance (how big a group event)
  safety:       minor-exposure → group-level only, strip individuals (the p045 overlay)

personal_social:
  eligibility:  consent / audience-scope + relationship + life-event routeability
  magnitude:    life-event significance × closeness
  safety:       forbidden-inference (never assert a private motive/feeling/identity)
```

---

## What a route is (the template — fill these five)

```
route: <name>
  threshold:               <route-local, fitted; NOT comparable to other routes>
  treatment/tone/format:   <the spoken or ambient shape>
  load (unit) cost:        <airtime/space spent>
  route_safety_overlays:   <treatment-level constraints>
  fail_closed_behavior:    <what uncertain does here>
```

Worked instances:
```
highlight:  threshold 0.532 · treatment warm/bright celebration · overlay: group-level if minors
doorway:    threshold 0.100 (provisional) · treatment gentle→grave, restraint RISES with seriousness ·
            overlay: forbidden-vocabulary denylist, freshness gate, diagnosis-voices-once
utility:    threshold deferred · treatment brief/actionable "go do this", never ad-like · overlay: no invented urgency
silent:     no threshold (no voiced bar) · treatment: no surface
```

> **The doorway is the canonical exception to the spine's monotonicity.** Everywhere else, higher magnitude → more prominence. The grave doorway *inverts* it: the most serious events get the *most restraint*. So "magnitude sizes treatment" is a spine default *with a documented exception* — a naïve unification that flattens it gets grief catastrophically wrong. Keep the exception explicit.

---

## The mapping (source kind → route)

The classification step (stage 4). One kind maps to **several** routes depending on the item — this is exactly what made "is commercial a route?" feel confusing, and the table dissolves it:

| Item | Source kind | Route | Why |
|---|---|---|---|
| Friend gets a promotion | personal_social | highlight | personal win → warm celebration |
| Friend says rough week | personal_social | doorway | sensitive → gentle check-in |
| School team wins CIF | community_civic | highlight | public group achievement |
| Library reaches 1,000 kids | community_civic | highlight *or* ambient | civic milestone (the "maybe") |
| Bakery wins State Fair | commercial_brand / civic hybrid | highlight | local-business achievement, *not* an ad |
| Brand has a 30% sale | commercial_brand | utility *or* ambient | material commercial event → actionable |
| Coffee drop, today | commercial_brand | utility | time-bound, useful → "go today" |
| Street closure tonight | community_civic / local_news | utility | actionable local texture |
| Family politics | personal_social | silent | clears privacy, stays down |
| Song trivia | music_context | music_hosting | track-edge texture |

**The mapping is where source-kind meets route — and it's the engine piece that doesn't exist yet** (route classification is stubbed; see "current holes").

---

## Proof case 1 — p045: the triad working

p045 (Anacapa Middle's science-team win; the source names four minors) is the case that *requires* all three organs to disagree cleanly:

```
source_kind: community_civic
route:       highlight (community pride)
overlay:     minor_exposure → group-level, strip individuals
```
- **Source-kind magnitude says:** real community win → 0.65 (same as the bakery that voices).
- **Scoring says (whether):** community magnitude says *surface it.*
- **Treatment says (how):** group-level pride — *"Anacapa's team took state"* — names stripped.
- **Safety says (forbidden):** individual minors, *never*, regardless of how high it scores.

The raw v3 score sinks to 0.336 only because the sensitivity damper conflates *removable exposure* with *less important* — which is why p045 routes to the **de-risk track** (strip the separable risk, re-score the safe residual ≈ 0.56), not to a threshold change. **Three organs, three different answers, one correct outcome — possible only because the axes stay separate.** Flatten "sensitivity = less important" into the score and you either bury a real win or name children.

## Proof case 2 — commercial_brand → utility: the axis split

p020 (Driftwood's *"fall blend is back, free cups, open til 6"*) proves source-kind ≠ route:
```
source_kind: commercial_brand   → eligibility: anchor + materiality (a real "Back" event) ✓
                                   magnitude: materiality of the change → 0.30 (measured)
route:       utility            → treatment: brief, actionable, "go today"; tone: useful, not ad-like
```
Its **voice is the utility route's voice** — *"Driftwood's fall blend is back today…"* — **not** some separate "commercial voice." A commercial *source* speaks in a utility *treatment*. There is no commercial route; there is a commercial *kind* that, when it carries a real event, *routes to* utility (and otherwise stays ambient or silent). That's the entire two-axis point in one item.

---

## Where this sits — and what's honestly still stubbed

**This is SUPPORT.** It names decided architecture; it builds nothing. Its value is that every existing route doc becomes a *thin instance* of it (fill the two templates; reference the spine instead of re-deriving it), and every *future* content kind (creators, world news) becomes "define one eligibility predicate + one magnitude ruler + a mapping to existing routes" — cheap, because four-fifths of the pipeline already exists.

**Two stages of the spine are not built in the live engine yet — the meta-spec describes the target, and these two arrows are dashed today:**
- **Stage 4 (route assignment / classification)** does not exist in `scoringEngine.ts` — `route` lives only as a gold *label*. Building it (deterministically, structurally) is the v3-wiring-task prerequisite.
- **Relevance** (a spine nudge feeding stage 5) is the flat `0.5` placeholder (`scoringEngine.ts:99`) — the uncomputed factor (Step 3) that under-serves utility most.

**Layer boundary:** this meta-spec is **Layer 1's internal structure** (judge one item: kind → eligibility → magnitude → route → threshold → treatment, safety over all). **Cross-route airtime — which route actually speaks in a given break — is Layer 2's**, and is out of scope here.

---

## What this changes going forward

- **Existing route docs → thin instances.** Each fills the `source_kind` template (eligibility + magnitude) and the `route` template (threshold + treatment); the spine, the triad, and fail-closed are *referenced*, not restated. (The commercial-gate doc is already a near-complete `commercial_brand` source-kind instance.)
- **New content kinds are cheap.** A creator route, world-news route, device-context route = one new `source_kind` (two slots) + a mapping row. No new scoring universe.
- **The recurring question is now answerable in one line.** "Is X its own route?" → *No — X is a source kind; ask which of the four routes it maps to, and when.* That dissolves the commercial-route and community-route ambiguities (the §1c question) at the source.

---

## Summary

> Drift has no global score.
> A **source kind** decides what "big" means (eligibility + magnitude).
> A **route** decides what "enough" means and how it sounds (threshold + treatment).
> **Safety** sits above both and decides what can never be said.
> One shared spine connects them; the axes stay separate; the thresholds are not comparable; Layer 2 owns cross-route airtime.
> Same machine, different measuring sticks — consistency without one dumb leaderboard.
