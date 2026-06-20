# Drift — Product Description & Vision
### The team-alignment document

> **v0.1.0** · 2026-06-19 · This is the single source of truth for *what Drift is, what it is for, how it works, and what we are actually building right now.* If you are on the team and you are unsure what we're making or why a decision was made, start here. It is written to be honest, not promotional — it states the vision, the realistic scope, and the open challenges with equal weight, because a team that shares only the dream and not the constraints will build the wrong thing.

---

## 0. The one-paragraph version

Drift is a music-first personal radio station with an AI DJ that makes you feel connected to your own world — your friends, family, local life, the teams and creators and companies you chose to follow — by weaving grounded, tasteful moments from that world into the music you're already listening to. It is not a feed and not a chatbot. It speaks rarely, and when it speaks it earns the interruption. **The music is the carrier; the DJ is the product.** The thing of value — the thing nobody has — is the calibrated editorial judgment of what's worth saying, when, and what must never be said. The goal, stated as plainly as it can be: *the listener should look forward to the DJ coming in.* That is the gold. Everything else serves it.

---

## 1. Why Drift exists

Social feeds stopped feeling social. People open them to see their friends, family, places, teams, and the creators and companies they chose to follow — and get a machine-optimized stream of strangers, shorts, memes, ads, rage bait, and filler instead. The problem isn't that people stopped wanting connection. It's that the feed turned connection into noise.

> **The feed became noise. Drift turns the signal back into radio.**

The noise isn't an accident of the feed — it's the *business model* of the feed. Engagement-maximizing ranking produces rage bait and suggested strangers because that's what holds the thumb; your friend's local championship win doesn't. So Drift's bet is **structural**, not cosmetic: restraint instead of engagement, signal instead of time-on-app. The DJ doesn't try to maximize scrolling, posting, or staying. It earns the microphone only when something would make the listener feel more connected to their actual world.

That is why **"doorway, not destination"** matters: surface the moment, then point the listener back to life — text the friend, go to the show, support the team, catch the drop. Drift is something you *pass through* on the way back to your life, not a place that traps you.

**An honest caveat we hold internally (not a marketing line):** a real grievance is necessary but not sufficient. People hate the feed and still open it constantly, because the noisy feed is engineered to be habitual and a calm alternative isn't. Drift only wins if the music makes the higher-signal version habitual enough to compete. The grievance is the *opening*, not the *win*.

---

## 2. What Drift actually is — and what it is not

**Drift is a music station whose host knows your world.** You put on music the way you always do. Between songs — the way real radio has always worked — a warm, sharp, human-feeling DJ comes in: a quick word about the track, a genuine moment about someone or something you care about, the time and the weather, the vibe, and back to the music. Sometimes it's a single line. Sometimes, at the top of the hour, it's a longer hosted stretch. It is always brief enough to stay special and substantial enough to feel worth waiting for.

**The central reframe the whole team must internalize:** the music is a *plus* — it's the comfortable, familiar carrier that makes Drift feel like radio instead of an app. But the *product*, the meaningful thing, is **the personal experience the DJ offers you.** The value was never the playlist. It's the moment the DJ makes you feel seen.

What Drift is **not**:

- **Not a feed.** It does not list updates. It programs moments. Most things stay silent.
- **Not a chatbot.** You do not free-prompt the DJ about your social world. It is programmed-first; interaction is narrow and bounded (see §6).
- **Not a notification reader.** A five-second "Quick shoutout to Buena, CIF-bound, next track" is efficient and *worthless* — it's a notification with a voice. Drift speaks in *hosted moments* with shape and care, not alerts.
- **Not "AI that reads your feed out loud."** That is the failure mode we guard against in every decision.

---

## 3. What a session feels like

This is the experience we are building toward. A music break flows as one continuous, warm piece — not disconnected blurbs:

> *"...that was the new one from Khruangbin — something about that bassline on a slow afternoon. Hope the mix is hitting right. Now — huge congratulations to Jake Chambers, who just got into UCLA's grad program. That's no small thing. He's in good company, and UCLA's research programs are no joke. Late nights and a lot of coffee ahead, but worth every one of them — all the best to him. And closer to home: Buena High girls wrestling just made CIF. Months of 6am practices turning into a real moment — that's the kind of thing that slips right past the feed, but it matters here. Ventura's got something to cheer for. It's 4:50 on a fine Saturday, sun's out, 78 degrees in SoCal — let's keep the energy up. Here's the latest from Bruno Mars..."*

Notice the anatomy, because it's the whole product in miniature:

- **Most of it is safe by construction** — the artist note, the check-in, the warmth, the time, the weather, the handoff. This is the connective tissue that makes it feel like radio, and none of it touches a risk surface.
- **The personal moments** (Jake, Buena) are the *meaningful* part — and they're grounded: Jake's news, Buena's championship, both traceable to their sources, neither inventing anything about a person's inner life.
- **The dangerous instinct lives in exactly two places**, and they're nameable (see §5 and §7): the *specific factual flourish* (e.g. an unverified sports stat) and the *handoff into a sensitive beat*. Everything else is safe.

The session is **sparse**: a 30-minute session has only a few DJ moments, not a constant chirp. The listener should think *"oh, the DJ's coming in — what's it got?"* — never *"why is my app talking again?"*

---

## 4. How it works — the three layers

Drift is best understood as three distinct layers. Keeping them separate is what keeps the system tractable and safe. **A failure to separate them is the most common way the design goes wrong.**

### Layer 1 — Item judgment (per item)
For every incoming item: *Can it enter? What route does it serve? How strong is it within that route? What treatment is safe?* This is where the **judgment engine** lives, and it is the part that is largely built and working today.

### Layer 2 — Session programming (per listening window)
For the session: *How much DJ time is available? What kinds of moments should happen? Which candidates best fit those moments? Should we stay silent and let the music breathe?* This is the **airtime budget** — radio has slots, not infinite interruptions. **This layer is designed but deliberately not yet built** (it can't be, until Layer 1 reliably ranks candidates).

### Layer 3 — On-air execution (per spoken moment)
For the selected moment: generate/vet the segment card, choose pre-vetted phrasing, speak. This is where the **safety queue and grounding gates** do their final work. Also designed, not yet built.

A crucial consequence of this structure: **"voiced" is not a property an item *has* — it's the outcome of a competition for scarce airtime.** An item being "voice-worthy" (Layer 1) does not mean it airs (Layer 2). Several items can be voice-worthy in a session while only the best one or two actually air. *Not voiced does not mean silenced — it means another moment was more worth interrupting the music for. That is curation, not censorship.*

---

## 5. The judgment engine (Layer 1, in detail)

This is the core asset. It decides *what's worth surfacing and how to treat it.*

**The metric is connection, not importance.** The question is never "is this objectively important?" — it's *"would hearing this make the listener feel more connected to their world?"* A neighbor's local win can beat a national headline. A close friend's quiet hard moment can beat a louder distant event.

**It is a hybrid: the model judges meaning; code computes the score.** A large language model reads each item once and outputs its *meaning* — category, magnitude, sensitivity, confidence, allowed claims, forbidden inferences. That judgment is cached and frozen (judge once, reuse — proven to cost nothing on re-runs). Then *deterministic code* computes the priority and route from that meaning plus the listener's relationship graph, timeliness, and focus weights. This split matters: **the model is used as a meaning sensor, not a decision-maker.** Sliders and re-weighting recompute instantly with zero model calls.

**The four routes** — these are *treatments and candidate pools*, not separate scoring engines:

- **Highlight** — high magnitude + high closeness, positive signal. The celebratory beat. *(Dana's new job, Buena's CIF.)*
- **Doorway** — high closeness + high sensitivity, low/uncertain magnitude. Voiced *gently*, zero detail, routes the listener toward the relationship. *(Mateo's "rough week.")*
- **Utility** — followed/commercial or local-civic content with a timeliness or relevance hook. *(A coffee drop today, a street fair tonight.)*
- **Silent** — *drop* (not eligible to exist, or high-sensitivity-low-connection) and *ambient* (eligible, present, but no airtime-worthy moment right now).

**A known engineering finding (current, real):** the original scoring formula multiplied its factors, which let a single low factor *veto* everything else — closeness 0.3 on a followed source mathematically capped the score below the voice bar no matter how significant the item. The result is *over-suppression*: the engine is currently too restrained — safe, but under-speaking. We diagnosed this precisely (it's the formula's *shape*, not its constants), and the fix is being chosen against the locked gold labels right now. The candidate direction is a **hierarchy-first additive model** (events start heavy; relationship, relevance, and timeliness personalize but don't erase the hierarchy), with confidence and sensitivity likely retained as *multiplicative dampers* so the engine never over-voices something it's unsure about or something sensitive. **This is the single most active open engineering question.**

---

## 6. The DJ — how it hosts without inventing or rehearsing

This is the part that makes Drift *worth looking forward to*, and the part that is hardest to make safe. The two are inseparable: everything that makes the DJ alive is also where the risk lives.

### Hosted moments, not stingers
DJ time is scarce but **not tiny**. If Drift speaks, it earns the interruption with a *complete hosted moment* — warmth, rhythm, a real observation, care. The unit is a meaningful break, not a short alert. A gentle note about a friend's hard week especially *needs* room to breathe — gentleness has a tempo, and rushing it makes it cold.

### Three registers of factual content (in order of cost and risk)
1. **Generic warmth** — no search, always safe. *"Great school, he's in good company."* **This is the default.**
2. **Cheap-reliable grounded facts** — clean single-source data: time, weather, the song and artist. Use freely.
3. **Grounded world facts** — specific, current, verifiable-via-search facts. Used carefully, never raw (see enrichment below).

The governing rule: **generic warmth is free; every specific factual claim must trace to a real, current source, or it doesn't get said.** The unverified flourish — an invented sports stat, a "they're about to break the record" — is the single most common way a charming DJ becomes a *confidently wrong* one. We don't gut the personality to avoid it; we *ground the color* instead.

### Enrichment — how the DJ gets real, interesting context
When a topic surfaces (Jake → UCLA), it has *earned* attention, and a topic that earned attention deserves real context. So **the algorithm — not the DJ — enriches it**: it searches the surfaced topic for grounded, relevant material, runs that material through the same pressure test as everything else, and hands the DJ a *vetted enrichment package*. **The DJ never sees raw search output and never free-forms a fact.** It speaks only pre-vetted material.

To keep enrichment feeling *alive and never rehearsed*, the algorithm walks a **tethered associative path** — e.g. *education → grad programs → acceptance rates → top programs at UCLA* — so the same item never produces the same beat twice. Two rules keep the wandering safe:
- **Tethered:** the path stays *about the surfaced item* (one or two hops), and does not drift to an institution's unrelated tangents. *(UCLA → its grad programs* is tethered; *UCLA → football → some player's stats* has drifted off the person and toward a volatile, invention-prone fact.)*
- **Grounded endpoints:** whatever fact the path lands on is fetched live and grounded before it's spoken, with *stable* endpoints (acceptance rates, rankings) favored over *volatile* ones (live stats, records).

### Bridges — the connective tissue
Smooth hosting needs bridges between beats. A freely-generated bridge is dangerous (it can invent a thematic link between two people's lives). So bridges are **selected from a vetted library**, not generated: tonal pivots ("switching gears"), check-ins ("you still with me?"), plain handoffs ("now, to something local"), connections on grounded surface (time, place, the music's mood). **A bridge may connect on impersonal surface, never on an inferred connection between people's inner lives.** And the more sensitive the beat being bridged *into*, the *plainer* the bridge — clever bridges are a privilege of low-sensitivity content; sensitive content gets the clean handoff.

### News — same pipeline, same pressure test
News is not a separate, scarier subsystem. **A news item is an item.** It enters the pipeline, gets the meaning pass, gets grounded against its source, gets sensitivity-gated treatment — *identical machinery to a friend's post.* Two kinds:
- **Your-world news** (Jake's acceptance, Buena's CIF, a followed brand's drop) — arrives through the follow/social/local-source pipeline, grounded by provenance, *no web search needed.* This is the primary, personal, in-hand kind.
- **World news** (broader events) — searched in, then run through the same grounding gate. The safe way to scale this is to **constrain the source** (curated reliable feeds) rather than judge open-web results live — the same "constrain the source upfront" move as the bridge library and the eligibility gates. The aired line is grounded against its source like any other claim; sensitive or contested material gets report-don't-editorialize treatment and stays out of taking sides.

The unifying principle across friends, news, enrichment, and bridges: **the DJ speaks only vetted material. Search feeds the pressure test; the pressure test feeds the DJ. Raw is never spoken.**

---

## 7. Safety — the non-negotiables

Safety is not a feature that trades off against others. It is the **floor** the whole product stands on. A creepy or tactless DJ kills Drift regardless of how good the judgment is — a bad item in a visual feed is skippable, but a bad line *spoken into your ear* is authoritative and personal and *unrecoverable*. You cannot un-say it. These are architectural invariants:

- **Texture about the world, never invention about the soul.** The DJ may color the public setting (a city, a championship, a weekend) and must never invent a person's interior — their motives, private states, or the *cause* of anything. *("Mark's in DC this weekend" — yes. "Mark's in DC for the big game" — no, the reason was never stated.)*
- **Published-only, fail-closed consent gate at ingest.** Public/published/eligible-audience content passes; private/unknown/blank is dropped *before scoring even runs*. Audience scope travels with the item for all downstream safety.
- **Grounding validates the *aired line*, not just the plan.** Whatever the DJ actually says — including enrichment and live-realized phrasing — is traced to approved source material before the listener hears it. The gate binds the *output*, every time, because a fluent natural sentence can slip an unapproved claim back in.
- **Generate ahead. Vet the boundaries. Vet the aired line. Then speak.** No line airs in the same step it's generated. Candidate content sits in a short rolling safety queue and is vetted while the current song plays; failed lines regenerate safer or die silently, and the listener simply hears music.
- **Programmed first, interactive second — a closed input surface.** The listener cannot free-prompt the DJ about their social world. Interaction is bounded (tell me more, less like this, mute, save, open source, message the friend). This removes the *entire category* of attack — "guess why Mark went," "say it like gossip" — that a chatbot must defend against on every turn. The "tell me more" path inherits the item's sensitivity: low-sensitivity items may expand on grounded public context; sensitive items mostly *decline* and route you toward the person.
- **Child safety.** Public youth-team achievements are celebrated at the *team* level only — never naming, centering, or detailing a minor. Minors' private struggles are suppressed.
- **Modes change prioritization, never truth or permission.** Any future channel or focus mode may reweight *what surfaces*; none may relax grounding, consent, or the safety floor. (A "livelier mode" that loosens the rules is forbidden no matter how it's framed.)

**Grading discipline:** the judgment axes (eligibility, voice-worthiness, treatment) are *graded* and may improve over time. The safety gates (consent, allowed-claims, forbidden-inferences, grounding) are *absolute* pass/fail — never averaged into a score, never traded against good tone. An engine with great tone and one high-sensitivity false-voice is *failing*, not high-scoring. **Judgment axes are graded; safety gates are absolute.**

---

## 8. How we build — the philosophy

**Prove the brain before the polish.** The order is Layer 1 (judgment) → Layer 3 (a single safe spoken moment) → Layer 2 (session programming) → the full hosted show. We do not build the showpiece first.

**Strict where it's risky; go for gold where it's safe.** "Start small" does *not* mean "make the DJ maximally cautious and therefore bland" — that would optimize away the exact thing we're testing for. It means: take the *safest* beat (a low-sensitivity celebration — Jake, Dana) and make *that one* genuinely warm, specific, and worth looking forward to, fully grounded. **Prove the magic is reachable on the easy case first.** If we can't make a low-risk congratulations feel alive, the whole thesis is in trouble and we want to know early. If we can, the gold is reachable and the work is extending it — carrying that proven warmth into progressively harder safety territory.

**The bench is the truth.** Every hypothesis becomes a finding only when it's tested against labeled data. The gold labels set the targets; the engine is built to hit them. Divergence between the engine and the labels drives *architectural* diagnosis (new routes, additive floors), not parameter-fiddling. Structural fixes over magic constants.

**Demand-driven tooling.** We add instrumentation (e.g. the diagnostic board) only when the simpler approach breaks down — not on a schedule.

**Reported numbers must be self-auditing.** Computed values ship with their inputs so any teammate can recompute them; load-bearing findings cite the check that protects them; unverified claims are flagged as such. A number the team can recompute is a number the team can depend on.

---

## 9. What's attainable now vs. the real challenge

Staying in reality, with no dream-selling:

**In hand (the hard, valuable, *differentiating* part is mostly built):** the judgment engine reads items correctly and refuses to invent the soul of a sensitive post; the consent gate works and fails closed; the cache is proven cheap; the deterministic scorer runs; the gold labels are locked for the first cluster; the safety architecture is designed; the governance and reporting discipline are real.

**Build-it-now (known problems, known methods, just effort):** choosing the scoring formula (we have the data, the diagnosis, and the labels to judge against); the within-route ranking objective; then the line-generation layer that produces a *single safe hosted moment*; then the session programmer.

**The real challenge — the genuine unknowns:**
1. **A hosted, engaging beat that is *simultaneously* alive and safe.** "Sharp, warm, smooth" and "invent nothing, ground every claim" pull in opposite directions. It is not yet proven you can have both at length. This is the ceiling on how good Drift can be, and it's a real research question, not just engineering.
2. **The safety floor holding under *generation*, at scale, on *real* oblique data.** Everything proven so far is on judgment and a clean simulated corpus. A single tactless spoken line about a real person is unrecoverable, and "architected against" is not yet "proven to hold." This is the existential bar — and it's a higher bar than "is it good." It's "is it trustworthy enough to ship."
3. **The fuel.** Drift runs on a permissioned social graph we cannot legally extract at scale. This isn't solved by working harder — it's a *strategic* constraint (see §10).

**The honest one-sentence summary:** the part that's in hand is the part that makes Drift *defensible*; the part that's unproven is the part that makes Drift *magical*; and the project lives or dies on whether the magical part can be built without breaking the safety floor that makes the defensible part trustworthy.

---

## 10. Strategic context — the moat and the fuel

**The most valuable thing is the calibrated decision of what to say, when, and what not to say** — a tested editorial judgment system for turning a messy social graph into radio. Everything else (the app, the voice, the music) supports it.

Two different questions about value, with two different answers:
- **What creates the value** (makes the product good): the *judgment engine* is #1.
- **What's defensible** (a competitor can't reproduce): the *labeled judgment corpus* is #1 — a buyer can hire prompt engineers and copy a screen, but can't regenerate a consistent human-taste answer key. Build for the first; protect the second.

It's a **stack, not a flat list**: safety is the floor (a precondition — if it fails, nothing above has value), the engine is the differentiator, the corpus is the moat, and synthesis/UI/voice/music are surface.

**The fuel is the social graph.** It's what turns "nice personalized audio" into "I feel connected to my people." But the major platforms don't hand third parties broad access to a friends graph, and the trend is *tightening* (X barred third-party use of its content to train AI models in 2025). So the ingredient that makes Drift most magical is the one we likely cannot independently obtain at scale. That does not kill the project — **it defines the strategy.** The lockdown is the *door*, not just the wall: platforms are restricting access *to monetize it*, which is exactly the path our strategy walks through — partner with or be acquired by whoever owns the graph, rather than scrape it. The realistic exit is acquisition by a graph-owning platform; the bench's job is to prove the engine well enough that they buy it. Two reassurances: the *corpus* (our defensible asset) survives the data being someone else's, and the engine is the piece they may not have. The pitch: *"You own the graph. We built the radio brain."*

---

## 11. Where we actually are (current state)

- Foundational architecture, governance, safety design, and repo: **done.**
- Consent gate + deterministic scorer (Steps 1–2): **built, committed, verified.** Cache proven (zero-cost re-runs).
- First live meaning passes: **successful** — the model read sensitive, family, and youth-team items correctly, including protecting minors unprompted.
- First gold-label cluster (8 items across all four routes): **locked.**
- Headline finding: at default settings, the engine **over-suppresses** voice-worthy items — too restrained, "safe but under-speaking." Diagnosed as the formula's *shape* (multiplicative veto), not its constants. **The formula decision is the active next step**, being chosen against the locked labels.
- The DJ / hosting layer (line generation, enrichment, bridges, news, the session programmer): **designed in this document, not yet built.** It comes after Layer 1 judgment is proven.

---

## 12. The throughline

The product is the DJ feeling personal and meaningful; the music and the safety are what make that possible without it being creepy or annoying. We prove the judgment first, then prove a single hosted moment can be both alive and safe on the *easy* case, then extend that warmth into harder territory and richer hosting. The vision is big and it's the right target — *the listener should look forward to the DJ coming in* — and none of it is true until the bench shows the judgment underneath it is real.

**Speak rarely enough to stay special. Long enough to feel worth waiting for. Ground everything. Invent nothing about the soul. And make people feel like their world is alive while their music plays.**

That's Drift.
