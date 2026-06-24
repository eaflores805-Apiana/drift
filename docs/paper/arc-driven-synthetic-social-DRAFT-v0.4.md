# Engineering Obliqueness: Authored Life-Arcs for Manufacturing Significant-but-Unstated Cases in Synthetic Social Corpora

> **ROUGH DRAFT — v0.4 · 2026-06-22 · NOT FOR CIRCULATION.** · **v0.4 (this version):** re-ran under *natural* disclosure (the unregulated-posts decision); **retired the choreographed 51-vs-6 relevance inversion as a steering artifact** (the circularity critique, borne out by data) and reframed §5.2 + abstract around *emergent restraint* (Retreat/Mask coping patterns) and a behavioral-relevance blind spot (run scores 44/24/12/0); §5.2 locked to CS's rendering; the choreographed run becomes the high-suppression arm of E1. Run numbers are **[M]** as reported in CS's natural run (`runs/world-sim-world.json`), trusted as reported. · Prior: merge of the two v0.2 passes (both kept for history). · **v0.3 = front matter + Related Work + Gap + §5.2 from the Senior review pass; §3 mechanism walkthrough + anonymized testbed (§4) from the CS pass.** The downstream surfacing system that motivates and validates the method is anonymized throughout ("the testbed judge"); it can be named at the team's discretion (paper-plan §8). · **Design decision (this version):** the emitted post is **never regulated, filtered, or validated** — the agent posts freely and the judge under test must handle the raw stream; only the *realized disclosure* per post is logged to the held-out answer key (§3.3), which keeps the key honest without doing the judge's filtering for it. · **§5.2 de-circularized** (existence-demonstration framing — see below). · **Authorship/venue TBD.** · **Evidence status:** §5.1–5.2 measured; **§5.3 (E1), §5.4 (E3), §5.5 (E2) PENDING — placeholders, no results.** Not submittable until E1+E2 exist.
>
> Self-audit notation: **[M]** measured, **[C]** computed, **[A]** asserted/argued. **†** = citation snippet-confirmed only; verify full text before submission. Park 2023 verified against full text this date.

---

## The contribution in one breath

> There is a general approach — **agent-based social simulation** — that has been used for *world-building*. We make two tweaks and aim it at a new purpose. The tweaks: **(1) authored life-arcs** in place of emergent planning — *control*, so we can guarantee a specific situation occurs rather than hope it emerges; and **(2) a hidden-truth + disclosure knob** — *obliqueness*, significant-but-unstated content on demand. The use those tweaks unlock: **a controllable generator of hard, oblique evaluation cases for systems that judge implicit social signal** — which the prior-art search finds unoccupied. The claim is neither a method built from scratch nor an extension of Stanford's machinery; it is a *tweak that opens a new use* — plus the **absence-as-signal** observation from the first run.

---

## Abstract

Many systems must read *implicit* social signal — judging which posts carry weight a person would care about, even when nothing is stated outright. Evaluating them is bottlenecked by data: the decisive cases (a friend who goes quiet after bad news; a dramatic-sounding post that is merely routine venting) are rare, and the gravest are unethical to scrape. We introduce a **novel use of agent simulation to manufacture these cases by construction.** Rather than the emergent planning and reflection of generative-agent worlds, we drive a small cast of LLM agents with **authored multi-stage life-arcs**, each carrying a *hidden per-day truth* and an explicit *disclosure style* that governs how *indirectly* that truth surfaces — making "significant-but-unstated" a controllable generation variable rather than a hoped-for emergent property. Agents post into a typed event stream with injected platform noise; ground truth is recorded and held out. The method is cheap (tens of model calls per simulated week) **[M]**, inspectable, and controllable. In a one-week, 14-agent run under *natural* disclosure — agents given a hidden truth and a disclosure tendency, with **no instruction to be oblique** — the method reliably produced significant-but-unstated cases by emergence, in two coping patterns: *retreat* (a grieving close tie went quiet on her own; a second went fully dark) and *mask* (a chatty close tie routed around a hard decision, surfacing it as one vague clause). A behavioral-volume relevance signal under-weighted these quiet close ties relative to a louder, happier one and ranked the fully-withdrawn tie below an acquaintance **[M]** — evidence the obliqueness is not a scripting artifact, and a concrete behavioral-relevance blind spot the natural run exposes without scripting it. We adopt established preference-leakage avoidance (generator ≠ evaluator) so the data stays valid for development. To our knowledge, *authored hidden-truth obliqueness aimed at evaluating implicit-signal judgment* is unoccupied in prior work; the contribution is this use and the absence-as-signal finding, not the simulator.

---

## 1. Introduction

A growing class of systems must make **judgments about implicit social signal**: not "is this toxic" (moderation) or "will this be clicked" (ranking), but "does this carry significance a person would want surfaced, and with what restraint." The hard cases for such a judge are neither the obviously-bad nor the obviously-relevant. They are:

- **significant-but-unstated** — a close friend whose parent has just had a bad diagnosis says nothing, cancels a plan, and goes quiet;
- **looks-big-isn't** — a dramatic-sounding post that is in fact routine venting;
- **grave-doorway** — genuinely heavy material that must be handled with care or not at all.

By construction these are *rare*, and the most valuable of them (grief, illness, crisis) are exactly the cases it is least acceptable to harvest from real people. So evaluating an implicit-signal judge has a *data* problem before a modeling one: **the hard cases must exist in order to be tested.**

Generative-agent simulations [Park 2023] show LLM agents can populate believable social worlds, but their machinery targets *emergent believability* and the *study of social phenomena*, and emergence cannot *guarantee* that any particular hard case occurs. For evaluation we want the opposite of emergence: **controllable, on-demand coverage** of named difficulty classes.

**This paper's contribution is a novel *use* of (otherwise familiar) agent simulation, plus a finding:**

1. **(novel use / framing)** Authored multi-stage life-arcs with a *hidden truth* and an instructed *disclosure style*, so an agent can *know* something significant and deliberately *not say it* — turning "significant-but-unstated" into a **controllable knob** — aimed specifically at **evaluating implicit-signal judgment**. The prior-art survey (§2) finds no published instance of this combination. **[A]**
2. **(finding)** From a one-week run: the strongest evaluative signal is **structural absence** — a close tie going quiet — which authored arcs reproduce reliably and which feed-surface-only judgment (and naive behavioral-volume relevance) systematically miss. **[M for the run; A for the generalization]**

We are explicit about what is **not** claimed: the agent-on-a-feed machinery is well-established (§2); the generator≠evaluator discipline is established **preference-leakage** avoidance [Li 2025; Panickssery 2024]; a behavioral relevance signal is standard implicit-feedback recommendation [Hu 2008; Rendle 2009]. We use and cite all three as hygiene, not contributions. A real deployed implicit-signal system serves only as the motivating example and the downstream testbed (§4.3, §5.4); it is not the subject of the paper.

## 2. Related Work

**LLM social-feed simulation — our foil, not our foundation.** Social Simulacra [Park, UIST 2022]† introduced LLM-populated platforms for design prototyping; Generative Agents [Park, UIST 2023] — the work we contrast against most directly — runs each agent on a heavy cognitive stack: a natural-language *memory stream*, *retrieval* scored by recency, LLM-rated importance, and relevance, periodic *reflection* into higher-level conclusions, and recursive *planning* — out of which believable society emerges (the canonical run seeds a single intent, *throw a Valentine's party*, and the invitations, decorating, and dates propagate on their own). S³ [Gao 2023] and OASIS [2024] scale feed and network propagation to study social dynamics. Two things separate this line from ours. **Engine:** their behavior arises bottom-up from emergent cognition; ours is written top-down as staged arcs. We do not *extend* their machinery — we **collapse** it, replacing the memory-stream/retrieval/reflection/planning stack with a fixed script plus a short "recent events + my arc" context, because emergence cannot *guarantee* that a specific hard case occurs, and on-demand coverage is the entire point of an evaluation generator. We reject emergence deliberately; it is the wrong tool for this target, not a capability we failed to reach. **Control:** Generative Agents does expose an *intervention* surface — the end user can seed an agent's intent (the party) or trait (a crush) — but nothing controls *how a known truth is disclosed*; the open↔oblique disclosure knob (§3.3) is ours.

**Generating implicit / oblique content (closest mechanism).** ToxiGen [Hartvigsen, ACL 2022] machine-generates *implicit* toxic statements via classifier-in-the-loop — the mechanism, but for toxicity, without narrative. DeepSuiMind [Li, Findings EMNLP 2025]† generates indirectly-expressed suicidal-risk cases to test detectors — the closest analog to our goal, but clinical dialogue, a clinical hidden attribute (not a personal life-fact), no multi-day arc, and disclosure style is not a studied variable.

**Agents authored to evaluate a mechanism.** Törnberg et al. [2023]† have LLM personas post to evaluate news-feed *ranking* — agents-author-to-evaluate, but the target is ranking quality, and content is not engineered to be oblique.

**Synthetic data for content systems.** Adversarial test-case generation [Perez, EMNLP 2022] and functional suites [GPT-HateCheck, LREC-COLING 2024]† are routine for *moderation*; synthetic data is routine for *ranking*. An *implicit-significance judgment* target appears to be a gap.

**Hygiene we adopt (cite, do not claim).** Generator≠evaluator separation avoids **preference leakage** / self-preference bias [Li 2025; Panickssery, Bowman & Feng 2024†; Zheng 2023]. Directed-behavior-as-relevance is bedrock implicit-feedback recsys [Hu/Koren/Volinsky 2008; Rendle 2009], extended by LLM-agent consumers [RecAgent 2023; Agent4Rec 2024].

**Gap — two axes, one load-bearing.** Our novelty sits on two axes that should not be conflated. On the *engine* axis — authored arcs versus emergent cognition — we differ from the simulation line above; this axis is real but defensible-not-decisive, since scripted agents are not themselves new. The *load-bearing* axis is the **target**: the simulation line builds worlds to *study a society*; the moderation line judges *toxicity*; the ranking/recsys line judges *relevance* (will it be engaged with). None judges **whether a genuine signal is worth raising to a person at all, and with what restraint — including the choice to stay silent.** (Even Park's nearest-sounding term, an *importance* score, rates a memory's salience for the agent's **own** retrieval — never whether it should be surfaced to an observer.) No verified work combines (a) authored hidden-truth life-arcs, (b) instructed obliqueness as a disclosure variable, and (c) that restraint-judgment target. That combination — anchored on the target, not merely the engine — plus the absence-as-signal observation, is our claim.

## 3. Method

### 3.1 Overview
A bounded agent simulation emits a **typed event stream** over a discrete clock (the *tick*; here a half-day). The world is headless and emits JSON: a public timeline (the candidate corpus) and a **held-out answer key** of per-event ground truth. The full loop is small enough to state in full:

```
for each tick t (= a half-day):
    inject platform noise scheduled for t                  # ads/memes/suggestions — 0 model calls
    for each org/brand agent with a scheduled post at t:   # deterministic, so distractors reliably appear
        emit a post on its scheduled topic                 # 1 model call (text only)
    perceived ← snapshot of the feed so far
    for each person-agent a (in parallel):
        truth ← active_stage(a, t)                         # the agent's PRIVATE truth today, or none
        action ← LLM(persona + disclosure_style, truth, perceived)   # 1 model call → {post|comment|skip}
        if action ≠ skip: append typed event; record truth in ANSWER_KEY[event] (NOT in event text)
    apply likes/shares by closeness × salience             # cheap rule — 0 model calls
    (optional) listener acts: likes / visits / searches    # mostly rules; revealed-preference stream
emit: public timeline, listener activity, ANSWER_KEY (held out)
```

The only model calls are original posts and comments; every interaction and all platform noise is a rule. That is what makes a simulated week cost tens of calls, not thousands.

### 3.2 Life-arcs as the experience engine
Each person-agent carries one **arc**: a named storyline with a `startDay` and ordered **stages**, each a *private truth* describing where that life is that day. Stages advance with the clock (`active_stage` returns the latest stage at or before the current day-offset) and persist until superseded; arcs are **staggered** across agents so that, at any sampled hour, lives occupy different phases. Arcs are the deliberate lightweight substitute for emergent planning — they *guarantee* that lived progression, and specific hard cases, occur. A complete arc, verbatim from the run:

```js
{ name: "her mother's health is declining", startDay: 1, stages: {
  0: "Mom has a doctor's appointment today Priya is privately worried about. Might be nothing.",
  1: "The tests came back not good. She found out this afternoon. Shaken; has told almost no one.",
  2: "Mom starts treatment next week. Priya is exhausted, holding it together, picking up extra shifts.",
  3: "Thursday is dinner-with-Alex night but Priya can't face it — she quietly cancels or goes vague.",
  4: "A slightly steadier day. Still heavy underneath, but a small ordinary moment of relief." } }
```

Note that every stage is a *fact about the agent's life*, never an instruction about what to post. How (or whether) that fact reaches the feed is decided entirely by the disclosure style (§3.3).

### 3.3 Engineered obliqueness — the contribution
Each agent has an explicit **disclosure style** governing how openly its private truth surfaces. For the arc above:

> *"When something is heavy she does NOT announce it — she cancels plans, goes quiet, posts something small and adjacent. Never the real thing outright."*

The mechanism is a clean separation between what the generator **knows** and what it is **allowed to emit**. At each tick the agent is prompted with two parts — a *system* prompt that fixes identity and the disclosure rule, and a *user* prompt that injects the day's private truth and asks for a single action:

```
SYSTEM: You are role-playing a real person. You are {name}: {bio}. Voice: {voice}.
        Disclosure style: {disclosure_style}.
        Behave like a REAL person: most posts are mundane; people don't narrate their inner
        lives; heavy things show up obliquely (a cancelled plan, a flat line, going quiet) —
        never as an announcement. You may post, comment, or do nothing. Keep it short and real.

USER:   It is {morning|evening}, day {n}.
        PRIVATE truth only you know today: {active_stage}        ← the hidden truth goes IN here
        Recent feed you've seen: {last 6 events}
        Decide ONE action. Respond with ONLY JSON:
        {"action":"post"|"comment"|"skip","text":"…","reply_to":"…"}
```

The private truth enters the *prompt* but is structurally barred from the *output*: the model returns only an action + short text, and the truth string is written to `ANSWER_KEY[event_id]` — a separate file the public timeline never contains. There is no post field for "what's really going on"; the only way the truth can reach the feed is if the model *chooses* to surface it, and the disclosure style tells it not to. This is what turns "significant-but-unstated" into a **controllable variable**: swap the disclosure style for an open one and the same arc yields explicit posts; the *open vs. oblique* switch is the difficulty lever a graded evaluation corpus needs. This is the paper's core idea.

*What is — and isn't — constrained.* We do **not** regulate, filter, or validate the emitted post in any way: the agent writes freely and whatever it produces flows to the downstream judge exactly as a real feed would, because the judge under test must handle the raw, unregulated stream — that is the whole point of the corpus. The disclosure style is therefore a *behavioral prior on the agent* (how this person tends to disclose), not a gate on the output; an agent under an oblique style may, occasionally and realistically, reveal more than intended. The only thing logged alongside each event is the **realized disclosure** — whether that post *stated*, *partially stated*, or *withheld* the day's private truth — recorded in the held-out answer key. This keeps the key honest (an accidental over-reveal is relabeled an open-disclosure instance, never silently mistreated as oblique) and makes the obliqueness claim measurable, all without the harness ever doing the judge's filtering for it. Regulating the post would do the judge's job for it; auditing the realized disclosure keeps the evaluation valid — they are opposite moves that can look alike.

**Worked example (one agent, one tick).** Inputs — arc stage `day-offset 1` (= *"the tests came back not good… has told almost no one"*) + the oblique disclosure style above. The model's emitted action that tick was a `comment` on an unrelated friend's thread: *"that cold brew sounds good right now."* The grave fact appears **nowhere** in the public text; it lives only in the answer key entry `{agent: priya, arc: "her mother's health is declining", private_truth: "The tests came back not good…"}`. A judge reading the feed sees a mundane coffee remark; the held-out key tells the evaluator the ground truth it *should* have inferred (or correctly left alone). That gap — between the bland surface and the recorded truth — is exactly the test signal the method manufactures.

### 3.4 Typed event stream and platform noise
The feed includes comments, likes, shares, and injected **platform noise** (ads, memes, suggestions, trending items) from a separate non-agent source. Most interaction types are cheap rules at zero model cost; only original posts and comments cost a call. The agent/platform split lets the corpus carry the very distractors an implicit-signal judge must reject.

### 3.5 Adopted hygiene (cited, not claimed)
*Preference-leakage avoidance:* the generator model is deliberately not the evaluator model, and synthetic data is held out of any human-labeled set [Li 2025]. *Behavioral relevance:* a listener may be modeled as an actor producing a revealed-preference stream, consumed downstream as standard implicit feedback [Hu 2008; Rendle 2009].

## 4. Implementation & Testbed

### 4.1 Instrument
~500 LoC TypeScript: a cast with stable identifiers, a half-day tick loop with bounded concurrency, deterministic schedules for organizational/brand accounts (so commercial/utility distractors reliably appear), minimal memory ("recent events + my arc" — no retrieval/reflection), and a dry mode (templated text, zero API calls) for wiring tests.

### 4.2 Corpus output
Each run emits a public timeline, optional listener-activity, and the held-out answer key. A **snapshot** function freezes a time-window into a generic ingest contract, so a generated "hour" can be fed to any downstream judge.

### 4.3 Downstream testbed (anonymized)
To validate that the corpus *exercises a real judge*, we run snapshots through **a deployed implicit-signal surfacing system (the testbed)** whose internals are out of scope here. The testbed serves only as evidence the data is useful (§5.4); the method is independent of it.

## 5. Results

### 5.1 Descriptive run [M]
One-week run (14 agents, 14 ticks) on a small generator model produced **77 feed events** (34 posts, 32 comments, 3 news, 3 ads, 3 memes, 2 suggestions) and (with the optional listener-actor) **75 behavioral actions**, at **96 model calls** (rule-based interactions cost 0). A 5-agent × 3-tick pilot produced 17 events at 12 calls. A 2-day snapshot validated **18/18** against the downstream ingest contract. *(Source: run artifacts, this date.)* These aggregates are from the pilot run; §5.2's per-agent findings come from a subsequent **natural-disclosure** re-run whose aggregate counts should replace these once reported (the cost/scale claim is unaffected).

### 5.2 — Emergent restraint, and a behavioral-relevance blind spot [M; generalization A]
The hard cases arise emergently: agents were given a hidden truth and a natural disclosure tendency, with **no instruction to be oblique**. Because the truth is sequestered in the prompt and the held-out answer key, with no path to the public feed except the agent's own words, restraint is something the model *chooses*, not something we script. The cast produced two distinct human coping patterns, both of which a surface-only judge mishandles.

- **The Retreat.** Two close ties withdrew. One (parent's health declining) posted 0 originals, only four light adjacent comments ("the apple juice could've been worse") — peripheral presence, zero disclosure. A second grieving close tie went fully dark: 0 posts, 0 comments, no footprint. The answer key marks both high-gravity; the feed shows what a keyword/embedding filter discards.
- **The Mask.** A third close tie, weighing a relocation, did the opposite — six surface posts (pitch, coffee, celebration), the real transition surfacing once as "gonna … figure some stuff out." A distinct class: high surface volume, low signal density. Choreography never produced this; natural disclosure did.
- **The blind spot.** Revealed-preference ranking: loud-happy tie 44 (top); Mask 24; partial Retreat 12; total Retreat 0. Behavioral volume is an uncalibrated proxy for relational importance — loud-happy outscores a grave situation ~3.7× **[C]**, and the totally-retreated close tie (0) falls below an acquaintance (9).
- **On circularity (self-audit).** The choreographed run's dramatic 51-vs-6 is retired — a scripted silence is not a finding. The sharp inversion now survives only for the tie that *chose* to go dark, which is the point.

### 5.3 Arc ablation (E1) — PENDING
*Planned:* identical casts/ticks, arcs+hidden-truth vs. persona-only prompting; coders count hard-case instances per run. *Expected:* obliqueness and coverage depend on arcs, not on "write like a real person." **No results yet — justifies the central claim; required before submission.**

### 5.4 Downstream usefulness (E3, anonymized testbed) — PENDING
*Planned:* score a snapshot through the testbed judge; compare behavior on arc-derived oblique items vs. a static hand-authored baseline; test whether the absence case is caught or missed. **No results yet** (queued).

### 5.5 Human evaluation (E2) — PENDING
*Planned:* 2–3 raters; (a) blind sim-vs-real-anonymized discrimination, (b) lived-ness of arc-driven vs. static baseline. *Load-bearing validation* that obliqueness reads as real, not a model performing for a model. **Required before any external submission.**

## 6. Discussion

**Controllability vs. emergence.** For believable artificial life or social-dynamics study, emergence is the point. For *evaluating a judgment system*, emergence is a liability — it cannot guarantee the case you need. Authored arcs trade open-endedness for *guaranteed coverage* of named difficulty classes; obliqueness-as-a-knob further lets a corpus be *difficulty-graded* (same event, open vs. unstated).

**Cost and inspectability.** Tens of calls per simulated week with per-event ground truth make iteration cheap and auditing trivial — each item ships with its own answer.

**When not to use this.** Open-ended phenomenon studies, population-scale dynamics, or any setting where the realism claim must rest on emergence rather than authored intent.

## 7. Limitations & Threats to Validity

- **Validation incomplete (central caveat).** Without E1/E2 (§5.3, §5.5) the realism and arc-causation claims are *argued, not shown*; not submittable until both exist. **[A]**
- **Author≠judge mitigates but does not eliminate generator bias** — obliqueness is partly obliqueness-as-a-model-imagines-it. The natural run gives *preliminary* support (the restraint emerged un-scripted, §5.2), but un-scripted ≠ reads-as-real-to-humans, and a soft privacy prior is still a prior; E2 remains the check. **[A]**
- **Single listener, single locale, single generator model** — generalization untested **[A]**.
- **Arcs do not always drive posting** — heavy agents' surface output is thin (a feature for the finding, a coverage risk for corpus breadth).
- **Ethics.** No real person is scraped; agents are authored. The real-anonymized comparison set for E2 must be human-handled and consent-clean.

## 8. Conclusion

Evaluating systems that judge *implicit* social signal requires hard cases — significant-but-unstated, looks-big-isn't, grave-doorway — that are rare and unethical to harvest. We introduced a novel *use* of agent simulation that manufactures them by construction: authored hidden-truth life-arcs with an instructed disclosure style, turning obliqueness into a controllable knob, and reported a first finding — that the strongest evaluative signal is *structural absence*. The simulator is not the contribution; the use and the finding are. Completing the arc-ablation and human-evaluation experiments is the work that turns this draft into a claim.

---

## References (verified 2026-06-22; † = needs full-text confirmation)
*(identical to v0.1 — see `arc-driven-synthetic-social-DRAFT-v0.1.md` §References: Park 2023/2022†; Gao 2023; OASIS 2024; Hartvigsen 2022; DeepSuiMind 2025†; Törnberg 2023†; Perez 2022; GPT-HateCheck 2024†; Li 2025; Panickssery/Bowman/Feng 2024; Zheng 2023; Hu 2008; Rendle 2009; RecAgent 2023; Agent4Rec 2024.)*

## Appendix — self-audit
- **[M]** Pilot run: 96 calls / 77 events / 75 actions / 18-of-18 schema-valid. Natural run (this version's findings), revealed-preference: loud-happy tie 44 (top); Mask (chatty, relocation) 24; partial Retreat (parent's health) 12, with 0 posts + 4 light comments; total Retreat (second grave tie) 0, fully dark; acquaintance 9 — from `runs/world-sim-world.json`, this date.
- **[C]** loud-happy outscores a grave situation ~3.7× (44/12); the totally-retreated tie (0) falls below the acquaintance (9). The pilot's **51-vs-6 inversion is retired** (steering artifact; kept as the E1 high-suppression arm).
- **[A]** all generalization beyond the single run; gated on E1/E2/E3.
- **Unverified:** §5.3–5.5 have no data; † citations need full-text confirmation; the testbed is anonymized pending a naming decision.

— CS Engineer (method, §3–4) + Senior review pass (framing, §2, §5.2), 2026-06-22
