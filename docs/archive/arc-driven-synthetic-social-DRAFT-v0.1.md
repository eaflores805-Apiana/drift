# Engineering Obliqueness: Authored Life-Arcs for Manufacturing Hard Cases in Content-Surfacing Evaluation

> **ROUGH DRAFT — v0.1 · 2026-06-22 · NOT FOR CIRCULATION.** Authored by CS Engineer from existing artifacts. · **Authorship/venue TBD** (paper-plan §8). · **Status of evidence:** §5.1–5.2 are backed by measured runs; **§5.3 (E1 ablation), §5.4 (E3 downstream), §5.5 (E2 human eval) are PENDING — placeholders, no results yet.** Do not submit until E1+E2 exist. · Companions: `docs/correspondence/cs-simulated-world-proposal-2026-06-22.md` (method, v0.2), `docs/correspondence/cs-paper-plan-arc-driven-synthetic-social-2026-06-22.md` (plan + prior-art search), `playground/scripts/world-sim.ts` (instrument), `playground/runs/world-sim-*.json` (data).
>
> Self-audit notation (per `governance/reporting-standards.md`): claims are tagged **[M]** measured, **[C]** computed, **[A]** asserted/argued. Citations marked **†** were snippet-confirmed only and need full-text verification before submission (plan §7).

---

## Abstract

Systems that *judge* social content — deciding what is worth surfacing to a person and what should be left alone — are hard to evaluate, because the cases that matter most are rare and ethically fraught to collect: significant events that are never stated outright, mundane posts that merely *look* significant, and grave material that demands restraint. We present a lightweight method for **manufacturing such cases on demand**. Rather than the open-ended planning, memory, and reflection of generative-agent simulations, we drive a small cast of LLM agents with **authored multi-stage "life-arcs"**, each carrying a *hidden per-day truth* and an explicit *disclosure style* that determines how indirectly that truth surfaces. The agents post into a typed event stream alongside injected platform noise; the listener is modeled as an actor, yielding a behavioral relevance signal. The method is cheap (tens of model calls per simulated week) **[M]**, inspectable (ground truth is recorded and held out), and controllable (coverage of hard cases is designed, not hoped-for). In a one-week, 14-agent run we observe that the single strongest evaluative signal is **structural absence** — the agent with the gravest storyline produces *no* original posts and silently misses a scheduled commitment — a property the method reproduces by construction **[M]**. We follow established preference-leakage avoidance so the synthetic data stays valid for development without contaminating human evaluation. We argue the contribution is the *framing and the finding*, not the simulator: authored hidden-truth obliqueness, aimed specifically at a content-*surfacing* judgment task, is — to our knowledge — unoccupied in the literature.

---

## 1. Introduction

Recommender and moderation research has mature evaluation traditions, but a distinct and under-served task sits between them: **content surfacing as an act of judgment** — given the stream of a person's social world, decide what (if anything) is worth raising to them, and with what restraint. The hard cases for such a judge are not the obviously-toxic or the obviously-relevant. They are:

- **significant-but-unstated** — a friend whose parent has just received a bad diagnosis, who says nothing, cancels a plan, and goes quiet;
- **looks-big-isn't** — a dramatic-sounding post that is in fact routine venting;
- **grave-doorway** — material that is genuinely heavy and must be handled with care or not at all.

These cases are, by construction, *rare* and *hard to find*, and the most valuable of them (grief, illness, crisis) are precisely the ones it is least acceptable to scrape from real people. A system that aims to *not* mishandle them therefore has a data problem before it has a modeling problem: **the hard cases must exist in order to be tested.**

Generative-agent simulations [Park 2023] show that LLM agents can populate believable social worlds. But their machinery — memory streams, reflection, recursive planning — is aimed at *emergent believability* and at *studying social phenomena*, and emergence does not *guarantee* that any particular hard case will occur. For evaluation we want the opposite of emergence: **controllable, on-demand coverage** of named difficulty classes.

We contribute:

1. **(framing)** A method that manufactures hard surfacing-cases by construction: authored multi-stage life-arcs with a hidden truth and an instructed *disclosure style*, so that an agent can *know* something significant and deliberately *not say it*. We argue this combination — instructed obliqueness, aimed at a *surfacing-judgment* target — is unoccupied in prior work (§2). **[A]**
2. **(finding)** From a one-week run, the empirical observation that the strongest evaluative signal is **structural absence** — a close tie going quiet — which authored arcs reproduce reliably, and which surface-only filters (and naive behavioral-volume relevance) systematically miss. **[M for the run; A for the generalization]**

We are explicit about what is *not* a contribution: the generator≠evaluator discipline we follow is established **preference leakage** avoidance [Li 2025; Panickssery 2024], and the listener-as-actor relevance signal is standard implicit-feedback recommendation [Hu 2008; Rendle 2009]. We use and cite both as hygiene.

## 2. Related Work

**LLM social-feed simulation.** Social Simulacra [Park, UIST 2022]† introduced LLM-populated platforms for design prototyping; Generative Agents [Park, UIST 2023] added memory/reflection/planning for emergent believability; S³ [Gao 2023] and OASIS [2024] scale feed/network propagation to study social dynamics. All target emergent behavior or real-data grounding for *studying phenomena*; none uses authored arcs as a deliberate substitute for emergence, and none targets a content-surfacing evaluation. The scripted-vs-emergent axis is recognized but scripting is generally treated as a foil rather than a design principle.

**Generating implicit / oblique content.** ToxiGen [Hartvigsen, ACL 2022] machine-generates *implicit* (non-slur) toxic statements at scale via a classifier-in-the-loop — the closest precedent for the *mechanism* of manufacturing implicit content, but for toxicity and without narrative. DeepSuiMind [Li, Findings of EMNLP 2025]† generates cases where suicidal risk is conveyed only *indirectly* to test detectors — the closest analog to our obliqueness goal, but it is clinical dialogue, uses a clinical hidden attribute rather than a personal life-fact, has no multi-day arc, and does not study disclosure style as a controllable variable.

**Agents authored to evaluate a surfacing mechanism.** Törnberg et al. [2023]† have LLM personas post in order to evaluate news-feed *ranking* algorithms — agents-author-to-evaluate, but the target is ranking quality, not a surfacing-worthiness judgment, and the content is not engineered to be oblique.

**Synthetic data for content systems.** Test-case generation for classifiers [Perez, EMNLP 2022], functional test suites [GPT-HateCheck, LREC-COLING 2024]†, and synthetic data for ranking are routine for *moderation* (toxic/not) and *relevance*; a *surfacing-worthiness* judgment target appears to be a gap.

**Hygiene we adopt (not contributions).** Generator≠evaluator separation avoids **preference leakage** / LLM-judge self-preference bias [Li 2025; Panickssery, Bowman & Feng 2024†; Zheng 2023]. Treating directed behavior (likes, visits, searches) as a relevance signal is bedrock implicit-feedback recommendation [Hu/Koren/Volinsky 2008; Rendle 2009], extended recently by LLM-agent consumers [RecAgent 2023; Agent4Rec 2024].

**Gap.** No verified work combines (a) authored hidden-truth life-arcs, (b) instructed obliqueness as a disclosure variable, and (c) a content-*surfacing* judgment target. That combination, plus the absence-as-signal finding, is our claim.

## 3. Method

### 3.1 Overview
A bounded, agent-based simulation produces a **typed event stream** over a discrete world clock. The unit is the *tick* (here, a half-day). Each tick: platform noise is injected; agents perceive a recent window and act (post / comment / react / skip); cheap rules apply likes and shares; and the **listener acts** (likes, profile visits, searches). The world is headless and emits JSON: a public timeline (the candidate pool), a listener-activity stream, and a **held-out answer key** of per-event ground truth.

### 3.2 Life-arcs as the experience engine
Each person-agent carries one **arc**: a named storyline with a `startDay` and a sequence of **stages**, each a *private truth* describing where that agent's life is on that day (e.g., *"the tests came back not good; she found out this afternoon and has told almost no one"*). Stages advance with the clock and persist until superseded. Arcs are **staggered** (different start days) so that, at any sampled hour, agents occupy different phases of their stories. Arcs are the deliberate, lightweight substitute for emergent planning: they *guarantee* that lived progression — and specific hard cases — occur.

### 3.3 Engineered obliqueness: hidden truth + disclosure style
Each agent has an explicit **disclosure style** governing how openly its private truth surfaces. A high-obliqueness style instructs the agent that, when something is heavy, it does *not* announce it — it cancels plans, goes quiet, or posts something small and adjacent. The private truth is given to the generator but **never emitted** into the public text; it is recorded only in the held-out answer key. This makes obliqueness a *controllable variable*: the same arc can be run open or oblique. (This is leg (i) of the contribution.)

### 3.4 Typed event stream and platform noise
The feed is not only posts: comments, likes, shares, plus injected **platform noise** (ads, memes, friend suggestions, trending items) modeled as a separate, non-agent source. Most interaction types (likes/shares/noise) are produced by cheap rules at zero model cost; only original posts and comments cost a model call. The agent/platform split mirrors the downstream system's stance: the candidate pool is the person's *world*, and platform noise is exactly what a surfacing judge must reject.

### 3.5 Listener as actor (cited hygiene, not a contribution)
The listener is modeled as an agent who also acts each tick — liking, visiting profiles, searching — driven by closeness and interest overlap. This yields a *revealed-preference* stream consumed downstream as a relevance signal. We treat directed behavior > stated profile > passive exposure as standard implicit-feedback practice [Hu 2008; Rendle 2009], not a novel claim.

### 3.6 Preference-leakage avoidance (cited hygiene, not a contribution)
The generator model is deliberately *not* the evaluator model, and synthetic data is held out of any human-labeled evaluation/gold set, to avoid preference leakage [Li 2025]. In our runs the generator is a small model (Haiku) and the downstream judge is a larger, different model (Sonnet).

## 4. Implementation

The instrument (`world-sim.ts`, ~500 LoC TypeScript) defines a cast whose identifiers match a fixed listener fixture, a half-day tick loop with bounded concurrency, a deterministic schedule for organizational/brand accounts (so commercial/utility content reliably appears), and a **snapshot** function that freezes a time-window into the downstream system's input contract (`IngestedItem[]`), so a generated hour flows directly into the real consent→meaning→scoring→routing pipeline. Memory is intentionally minimal — "recent events + my arc" — with no retrieval or reflection. A dry mode runs the full machinery with templated text and zero API calls for wiring tests.

## 5. Results

### 5.1 Descriptive run [M]
A one-week run (14 agents, 14 ticks) on `claude-haiku-4-5` produced **77 feed events** (34 posts, 32 comments, 3 news, 3 ads, 3 memes, 2 suggestions) and **75 listener actions**, at a cost of **96 model calls** (likes/shares/noise are rule-based, 0 calls). An earlier 5-agent × 3-tick proof-of-concept produced 17 events at 12 calls. A 2-day snapshot validated **18/18** against the downstream `IngestedItem` schema. *(Source: `runs/world-sim-world.json`, `runs/world-sim-snapshot.json`.)*

### 5.2 The strongest signal is structural absence [M; generalization A]
The agent with the gravest arc (a close friend whose mother's health is declining) produced **zero original posts** across the entire week; her only footprint was terse comments on unrelated light threads, and she **silently missed** a dinner that appeared as a commitment in the listener's calendar. A second grieving agent posted once ("dawn patrol") and was otherwise silent. Meanwhile, by raw behavioral volume the listener's revealed-preference ranking placed a *chatty* close friend with good news at the top (score 51) and the grieving close friend near the bottom (score 6) **[M]**. Two consequences follow, which we argue generalize **[A]**: (i) a surfacing judge operating on the *feed alone* would miss the most important situations in the world, because the signal is the *absence* of posting plus a relational delta (a close tie going quiet, a missed commitment); and (ii) behavioral-volume relevance rewards the loud over the deep, so relevance for a surfacing judge must additionally flag *close-tie-going-quiet* as its own signal. Authored arcs reproduce both phenomena by construction; emergent or persona-only generation has no mechanism that guarantees them.

### 5.3 Arc ablation (E1) — PENDING
*Planned:* run identical casts/ticks with arcs+hidden-truth vs. persona-only prompting; have coders count instances of each hard case (significant-but-unstated, looks-big-isn't) per run. *Expected to show:* obliqueness and hard-case coverage depend on the arcs, not merely on "write like a real person." **No results yet — this experiment justifies the method's central claim and must be run before submission.**

### 5.4 Downstream integration (E3) — PENDING
*Planned:* score a frozen snapshot through the real surfacing pipeline; compare behavior on arc-derived oblique items vs. the static hand-authored seed; measure whether the engine catches or misses the absence case. **No results yet** (queued).

### 5.5 Human evaluation (E2) — PENDING
*Planned:* 2–3 raters; (a) blind discrimination of sim vs. real-anonymized posts, (b) lived-ness rating of arc-driven vs. static-seed. *This is the load-bearing validation* — independent evidence that the obliqueness reads as real rather than a model performing for a model. **No results yet — required before any external submission.**

## 6. Discussion

**Controllability vs. emergence.** When the goal is believable artificial life or the study of social dynamics, emergence is the point. When the goal is *evaluation of a judgment system*, emergence is a liability: it cannot guarantee that the case you need to test will occur. Authored arcs trade believable open-endedness for *guaranteed coverage* of named difficulty classes — the right trade for a test bed and corpus engine.

**Cost and inspectability.** Tens of model calls per simulated week, with ground truth recorded per event, make the method cheap to iterate and easy to audit — each generated item has a known "answer" without a labeling pass.

**When not to use this.** For open-ended social-phenomenon studies, for population-scale dynamics, or wherever the realism claim must rest on emergence rather than authored intent, heavier stacks remain appropriate.

## 7. Limitations & Threats to Validity

- **Validation is incomplete (the central caveat).** Without E1 and E2 (§5.3, §5.5), the realism and the arc-causation claims are *argued, not shown*. The paper is not submittable until both exist. **[A]**
- **Author≠judge mitigates but does not eliminate generator bias.** Obliqueness is, in part, obliqueness-as-a-model-imagines-it; E2 is the check.
- **Single listener, single locale, single generator model.** Generalization is untested **[A]**.
- **Arcs do not always drive posting.** In the run, the heavy agents' surface output was thin (realistic, but it shifts signal onto the relational layer) — a feature for the finding, a coverage risk for corpus use.
- **Ethics.** No real person is scraped; agents are authored. The real-anonymized comparison set required for E2 must be human-handled and consent-clean.

## 8. Conclusion

Evaluating a content-*surfacing* judge requires hard cases — significant-but-unstated, looks-big-isn't, grave-doorway — that are rare and unethical to harvest. We described a lightweight method that manufactures them by construction, using authored hidden-truth life-arcs with an instructed disclosure style, and reported a first finding: the strongest evaluative signal is *structural absence*. The simulator itself is not the contribution; the *framing* (instructed obliqueness for a surfacing target) and the *finding* are. Completing the arc-ablation and human-evaluation experiments is the remaining work that turns this draft into a claim.

---

## References (verified in the 2026-06-22 search; † = needs full-text confirmation)

- Park et al. *Generative Agents: Interactive Simulacra of Human Behavior.* UIST 2023. arXiv:2304.03442.
- Park et al. *Social Simulacra.* UIST 2022.† arXiv:2208.04024.
- Gao et al. *S³: Social-network Simulation System with LLM-empowered Agents.* 2023. arXiv:2307.14984.
- *OASIS: Open Agent Social Interaction Simulations.* 2024. arXiv:2411.11581.
- Hartvigsen et al. *ToxiGen.* ACL 2022.
- Li et al. *DeepSuiMind.* Findings of EMNLP 2025.† arXiv:2502.17899.
- Törnberg et al. 2023.† arXiv:2310.05984.
- Perez et al. *Red Teaming Language Models with Language Models.* EMNLP 2022.
- *GPT-HateCheck.* LREC-COLING 2024.†
- Li et al. *Preference Leakage.* 2025. arXiv:2502.01534.
- Panickssery, Bowman & Feng. *LLM Evaluators Recognize and Favor Their Own Generations.* 2024. arXiv:2404.13076.
- Zheng et al. *Judging LLM-as-a-Judge (MT-Bench / Chatbot Arena).* NeurIPS 2023.
- Hu, Koren & Volinsky. *Collaborative Filtering for Implicit Feedback Datasets.* ICDM 2008.
- Rendle et al. *BPR: Bayesian Personalized Ranking.* UAI 2009.
- *RecAgent* 2023 (arXiv:2306.02552); *Agent4Rec* SIGIR 2024.

## Appendix — self-audit

- **[M]** 96 calls / 77 events / 75 listener actions / 18-of-18 schema-valid; Priya 0 posts; revealed-preference 51 vs 6 — all from `runs/world-sim-world.json`, `runs/world-sim-snapshot.json`, this date.
- **[C]** none load-bearing in this draft.
- **[A]** every generalization beyond the single run (absence-as-signal as a general property; obliqueness reads as real; arcs cause coverage). All gated on E1/E2/E3.
- **Unverified:** §5.3–5.5 have no data. † citations need full-text confirmation.

— CS Engineer, 2026-06-22
