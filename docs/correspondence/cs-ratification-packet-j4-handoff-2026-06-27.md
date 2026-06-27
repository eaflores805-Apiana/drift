# Ratification packet — J4 taxonomy + Decision→Packet handoff contract

**Date:** 2026-06-27
**Revised:** 2026-06-27 — narrow refresh of §5/§6 + new §6a delta after seam-hardening #5A–#5D (no J4 change, no lines, freeze intact).
**Author:** CS Engineer
**For:** Eng1, Eng2 (ratification) · PO (already directed)
**Decision class:** Class 1 — bounded sign-off requested
**Status of work:** All evidence below is built, run, and filed. **Line generation remains FROZEN until this packet is ratified.**

> This is a ratification artifact, not a status update. It states what to approve, what is explicitly *not* up for approval, the evidence, and the exact seams the machine does **not** yet enforce — so you can approve / reject / narrow without guessing.

**Source artifacts (this packet summarizes; these are authoritative):**
- ADR J4 — `docs/correspondence/cs-adr-j4-positive-personal-touch-band-2026-06-26.md`
- Handoff contract (§5 mappings) — `docs/correspondence/cs-decision-to-packet-contract-2026-06-26.md`
- Box 8 off-path fixture suite — `playground/scripts/box8-handoff-fixtures.ts` (run: `npx tsx scripts/box8-handoff-fixtures.ts`)
- J4 run decisions — `runs/world-brain/decisions-ventura-v2.json` (git-ignored; firewall)

---

## 1. Executive summary

**Being ratified (yes/no/narrow on each):**
1. **J4 taxonomy** — the `positive_personal_touch` treatment band + the exclusion bands, as a layer over the unchanged 4-value route vocabulary.
2. **§5 handoff mappings** — band→category, route confirmation, gold-derived block/treatment, source_type→provenance, fail-closed defaults.
3. **Name policy** — whether/how a source name may ever reach generation. The **deny direction is now machine-enforced** (#5A, §6a); what remains for ratification is the **allow** policy only (see §6.1).
4. **First-line generation under restrictions** — permission to generate exactly **one** line under §8 conditions.

**Explicitly NOT being ratified here:**
- The exact six World-Ventura candidates (thresholds are World-Ventura-only scaffolding; the taxonomy is the point, not the picks).
- `identity_policy` / `voice_payload` as full subsystems (held).
- Span auto-extraction (deferred; default `[]`).
- Any audio / demo packaging.

**Freeze status:** generation stays frozen until §7 is answered. Everything below was produced without generating a spoken line and without depending on any J4 pick.

## 2. J4 taxonomy proposal

**Problem it fixes (measured):** on a 57-post synthetic friend-feed (live Sonnet meaning), the pre-J4 brain voiced **2/57 — the wrong two**: routine venting aired, genuine good news stayed silent. Root cause was a route-taxonomy gap, not a threshold nudge: every low-sensitivity personal post went to `highlight` under the community-pride bar **0.532**, which was fitted on community items (0.56–0.58) and buries personal wins that cluster at **0.45–0.53**.

**`positive_personal_touch`** — a highlight-family band for **ordinary, low-sensitivity good news from a personal tie** (a podium, an opening, a cert, a birthday): the day-to-day texture that is easy to miss but nice to receive.
- **Allows:** voicing on its **own** bar (0.30, World-Ventura-only) instead of the community bar (0.532), which stays unchanged for `community_highlight`.
- **Must NOT allow:** anything sensitive/grave (high-sensitivity personal items go to `doorway_sensitive`, never a celebratory band — so no grave→celebration path exists); routine stress (→ `mild_stress`, ambient); low-value chatter (→ `everyday_texture`, ambient).
- **Closeness stays a score term, not a second gate** (no double-damp). Escalation `mild_stress → doorway_sensitive` keys on magnitude/substance, not closeness.

**Voiced-bar criterion:** band-first resolution — `bandThresholds[band] ?? routeThresholds[route]`. ⚠ All J4 constants (`POSITIVE_TOUCH_MAG_FLOOR=0.40`, band bar `0.30`, `MILD_STRESS_DOORWAY_MAG=0.50`) are stamped **World-Ventura-only — re-derive on a human corpus before production.**

## 3. §5 handoff mapping proposal

These are the maps the Decision→Packet adapter needs. The two that affect Box 8 strictness (3.1, 3.4) are why this needs a ruling; the rest confirm gold-packet-derived values.

**3.1 band → packet `category`** *(safety-affecting — drives CATEGORY_TIER → gate strictness)*
positive_personal_touch→`celebration` · community_highlight→`celebration` · doorway_sensitive→`sensitive` · mild_stress→`everyday` · everyday_texture→`everyday` · utility→`utility` · silent→(not voiced).
`grave`/`grave_implied`/`ambiguous` are **not** produced by this map (require a meaning-level grave/ambiguity signal not yet wired — propose separately).

**3.2 route** highlight→`highlight` · utility→`utility` · doorway→`doorway_sensitive` (only doorway J4 emits; `doorway_grave` needs the grave signal) · silent→not voiced.

**3.3 category → block / block_contract / target_length** *(gold-packet-derived, confirm)*

| category | block | contract (cap/co/tonal/doorway/cooldown) | length |
|---|---|---|---|
| celebration | standard | 1/no/no/true/none | short |
| ambiguous | standard | 1/no/no/optional/none | short |
| sensitive | sensitive_doorway | 1/no/**yes**/true/light_breather | short |
| utility | utility_pin | 1/no/no/**false**/none | short |
| commercial | commercial_signal | 1/no/no/false/none | short |

**3.4 source_type → `provenance`** *(safety-affecting — drives preflight rule #4)*
friend/family/coworker/creator→`subject_authored` · local_org/news/weather/calendar/brand→`official_source` · about-a-third-party→`third_party`/`unclear` · unsure→`unclear` (fail-closed).

**3.5 fail-closed defaults (confirm as v0 behavior):** `source_name:"none"` · `permitted_source_spans:[]` · `plainly_stated_serious_fact:"none"`. A v0 adapter can only under-share, never over-share.

**Held (not in this packet):** `identity_policy`/name disclosure (§6.1), `voice_payload`, span auto-extraction.

## 4. Six-candidate audit — happy path stable, but a monoculture

All numbers measured from the J4 run + real `preflight()` (no lines generated).

| item | band | route | name? | raw withheld? | claims | forbid | sens | provenance | spans? | preflight | escape? | treatment |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| nico-d4-m | positive_personal_touch | highlight | no | yes | 3 | 5 | low | subject_authored | no | PASS | yes | standard/cap1/short |
| lena-d3-e | positive_personal_touch | highlight | no | yes | 4 | 5 | low | subject_authored | no | PASS | yes | standard/cap1/short |
| lena-d3-m | positive_personal_touch | highlight | no | yes | 5 | 6 | low | subject_authored | no | PASS | yes | standard/cap1/short |
| sam-d6-m | positive_personal_touch | highlight | no | yes | 3 | 6 | low | subject_authored | no | PASS | yes | standard/cap1/short |
| mark-d3-e | positive_personal_touch | highlight | no | yes | 4 | 7 | low | subject_authored | no | PASS | yes | standard/cap1/short |
| mia-d5-m | positive_personal_touch | highlight | no | yes | 4 | 7 | low | subject_authored | no | PASS | yes | standard/cap1/short |

**Conclusion:** all six pass preflight, withhold the raw post, separate allowed claims from forbidden inferences, and carry an escape hatch. **But every structural column is identical** — the J4 run produced exactly one voiced band. This proves the *happy path* (low-sensitivity, subject-authored, positive). It exercises none of the risk surface. Hence §5 stress below.

## 5. Box 8 off-happy-path enforcement map (19/19 fixtures matched pre-registered expectations)

The fixture suite stresses the lanes the run never produced (sensitive±quiet, grave-implied, grave-explicit, ambiguous, name-present, third-party high/low, minor, utility, commercial, stale, + one malformed per preflight rule). Every fixture pre-registers its expected outcome; the runner reports expected-vs-actual. **What the green proves — and what it does not:**

| layer | machine-enforced? | covers |
|---|---|---|
| **preflight (deterministic)** | ✅ yes | claims-non-empty · grave-fact ⊆ claims · block⟷route(treatment) · provenance×sensitivity (third-party-or-omit) · boundary capture · source_name format · payload ≤ cap · **name disclosure (deny direction, #5A)** |
| **gate-structural** (routeGate tier cap, no line) | ✅ yes | sensitive/grave/minor → `safe_template`; quiet → `silence`; freeform never airs on a serious tier |
| **line validator** (`validateLine`, #5B/#5C) | ✅ **built; tested on hand-authored lines, not yet on a real generated one** | invented emotion/significance · raw-post echo · name leak · over-length · co-item overflow · grave-implied→explicit leak · + orchestrates Box 8a grounding & Box 8b route deny-rules (valence/motive/deanon/mobilize). Still requires a real line post-unfreeze to exercise end-to-end. |
| **upstream-scoring** | n/a here | stale-serious → silence (novelty/recency); never reaches preflight |
| **unratified / held** | ❌ **policy only** | name disclosure **allow** policy (`identity_policy.*_allowed`) — the *deny* is now mechanical; only authorizing a name awaits ratification (§6.1) |
| **by-construction** | ❌ no machine check | "no invented urgency" (utility); "no paid priority" (commercial); minor-not-named-in-claims |

**Proven with teeth:** grave-fact grounding (F04 passes only because the fact is in claims; M02 rejects when it isn't), third-party-or-omit (F07 high → REJECT; F08 low → PASS), treatment caps (F01/F03/F04/F09 → template; F02 → silence), all fail-closed preflight rules incl. the new name gate (M01/M02/M03/M05/M06/M07; F06b now REJECT; identity-gate truth table 12/12), and the line validator on hand-authored traps (14/14 + 9/9 valence/grave). **Note the shift:** what §5 (first issue) listed as a single "gate-on-line — FROZEN, not proven" row is now a *built and unit-tested* validator; what is still missing is one real generated line to run through it, which is exactly what §8 gates.

## 6. Open seams — current state (machine / policy / line / upstream)

*Refreshed after #5A–#5D. Three of the five seams moved; see §6a for the delta.*

1. **Name disclosure — deny direction now MACHINE-ENFORCED (#5A); only the *allow* policy remains unratified.** Preflight rule #8 is fail-closed: a `source_name` other than `"none"` **REJECTS** unless an explicit `identity_policy` authorizes it (F06b flipped PASS→REJECT; truth table 12/12). What is *not* yet ratified is the **allow** side — the shape and authority of `name_allowed` / `entity_name_allowed`. Until that is ratified, names stay withheld by construction, so first-line generation can proceed **name-withheld** without waiting on it.
2. **Ambiguous valence — line-level coverage for OBVIOUS cases (#5C); subtle paraphrase is a KNOWN GAP.** `validateLine` + the route valence guard now block resolved valence ("congrats", "hard goodbye", "sorry to hear") and a restrained note still airs (V01–V04). **Residual:** subtler paraphrase that resolves valence without a flagged word ("things are really looking up for them") **still airs** (V08). Closing it needs a v1 model/judge — or an Eng decision to keep ambiguous on `safe_template` regardless. Keyword guards have a ceiling; this is it.
3. **Grave-implied / grave-explicit — line-level coverage added (#5B/#5C); keep two distinctions.** `validateLine` flags a `grave_implied_explicit_leak` when a line makes the implied loss explicit (V05). And — the honest v0 finding — even a **clean, grounded, policy-respecting grave-EXPLICIT** line does **not** air freeform: the grave tier caps it to `safe_template` (V07). So distinguish:
   - **blocked-by-content** — a violation fired; the line is unsafe (V05).
   - **blocked-by-policy** — a clean line capped by the grave/sensitive tier (V06, V07); violations empty. v0 caps; v1 *may* relax once trusted.
   Residual: the leak-detector's explicit vocabulary is finite (V09: "lost someone" isn't listed), but the tier cap still blocks structurally — defense in depth, not a hole.
4. **Stale-serious is upstream.** Not a preflight concern — but the packet should eventually **carry freshness metadata** so a downstream reviewer can see *why* a grave item is still eligible. Unchanged.
5. **Minor cap may be over-conservative** (F09: a happy robotics win → `safe_template`). Good v0 default; flag to revisit, not fix now. Unchanged.

## 6a. Delta since first issue — seam-hardening #5A–#5D (2026-06-27)

Built while blocked on this ratification; all inside the freeze (no lines generated, no J4 thresholds touched, firewall clean). Each is unit-tested with **pre-registered** expectations.

| # | What | Effect on the decision | Verify |
|---|---|---|---|
| **#5A** | Fail-closed identity/name-disclosure preflight gate (rule #8) | Seam §6.1 **deny direction closed** — a name now rejects without explicit policy. Only the *allow* policy stays unratified. | `identity-gate-fixtures.ts` 12/12; F06b PASS→REJECT |
| **#5B** | `validateLine()` — line-level cage (orchestrates Box 8a/8b + adds 7 new checks) | Seam §6.2/§6.3 — the "line-level validation after unfreeze" those seams demanded now **exists and is unit-tested** (on hand-authored lines, not yet a real one). | `line-validator-fixtures.ts` 14/14 |
| **#5C** | Ambiguous-valence + grave-implied/explicit line fixtures | Hardened the valence guard (obvious paraphrases); **named the residual gap** (V08) and the blocked-by-content vs blocked-by-policy distinction (V07). | `line-valence-grave-fixtures.ts` 9/9 |
| **#5D** | Positive-touch packet diversity (preflight only) | Answers §4's monoculture finding: the handoff contract now **proven across 10 varied low-risk relational packets** (6 relationships / 8 registers / 5 source_kinds / 3 provenances), with 2 must-reject cases proving it still bites. | `positive-touch-packet-diversity.ts` 12/12 |

**What this does and does not change for ratification.** It does **not** advance the freeze or pre-decide anything: J4 behavior is unchanged, no line was generated, the *allow* policy is still yours to rule on. It **does** mean that when you approve §7.4, the first line drops into a real validation cage (machine name-deny + a unit-tested line validator + tier caps) instead of a vibes tunnel — and it narrows what's left to "policy-only" and "one real line."

## 7. Ratification decision requested

Please rule on each (approve / reject / narrow):
1. **Approve J4 taxonomy** (§2) — `positive_personal_touch` as a highlight-family band over the unchanged route vocabulary, exclusion bands as ambient, closeness as a score term not a second gate?
2. **Approve §5 mappings** (§3) — especially band→category (3.1) and source_type→provenance (3.4), World-Ventura-provisional, re-derive on a human corpus?
3. **Name policy** (§6.1, §6a) — the *deny* is already mechanical (#5A). Decision: either (a) ratify the `identity_policy` **allow** shape (`name_allowed` / `entity_name_allowed` — who sets it, under what tier rules) to enable name-bearing lines later, or (b) leave it unratified, in which case names stay withheld by construction. Either way the first line runs **name-withheld** — (b) does not block §7.4. (CS recommends deferring the allow policy and proceeding name-withheld.)
4. **Approve first-line generation** under the §8 conditions?

## 8. Conditions for the first generated line (if §7.4 approved)

The first line should test the **narrowest meaningful thing**: *can the mouth turn a clean, low-risk packet into one safe, warm, non-dead hosted beat?* Not six. Not a demo reel.

- **one** candidate only, from the six low-sensitivity `positive_personal_touch` items;
- **name withheld** (unless §6.1(a) is ratified and gated);
- **permitted spans empty**; **raw post withheld**; **standard / cap1 / short**;
- generated line must **pass `validateLine` (#5B) — which runs Box 8a grounding + Box 8b route gate + the added line checks**;
- **human read required**, against: no invented emotion · no source-name leak · no raw-post echo · no cheesy generic-bulletin tone · has a doorway/landing · sounds like a host, not a notification;
- **no audio, no demo packaging.**

— CS Engineer, 2026-06-27
