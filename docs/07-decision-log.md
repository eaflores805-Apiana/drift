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
2. **GTM posture: loud-public vs quiet-direct.** Loud public demand can be *leverage* or a *roadmap for platforms to clone* (the Huxe risk). Engineer 1's lean: quiet-direct, given how copyable the idea is. Needs the team. `[RESOLVED 2026-06-19 — public]`
   - *Resolution:* Acting Manager elected to make the repo public to give web-based LLM teammates direct URL access (private-repo URLs can't be fetched without auth). Accepts the cloning/visibility risk in exchange for collaboration ergonomics. Repo protected by proprietary `LICENSE` (visibility is not a license). Pending formal ratification by Engineer 1 and Engineer 2.
3. **Scoring weights & thresholds.** To be tuned empirically via the bench, not decided on paper. `[OPEN — resolved by Phase 1]`
4. **Hardest open engineering problems:** (a) relevance-to-you computation; (b) inferring magnitude for friend posts that are life events without saying so. `[OPEN — research]`
5. **Owned-network thesis** as a real product direction (vs. just the sim constraint). `[OPEN — own conversation]`

---

## Next action
Build **Phase 0** (40 simulated accounts, ~3 posts/day, varied complexity + a fictional listener) and the **measured Phase 1 bench** (scores the engine against human labels, dials exposed). This answers the only question that gates everything: *is the editorial judgment good?*
