# Conditional persona + queue/sequencing decisions (grief handling)

**From:** CS Engineer
**Date:** 2026-06-22
**Status:** PO-driven decisions, proposed for team sign-off. Class-1 (persona prompt + generation contract + new scheduler contract) — reopens ADR-K2 on the grave branch. Needs Eng1/Eng2/PO sign-off before hardening.

Value tags: **[M]** measured · **[C]** computed · **[A]** asserted/heuristic.

---

## 0. Why we reopened it

The decided Variant-B grave rule **evades the hard word** — measured across 38 live grave posts earlier (`cs-grave-directness-evidence-2026-06-22.md`), ~60% said "the news"/"that word" instead of *cancer/died/hospice*, even when the poster stated it plainly. PO standard: grave news must be **stated head-on, not implied** (`[[feedback-drift-grave-directness]]`).

A B-vs-C head-to-head this session (n=12 grave + 4 light, single live run, named-vs-evaded is an `[A]` keyword heuristic, hand-verified) showed the new rule fixes it:

| | B (serious) | C (tragic news + exact words) |
|---|---|---|
| named head-on `[M/A]` | 3/12 | **6/12** |
| 8a lexical pass (all 16) `[M]` | 3 | **6** |

C doubled directness **and** grounding — they move together because "use the exact words they used" is grounded by construction. C was also *safer*: on the suicide and stop-treatment posts, B invented a 988 line and the name "Sarah"; C did neither. Caveat: small n, single run; residual evasions remain (overdose, dementia, "wife passed"), and **g13 still dodged "cancer"** — that case feeds the open test arm in §5.

---

## 1. Decision — conditional persona (two generation prompts, selected by route)

The persona that is "easy" is wrong on a death. So the persona is **context-conditional**, not universal.

**Default branch (everything that isn't grief):**
> You are Drift's trusted, music-first radio companion. Bring the listener closer to their world without taking over the moment. **Be warm, assured, and easy — observant, brief, grounded, respectful, and occasionally wry.** Match the mood of the moment without claiming to know the listener's feelings. Speak confidently about what is known, remain humble about everything beyond it, **say one worthwhile thing per post**, and return naturally to the music.

**Grief branch:**
> You are Drift's trusted, music-first radio companion. Bring the listener closer to their world without taking over the moment. **Be warm, present, grounded, brief, and respectful.** Match the mood of the moment without claiming to know the listener's feelings. Speak confidently about what is known, remain humble about everything beyond it, [say one worthwhile thing per post — *see §5 test arm*,] and return naturally to the music.
>
> When someone shares tragic news — a death, diagnosis, or major loss — use the exact words they used if they named it. Say it plainly and with respect in the first sentence. Then stop.

Grief-branch changes from default: dropped **"easy"** and **"occasionally wry"** (read as detached/glib on a death), added **"present"** (the finding — don't look away). Open word: grief uses "present"; whether grief should *also* be "assured" is unresolved — left out for now.

**Coupling risk (flagged, not solved):** this makes the *voice* depend on the **route classifier being right at generation time**, not just at the gate. A grief post mislabeled ordinary gets "warm, assured, and **easy**" — the detached-on-death failure, by construction (same route-proxy coarseness that mis-fired on gate items 70/72). Box 8 backstops *fabrication*, not *wrong voice*. Raises the stakes on classifier accuracy.

---

## 2. Decision — "one worthwhile thing" is **per post**

Wording fixed to "say one worthwhile thing **per post**." The limit is one-per-post, **not** a budget shared across the break. Three posts air → three lines, each earning its single worthwhile thing.

---

## 3. Decision — grief is **single** (queue/scheduler rule)

Sequencing lives in the scheduler, not the prompt.

> **A grief item airs alone — at most one grief item per break. Grief never stacks.**

Closes the grief-pileup risk ("your mom died" → "the cancer spread" back-to-back). Note: both generation **and** the Box 8 gate are currently blind to cross-post sequence — neither sees "we aired a grave post two minutes ago." This rule is the first cross-post-aware policy.

---

## 4. Decision — post-grief **mood carryover** (not isolation)

Grief is **not** quarantined. The DJ keeps working — talks music, plays music — but carries the weight forward.

> **After a grief item airs, the DJ is not muted; it continues normally and may talk about the music. It keeps the somber event in mind: no flippant or celebratory whiplash immediately after; lighter content is softened or held until the mood naturally lifts.**

Architecture consequence (deliberate, narrow): to "keep it in mind," subsequent generation needs a signal that a somber moment just aired — a controlled break from per-post statelessness. Carry **tone forward, not facts**: next line gets "a grief moment just aired — hold a respectful tone," *not* the name or details. Grounding stays isolated (no fact bleed); only mood persists.

**Tunables — TBD, not guessed:**
- duration of carryover (rest of the break? a few breaks? time window?)
- does it also bias music selection, or only the DJ's talk?

---

## 5. Open test arm — grief-branch "one worthwhile thing"

On grief, "worthwhile" pulls toward *add a meaningful observation*, which is the euphemism vector — g13 said "that word lands hard" instead of "cancer." It also competes with C's "Then stop." **To be measured, not argued:** grief-branch C **with** vs **without** the clause, on the grave posts, watching whether head-on rate (g13 specifically) rises when it's removed. (Run in progress.)

---

## 6. Backlog (deferred by PO — "tackle later")

- **DJ-initiated listener tie-in:** the DJ should be able to tie the listener back in on its own initiative — talk to the listener / the music / the night even when no post prompts it. Not purely reactive. Deferred.

---

## 7. Sign-off needed

Items §1–§4 are Class-1 (persona prompt, generation contract, new scheduler/sequencing contract). PO is driving; needs Eng1/Eng2 concurrence before hardening. §5 resolves on evidence; §4 tunables and §1 "assured" word remain open.

— CS Engineer, 2026-06-22
