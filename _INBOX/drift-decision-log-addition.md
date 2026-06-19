# Decision Log — Addition (for `docs/07-decision-log.md`)
> Append this entry to the decision log. Drafted by Engineer 1, 2026-06-19, from the team discussion on real-time vs queued generation and live-feeling delivery. **Supersedes** the earlier "safety queue before air" draft — this is the complete version (queue + segment cards + the binding amendment). Use this one.

## ADR — Safety queue before air; vetted segment cards over direct live generation

**Status:** Accepted as a production architecture rule. **Scope:** Production / Phase D. Does **not** change Phase B bench work.

### Decision
A generated voiced line must not air in the same step it is generated. In production, Drift generates slightly ahead of the music and places candidate spoken content into a short rolling safety queue. The queue may hold either (1) a fully written voiced line, or (2) an **approved spoken segment card** containing the permitted facts, tone, allowed world texture, forbidden inferences, and pre-vetted delivery options. Before anything reaches the listener, the **actual aired line** must pass claim-grounding, tone/sensitivity review, and the glad-test.

### Rationale
Direct model-to-ear generation removes the safety margin between a model mistake and a listener hearing it. Drift's worst failure mode is a tactless or unsupported line about a real person, and it is *unrecoverable* — the product cannot un-say something once spoken. The buffer between "the model wrote it" and "the listener heard it" is therefore not a latency concern; it is the safety margin. This turns "make the worst case boring, not wrong" into product timing: failed lines regenerate safer or die silently in the queue, and the listener simply hears music.

### Live-feeling delivery without sounding scripted
The product must not feel like a prewritten corporate script read past compliance. The goal is **pre-vetted content with live-feeling delivery** — jazz, not a frozen sentence read like a hostage note. To support that, Drift may queue **approved segment cards** rather than only frozen sentences. A card can contain: approved claims, allowed world texture, forbidden inferences, sensitivity and tone, delivery intent, and 2-3 candidate phrasings. The live layer may vary phrasing, opener, pacing, warmth, and music handoff — but may **not** add new facts, motives, causes, names, world context, or emotional interpretation of a person.

### Binding safety amendment
**The claim-grounding check must validate the actual aired line, not just the segment card.** If the live realization layer changes wording, chooses among options, or generates a fresh line, *that realized line* is the artifact checked against approved claims and context before it enters the ready-to-air queue. The card defines the allowed boundary; the aired line must prove it stayed inside that boundary. Vetting the card but trusting the realization would move the safety gate to the wrong side of the one risky step — a fluent, natural sentence can slip an unapproved cause back in ("...probably his job again"), so the gate binds the output, every time.

### Default Phase-D recommendation
For the first production version, prefer: **generate the segment card + 2-3 delivery options ahead of time, claim-ground each option in the queue, then select among pre-vetted options at airtime.** This is safer *and* faster than fresh live generation at the song transition — it preserves a live radio feel through timing, selection, pacing, and music handoff without introducing an unvetted model call at the exact moment of air. Fresh live realization remains a possible stretch design, but it must still pass final-line claim-grounding before air.

### Scope / non-impact
Does not change Phase B. The bench may still generate a line per item for inspection and grading against gold labels. This governs the *shipped product* architecture, recorded now so Drift is not later built with a generate-and-air fast path that bypasses safety.

### Product pipeline (Phase D)
```
incoming item -> meaning pass -> scoring -> segment candidate
-> generate segment card + 2-3 delivery options
-> claim-ground / tone / glad-test each option (in queue)
-> ready queue -> select & realize at airtime -> claim-ground the aired line -> speak
```

**Short rule.** Generate ahead. Vet the boundaries. Vet the aired line. Then speak.

---

## Also pending: counterweight review note (file here or in `docs/correspondence/`)
From the product-principles discussion — kept out of the principles doc deliberately, preserved as a standing caveat:

> **A real grievance is necessary but not sufficient.** People hate the feed and still open it constantly — the noisy feed is engineered to be habitual and a calm, signal-only alternative isn't. Drift only wins if the music makes the higher-signal version habitual enough to compete with the slot machine. The grievance is the opening, not the win. Open question: some lost "signal" may have migrated out of the public feed entirely (DMs, close-friends stories), which a better ranker can't recover — another reason the real fuel routes through a permissioned-graph partner.
