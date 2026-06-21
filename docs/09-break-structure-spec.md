# Drift — Break Structure & Session Programming
### Layer 2 spec (the session programmer)

> **STATUS: CANONICAL · v0.5.0** · 2026-06-21 · How a break gets *assembled*, how a session *flows*, and the *anatomy of one segment*. This document is deliberately **honest about its own certainty**: it specifies the parts the music anchors (which we can decide now) and holds the parts taste governs as **open questions to be resolved by trial and error** (build it loose, listen, adjust). Do not let the team over-lock the open middle — that's the part that has to stay free, because it's where the show actually lives.
>
> *v0.5.0 — added the **set/break currency** (the hour is counted in sets and breaks, not in minutes — the music owns the clock), the **six-shape vocabulary** the programmer composes from (four free + two ruled), and **hour-as-composition** (the hour is a sentence composed from shapes, not a timetable). The unit budget, residual load, and owns-the-break rules from v0.3.0/v0.4.0 are unchanged — this sits on top of them. Filed per the canonical reorganization §3a (source: `correspondence/eng1-layer2-set-shapes-v0.5.0-merge-source-2026-06-21.md`).*
> *v0.4.0 — added residual load & the recovery arc (load *across* breaks): cognitive dose decays-but-never-auto-resets, the dual check (a break can pass its own budget and still fail on session pressure), grave as a hard cross-break cooldown, count-based v0 decay (mood-aware parked), the recovery arc (earn back to brighter on fresh content, never replay), and the hard guardrail that this is show-state memory, NOT listener-mood inference.*
> *v0.3.0 — added the airtime budget measured in weighted units of listener load (not seconds): the fail-if-over-units rule, the v0 unit-cost and break-budget tables, and the grave/sensitive "owns the break" hard rule above the arithmetic. Units and budgets are starting priors, calibrated by ear.*
> *v0.2.0 — added segment anatomy (the five-part skeleton, marked rules-vs-default) and the "how this gets to exceptional" method note: the structure here is v0, dialed in by generating real segments and listening, and that loop is blocked until the generation layer exists.*
>
> **Scope:** This is Layer 2. It is **not built yet** and **must not be built** until Layer 1 (item judgment) reliably ranks candidates — you cannot assemble a good break until the engine can tell a strong candidate from a weak one. This spec is the *target* the session programmer is built toward, not a current work item.

---

## The core principle

> **Music first. Hosted connection second. Information third.**

This is a **priority ordering, not a running sequence.** It does not mean "always say things in this order." It means: when airtime is scarce and the DJ must choose what makes the break, **connection beats information.** A real human moment — a friend's news, a congratulations, a check-in worth making, local pride — takes the break, and the time/weather/utility folds in around it or is skipped. Information is the *connective tissue and the filler*, never the headline. The priority is a tiebreaker for scarce airtime, not a checklist to complete.

---

## The fixed frame (always true)

Every break **opens from music and returns to music.** That is the one invariant. It is what makes Drift feel like *radio* and not a notification stream, and it never changes. What happens *between* the open and the return is selected per break — sometimes rich, usually sparse, occasionally just a handoff. The frame is fixed; the contents are not.

---

## The currency: sets and breaks, not time *(v0.5.0)*

The hour is not sketched on a clock (:00, :08, :30…). That would be wrong, for the reason the whole product rests on: **the music owns the clock.** Songs run 2:47 or 6:20; the listener skips; a track runs long. A break can't be scheduled at :30 because there is no :30 the music agreed to. Breaks happen **at the seams the music creates** — a song ends, that's an opening.

So the hour is counted in the music's own units:

- **A set** = a run of songs played back-to-back, bounded by breaks. Measured in **songs** (song 1, song 2, song 3), *never in minutes* — a song's duration is the music's business, and putting durations on the structure reintroduces the clock through the back door.
- **A break** = what happens *between* sets — where the host speaks. Measured in **units of listener load** (per the v0.3.0 budget below), *never in seconds*.
- **An hour** = roughly *how many sets fit* — an **estimate**, because set length floats with song length. The format is the *pattern of breaks across the sets*, not a timetable.

**Why this matters beyond vocabulary:** every Layer-2 rule already written below is stated in *breaks*, not time — the unit budget is per-break, residual load accrues per-break, owns-the-break is named for the break. The clock was the one piece fighting the music-first invariant. Counting in sets and breaks makes the structure speak the same currency as its own rules. The system can reason about *how many songs ride between breaks* and *how heavy the break is* without ever consulting a stopwatch.

---

## The set shape vocabulary *(v0.5.0)*

A set is not one fixed shape. A good station varies its breathing — sometimes a quick song-and-talk, sometimes a long uninterrupted run. So the programmer composes from a **vocabulary of shapes**, each a run of songs bounded by breaks, varying on **two independent dials**:

- **how many songs** are in the run (the pace / the breathing), and
- **how heavy the bounding break** is (the load, in units — see the airtime budget section below).

A long music run is restful *if the breaks around it are light*; "four songs with no talk" is only heavy if you expect a rich break after each one. Width (songs) and weight (units) are separate — that separation is what lets the programmer answer "this feels heavy here" with "then use a lighter shape."

### The four free shapes *(chosen by feel)*

| Shape | Run | Bounding break | When |
|---|---|---|---|
| **Quick turn** | 1 song | light (≈1u) either side | keeps the host *present* — pops in between single songs |
| **Standard** | 2 songs | light open, fuller close (≈2–3u) | the everyday shape — most of the hour |
| **Deep cut** | 3–4 songs | light (≈1u) either side | **breathing room** — long music run, host gets out of the way |
| **Feature** | ~2 songs | into a heavy anchor (≈4.5–5.5u) | where a mid-hour primary moment / synthesis lands |

### The two ruled shapes *(rules welded on — not free choices)*

| Shape | Structure | The rule |
|---|---|---|
| **Top of the hour** | heavy anchor (≈5.5u) → short run | the **heaviest break** — carries the day's cross-set **synthesis**, opens a fresh hour. Distinct from *feature* by role (hour-opening + cross-day through-line), not just weight. |
| **Grave** | grave break (**owns it**, one item) → recovery run → **forced-light** next break | **coupled.** The serious beat owns the whole break — no co-items, regardless of what the unit math would permit — and the recovery run + forced-light next break are **part of the same shape.** The cooldown is not a separate decision; it is bolted to the grave shape. The music run carries the mood (per the persona's "return-to-music honors the tone"; see `dj-persona-v0.md` and ADR K2). |

*The grave shape is the one shape the programmer cannot decompose: owns-the-break (v0.4.0 hard floor) + the residual-load cooldown, fused into a single unit.*

**This is a starter vocabulary, not the locked set.** More shapes will surface by composing real hours and listening (a sensitive shape distinct from grave; a bottom-of-hour heavier than feature). Six is enough to make the *method* concrete; the real list is found by use.

---

## The hour as composition *(v0.5.0)*

An hour is a **sentence composed from the shape vocabulary**, not a clock filled in. Example:

```
Top of hour → Standard → Quick turn → Bottom-of-hour anchor → Deep cut (breather) → Standard → Reset
```

The rhythm the composition follows:
- **Two anchors per hour, spaced apart** — one opens the hour, one mid-hour. ("Twice an hour you get a big break," placed by *position in the sequence*, not at :00/:30.)
- **Light shapes carry the stretches between** — standards and quick turns keep the host present without overload.
- **A breather follows the weight** — a deep cut after an anchor is the cooldown made visible (heavy break → long music recovery). If a *grave* beat aired, its shape forces this breather automatically.
- **The hour ends on a reset** — a light handoff into the next hour's top.

Two encodings make a composed hour legible: **break weight** (which shapes are heavy) and **song count** (how long each run breathes). No minute appears anywhere — correct, because the music keeps the clock.

---

## Part A — The anchored layer (we can specify this now)

These elements are tied to **events in the music itself.** That's what makes them feel natural rather than templated: they're *music-triggered, not clock-triggered*. They arrive when the music creates the opening, the way real radio does.

- **Backsell / music info → on the *tail* of a song.** "That was Khruangbin." It's anchored to the song *ending*, because that's when you'd naturally say it.
- **Music history / artist story → at the *edges* of the relevant track, with respect to that song.** It lives on the way *into* or *out of* the specific record it's about — never floating free in the middle. The story belongs to the track, so it sits at the track's edge. *(And per the registers: specific historical claims route through grounding; the "reportedly" hedge holds attributed lore honestly.)*
- **Time / weather / vibe → at the *edge before the next intro*.** A quick "it's 4:50, 78 and gorgeous — here's the next one." Anchored to the *handoff into* a track, which is the natural seam for it.

Why these feel un-rehearsed despite being structural: **they're triggered by musical events, not by a template.** "That was Fleetwood Mac" only happens because Fleetwood Mac just ended. The time check rides the handoff because the handoff is the seam. We aren't imposing a structure — we're letting the music's own rhythm decide where the structural elements land. The song-edges are the fixed points, and the *music* fixes them.

These are stated as **defaults**, not rigid laws — a great host occasionally breaks them for effect — but they're reliable enough to build toward now.

---

## Part B — The editorial interior (open — learned by trial and error)

This is the **human payload** and the heart of the product: friends, connection, congratulations, local, news, followed interests. It lives *inside* the frame, between the anchored edges. And it is **deliberately not specified**, because it is *taste*, and taste isn't reasoned into existence — it's discovered by listening. You cannot argue your way to "should the friend beat come before or after the local news beat." You find out by hearing fifty breaks and noticing which order feels like a host and which feels like a list.

**So the interior is held as open questions, with one method for resolving them: build it loose, listen, adjust.**

What *does* govern the interior (the few rules that apply):
- **The priority:** connection beats information (from the core principle).
- **An item airs once, in the slot that fits it best.** If it earned a solo beat, it does *not* get re-announced in a later roundup. The session programmer **tracks what's been said and deliberately does not repeat it** — the way a real show never re-announces the same story every segment. *(One honest exception: a time-bound event nudge — "it's tonight" — may get a brief reminder as it approaches, because that's useful, not wasteful.)*
- **The longer break is synthesis + next-tier roundup, never replay.** A top-of-hour earns its length by doing what a single beat can't — finding the through-line across the day ("three people close to you all picked this week to go win something") — and by carrying the *good-but-not-urgent* items that didn't each warrant stopping the music, in one efficient pass. It is *not* a louder repeat of the solo beats.
- **Sparseness.** Most breaks are short. A break can legitimately be *just* music and a time check — or, after a heavy doorway beat, *just* music, deliberately, to let it breathe. The full repertoire is never run in one break.

What is **open** (the trial-and-error questions, to be answered by listening, not decided now):
- Which interior topics appear in a given break, and how many?
- In what order do connection / local / news / congratulations / interests fall *relative to each other* when more than one is present?
- How is energy managed *across* a break and *across* a session — when to lift, when to dip?
- How does the interior change by time of day, session length, or break type?
- When should the DJ plant a thread early and pay it off later (callbacks)?

These are **not failures to be specified away** — they are the research the bench and real listening will resolve. The document records them as open *on purpose.*

---

## The airtime budget — measured in *units of listener load*, not seconds

Sparseness needs **teeth**, and time is the wrong currency for them. A DJ can talk for 20 seconds and overload you, or 40 and feel smooth — the difference isn't duration, it's **how many things the break asked your brain and heart to hold.** So the session programmer budgets each break in **units**, and the governing rule is:

> **A break fails if it stays under the time budget but exceeds the unit budget. Units measure listener load, not script length.**

**A unit is one cognitive payload** — one thing the listener has to process — **not one sentence.** And payloads are **weighted**, because they aren't equal: a five-second "your friend's having a rough week" is *heavier* than a twelve-second music-history aside, because personal and emotional content demands more attention than safe music texture. The weighting is deliberate — it makes the budget push the show *toward* music and *away* from emotional pile-up, which is the direction the product should always lean.

**Starting unit costs (v0 — provisional, tuned by ear against real breaks, NOT locked):**

| Content type | Unit cost | Note |
|---|---|---|
| Music backsell / song ID | 0.5–1 | low load, radio-native |
| Music trivia / history | 1 | low personal risk, must be grounded |
| Time / weather / vibe | 0.5 | light connective tissue |
| Utility / local event | 1 | useful, lower emotional load |
| Product / brand wanted-signal | 1 | must not feel like ad clutter |
| Synthesis thought | 1 | the reason longer breaks exist |
| Quick callback (already aired) | 0.5 | not a re-announcement |
| Bridge / transition | 0.5 | necessary glue |
| Social / personal celebration | 1.5 | higher emotional load |
| Local / community pride | 1.5 | especially if minors involved |
| Sensitive doorway | 2 | heavy; usually alone |
| Grave doorway | (owns the break — see rule) | |

**Starting break budgets (v0 — provisional):**

| Break type | Budget | Personal/social cap |
|---|---|---|
| Micro handoff | 0.5–1.5 | 0–1 item |
| Standard break | 2–3 | 1 personal item max |
| Feature beat | 3–4 | 1 primary item |
| Top/bottom-of-hour | 4–5.5 | 3–4 personal/community items, only one *primary* |
| Sensitive break | 2–3 | the sensitive item owns it |
| Grave break | 3 max | the grave item owns it — no pile-on |

*A good top-of-hour:* backsell (1) + synthesis (1) + Jake callback (1) + Buena callback (1) + weather handoff (0.5) = **4.5 units** — feels like radio. *A bad one:* backsell + Jake + Dana + Buena + Mark + coffee + street-fair + weather + news = **8.5 units** — not radio; a hostage situation with background music.

**The one hard rule that sits ABOVE the arithmetic — grave and sensitive items *own the break*.**
A grave beat next to even one light item is a tonal failure *regardless of whether the math allows it* — "Mateo's dad passed away… and the street fair's tonight!" scores maybe 3.5 units (under budget) and is catastrophic. So for the grave zone, and usually the sensitive zone, pile-on isn't *expensive* — it's **forbidden**. A grave item **sets the break's budget to itself**: it owns the break, no co-items, the return-to-music carries the mood. The unit arithmetic governs the *normal* range; the grave/sensitive owns-the-break rule is a structural floor *above* it, because a weight can be gamed by a budget that happens to have room — a hard rule can't.

**Status:** the *system* is decided (weighted units, load-not-length, per-break budgets, the fail-if-over-units rule, grave/sensitive owns-the-break). The *specific numbers* are v0 starting priors — calibrated by generating breaks at a given budget and *listening* for whether a "4.5-unit" top-of-hour lands smooth or stuffed. Same discipline as the scoring constants: framework decided, constants found by ear. **This is a Layer-2 mechanism — built when the session programmer is built, not before.**

---

## Residual load & the recovery arc — load *across* breaks

The unit budget governs load *within* a break. But a heavy beat doesn't vanish because one song played — air a sensitive doorway, then three minutes later launch a dense top-of-hour, and that's tonal whiplash with math homework. So the session programmer carries a **residual load** across breaks, and the governing rule is:

> **Cognitive dose decays across the music, but it does not reset to zero automatically.**

**The single most important guardrail — this is memory of the *show's own pacing*, NOT inference of the listener's mood.**
The forbidden version: *"the listener is sad now, so adjust the experience"* — creepy, ungrounded, the exact mood-inference over-reach ruled out on the ladder. The correct version: *"the session just aired a high-dose sensitive item, so reduce density for the next break."* `residual_load` is computed **only** from the show's *emitted output* — never from any guess about the listener's state. This keeps it deterministic, auditable, and on the safe side of the privacy/mood floor. It is the first real piece of session-level awareness, and it's the *safe* piece, precisely because the show remembers what *it* did, not what the *listener* feels.

**The mechanic.** After every break: `residual_load += break_dose`. While music plays: `residual_load` decays. Before the next break: `effective_budget = base_budget − residual_penalty`. So after a heavy break, the next break gets smaller automatically.

**The dual check (the real insight) — a break can pass its own budget and still fail.**
```
break_dose ≤ break_budget                    (the break is legal on its own)
break_dose + residual_load ≤ pressure_limit  (the hour isn't exhausting)
```
This catches the failure mode the per-break budget can't: *every local decision passes and the whole hour still feels exhausting.* If session pressure exceeds the limit → reduce items, downgrade to connective tissue, delay the route, or go music-only.

**v0 residual behavior (provisional numbers, found by ear):**
- **After a grave doorway — a HARD cooldown, not a computed decay.** The next break is **music-or-connective-tissue only, for a fixed floor of songs** — full stop, *not* "until residual decays below X." A decay threshold can be gamed by tempo (three short songs clear a timer faster than three long ones), and the tonal protection must not depend on how long the next tracks happen to be. Grave gets a *rule*; the arithmetic doesn't get a vote here. (Same logic as grave owning its own break.)
- **After a sensitive doorway** — next-break budget reduced ~1.0–1.5 units; next break may carry only music info, time/weather, or a gentle handoff; no celebration immediately unless enough music has passed.
- **After a social/community celebration** — next-break budget reduced ~0.5; avoid another personal item immediately unless a top/bottom-of-hour synthesis requires it.
- **After normal utility/music/local** — residual decays normally.

**v0 decay is count-based; mood-aware decay is parked.** Decay by *track count* (a fixed amount per song) for v0 — simple, deterministic, good enough to start. The tempting refinement — decay by *mood-match* (a sad beat decays slower under slow songs, faster under bright ones) — is real but is its own judgment with its own failure modes (it requires reading the music's mood), so it's **parked as a later refinement, not built in v0.** Start with count; add mood-awareness only once the base mechanic is proven.

**The recovery arc — what residual decay is *for*.**
After sad news, the show neither pretends it didn't happen nor stays stuck there forever: it **earns its way back to brighter — gradually, over the music, if the listener stays.** A lighter touch, then a warm one, then eventually full energy once enough music has carried the mood. The climb-back is *forward motion*, not a snap and not a permanent grey.

**The trap the recovery arc must not spring — climbing back must use FRESH content and tone, never a replayed beat.**
The natural-but-wrong instinct when lifting the mood is to reach back for warmth by re-airing something good that already aired — *"that was heavy, but hey, remember Jake got into UCLA!"* That is a **no-repeat violation** (Jake already had his moment; recycling it for emotional lift is exactly the feed-repetition the show forbids). The recovery climbs back using **the music, fresh content, and the host's own warmth of tone** — *never* by replaying a beat for its emotional value. The host gets back to brighter by finding the *next* good thing, not by re-selling the last one.

**One faculty, two uses.** The no-repeat tracking and the residual-load meter are the same kind of thing — *the show's memory of its own output.* The session already remembers *what* aired (no-repeat); it now also remembers *how heavy* it was (residual load). One memory, two axes, both on the safe show-state side of the line — never listener inference.

**Status:** the *mechanic* is decided (residual decays-not-resets, the dual check, grave-as-hard-cooldown, count-based v0 decay, the recovery arc, climb-back-on-fresh-content-only, show-state-not-mood). The *numbers* (pressure limits, decay rate, cooldown song-count) are v0 priors found by listening to real sessions. **Layer-2 mechanism — built with the session programmer, not before.**

---

## The improvement ladder (where the interior grows)

The editorial interior is not a fixed thing we'll perfect once — it's the part that *climbs*. The ladder, from what we build first to the eventual ideal:

1. **A well-assembled break** — the anchored frame plus a good interior selection. *(Rung one — what v1 builds.)*
2. **A session with an arc** — beginning, middle, end across the whole hour; callbacks; energy management; continuity (including across days — "checked in, Mark made it to DC fine"). The breaks become *moments within one show*, not independent interruptions.
3. **A self-directing session** — the programmer as *director*, not just selector: pacing the listener's emotional experience anticipatorily (hold the celebration for *after* the heavy beat; the top-of-hour lands differently at 5:00 than 5:20).
4. **A session that reads the room** — adapts to the listener's *moment*: time of day, the mood the music's in, how restless they seem (fast-skipping → talk less). Not chatbot-responsive (the input surface stays closed), but *aware*. This is where "your world feels alive while your music plays" is fully delivered, because *alive* is responsive.

**The design instruction this creates — decide it now, at the interface:** build the session programmer so its interface is *"assemble a break given the session's state and the listener's context,"* even if v1 ignores state and context and uses only the candidate pool. That way rungs 2–4 can be added without rebuilding. **Design rung one to reach toward rung four — don't box it in.**

Honest caveat on the upper rungs: rungs 3–4 are the deep end *and* the part most likely to touch the safety floor (inferring a listener's mood is a new judgment with its own failure modes) and the privacy surface (cross-session memory of listener behavior). They are the north star to build *toward*, not the thing to build first.

---

## Segment anatomy — the shape of one spoken moment

The break structure above is about *which* elements appear and how the session flows. This is one level finer: the skeleton of a *single segment*, abstracted from the seven showcase examples. Every one of them shares the same bones:

> **Music anchor (open) → tonal turn → payload → doorway/landing → music anchor (return)**

*Come off the music → pivot into the thing (setting its tone) → deliver the thing → point back to real life → hand back to the music, in a mood that matches what just aired.*

**Bankable as rules (violating these breaks something, not just changes the feel):**
- **Music bookends** — open from music, return to music. *(Same invariant as the frame above.)*
- **The tonal turn sets the register *before* the payload lands** — "let's bring it down" so a heavy beat doesn't jar. A sensitive payload with no tonal turn is the whiplash failure.
- **The return-to-music matches the payload's mood** — heavy hands to soft, celebration hands to energy. Snapping back to party-energy after a gentle beat is a real defect.
- **The doorway on the way out, when a person is involved** — the landing points the listener back to real life (text him, go to the show). This is "doorway not destination" made physical.

**Bankable only as the *default shape*, not a rule (deviation is a feature):**
- **The five-part arc as a sequence** is the *common case*, not law. A great host deviates constantly: sometimes the payload *is* the turn (no setup, just land it); sometimes there's no doorway (a music-history beat has no person to point toward — see showcase segment 6); sometimes it's *just* music and a time check with no payload at all. The arc is the *gravity the segment falls toward*, not the rails it runs on. Banking it as a rigid template is exactly how the show starts feeling rehearsed.

The test for rule-vs-default, here and everywhere in this doc: **does violating it produce a defect, or just a different flavor?** Defects are rules; flavors are defaults.

---

## How this gets to *exceptional* (the method, not the spec)

Everything above — the frame, the anchored edges, the segment skeleton — is **v0: a starting hypothesis, not the dialed-in formula.** It was abstracted from seven human-written examples in an afternoon. The *exceptional* structure does not exist yet and **cannot be reasoned into existence** — it can only be *found* by generating real segments, listening, finding the specific flat or wrong spots, and adjusting. Exceptional comes from *contact with output*, not from refinement of the spec.

This means two things the team must hold:

1. **The tuning loop is: simple v0 → generate → listen → find the specific flat spot → adjust → generate again.** The unit of iteration is *a segment you can hear*, not a spec you can read. You don't discover "the tonal turn drags on celebratory beats" by thinking — you discover it by hearing ten and going "cut that."
2. **This loop is *blocked* until the generation layer exists.** You cannot tweak a voice formula against output you can't yet generate. The generation layer waits on Layer 1 judgment, which waits on the scoring formula. **So the path to the exceptional voice formula runs *through* the unglamorous scoring work, not around it.** Refining this document further, in the abstract, does not move toward exceptional — it only feels like it does.

The discipline: **resist polishing the structure on paper. Lock v0, build the engine that can generate against it, and let real segments tell you what to change.** Exceptional is downstream of output, and output is downstream of the bench.

---

## Summary — what's decided vs. discovered

| | Status |
|---|---|
| The frame: open from music, return to music | **Decided** (invariant) |
| Currency: count songs (sets) + units (breaks), never minutes (v0.5.0) | **Decided** — replaces the clock |
| The two dials (run length × break weight) (v0.5.0) | **Decided** |
| The six-shape vocabulary as *options* (v0.5.0) | **Decided** (starter set; structural; buildable now) |
| Hour-as-composition; two anchors, light between, breather after weight (v0.5.0) | **Decided** (the rhythm) |
| Grave shape coupling (owns-the-break + forced cooldown fused) (v0.5.0) | **Decided** (inherits v0.4.0 hard floors) |
| Which shape to reach for at which moment | **By ear** — taste, tuned by composing real hours and listening |
| The exact anchor spacing across real song lengths | **By ear** |
| The full shape list (beyond the starter six) | **Found by use** |
| Priority: connection beats information for scarce airtime | **Decided** (principle) |
| Anchored edges: backsell on song-end, history at track-edges, time/weather at handoff | **Decided** (defaults, music-triggered) |
| An item airs once; longer break is synthesis-not-replay | **Decided** (Layer-2 rule) |
| Airtime budget measured in weighted units of listener load, not seconds | **Decided** (Layer-2 mechanism) |
| Grave/sensitive items own the break (hard rule above the unit arithmetic) | **Decided** (rule) |
| Residual load carries across breaks (decays, never auto-resets); the dual check | **Decided** (Layer-2 mechanism) |
| Residual is show-state memory, NOT listener-mood inference | **Decided** (hard guardrail) |
| Recovery arc: earn back to brighter gradually, on fresh content only, never replay | **Decided** (rule) |
| Grave cross-break cooldown as a hard rule (not a computed decay) | **Decided** (rule) |
| v0 decay is count-based; mood-aware decay | **Parked** — later refinement |
| The specific unit costs and break budgets | **v0 starting priors** — calibrated by ear against real breaks |
| Residual numbers (pressure limits, decay rate, cooldown song-count) | **v0 starting priors** — found by listening |
| Sparseness; full repertoire never run in one break | **Decided** (principle) |
| Segment skeleton: music bookends, tonal turn before payload, mood-matched return, doorway-when-a-person | **Decided** (rules — violating breaks something) |
| The five-part arc as a fixed sequence | **Default shape only** — deviation is a feature, not a template |
| The dialed-in *exceptional* format | **Discovered** — by generating real segments and listening; v0 here is the seed, not the flower |
| Interior selection, order, energy, pacing, callbacks | **Open — trial and error / listening** |
| Session arc, direction, room-reading | **The ladder — built toward, not first** |

The structure is **certain where the music makes it certain, and open where taste makes it open.** That honesty is the point: it tells the team to *build* the anchored edges and the Layer-2 rules, and to *hold loose and learn* the editorial interior — never to over-lock the part of the show that has to stay free.
