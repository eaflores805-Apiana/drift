# Drift — Record & Execution Plan
*The single source of truth for Drift's experience layer (UI / attention model / focus modes). Supersedes the earlier product-plan.*

> **STATUS: CANONICAL (experience layer) · v0.1.0** · 2026-06 · promoted from working-draft 2026-06-21 per the canonical reorganization (no content change; relabel only — content audit verified this is the sole home of the attention ladder, the one-card layout, and focus-modes-as-threshold-reweighting).

> **The promise:** Drift makes your world feel alive while your music plays.
>
> **The category (what it is):** A music-first personal radio station where a DJ lightly connects the people, places, companies, creators, and news you care about — with focus modes that shift the mix without turning the world off.
>
> **Document map:** This is the top-level record + plan. The detailed engine spec lives in `drift-rules-and-format`. The prototypes (`drift-demo`, `drift-onecard`) are scaffolding that helped us think. The reference image (one-card, album-art, focus row) is the locked visual target.

---

# PART I — THE RECORD

## 1. First principles (the spine — everything derives from these)

1. **The radio is the hero; the app is the stage.** The UI supports the station, never the reverse.
2. **It should never feel like scrolling. It should feel like listening.**
3. **Doorway, not destination.** Drift surfaces the signal and points you back to your real life (text Mark; open the article) — it never tries to be the last thing you look at.
4. **Most content is ambient; some earns the mic.** The default is silence; interrupting the music is the exception.
5. **The DJ never sounds like it's reading a feed — it sounds like it noticed something worth sharing.** "Oh, *this* is why you interrupted the music," not "why is my phone narrating LinkedIn at me."
6. **The brain is the product.** The editorial judgment is the only defensible asset; the beautiful UI is set dressing. *Don't build a beautiful radio with a dumb DJ.*

## 2. The experience model

### The attention ladder
| Rung | What it is | Voice? | Who moves it |
|---|---|---|---|
| **Ambient** | Cleared privacy, not worth interrupting for. Rotates quietly in the card, glanceable, ignorable. *Most things.* | No | Default |
| **Voiced** | Earned a highlight — DJ speaks it, the card rises, music ducks, then it settles back. | Yes | Engine (auto) or listener pulls up |
| **Expanded** | Listener tapped "tell me more" — deeper, interactive, close-friend routing. | Yes | Listener |

### The layout (per the locked reference)
One screen, no feed: a persistent **player** (album art default, retro turntable an optional view), a single **story card** with the three states above, a **quiet history** strip (the discoverability safety net for the silent rotation), the **focus row**, and the **privacy line**. Drama comes from focus + motion (the card rises, music visibly ducks), not heavy chrome.

### Focus modes (not channels)
Weighting knobs, **not** content silos — like an EQ, not a filter. Multi-select (Friends + Local + News + Products + Creators; "Balanced" = several on). A selected focus **increases priority, not exclusivity**: strong items from other sources still rise. Implemented as a **per-source re-weighting of the promotion threshold** (lower the bar for the focused source, slightly raise it elsewhere) — *not* a yes/no mask, so the DJ keeps permission to surface a weather alert during a friends session. The teaching line does the work of a tutorial: *"Friends focus · still blending local, news, and drops."* Quiet, collapsible — steering wheel, not dashboard.

## 3. The brain — what it decides and how it's judged

### The metric (the important reframe)
Not *"is this important?"* but **"would hearing this make the listener feel more connected to life?"** A local team going to CIF is globally trivial and emotionally high — pride, place, belonging. Importance-only scoring buries it; **connection scoring** surfaces it. The product is *aliveness*, not updates.

### The promotion score
Four factors — **magnitude × closeness**, boosted (never zeroed) by **relevance** and **timeliness**. Voiced if it clears the threshold **and** passes the glad-test **and** is novel. Focus re-weights per source (§2). Boosters matter: they're why it works on day one instead of staying silent until it knows everything about you. *(Full schemas in `drift-rules-and-format`.)*

### Cadence
**Restraint is the default.** The bar isn't "worth mentioning" — it's "worth *interrupting the music* for," which is much higher. Talk less than feels natural. Everything else drifts silently.

### Evaluation axes (what the bench must measure)
Beyond "did it score high": does it **create connection**, add **world/social/local texture**, feel **earned as radio**, give the DJ **a reason to interrupt** — and **create warmth without inventing facts** (see §4).

## 4. The taste & safety layer (the IP)

- **Consent frame:** only re-renders **published** content; anything private is dropped **at ingest** and never reaches the engine. (Same category of act as a screen reader — no new data flow.)
- **Host rules:** report-don't-expose; specificity scales inversely with sensitivity; **notice → open → release** (generic blessing, never smuggling a fact); **proximity routes behavior inverted** (closer → less detail, hand off to the relationship; public → tell it); **whether-to-voice (importance) is separate from how-to-say-it (sensitivity)** — a grief post may surface, but never as a bright highlight.
- **THE refinement that makes "connection" safe — texture about the world, never invention about the soul.** The connection metric explicitly asks the DJ to be *evocative*, and evocative is one inch from inventing. The line: the DJ may color in the **context** (the city's atmosphere, what a championship run feels like in general, a festival weekend's vibe) because that's shared public reality, true regardless of the person — but it must never color in the **person's interior** (their motives, feelings, private circumstances). *"Mark's in DC, the city's buzzing — whatever brings him there, safe travels"* (texture about DC, refuses to invent his reason). Add atmosphere to the **setting**, never to the **person**.
- **The unifying test:** *"Would you be glad I brought this up right now?"* — both the promotion guardrail (catches important + useful + delightful) **and** the safety test (would the *person* be glad to be mentioned). One question, both jobs, with veto power over the math.

## 5. The learning loop
Focus modes = cold-start priors; **likes = gain, not a floor** (more of Mark, not all of Mark — his sandwich still scores ~0); skips = negative gain; promotes = strong positive. Over time learned weights dominate and focus fades — *"Balanced" becomes your balance.* **Honest limits:** relevance-to-you and the multi-week learning curve can be *gestured at* but not *proven* in a single-session prototype.

## 6. Audience & scope
**18–34**, "in the now," music + friends + interests. Deliberately **not teens** — minors' social data triggers COPPA/teen-privacy law, platforms guard it hardest, and a buyer reads it as liability. 18–34 also has the cleaner data story and the spending.

## 7. Deferred — Chapter Two (explicitly parked, not forgotten)
- **The private dedication** *(the network-effect feature, and the warmest idea we have).* Your close people can occasionally slip a note into your station that the DJ carries to you in its own voice. Crucially **one-to-one, not a shared room** — which is what makes it special (a dedication with an audience of one, the call-in minus the performance) *and* what dissolves the presence/moderation pain: no public roster, just "is my person reachable?", and no crowd to perform for. The **one-per-hour limit** stays (scarcity = a considered gesture + natural throttle). Deferred from the POC because it drags in presence/moderation before the core is proven.
- **Shared live rooms / "who's listening" roster** — not in the POC.
- **The owned-network thesis ("3 posts/day for everyone, no exceptions").** Floated as a data workaround, but it's actually a **product thesis**: the structural anti-feed (scarcity by design — no firehose, no doomscroll). Worth its own conversation. Trade: owning the network turns the data wall into a *growth/cold-start* wall. For the POC it's simply the simulation constraint; as a real direction it may be the most original idea here.

## 8. Strategic context (brief)
Every layer is buyable/commoditizing **except editorial-taste + the trust layer** — a thin moat, so the realistic outcome skews to **acquisition or engine-supplier**, not a solo consumer win. The differentiating asset is the **social feed**, which only platforms (Meta/X) own — and that **data wall is the central obstacle**. The owned-network idea (§7) is one honest answer to it. The cautionary tale stays in view: the Washington Post's personalized podcast was pulled into conflict for hallucinations — *taste and trust are the product, not polish.*

---

# PART II — THE EXECUTION PLAN

## Build philosophy (the "how" decisions, settled)
- **Inside-out, not outside-in.** Prove the brain in the ugliest harness *before* any polish. The surface is the cheap part now; the judgment is the unproven part.
- **API now, not local.** Call the strongest model so we test the *ceiling* of the idea — a weak local model risks a false negative (can't tell if the idea is bad or the model is small). Local hosting is a **production** concern (cost/privacy/independence), not a prototype one.
- **No LoRA now.** Prompt the DJ. You can't fine-tune toward a voice you haven't finished discovering. The validated voice + accumulated good outputs *become* the training set later, **if** we distill a DJ for production ownership/cost. Local hosting + LoRA are the same future chapter.
- **Simulate the inputs; don't fake them.** We can't get real friend data without the platform wall and the privacy mess — so simulate friends. News/local/weather are genuinely fetchable (real, current). Relevance and learning are gestured at. **Do not scrape real people to look "more real."**
- **Make the worst case boring, not wrong.** Tune so uncertainty yields pleasantly bland, never confidently mistaken. A dull Drift is fine; a wrong/exposing Drift is fatal.

## The phases

### Phase 0 — The simulated world *(the corpus)*
Build the test data: **40 simulated accounts**, varied complexity, **~3 posts/day each**, each with a defined closeness to "you," plus a defined fictional **listener** (location, interests, calendar, followed orgs/creators). One model + 40 persona descriptions — no LoRA, no local.
**Deliverable:** a messy, realistic corpus + listener profile.
**Answers:** do we have realistic raw material to test against?

### Phase 1 — The promotion bench *(THE experiment)*
A bare harness: items flow in, scored live against the rules, you **watch what rises to voiced vs. stays ambient**, with the dials exposed (closeness, magnitude, threshold, focus weights, chattiness). DJ prompted from the host spec. Run against the Phase 0 corpus + **real** news/local.
**Evaluation = the §3 connection axes**, including "warmth without invented personal facts."
**Deliverable:** a tunable bench.
**Answers the only question that matters:** *is the editorial judgment good?*

### Phase 2 — Tune & validate the voice
Run it; tune the dials until the cadence feels right (restraint default, right things rising, junk staying quiet); find and validate the DJ voice; accumulate the good outputs.
**Answers:** is the brain *and* the voice real — and what is the voice, exactly?

### Phase 3 — Wrap in the interface
**Only after the brain is proven**, build the one-card UI (per the reference) around the validated engine: album-art player, focus modes, the three card states, the motion.
**Answers:** does the proven brain feel magical in the real surface?

### Phase 4+ — Production / Chapter Two
Real TTS voice upgrade; local hosting + possible LoRA distillation (cost/ownership); the private-dedication feature; the owned-network decision.

## Immediate next action
**Build Phase 0 + Phase 1** — the simulated corpus and the promotion bench — and finally see whether the brain works. Everything else waits on that answer.
