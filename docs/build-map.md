# Drift — The Build Map
### From here to the destination, organized by what blocks what

> **STATUS: CANONICAL · v0.2.1** · last updated 2026-06-21 · This is the route, not the wish-list. It exists to be **pressure-tested and approved as the goals.** It is built around one principle: *precise where we have knowledge, honest about fog where we don't.* The near phases are detailed because we can see them; the horizon is named-not-planned because detailing it now would be fiction. Every phase carries a **gate** (what must be true to start), a **done-condition** (how we know it's finished), and a tag — **[EVIDENCE]** (produces a finding that moves the project from hypothesis to fact) or **[SUPPORT]** (enables the evidence work). The spine is the **critical path**: the chain where each link genuinely blocks the next.
>
> *v0.2.0 — added the DJ persona as a Foundation (build now, gates generation, threaded as a consistency requirement through Phases 2–5) and the app/voice as Parallel Track B (the body — mostly deferred, with rough voice/TTS pulled early because you can't tune what you can't hear).*
> *v0.2.1 — "where we stand" + you-are-here markers updated to reflect ratified state: v3 formula chosen + wired (ADR J1/J2), Step 1.3 thresholds fit, ADR J3 utility deferred, persona Foundation built + frozen (`dj-persona-v0.md`), Phase 1 closed, persona-center + grave-rule validated (ADR K1/K2). The map structure is unchanged; only its self-location is updated.*

---

## The destination & where we stand

**Destination:** an AI DJ that makes a listener feel connected to their world through grounded, tasteful, hosted moments woven into their music — *exceptional* enough that a listener looks forward to it, *safe* enough to be trustworthy, and *proven* enough that a graph-owning platform acquires it. The product is the DJ; music is the carrier.

**Where we actually are (updated 2026-06-21):** Layer 1 judgment is **closed**. The scoring formula is **chosen, ratified, and wired** — v3 additive-with-dampers (ADR J1 + J2), per-route thresholds fit on the bench (Step 1.3: doorway 0.100, highlight 0.532, with utility deferred per ADR J3 pending relevance computation in Step 3), the structural route classifier built (`playground/src/scoring/routeClassifier.ts`), the probe regression migrated into smoke. Under live meaning, 5/5 gold-voiced items in the fitted scope voice correctly. The persona Foundation is **built and frozen** (`dj-persona-v0.md`), and the persona/generation architecture is recorded as ADRs K1 (gravitational-center prompt as runtime brief) and K2 (Variant B grave-content rule, route-loaded). **We are mid-Phase-2, at the output gate** — the next [EVIDENCE] step both K1 and K2 point to. Generation has produced segments (clean-room + stress tests), but the grounding/denylist gate that mechanically holds them safe is unbuilt.

---

## The critical path (the spine)

```
[1] Scoring formula chosen + Layer 1 ranks candidates correctly
         │   (the engine reliably decides what's worth surfacing)
         ▼
[2] First single SAFE spoken segment generates (celebratory case)
         │   (the hard pivot: judgment → generation, grounded)
         ▼
[3] Generation works across all routes (doorway, utility, enrichment, bridges)
         │   (warmth carried into harder safety territory)
         ▼
[4] Sessions assemble (Layer 2: breaks, airtime budget, no repetition)
         │   (it feels programmed, not generated)
         ▼
[5] Tuned to EXCEPTIONAL (generate → listen → adjust, the gold bar)
         │
         ▼
   ═══  The listener looks forward to the DJ  ═══

   ┌ FOUNDATION (build now, gates generation):
   │   The DJ persona — who this host IS. Generation can't produce a
   │   consistent voice without one. Feeds [2]; threaded through [2]–[5].
   │
   ║ PARALLEL TRACK A (off generation path, on destination path):
   ║   Corpus scaling + labeling methodology → the moat → acquisition demo
   │
   ║ PARALLEL TRACK B (the body, not the brain):
   ║   Voice/TTS (pulled early — needed to TUNE) → the app / experience
   ║   surface → the thing a listener actually opens
```

Each link below is gated on the one above it. **Almost everything we documented this session — the showcase, the value doc, the break spec — is [SUPPORT], not a link in this chain.** They are preparation. The chain is what moves.

---

## PHASE 1 — Prove the judgment *(closed 2026-06-20: v3 wired, route classifier built, Step 1.3 thresholds fit; per ADRs J1/J2/J3)*

**Goal:** the engine reliably decides what's worth surfacing and ranks candidates correctly *within each route*, matching the gold labels, with safety gates absolute. Over-suppression resolved; the junk floor holds.

**Steps:**
- **1.1 — Choose the scoring formula.** Test multiplicative vs. additive vs. additive-with-confidence/sensitivity-dampers against the **8 locked labels**, judged on *within-route ranking accuracy* (not threshold-clearing). Pure calculation, no overhaul. **[EVIDENCE]** — *this is the immediate next action and it is NOT blocked on more labeling; the 8 labels are enough to pick the formula's shape.*
- **1.2 — Label the community cluster.** (PO task, runs in parallel with 1.1.) Unblocks the additive community-floor constant. **[SUPPORT]**
- **1.3 — Fit the constants to both clusters.** Sensitive cluster → the doorway-route threshold; community cluster → the floor weight. Constants fit to *patterns*, never to single items. **[EVIDENCE]**
- **1.4 — Validate Layer 1.** Headline metric: judgment agreement *among gate-passing items*, with gate failures (consent false-pass, ungrounded claim, forbidden inference) reported *absolutely and separately*. **[EVIDENCE]**

**Gate to start:** the data + labels exist. *(They do — 1.1 can begin now.)*
**Done-condition:** the engine ranks candidates within routes matching the gold labels; the 5 over-suppressed items now route correctly; the 3 junk/promo items stay down; zero high-sensitivity false-voices.
**Risk:** picking a formula that passes the 8 but fails a case the 8 don't contain (e.g. high-magnitude *low-confidence*). Mitigation: test against a constructed low-confidence probe before hardening.

---

## FOUNDATION — The DJ persona *(build now, in parallel with Phase 1; gates Phase 2)*

**Why it's here and not later:** personality is essential — a DJ without a distinct one is a competent narrator, and a competent narrator is the forgettable thing we're trying *not* to build. But it isn't a phase; it's a **foundation plus a thread**, and the foundation half has to exist *before generation* because **the line-generation prompt cannot produce a consistent voice without a defined persona to write toward.** We've been writing the showcase voice *by feel* (warm, quick, self-implicating, a little wry) — this makes it explicit and reproducible.

**The foundation half — the persona doc ([SUPPORT], buildable now):** *who is this host?* A specific, written voice — age and texture, the shape of their humor, their warmth, their relationship to the listener, their taste in music, and the hard list of *what they would never say*. Concrete enough that two different people writing a segment would produce the *same host*. This is the target the generation prompt aims at.

**The thread half — consistency ([EVIDENCE], graded across Phases 2–5):** *does the DJ sound like the same person across a thousand segments — on a celebration and on a hard beat?* This is not a doc; it's a **generation requirement and a grading criterion** woven through every generation phase. The failure mode: voice drift — warm here, clinical there, suddenly corporate — so the listener feels like a different host every break. Consistency is scored alongside grounding and tone.

**Open decision the persona doc must resolve (taste + strategy, not engineering):** *one iconic DJ, or listener-selectable personas?* One voice is simpler, more brandable, and far easier to keep consistent. Multiple personas are more personal but multiply the consistency problem and the tuning work by however many exist. **Recommend deciding this before the persona doc is written** — it changes what the doc *is*. (Lean, for what it's worth: one strong iconic voice for v1; selectable personas as a later, post-exceptional expansion — same "prove one thing well first" discipline as everywhere else.)

**Gate to start:** none — buildable now.
**Done-condition:** a persona definition concrete enough that the line-generation prompt has a single, reproducible voice to write toward, and a consistency rubric exists for grading generation against it.

---

## PHASE 2 — Prove one safe spoken moment *(▶ YOU ARE HERE — at the output gate)*

**Goal:** the engine generates **one** grounded, genuinely warm segment for the *safest* case (a low-risk celebration). This is the hard pivot — the first time the model *speaks* rather than *judges* — and the first real test of whether generation can be **safe AND alive.**

**Steps:**
- **2.1 — Write the line-generation prompt.** Targets the celebratory route first, and **writes toward the persona** (the Foundation doc). Bakes in: the segment skeleton (music bookend → tonal turn → payload → doorway → return), the registers (generic-warmth-free / specific-facts-grounded), the showcase good-examples, and the bad-examples (the good-vibes rally, the invented urgency, the ungrounded flourish, the thin stinger). **[SUPPORT]**
- **2.2 — Build the grounding gate on the aired line.** Claim-grounding validates the *generated line* against item fields + approved context — binds the output, every time, not the plan. **[SUPPORT → enables EVIDENCE]**
- **2.3 — Generate the first segment.** A Jake/Dana-style celebration, fully grounded. **[EVIDENCE]**
- **2.4 — Validate it.** Three checks: does it pass grounding (zero ungrounded claims)? does it read as genuinely good (human judgment against the showcase bar)? does it sound like *the persona* (consistency)? **[EVIDENCE]** — *this is THE pivotal test of the whole product thesis.*

**Gate to start:** Phase 1 done (Layer 1 ranks the celebratory case correctly) **and** the persona Foundation exists (generation needs a voice to write toward). *(Generation can begin on the celebratory route as soon as that route ranks correctly, even if other routes are still being tuned.)*
**Done-condition:** a single celebratory segment generates, passes grounding cleanly, and reads as warm and alive — the "go for gold on the safe case" proof.
**Why this phase is the hinge:** if a low-risk celebration can't be made both grounded *and* alive, the core bet ("safe and alive aren't enemies") is in trouble, and we learn it here, cheaply, before building anything on top.

---

## PHASE 3 — Generation across the routes

**Goal:** carry the proven warmth into *harder* safety territory — the doorway (sensitive) and utility routes — and build the machinery that makes hosting rich without inventing.

**Steps:**
- **3.1 — Extend to the doorway route.** The Mateo case: gentle, the tonal turn, texture-not-soul, the doorway to the listener. The hardest safety case for generation. **[EVIDENCE]**
- **3.2 — Extend to the utility route.** Commercial/local as wanted-signal, not ad; no invented urgency. **[EVIDENCE]**
- **3.3 — Build the enrichment pipeline.** Algorithm searches the *surfaced topic* → grounds the results → hands the DJ a vetted package (never raw). Tethered associative paths, stable endpoints favored over volatile. **[SUPPORT → EVIDENCE]**
- **3.4 — Build the bridge library.** Vetted connective phrasings, selected not generated, sensitivity-gated (plainer bridge into more sensitive beats). **[SUPPORT]**
- **3.5 — Validate across all routes** against the showcase standard + the safety test set. **[EVIDENCE]**

**Gate to start:** Phase 2 done — a single safe segment must work before extending the pattern.
**Done-condition:** segments generate across all four routes, grounded, sensitivity-gated, at acceptable quality; the safety floor holds under generation on the *sensitive* cases, not just the easy ones.

---

## PHASE 4 — The session (Layer 2)

**Goal:** individual segments assemble into breaks and a full session that feels *programmed*, not generated.

**Steps:**
- **4.1 — Build the session programmer.** Assembles breaks per the break-structure spec (anchored edges + editorial interior); implements the airtime budget. **[SUPPORT]**
- **4.2 — Implement the Layer-2 rules.** Item-airs-once; longer-break-is-synthesis-not-replay; sparseness; the priority (connection beats information for scarce airtime). **[SUPPORT]**
- **4.3 — Shape the interface for the ladder.** "Assemble a break given the session's state and the listener's context" — even if v1 ignores state and context — so rungs 2–4 (session-arc, director, reads-the-room) can be added without a rebuild. **[SUPPORT]**
- **4.4 — Validate a full session.** It follows the arc, doesn't repeat, carries fresh content in the longer break, feels like one show. **[EVIDENCE]**

**Gate to start:** Phase 3 done — segments across routes must work before assembling them.
**Done-condition:** a full listening session assembles, follows the arc, never re-announces what aired, and reads as a programmed show rather than a series of interruptions.

---

## PHASE 5 — Tune to exceptional

**Goal:** the iteration that makes it *gold* — not acceptable, exceptional. The bar: the listener looks forward to the DJ.

**Steps:**
- **5.1 — Run the tuning loop on real sessions.** Generate → listen → find the *specific* flat or wrong spot → adjust → generate again. The unit of iteration is *a segment you can hear*, not a spec you can read. **[EVIDENCE]**
- **5.2 — Dial in the voice formula** — the break structure, the timing, the humor, the registers, the segment anatomy — against real output. The structure we have is **v0**; this is where it becomes exceptional. **[EVIDENCE]**
- **5.3 — Measure against the gold bar** — "does this make the listener look forward to the DJ?" **[EVIDENCE]**

**Gate to start:** Phase 4 done — you need full sessions to tune.
**Done-condition:** sessions reach the showcase standard. *(This is the longest and fuzziest phase, deliberately — exceptional is found, not specified, and the loop has no fixed end.)*

---

## PARALLEL TRACK A — The moat & the data

Runs *alongside* the generation phases, not gated on them. **Off the generation critical path, but ON the destination path** — because the destination is acquisition, and the corpus is the defensible asset.

**Steps (ongoing):**
- **Corpus scaling** — 40 → 150 → 500, with the overfitting-resistant methodology: decouple item-authoring from labeling, source real anonymized public posts for true obliqueness, plant deliberate traps (looks-significant-isn't, is-significant-shouldn't-resolve), weight toward boundary cases. **[EVIDENCE]**
- **Inter-rater agreement as the moat-health metric** — high agreement among labelers *is* the evidence the moat exists; disagreement *is* the definition of an oblique item. **[EVIDENCE]**
- **The acquisition demo** — packaged as *"your social graph should have a radio mode,"* showing the engine's judgment on simulated social data, honest that a graph-owner replaces the sim with real permissioned context. **[SUPPORT]**

**Gate:** can begin once a labeling rhythm is established (after Phase 1's labeling).
**Done-condition:** a corpus + methodology rigorous enough that a buyer believes it would transfer to *their* data — the thing they can't cheaply reproduce.

---

## PARALLEL TRACK B — The app & the voice *(the body, not the brain)*

Everything on the critical path is the *brain* — judgment, generation, hosting. The app is the *body*: the thing a listener actually opens. The destination requires it ("a listener looks forward to the DJ" implies an app they open and a *voice they hear*, not text on a screen). But it is mostly **[SUPPORT]**, and building it early is the classic trap — *prove the brain before the polish.* A beautiful app around an engine that can't generate a safe segment is a gorgeous shell around nothing. So this track **starts in earnest around Phase 3–4** — with one piece pulled forward.

**The exception — voice/TTS, pulled early:** the DJ is *audio*, and a segment that reads great as text can land awkwardly as *speech* (pacing, the tonal turn, the gentleness of a doorway beat). The Phase 5 tuning loop *literally requires hearing it* — **you cannot tune what you can't hear.** So a rough TTS is needed *before* the polished app, as a prerequisite for the listen-and-tune loop. **[SUPPORT → enables the Phase 5 EVIDENCE loop]**

**Steps:**
- **Rough voice/TTS** — enough to *hear* a segment, pulled early for tuning. **[SUPPORT → enables EVIDENCE]**
- **The experience surface** — the one-card music-first UI (prototypes already exist as Phase-D reference), the music player, the closed-input interaction controls (tell-me-more, mute, save, open-source — bounded, not free-prompt), the attention ladder (ambient → voiced → expanded). **[SUPPORT]**
- **Production voice** — the polished, branded DJ voice, after the rough one has tuned the writing. **[SUPPORT]**

**Gate:** rough TTS as soon as Phase 2 produces a segment to hear; the full app surface around Phase 3–4, once generation across routes is real.
**Done-condition:** a listener can open the app, hear the DJ over their music, and interact within the bounded surface — the experience the brain has been earning.
**Risk:** the trap of polishing the body before the brain works. Guard: the app surface (beyond rough TTS) does not start until generation is proven.

---

## THE HORIZON — named, not planned *(shape, not schedule)*

These are real and on the path to the destination, but planning them in detail now would be fiction — they depend on findings we don't have and a strategic path we don't fully control. Named so we build *toward* them, not so we pretend to schedule them:

- **The real permissioned graph** — via partner/acquirer. The fuel we can't extract ourselves; the reason the realistic exit is acquisition.
- **The hosting climb (ladder rungs 2–4)** — session-arc → self-directing → reads-the-room. The path from "good radio" to "a host who's with you." Built toward, after the base hosting works.
- **World news via curated feeds** — constrained-source search through the same pressure test, after the DJ can handle a sensitive beat safely.
- **Acquisition / engine-supplier path** — *"You own the graph. We built the radio brain."* The destination itself.

---

## What's NOT on the critical path *(the honest callout)*

So the map stays a tool and not a comfort: the dozen artifacts produced recently — the product description, the value-and-moat doc, the DJ showcase, the break-structure spec, the decision-log entries — are **[SUPPORT]**. They create *clarity and alignment*, which is real and valuable. But they are *not links in the chain*. They do not move the project from hypothesis to fact. **Producing more of them is not progress on the build** — it only feels like it. The chain moves when [EVIDENCE] steps complete. Every phase above is anchored to an [EVIDENCE] done-condition for exactly this reason.

---

## The immediate next action

> **Run step 1.1: the formula-shape test against the 8 locked labels** — multiplicative vs. additive vs. additive-with-dampers, judged on within-route ranking accuracy. It is pure calculation, it is not blocked on more labeling, and it is the single highest-value thing available right now. It has been the next action for several turns while [SUPPORT] artifacts accumulated. **It is the first link in the chain, and nothing downstream can start until it's done.**

Everything else is gated on it. The map's whole point is to make that unmistakable.
