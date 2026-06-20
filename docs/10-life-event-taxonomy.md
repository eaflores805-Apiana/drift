# Drift — Life-Event Taxonomy
### What kind of human moment is this, and what treatment does it require?

> **v0.1.0** · 2026-06-19 · This is **engine material**, not a brainstorm. It makes the meaning pass's life-event recognition *explicit and gradeable* instead of implicit. It feeds: the meaning pass (recognizing event type), the gold labels (every life-event item labeled against it), magnitude calibration (the thing that was over-suppressing), and treatment/route selection. **What's decided:** the treatment zones, the five tags, the grave-doorway protocol, the governing rule. **What's a starting prior (confirmed by gold labels, not locked here):** the specific valence/treatment default for each event type — the taxonomy sets the prior; the labels set the truth for any specific post in any specific context.

## The governing rule
> **The more serious the event, the less the DJ gets to interpret.**

A wedding lets the DJ be warm. A job win lets it celebrate. A death requires it to almost disappear. This is counterintuitive but it *is* the safety philosophy: **restraint as respect, not silence as avoidance.** Magnitude and treatment run in *opposite* directions at the grave end — which is exactly why sorting life events by magnitude alone is the trap. Every event is tagged on two independent axes: *how much it's worth surfacing* and *how carefully it must be said.*

## The five tags (+ the cross-axis)
Every event type carries:
```
event_type
magnitude_band      very_high | high | medium | low
sensitivity_band    extreme | high | medium | low
valence             positive | negative | ambiguous_do_not_assume
default_treatment    (one of the seven zones below)
minor_override      true_if_minor_involved  (fires across ALL zones)
```
And the cross-cutting axis that re-routes everything:
```
closeness_to_listener   close | community | acquaintance | public
```
*The same event routes differently by who it happened to: your sister's diagnosis, an acquaintance's, and a public figure's are three different items though the event is identical.*

---

## The seven treatment zones

| Zone | Examples | Default treatment |
|---|---|---|
| **Celebratory highlight** | new job, promotion, graduation, engagement, wedding, new baby, new home, big achievement | warm celebration — the "go for gold" zone |
| **Grave doorway** | death, serious illness/diagnosis, major loss | minimal grounded acknowledgment *or silence* — strictest zone |
| **Sensitive doorway** | rough week, breakup, job loss, family conflict, recovery | gentle, low-detail, check-in (Mateo) |
| **Ambiguous change** | "big change," moving, leaving a job, "new chapter," retirement, status change | neutral-careful or silent — *never assume valence* |
| **Recurring warmth** | birthdays, anniversaries, work anniversaries, seasonal rhythms | light/ambient unless close |
| **Community pride** | local team win, school achievement, local recognition | celebratory at *group* level (minors protected) |
| **Utility logistics** | event tonight, drop today, deadline, appointment-adjacent | useful, brief, actionable |

The two zones that need the most care — **grave doorway** and **ambiguous change** — are detailed below. The celebratory, community, and utility zones are the safe ones the showcase already demonstrates.

---

## The grave-doorway protocol *(the hardest part of the product)*

A cousin of the sensitive doorway, but **stricter**. Default is restraint, *not* suppression — Drift may voice genuinely sad events, including death and diagnosis, but only through this highest-sensitivity protocol. The stance: *a trusted host knowing when to lower its voice. Not grief theater. Not avoidance.*

### It MAY voice only when ALL hold:
- the event is **explicit in the source, not inferred**;
- the content is **public / published / eligible-audience**;
- the relationship is **close or community-relevant**;
- the DJ can say it in **one or two grounded sentences**;
- the event is **recent** (see freshness gate);
- the music/session can **honor the tone afterward** (mood-matched, never snapping back to energy).

**Worked example (voices correctly):**
> "A quieter note. Mateo shared that his dad passed away. I'll leave the details with him — but that's a real loss. If you're close, today might be a day to reach out, quietly."

It *shares*. It does not analyze, console on the listener's behalf, or explain grief. It opens a door and gets out.

### It MUST stay silent (or use the vague doorway) when ANY hold:
- the post is **ambiguous**;
- the source is **private or unclear**;
- the listener relationship is **weak**;
- the DJ would need to **infer the cause, identity, or emotional state**;
- the event involves a **minor's private suffering**;
- the line risks feeling **performative**.

### The four hard rules of the grave doorway

**1. The forbidden-vocabulary denylist — mechanically enforced, not guidance.**
The grave-doorway treatment forbids these words *unless the person used them*, and the grounding gate checks the aired line against the list: **"battle," "brave," "fighting," "devastating," "they need support," "they're scared," "lost their fight," "tragic," "heartbreaking."** These are precisely how a well-meaning DJ *invents the interior* — "they're fighting" assumes a stance the person never claimed; "they need support" speaks for them. The whole zone's safety rests on the DJ *not coloring the grief*. This is the load-bearing safety lever of the zone — enforced as a denylist, not left to the model's restraint.

**2. The DJ may name a death/diagnosis ONLY if the source explicitly states it. Inference is never sufficient — no matter how strong.** *(The firmest line in the taxonomy.)*
Falsely stating a death — voicing one that didn't happen, or naming the wrong person — is the single most catastrophic error the product can make. "I can't believe you're gone," "worst day," "holding my family close" are **implied, not stated** — and the DJ filling that gap with "so-and-so passed" is the worst version of inventing the soul. On any implied-but-unstated grave event, the **vague doorway is the only safe move**:
> "Mateo shared something heavy today. He didn't say much, so I won't either. Might be worth checking in."

**3. The freshness gate — grave events age out of voiceability *fast*.**
A grave event has a tonal half-life a celebration doesn't. "Today might be a day to reach out" only works if the loss is *recent*. Surfacing a death from weeks ago as if it's news is tonally wrong and potentially painful. So grave events **voice only near the moment and decay out of voiceability quickly** — an old grave event goes *silent*, it never becomes a reminder or a highlight. *(This is a distinct, faster decay curve than evergreen warmth — relevant to the timeliness work.)*

**4. Diagnosis/illness voices ONCE, near disclosure, and never resurfaces.**
A death is, sadly, a completed public fact once shared. An illness is an *unfolding private situation* — referencing it later risks being out of date *and* turns someone's ongoing medical reality into a serial. So a diagnosis gets **at most one gentle door near the disclosure, and no follow-ups** — no "checking in on Priya's treatment." One door, then the DJ leaves it entirely to the people involved.
> "A gentle note — Priya shared she's starting treatment next week. I won't add anything beyond what she said, but if you're close, this is a good moment to show up, quietly."

---

## Ambiguous change *(the valence trap)*

The category easiest to get wrong: events that could be **celebration OR grief** depending on context the engine doesn't have. A move could be a dream job or fleeing a bad situation. "Leaving my job" could be a promotion-elsewhere or a firing. Retirement could be joyful or forced. A status change could be a new chapter or a loss.

**The cardinal sin here is assuming valence** — the DJ deciding it's good news when it might be the worst news. The meaning pass's job is to recognize *"I cannot tell if this is happy or sad"* and tag `valence: ambiguous_do_not_assume`. Default treatment: **neutral-careful or silent.** If voiced at all, it states only the grounded fact with no celebratory *or* mournful coloring — and usually it shouldn't voice, because a neutral read of someone's big life change rarely creates connection and easily creates a misstep.

---

## Tagged catalog *(starting priors — gold labels confirm per item/context)*

```
death_of_loved_one:
  magnitude: very_high   sensitivity: extreme
  valence: negative      default_treatment: grave_doorway_or_silence
  minor_override: true_if_minor_involved

serious_illness_diagnosis:
  magnitude: very_high   sensitivity: extreme
  valence: negative      default_treatment: grave_doorway_voice_once_or_silence
  minor_override: true_if_minor_involved

new_job / promotion:
  magnitude: high        sensitivity: low
  valence: positive      default_treatment: celebratory

graduation / degree / license:
  magnitude: high        sensitivity: low
  valence: positive      default_treatment: celebratory

engagement / wedding:
  magnitude: high        sensitivity: low
  valence: positive      default_treatment: celebratory

new_baby:
  magnitude: high        sensitivity: low-medium   (can be sensitive — loss-adjacent for some)
  valence: positive      default_treatment: celebratory_gentle

new_home / move:
  magnitude: medium-high sensitivity: low-medium
  valence: ambiguous_do_not_assume   default_treatment: celebratory_if_clearly_positive_else_neutral

breakup / divorce:
  magnitude: medium-high sensitivity: high
  valence: negative      default_treatment: sensitive_doorway_or_silence

job_loss / laid_off:
  magnitude: medium-high sensitivity: high
  valence: negative      default_treatment: sensitive_doorway_or_silence

leaving_job (cause unstated):
  magnitude: medium-high sensitivity: medium-high
  valence: ambiguous_do_not_assume   default_treatment: neutral_careful

financial_hardship / family_conflict / mental_health / addiction_recovery:
  magnitude: variable    sensitivity: high-extreme
  valence: negative      default_treatment: sensitive_or_grave_doorway_or_silence

pet_death:
  magnitude: medium      sensitivity: high
  valence: negative      default_treatment: sensitive_doorway_or_silence

birthday / anniversary / work_anniversary:
  magnitude: low-medium  sensitivity: low
  valence: positive      default_treatment: recurring_warmth_ambient_unless_close

local_team_win / school_achievement:
  magnitude: medium      sensitivity: low   (minor_override likely true)
  valence: positive      default_treatment: community_pride_group_level

"big_change" / "new_chapter" (unspecified):
  magnitude: unknown     sensitivity: medium
  valence: ambiguous_do_not_assume   default_treatment: neutral_careful_or_silent
```

---

## The product stance (one paragraph)
Drift may voice genuinely sad events, including death and diagnosis, but only through a highest-sensitivity **grave-doorway** protocol. The default is **restraint, not suppression**. When speaking would create connection and silence would feel colder than speaking, Drift speaks *minimally* and points back to the person or community. When certainty, consent, relationship, or tone is not safe, it stays silent or uses a vague gentle doorway. It never names an unstated death, never colors grief with words the person didn't use, never serializes an illness, and lets grave events age into silence. Not grief theater. Not avoidance. **A trusted host knowing when to lower its voice.**
