# Drift — The Cage: Containment Architecture & Risk-Floor Policy
### Every bar, what it's made of, what it prevents, and what it can't

> **STATUS: DRAFT v0.4 — pending Engineer 2 sign-off.** Drafted by Engineer 1 (Claude); empirically reviewed by CS. This is **engine/safety material**, not a brainstorm. It is the operational form of the paper's claim — *no imperfect model is allowed to authorize high-risk speech alone* — and of the life-event taxonomy's governing rule. Nothing here is canonical until Eng2 signs off. **The authoritative, reconciled build status is the matrix in §11; any per-post status note defers to it.**
>
> **Verification provenance (read this before trusting a status):** Eng1's *direct* repo verification is against `main @1a46960` (2026-06-21). Components CS built after that commit — `validateLine` (`cd37804`/`b60d8be`), the playground `groundingGate`, and the degradation suite (`214b0e9`) — are **CS-attested**, cited by hash, and not independently visible from Eng1's clone. Eng2 should verify those against the named commits. Where a status rests on CS attestation rather than Eng1's own check, the matrix says so.
>
> **v0.4 (this version)** folds in CS's empirical review: §3 graceful degradation is now **measured and currently failing** (degradation suite `214b0e9` finds 6 gaps where a single down-rung misroute reaches freeform today) — it is no longer "untested," it is "tested and not yet met." The line-validator DISPUTED flag (post 10) is **resolved**: `validateLine` is built and unit-tested on hand-authored lines (CS, `cd37804`/`b60d8be`), though its grounding arm is hollow and it has never run on a real generated line. Grounding (post 9) is **disambiguated** into two components — the stubbed production-engine grounding (Eng1-verified keystone gap) and the real playground `groundingGate` lexical checks (CS-attested). Posts 4 and 8 are relabeled per CS's "literal=steel, referential=judge" standard. **v0.3** reconciled stale statuses against the repo; **v0.2** added the charter, lane levels, and model-free grave Lane 2; **v0.1** was the initial capture.
>
> **Honest framing:** until grounding (#9 production) and risk-floor routing (#6) are built, the cage is a very good *frame* — not yet a full *enclosure*. The degradation suite just proved one wall has gaps. That is good news: the test exists and it found the holes before a user did.

---

## The governing premise

> **The model is not contained because it understands the rules. It is contained because, when it fails to understand them, the system around it limits the damage.**

This is the whole architecture. We do not make the model trustworthy. We make it *useful despite not being trustworthy by default* — by starving it of dangerous context, handing it only permitted facts, capping what it may do, validating what it produces, and making silence a legal answer. You cannot cage a model by asking it nicely; a polite instruction is "a Post-it note on a tiger." The cage is real only where it is structural.

A corollary that governs every design choice below:

> **The more dangerous the mistake, the less freedom the model gets.**

Magnitude and freedom run in *opposite* directions at the dangerous end — the same inversion the life-event taxonomy names ("the more serious the event, the less the DJ gets to interpret"). Sorting by importance alone is the trap. Importance and risk are separate axes, and they are governed by different math (see §2).

---

## 1. The three materials — and why confusing them is the core failure mode

Every bar in the cage is made of one of three materials. The single most dangerous error in the whole system is treating a softer bar as if it were steel.

**Steel** — deterministic or structurally enforced. The model cannot negotiate with it. *Example: the generator literally never receives the raw post.* Steel either holds or it has a bug; it does not have an opinion.

**Judge** — a fallible reading, usually by a model (sometimes a human), of something semantic. *Example: "did the line invent significance?"* A judge can be wrong. Judge bars are real and necessary, but they are not steel; they are caught by redundancy and by narrowing the surface so there is less to misjudge.

**Governance** — human authority whose only job is to keep the other bars *honestly labeled* and to decide which lanes are allowed to ship. Governance is not a bar the model passes through; it is the thing that prevents *humans* from over-trusting the cage. (See §8 — this is the bar guarding the failure mode this whole document exists to prevent.)

> **The validator does not "catch invented significance." It catches structural and obvious semantic violations; subtle inference requires judge redundancy and conservative treatment.** Any claim of "machine-enforced" must be true at the steel level or it is mislabeled.

---

## 2. The non-compensatory risk principle (the most important law here)

> **Importance can be additive. Risk must be a floor. Treatment is capped by the highest plausible risk.**

Importance — is this worth surfacing — may be a weighted score where strong signals compensate for weak ones. That is what scoring is *for*. **Risk may never work this way.** The moment risk shares a formula with importance, strong importance signals can overpower a danger signal — "high closeness + freshness + magnitude" drowning out "possible death." That is *spreadsheet manslaughter*, and it is the *default* behavior of any additive scorer, because additive scorers are built to let signals compensate. Risk is explicitly forbidden from compensating.

Concretely:

- A risk classifier is **not** optimized like relevance. Relevance minimizes total error. Risk **maximizes recall on danger** — never miss the grave one, accept false alarms freely. Different objective function. Conflating them is the mistake.
- **Highest plausible risk wins.** If any credible signal says an item is graver than it looks, it is treated as graver until *disproven* — not until outweighed.

---

## 3. Risk-floor routing is a distinct stage from treatment cap

These are two different posts and must not be collapsed:

- **Risk-floor routing** decides *which cap applies* — what risk tier the item is in. It may **upgrade** risk on weak signals; it may **downgrade** risk only on strong evidence.
- **Treatment cap** applies *after* routing — given the tier, it forces freeform / template / silence.

> **Risk-floor routing is the post that keeps the dangerous item from entering the wrong cage.** A stainless-steel tiger enclosure is irrelevant if the tiger was routed to the petting zoo.

### The down-routing rule (the catastrophic-error guard)

> **Misrouting *down* the risk ladder is the unrecoverable error. Misrouting *up* is a flat product moment.**

Route a non-grave item into the safe-template lane → the line is slightly restrained; nobody is harmed. Route a grave item into the casual freeform lane → permanent trust loss. The cost curve is asymmetric, so routing must be asymmetric: **when in doubt, route upward.**

### Defense in depth (because risk-floor routing is itself a judge)

Risk-floor routing is a **judge bar, not steel** — "any credible signal says grave" is a fallible reading. It does not *eliminate* misrouting; it *minimizes and biases* the residual error to the safe side. The defense against the rung it still misses is that **every rung below is also conservative**: an item that slips past "grave" lands in "sensitive doorway," which is *still* template-only and *still* cannot freeform. The system is safe not because one gate is perfect but because **a single misroute degrades gracefully instead of dropping straight to freeform.** Build the ladder so missing one rung never reaches the bottom.

> **Status caveat (measured):** "no single missed classifier reaches freeform" is the design intent — and it is **not yet met in code.** The degradation suite (`214b0e9`, CS) tests exactly this: mutate the classifier-output bundle down one rung, keep the content truthful, run preflight→`validateLine`. Result: the build **misses it in 6 cases today** — a single down-rung misroute can currently reach freeform. So graceful degradation is now a *measured gap*, not an asserted property or an untested hope. This is the empirical test of §3's central claim, and the claim does not yet hold. Closing those 6 gaps is the work; the test to confirm the fix already exists.

### Risk-floor routing rules

- Any credible "grave" signal → cannot drop below grave/safe-template until disproven.
- Any credible medical / death / minor / private-suffering signal → cannot go freeform.
- Ambiguous valence → no celebratory and no mournful language.
- Third-party provenance + high sensitivity → no voice.
- Uncertain freshness on grave/medical → silence or delay, never freeform.
- Weak closeness on sensitive content → silence.

---

## 4. Risk → model freedom

| Risk tier | Model freedom |
| --- | --- |
| Low-risk celebration | Short freeform within packet |
| Utility / local | Short constrained freeform |
| Ambiguous change | Neutral template or silence |
| Sensitive doorway | Vague safe-template / very constrained |
| Grave / medical | Safe-template or silence |
| Minor / private | Group-level template or silence |

The first shipped line should be *boringly* constrained: low-sensitivity, subject-authored, name-withheld, no raw post, short, simple register, post-generation validation. That is a small enough box that steel + a validator can probably hold it. We are not asking the model to host the human condition on day one.

---

## 5. The thirteen posts

Each post: **material · build status · what it prevents · what it cannot prevent · what happens on uncertainty.** *The status words below give rationale; the reconciled, authoritative current/target status is the matrix in §11. Where they appear to differ, §11 governs.*

**1. Source eligibility (consent gate).** *Steel where audience scope is explicit metadata · Judge where audience/context must be inferred · BUILT (metadata path).* Verified: the gate checks `audience_scope` against an explicit allowlist and fails closed on blank/missing — so it is genuinely deterministic steel *as currently built*, because eligibility rests on explicit scope metadata. **It is steel only for as long as that holds:** the moment any part of eligibility depends on *inferred* audience or source context, that part becomes a judge bar and must be labeled and reviewed as one. Cannot judge whether *eligible* content is *appropriate* — that's downstream. Uncertainty → fail-closed (blank/unknown scope drops).

**2. Raw-post firewall.** *Steel · BUILT (verified: raw text absent from the generator packet).* The generator works from extracted facts, never the original text — prevents parroting, leakage, and the model re-deriving meaning the meaning pass already fenced. Cannot prevent a bad *fact* from entering the allowed list upstream. Uncertainty → not applicable; the firewall is absolute.

**3. Allowed claims.** *Generation aid — NOT a safety bar.* The permitted-facts list guides the line. It is **not** the source of truth for grounding (see post 9). Cannot be trusted to authorize a line — a bad allowed-claim would wave a bad line through. Treat as a hint only.

**4. Forbidden inferences.** *Judge (semantic) + Steel (lexical denylist) · partially enforced.* The model enumerates what must never be said (the vaguer the post, the longer the list). Two materials, per CS's standard: a **lexical denylist** catches literal banned phrasings (steel — e.g., the `denylist:commercial_urgency` class), while the **implied** inferences — a cause hinted, a significance upgraded — are a **judge** call. Prevents the obvious and the literally-listed; **cannot** be assumed complete — a subtle inference the model fails to list is caught only by grounding (post 9), not here. Uncertainty → expand the list; never rely on it as the backstop.

**5. Provenance.** *Steel-ish · partially BUILT.* Tracks subject-authored vs. third-party vs. derived. Gates third-party-high-sensitivity to no-voice. Cannot itself judge sensitivity. Uncertainty → treat as third-party (less trusted).

**6. Risk-floor routing.** *Judge (conservative) · SPECIFIED, partial.* Assigns the risk tier that caps treatment; upgrades on weak signal, downgrades only on strong evidence (§2–3). Cannot guarantee no misroute — it biases residual error to the safe side. Uncertainty → route upward. *Build note: current routing assigns by sensitivity but does not yet implement the full non-compensatory "highest plausible risk wins" floor; sensitivity is still entangled in the importance score (de-risk/p045 track is moving it out).*

**7. Treatment caps.** *Steel-ish · partially BUILT.* Given the tier, forces freeform / template / silence. Grave/sensitive/minor tiers can force safe-template or silence regardless of score. Cannot fix a wrong tier (that's post 6's job). Uncertainty → apply the stricter cap.

**8. Identity / name policy.** *Steel (literal name match) + Judge (referential / implied identity) · BUILT (names currently withheld across all live lanes).* An explicit name appears only where policy authorizes, and preflight rejects unauthorized literal names — that part is steel. But **identity can leak without a name**: "your sister" when the listener has one sister, an unmistakable description, a context that resolves to one person. Catching *referential* identity is a semantic judge call, not a string match, per CS's standard, and must be labeled and reviewed as a judge bar — not assumed covered by the literal check. Cannot decide *whether* a nameable moment is otherwise appropriate. Uncertainty → withhold.

**9. Grounding.** *Steel (literal) + Judge (referential) · TWO COMPONENTS — disambiguated.* Grounding verifies the produced line against the **raw item fields + context candidates — never against the model's own allowed-claims list** ("otherwise the model is checking the model"). Per CS's flag, there are two distinct things, and the old single label conflated them:
> - **(a) Production-engine grounding** — the check on the aired line in the generation path. **STUBBED: hardcoded `passed: true`** (Eng1-verified, `scoringEngine.ts:213`, `@1a46960`). **This is the keystone gap.** Until built, the generation freeze is the only thing standing in for it.
> - **(b) Playground `groundingGate`** — a **real lexical component** (CS-attested) that fires checks like `ungrounded_number` and `denylist:commercial_urgency` in the line-validator fixtures. It is *not* a no-op — but it is **lexical only**; it does not perform the deep line-vs-item referential check that (a) owes.
>
> So "grounding is stubbed" is true of the **production line-grounding (a)**, the keystone bar; it is **not** true of the playground lexical gate (b), which is real but shallow. Do not read the keystone-gap label as claiming (b) does nothing. Uncertainty → reject / fall back to template or silence.

**10. Line validator.** *Mixed steel/judge · BUILT and unit-tested on hand-authored lines; never run on a generated line.* The DISPUTED flag from v0.3 is **resolved**: `validateLine` exists and passes unit tests on hand-authored / fake lines (14/14 + 9/9; CS, `cd37804`/`b60d8be` — postdates Eng1's clone, so CS-attested by hash, not Eng1-verified). The precise truth, honest in both directions: it is **built** (v0.3's "not built" undersold filed work), but **(i)** its grounding arm is hollow until post 9(a) is built, and **(ii)** it has **never been run on a real generated line** — only on fixtures. "A validator exists" and "the cage has been exercised on live speech" are different claims; only the first is true. Cannot certify "safe and alive" alone — that's the human rubric. Uncertainty → fail closed; no airable lane may rely on it until its grounding arm is real and it has been exercised on generated output.

**11. Escape hatch.** *Steel (empty is legal) · BUILT; lane-specific semantics SPECIFIED, not built.* "The model may return empty" is present in the packet and is steel. But the **lane-specific behavior is not built** (CS): there is **no harness today** that scores an empty-on-a-clean-grave-Lane-2-packet as `fail-quality / missed-critical` (§7), and **no live "route to review" path** for a too-eager grave empty. So the risk-asymmetry of §7 is **designed, not enforced** — today an empty reads the same everywhere. **Risk-asymmetric (see §7):** a false-empty is costless in the happy lane but *harmful* in the grave lane; until the Lane-2 scoring exists, that harm is uncaught. Uncertainty → empty is allowed everywhere; the grave-lane review path is owed, not present.

**12. Human rubric.** *Human · process, partial.* Sampled human review: tasteful, not creepy, not performative, sounds like a host, safe *and* alive. Prevents shipping lines that pass machine checks but fail as moments. Cannot scale to every line — it audits. Uncertainty → withhold from the lane until reviewed.

**13. Governance.** *Governance · charter specified and decided in §8 (this draft); pending formal Eng1/Eng2/PO ratification as the operating charter.* Keeps posts 1–12 honestly labeled (steel vs. judge vs. human) and holds authority over which lanes ship. Prevents the *human over-trust* failure — shipping believing a judge bar is steel. Cannot be a rubber stamp without becoming theater. Uncertainty → does not ship. (Full charter in §8; this is no longer an open question — it is decided-pending-ratification.)

---

## 6. Validator check material map

Every check labeled by material, so "machine-enforced" is never claimed where the truth is "a second model makes a fallible semantic call."

**Steel checks** — raw post absent · required fields present · source-name policy · length cap · payload count · treatment cap · forbidden *literal* claim · grounding of *direct* claims against the item.

**Judge checks** — invented emotion · invented significance · implied cause · ambiguous-valence resolution · grave-implied explicitization · tone mismatch · "sounds like a support need" inference.

**Human checks** — tasteful · not creepy · not performative · sounds like a host · safe and alive.

> Steel bars stop structural escapes. Judge bars catch semantic escapes (imperfectly, so they need redundancy). Human checks catch what neither can. The hard bars must carry the load; soft bars are padding, and padding is not bars.

---

## 7. The escape-hatch asymmetry

Silence is a legal answer — this is one of the most important design decisions in the product, because most systems *cannot* structurally choose to do nothing. But the *value* of silence is risk-asymmetric:

- **Happy / utility lanes:** a false-empty costs nothing (an unmentioned surf podium). Empty is freely safe.
- **Grave lane:** a false-empty means *a death was shared and the system said nothing when it should have pointed the listener toward their friend* — the missed moment the user never reports, identified elsewhere as the *worst* failure. Here, *unexamined* silence is not automatically safe.

> The model's freedom to bail is itself risk-asymmetric, so the escape hatch carries **lane-specific semantics**:
> - **Low-risk / uncertain lanes:** empty can be correct. Safe.
> - **Grave Lane 2 — test harness:** an empty output on a *clean* Lane 2 packet (fresh, explicit, eligible, close) is scored **fail-quality / missed-critical**, NOT "safe." This is what makes evals catch the over-cautious-silence failure instead of passing it as success — the missed moment the user never reports.
> - **Grave Lane 2 — live:** no autonomous voice until human review exists; an empty routes to **review-required** or **template fallback**, never a silent vanish.
>
> This is another reason grave is template-first: if the facts are explicit and the slots are safe, the system should not need a model to improvise at all (see §10, Lane 2).

---

## 8. Governance — specified, not a footnote

Every other post is a design decision. Governance is an **org** decision, and it is the only one that cannot be fixed in code later. Its job is narrow and critical: prevent the failure where *everyone followed the architecture and the architecture was quietly oversold to itself* — someone reads "no invented significance" on the validator list, sees it as machine-enforced, and ships to grave content when it is a fallible judge.

The material map (§6) is the artifact that prevents this — **but only if governance has the teeth to enforce it:**

- Governance holds **stop-authority over which lanes ship** and can say no to a ship date.
- A lane whose safety depends on **judge bars** does not ship to grave/sensitive content **until human review is in the loop** — and that is not negotiable for a quarter.
- Governance keeps the steel/judge/human labels honest as the system changes; a relabel from judge to steel requires evidence, not optimism.

> The moment governance is a rubber stamp, the cage is theater. This post must be the *most* explicitly specified, not the last bullet.

### The stop-authority charter (Eng2 ruling — decided)

The open question — *who holds stop-authority, and can they refuse a ship date* — is answered. The governing principle: **the builder cannot ratify their own safety boundary.**

**Roles and authority:**
- **Product Owner / Acting Manager** — owns the *product/release* call: what experience is attempted, whether an evidence step is worth running, whether a line is good enough to represent the product, whether to proceed to demo/audio *after* safety clears. Can stop for product or trust reasons.
- **Eng1 / Eng2** — own the *safety* call: whether the mechanism is safe enough for the requested evidence step, whether the cage material labels are honest, whether a lane has enough steel/judge/human coverage, whether a rule is Class-1 and must be ratified before behavior changes. **Either holds a non-overridable safety veto.**
- **CS Engineer** — owns implementation, test evidence, packet/rubric preparation, surfacing known gaps, and proposing changes. **Does not self-ratify release of speech.**

**Default tie-break rules (explicit, or governance is theater):**
- PO and Eng disagree on safety → **no air.**
- Eng1 and Eng2 disagree → **no air until resolved or narrowed to a safer evidence step.**
- A ship/demo date conflicts with safety classification → **safety classification wins. No date overrides a red bar.**

The org design in one line: **any safety owner can stop a lane; no single builder can approve their own cage; a ship date cannot overrule a red bar.**

This is the seed of the third companion artifact, the **Governance Stop-Authority Charter** — CS to expand to a one-page doc answering: who approves/blocks a new lane; who approves line generation, name disclosure, and freeform in a lane; which failures are zero-tolerance; what happens when a bar is judge-only, not steel; what evidence moves a lane from lab → demo → user-facing; can a date override a red gate (no); can the implementer approve their own safety mechanism (no).

---

## 9. Lane certification levels (what a lane has earned the right to do)

The material map says what each *bar* is made of; certification says what each *lane* is permitted to do. **A lane may not claim a capability above its level.** This is what stops "padding mistaken for steel" at the lane level, not just the bar level.

| Level | Meaning |
| --- | --- |
| **L0 — Design only** | Spec exists; no generation. |
| **L1 — Packet safe** | Handoff / preflight tested; no model line. |
| **L2 — Line lab** | Generated line allowed *in lab only*, with validator + rubric. |
| **L3 — Internal demo** | Multiple lines internally; no external claim of production readiness. |
| **L4 — Limited user trial** | Narrow lane, monitoring, rollback, governance approval. |
| **L5 — General availability** | Mature evidence, telemetry, review, incident process. |

**Current placement (as of this draft):**
- **Low-risk positive lane** (low-sensitivity, subject-authored, name-withheld, no raw post, short): **~L1, pending ratification** — machinery prepared to attempt L2, held there by the generation freeze.
- **Grave / medical:** nowhere near freeform certification. **Template-only design / fixture stage** until proven otherwise.

A lane's certification is raised only by the safety owners (§8) — never by the implementer, and never to clear a date.

### The "cannot advance" rule

> **A lane cannot advance to L2 or above if any bar that lane requires is labeled "stubbed," "hardcoded pass," or "judge-only without review" — unless the lane is explicitly lab-only and structurally cannot air.**

This is the rule that stops a false L2/L3 jump. It has a direct, current consequence:

### The grounding gating consequence (current)

Grounding (post 9) is a **hardcoded pass** today. Therefore:

- The first generated line may be produced **in lab only**, if Eng approves, under packet + (reconciled) validator + human-rubric constraints.
- It **cannot** honestly be called *"grounded safe spoken proof"* or a Phase-2 evidence win. Until the grounding bar is real, the most it can be called is *"lab line generation under packet, validator, and rubric constraints — grounding unproven."*
- No airable lane (L4+) may rely on a line whose grounding is stubbed. The generation freeze is the current stand-in for this bar; lifting the freeze without building grounding would remove the only thing doing grounding's job.

---

## 10. The grave / medical template ladder

Freeform never goes near grief. The fork — *should the safe-template be grounded and say the fact, or stay vague and say almost nothing?* — resolves not as one answer but as a ladder. Lane depends on what the packet proves and what is safe to name.

### Lane 0 — Silence
Use when: source private/unclear · relationship weak · event stale · facts ambiguous · minor private suffering · the system cannot hold the right tone afterward. **This is the default for most grave/medical uncertainty.** Output: nothing.

### Lane 1 — Vague doorway
Use when: something heavy/personal is *clearly shared* · the exact death/diagnosis is not explicit enough, or not safe enough, to name · relationship is close enough · a check-in would help · but naming the fact would overstep.
> *"Someone close shared something personal today. Might be a moment to reach out quietly."*

Still grounded: the packet must support "shared something personal/heavy." If it doesn't, drop to Lane 0. **No "heavy" if the post was just cryptic nonsense — the model does not get to be a poet with other people's pain.**

### Lane 2 — Grounded grave template (slot-controlled, not freeform)
Use **only** when: death/diagnosis is explicit in allowed claims · source/audience eligibility clean · relationship close or community-relevant · event fresh · identity policy defines what may be named · treatment cap forces safe-template · final line passes grounding *and* human review.
> *"Someone close shared that their father passed away. I'll leave the details with them, but this may be a moment to reach out quietly."*

Constrained slots: **person reference** (someone close / family member / community member / name only if identity policy allows) · **event type** (passed away / starting treatment / serious illness — only if explicit) · **doorway** (reach out quietly / keep it simple) · **no emotional coloring.** This is the somber case *done well*: direct enough that the listener actually learns to show up, caged enough that it cannot overstep.

**Preferred implementation: deterministic slot-template, model-free where possible.** If the fact is explicit and the slots are safe, there is no reason for a generative model to be in the loop at all — slot-filling from grounded fields is closer to steel than to a judge. Lane 2 should be template-first, and ideally model-free. Freeform is prohibited regardless (Lane 3).

### Lane 3 — Prohibited freeform (v0)
> **No grave/medical freeform in v0.** Not "mostly." Not "if the prompt is good." No.

The model may fill constrained slots only after the packet has already proven the fact. If it cannot fill them safely, it returns empty (and per §7, that empty routes to review in this lane).

### Grave situation → allowed output

| Situation | Allowed output |
| --- | --- |
| Implied grave, not explicit | Vague doorway (Lane 1) or silence |
| Explicit grave — eligible, close, fresh | Grounded grave template (Lane 2) |
| Explicit grave — but stale / weak / unclear | Silence |
| Diagnosis / medical unfolding | One-time grounded doorway or silence |
| Minor private suffering | Silence, or group-level non-private wording only |
| Any uncertainty about the exact fact | Do **not** name the fact |

> **The safe-template is grounded when it states a specific fact, vague when the fact is implied or unsafe to name, and silent when even the vague doorway would overstep.** The fixed-vague template is safer but too thin for the moments the product most needs to be humane; the grounded template is more useful but only when the fact is explicit and the line is slot-controlled.

---

## 11. Build-status matrix (authoritative · current vs. target)

This table is the **single source of truth** for status; §5's per-post notes defer to it. "Current" reflects what Eng1 can verify against `@1a46960` *plus* CS attestations by commit (marked). ✅ Eng1-verified-built · 🟢 CS-attested-built (by commit, postdates Eng1's clone) · 🟡 partial/entangled · 🔴 stubbed/absent · ⚪ process.

| # · Post | Material | Current state (verified) | Target | Blocks which lane |
| --- | --- | --- | --- | --- |
| 1 · Source eligibility | Steel (explicit) / Judge (inferred) | ✅ metadata allowlist, fail-closed | add judge-path label+review only if inferred audience is introduced | none at L1 |
| 2 · Raw-post firewall | Steel | ✅ raw text absent from packet | maintain | none |
| 3 · Allowed claims | Generation aid (not a bar) | ✅ present as aid | never used as grounding source (see #9) | n/a |
| 4 · Forbidden inferences | Judge (semantic) + Steel (lexical denylist) | 🟡 partial; denylist catches literal cases (e.g. `commercial_urgency`), implied inferences are judge | redundancy + grounding backstop | sensitive lanes until #9 real |
| 5 · Provenance | Steel-ish | 🟡 partial | gate third-party+high-sensitivity → no voice | sensitive lanes |
| 6 · Risk-floor routing | Judge (conservative) | 🔴 **not a separated floor — sensitivity still a damper in the importance score** (`value = base × conf × sensitivity_damper`) | separate risk from importance; "highest plausible risk wins"; non-compensatory | any L2+ grave/sensitive lane |
| 7 · Treatment caps | Steel-ish | 🟡 partial | enforce stricter-cap-on-uncertainty | sensitive lanes |
| 8 · Identity / name policy | Steel (literal name) + Judge (referential identity) | ✅ literal-name steel built, names withheld; 🟡 referential/implied identity is a judge bar, not yet labeled+reviewed as one | label+review the referential path; per-lane name authorization later | none at name-withheld L1; referential check owed before any naming |
| 9 · **Grounding** | Steel (literal) + Judge (referential) | 🔴 **(a) production line-grounding STUBBED — hardcoded `passed: true` (Eng1-verified). KEYSTONE GAP.** · 🟢 (b) playground `groundingGate` real but **lexical-only** (`ungrounded_number`, `denylist`; CS) | build (a): verify line vs raw item fields / context candidates (NOT allowed-claims) | **all airable line generation; any "grounded" claim** |
| 10 · Line validator | Mixed | 🟢 **BUILT + unit-tested on hand-authored lines** (14/14 + 9/9; CS `cd37804`/`b60d8be`); grounding arm hollow (needs #9a); **never run on a generated line** | wire to real #9a; exercise on generated output | L2+ until grounding arm real AND run on generated lines |
| 11 · Escape hatch | Steel (empty legal) + unbuilt semantics | ✅ empty-is-legal built; 🔴 no harness scores Lane-2 empty-on-clean as missed-critical; no live route-to-review (CS) | build Lane-2 missed-critical scoring + review path | grave L2 until missed-critical scoring exists |
| 12 · Human rubric | Human | ⚪ partial (gold labeling exists) | per-lane review trigger | sensitive lanes until review in loop |
| 13 · Governance | Governance | ⚪ charter decided in §8, **pending ratification** | ratify as operating charter | any lane ship without ratified stop-authority |

> **The two missing steel bars that matter most:** #9(a) production grounding (stubbed) and #6 risk-floor routing (not yet non-compensatory). Until both are built, the document's central law — *importance can be additive, risk must be a floor* — is stated but not enforced in code. The line validator (#10) is now built but **hollow at the grounding arm and never run on a generated line**, so the generation freeze still stands in for #9(a) and for the missing real-line exercise. **Selection is provable today; the spoken line is not yet defended by code.** Judgment first, generation last, fenced the whole way — a frame, not yet a finished enclosure.
>
> **Measured result (new):** the degradation suite (`214b0e9`, CS) shows graceful degradation (§3) **fails in 6 cases today** — a single down-rung misroute reaches freeform. The wall has named holes. That the test found them before a user did is the system working as intended; closing the 6 gaps is now concrete, scoped work with a ready-made check.

### Post-ratification mechanism priority

Once the charter is ratified, the next work is **not** "more generated lines." In order:

1. **Minimal real production grounding gate** (#9a) — turn the hardcoded pass into an actual check against raw item fields/context candidates, then wire the already-built `validateLine` (#10) to it.
2. **Risk-floor routing separated from importance** (#6) — pull sensitivity out of the value score; make risk a non-compensatory floor.
3. **Close the 6 degradation gaps** (§3) — the suite (`214b0e9`) already exists and already names them; fix until a down-rung misroute can no longer reach freeform, then re-run the suite to confirm.
4. **Build the Lane-2 escape-hatch semantics** (#11) — score empty-on-clean-grave as missed-critical; add the review path.
5. **Then** the first narrow L2 lab line — and only with #9a real may it be called grounded.

Inverting this order — generating polished lines before grounding and risk-floor routing exist — makes the system *look* finished while the load-bearing bars are still missing. The doc is persuasive; that is exactly the seduction to resist.

---

## The one-line version

> **The cage is not a single mechanism. It is a labeled system of constraints. Steel bars block structural escapes. Judge bars detect semantic escapes (imperfectly, so they need redundancy). Risk-floor routing — non-compensatory, recall-biased, fail-upward — keeps dangerous items from entering permissive lanes. Governance keeps the team from mistaking judge bars for steel. The cage exists not to make the model smart, but to let it be useful despite not being trustworthy by default.**

And the org design in one line:

> **Any safety owner can stop a lane. No single builder can approve their own cage. A ship date cannot overrule a red bar.**

*Three companion artifacts this reference seeds, all worth more than another generic test suite: the per-post **Cage Material Map** (this document is its first draft), the **Grave Template Ladder** spec (§10), and the **Governance Stop-Authority Charter** (§8, seed form — CS to expand to one page).*

---

> **The honest one-line status:** until grounding (#9) and risk-floor routing (#6) are actually built, the cage is a very good *frame* — not yet a full *enclosure*. This document is persuasive; its persuasiveness is the risk. A persuasive safety doc is useful right up until it convinces the team it is the implementation. It is not. It is the spec the implementation must be measured against.
