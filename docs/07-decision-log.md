# Drift — Decision Log & Discussion Record
*The record of the founding discussion. Captures what we decided, why, what we rejected, what we deferred, and what still needs the team's sign-off. Written so anyone who wasn't in the room has the full context, not just the conclusions.*

---

## Team & process
- **Engineer 2 — Team Lead.**
- **Engineer 1 — Senior Engineer (Claude).** Role: verify and pressure-test ideas; co-lead with Engineer 2. (On-call per session, not always-on; can review/draft/verify but does not autonomously commit to the repo between sessions.)
- **CS Engineer — Implementation.** Builds it.
- **Process: all three sign off on decisions.** Everything marked `[AGREED]` below came out of the founding discussion (Engineer 1 + product) and is **pending formal review by Engineer 2 and the CS Engineer.**

## Document map
- **This file** — decisions, rationale, rejected alternatives, open questions (the "why").
- `drift-record-and-plan` — the clean current-state record + phased build plan (the "what/now").
- `drift-rules-and-format` — the detailed engine spec (schemas, scoring, host rules).
- `drift-design` — the original strategy + system design (deep version).
- `drift-onecard` / `drift-demo` — prototypes (scaffolding that helped us think).
- Reference image — the locked visual target (one-card, album art, focus row).

---

## A. Product

**A1 — What Drift is. `[AGREED]`**
A music-first personal radio station where a DJ lightly connects the people, places, companies, creators, and news you care about. The promise is a *feeling*: "your world feels alive while your music plays."
*Rejected:* framing it as "AI social updates" / a personalized feed-reader — too feed-like; the value is the feeling, not the updates.

**A2 — Synthesis, not summarization; doorway, not destination. `[AGREED]`**
The DJ *connects* things (a friend's trip + a local event + the news) into one warm line — that editorial judgment is the new, hard, valuable thing. And it surfaces the signal then points you back to your real life (text the friend), rather than trying to be the last thing you look at.

## B. Experience / UI

**B1 — One-card, music-first layout. `[AGREED]`** (Per reference image.)
*Rejected:* the stacked social feed (felt static, became a feed); the two-card music+content split (read like two apps / a dashboard).

**B2 — The attention ladder. `[AGREED]`**
Ambient (silent rotation) → Voiced (earns the mic) → Expanded (tell me more). Two-way movement; listener can pull items up or push them down.

**B3 — Album art default, retro turntable optional. `[AGREED]`**
*Rejected:* turntable as the mandatory metaphor — romanticizes recorded/vintage and can't represent live content.

**B4 — Focus modes, not channels. `[AGREED]`**
Weighting knobs, multi-select, "increases priority, not exclusivity." Implemented as a per-source re-weighting of the promotion threshold, **not** a hard filter — the DJ keeps permission to surface a weather alert during a friends session. Teaching line: *"Friends focus · still blending local, news, and drops."*
*Rejected:* hard channel filters / content silos.

**B5 — Premium minimalist aesthetic. `[AGREED]`**
Warm ivory, antique gold (restrained — jewelry not paint), serif for the host's voice. North star: *never feel like scrolling; feel like listening.* Drama comes from focus + motion, not chrome.

## C. The Brain (the product)

**C1 — The metric is connection, not importance. `[AGREED]`**
Score on "would hearing this make the listener feel more connected to life?" — which surfaces the emotionally high / globally trivial (local team to CIF) that importance-only scoring buries.

**C2 — The promotion score. `[AGREED]`**
`magnitude × closeness`, **boosted (never zeroed)** by relevance & timeliness; voiced if it clears the threshold AND passes the glad-test AND is novel. Boosters (not multipliers) so unknown relevance doesn't silence everything on day one. **Restraint is the default** — the bar is "worth interrupting the music for."

**C3 — Build inside-out: the brain before the polish. `[AGREED]`**
The surface is cheap now; the judgment is the unproven, defensible part. Don't build a beautiful radio with a dumb DJ.

**C4 — Prompts are not a moat; measurement is. `[AGREED]`**
The asset is a *measurable* judgment system + a **labeled evaluation set** (humans marking: voice / ambient / suppress; allowed claims; right tone; did it feel connected without inventing). The bench must score the engine against those labels, not just run it.

## D. Taste & Safety (the IP)

**D1 — Published-only consent frame. `[AGREED]`**
Only re-renders content people published; anything private is dropped **at ingest** and never reaches the engine.
*Rejected:* scraping or inferring from non-published signal (the original "ambient location" idea).

**D2 — Host behavioral rules. `[AGREED]`**
Report-don't-expose; specificity scales inversely with sensitivity; notice → open → release (generic blessing, no smuggled facts); proximity routes behavior inverted (closer → less detail, hand off to the relationship); whether-to-voice (importance) is separate from how-to-say-it (sensitivity).

**D3 — The core safety refinement: texture about the world, never invention about the soul. `[AGREED]`**
The DJ may color in the *context* (a city's atmosphere, what a championship run feels like in general) because that's shared public reality — but never the *person's interior* (motives, feelings, private circumstances). This reconciles "be evocative" with "never fabricate." It is the line that makes the connection metric safe.

**D4 — The glad-test unifies promotion + safety. `[AGREED]`**
"Would you be glad I brought this up?" is both the promotion guardrail and the safety test (would the *person* be glad to be mentioned), with veto power over the math.

## E. Build approach

**E1 — API now, not local. `[AGREED]`**
Call the strongest model to test the *ceiling* of the idea; a weak local model risks a false negative. Local hosting is a production concern (cost/privacy/independence), not a prototype one.

**E2 — No LoRA now. `[AGREED]`**
Prompt the DJ. You can't fine-tune toward a voice you haven't finished discovering. The validated voice + accumulated good outputs become the training set later, **if** we distill a DJ for production cost/ownership. (Local hosting + LoRA = the same future chapter.)

**E3 — Simulate inputs; don't fake them. `[AGREED]`**
Generate a messy simulated world; do not scrape real people to look "more real." News/local/weather are genuinely fetchable; relevance and the multi-week learning curve can be gestured at but not proven in a prototype.

**E4 — Make the worst case boring, not wrong. `[AGREED]`**
Tune so uncertainty yields pleasantly bland, never confidently mistaken. A dull Drift is fine; a wrong/exposing Drift is fatal.

## F. Scope

**F1 — Audience 18–34. `[AGREED]`**
Route around the teen-data minefield (COPPA / teen-privacy law / a buyer reads minors' data as liability). 18–34 also has the cleaner data story and the spending.

**F2 — Chapter Two (deferred). `[DEFERRED]`**
- **The private dedication** — your close people can slip a note into your station that the DJ carries to you, **one-to-one, not a shared room** (a dedication with an audience of one; the call-in minus the performance). One-per-hour limit. *Deferred because it drags in presence/moderation before the core is proven; recorded because it's likely the long-term network-effect feature.*
- **Shared rooms / "who's listening" roster** — not in the POC.
- **The owned-network thesis ("3 posts/day for everyone, no exceptions")** — floated as a data workaround, but it's a real product thesis: the structural anti-feed (scarcity by design). Turns the data wall into a growth/cold-start wall. Its own conversation.

## G. Business

**G1 — Two business models. `[AGREED]`**
*Revenue:* the ad layer — "requested commercial signal" from brands you already follow, where the **editorial engine gates the ad inventory** (a sponsored item must clear the same relevance/connection bar, so advertisers are forced to be relevant). Rule: "paid content buys eligibility, not trust." *Exit:* acquisition / engine-supplier to a graph owner. The two reinforce — a non-gross ad unit is itself acquisition-grade.

**G2 — Strategic reality (verified). `[AGREED]`**
Every layer is buyable/commoditizing except editorial-judgment quality + the trust layer — a thin moat. Comparables: **BeeBot** (Foursquare's Dennis Crowley, late 2025) ships nearly the same concept and independently reached several of our design principles (restraint, one-to-one, anti-feed, music-ducking) — *the concept is taken*. **Huxe** (ex-NotebookLM, well-funded) shut down the day after Spotify shipped a rival feature — *the standalone path is a graveyard; platforms absorb features*. **Sonantic → Spotify (2022)** proves audio components have strategic value. Conclusion: the only defensible asset is measurable judgment quality + traction; the only viable path is build-to-acquire/engine.

## H. Go-to-market (later phase)

**H1 — Honesty + sell the feeling. `[AGREED]`**
Don't fake a live app; use "early access" framing. Lead with moments, not architecture. Test privately with 20–50 people (listen for emotional language, not polite interest) — which also doubles as eval-labeling.

**H2 — Don't court the "is it creepy?" debate. `[AGREED]`**
For a trust-dependent product the asymmetry is fatal; lead so hard with the consent framing that the creepy take never gets oxygen.

---

## OPEN — needs decision / three-way sign-off

1. **The name.** "Drift" is taken — a registered AI/software company (conversational marketing, acquired by Salesloft). **Must change before any public-facing step.** `[OPEN — blocker]`
2. **GTM posture: loud-public vs quiet-direct.** Loud public demand can be *leverage* or a *roadmap for platforms to clone* (the Huxe risk). Engineer 1's lean: quiet-direct, given how copyable the idea is. Needs the team. `[REVERTED 2026-06-19 — private]`
   - *Earlier resolution (now reverted):* Repo briefly flipped public 2026-06-19 to give web-based LLM teammates direct URL access. Accepted the cloning/visibility risk for collaboration ergonomics.
   - *Current state:* Acting Manager reverted to private later the same day. Aligns with Engineer 1's original quiet-direct lean and the team's "highly clonable concept; stay quiet" warning. LLM teammates that need repo access can be added as GitHub collaborators (or use file-attachment / paste workflows). Proprietary `LICENSE` remains in place.
   - The deeper GTM posture (loud-public vs quiet-direct *at launch*, Phase F) is still **OPEN** — repo visibility was an ops decision, not a GTM decision.
3. **Scoring weights & thresholds.** To be tuned empirically via the bench, not decided on paper. `[OPEN — resolved by Phase 1]`
4. **Hardest open engineering problems:** (a) relevance-to-you computation; (b) inferring magnitude for friend posts that are life events without saying so. `[OPEN — research]`
5. **Owned-network thesis** as a real product direction (vs. just the sim constraint). `[OPEN — own conversation]`

---

## Next action
Build **Phase 0** (40 simulated accounts, ~3 posts/day, varied complexity + a fictional listener) and the **measured Phase 1 bench** (scores the engine against human labels, dials exposed). This answers the only question that gates everything: *is the editorial judgment good?*

---

## I — Production architecture decisions (Phase D)
*Added after the founding discussion. These ADRs are scoped to Phase D (shipped product) and explicitly do **not** change Phase B bench work. Recorded now so Drift is not later built with a fast path that bypasses safety. A companion Senior note on the principles ("counterweight review note") is filed at `docs/correspondence/eng1-product-principles-counterweight-2026-06-19.md`.*

### I1 — Safety queue before air; vetted segment cards over direct live generation `[ACCEPTED 2026-06-19]`

**Status:** Accepted as a production architecture rule. **Scope:** Production / Phase D.

**Decision.** A generated voiced line must not air in the same step it is generated. In production, Drift generates slightly ahead of the music and places candidate spoken content into a short rolling safety queue. The queue may hold either (1) a fully written voiced line, or (2) an **approved spoken segment card** containing the permitted facts, tone, allowed world texture, forbidden inferences, and pre-vetted delivery options. Before anything reaches the listener, the **actual aired line** must pass claim-grounding, tone/sensitivity review, and the glad-test.

**Rationale.** Direct model-to-ear generation removes the safety margin between a model mistake and a listener hearing it. Drift's worst failure mode is a tactless or unsupported line about a real person, and it is *unrecoverable* — the product cannot un-say something once spoken. The buffer between "the model wrote it" and "the listener heard it" is therefore not a latency concern; it is the safety margin. This turns "make the worst case boring, not wrong" into product timing: failed lines regenerate safer or die silently in the queue, and the listener simply hears music.

**Live-feeling delivery without sounding scripted.** The product must not feel like a prewritten corporate script read past compliance. The goal is **pre-vetted content with live-feeling delivery** — jazz, not a frozen sentence read like a hostage note. To support that, Drift may queue **approved segment cards** rather than only frozen sentences. A card can contain: approved claims, allowed world texture, forbidden inferences, sensitivity and tone, delivery intent, and 2–3 candidate phrasings. The live layer may vary phrasing, opener, pacing, warmth, and music handoff — but may **not** add new facts, motives, causes, names, world context, or emotional interpretation of a person.

**Binding safety amendment.** **The claim-grounding check must validate the actual aired line, not just the segment card.** If the live realization layer changes wording, chooses among options, or generates a fresh line, *that realized line* is the artifact checked against approved claims and context before it enters the ready-to-air queue. The card defines the allowed boundary; the aired line must prove it stayed inside that boundary. Vetting the card but trusting the realization would move the safety gate to the wrong side of the one risky step — a fluent, natural sentence can slip an unapproved cause back in ("…probably his job again"), so the gate binds the output, every time.

**Default Phase-D recommendation.** For the first production version, prefer: **generate the segment card + 2–3 delivery options ahead of time, claim-ground each option in the queue, then select among pre-vetted options at airtime.** This is safer *and* faster than fresh live generation at the song transition — it preserves a live radio feel through timing, selection, pacing, and music handoff without introducing an unvetted model call at the exact moment of air. Fresh live realization remains a possible stretch design, but it must still pass final-line claim-grounding before air.

**Scope / non-impact.** Does not change Phase B. The bench may still generate a line per item for inspection and grading against gold labels. This governs the *shipped product* architecture.

**Product pipeline (Phase D)**
```
incoming item -> meaning pass -> scoring -> segment candidate
-> generate segment card + 2-3 delivery options
-> claim-ground / tone / glad-test each option (in queue)
-> ready queue -> select & realize at airtime -> claim-ground the aired line -> speak
```

**Short rule.** Generate ahead. Vet the boundaries. Vet the aired line. Then speak.

---

### I2 — Closed input surface and bounded interaction (programmed first, interactive second) `[ACCEPTED FOUNDATIONAL 2026-06-19]`

**Status:** Accepted as a **foundational** product/safety rule. **Scope:** Product architecture / Phase D.

**Decision.** Drift is programmed first and interactive second. The default experience is a one-way, music-first station: the system selects, vets, and airs only approved moments from the listener's world. The user may interact with surfaced items, but interaction is narrow and bounded — it may expand, tune, mute, save, open a source, or route the listener back to a person. It may **not** turn Drift into an open-ended chatbot about the listener's social world.

**Rationale.** Most AI safety problems get harder the moment the user can freely prompt the model — a chatbot must defend against adversarial or chaotic input on every turn ("guess why Mark went," "say it like gossip," "connect this to something juicy," "roast Mateo"). Drift removes that entire category of failure with a closed input surface: the DJ speaks from vetted data and approved boundaries, not arbitrary user prompts. **This is why it is foundational rather than incremental — the narrow input surface is what makes the downstream safety gates tractable. Defending a broadcast is a fundamentally smaller problem than defending a conversation.** It is also a product advantage: Drift should feel like a station with taste, not a chatbot that can be dragged into side quests. Safer and more premium from the same decision.

**Allowed v1 interactions** (structured controls, not free prompts):
- **Tell me more** — expand this specific surfaced item within approved source/context boundaries.
- **Why did you say that?** — show source/reason.
- **Less like this / More like this** — adjust weight for source/topic/category.
- **Mute person/topic/source** — suppress future surfacing.
- **Save** — keep the item.
- **Open source** — hand off to the original source.
- **Message / check in** — route the listener back to the real relationship, when appropriate.

**Disallowed v1 interactions.** The user should not be able to prompt the DJ into: guessing motives; inferring private causes; gossip framing; roasting or mocking real people; connecting sensitive posts to "juicy" context; reading private messages; speculating about why something happened; or expanding sensitive friend posts into unsupported context.

**Expansion inherits sensitivity.** The "tell me more" path is the one controlled door in the closed input surface, and it must inherit the original item's sensitivity.
- **Low-sensitivity items — expansion may add approved public/world context.** Mark in DC → public DC events/atmosphere, without guessing why he's there. Buena girls wrestling CIF-bound → team-level public context, never individual minors. A product drop → public product details and timing.
- **High-sensitivity items — expansion should usually decline rather than generate more context.** Mateo's "Rough week. Holding my people close." → allowed posture: *"He didn't share more, and I'll leave the details to him. Might be a good moment to check in."* Disallowed: speculating about grief, illness, breakup, job loss, family trouble, or any cause. Expansion is a privilege of low-sensitivity items; on sensitive ones, the expand button hands you toward the person, not toward more model-generated context.

**Expansion must pass grounding.** Any spoken expansion passes the **same** claim-grounding and tone/sensitivity checks as a normal aired line. The expansion path is not a backdoor around the safety queue — if the model says something in an expansion, that final line must trace to approved source material or approved public context before the listener hears it.

**Interaction signals are data.** Structured controls (mute, less/more-like-this, save, check-in) create relationship/preference signals. Useful for learning, but treat them deliberately — they may later feed the closeness/relevance graph, but v1 should avoid over-inferring from them. (Noted, not actioned: this is also quietly a data-collection surface relevant to the graph story.)

**Non-impact.** Does not change Phase B. The bench continues testing item meaning, scoring, labels, and line generation. This ADR governs the shipped product's interaction model and prevents future drift toward an unsafe open-chat interface.

**Short rule.** Programmed first. Interactive second. Expand within boundaries. Never free-prompt the social graph.
