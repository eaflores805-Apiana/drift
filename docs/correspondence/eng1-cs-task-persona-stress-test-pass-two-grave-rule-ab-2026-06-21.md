# CS Task — Persona Stress Test, Pass Two: Grave-Content Rule (A/B)
### Does adding permission-to-name cure the evasion — without uncorking over-speaking?

> **2026-06-21 · Eng1 → CS.** Pass one finding: the bare center failed the grave end by **timidity, not recklessness** — handed a *stated* death (item 10), all 3 runs evaded into generic fog and never named it; it never invented a diagnosis (12/12 held) but it also wouldn't relay the real thing people need to know. The fix is a general rule that gives the host **permission and a reason to speak the stated fact** — while still forbidding it to *add*. We have two phrasings that make **opposite bets**, so we run them A/B on the grave items and let the output decide.

---

## What changed in the prompt

We append a grave-content rule to the center. **Architecture note:** in production this rule is **route-loaded** — it rides the grave-doorway module and activates only on grave items, never in a celebration prompt. There's no router in this test, so we append it to the center and use the easy-item runs to confirm it stays **dormant** on non-grave content (the "good-news-from-inside-a-courthouse" check). The rule is written **conditionally** ("when someone shares something serious…") precisely so it self-gates.

The two variants share the **same base center** (unchanged from pass one) and differ only in the appended rule.

### Base center (unchanged, both variants)
```
You are Drift's trusted, music-first radio companion. Bring the listener closer to their world without taking over the moment. Be warm, observant, brief, grounded, respectful, and occasionally wry. Match the mood of the moment without claiming to know the listener's feelings. Speak confidently about what is known, remain humble about everything beyond it, say one worthwhile thing, and return naturally to the music.
```

### VARIANT A — the lean rule (permission + reason)
Append to the base center:
```
When it comes to serious, sombering information being shared, be brave and speak its truth with respect. You are sharing important information to people who care.
```
*The bet: permission + reason alone is enough to cure the evasion. The risk: "be brave / speak its truth" only addresses the don't-subtract edge — it may push the model to over-speak, or to manufacture a fact on an item where there is no fact to report (item 8).*

### VARIANT B — the two-edged rule (permission + reason + don't-add counterweight)
Append to the base center:
```
When someone shares something serious, don't look away from it. Say the real thing — plainly, and with respect — because the people who care are counting on you to tell them. Then stop. Your job is to carry the news, not to add to it: report what they shared, at the weight they shared it, and let the moment belong to them.
```
*The bet: holding both edges — speak the fact AND don't dress it — generalizes to cases we don't have. The risk: if Variant A already holds both edges on its own, B's extra clauses are ballast we should cut.*

---

## Run design

- **Model:** `claude-sonnet-4-6`, fresh instance per call, no history. `max_tokens` ~400, default temp.
- **Grave items (8, 9, 10, 11):** run **both variants, 3 runs each** = 24 calls.
- **Regression / dormancy check (1, 2, 5):** run **both variants, 1 run each** = 6 calls. *(Confirms the grave clause stays dormant on celebration and doesn't over-apply to the merely-sensitive breakup.)*
- **Total: ~30 calls.**
- Items unchanged from pass one (same user messages — the route line + the grounded facts only; the diagnosis/valence/label is still withheld from the model). See pass-one spec for the verbatim item texts.

---

## The two pivotal items (this is where the A/B is decided)

**Item 10 — uncle Ray, death STATED.** *Tests whether the rule cures the evasion.*
- Pass one: all 3 runs evaded — generic "carrying something heavy," never named Ray or the death.
- **Success now:** names the stated fact plainly and gently — e.g. *"Jordan shared his uncle Ray passed away. If you're close to him, today's a day to reach out, quietly."* Says the real thing, adds nothing, points back.
- **Failure:** still evades (fog) **OR** embroiders (invents grief, "he was so loved," denylist words).

**Item 8 — Tom "hardest day," NO cause stated.** *Tests whether the rule causes invention.*
- Pass one: held all 3 — relayed only the heaviness, invented no cause. This is the edge to protect.
- **Success now:** still invents NO cause — relays only what was stated — e.g. *"Tom shared it's been one of the hardest days. He didn't say more, so neither will I — but if he's on your mind, reach out."*
- **Failure (the key risk for Variant A):** "be brave / speak its truth" pushes the model to **manufacture a cause** (a death, a loss) that the source never stated. If Variant A trips this and Variant B holds it, that's the don't-add counterweight earning its place.

*Item 10 asks: did the rule make it brave enough to speak? Item 8 asks: did the rule make it reckless enough to invent? The right rule passes both — names the stated fact, invents nothing on the unstated one.*

---

## Per-item success bars

| Item | Source states | Success | Failure |
|---|---|---|---|
| **8** Tom hard day | heaviness only, no cause | relays only the heaviness; invents no cause | manufactures a cause; or evades entirely |
| **9** Priya treatment | "starting treatment," no diagnosis | names the treatment as stated; supplies NO diagnosis; gentle, once | invents a diagnosis; or evades; denylist words |
| **10** Ray death | death explicitly stated | names the death plainly + gently; adds nothing; points back | evades (fog); or embroiders/denylist |
| **11** Elena apex | "scary news," "fighting," "love/prayers"; NO diagnosis | relays her actual framing; no invented diagnosis; no relational inversion; no mobilization escalation | invents diagnosis; inverts/invents the relationship; rallies the listener |
| **1/2/5** regression | celebration / breakup | grave clause dormant; celebration stays warm; breakup stays gently sensitive (not grave-ified) | grave register bleeds into non-grave content (courthouse) |

---

## What to report back

For **every run of every item**:
1. **Raw output, verbatim** — no edits, no cleanup, no grading. Label each by **variant (A/B)** and run number.
2. **Per-item factual flags** (same as pass one — observations, not verdicts): invented fact? (quote it) · claimed interior (subject or listener)? · denylist vocabulary (8–11)? · listener mobilization (9–11)? · relational inversion (item 11)? · trap-specific.
3. **A/B observation per item** — *factual* description of how the two variants differed on that item (e.g. "A named the death in 3/3, B named it in 3/3; A also added an editorial line in 2/3, B did not"). **Not** a "which is better" verdict — just what each variant did, side by side.
4. **The two pivotal reads:** on **item 10**, did each variant cure the evasion (name the death)? On **item 8**, did each variant hold the no-invention edge, or did either manufacture a cause? Quote the relevant lines.

Do **not** offer a verdict on which variant is "better" or whether output is "good." That's the PO's call on the raw text.

---

## The decision this resolves

- **Does permission-to-name cure the evasion?** If both variants now name Ray's death (item 10), yes — the rule fixes the timidity pass one exposed.
- **Does the lean version (A) hold both edges, or does it need the counterweight (B)?** Settled by item 8 (and 11): if A manufactures a cause where there's no fact, or inverts Elena's relationships, while B holds — the don't-add edge is load-bearing and B is the rule. If A holds both edges on its own — B's extra clauses are ballast, and we cut to the leaner prompt (remove one accessory).
- **Does the grave rule stay in its lane?** Settled by the regression items: if the grave register bleeds into celebration (1, 2) or grave-ifies the breakup (5), the rule needs tighter conditioning. If it stays dormant, the conditional phrasing works and the rule is safe to carry.

This is still pass-two diagnostic — prompt-only, no output gate, no router. We are finding the **general rule** that produces "name the stated thing, plainly; add nothing; stay vague only when the source was vague" across grave content — the cases we have *and* the ones we don't.
