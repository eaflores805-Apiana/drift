# Drift — Roadmap (the map)
*The biggest steps, in order. Check here to see where we are and whether we're on task. The detail lives in the other docs (decision log, rules-and-format, architecture review); this is the overview.*

**North star:** *Do the right things earn the microphone?* — i.e., can Drift make you feel connected to your world while your music plays.

**The on-task rule:** for any new idea, ask *"Later. Does it help prove the brain?"* If not, it waits.

**The order IS the strategy:** each phase gates the next. We do **not** jump ahead — a beautiful UI or a public launch before the brain is proven just hands a validated idea to a competitor (see: Huxe).

---

## ▶ YOU ARE HERE → Phase B, step 2 (gold-labeling)

---

### Phase A — Foundations `[DONE]`
*Everything locked before we started building. Signed off by both engineers; full rationale and the rejected alternatives are in the decision log.*

**Product**
- Drift = a music-first personal radio station; the promise is a *feeling* ("your world feels alive while your music plays"), not "updates."
- Synthesis, not summarization. **Doorway, not destination** — it surfaces the signal and points you back to your real life.

**Experience / UI**
- The **attention ladder**: ambient (silent rotation) → voiced (earns the mic) → expanded (tell me more).
- **One-card, music-first** layout (per reference image). *Rejected:* the stacked feed, the two-card split.
- **Focus modes, not channels** — weighting knobs, multi-select, not content silos.
- **Album art default** (turntable optional). Premium minimalist: warm ivory, antique gold, serif voice. North star: never feel like scrolling.

**The brain**
- Score on **connection**, not importance.
- Score = magnitude × closeness, **boosted (never zeroed)** by relevance & timeliness; **restraint is the default**.
- **Build inside-out** (brain before polish). Prompts aren't a moat — a **measurable judgment system + a labeled eval set** is the asset.

**Taste & safety (the IP)**
- **Published-only** consent; anything private is dropped at ingest.
- Host rules: report-don't-expose; vaguer-when-sensitive; notice-open-release; proximity routes behavior (inverted); **whether-to-voice is separate from how-to-say-it**.
- The core refinement: **texture about the world, never invention about the soul.**
- The unifying **glad-test** ("would you be glad I brought this up?") = promotion guardrail + safety test.

**Learning loop**
- Channels = cold-start priors; likes = **gain, not a floor** ("more of him, not all of him"); learned weights eventually dominate.

**Scope**
- Audience **18–34**; route around the teen-data minefield.
- **Chapter Two (deferred):** the private dedication (one-to-one note to the DJ), shared rooms, the owned-network "3 posts/day" thesis.

**Business & strategy**
- Two models: the **ad layer** (the engine gates the ad inventory; "buys eligibility, not trust") + **acquisition / engine-supplier** exit.
- Thin moat except editorial-judgment + trust. Comparables verified: **BeeBot** (near-identical concept, Foursquare's Crowley), **Huxe** (reinforces the risk of a standalone personalized-audio path when platform incumbents can move quickly), **Sonantic → Spotify** (audio components have strategic value).
- GTM principles: no fake live app; sell the feeling; private-test first; don't court the "is it creepy?" debate.

**Technical architecture**
- **Hybrid scoring:** the model judges *meaning*, code computes the *score* and bucket (inspectable, reproducible, instant slider recompute).
- Safety is **deterministic and fail-closed, in two places**: the consent gate at ingest + post-generation claim-grounding.
- **Gold/eval set first** (the target, not end-of-line QA). Headline metric: bucket agreement with gold labels.
- Schema grouped into **Ingested / ModelDerived / Computed / Decision**. The **listener is a first-class object**.

**Team & process**
- PO (vision/approval), Engineer 1 (architecture/risk — me), Engineer 2 (specs/direction), CS Engineer (builds). All three sign off; *"Later — does it prove the brain?"* gates scope.

**Artifacts produced**
- Strategy & system design · rules-and-format spec · decision log · architecture review · two UI prototypes · the seed corpus + listener · this roadmap.

### Phase B — Prove the brain (the Promotion Playground) `[NOW]`
The whole game right now. A bench that takes messy social/local/news/product input and decides what drops, stays ambient, or gets voiced — and is *measured* against human taste.
- `[DONE]` Seed corpus + defined listener
- `[NOW]` **Gold-label a subset** (PO + 1–2 others) ← the current task. Doesn't block playground-shell work, but blocks scoring validation & tuning.
- `[NEXT]` Meaning-pass prompt (the model layer)
- `[ ]` Deterministic scoring engine + sliders (CS Engineer)
- `[ ]` Safety gates (consent gate + post-generation claim-grounding)
- `[ ]` DJ line generation
- `[ ]` Measure vs. gold labels + tune
- **Phase B exit criteria (pass/fail):**
  - Gold-labeled subset complete.
  - Engine bucket agreement clears the target threshold.
  - **Zero** high-sensitivity false-voice examples (hard fail if any).
  - Sliders recompute instantly, with no model calls.
  - Every voiced line has fully grounded claims.
  - Every decision has an inspectable reason.
  - PO agrees the top voiced examples feel natural — not like a hit list.

### Phase C — Validate taste & voice `[LATER]`
Run it, tune the cadence until it feels like a sharp DJ (restraint default), find and validate the voice, and bank the good outputs.
**Proves:** the brain *and* the voice are real. (The good outputs become the training corpus if we ever distill a DJ.)

### Phase D — Wrap it in the interface `[LATER]`
Build the one-card UI (album art, focus modes, motion — per the reference) around the *proven* engine.
**Proves:** it feels magical in the real surface.

### Phase E — Private test `[LATER]`
Show 20–50 people; listen for emotional language, not polite interest. Doubles as more gold labels.
**Proves:** people actually want it.

### Phase F — Go to market `[LATER]`
Real name, early-access framing, decide loud-vs-quiet, approach buyer(s).
**Proves:** there's real demand/leverage — or a clean direct path to a buyer.

### Phase G — Production & Chapter Two `[LATER]`
Real TTS voice, local hosting / LoRA (cost + ownership), the private-dedication feature, the owned-network ("3 posts/day") question.

---

## Open decisions to resolve along the way
*(So they don't ambush us mid-flight.)*
- **Name** — "Drift" is taken. **Blocker before Phase F.**
- **Loud-public vs quiet-direct GTM** — team call, before Phase F. (Eng 1 leans quiet.)
- **Scoring weights/thresholds** — resolved empirically in Phase B.
- **Relevance computation + inferring magnitude from friend posts** — hardest open engineering; surfaces in Phase B.
- **Owned-network "3 posts/day" thesis** — its own conversation.

---

## Quick status line
**Done:** foundations + architecture + seed data. **Now:** gold-labeling. **Phase B gates everything downstream.** **Don't touch yet:** UI polish (D), launch (F).
