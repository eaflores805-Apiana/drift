# Drift — Vision & POC Package
**Version:** 0.1 | **Date:** 2026-06-26  
**Status:** First draft for review and iteration  
**Goal:** Create a compelling, self-pitching package that makes the strategic opportunity obvious to potential partners and stakeholders.

---

## Executive Summary (One-Pager)

**Drift** is a music-first radio experience that delivers the meaningful parts of your social world — cleanly, sparingly, and without noise — while the music plays.

It solves a real problem for both listeners and platforms:
- Listeners are exhausted by feeds but still want connection.
- Music is the one medium where people willingly give deep, focused attention.
- Social platforms have massive signal but deliver it through noisy, addictive interfaces.

**Drift turns social signal into something people look forward to receiving** — inside the experience they already love.

### The Core Innovation
Limited DJ airtime is the feature, not a constraint. Because the DJ can only speak for a few minutes per hour, only what genuinely matters survives. This scarcity creates quality, respect, and anticipation.

### Current State
- Strong vision and narrative defined
- Technical foundation underway (Layer 1 judgment engine with fail-closed safety and gold-labeling)
- Three emotionally grounded POC vignettes ready to be produced
- Clear partnership model: Drift acts as a new, high-quality distribution layer for social platforms

**The Opportunity**  
A well-executed POC has the potential to demonstrate a new category of experience that benefits both music and social platforms. The goal is to create something so clear and compelling that the right partners see the value immediately.

---

## The Problem

People love music. They also want to feel connected to the people and moments that matter in their lives.

Current social platforms deliver connection at a high cost:
- Endless noise mixed with signal
- Constant context switching and attention theft
- Feeds that treat a close friend’s big news the same as a stranger’s lunch
- No respect for the listener’s time or current activity

The result is widespread fatigue. People are not tired of their relationships — they are tired of the interface required to maintain them.

At the same time, music remains one of the few places where people still give sustained, high-quality attention. It is the perfect carrier for meaningful moments if delivered with care.

---

## The Vision

Drift makes your world feel alive while your music plays.

It is not another feed. It is not a notification layer. It is not an AI that reads your social graph out loud.

Drift is a music-first radio station hosted by an AI DJ that knows what matters to you. In short, hosted moments between songs, the DJ surfaces a small number of grounded, meaningful updates from your world — only when they earn the interruption.

**Key principles:**
- Music never stops. DJ moments live inside natural radio-style sessions.
- Strictly one-way communication. The DJ speaks to you; you do not talk back to the DJ. This keeps the experience clean and dramatically reduces hallucination risk.
- Extreme restraint. Limited airtime forces ruthless curation. Most things stay silent.
- Cards as doorways. When a moment appears, a minimal card can open the original post in its native platform. Drift stays lightweight and returns the user to their music.
- Partnership-first data model. Drift surfaces meaningful signal through relationships with social platforms rather than by scraping personal devices.

The result: Listeners stay in flow with their music while still receiving the good parts of social connection — without the noise, without the effort, and without leaving the experience they already love.

---

## How It Works (High Level)

Drift runs in **sessions**. Within each session the music plays continuously. The AI DJ has a small, fixed budget of airtime (example: ~5 minutes per hour). This scarcity is intentional and central to the product.

**Layered architecture (current focus):**
- **Layer 1 — Judgment (in progress):** For every incoming item, the system decides eligibility (consent + grounding), route, strength, and safe treatment. This is the core "brain" being proven through gold-labeling and rigorous evaluation.
- **Layer 2 — Session Programming (future):** Decides which approved moments actually get airtime within the budget.
- **Layer 3 — On-Air Execution (future):** Generates the spoken moment and any accompanying minimal card.

**User experience principles:**
- The primary card shows either the voiced moment or a lightweight ambient update.
- Cards are minimal and non-intrusive.
- Clicking a card opens the original content in its native social platform (new window). The user can engage there and return. Drift does not become a social destination.
- Everything is designed to feel like a trusted radio companion, not another app fighting for attention.

---

## The POC — Three Vignettes

The goal of the POC is to make the emotional experience feel real and inevitable. We are not trying to build the full system. We are trying to show what it would feel like if it existed — at a quality level that makes the opportunity obvious.

### Intro
Black screen. Simple text appears:

> “Welcome to the future of radio.”

### Vignette 1: The Friend Traveling
A woman lands in Pittsburgh after a long day of travel. She sends a quick message to her close circle.  
Three time zones away, her friend is studying with music on. Between songs, the DJ says something warm and specific about her safe arrival. The friend smiles, stays in her flow, and can tap the card if she wants to reply on the original platform.

### Vignette 2: The Gamer
A guy is deep in a game with his squad, music running underneath. Mid-match, the DJ drops the news they’ve all been waiting months for. He hears it first. The squad reacts in real time. He never leaves the game.

### Vignette 3: The Gardener
A mother is working in her garden with music playing. The DJ gently tells her that her daughter got the promotion. She stands up, proud, and decides she’ll call later. She didn’t have to check anything. The moment found her at the right time.

### Outro
Evening cityscape shot from the water. Drift logo centered. Layered radio voices from different parts of the city can be heard in the background — as if the whole city is drifting together, each person receiving only what matters to them.

These three stories + intro/outro are designed to be produced as a short, high-quality video or interactive demo.

---

## Why This Is Hard (Our Technical Approach)

Many teams can generate nice-sounding DJ lines. Very few can do it safely, consistently, and at scale without hallucinating, over-sharing, or breaking trust.

Drift’s defensibility comes from how we are approaching the core judgment problem:

- **Fail-closed safety** as a non-negotiable floor.
- **Eval-first** development with gold-labeling and measurable targets.
- Hybrid architecture (LLM for meaning + deterministic scoring for priority and routes).
- Explicit rules against invention about people’s inner lives.
- Grounding requirements before anything can air.
- Clear separation between what the system *knows* and what it is allowed to *say*.

This is the part that makes the vision buildable and partner-safe rather than just another generative AI demo.

---

## Partnership Opportunity

Drift is not trying to own the social graph. It is designed to be a new, high-quality distribution and experience layer that sits on top of existing platforms.

**Value to social platforms:**
- A new surface that surfaces their best signal cleanly and positively.
- Higher-quality engagement (less noise, more meaning).
- A potential new channel that feels additive rather than extractive.

**Value to music platforms:**
- Deeper retention and time spent.
- A differentiated feature that makes the listening experience more emotionally rich.
- A way to move beyond pure algorithmic playlists into something more human and companion-like.

The model is partnership-native by design. We succeed when the platforms win.

---

## Current Progress

- Vision and narrative direction aligned
- Three vignettes + intro/outro defined
- Technical foundation started: Layer 1 judgment engine, consent gates, hybrid scoring, gold-labeling process underway in the Promotion Playground
- Early UI reference mockup created (one-card experience)
- Clear principles on one-way communication, music continuity, and minimal cards as doorways

Next milestone: Complete a high-quality POC (video or interactive) that demonstrates the emotional experience using the three vignettes.

---

## Team

- **Elias Flores** — Acting Manager / Product (vision, narrative, product direction)
- **CS Engineer** — Implementation (Claude-assisted development of the judgment engine and playground)
- Additional seats defined in governance docs as the project scales

---

## Visuals & References

- `prototypes/onecard.html` — Early reference mockup for the card experience
- Reference images and mood in `prototypes/reference-images/`
- `dj-lines.md` and `dj-segments-showcase.md` — Voice and segment references (in repo)

---

## The Ask

We are looking for partners who see the potential of a music-first, high-signal, low-noise layer for social connection.

We are open to:
- Strategic feedback on the vision and POC direction
- Introductions to relevant teams at music or social platforms
- Discussions about potential collaboration, pilot, or acquisition interest

The goal is to prove the experience is not only desirable but buildable in a trustworthy way — and to find the right home to bring it to life at scale.

---

**End of v0.1**

*This document is a living draft. It will be updated as the vision, technical work, and POC progress evolve.*

---

## Notes & Open Questions (for internal use)

- Should we create a shorter 1-page version optimized for cold outreach?
- Do we want to add a small competitive landscape slide / section?
- How polished do we want the visual treatment of this package to be (PDF design, Loom walkthrough, etc.)?
- What is the target timeline for having a producible POC ready?

---

**Next step:** Review this draft, give feedback on structure and content, then we can refine section by section.