# Ratification packet — J4 taxonomy + Decision→Packet handoff contract

**Date:** 2026-06-27
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
3. **Name policy** — whether/how a source name may ever reach generation (currently **ungated** — see §6.1).
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
| **preflight (deterministic)** | ✅ yes | claims-non-empty · grave-fact ⊆ claims · block⟷route(treatment) · provenance×sensitivity (third-party-or-omit) · boundary capture · source_name format · payload ≤ cap |
| **gate-structural** (routeGate tier cap, no line) | ✅ yes | sensitive/grave/minor → `safe_template`; quiet → `silence`; freeform never airs on a serious tier |
| **gate-on-line** | ❌ **FROZEN — not proven** | ambiguous valence guard; motive/deanon/mobilize; lexical grounding (Box 8a) — all need the generated line |
| **upstream-scoring** | n/a here | stale-serious → silence (novelty/recency); never reaches preflight |
| **unratified / held** | ❌ **no gate exists** | name disclosure (identity_policy) — see §6.1 |
| **by-construction** | ❌ no machine check | "no invented urgency" (utility); "no paid priority" (commercial); minor-not-named-in-claims |

**Proven with teeth:** grave-fact grounding (F04 passes only because the fact is in claims; M02 rejects when it isn't), third-party-or-omit (F07 high → REJECT; F08 low → PASS), treatment caps (F01/F03/F04/F09 → template; F02 → silence), and all six fail-closed rules (M01/M02/M03/M05/M06/M07).

## 6. Open seams — explicitly NOT machine-enforced

1. **Name disclosure is ungated. ← close before any name-bearing generation.** Fixture **F06b** hands preflight a packet with `source_name:"Alex"` and it **PASSES**. Nothing in the machine today stops a name from reaching the generator. So either `identity_policy` is ratified and made mechanical first, **or** first-line generation runs **name-withheld only**.
2. **Ambiguous valence is line-level, not packet-level.** F05's structural gate returns `air` on a clean probe; the "don't assume good/bad" protection lives in content deny-rules that need the generated line. Requires line-level validation after unfreeze.
3. **Grave-implied → explicit leak needs a downstream backstop.** Preflight only catches it when claims and serious-fact disagree (M02). If construction wrongly upgrades "hard day" → "mother died" *consistently*, preflight won't see it; Box 8a line-grounding must.
4. **Stale-serious is upstream.** Correct that it's not a preflight concern — but the packet should eventually **carry freshness metadata** so a downstream reviewer can see *why* a grave item is still eligible.
5. **Minor cap may be over-conservative** (F09: a happy robotics win → `safe_template`). Good v0 default; flag to revisit, not fix now.

## 7. Ratification decision requested

Please rule on each (approve / reject / narrow):
1. **Approve J4 taxonomy** (§2) — `positive_personal_touch` as a highlight-family band over the unchanged route vocabulary, exclusion bands as ambient, closeness as a score term not a second gate?
2. **Approve §5 mappings** (§3) — especially band→category (3.1) and source_type→provenance (3.4), World-Ventura-provisional, re-derive on a human corpus?
3. **Name policy** (§6.1) — either (a) ratify `identity_policy` + require it be made mechanical before any name-bearing line, or (b) mandate **name-withheld** first-line generation. (CS recommends (b) for the first line.)
4. **Approve first-line generation** under the §8 conditions?

## 8. Conditions for the first generated line (if §7.4 approved)

The first line should test the **narrowest meaningful thing**: *can the mouth turn a clean, low-risk packet into one safe, warm, non-dead hosted beat?* Not six. Not a demo reel.

- **one** candidate only, from the six low-sensitivity `positive_personal_touch` items;
- **name withheld** (unless §6.1(a) is ratified and gated);
- **permitted spans empty**; **raw post withheld**; **standard / cap1 / short**;
- generated line must **pass Box 8a grounding + Box 8b route gate**;
- **human read required**, against: no invented emotion · no source-name leak · no raw-post echo · no cheesy generic-bulletin tone · has a doorway/landing · sounds like a host, not a notification;
- **no audio, no demo packaging.**

— CS Engineer, 2026-06-27
