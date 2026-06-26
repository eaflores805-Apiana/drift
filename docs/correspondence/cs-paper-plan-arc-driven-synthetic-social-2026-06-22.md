# Paper Plan — Authored Life-Arcs for Controllable Synthetic Social Corpora

> **STATUS: PLAN — not a decision to publish.** · **v0.1 · 2026-06-22** · Authored by CS Engineer at PO's request. · **Decision class:** Class 2 (a deliverable + a claim made on the team's behalf — needs PO ratification of venue/ambition and the validation plan before any external submission). · **Companion artifacts:** `docs/correspondence/cs-simulated-world-proposal-2026-06-22.md` (the method, v0.2), `playground/scripts/world-sim.ts` (the instrument), `playground/scripts/world-sim-prototype.ts` (the first proof-of-concept), `playground/runs/world-sim-*.json` (data).
>
> This is the spec for the paper *and* the spec for the experiments that would make it real. It deliberately under-claims novelty (§3) and names the one experiment that separates "publishable" from "internal memo" (§5, E2).

---

## 1. The honest one-line contribution

> A method to **guarantee, by construction, the existence of hard-to-detect signal classes** (grave-doorway, significant-but-unsaid, looks-big-isn't, oblique personal texture) in synthetic social-feed data for **filter / judgment evaluation** — cheaper than full Generative-Agents emergence, inspectable (hidden ground truth), and bounded by a contamination discipline that keeps it valid for development and tuning without contaminating the human eval set.

This is a *right-tool-for-a-job* paper, **not** a new-simulation-paradigm paper. See §3.

---

## 2. Why it's worth writing (the real reasons, ranked)

1. **An empirical finding hand-authored data cannot produce.** The comprehensive run surfaced that the **heaviest signal in the world was structural absence**: the agent with the gravest arc posted *zero* original posts and no-showed a calendar event, and by raw behavioral engagement ranked *below* a chatty friend with good news. The hardest case for a social-feed filter is **a close tie going quiet** — and authored arcs reproduce it by construction. *(measured, §6.)*
2. **A controllability claim with teeth:** coverage of hard cases is *designed*, not hoped-for. You can't reliably get a "significant-but-unsaid" instance by prompting "act like a real person"; you get it by giving an agent a hidden truth + a non-disclosing style.
3. **A concrete downstream tie:** the data flows into a real judgment system (Drift's Layer 0 → scoring/routing/relevance), so "realism" is grounded in *does the engine behave differently on it*, not vibes.

> **NOT a contribution (corrected after the 2026-06-22 prior-art search):** what we internally called the "contamination wall" (generator ≠ evaluator; synthetic out of the gold set) is **established, named prior art — "preference leakage"** (Li et al. 2025) / LLM-judge self-preference bias (Panickssery, Bowman & Feng 2024; Zheng et al. 2023). We *practice and cite* it as hygiene; we do **not** claim it. Likewise the **listener-as-actor / revealed-preference** stream is **bedrock recommender systems** (implicit feedback: Hu/Koren/Volinsky 2008; Rendle BPR 2009) — engineering, not a contribution. Lead with neither.

---

## 3. Honest novelty assessment (grounded in a verified prior-art search, 2026-06-22)

**The broad category is well-established — do not claim it.** "LLM agents on a simulated social feed" spans many groups: Generative Agents (Park et al., **UIST 2023**, arXiv:2304.03442 — the emergent-planning baseline we differentiate from); Social Simulacra (Park et al., **UIST 2022**, arXiv:2208.04024); S³ (Gao et al., 2023, arXiv:2307.14984); OASIS (2024, arXiv:2411.11581, the large-scale-feed reference). All use emergent planning or real-data grounding to *study social phenomena* — none uses authored arcs as a deliberate substitute for emergence, and none targets a content-filter evaluation.

**No direct match for our specific combination** (authored hidden-truth arcs → engineered obliqueness → surfacing-judgment filter eval). Closest partials, none combining all pieces:
- **DeepSuiMind** (Li et al., Findings of EMNLP 2025, arXiv:2502.17899) — generates cases where suicidal risk is conveyed *only indirectly*, to test detectors. Closest analog to obliqueness — but clinical dialogue, clinical hidden attribute, no multi-day arc, no disclosure-style knob.
- **ToxiGen** (Hartvigsen et al., ACL 2022) — machine-generates *implicit* toxic content at scale (the mechanism), but toxicity, no narrative.
- **Törnberg et al. 2023** (arXiv:2310.05984) — LLM personas post to evaluate news-feed *ranking*; agents-author-to-evaluate, but not oblique and not a surfacing-judgment classifier.

**Per-idea status (what to claim vs. cite):**

| Idea | Status | Anchor prior art |
|---|---|---|
| 1. Authored multi-stage life arcs as a *deliberate substitute* for emergent planning | **Under-explored / white space** (scripted-vs-emergent is recognized as an axis but scripting is treated as a foil, not embraced) | Generative Agents (foil) |
| 2. Engineered obliqueness via hidden truth + instructed disclosure style | **Most novel piece** — no verified work treats instructed obliqueness as a controllable generation variable | DeepSuiMind (adjacent), ToxiGen (mechanism) |
| 3. Purpose = synthetic hard cases for a *surfacing / content-judgment* filter | **Novel in the target** (synthetic data for moderation/ranking is routine; surfacing-worthiness is a gap) | GPT-HateCheck (LREC-COLING 2024); Perez et al. EMNLP 2022 |
| 4. Generator ≠ evaluator discipline (our "contamination wall") | **Established, NOT novel — cite, don't claim** | "Preference leakage" Li et al. 2025 (arXiv:2502.01534); Panickssery/Bowman/Feng 2024 (arXiv:2404.13076); Zheng et al. NeurIPS 2023 |
| 5. Listener-as-actor / revealed-preference relevance stream | **Bedrock recsys — cite, don't claim** | Hu/Koren/Volinsky ICDM 2008; Rendle BPR 2009; RecAgent 2023; Agent4Rec SIGIR 2024 |

**The defensible contribution is two-legged:** (ii) **the application/framing** — authored hidden-truth oblique arcs aimed at a *surfacing/content-judgment* filter (ideas #1+#2+#3 in combination, currently unpublished) — and (iii) **the empirical "absence-as-signal" finding**. **Not (i) the method as a whole**, and explicitly not ideas #4/#5. If a reviewer's "what's new?" can't be answered by legs (ii) and (iii), the paper isn't ready. Frame to those two and no wider.

**Scoop risk: moderate and rising** (~12-month window) — both adjacent frontiers (implicit synthetic-data generation; agent social-feed eval) are active. The narrow *surfacing-judgment + instructed-obliqueness* framing is the moat; lead with it.

---

## 4. Draft abstract (~160 words, to be revised after E1/E2)

> Evaluating systems that *judge* social content — what to surface, what to leave alone — requires test data containing rare, hard cases: significant events that are never stated outright, mundane posts that look significant, and grave material that demands restraint. Such cases are, by definition, hard to find and ethically fraught to scrape. We present a lightweight method for manufacturing them: small casts of LLM agents driven not by open-ended planning and reflection, but by **authored multi-stage life-arcs** with a hidden per-day truth and an explicit disclosure style, embedded in a typed event stream with platform-noise injection and a listener modeled as an actor (yielding revealed-preference signal). The method is cheap (tens of model calls per simulated week), inspectable (ground truth is recorded and walled off), and controllable (hard-case coverage is designed). On a one-week run we find the strongest evaluative signal is *structural absence* — a close tie going quiet — which the method reproduces by construction. We follow established preference-leakage avoidance (generator ≠ evaluator; synthetic kept out of the human-labeled set) so the data stays valid for development. *(measured numbers pending E1/E2.)*

---

## 5. Experiment plan (what turns the report into a paper)

| ID | Experiment | What it measures | Status | Load-bearing? |
|----|-----------|------------------|--------|---------------|
| **E1** | **Arc ablation** — arcs+hidden-truth vs. persona-only prompting, same casts/ticks | Does obliqueness + hard-case *coverage* come from the arcs? (count of significant-but-unsaid / looks-big-isn't instances per run; coder-labeled) | TODO | **Yes** — justifies the method's central claim |
| **E2** | **Human discrimination + lived-ness** — 2–3 raters; (a) sim vs. real-anonymized blind discrimination, (b) arc-driven vs. static-seed lived-ness rating | Independent evidence the obliqueness is real, not the model performing for the model | TODO | **Yes** — the contamination-wall answer; separates publishable from memo |
| **E3** | **Downstream integration (the "hour test")** — run a frozen snapshot through Drift's consent→meaning→scoring→routing | Does the engine behave *differently* on arc-derived oblique items vs. the static seed? Does it catch / miss the absence case? | QUEUED (next) | Strengthens; not sufficient alone |
| E4 | Scale/cost curve — calls vs. agents vs. ticks; signal density per hour | Cost characterization + the "thin-hour" property | partial (have 2 datapoints) | No — supporting |

**Note on E2 ethics/E3 wall:** E2's real-anonymized comparison set is human-handled, E3-clean per decision **E3** (no scraping real people). E3-the-experiment uses the Sonnet judge while generation was on Haiku — author ≠ judge, the wall holds.

---

## 6. Citable measured numbers (self-audited per `governance/reporting-standards.md`)

- *measured:* prototype run — **12 model calls → 17 typed events**, 5 agents × 3 ticks (`runs/world-sim-prototype-output.json`).
- *measured:* comprehensive run — **96 model calls → 77 feed events + 75 listener actions**, 14 agents × 14 ticks (7 days), model `claude-haiku-4-5` (`runs/world-sim-world.json`).
- *measured:* event-type mix — 34 post / 32 comment / 3 news / 3 ad / 3 meme / 2 suggestion.
- *measured:* **gravest-arc agent (Priya) produced 0 original posts** across the week; only terse comments; no-showed the Jun-19 calendar event. *(the absence-as-signal datapoint.)*
- *measured:* by raw revealed-preference, the grieving close tie (Mateo) scored 6 vs. the chatty close tie (Mark) 51 — *behavioral volume rewards the loud, not the deep.*
- *measured:* snapshot fixture validated **18/18 against `IngestedItemSchema`** — flows into the real pipeline.
- *asserted (NOT yet measured — the paper's central unproven claims):* (a) arcs cause the obliqueness/coverage (→ E1); (b) the obliqueness reads as real to humans (→ E2). The paper is **not submittable** until E1 and E2 exist.
- *unverified:* generalization beyond one listener / one locale / one generator model.

---

## 7. Structure (6–8 pages + appendix)

1. Introduction — the "hard cases must *exist* to be tested" problem for judgment systems.
2. Related work — social-feed agent sims (Generative Agents, Social Simulacra, S³, OASIS); implicit-content generation (DeepSuiMind, ToxiGen); agents-author-to-evaluate (Törnberg 2023); synthetic data for moderation/ranking (GPT-HateCheck, Perez 2022); preference leakage / LLM-judge bias (Li 2025; Panickssery/Bowman/Feng 2024); implicit-feedback recsys (Hu/Koren/Volinsky 2008; Rendle 2009). (§3 keeps us honest about the gap.)
3. Method — arcs as experience engine; hidden-truth + disclosure style (the contribution); typed event stream; platform-noise injection; listener-as-actor (cited as recsys hygiene); preference-leakage avoidance (cited, not claimed).
4. Implementation + results — the instrument; E1 ablation; the absence-as-signal finding; quantitative mix; the Priya/Mateo qualitative cases.
5. Downstream integration — E3, how events feed scoring/routing/relevance.
6. Human evaluation — E2.
7. Discussion — controllability vs. emergence; cost; when to use this vs. heavier stacks; limitations & threats to validity.
8. Conclusion + future — scaling, real-anonymized seeding, listener behavior as a relevance signal.

> **Verify-before-cite:** a few details from the search were snippet-confirmed only — Social Simulacra is **UIST 2022** (not CHI); the self-preference authors are **Panickssery, Bowman & Feng** (arXiv:2404.13076); DeepSuiMind's exact construction and some 2025 author lists need full-text confirmation before they enter a related-work section.

§§1–3 are ~80% present in the v0.2 proposal and can be lifted.

---

## 8. Decisions needed from PO before drafting past the outline

1. **Ambition / venue:** internal tech report (write now) → workshop/conference after E1+E2? Recommend that ladder. Verified venue fit: **CSCW / CHI** (social-computing system + design), **ICWSM** (computational social media + eval dataset), or **ACL/EMNLP/NAACL** if we foreground the implicit-content benchmark + absence-as-signal finding. A **resource/benchmark track** is the most natural home given the "manufacture hard cases" purpose. Scoop window ≈12 months (§3) argues against sitting on it indefinitely.
2. **Who runs E2 human eval** (raters, even 2–3) and supplies/approves the real-anonymized comparison set — this is the gating dependency and a PO call (touches E3 ethics).
3. **Lineage/home:** this is a *Drift* paper, distinct from the LLM-Mechanics metrology lineage — confirm it lives in/near the Drift repo, not that operation.
4. **Authorship/credit** for a 4-person team.

---

## 9. Recommended immediate next step

Run **E3 (the hour test)** now — it was already queued, and it is a paper result. In parallel, I can draft §§1–4 from existing material. **Hold external anything** until E1+E2 exist and PO ratifies §8.

— CS Engineer, 2026-06-22
