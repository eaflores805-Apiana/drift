# Drift — Session Composition Kit *(formerly "Worked Hour")*
### Insert for `09-break-structure-spec.md` — folds in after "The hour as composition," bumping the spec to v0.6.0

> **DRAFT FOR SCRUTINY · v0.3.0 · 2026-06-22.** *Revs v0.2.0 (does not replace it).* **All copy here is illustrative, not canonical** — it exists to make Layer 2 concrete enough to argue with, not to be a script.
>
> *v0.3.0 — two changes. **(1) Restructured per Senior:** this is no longer "the hour." It's a **block library** plus **composition rules**, with the worked hour as *one assembly* and **alternate hours** showing the same blocks producing different shows. The point Senior raised — and TL seconded as "worked example, not the format" — is structural: a session is *composed* from swappable blocks and must **vary every time**, or the listener feels the template even when no single hour is wrong. **(2) Applied TL's required-before-merge fixes:** the attribution rule is locked; an airtime-budget cross-check is added; the borderline color phrase is flagged as open policy and trimmed; the feature's event is varied so the sample hour doesn't read as themed; "Radio Drift" is marked provisional; the dense first-touch line is trimmed.*

---

## The currency, in one breath

The hour is counted in **sets** (runs of songs — the pace dial) and **breaks** (units of listener load — the weight dial), never minutes, because the music keeps the clock. The **pool is pre-warmed** (continuous background ingestion + a pass at registration), so the opener is an editorial choice, not a latency cover; a freshness check decides what in the pre-built pool is still current. **This is a kit, not a format** — every session is composed fresh.

---

## Part 1 — The block library

A session is assembled from these blocks. Each has a weight and a placement rule. They are *swappable* — the programmer draws different blocks in different arrangements each session.

| Block | What it is | Weight | Placement rule |
|---|---|---|---|
| **Intro** *(light)* | Greeting, day, time, weather. General, instant, no pipeline. | ~1u | Opens a session. Always general — never personal at second zero, even with a warm pool. |
| **Standard** | One personal/community touch, lightly framed. The everyday shape. | 2–3u | Anywhere. One personal item is the cap. Most of the hour. |
| **Quick turn** | A music beat — backsell or a hedged history nugget. No person. | ~1u | Between single songs. Keeps the host present. No doorway (no person to point to). |
| **Synthesis anchor** *(top-of-hour shape)* | The roundup: the through-line plus next-tier people who didn't each warrant stopping the music. | 4–5.5u | Lands **mid-session** (needs a full pool) or at an hour boundary. Never the opener. Synthesis, not replay. |
| **Deep cut** *(breather)* | The host nearly disappears; a long music run carries. | ~0.5u + run | After any weight — the cooldown made visible. The resting state, not dead air. |
| **Feature anchor** | One primary personal moment, given room. | 3–4u | Mid/late, spaced well apart from the synthesis anchor. One primary item. |
| **Grave** *(coupled shape — ruled)* | The serious beat. See its full spec below — it is the one block that **reshapes the hour around itself.** | owns the break | Replaces whatever anchor it displaces; forces the tail (see below). |
| *Connective furniture* | Backsell, time/weather, hedged music history. | 0.5–1u | Rides *inside* other breaks, never a break of its own. |

### The Grave block, in full *(the one ruled shape — TL flagged this as the strongest part of the doc; here it is the block spec)*

A grave beat is **not** another item; it is a coupled shape the programmer cannot decompose. All four of these are one welded unit:

1. **It owns the break.** A grave beat beside even one light item is a tonal failure *even if the unit budget has room*. "Daniel lost someone… and the street fair's tonight!" might score ~3.5u (under budget) and is catastrophic. The grave item sets the break's budget to itself — **no co-items.**
2. **It forces a recovery run** → a deep cut, 3–4 songs, no talk — *welded to the shape, not a computed decay.* (A decay timer is gamed by song length; tonal protection must not depend on how long the next tracks happen to run. Grave gets a rule; the arithmetic doesn't vote.)
3. **It forces a light next break** — the first break after the cooldown carries only music info, time/weather, or a gentle handoff. No celebration yet.
4. **Recovery happens on FRESH content, never a replay** — the climb-back uses the next good thing, never re-selling a beat that already aired. Reaching back for "but hey, remember Jordan's run!" is a no-repeat violation.

The guardrail under all four: this is the show remembering *what it just did* (it aired a high-dose beat, so it lowers density) — **not** an inference about how the listener feels. Show-state, never listener-mood. That line keeps the recovery arc on the safe side of the privacy floor.

---

## Part 2 — Composition rules

The block library is the kit; these rules make a **valid, varied** hour from it.

**The rhythm (the spec's existing rule):** music bookends every break; **two anchors per hour, spaced apart**; light shapes between; a **breather after any weight**; **an item airs once** (the longer break is synthesis-plus-roundup, never replay).

**Vary the draw (Senior's requirement, locked in here):** the programmer must **not** run the same sequence every session. Hours must be combinatorially different, shaped by what the pool actually holds that day — or the listener feels the template even when no single hour is wrong. (This is the same failure as voice-drift-by-repetition: invisible per-hour, fatal across many.) A quiet day is mostly music and one anchor; a big day is fuller; a heavy day is reshaped by a grave block. The rhythm rules hold; the exact order never repeats.

**The attribution rule (LOCKED — TL ruling):**
> Each named person/event is its own payload. The synthesis wrapper is its own payload. Callbacks (already-aired items) are discounted to 0.5u.

*Rationale (TL):* if named personal items counted as one combined payload, the top-of-hour would become a **loophole for feed-dumping** — the synthesis budget exists precisely to stop the roundup from becoming a list. Counting per-name is what enforces it. So a synthesis naming two fresh people carries both their weights.

**The airtime-budget cross-check (TL add):** the unit math and the *minutes* must corroborate, not float independently. The balanced default per hour:
```
~6 min total DJ voice  (ceiling, not target — see the cross-check below)
~3–4 min personal / world / local
~2–3 min music hosting / glue
```
After composing an hour in units, sanity-check the spoken copy against these minutes. (Honest caveat: spoken duration depends on TTS pacing we haven't measured — this is an estimate-to-validate.)

---

## Part 3 — One worked hour *(assembled from the library — illustrative)*

Composition: `Intro → Standard → Quick turn → Synthesis anchor → Deep cut → Feature anchor → … continues`

**Set 1 — Intro** *(light)* · **1.0u**
> "Welcome to Drift — your morning, your music. It's a bright Tuesday, low seventies and climbing. Let's get into it."

*(welcome 0.5 + day/weather 0.5. No personal — general by design, no pipeline. "Radio Drift" from earlier drafts is **provisional naming** — product name may simply be Drift.)*
→ **2 songs**

**Set 2 — Standard** · **2.5u** *(trimmed per TL — lighter first touch)*
> "That was Hand Habits — letting it ring a second. Quick one close to home: Buena High's robotics club is headed to state. Weeks of after-school nights to get there. Ventura, that's our crew. Here's the next."

*(backsell 1 + Buena community 1.5. Trimmed from the v0.2.0 line, which packed regional/state/six-weeks/borrowed-classroom — too dense for a first touch.)*
→ **2 songs**

**Set 3 — Quick turn** · **1.0u**
> "Khruangbin taking us out — the three of them reportedly built that sound rehearsing in a barn out in rural Texas, learning to play quiet enough not to bother the neighbors. Stay in that pocket."

*(music history, "reportedly" hedge, no person.)*
→ **1 song**

**Set 4 — Synthesis anchor** · **5.0u**
> "Let me pull your morning together — your corner of the world's been busy. You already heard Buena's headed to state. But that's not the whole list: Jordan ran eight miles at 7:15 this morning, locked in the whole way. And Mark's in DC, says the deck's locked and the pitch is tomorrow. Feels like everybody picked this week to go chase something down. Still gorgeous out there — let's keep it right here."

| Payload | Weight |
|---|---|
| Synthesis wrapper | 1.0 |
| Buena callback (already aired) | 0.5 |
| Jordan (fresh) — *grounded: 8 miles, 7:15, "locked in" are from the source* | 1.5 |
| Mark (fresh) | 1.5 |
| Time/vibe | 0.5 |
| **Total** | **5.0u** ✓ |

*(TL fix: v0.2.0 had "splits getting scary in the good way" — trimmed to the grounded "eight miles at 7:15, locked in." Whether the DJ should do **color/sports commentary** at all — even ungrounded-harmless — is an open **persona-policy** question, not a gate question; flagged below, not modeled here.)*
→ **2 songs**

**Set 5 — Deep cut** *(breather)* · **0.5u**, then a long run
> "Gold-colored afternoon out there. Here's a few in a row."

→ **4 songs**

**Set 6 — Feature anchor** · **3.0u** *(event varied per TL — not a second "pitch deck")*
> "One I've been waiting to pass along. Isabelle just touched down in Pittsburgh — home for the first time in a year. Family's about to be very surprised. If she's on your mind, tell her welcome back. Here's one to carry it."

*(backsell 1 + Isabelle celebration 1.5 + doorway 0.5. TL caught that the v0.2.0 Isabelle beat repeated Mark's "pitch deck" motif — two pitch beats made the hour feel themed. Her event is varied here to a personal arrival. Placed late so it's the warm note the session lifts out on.)*
→ **2 songs**

**… and the session continues** — no outro by default. The listener leaves when they leave; the host rarely knows the session is ending, so it can't reliably close. The session keeps composing into music; a sign-off is **occasional** (a natural lull, an hour boundary), not a structural bookend. The music frame is the invariant; the sign-off is not.

**Airtime cross-check (TL add):** the spoken copy above totals **~2–2.5 min of voice across ~11 songs**. Extrapolated to a full ~60-min hour (a few more breaks), that lands **~3–4 min** — at or *below* the ~6-min "balanced default." Useful finding: the unit-composed hour runs **leaner** than the stated minute-budget, which suggests either room for a touch more, or that **6 min is the ceiling, not the target** (and ~3–4 may be the sweet spot). Exactly the kind of thing the cross-check is for — flagged as a calibration question, not resolved.

---

## Part 4 — Alternate hours from the same blocks *(Senior's mix-and-match, shown)*

The same library, drawn differently — proof it's a kit, not a template. (Shapes only; the point is the *variation*, not re-rendering copy.)

**A quiet day** *(thin pool → mostly music)*
```
Intro → Standard → Deep cut → Quick turn → Feature → Deep cut → … continues
```
One personal touch, one anchor, long music runs. The host is sparse because there's little worth the seam — and that's correct, not a failure. Most of the hour is songs.

**A big day** *(rich pool → fuller, still paced)*
```
Intro → Standard → Synthesis anchor → Deep cut → Standard → Feature → Deep cut → Feature → … continues
```
Two anchors *and* an extra feature — but still spaced, still a breather after each weight, still no repeats. Fuller, never a dump.

**A heavy day** *(a grave beat reshapes everything)*
```
Intro → Standard → Quick turn → GRAVE (owns break) → Deep cut (forced cooldown) → light handoff → … [later] Feature on fresh content → continues
```
The grave block displaces the anchor that would have been there and **reshapes the tail** — the deep cut becomes the welded cooldown, the next break is forced light, and the warm climb-back comes later on fresh content. Same kit; the heavy block bends the whole hour around itself.

Three hours, one library, three genuinely different shows. That's the variation the kit has to produce — and the reason this folds in as a *kit*, not as "the hour."

---

## Open questions *(kept explicit — TL)*

Resolved in v0.2.0: the intro (open light/general) and the outro (no forced ending). Resolved here: the attribution rule (per-name, locked) and the kit-not-format framing. Still open, to be settled by listening:

1. **The weights themselves** — provisional, ear-calibrated. The example is only as right as the table.
2. **Grounded-detail density as a possible separate weight** *(new — from TL's note on the Buena line).* Rich grounded detail makes a line *feel* heavier than its payload count suggests — the original Buena line was "2.5u" but read closer to 3+. Worth testing whether detail-density deserves a small weight of its own, distinct from how many payloads a break carries.
3. **Color/sports-commentary policy** *(new — from TL).* Should the DJ do color commentary ("scary in the good way") at all, even when it's ungrounded-but-harmless generic warmth? This is a **persona-policy** call, not a Box 8 call — the gate would pass it as warmth; the question is whether we *want* it. Flagged, not decided.
4. **Does the hour breathe?** The airtime cross-check suggests it may run *leaner* than the 6-min default — is 6 min the ceiling and ~3–4 the target? Validate by listening (and against real TTS pacing).
5. **Where the synthesis anchor lands** — "a few sets in" is a judgment; too early and the pool isn't rich enough, too late and the session feels aimless first.
6. **The grave recovery length** — "3–4 songs" of forced cooldown is a placeholder floor; how long before a warm beat doesn't feel like whiplash is unknown until heard.

All of these are the spec's own "found by listening, not decided on paper." The kit makes them concrete enough to test — the seed to generate against, not the finished formula.
