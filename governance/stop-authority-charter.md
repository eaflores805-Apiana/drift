# Drift — Governance Stop-Authority Charter

> **STATUS: DRAFT — pending Engineer 2 + PO sign-off.** Drafted by CS Engineer from the §8 seed of the Cage Containment Architecture (`docs/cage-architecture-reference.md`, v0.4). This charter governs CS; by the charter's own rule, **CS cannot ratify it.** It is a proposal for the safety owners (Eng1/Eng2) and the PO to accept, amend, or reject.

---

## 0. Why this exists

The scary Drift failure is not "the model escaped." It is **a team shipping a fragile safety system while feeling responsible** — because a checklist line said "no invented significance" and someone read a fallible *judge* bar as *steel*. Every other safety post can be retrofitted in code. Governance cannot. This charter is the one bar that keeps the humans from over-trusting the cage.

It answers six questions plainly, so that when a ship date and a red bar collide, nobody has to invent the rule under pressure.

The keeper line:

> **Any safety owner can stop a lane. No single builder can approve their own cage. A ship date cannot overrule a red bar.**

---

## 1. Roles and authority

| Role | Owns | Can stop a lane? | Can approve speech? |
| --- | --- | --- | --- |
| **Engineer 1 / Engineer 2** | **Safety.** Is the mechanism safe enough for the requested evidence step; are the cage material labels honest (steel/judge/human); does a lane have enough coverage; is a rule Class-1. | **Yes — non-overridable safety veto, either one.** | Yes — safety clearance is theirs to grant or withhold. |
| **Product Owner / Acting Manager** | **Product / release.** What experience is attempted; whether an evidence step is worth running; whether a line is good enough to represent the product; whether to proceed to demo/audio *after* safety clears. | **Yes** — for product or trust reasons. | Yes — the product/release call, but **only after safety has cleared.** |
| **CS Engineer** | **Implementation, test evidence, packet/rubric prep, surfacing gaps, proposing changes.** | May *recommend* a stop (and must, when a gap is found). | **No. CS does not self-ratify release of speech, and does not ratify its own safety boundary.** |

**The implementer-cannot-self-ratify rule is absolute.** CS may build the mechanism, write the tests, draft the policy, and recommend a level — but the safety owner who signs off must not be the person who built the thing being signed off. The builder is too close to the cage to certify it.

---

## 2. Who approves or blocks a lane

A **lane** is a routed class of content with a certification level (L0–L5, §6).

- **Raising a lane's certification level** requires sign-off from **a safety owner who did not implement the change** (Eng1 or Eng2), plus the PO for any level at or above **L3 (internal demo)**.
- **Blocking / lowering a lane** requires **only one** safety owner. Stop-authority is cheap by design; the asymmetry is intentional — it should be far easier to close a lane than to open one.
- **CS may prepare a lane to L1 (packet-safe)** and stage the machinery for L2 — but cannot itself declare L2 reached. (The #5A–#5D work is exactly this: prep, not promotion.)

---

## 3. Who approves generation, name disclosure, and freeform

These are the three highest-consequence capability grants. Each requires explicit, recorded sign-off — never inferred from a passing test:

| Capability | Requires |
| --- | --- |
| **First generated line in a lane (L1→L2)** | Safety owner (non-implementer) sign-off that grounding + validator coverage is real, not stubbed, for that lane. The first line must pass grounding *and* the human voice-quality rubric before it counts as evidence. |
| **Name / identity disclosure (an ALLOW path)** | Safety owner sign-off. Default is name-withheld. An allow-path opens a *judge* surface (referential identification, §cage-map Post 8) and must be reviewed as a Class-1 change, not a config toggle. |
| **Freeform in sensitive/grave/medical content** | **Not grantable in v0.** No safety owner can approve grave/medical freeform under this charter; the ceiling is the Lane 2 slot-template (when built), and that itself needs the human-review gate. Raising this ceiling is a charter amendment, not a sign-off. |

---

## 4. Zero-tolerance failures

These are not "high severity." They are **lane-closing on sight** — any one, observed in any evidence step, closes the lane until root-caused, regardless of date:

1. A **grave / medical / minor** item rendered as celebratory, casual, or freeform (the down-route catastrophe — measured 6× in the degradation suite, all unbuilt-floor cases).
2. An **explicit death or diagnosis restated cheerfully** or with invented emotion/significance.
3. A **name disclosed** where policy did not authorize it (including referential identification of a minor or a private subject).
4. A **third-party, high-sensitivity** item given voice.
5. The **raw post** reaching the generator, or being echoed verbatim in a line.
6. A safety post **relabeled judge→steel** in any artifact without evidence (the over-trust failure this charter exists to prevent).

A zero-tolerance failure is not weighed against importance, novelty, or schedule. It is a floor (see the non-compensatory risk law in the cage map §2).

---

## 5. What happens when a bar is judge-only (not steel)

A lane whose safety, for a given risk class, rests on a **judge** bar (a fallible semantic reading) rather than **steel**:

- **may not ship to grave / sensitive content until human review is in the loop** for that lane — and this is not negotiable for a quarter to make a date;
- **must be labeled honestly** in the cage material map as judge, with the residual-error path named (redundancy + conservative treatment + fail-upward routing);
- **must carry a second bar** wherever feasible — a judge bar standing alone over dangerous content is a single point of semantic failure.

A relabel from judge to steel requires **evidence of structural enforcement**, not optimism. Absent that evidence, the bar is judge, and the lane is capped accordingly.

---

## 6. Evidence required: lab → demo → user-facing

Certification rises only on evidence, and the evidence bar rises with the level. (Levels mirror cage map §9.)

| Level | Evidence required to enter |
| --- | --- |
| **L0 — Design** | Spec exists. No generation. |
| **L1 — Packet-safe** | Handoff/preflight tested; deterministic fixtures pass; no model line. |
| **L2 — Line lab** | Generation in lab only. **Real (non-stubbed) grounding for the lane** + validator pass + first-line voice-quality rubric pass on human-reviewed samples. |
| **L3 — Internal demo** | Multiple lines, internal only, no external production-ready claim. PO sign-off added. Degradation evidence: a one-rung misroute in this lane does **not** reach freeform. |
| **L4 — Limited user trial** | Narrow lane, live monitoring, rollback path, incident process, safety-owner approval. |
| **L5 — General availability** | Mature telemetry, sustained review, incident history clean. |

**No level may be claimed above the evidence on file.** A passing unit test on hand-authored lines is L1/L2 lab evidence — never proof of L3+.

---

## 7. The two hard tie-breaks

When authority conflicts, the rule is decided in advance so nobody improvises under deadline:

- **A ship / demo date conflicts with a safety classification → the safety classification wins. No date overrides a red bar.** A date is a product preference; a red bar is a floor. Floors do not yield to preferences.
- **PO and a safety owner disagree on safety → no air.** Product authority does not overrule safety authority on a safety question.
- **Eng1 and Eng2 disagree → no air until resolved, or until the step is narrowed to a safer evidence stage** both can accept (e.g., drop from L3 to L2-lab).

In all three, the default when unresolved is the same: **no air.** Silence is a legal answer for the system; "do not ship" is the legal default for the org.

---

## 8. What this charter does not do

- It does not let CS approve its own mechanism, lane, or line. (§1)
- It does not let a passing test stand in for a sign-off. (§3, §6)
- It does not let importance, novelty, or schedule buy down a zero-tolerance failure. (§4)
- It does not authorize grave/medical freeform in v0 under any sign-off. (§3)

---

## The one-line version

> **Safety owners (Eng1/Eng2) can stop any lane and either holds a non-overridable veto; the PO owns product/release after safety clears; CS builds and recommends but never certifies its own cage; evidence — not a date and not a passing test — raises a lane; and when anything is unresolved, the answer is no air.**

---

*Drafted by CS Engineer, 2026-06-27. DRAFT — pending Engineer 2 + PO sign-off. Companion to `docs/cage-architecture-reference.md` (v0.4) §8 and its §11 build-status matrix.*
