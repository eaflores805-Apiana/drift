# Drift — Parked Note: Keeping the DJ Voice from Drifting
> **v0.1.0** · 2026-06-19 · **STATUS: PARKED / FUTURE-WORK.** This is captured thinking, not an active build item. It belongs to the **Phase 5 (tune to exceptional)** window of the build map — you cannot protect a voice that doesn't generate yet. Do **not** build any of this now; it's recorded so that when the generation layer exists and tuning begins, the team picks it up fully formed instead of re-deriving it under pressure. One element (capturing the baseline) has an early hook, flagged below.

## The problem, stated honestly
"Voice drift" is the slow failure: the DJ is great in the demo, fine across ten segments, and somewhere around segment two hundred has quietly become a *different host* — blander, inconsistent, subtly corporate — with no single output wrong enough to catch. It is dangerous specifically because of **how it shows up**:
- **It's invisible early** — at segment ten there's nothing to see, because drift *accumulates*; it isn't present-and-hidden, it hasn't happened yet.
- **It surfaces as a *trend*, not a bad segment** — segment 200 is fine, 201 is fine; the drift lives only in the slope across hundreds, which no single output reveals. You can't catch a trend by looking at one cup.
- **The early-surfacing kind appears where you're not looking** — a non-voice change (scoring, grounding, a new route) perturbs the voice as a side effect, the instant after the change; but you're looking at the thing you changed, not the host.
- **Worst case, the listener notices before you do** — they don't file a bug, they just stop feeling the DJ is special and drift away. Drift surfacing as churn is the most expensive way to find it.

Because the dangerous drift is late/gradual or early/misplaced, **you cannot rely on noticing it.** It has to be engineered as a managed property — the same lesson as safety and grounding: *necessary but insufficient to "just write a good prompt."*

## The solution shape: three layers (prevent → absorb → catch)
The best defense isn't one mechanism. It's three, and they cover each other's blind spots.

### Layer 1 — PREVENT: scheduled re-anchoring (the Starbucks hold-time model)
*Reference: before on-demand brewing, coffee shops set a fixed hold time and re-brewed on a schedule — they didn't taste each pot to decide; they assumed degradation on a known clock and refreshed before anyone could detect it.*
- **Re-anchor the generation to the canonical persona examples on a fixed cadence** — every N segments / per session — *whether or not drift has been detected.* Dump the pot, rebrew. This denies drift the runway to accumulate, and crucially has **no detection dependency**: it resets even the drift you'd never have caught.
- **Open question to test:** does re-anchoring reliably return the voice to baseline (like a fresh pot is identical), or does the "fresh brew" land slightly different each time? If it returns cleanly, this layer nearly solves drift alone. If not, it *reduces* drift and Layer 3 catches the residual.
- **The cadence is empirical, not guessable** — Starbucks *found* their hold-time; ours is learned by watching how fast drift actually accumulates once generating (see Layer 3).

### Layer 2 — ABSORB: corks (make slight variation not *show*)
Some structures are forgiving of voice variation — they absorb drift before it reaches the listener's ear as inconsistency. Build the DJ out of these and slight drift in the generated parts doesn't register as the host changing. Several Drift already has for free:
- **Fixed signature elements** — catchphrases, sign-ons/offs, recurring transitions, the verbal furniture. *Scripted, not generated*, so constant. The listener's sense of "who this host is" rides on the fixed posts; the generated middle can vary between them without the identity feeling shifted. (Same move as the bridge library / segment skeleton: the more that's fixed-or-selected vs. generated, the less surface drift has to show on.)
- **Structure/rhythm held constant while words vary** — identity lives more in *cadence* (short-short-long, the self-implicating turn, the land-and-handoff) than in vocabulary. Hold the structure fixed and the words can vary freely — which is exactly what you want: word-variation keeps it un-rehearsed, structure-consistency keeps it *them*.
- **The short-sparse format's natural masking** — the DJ talks in short bursts between songs, and short exposure hides variation long exposure would reveal. Drift's own format (music-first, sparse, brief moments) is already a cork, for free.
- **Attitude over tics** — define the persona as a consistent *stance* (warm, never mean, roots for people, points you back to your life), not a checklist of stylistic tics. A broad stance is hit many ways and stays recognizable across wide variation; brittle tics are either present or off.

### Layer 3 — CATCH: measurement (see the drift that prevents/absorbs miss)
- **Define the voice by *observable signatures*, not adjectives** — "warm" is unmeasurable and so undetectable; *sentence rhythm, the self-implication move, direct address, the absence of corporate/hype/clinical registers* can be checked for. Vague is unenforceable; specific is gradeable.
- **A voice-consistency grading axis** — every generated segment scored *does this sound like the persona?* against the signatures. Drift becomes a *number you watch trend down*, caught before it's a *feeling*.
- **A regression suite that fires on EVERY change** *(the load-bearing mechanism)* — a fixed set of items regenerated and voice-checked after *any* change (scoring, grounding, a new route — not just voice work), because drift mostly enters through *adjacent* work perturbing the voice, not through voice work itself.
- **A periodic human "golden ear"** — metrics catch *gross* drift (went corporate, lost the rhythm); whether it's still *exceptional* resists scoring. A human listens to a sample and feels whether the host is still alive and still *them*. Metrics = continuous smoke detector; golden ear = inspection for the subtle erosion below the metric's resolution.

## Two cautions to carry into the window
1. **Capture the baseline from segment one** *(the one early hook).* You can only detect "the voice changed" if you recorded what it *was* from the start. If you wait until you *notice* drift to start measuring, the baseline is gone and you can never prove the voice held — only suspect it didn't. So the consistency harness is instrumented with the **first generated segment (Phase 2)**, not bolted on at tuning. This is the single piece of this note with an early dependency.
2. **Don't let the corks blind the instruments.** Corks hide drift from the *listener* — which is the goal for the *product* — but that same masking hides drift from *you*. Resolution: **cork the product, but measure the *uncorked* generated output in the eval harness**, so the thing that keeps the listener happy doesn't also keep the team from seeing drift it needs to fix. Otherwise you build a system that *feels* consistent while degrading — worse than one that visibly degrades.

## When to pick this up
Gated on the generation layer existing (Phase 2+), and primarily a Phase 5 concern. The early hook is the baseline-from-segment-one (instrument the consistency harness when the first segment generates). Everything else waits until there's a voice to protect — but when that window opens, this is the plan.
