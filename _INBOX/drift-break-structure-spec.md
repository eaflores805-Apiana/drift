# Drift — Break Structure & Session Programming
### Layer 2 spec (the session programmer)

> **v0.2.0** · 2026-06-19 · How a break gets *assembled*, how a session *flows*, and the *anatomy of one segment*. This document is deliberately **honest about its own certainty**: it specifies the parts the music anchors (which we can decide now) and holds the parts taste governs as **open questions to be resolved by trial and error** (build it loose, listen, adjust). Do not let the team over-lock the open middle — that's the part that has to stay free, because it's where the show actually lives.
>
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
| Priority: connection beats information for scarce airtime | **Decided** (principle) |
| Anchored edges: backsell on song-end, history at track-edges, time/weather at handoff | **Decided** (defaults, music-triggered) |
| An item airs once; longer break is synthesis-not-replay | **Decided** (Layer-2 rule) |
| Sparseness; full repertoire never run in one break | **Decided** (principle) |
| Segment skeleton: music bookends, tonal turn before payload, mood-matched return, doorway-when-a-person | **Decided** (rules — violating breaks something) |
| The five-part arc as a fixed sequence | **Default shape only** — deviation is a feature, not a template |
| The dialed-in *exceptional* format | **Discovered** — by generating real segments and listening; v0 here is the seed, not the flower |
| Interior selection, order, energy, pacing, callbacks | **Open — trial and error / listening** |
| Session arc, direction, room-reading | **The ladder — built toward, not first** |

The structure is **certain where the music makes it certain, and open where taste makes it open.** That honesty is the point: it tells the team to *build* the anchored edges and the Layer-2 rules, and to *hold loose and learn* the editorial interior — never to over-lock the part of the show that has to stay free.
