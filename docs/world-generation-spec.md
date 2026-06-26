# Drift — World Generation Spec
### How the input world is modeled, generated, and scaled without overfitting

> **v0.1.0** · 2026-06-21 · This is **engine material**, not a brainstorm. It makes the *input* layer explicit — the thing every other doc assumes and none defines. The taxonomy classifies events, the break spec assembles them, the showcase is output, the build map is the route; but the substrate they all run on — the cast around a listener, the stream of posts that cast generates, the local scene, the followed sources — has lived implicitly inside `seed-items.json`, `listener.json`, and the `_meta` blocks of three JSON files. This consolidates those scattered rules into one method. **What's decided here:** the closeness reconciliation (§1, *proposed ruling — for TL ratification*), the cast/graph schema (§2), the trap taxonomy (§4). **What's a starting prior:** the per-zone density mix (§3) and the scaling targets (§5) — set here, confirmed by listening, not locked.
>
> **Honest framing — what tier this is:** `[SUPPORT]`, not a link in the critical-path chain. But it is the *de-risking* kind, not the comfort kind. The corpus scale to 300–500 (Parallel Track A) is `[EVIDENCE]` and is on the destination path — it is the moat. A corpus scaled *without* a method overfits to the formula and makes the "the brain works" claim hollow; a buyer would not believe it transfers to their graph. This spec is to the corpus what the Layer 0 spec was to ranking: the thing that makes the evidence trustworthy. It does **not** authorize stopping evidence work to write more docs — CS keeps authoring on the current 45 in parallel.

---

## §0 · The job and where it sits

**The seat:** *Social Media World Architect.* Given a listener, produce the world that listener lives inside — a cast with proximity, a post stream that instantiates the life-event taxonomy at realistic density, a local layer, followed sources — as `IngestedItem[]` conforming to the schema in `playground/src/data/schemas.ts`, against a `Listener` fixture. The cast lives in `listener.closeness_map` + `listener.followed_entities`; the stream lives in `seed-items.json`.

**The state it inherits (verified against HEAD `1a46960`):** the world is already *instantiated*, not blank. `listener_001` (Alex Rivera, Ventura), 19 accounts and 45 items, 10 locked gold labels plus an 8-entry community cluster, and a `corpus-coverage-pack.json` carrying safety sentinels, time-decay cases, three additional accounts, and a second-fixture plan. The fixture is **designed, not sampled**: p002 verifies the consent gate fails closed; p044 separates an eligibility-drop from a consent-drop; p045 names four minors on purpose to verify the DJ strips them; the community cluster holds closeness constant so magnitude is the lone fitted variable. This spec extends a disciplined fixture — it does not start one.

**The one rule it answers to:** *Later — does it help prove the brain?* The world layer helps prove the brain only if it makes the corpus a credible moat. That is the bar every section here is held to.

---

## §1 · The closeness reconciliation *(proposed ruling — for TL ratification)*

This is the load-bearing section, and it resolves a live inconsistency that blocks consistent labeling of any *new* item. It is written as a proposal because closeness is a scoring input and a safety-gate input — an architecture decision, which goes through the chain. Recommend banking as a Decision-Log entry once ratified.

### The problem: closeness is spoken three different ways

| Where | Vocabulary | Role |
|---|---|---|
| **Runtime** — `playground/src/scoring/closeness.ts` | `close 0.9 · known 0.5 · distant_family 0.5 · acquaintance 0.4 · followed 0.3 · unknown 0.2` | **Authoritative** closeness *value*. Looked up from `listener.closeness_map[account_id]`, fed to the v3 closeness-nudge. |
| **Taxonomy** — `10-life-event-taxonomy.md` cross-axis | `close · community · acquaintance · public` | Conceptual: *the same event routes differently by who it happened to.* Gates the grave doorway ("close **or community-relevant**"). |
| **Data annotations** — `corpus-coverage-pack.json` accounts | `closeness_tier` field *on the account* | Convenience tag on three new accounts (rob/aunt_carol/jen). |

Two of these four taxonomy bands — **`community` and `public` — have no runtime tier at all.** Community items currently enter as `source_type: local_org` at `followed` or `unknown` closeness. So when the taxonomy says the grave doorway may voice for a "community-relevant" loss, there is no runtime expression of "community-relevant" to check. That is a gap in a *safety gate*, not a cosmetic mismatch.

### The proposed resolution: split the two axes the taxonomy conflated

The taxonomy's four-band cross-axis is doing **two jobs at once** — personal proximity (`close`/`acquaintance`) *and* source character (`community`/`public`). The runtime already separates them correctly and just lacks the vocabulary. The fix is to name that separation, not to change the runtime.

**Axis A — Personal proximity (the closeness ladder, authoritative, unchanged).** `close > known > distant_family ≈ … > acquaintance > followed > unknown`. This is *finer* than the taxonomy — it has `known`/`distant_family` between close and acquaintance, which the taxonomy has no band for. It stays exactly as wired in `closeness.ts`. **No formula change.**

**Axis B — Source character (derived, not a closeness value).** Computed from `source_type` (+ locality):
- **`community`** = `source_type == local_org` **AND** the org is within the listener's locality. Correctly arrives at `followed`/`unknown` *personal* closeness — you are not personally *close* to your kid's school, but it is community-relevant. Community is a **source+locality** property, never a proximity value.
- **`public`** = `source_type ∈ {news, brand, creator}`, plus `local_org` *outside* the listener's locality. Non-personal sources.

Under this split, the taxonomy's prose gate becomes a checkable rule:

> **Grave doorway may voice only when** `proximity == close` **OR** `source_band == community`. **Never** when `source_band == public` (a celebrity death from a news source is the taxonomy's "public figure" path, handled elsewhere — not the personal/community grave gate). **Never** when proximity is `known`/`distant_family` (sub-close personal) — restraint default.

### Mapping table (taxonomy band → operational definition)

| Taxonomy band | Operational definition | Grave-gate eligible? |
|---|---|---|
| `close` | `proximity == close` (closeness 0.9) | **Yes** |
| *(no taxonomy band)* | `proximity ∈ {known, distant_family}` — personal, sub-close | No *(restraint default — revisable, see open Q)* |
| `acquaintance` | `proximity == acquaintance` (0.4) | No |
| `community` | `source_type == local_org` **AND** in-locality | **Yes** |
| `public` | `source_type ∈ {news, brand, creator}`, or out-of-locality `local_org` | No *(separate world-news path)* |

### What this introduces, changes, and does not change

- **Introduces a requirement:** a *locality* determination for `local_org` accounts — is this org in the listener's area? In the current fixture every `local_org` (Buena High, Ventura Library, Ventura Farmers Market, Anacapa Middle, Rolling Pin, Harbor Threads) is Ventura, so community == all `local_org` *today* — which is exactly why the gap has been invisible. It surfaces the moment a scaled corpus or Fixture 002 contains an out-of-locality `local_org`. The spec makes the dependency explicit now so scaling handles it correctly (see §2 locality field).
- **Does not change** `closeness.ts`, the v3 formula, or any wired threshold. Axis B lives in the meaning/routing layer, where source_type and locality already are.
- **Resolves** two schema inconsistencies along the way (§2): the unused `coworker` enum value, and `closeness_tier`-on-account in the coverage pack.

### Open question for the PO/TL (flagged, not decided)

Should `known`/`distant_family` (the runtime's sub-close personal tiers) ever be grave-gate eligible? This spec recommends **no** — restraint default, matching "restraint as respect." But it is a revisable taste call, not a safety floor, so it is marked open rather than locked.

---

## §2 · The cast / graph schema

### The account registry (a source)

```
account_id      stable slug, snake_case            (e.g. "mark", "buena_athletics")
name            display string                      (e.g. "Mark", "Buena High Athletics")
source_type     one of the 9-value enum             friend|family|coworker|local_org|
                                                     brand|creator|news|weather|calendar
locality        in_locality | out_of_locality | n/a NEW — required for local_org;
                                                     derives Axis-B community vs. public (§1)
```

Closeness is **not** an account field. It is **listener-relative** — the same person is `close` to one listener and `followed` by another — so it lives in `listener.closeness_map[account_id]`, keyed by `account_id`. This is already how the runtime reads it; the spec makes it a rule.

**Two inconsistencies to clean up on next integration (low-stakes, but a world spec owns them):**
1. **`coworker` is a defined `source_type` with zero accounts using it.** Sam is `"Sam (coworker)"` but typed `friend`, with the relationship encoded in the *name string*. Either use the enum value (type Sam `coworker`) or drop it from the enum. Recommend: **use it** — coworker is a real relationship class with distinct routing intuitions (work wins, "shipped the thing"), and the enum already reserves the slot.
2. **`closeness_tier` appears on accounts in `corpus-coverage-pack.json`** (rob/aunt_carol/jen) but the live system reads closeness from `listener.closeness_map`. On integration, migrate those annotations *into* `closeness_map` and drop the account-level field, so there is one source of truth for proximity.

### The listener model (the graph's center)

```
id, name, location                  the locality anchor for Axis-B (§1)
interests[]                         the relevance surface (drives the relevance-nudge)
followed_entities[]                 eligibility-not-the-mic sources (brands/creators/news/orgs)
calendar[]  {title, when}           the utility / time-bound surface (freshness, "it's tonight")
closeness_map  {account_id: tier}   AUTHORITATIVE proximity, listener-relative
```

The graph is **listener-centric and relationship-typed**: `source_type` (relationship *category*) and closeness (proximity *magnitude*) are orthogonal and both correct to keep separate — Dana is `family` *and* `close`; Uncle Ray is `family` *and* `distant_family`. Do not collapse them.

---

## §3 · The post-stream model

### The mix is the point — gem-to-noise stays low

The corpus's realism *is* its discipline: **most items land `ambient` or `drop`.** A stream where every post is a gem is a demo, not a world, and an engine tuned on it learns the wrong prior (everything is worth voicing). The `_meta` rule is explicit and load-bearing: *keep the gem-to-noise ratio low.* This is a **rule, not a flavor** — violating it breaks the thing the corpus is supposed to prove.

### Per-zone density priors *(starting prior — confirmed by listening, not locked)*

Mapped to the seven treatment zones of the taxonomy, with realistic frequency:

| Zone | Stream frequency | Typical bucket | Why |
|---|---|---|---|
| Recurring warmth (birthdays, "shipped it", gym complaints) | **common** | ambient / drop | The texture of a real feed; mostly mundane. |
| Utility logistics (events, drops, deadlines) | common | ambient / voiced-if-timely | Useful, brief, time-bound. |
| Celebratory highlight (job, grad, CIF) | uncommon | voiced | The gems. Rare enough to *be* gems. |
| Ambiguous change (move, "leaving my job") | occasional | ambient / drop | The valence trap — usually shouldn't voice. |
| Community pride (local team/school/business) | occasional | voiced-or-ambient | The "happened *here*" layer. |
| Sensitive doorway (rough week, breakup) | rare | doorway / drop | Gentle, low-detail, or out entirely. |
| **Grave doorway (death, diagnosis)** | **rare — and the rarity is load-bearing** | ambient / drop / silent | A false-voice here is the worst error the product makes. Rarity is realism *and* safety. |

### The temporal spine

A stream needs a **clock**, not just a pile. Freshness/decay (the grave-doorway "voices only near the moment", the diagnosis "voices once and never resurfaces", promo dedup) and the synthesis move ("three people close to you all picked *this week*") only have something to run against if items carry realistic timestamps across a day/week. The current fixture spans 2026-06-19; scaled corpora should span a coherent window with believable posting cadence (clustered, not uniform — people post in bursts).

### Per-account voice consistency *(rule)*

An account's items should read like **one person across the stream**. The friend who posts airport-sushi complaints keeps that register; the brand keeps its voice. This is the input-side mirror of the *output-side* voice-drift concern in the parked note — and it matters for the same reason: an inconsistent cast is as unrealistic as an inconsistent DJ. Violating it is a defect, not a flavor.

---

## §4 · The trap taxonomy *(the moat)*

This is what separates a corpus that proves the brain from one that flatters it. Track A's definition is the north star: **an item is "oblique" exactly when expert labelers disagree; inter-rater agreement is the moat-health metric, and disagreement is signal, not noise to average away.** Traps are authored to sit *on* decision boundaries. The named classes, each with an exemplar already in the fixture:

**1 · Looks-significant-isn't.** Reads dramatic, carries no connection value. → `p011` ("new profile pic, same disappointment" — theatrical, nothing), `p016` (Uncle Ray's 400-word political rant — high volume, zero personal-connection merit; correctly *deferred*, not category-banned).

**2 · Is-significant-shouldn't-resolve.** A real, weighty event the engine must *not* resolve — voicing any read is a guess. → `s003` ("guess i'm single again 🙃" — the emoji deliberately hides valence; both congratulating *and* consoling are wrong). This is the ambiguous-change valence trap made concrete.

**3 · The safety sentinel (hard-fail).** A grave event where the catastrophic output is named *explicitly* as `hard_fail_if`, and any single false-voice = automatic Phase B fail regardless of overall agreement. → `s001` (grief anniversary — hard-fail on bright tone or invented detail), `s002` (family illness — hard-fail on naming the illness or guessing prognosis). These are **rules-driven, not taste-driven** — closer to "correct" than "oblique" — but still PO-confirmed.

**4 · Consent / eligibility.** Tests the gate *before* scoring. → `p002` (private DM — must drop, consent fails closed), `p044` (public sale post — drops on *eligibility/voice-worthiness*, a different gate than consent), `p045` (names four minors — must strip to group level).

**5 · Grounding-bait.** Items whose phrasing *tempts* an invented detail, planting in the corpus the exact slips the showcase fixed in output. → `p001` ("big weekend ahead" tempts an invented *purpose*; the grounded move is "touched down in DC — no clue what's on his schedule"). The showcase repaired these in the *output*; the corpus should *plant* them in the *input*, so the grounding gate is tested against temptation, not just clean cases.

**The authoring consequence:** weight new items toward boundary cases (classes 1–2), seed every scaled batch with class-3 sentinels and class-5 bait, and treat labeler disagreement on a class-1/2 item as *confirmation it's a good trap* — not a labeling failure to reconcile away.

---

## §5 · The generation method *(overfitting-resistant scaling)*

How to go 45 → 100–150 → 300–500 without the corpus memorizing the formula. Consolidates Track A's methodology with the techniques already proven in the fixture.

1. **Decouple authoring from labeling.** Author items *blind* to the answer key; label blind to the engine's output. Already the stated discipline in `seed-items.json` `_meta` and the gold-labeling guide — generalized here as a standing rule for every batch.

2. **Source from real anonymized public posts for true obliqueness.** Invented items are too *legible* — they resolve cleanly because the author knew the answer. Real posts carry the genuine ambiguity that makes a moat. (Track A.)

3. **Isolate one variable per fitting cluster — the technique the community cluster already used.** When fitting a constant, author a cluster that varies *only* the target dimension and holds the rest constant. The community cluster held closeness ~constant so **magnitude** was the lone discriminating variable for the route-threshold fit. Promote this from a one-off to the **standard method for every constant fitted**: name the variable, freeze the rest.

4. **Plant deliberate traps, weighted toward boundaries** (§4). Every batch carries its share of looks-significant-isn't, shouldn't-resolve, sentinels, and grounding-bait — not just clean gems.

5. **The fixture-generalization guard — Fixture 002.** The defense against overfitting *to Alex*. A second listener with a deliberately different lifestyle (the deferred "fishing/BBQ/gardening profile" — broader, more local/family/product-heavy) tests that the engine learned *judgment*, not *Alex's specific world*. **Spec for 002:** different `location` (tests Axis-B locality on a non-Ventura org set), a family-heavy cast (exercises `distant_family`/`known` and the §1 open question), product/utility-heavy stream, and its own sentinels. Deferred per Eng2 until `listener_001` produces stable results — but specified now so it is buildable on demand.

6. **Hold gem-to-noise low at every scale** (§3). The ratio is a target checked per batch, not an afterthought.

---

## §6 · Decided vs. discovered

| | Status |
|---|---|
| Closeness = two axes: proximity ladder (authoritative, unchanged) + derived source-band | **Proposed ruling** (§1 — for TL ratification; bank to Decision Log) |
| Grave-gate rule: `close OR community(local_org+in-locality)`; never `public`/sub-close | **Proposed** (follows from §1) |
| Closeness is listener-relative → lives in `closeness_map`, not on accounts | **Decided** (matches runtime) |
| `coworker` enum + `closeness_tier`-on-account cleanups | **Decided** (low-stakes; do on next integration) |
| `local_org` needs a `locality` field | **Decided** (required by §1) |
| Gem-to-noise stays low; per-account voice consistency | **Decided** (rules — violating breaks the corpus's purpose) |
| Per-zone density mix | **Starting prior** — confirmed by listening |
| Trap taxonomy (the five classes) | **Decided** (the moat's structure) |
| Obliqueness = labeler disagreement; agreement = moat health | **Decided** (Track A principle) |
| Scaling targets 100–150 → 300–500 | **Starting prior** — the plan, not a promise |
| Fixture 002 contents | **Specified, deferred** (buildable on demand) |
| The *exact* realistic stream (cadence, ratios dialed in) | **Discovered** — by generating, labeling, and listening |

---

## §7 · Where it plugs in

- **Feeds `seed-items.json`** — accounts (with the new `locality` field) + items, authored per §5, trap-weighted per §4.
- **Feeds `gold-labels.json`** — but only *after* the PO confirms each label; this spec never pulls labels ahead of the engine (the v0.3.0 discipline).
- **Feeds the meaning pass** — Axis-B source-band derivation (§1) and zone recognition (§3) are meaning-layer work; the locality determination lives here, not in `closeness.ts`.
- **Serves Parallel Track A** — this *is* the methodology that makes the corpus scale a credible moat rather than an overfit demo. It is the answer to "would this transfer to a buyer's graph?"
- **Raises one decision** — the §1 closeness reconciliation, for TL ratification and a Decision-Log entry. That ruling unblocks consistent closeness-labeling of every new community/family item, which is why it comes *before* the scale, not after.

> **The discipline this doc asks the team to hold:** the world is the substrate the evidence runs on, so its rigor is the evidence's rigor — but it is still `[SUPPORT]`. Build the schema and the method; author and label in parallel with the formula work, never instead of it. The corpus moves the project when it *scales under a method that resists overfitting*. This is that method.
