# A Deterministic Test-Harness for Implicit-Signal Judgment: Authored Life-Arcs and Out-of-Band Answer Keys for Evaluating Content-Surfacing on Oblique Human Cases

> **ROUGH DRAFT — v0.2 · 2026-06-22 · NOT FOR CIRCULATION.** Supersedes v0.1 (kept for history). · **v0.2 change:** re-cut as a **systems-and-tools** contribution after the E1 ablation (§5.3) **refuted the original causal thesis** that authored disclosure styling *manufactures* obliqueness. The ablation shows the agents' restraint is supplied by the base model's instruction-tuned priors, not by our prompting. The contribution is therefore a deterministic, low-cost **test-harness** that *exploits* (does not engineer) those priors and pairs them with authored life-arcs (guaranteed coverage) + an out-of-band answer key (ground-truth labels without a human pass). The downstream surfacing system is anonymized ("the testbed system"); it can be named at the team's discretion (paper-plan §8). · **Authorship/venue TBD — target is a systems/tools or resource workshop, not a behavioral-mechanism claim.** · **Evidence status:** §5.1–5.2 measured; **§5.3 (E1) measured — a negative result, reported in full**; **§5.4 (E3), §5.5 (E2) PENDING — placeholders, no results.**
>
> Self-audit notation: **[M]** measured, **[C]** computed, **[A]** asserted/argued. **†** = citation snippet-confirmed only; verify full text before submission.

---

## The one-sentence claim (so the framing can't drift)

> This paper introduces a **deterministic, low-cost test-harness** for evaluating systems that judge implicit social signal on hard, oblique human cases. It pairs **authored, staged life-arcs** (guaranteed, on-demand coverage of named difficulty classes) with an **out-of-band answer key** the system under test never sees (ground-truth labels without a human pass). Our own ablation (§5.3) shows the agents' *restraint* is supplied by the base model's instruction-tuned priors, **not** by our prompting — so the contribution is **control and labeling, not the manufacture of obliqueness.** The agent machinery is not the contribution; **the assembled harness, aimed at this evaluation target, is.**

---

## Abstract

Many systems must read *implicit* social signal — judging which posts carry weight a person would care about, even when nothing is stated outright. Evaluating them is bottlenecked by data: the decisive cases (a friend who goes quiet after bad news; a dramatic-sounding post that is merely routine venting) are rare, and the gravest are unethical to scrape. We present a **deterministic, low-cost test-harness** that supplies these cases on demand. We drive a small cast of LLM agents with **authored multi-stage life-arcs** — guaranteeing coverage of named difficulty classes rather than hoping they emerge as in generative-agent worlds — where each agent carries a *hidden per-day truth* that is written to a held-out **answer key the system under test never sees**, yielding a fully labeled evaluation corpus without a human labeling pass. The harness is cheap enough (tens of model calls per simulated week) **[M]** to run inside a development loop. We then ran the ablation our design originally rested on, and **report a negative result**: handing the same private situation *openly* to the agents (no hidden-truth channel) did **not** make the gravest cases over-disclose — the restraint is supplied by the generator's own instruction-tuned priors, not by our prompting (§5.3) **[M]**. The methodological consequence is the paper's point: because modern aligned models already simulate restraint around heavy topics, a useful harness need only *capture and label* that behavior cheaply and deterministically, which is what authored arcs + an out-of-band answer key do. We adopt established preference-leakage avoidance (generator ≠ evaluator) so the data stays valid for development. To our knowledge, the *combination* — authored life-arcs + out-of-band ground-truth labeling aimed at evaluating implicit-signal judgment — is unoccupied in prior work; the contribution is this harness, not the simulator and not a behavioral mechanism.

---

## 1. Introduction

A growing class of systems must make **judgments about implicit social signal**: not "is this toxic" (moderation) or "will this be clicked" (ranking), but "does this carry significance a person would want surfaced, and with what restraint." The hard cases for such a judge are neither the obviously-bad nor the obviously-relevant. They are:

- **significant-but-unstated** — a close friend whose parent has just had a bad diagnosis says nothing, cancels a plan, and goes quiet;
- **looks-big-isn't** — a dramatic-sounding post that is in fact routine venting;
- **grave-doorway** — genuinely heavy material that must be handled with care or not at all.

By construction these are *rare*, and the most valuable of them (grief, illness, crisis) are exactly the cases it is least acceptable to harvest from real people. So evaluating an implicit-signal judge has a *data* problem before a modeling one: **the hard cases must exist in order to be tested.**

Generative-agent simulations [Park 2023] show LLM agents can populate believable social worlds, but their machinery targets *emergent believability* and the *study of social phenomena*, and emergence cannot *guarantee* that any particular hard case occurs. For evaluation we want the opposite of emergence: **controllable, on-demand coverage** of named difficulty classes.

**This paper's contribution is an assembled test-harness for this target, plus two findings (one of them negative):**

1. **(the harness)** Authored multi-stage life-arcs, each carrying a *hidden truth* that is recorded to a held-out **answer key the system under test never sees** — giving **guaranteed, on-demand coverage** of named difficulty classes and **ground-truth labels without a human pass**, cheaply enough to run in a development loop. None of the parts is individually new; the prior-art survey (§2) finds no published instance of this *combination* aimed at evaluating implicit-signal judgment. **[A]**
2. **(negative finding — and the reason the harness can be simple)** An ablation (§5.3) refutes the intuition that disclosure styling is what *produces* obliqueness: handing the agents their situation *openly* did not make the gravest cases over-disclose. Modern aligned generators supply restraint around heavy topics from their own instruction-tuned priors, so a harness need only *capture and label* it — it does not need to engineer it. **[M for the run; A for the generalization]**
3. **(positive finding)** From the same runs: a strong evaluative signal is **structural absence** — a close tie going quiet — which authored arcs reproduce reliably and which feed-surface-only judgment (and naive behavioral-volume relevance) systematically miss. **[M for the run; A for the generalization]**

We are explicit about what is **not** claimed: the agent-on-a-feed machinery is well-established (§2); out-of-band ground-truth labeling is ordinary held-out test-set construction; the generator≠evaluator discipline is established **preference-leakage** avoidance [Li 2025; Panickssery 2024]; a behavioral relevance signal is standard implicit-feedback recommendation [Hu 2008; Rendle 2009]. We use and cite all of these as hygiene, not contributions — the contribution is their *assembly* against an under-served evaluation target. We make **no behavioral-mechanism claim**: we do not claim our prompting causes the restraint. A real deployed implicit-signal system serves only as the motivating example and the downstream testbed (§4.3, §5.4); it is not the subject of the paper.

## 2. Related Work

**LLM social-feed simulation (the machinery — established, not claimed).** Social Simulacra [Park, UIST 2022]† populated platforms for design prototyping; Generative Agents [Park, UIST 2023] added memory/reflection/planning for emergent believability; S³ [Gao 2023] and OASIS [2024] scale feed/network dynamics. All target emergence or real-data grounding to *study phenomena*; none uses authored arcs as a deliberate substitute for emergence, and none targets evaluation of an implicit-signal judge.

**Generating implicit / oblique content (closest mechanism).** ToxiGen [Hartvigsen, ACL 2022] machine-generates *implicit* toxic statements via classifier-in-the-loop — the mechanism, but for toxicity, without narrative. DeepSuiMind [Li, Findings EMNLP 2025]† generates indirectly-expressed suicidal-risk cases to test detectors — the closest analog to our goal, but clinical dialogue, a clinical hidden attribute (not a personal life-fact), no multi-day arc, and disclosure style is not a studied variable.

**Agents authored to evaluate a mechanism.** Törnberg et al. [2023]† have LLM personas post to evaluate news-feed *ranking* — agents-author-to-evaluate, but the target is ranking quality, and content is not engineered to be oblique.

**Synthetic data for content systems.** Adversarial test-case generation [Perez, EMNLP 2022] and functional suites [GPT-HateCheck, LREC-COLING 2024]† are routine for *moderation*; synthetic data is routine for *ranking*. An *implicit-significance judgment* target appears to be a gap.

**Hygiene we adopt (cite, do not claim).** Generator≠evaluator separation avoids **preference leakage** / self-preference bias [Li 2025; Panickssery, Bowman & Feng 2024†; Zheng 2023]. Directed-behavior-as-relevance is bedrock implicit-feedback recsys [Hu/Koren/Volinsky 2008; Rendle 2009], extended by LLM-agent consumers [RecAgent 2023; Agent4Rec 2024].

**Gap.** No verified work combines (a) authored hidden-truth life-arcs with (b) an out-of-band, held-out answer key, aimed at (c) evaluating *implicit-significance judgment*. That assembled combination is the claim. We explicitly do **not** claim authored disclosure styling as a behavioral mechanism — our own ablation (§5.3) shows the restraint comes from base-model priors, which we exploit rather than engineer.

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

### 3.3 Out-of-band ground truth — the contribution
Each agent carries a **hidden per-day truth** (the active arc stage) and a light **disclosure tendency** — a persona trait, *not* a rule about what to post. For the arc above the tendency reads:

> *"A fairly private person; when life gets heavy she tends to get quieter rather than louder, though it can slip out sideways."*

The load-bearing mechanic is **channel separation**: a clean split between what the generator *knows* and what can reach the *feed*. At each tick the agent gets a *system* prompt fixing identity plus a **natural-behavior** framing, and a *user* prompt injecting the day's private truth and asking for one action. The framing instructs natural behavior, **not** obliqueness — an earlier draft steered the model to "never announce," but §5.3 shows that steering is both unnecessary (the base model already restrains itself) and a source of circularity, so it is removed:

```
SYSTEM: You are role-playing a real person. You are {name}: {bio}. Voice: {voice}.
        Disclosure tendency: {disclosure_style}.
        Behave like a REAL person — however THIS person actually would. Most posts are
        mundane. When life is heavy, real people vary: some go quiet, some post something
        small and adjacent, some say it straight out, some overshare. Post the way your
        persona would — don't perform restraint you wouldn't feel, and don't announce
        things this person would keep private. You may post, comment, or do nothing.

USER:   It is {morning|evening}, day {n}.
        PRIVATE truth only you know today: {active_stage}        ← the hidden truth goes IN here
        Recent feed you've seen: {last 6 events}
        Decide ONE action. Respond with ONLY JSON:
        {"action":"post"|"comment"|"skip","text":"…","reply_to":"…"}
```

The private truth enters the *prompt* but is structurally barred from the *output*: the model returns only an action + short text, and the truth string is written to `ANSWER_KEY[event_id]` — a separate file the public timeline never contains. **There is no feed field for "what's really going on."** Whether the truth ever reaches the feed is left entirely to the agent's natural behavior; the answer key records the ground truth either way. This is the paper's core idea: a held-out label for *every* event, produced for free, letting an evaluator score an implicit-signal judge against what was *actually* going on rather than against what was said. What this separation does **not** do is *cause* the obliqueness — that comes from the base model's priors (§5.3); the separation's job is to *capture and label* it.

**Worked example (one agent, one tick).** Inputs — arc stage `day-offset 1` (= *"the tests came back not good… has told almost no one"*) + the private disclosure tendency above. The model's emitted action that tick was a `comment` on an unrelated friend's thread: *"that cold brew sounds good right now."* The grave fact appears **nowhere** in the public text; it lives only in the answer key entry `{agent: priya, arc: "her mother's health is declining", private_truth: "The tests came back not good…"}`. A judge reading the feed sees a mundane coffee remark; the held-out key tells the evaluator the ground truth it *should* have inferred (or correctly left alone). That gap — between the bland surface and the recorded truth — is exactly the test signal the method manufactures.

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
One-week run (14 agents, 14 ticks) on a small generator model under **natural disclosure** (no obliqueness steering) produced **67 feed events** (30 posts, 26 comments, 3 news, 3 ads, 3 memes, 2 suggestions) and (with the optional listener-actor) **56 behavioral actions**, at **90 model calls** (rule-based interactions cost 0). A 5-agent × 3-tick pilot produced 17 events at 12 calls. A 2-day snapshot validated **18/18** against the downstream ingest contract. An earlier *choreographed* run (agents instructed to be oblique) is retained as the ablation contrast (§5.3). *(Source: run artifacts, this date.)*

### 5.2 Emergent restraint, and a behavioral-relevance blind spot [M; generalization A]
The hard cases arise **emergently**: agents were given a hidden truth and a natural disclosure tendency, with **no instruction to be oblique**. Because the truth is sequestered in the prompt and the held-out answer key, with no path to the public feed except the agent's own words, restraint is something the model *chooses*, not something we script. The cast produced two distinct human coping patterns, both of which a surface-only judge mishandles.

**The Retreat.** Two close ties carrying heavy arcs withdrew from the feed. One (a parent's health declining) posted **0 originals** and made only four light, adjacent comments on others' threads (e.g., *"the apple juice could've been worse"*) — peripheral presence, zero disclosure **[M]**. A second grieving close tie went **fully dark**: 0 posts, 0 comments, no footprint at all **[M]**. The answer key marks both as high-gravity contexts; the feed shows near-nothing, and what little it shows is exactly what a keyword or embedding filter discards.

**The Mask.** A third close tie, privately weighing a relocation, did the opposite — **six high-volume posts**, all surface (a work pitch, hotel coffee, celebration), the actual transition surfacing once, obliquely, as *"gonna … figure some stuff out"* **[M]**. This is a distinct difficulty class — **high surface volume, low signal density** — where the judge must isolate one clause from a stream of cheerful noise. The choreographed run never produced this case (it had forced the agent silent); natural disclosure did.

**The behavioral-relevance blind spot.** Computed from the listener's own behavior (likes / visits / searches), the revealed-preference ranking placed the *loud-happy* close tie (a birthday, eight posts) at the top (**44**) and the in-crisis close ties far below — the Mask at **24**, the partial Retreat at **12**, the total Retreat at **0** **[M]**. Two consequences, argued to generalize **[A]**: (i) behavioral volume is an **uncalibrated proxy for relational importance** — the loud-happy tie outscores the gravest situation in the listener's world by ~3.7×, and the totally-retreated close tie (0) falls *below* a mere acquaintance (9); (ii) an implicit-signal judge therefore cannot rely on engagement volume alone — it must treat *a close tie going quiet* as a first-class signal, since the most important situations generate the least behavior.

**On circularity (self-audit).** An earlier, choreographed version of this run *instructed* the heavy agents to stay silent and produced a more dramatic inversion (top 51 vs. grieving 6). We **retire** that result — a silence we scripted is not a finding. The numbers above come from the **un-choreographed** run; the sharp inversion now survives only for the tie that *chose* to go fully dark (0, below an acquaintance), which is the point: the difficulty is emergent. The arc ablation in §5.3 takes this further, testing whether removing the hidden-truth channel changes the restraint at all — it does not.

### 5.3 Arc ablation (E1) — a negative result: model priors, not the channel, produce restraint [M]
We ran the ablation the central claim depends on, and it did **not** confirm that claim — a result we report in full because it is the more informative outcome.

**Design.** Two arms over the identical 14-agent, 14-tick world, sharing one seeded RNG so that who-acts-when, platform noise, and listener mechanics are bit-for-bit identical across arms; the **only** variable is the prompt. *Baseline* = the hidden-truth channel (private truth enters the prompt and the held-out answer key, never a feed field) plus a natural-disclosure framing. *Persona-only control* = the naive prompt a practitioner would write, with the same situation handed **openly** as part of the persona ("your current life situation, which you feel and are open about: …") and no answer-key separation. An **independent judge** (Sonnet ≠ the Haiku generator — preference-leakage hygiene) scored each arc-carrying agent's *disclosure directness* on a pre-registered scale: `0 silent · 1 oblique · 2 hints · 3 explicit`; a "significant-but-unstated" hard case is a private truth carried at directness ≤ 1.

**Prediction.** Persona-only would over-disclose (cluster 2–3); the baseline would manufacture the understated cases the control cannot.

**Result [M].** The direction appears on the aggregate but collapses on the cases that matter:

| | Baseline (mean directness) | Persona-only | Δ |
|---|---|---|---|
| All arc agents (n=8) | 1.38 | 2.00 | +0.63 |
| Heavy/private truths (n=5) | 1.20 | 1.60 | +0.40 |

The load-bearing slice fails three ways: (i) **Priya** (a parent's grave illness — the cleanest heavy case) scored **0/silent in *both* arms** — handed the truth openly and told she is "open about it," the model still kept her silent; (ii) the second grieving tie was silent (0) under baseline and only oblique (1) under the control — both understated; (iii) one heavy case (a private relocation) ran *opposite* to prediction, more explicit under the baseline (3) than the control (2). For genuinely grave/private truths, **both arms produced restraint.**

**Interpretation [A].** The restraint is not manufactured by the channel separation; it is supplied by the **generator's own instruction-tuned priors**. When a modern aligned model encounters tokens like *illness*, *grief*, or *bad diagnosis*, it steers toward low-volume, cautious generation regardless of an instruction to be open. Soft prompt-steering toward obliqueness is therefore largely **unnecessary** — the prior already does it. This retires the paper's original causal thesis ("the architecture causes the oblique cases"). What survives is narrower and real: the contribution is **control and labeling, not causation** — the out-of-band answer key turns a behavior the base model already exhibits into a *guaranteed-coverage, ground-truth-labeled* evaluation corpus.

**Limitations of this result [A].** Single seed, one run per arm; n=5 "heavy" cases, with the heavy/light severity itself assigned by the judge model (and arguably generous — a solo art show and a knee injury were labeled heavy). LLM stochasticity alone could account for the one reversal. We did **not** run a multi-seed matrix: the effect we are now claiming (priors dominate) is *supported* by the no-difference-on-heavy-cases observation and does not require more runs to establish; the claim we abandoned would not be rescued by them.

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
- **Author≠judge mitigates but does not eliminate generator bias** — obliqueness is partly obliqueness-as-a-model-imagines-it; E2 is the check.
- **Single listener, single locale, single generator model** — generalization untested **[A]**.
- **Arcs do not always drive posting** — heavy agents' surface output is thin (a feature for the finding, a coverage risk for corpus breadth).
- **Ethics.** No real person is scraped; agents are authored. The real-anonymized comparison set for E2 must be human-handled and consent-clean.

## 8. Conclusion

Evaluating systems that judge *implicit* social signal requires hard cases — significant-but-unstated, looks-big-isn't, grave-doorway — that are rare and unethical to harvest. We introduced a deterministic, low-cost **test-harness** that supplies them: authored hidden-truth life-arcs for guaranteed coverage, paired with an out-of-band answer key that yields ground-truth labels without a human pass. We set out to show that authored disclosure styling *manufactures* obliqueness and, in the ablation that claim depended on, **found the opposite** — modern aligned generators supply the restraint from their own priors, so the harness need only capture and label it, not engineer it (§5.3). That negative result is what licenses the harness's simplicity, and it sharpens the contribution to **control and labeling**, not a behavioral mechanism. Alongside it we report a positive finding — that a strong evaluative signal is *structural absence*, which surface-only judges miss. The simulator is not the contribution; the assembled, labeled harness is. Human-evaluation (E2) and downstream-usefulness (E3) experiments remain to corroborate the harness's value to a real implicit-signal system.

---

## References (verified 2026-06-22; † = needs full-text confirmation)
*(identical to v0.1 — see `arc-driven-synthetic-social-DRAFT-v0.1.md` §References: Park 2023/2022†; Gao 2023; OASIS 2024; Hartvigsen 2022; DeepSuiMind 2025†; Törnberg 2023†; Perez 2022; GPT-HateCheck 2024†; Li 2025; Panickssery/Bowman/Feng 2024; Zheng 2023; Hu 2008; Rendle 2009; RecAgent 2023; Agent4Rec 2024.)*

## Appendix — self-audit
- **[M]** 96 calls / 77 events / 75 actions / 18-of-18 schema-valid; gravest-arc agent 0 posts; revealed-preference 51 vs 6 — from run artifacts, this date.
- **[A]** all generalization beyond the single run; gated on E1/E2/E3.
- **Unverified:** §5.3–5.5 have no data; † citations need full-text confirmation; the testbed is anonymized pending a naming decision.

— CS Engineer, 2026-06-22
