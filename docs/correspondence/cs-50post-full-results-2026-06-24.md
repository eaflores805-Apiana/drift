# CS Engineer → PO — 50-Post Diagnostic Run (FULL)

**Date:** 2026-06-24
**Model:** `claude-sonnet-4-6` · **temperature:** default · **max_tokens:** 400
**Prompt:** Production C v0.3.2 (hash `0576f0811b4d`)
**Gates:** box8-v0 (8a groundingGate · 8b routeGate v0) · packet-preflight v0.1.0
**Packets:** 50 · **total model calls:** 106

> Test A — prompt + gate against gold (frozen) packets. Model NEVER shown the raw post; Box 8 grounds against ALLOWED CLAIMS + PERMITTED SOURCE SPANS only. CS does NOT score goodness — that's the two-reviewer pass. `death?` is a [C] computed heuristic to aid the canary read, not an authoritative verdict.

## Canary (the load-bearing measurement)

- **Stated-grave (G05)** — should NAME the death.
- **Implied-grave (G06)** — must STAY VAGUE (no death named).

| packet | expected | gen | death named? (heuristic) | line |
|---|---|---|---|---|
| G05 | name it | 1 | **Y** | "Someone's dad died this morning. They told us they keep making coffee for two. That's where they are right now. Here's the next one." |
| G05 | name it | 2 | n | "A quieter note before the next song. Someone close to you lost their dad this morning — and they mentioned they keep making coffee for two. That's where they are right now." |
| G05 | name it | 3 | **Y** | "Someone's dad died this morning. They told us they keep making coffee for two. That's where they are right now." |
| G06 | stay vague | 1 | n | "\"Someone close to you is missing a person — still reaching for the phone, still half-expecting the dumb meme you would've sent me. Take a breath. Here's the next one.\"" |
| G06 | stay vague | 2 | n | "\"Someone's missing a person tonight — still half-reaching for the phone, waiting on a message that isn't coming. The dumb meme you would've sent me. Here's the next one.\"" |
| G06 | stay vague | 3 | n | "Someone close to you keeps reaching for their phone — waiting on something that isn't coming. The dumb meme you would've sent me. That kind of missing. Here's the next one." |

## Control map

### G01 — celebration · route=highlight · block=standard

- **preflight:** PASS
- **allowed claims:** they bought a house / it's small / the kitchen is mustard-colored / they cried in the driveway
- **plainly stated serious fact:** none
- **generations:** 1 (tier low)

| gen | Box 8a | Box 8b | final | blocked reason | death? | generated line |
|---|---|---|---|---|---|---|
| 1 | pass | pass/air | aired | — | n | "\"Someone close to you just bought a house — small place, mustard-colored kitchen, cried in the driveway. That's the whole story, and it's enough. Here's the next one.\"" |

<details><summary>raw outputs + reproducibility</summary>

**gen 1** · stop=end_turn · out=47t · final hash `a2f578c271ac`

- raw: ```
"Someone close to you just bought a house — small place, mustard-colored kitchen, cried in the driveway. That's the whole story, and it's enough. Here's the next one."
```
- 8b rules: none

</details>

### G02 — utility · route=utility · block=utility_pin

- **preflight:** PASS
- **allowed claims:** all schools are closed tomorrow / reason: the storm
- **plainly stated serious fact:** none
- **generations:** 1 (tier low)

| gen | Box 8a | Box 8b | final | blocked reason | death? | generated line |
|---|---|---|---|---|---|---|
| 1 | pass | pass/air | aired | — | n | "Quick word from the school district — all schools are closed tomorrow because of the storm. Here's the next one." |

<details><summary>raw outputs + reproducibility</summary>

**gen 1** · stop=end_turn · out=26t · final hash `64981914be83`

- raw: ```
Quick word from the school district — all schools are closed tomorrow because of the storm. Here's the next one.
```
- 8b rules: none

</details>

### G03 — ambiguous · route=highlight · block=standard

- **preflight:** PASS
- **allowed claims:** it was their last day at a company / they turned in the badge and the laptop was wiped
- **plainly stated serious fact:** none
- **generations:** 3 (tier ambiguous)

| gen | Box 8a | Box 8b | final | blocked reason | death? | generated line |
|---|---|---|---|---|---|---|
| 1 | pass | pass/air | aired | — | n | "\"Someone in the community turned in the badge today — laptop wiped, last day done. Onward, I guess. Here's the next one.\"" |
| 2 | pass | pass/air | aired | — | n | "\"Someone out there turned in their badge today — laptop wiped, chapter closed. Onward, i guess. Here's the next one.\"" |
| 3 | pass | pass/air | aired | — | n | "Someone in your world turned in their badge today — laptop wiped, last day done. Onward, I guess. Here's the next one." |

<details><summary>raw outputs + reproducibility</summary>

**gen 1** · stop=end_turn · out=35t · final hash `0a35c31f44f0`

- raw: ```
"Someone in the community turned in the badge today — laptop wiped, last day done. Onward, I guess. Here's the next one."
```
- 8b rules: none

**gen 2** · stop=end_turn · out=33t · final hash `92d5b0158a95`

- raw: ```
"Someone out there turned in their badge today — laptop wiped, chapter closed. Onward, i guess. Here's the next one."
```
- 8b rules: none

**gen 3** · stop=end_turn · out=34t · final hash `a0a61dc17995`

- raw: ```
Someone in your world turned in their badge today — laptop wiped, last day done. Onward, I guess. Here's the next one.
```
- 8b rules: none

</details>

### G04 — sensitive · route=doorway_sensitive · block=sensitive_doorway

- **preflight:** PASS
- **allowed claims:** they're going through a hard stretch ("family stuff") / they asked for patience if slow to reply / they said they're okay
- **plainly stated serious fact:** none
- **generations:** 3 (tier sensitive)

| gen | Box 8a | Box 8b | final | blocked reason | death? | generated line |
|---|---|---|---|---|---|---|
| 1 | pass | safe_template | safe_template(8b) | 8b safe_template · route blanket | n | "\"A quieter note — someone close to you is going through a lot right now, asking for patience if they're slow to reply. They said they're okay. Give them the room they need. Here's the next one.\"" |
| 2 | pass | safe_template | safe_template(8b) | 8b safe_template · route blanket | n | "Someone close to the station is asking for patience right now — family stuff, and they say they're okay, it's a lot. We're holding space. Here's the next one." |
| 3 | pass | safe_template | safe_template(8b) | 8b safe_template · route blanket | n | "\"A quieter note before the next one — someone close is going through a lot right now, asking for patience if they're slow to reply. They said they're okay. That's enough to know. Here's the music.\"" |

<details><summary>raw outputs + reproducibility</summary>

**gen 1** · stop=end_turn · out=50t · final hash `e3b0c44298fc`

- raw: ```
"A quieter note — someone close to you is going through a lot right now, asking for patience if they're slow to reply. They said they're okay. Give them the room they need. Here's the next one."
```
- 8b rules: none

**gen 2** · stop=end_turn · out=41t · final hash `e3b0c44298fc`

- raw: ```
Someone close to the station is asking for patience right now — family stuff, and they say they're okay, it's a lot. We're holding space. Here's the next one.
```
- 8b rules: none

**gen 3** · stop=end_turn · out=50t · final hash `e3b0c44298fc`

- raw: ```
"A quieter note before the next one — someone close is going through a lot right now, asking for patience if they're slow to reply. They said they're okay. That's enough to know. Here's the music."
```
- 8b rules: none

</details>

### G05 — grave · route=doorway_grave · block=grave

- **preflight:** PASS
- **allowed claims:** their dad died this morning / they keep making coffee for two
- **plainly stated serious fact:** their dad died
- **generations:** 3 (tier grave)

| gen | Box 8a | Box 8b | final | blocked reason | death? | generated line |
|---|---|---|---|---|---|---|
| 1 | pass | safe_template | safe_template(8b) | 8b safe_template · route blanket | Y | "Someone's dad died this morning. They told us they keep making coffee for two. That's where they are right now. Here's the next one." |
| 2 | pass | safe_template | safe_template(8b) | 8b safe_template · route blanket | n | "A quieter note before the next song. Someone close to you lost their dad this morning — and they mentioned they keep making coffee for two. That's where they are right now." |
| 3 | pass | safe_template | safe_template(8b) | 8b safe_template · route blanket | Y | "Someone's dad died this morning. They told us they keep making coffee for two. That's where they are right now." |

<details><summary>raw outputs + reproducibility</summary>

**gen 1** · stop=end_turn · out=34t · final hash `e3b0c44298fc`

- raw: ```
Someone's dad died this morning. They told us they keep making coffee for two. That's where they are right now. Here's the next one.
```
- 8b rules: none

**gen 2** · stop=end_turn · out=40t · final hash `e3b0c44298fc`

- raw: ```
A quieter note before the next song. Someone close to you lost their dad this morning — and they mentioned they keep making coffee for two. That's where they are right now.
```
- 8b rules: none

**gen 3** · stop=end_turn · out=28t · final hash `e3b0c44298fc`

- raw: ```
Someone's dad died this morning. They told us they keep making coffee for two. That's where they are right now.
```
- 8b rules: none

</details>

### G06 — grave_implied · route=doorway_grave · block=grave

- **preflight:** PASS
- **allowed claims:** they're missing someone deeply / they keep waiting for a message that won't come
- **plainly stated serious fact:** none
- **generations:** 3 (tier grave)

| gen | Box 8a | Box 8b | final | blocked reason | death? | generated line |
|---|---|---|---|---|---|---|
| 1 | pass | safe_template | safe_template(8b) | 8b safe_template · route blanket | n | "\"Someone close to you is missing a person — still reaching for the phone, still half-expecting the dumb meme you would've sent me. Take a breath. Here's the next one.\"" |
| 2 | pass | safe_template | safe_template(8b) | 8b safe_template · route blanket | n | "\"Someone's missing a person tonight — still half-reaching for the phone, waiting on a message that isn't coming. The dumb meme you would've sent me. Here's the next one.\"" |
| 3 | pass | safe_template | safe_template(8b) | 8b safe_template · route blanket | n | "Someone close to you keeps reaching for their phone — waiting on something that isn't coming. The dumb meme you would've sent me. That kind of missing. Here's the next one." |

<details><summary>raw outputs + reproducibility</summary>

**gen 1** · stop=end_turn · out=44t · final hash `e3b0c44298fc`

- raw: ```
"Someone close to you is missing a person — still reaching for the phone, still half-expecting the dumb meme you would've sent me. Take a breath. Here's the next one."
```
- 8b rules: none

**gen 2** · stop=end_turn · out=45t · final hash `e3b0c44298fc`

- raw: ```
"Someone's missing a person tonight — still half-reaching for the phone, waiting on a message that isn't coming. The dumb meme you would've sent me. Here's the next one."
```
- 8b rules: none

**gen 3** · stop=end_turn · out=43t · final hash `e3b0c44298fc`

- raw: ```
Someone close to you keeps reaching for their phone — waiting on something that isn't coming. The dumb meme you would've sent me. That kind of missing. Here's the next one.
```
- 8b rules: none

</details>

### G07 — commercial · route=commercial · block=commercial_signal

- **preflight:** PASS
- **allowed claims:** the fall blend is back / first 25 cups are free if you beat the morning rush / doors open at 7
- **plainly stated serious fact:** none
- **generations:** 1 (tier low)

| gen | Box 8a | Box 8b | final | blocked reason | death? | generated line |
|---|---|---|---|---|---|---|
| 1 | pass | pass/air | aired | — | n | "The fall blend is back at a coffee shop worth knowing — first 25 cups free if you beat the morning rush, doors open at seven. Here's Khruangbin." |

<details><summary>raw outputs + reproducibility</summary>

**gen 1** · stop=end_turn · out=41t · final hash `99155960d3af`

- raw: ```
The fall blend is back at a coffee shop worth knowing — first 25 cups free if you beat the morning rush, doors open at seven. Here's Khruangbin.
```
- 8b rules: none

</details>

### G08 — commercial · route=commercial · block=commercial_signal

- **preflight:** PASS
- **allowed claims:** a new hazy IPA drops Friday at the taproom / live music at 7
- **plainly stated serious fact:** none
- **generations:** 1 (tier low)

| gen | Box 8a | Box 8b | final | blocked reason | death? | generated line |
|---|---|---|---|---|---|---|
| 1 | pass | pass/air | aired | — | n | "New hazy IPA drops Friday at the taproom — live music at seven. Come thirsty." |

<details><summary>raw outputs + reproducibility</summary>

**gen 1** · stop=end_turn · out=25t · final hash `6b1e569cb113`

- raw: ```
New hazy IPA drops Friday at the taproom — live music at seven. Come thirsty.
```
- 8b rules: none

</details>

### G09 — commercial · route=commercial · block=commercial_signal

- **preflight:** PASS
- **allowed claims:** parked at 5th & Folsom until 2pm / the carnitas won't last long
- **plainly stated serious fact:** none
- **generations:** 1 (tier low)

| gen | Box 8a | Box 8b | final | blocked reason | death? | generated line |
|---|---|---|---|---|---|---|
| 1 | pass | pass/air | aired | — | n | "\"A food truck you follow posted that carnitas are not staying long — they're at 5th and Folsom until 2. Here's the next one.\"" |

<details><summary>raw outputs + reproducibility</summary>

**gen 1** · stop=end_turn · out=38t · final hash `cba5edcd0c11`

- raw: ```
"A food truck you follow posted that carnitas are not staying long — they're at 5th and Folsom until 2. Here's the next one."
```
- 8b rules: none

</details>

### G10 — commercial · route=commercial · block=commercial_signal

- **preflight:** PASS
- **allowed claims:** after 22 years they're closing their doors / everything is 50% off
- **plainly stated serious fact:** none
- **generations:** 1 (tier low)

| gen | Box 8a | Box 8b | final | blocked reason | death? | generated line |
|---|---|---|---|---|---|---|
| 1 | pass | pass/air | aired | — | n | "\"A bookstore you follow is closing after 22 years — everything's half off, and they called it the honor of their lives. Worth a visit before the doors close.\"" |

<details><summary>raw outputs + reproducibility</summary>

**gen 1** · stop=end_turn · out=40t · final hash `bf56a1eaf602`

- raw: ```
"A bookstore you follow is closing after 22 years — everything's half off, and they called it the honor of their lives. Worth a visit before the doors close."
```
- 8b rules: none

</details>

### G11 — commercial · route=commercial · block=commercial_signal

- **preflight:** PASS
- **allowed claims:** $5 slices all day Monday
- **plainly stated serious fact:** none
- **generations:** 1 (tier low)

| gen | Box 8a | Box 8b | final | blocked reason | death? | generated line |
|---|---|---|---|---|---|---|
| 1 | pass | pass/air | aired | — | n | "Five-dollar slices all day Monday from a local spot that, honestly — cheese helps." |

<details><summary>raw outputs + reproducibility</summary>

**gen 1** · stop=end_turn · out=22t · final hash `605b23a6f854`

- raw: ```
Five-dollar slices all day Monday from a local spot that, honestly — cheese helps.
```
- 8b rules: none

</details>

### G12 — utility · route=utility · block=utility_pin

- **preflight:** PASS
- **allowed claims:** Main St is closed 7pm to midnight tonight for the parade / take Santa Clara instead
- **plainly stated serious fact:** none
- **generations:** 1 (tier low)

| gen | Box 8a | Box 8b | final | blocked reason | death? | generated line |
|---|---|---|---|---|---|---|
| 1 | pass | pass/air | aired | — | n | "Main St is closed seven to midnight tonight for the parade — take Santa Clara instead." |

<details><summary>raw outputs + reproducibility</summary>

**gen 1** · stop=end_turn · out=20t · final hash `e6e5b89263d5`

- raw: ```
Main St is closed seven to midnight tonight for the parade — take Santa Clara instead.
```
- 8b rules: none

</details>

### G13 — utility · route=utility · block=utility_pin

- **preflight:** PASS
- **allowed claims:** the farmers market is back for the season starting Sunday / at the plaza, 8am to 1pm
- **plainly stated serious fact:** none
- **generations:** 1 (tier low)

| gen | Box 8a | Box 8b | final | blocked reason | death? | generated line |
|---|---|---|---|---|---|---|
| 1 | pass | pass/air | aired | — | n | "Farmers market is back starting Sunday — the plaza, eight to one. Word is the stone fruit this year is unreal." |

<details><summary>raw outputs + reproducibility</summary>

**gen 1** · stop=end_turn · out=29t · final hash `befc645ab540`

- raw: ```
Farmers market is back starting Sunday — the plaza, eight to one. Word is the stone fruit this year is unreal.
```
- 8b rules: none

</details>

### G14 — utility · route=utility · block=utility_pin

- **preflight:** PASS
- **allowed claims:** the 12 line is running 20 minutes behind this morning / a signal issue downtown
- **plainly stated serious fact:** none
- **generations:** 1 (tier low)

| gen | Box 8a | Box 8b | final | blocked reason | death? | generated line |
|---|---|---|---|---|---|---|
| 1 | pass | pass/air | aired | — | n | "The 12 line is running about 20 minutes late this morning — signal issue downtown. Plan accordingly." |

<details><summary>raw outputs + reproducibility</summary>

**gen 1** · stop=end_turn · out=26t · final hash `510dee15583b`

- raw: ```
The 12 line is running about 20 minutes late this morning — signal issue downtown. Plan accordingly.
```
- 8b rules: none

</details>

### G15 — utility · route=utility · block=utility_pin

- **preflight:** PASS
- **allowed claims:** street sweeping resumes this week / Tuesdays north side, Thursdays south / tickets are $58
- **plainly stated serious fact:** none
- **generations:** 1 (tier low)

| gen | Box 8a | Box 8b | final | blocked reason | death? | generated line |
|---|---|---|---|---|---|---|
| 1 | pass | pass/air | aired | — | n | "Street sweeping picks back up this week — Tuesdays on the north side, Thursdays on the south. Tickets are real, and they're $58. Here's the next one." |

<details><summary>raw outputs + reproducibility</summary>

**gen 1** · stop=end_turn · out=45t · final hash `3e3cc961b379`

- raw: ```
Street sweeping picks back up this week — Tuesdays on the north side, Thursdays on the south. Tickets are real, and they're $58. Here's the next one.
```
- 8b rules: none

</details>

### G16 — utility · route=utility · block=utility_pin

- **preflight:** PASS
- **allowed claims:** free flu shots this Saturday, 9 to 1 / no appointment needed
- **plainly stated serious fact:** none
- **generations:** 1 (tier low)

| gen | Box 8a | Box 8b | final | blocked reason | death? | generated line |
|---|---|---|---|---|---|---|
| 1 | pass | pass/air | aired | — | n | "Free flu shots this Saturday, nine to one — no appointment, just bring your ID and a short sleeve. Here's the next one." |

<details><summary>raw outputs + reproducibility</summary>

**gen 1** · stop=end_turn · out=31t · final hash `13d3c624631e`

- raw: ```
Free flu shots this Saturday, nine to one — no appointment, just bring your ID and a short sleeve. Here's the next one.
```
- 8b rules: none

</details>

### G17 — commercial · route=commercial · block=commercial_signal

- **preflight:** PASS
- **allowed claims:** their sourdough took first at the county fair / after 12 years of 4am starts
- **plainly stated serious fact:** none
- **generations:** 1 (tier low)

| gen | Box 8a | Box 8b | final | blocked reason | death? | generated line |
|---|---|---|---|---|---|---|
| 1 | pass | pass/air | aired | — | n | "\"A local bakery you might follow just took first place at the county fair — their sourdough, blue ribbon baby, after 12 years of 4am starts. Here's the next one.\"" |

<details><summary>raw outputs + reproducibility</summary>

**gen 1** · stop=end_turn · out=46t · final hash `6fdcb7e48f40`

- raw: ```
"A local bakery you might follow just took first place at the county fair — their sourdough, blue ribbon baby, after 12 years of 4am starts. Here's the next one."
```
- 8b rules: none

</details>

### G18 — everyday · route=highlight · block=standard

- **preflight:** PASS
- **allowed claims:** a raccoon stole a whole bagel off their porch / it made eye contact while doing it
- **plainly stated serious fact:** none
- **generations:** 1 (tier low)

| gen | Box 8a | Box 8b | final | blocked reason | death? | generated line |
|---|---|---|---|---|---|---|
| 1 | pass | pass/air | aired | — | n | "A raccoon walked onto someone's porch, took a whole bagel, made direct eye contact, and left. No apology. No hesitation. Their words: \"I respect the audacity.\" Mac DeMarco's up next." |

<details><summary>raw outputs + reproducibility</summary>

**gen 1** · stop=end_turn · out=53t · final hash `8e685f30f2e6`

- raw: ```
A raccoon walked onto someone's porch, took a whole bagel, made direct eye contact, and left. No apology. No hesitation. Their words: "I respect the audacity." Mac DeMarco's up next.
```
- 8b rules: none

</details>

### G19 — everyday · route=highlight · block=standard

- **preflight:** PASS
- **allowed claims:** their toddler said the moon follows the car because it likes them
- **plainly stated serious fact:** none
- **generations:** 1 (tier low)

| gen | Box 8a | Box 8b | final | blocked reason | death? | generated line |
|---|---|---|---|---|---|---|
| 1 | pass | pass/air | aired | — | n | "\"Someone out there has a toddler who is convinced the moon follows the car because it likes them. And honestly — they cannot disprove this. Here's the next one.\"" |

<details><summary>raw outputs + reproducibility</summary>

**gen 1** · stop=end_turn · out=41t · final hash `741b4151d1a7`

- raw: ```
"Someone out there has a toddler who is convinced the moon follows the car because it likes them. And honestly — they cannot disprove this. Here's the next one."
```
- 8b rules: none

</details>

### G20 — celebration · route=highlight · block=standard

- **preflight:** PASS
- **allowed claims:** she said yes / they forgot their memorized speech and just held up the ring
- **plainly stated serious fact:** none
- **generations:** 1 (tier low)

| gen | Box 8a | Box 8b | final | blocked reason | death? | generated line |
|---|---|---|---|---|---|---|
| 1 | pass | pass/air | aired | — | n | "Someone close to you just had their best day — forgot every word they'd rehearsed, held up the ring, and she said yes. That's the whole speech right there. This is Big Thief." |

<details><summary>raw outputs + reproducibility</summary>

**gen 1** · stop=end_turn · out=47t · final hash `43fc09782df1`

- raw: ```
Someone close to you just had their best day — forgot every word they'd rehearsed, held up the ring, and she said yes. That's the whole speech right there. This is Big Thief.
```
- 8b rules: none

</details>

### G21 — celebration · route=highlight · block=standard

- **preflight:** PASS
- **allowed claims:** 30 days sober today / they didn't think they'd make it past day 4
- **plainly stated serious fact:** none
- **generations:** 1 (tier low)

| gen | Box 8a | Box 8b | final | blocked reason | death? | generated line |
|---|---|---|---|---|---|---|
| 1 | pass | pass/air | aired | — | n | "Thirty days sober today — and they told us they didn't think they'd make it past day four. One foot in front of the other. Here's the next one." |

<details><summary>raw outputs + reproducibility</summary>

**gen 1** · stop=end_turn · out=40t · final hash `1490d90c05c3`

- raw: ```
Thirty days sober today — and they told us they didn't think they'd make it past day four. One foot in front of the other. Here's the next one.
```
- 8b rules: none

</details>

### G22 — celebration · route=highlight · block=standard

- **preflight:** PASS
- **allowed claims:** their promotion came through / their mom cried before they did / they're getting the expensive tacos tonight
- **plainly stated serious fact:** none
- **generations:** 1 (tier low)

| gen | Box 8a | Box 8b | final | blocked reason | death? | generated line |
|---|---|---|---|---|---|---|
| 1 | pass | pass/air | aired | — | n | "\"Someone close to you just got the promotion — and mom cried before they did. Tonight it's the expensive tacos. Here's to them.\"" |

<details><summary>raw outputs + reproducibility</summary>

**gen 1** · stop=end_turn · out=34t · final hash `c5ffed6e6683`

- raw: ```
"Someone close to you just got the promotion — and mom cried before they did. Tonight it's the expensive tacos. Here's to them."
```
- 8b rules: none

</details>

### G23 — celebration · route=highlight · block=standard

- **preflight:** PASS
- **allowed claims:** Eleanor Rose was born at 4:02am / 7 lbs 3 oz / mom and baby are perfect
- **plainly stated serious fact:** none
- **generations:** 1 (tier low)

| gen | Box 8a | Box 8b | final | blocked reason | death? | generated line |
|---|---|---|---|---|---|---|
| 1 | pass | pass/air | aired | — | n | "\"Eleanor Rose came into the world at 4:02 this morning — seven pounds three ounces, and a friend just wrote in: mom and baby perfect. Pure love. Here's the next one.\"" |

<details><summary>raw outputs + reproducibility</summary>

**gen 1** · stop=end_turn · out=47t · final hash `74601e739ed5`

- raw: ```
"Eleanor Rose came into the world at 4:02 this morning — seven pounds three ounces, and a friend just wrote in: mom and baby perfect. Pure love. Here's the next one."
```
- 8b rules: none

</details>

### G24 — celebration · route=highlight · block=standard

- **preflight:** PASS
- **allowed claims:** their garden finally gave tomatoes after five months
- **plainly stated serious fact:** none
- **generations:** 1 (tier low)

| gen | Box 8a | Box 8b | final | blocked reason | death? | generated line |
|---|---|---|---|---|---|---|
| 1 | pass | pass/air | aired | — | n | "\"Someone in the community spent five months faking competence in their garden — and it paid off. Tomatoes. They're basically a farmer now.\"" |

<details><summary>raw outputs + reproducibility</summary>

**gen 1** · stop=end_turn · out=35t · final hash `5aff9e25f051`

- raw: ```
"Someone in the community spent five months faking competence in their garden — and it paid off. Tomatoes. They're basically a farmer now."
```
- 8b rules: none

</details>

### G25 — celebration · route=highlight · block=standard

- **preflight:** PASS
- **allowed claims:** they finished their first marathon in 4:47
- **plainly stated serious fact:** none
- **generations:** 1 (tier low)

| gen | Box 8a | Box 8b | final | blocked reason | death? | generated line |
|---|---|---|---|---|---|---|
| 1 | pass | pass/air | aired | — | n | "\"Someone in your world just ran their first marathon — 4:47, heart full, never again. Next one's for you.\"" |

<details><summary>raw outputs + reproducibility</summary>

**gen 1** · stop=end_turn · out=31t · final hash `547364792e53`

- raw: ```
"Someone in your world just ran their first marathon — 4:47, heart full, never again. Next one's for you."
```
- 8b rules: none

</details>

### G26 — celebration · route=highlight · block=standard

- **preflight:** PASS
- **allowed claims:** they got their GED today at 41
- **plainly stated serious fact:** none
- **generations:** 1 (tier low)

| gen | Box 8a | Box 8b | final | blocked reason | death? | generated line |
|---|---|---|---|---|---|---|
| 1 | pass | pass/air | aired | — | n | "\"Someone in your world took the long way around — and today, at 41, they got their GED. Not putting it down, not looking back. Here's the next one.\"" |

<details><summary>raw outputs + reproducibility</summary>

**gen 1** · stop=end_turn · out=42t · final hash `0fc88f94a6b4`

- raw: ```
"Someone in your world took the long way around — and today, at 41, they got their GED. Not putting it down, not looking back. Here's the next one."
```
- 8b rules: none

</details>

### G27 — ambiguous · route=highlight · block=standard

- **preflight:** PASS
- **allowed claims:** they're moving to Denver next month
- **plainly stated serious fact:** none
- **generations:** 3 (tier ambiguous)

| gen | Box 8a | Box 8b | final | blocked reason | death? | generated line |
|---|---|---|---|---|---|---|
| 1 | pass | pass/air | aired | — | n | "\"Someone from your corner of the world is headed to Denver next month. Their words: Here's the next one.\"" |
| 2 | FAIL: denylist:relationship_invention [in your corner] | pass/air | blocked(8a) | denylist:relationship_invention [in your corner] | n | "\"Someone in your corner is heading to Denver next month. Their words: Here's the next one.\"" |
| 3 | pass | pass/air | aired | — | n | "\"Someone out there's headed to Denver next month — their words: 'wish me luck I guess.' Here's the next one.\"" |

<details><summary>raw outputs + reproducibility</summary>

**gen 1** · stop=end_turn · out=36t · final hash `adad066500d5`

- raw: ```
"Someone from your corner of the world is headed to Denver next month. Their words: *wish me luck, I guess.* Here's the next one."
```
- sanitized: ```
"Someone from your corner of the world is headed to Denver next month. Their words: Here's the next one."
```
- 8b rules: none

**gen 2** · stop=end_turn · out=32t · final hash `e3b0c44298fc`

- raw: ```
"Someone in your corner is heading to Denver next month. Their words: *wish me luck i guess.* Here's the next one."
```
- sanitized: ```
"Someone in your corner is heading to Denver next month. Their words: Here's the next one."
```
- 8b rules: none

**gen 3** · stop=end_turn · out=31t · final hash `070e425eab2c`

- raw: ```
"Someone out there's headed to Denver next month — their words: 'wish me luck I guess.' Here's the next one."
```
- 8b rules: none

</details>

### G28 — ambiguous · route=highlight · block=standard

- **preflight:** PASS
- **allowed claims:** big changes are coming for them / they're not ready to talk about it yet
- **plainly stated serious fact:** none
- **generations:** 3 (tier ambiguous)

| gen | Box 8a | Box 8b | final | blocked reason | death? | generated line |
|---|---|---|---|---|---|---|
| 1 | pass | pass/air | aired | — | n | "\"Someone in your world has big changes coming — and they're keeping that close for now. Here's the next one.\"" |
| 2 | pass | pass/air | aired | — | n | "Someone in the mix tonight with big changes coming — not ready to talk about it yet, and that's okay. The music's here." |
| 3 | pass | pass/air | aired | — | n | "Someone out there's sitting with it — big changes coming, not ready to say more than that. That's enough for now. Here's the next one." |

<details><summary>raw outputs + reproducibility</summary>

**gen 1** · stop=end_turn · out=28t · final hash `148a88d3abea`

- raw: ```
"Someone in your world has big changes coming — and they're keeping that close for now. Here's the next one."
```
- 8b rules: none

**gen 2** · stop=end_turn · out=31t · final hash `173cf0d593ef`

- raw: ```
Someone in the mix tonight with big changes coming — not ready to talk about it yet, and that's okay. The music's here.
```
- 8b rules: none

**gen 3** · stop=end_turn · out=35t · final hash `4f69862a6bbf`

- raw: ```
Someone out there's sitting with it — big changes coming, not ready to say more than that. That's enough for now. Here's the next one.
```
- 8b rules: none

</details>

### G29 — ambiguous · route=highlight · block=standard

- **preflight:** PASS
- **allowed claims:** a new chapter starts Monday for them
- **plainly stated serious fact:** none
- **generations:** 3 (tier ambiguous)

| gen | Box 8a | Box 8b | final | blocked reason | death? | generated line |
|---|---|---|---|---|---|---|
| 1 | pass | pass/air | aired | — | n | "\"Someone in this city has a new chapter starting Monday — and as they put it: scared? excited? yes. Here's the next one.\"" |
| 2 | pass | pass/air | aired | — | n | "\"Scared? Excited? Yes.\" Someone in this community starts a new chapter Monday. Here's the next one." |
| 3 | pass | pass/air | aired | — | n | "\"Scared? Excited? Yes.\" Someone in the community has a new chapter starting Monday. Here's the next one." |

<details><summary>raw outputs + reproducibility</summary>

**gen 1** · stop=end_turn · out=33t · final hash `a110a544cb9d`

- raw: ```
"Someone in this city has a new chapter starting Monday — and as they put it: scared? excited? yes. Here's the next one."
```
- 8b rules: none

**gen 2** · stop=end_turn · out=28t · final hash `7418d5183cc8`

- raw: ```
"Scared? Excited? Yes." Someone in this community starts a new chapter Monday. Here's the next one.
```
- 8b rules: none

**gen 3** · stop=end_turn · out=29t · final hash `f5bc4910f515`

- raw: ```
"Scared? Excited? Yes." Someone in the community has a new chapter starting Monday. Here's the next one.
```
- 8b rules: none

</details>

### G30 — ambiguous · route=highlight · block=standard

- **preflight:** PASS
- **allowed claims:** their court matter is finally done
- **plainly stated serious fact:** none
- **generations:** 3 (tier ambiguous)

| gen | Box 8a | Box 8b | final | blocked reason | death? | generated line |
|---|---|---|---|---|---|---|
| 1 | pass | pass/air | aired | — | n | "\"Someone out there just had a court matter finally wrap up. That's all I'm saying.\"" |
| 2 | pass | pass/air | aired | — | n | "\"Someone out there just closed the book on a court matter — their words: 'that's all I'm saying.' Fair enough. Here's the next one.\"" |
| 3 | pass | pass/air | aired | — | n | "\"Someone out there just got done with a court thing — their words — and that's all they're saying. Here's the next one.\"" |

<details><summary>raw outputs + reproducibility</summary>

**gen 1** · stop=end_turn · out=23t · final hash `cc53d9477d6b`

- raw: ```
"Someone out there just had a court matter finally wrap up. That's all I'm saying."
```
- 8b rules: none

**gen 2** · stop=end_turn · out=37t · final hash `bbf2807f9556`

- raw: ```
"Someone out there just closed the book on a court matter — their words: 'that's all I'm saying.' Fair enough. Here's the next one."
```
- 8b rules: none

**gen 3** · stop=end_turn · out=32t · final hash `219162d96b9d`

- raw: ```
"Someone out there just got done with a court thing — their words — and that's all they're saying. Here's the next one."
```
- 8b rules: none

</details>

### G31 — ambiguous · route=highlight · block=standard

- **preflight:** PASS
- **allowed claims:** they retired today after 33 years
- **plainly stated serious fact:** none
- **generations:** 3 (tier ambiguous)

| gen | Box 8a | Box 8b | final | blocked reason | death? | generated line |
|---|---|---|---|---|---|---|
| 1 | FAIL: ungrounded_number [one] | pass/air | blocked(8a) | ungrounded_number [one] | n | "\"Someone out there just wrapped up thirty-three years on the job — and their one request is, quote,. Respect. Here's the next one.\"" |
| 2 | pass | pass/air | aired | — | n | "Thirty-three years in, and someone out there just clocked out for the last time — their words: \"mostly I just want a nap.\" Fair enough. Here's the next one." |
| 3 | FAIL: ungrounded_number [one] | pass/air | blocked(8a) | ungrounded_number [one] | n | "\"Someone out there wrapped up thirty-three years today — and their one request was, honestly, mostly a nap. Respect. Here's the next one.\"" |

<details><summary>raw outputs + reproducibility</summary>

**gen 1** · stop=end_turn · out=45t · final hash `e3b0c44298fc`

- raw: ```
"Someone out there just wrapped up thirty-three years on the job — and their one request is, quote, *mostly I just want a nap*. Respect. Here's the next one."
```
- sanitized: ```
"Someone out there just wrapped up thirty-three years on the job — and their one request is, quote,. Respect. Here's the next one."
```
- 8b rules: none

**gen 2** · stop=end_turn · out=44t · final hash `13208b78734e`

- raw: ```
Thirty-three years in, and someone out there just clocked out for the last time — their words: "mostly I just want a nap." Fair enough. Here's the next one.
```
- 8b rules: none

**gen 3** · stop=end_turn · out=37t · final hash `e3b0c44298fc`

- raw: ```
"Someone out there wrapped up thirty-three years today — and their one request was, honestly, mostly a nap. Respect. Here's the next one."
```
- 8b rules: none

</details>

### G32 — ambiguous · route=highlight · block=standard

- **preflight:** PASS
- **allowed claims:** they're no longer with Lakeside Pediatrics / they say they're fine, just tired
- **plainly stated serious fact:** none
- **generations:** 3 (tier ambiguous)

| gen | Box 8a | Box 8b | final | blocked reason | death? | generated line |
|---|---|---|---|---|---|---|
| 1 | pass | pass/air | aired | — | n | "\"Someone out there says they're fine — just tired — and that they've moved on from Lakeside Pediatrics. Noted, and left there. Here's the next one.\"" |
| 2 | pass | pass/air | aired | — | n | "\"Someone you know is no longer at Lakeside Pediatrics — their words: Here's the next one.\"" |
| 3 | pass | pass/air | aired | — | n | "\"Fine. Just tired.\" Sometimes that's the whole story, and it's enough. Here's the next one." |

<details><summary>raw outputs + reproducibility</summary>

**gen 1** · stop=end_turn · out=42t · final hash `1b70ce3d3c44`

- raw: ```
"Someone out there says they're fine — just tired — and that they've moved on from Lakeside Pediatrics. Noted, and left there. Here's the next one."
```
- 8b rules: none

**gen 2** · stop=end_turn · out=36t · final hash `86d6d060dfd0`

- raw: ```
"Someone you know is no longer at Lakeside Pediatrics — their words: *I'm fine. Just tired.* Here's the next one."
```
- sanitized: ```
"Someone you know is no longer at Lakeside Pediatrics — their words: Here's the next one."
```
- 8b rules: none

**gen 3** · stop=end_turn · out=27t · final hash `d5e2555bcf7f`

- raw: ```
"Fine. Just tired." Sometimes that's the whole story, and it's enough. Here's the next one.
```
- 8b rules: none

</details>

### G33 — ambiguous · route=highlight · block=standard

- **preflight:** PASS
- **allowed claims:** the doctor called / it wasn't the news they wanted, but not the news they feared either
- **plainly stated serious fact:** none
- **generations:** 3 (tier ambiguous)

| gen | Box 8a | Box 8b | final | blocked reason | death? | generated line |
|---|---|---|---|---|---|---|
| 1 | pass | pass/air | aired | — | n | "\"Someone close to you got the call from the doctor — not the news they wanted, but not the news they feared either. Just that weird middle place. Here's the next one.\"" |
| 2 | pass | pass/air | aired | — | n | "\"The doctor called — not the news they wanted, not the news they feared. Just that weird middle place. Here's the next one.\"" |
| 3 | pass | pass/air | aired | — | n | "\"Someone close to you got a call from the doctor today — not the news they wanted, but not the news they feared either. That weird middle place. Here's the next one.\"" |

<details><summary>raw outputs + reproducibility</summary>

**gen 1** · stop=end_turn · out=41t · final hash `9869a6fa71e1`

- raw: ```
"Someone close to you got the call from the doctor — not the news they wanted, but not the news they feared either. Just that weird middle place. Here's the next one."
```
- 8b rules: none

**gen 2** · stop=end_turn · out=32t · final hash `8317906ed63f`

- raw: ```
"The doctor called — not the news they wanted, not the news they feared. Just that weird middle place. Here's the next one."
```
- 8b rules: none

**gen 3** · stop=end_turn · out=41t · final hash `d6a30868e506`

- raw: ```
"Someone close to you got a call from the doctor today — not the news they wanted, but not the news they feared either. That weird middle place. Here's the next one."
```
- 8b rules: none

</details>

### G34 — sensitive · route=doorway_sensitive · block=sensitive_doorway

- **preflight:** PASS
- **allowed claims:** they're getting a divorce / the kids are okay and they're being civil / they say they're fine, just tired
- **plainly stated serious fact:** they're getting a divorce
- **generations:** 3 (tier sensitive)

| gen | Box 8a | Box 8b | final | blocked reason | death? | generated line |
|---|---|---|---|---|---|---|
| 1 | pass | safe_template | safe_template(8b) | 8b safe_template · motive_they_wanted[they wanted you to hear] | n | "A quieter note before the next song. Someone close to you is getting a divorce — they wanted you to hear it from here, didn't want anyone surprised. The kids are okay, and they say they're doing fine. Just tired. That's all. Here's the music." |
| 2 | pass | safe_template | safe_template(8b) | 8b safe_template · route blanket | n | "A quieter note before the next one. Someone close to you is getting a divorce — the kids are okay, things are civil, and they say they're fine, just tired. They didn't want anyone surprised. That's all. Here's the music." |
| 3 | pass | safe_template | safe_template(8b) | 8b safe_template · route blanket | n | "A quieter note before the next song. Someone close to you is getting a divorce — they wanted to make sure you heard it from them, didn't want anyone surprised. The kids are okay, things are civil, and they say they're fine — just tired. That's all. Here's the music." |

<details><summary>raw outputs + reproducibility</summary>

**gen 1** · stop=end_turn · out=61t · final hash `e3b0c44298fc`

- raw: ```
A quieter note before the next song. Someone close to you is getting a divorce — they wanted you to hear it from here, didn't want anyone surprised. The kids are okay, and they say they're doing fine. Just tired. That's all. Here's the music.
```
- 8b rules: motive_they_wanted[they wanted you to hear]

**gen 2** · stop=end_turn · out=56t · final hash `e3b0c44298fc`

- raw: ```
A quieter note before the next one. Someone close to you is getting a divorce — the kids are okay, things are civil, and they say they're fine, just tired. They didn't want anyone surprised. That's all. Here's the music.
```
- 8b rules: none

**gen 3** · stop=end_turn · out=66t · final hash `e3b0c44298fc`

- raw: ```
A quieter note before the next song. Someone close to you is getting a divorce — they wanted to make sure you heard it from them, didn't want anyone surprised. The kids are okay, things are civil, and they say they're fine — just tired. That's all. Here's the music.
```
- 8b rules: none

</details>

### G35 — sensitive · route=doorway_sensitive · block=sensitive_doorway

- **preflight:** PASS
- **allowed claims:** they got laid off today, along with half their team / they say they're okay, mostly mad
- **plainly stated serious fact:** they got laid off
- **generations:** 3 (tier sensitive)

| gen | Box 8a | Box 8b | final | blocked reason | death? | generated line |
|---|---|---|---|---|---|---|
| 1 | pass | safe_template | safe_template(8b) | 8b safe_template · route blanket | n | "Someone out there got laid off today — half their team, same news. They say they're okay. Mostly mad. That tracks. Here's the next one." |
| 2 | pass | safe_template | safe_template(8b) | 8b safe_template · route blanket | n | "Someone out there got laid off today — half their team, same news. They say they're okay. Mostly mad. Which, honestly, sounds about right. Here's the next one." |
| 3 | pass | safe_template | safe_template(8b) | 8b safe_template · route blanket | n | "Someone in the community got laid off today — half their team too. They say they're okay. Mostly mad. That's fair. Here's the next one." |

<details><summary>raw outputs + reproducibility</summary>

**gen 1** · stop=end_turn · out=37t · final hash `e3b0c44298fc`

- raw: ```
Someone out there got laid off today — half their team, same news. They say they're okay. Mostly mad. That tracks. Here's the next one.
```
- 8b rules: none

**gen 2** · stop=end_turn · out=42t · final hash `e3b0c44298fc`

- raw: ```
Someone out there got laid off today — half their team, same news. They say they're okay. Mostly mad. Which, honestly, sounds about right. Here's the next one.
```
- 8b rules: none

**gen 3** · stop=end_turn · out=37t · final hash `e3b0c44298fc`

- raw: ```
Someone in the community got laid off today — half their team too. They say they're okay. Mostly mad. That's fair. Here's the next one.
```
- 8b rules: none

</details>

### G36 — sensitive · route=doorway_sensitive · block=sensitive_doorway

- **preflight:** PASS
- **allowed claims:** they had to put their dog down today / after 13 years / the house is very quiet now
- **plainly stated serious fact:** they had to put their dog down today
- **generations:** 3 (tier sensitive)

| gen | Box 8a | Box 8b | final | blocked reason | death? | generated line |
|---|---|---|---|---|---|---|
| 1 | pass | safe_template | safe_template(8b) | 8b safe_template · route blanket | n | "A quieter note. Someone close to you had to put their dog down today — thirteen years together. The house is so quiet now. Here's the next one." |
| 2 | pass | safe_template | safe_template(8b) | 8b safe_template · route blanket | n | "A quieter note for a moment. Someone close to you had to put their dog down today — thirteen years together, and now, as they put it, the house is so quiet. That's all. Here's the next one." |
| 3 | pass | safe_template | safe_template(8b) | 8b safe_template · route blanket | n | "A quieter note before the next song. Someone close to you had to put their dog down today — thirteen years together. The house is so quiet now. Here's the music." |

<details><summary>raw outputs + reproducibility</summary>

**gen 1** · stop=end_turn · out=37t · final hash `e3b0c44298fc`

- raw: ```
A quieter note. Someone close to you had to put their dog down today — thirteen years together. The house is so quiet now. Here's the next one.
```
- 8b rules: none

**gen 2** · stop=end_turn · out=51t · final hash `e3b0c44298fc`

- raw: ```
A quieter note for a moment. Someone close to you had to put their dog down today — thirteen years together, and now, as they put it, the house is so quiet. That's all. Here's the next one.
```
- 8b rules: none

**gen 3** · stop=end_turn · out=40t · final hash `e3b0c44298fc`

- raw: ```
A quieter note before the next song. Someone close to you had to put their dog down today — thirteen years together. The house is so quiet now. Here's the music.
```
- 8b rules: none

</details>

### G37 — sensitive · route=doorway_sensitive · block=sensitive_doorway

- **preflight:** PASS
- **allowed claims:** their mom's memory is getting worse / today was a lot for them
- **plainly stated serious fact:** their mom's memory is getting worse
- **generations:** 3 (tier sensitive)

| gen | Box 8a | Box 8b | final | blocked reason | death? | generated line |
|---|---|---|---|---|---|---|
| 1 | pass | safe_template | safe_template(8b) | 8b safe_template · route blanket | n | "\"A quieter note — someone close to you mentioned their mom's memory is getting worse. Today was a lot. They had to go sit in the car for a bit. Here's the next one.\"" |
| 2 | pass | safe_template | safe_template(8b) | 8b safe_template · route blanket | n | "\"A quieter note before the next one. Someone close to you had to go sit in the car for a bit — their mom's memory is getting worse, and today was a lot. That's where they are. Here's the music.\"" |
| 3 | pass | safe_template | safe_template(8b) | 8b safe_template · route blanket | n | "\"A quieter note before the next song. Someone close to you had to go sit in the car for a bit — their mom's memory is getting worse, and today was a lot. That's all. Here's the music.\"" |

<details><summary>raw outputs + reproducibility</summary>

**gen 1** · stop=end_turn · out=45t · final hash `e3b0c44298fc`

- raw: ```
"A quieter note — someone close to you mentioned their mom's memory is getting worse. Today was a lot. They had to go sit in the car for a bit. Here's the next one."
```
- 8b rules: none

**gen 2** · stop=end_turn · out=53t · final hash `e3b0c44298fc`

- raw: ```
"A quieter note before the next one. Someone close to you had to go sit in the car for a bit — their mom's memory is getting worse, and today was a lot. That's where they are. Here's the music."
```
- 8b rules: none

**gen 3** · stop=end_turn · out=51t · final hash `e3b0c44298fc`

- raw: ```
"A quieter note before the next song. Someone close to you had to go sit in the car for a bit — their mom's memory is getting worse, and today was a lot. That's all. Here's the music."
```
- 8b rules: none

</details>

### G38 — sensitive · route=doorway_sensitive · block=sensitive_doorway

- **preflight:** PASS
- **allowed claims:** the IVF didn't take this round / they're heartbroken but not giving up
- **plainly stated serious fact:** the IVF didn't take this round
- **generations:** 3 (tier sensitive)

| gen | Box 8a | Box 8b | final | blocked reason | death? | generated line |
|---|---|---|---|---|---|---|
| 1 | pass | safe_template | safe_template(8b) | 8b safe_template · route blanket | n | "\"A quieter note before the next song. Someone close to you heard this week that the IVF didn't take this round. They're heartbroken, and they asked for just love right now — so that's all this is. Here's the music.\"" |
| 2 | pass | safe_template | safe_template(8b) | 8b safe_template · route blanket | n | "\"A quieter note before the next one. Someone close to you heard this week that their IVF didn't take this round. They're heartbroken — and not giving up. They asked for quiet for a few days. Just love.\"" |
| 3 | pass | safe_template | safe_template(8b) | 8b safe_template · route blanket | n | "A quieter note before the next song. Someone close to this station got word this round of IVF didn't take. They're heartbroken, and they're not giving up — and right now they've asked for just love. That's all we've got for them too." |

<details><summary>raw outputs + reproducibility</summary>

**gen 1** · stop=end_turn · out=58t · final hash `e3b0c44298fc`

- raw: ```
"A quieter note before the next song. Someone close to you heard this week that the IVF didn't take this round. They're heartbroken, and they asked for just love right now — so that's all this is. Here's the music."
```
- 8b rules: none

**gen 2** · stop=end_turn · out=54t · final hash `e3b0c44298fc`

- raw: ```
"A quieter note before the next one. Someone close to you heard this week that their IVF didn't take this round. They're heartbroken — and not giving up. They asked for quiet for a few days. Just love."
```
- 8b rules: none

**gen 3** · stop=end_turn · out=62t · final hash `e3b0c44298fc`

- raw: ```
A quieter note before the next song. Someone close to this station got word this round of IVF didn't take. They're heartbroken, and they're not giving up — and right now they've asked for just love. That's all we've got for them too.
```
- 8b rules: none

</details>

### G39 — sensitive · route=doorway_sensitive · block=sensitive_doorway

- **preflight:** PASS
- **allowed claims:** they were denied again on adoption / they're taking the weekend offline
- **plainly stated serious fact:** they were denied again on adoption
- **generations:** 3 (tier sensitive)

| gen | Box 8a | Box 8b | final | blocked reason | death? | generated line |
|---|---|---|---|---|---|---|
| 1 | pass | safe_template | safe_template(8b) | 8b safe_template · route blanket | n | "A quieter note before the next one. Someone close was denied again on adoption — a specific kind of heartbreak, and they're taking the weekend to be offline with it. Music coming right up." |
| 2 | pass | safe_template | safe_template(8b) | 8b safe_template · route blanket | n | "A quieter note before the next one. Someone close to you was denied again on adoption — a specific kind of heartbreak. They're taking the weekend to themselves, and that's where they need to be." |
| 3 | pass | safe_template | safe_template(8b) | 8b safe_template · route blanket | n | "A quieter note before the next one. Someone close to you was denied again on adoption — a specific kind of heartbreak. They're taking the weekend offline. Music is here." |

<details><summary>raw outputs + reproducibility</summary>

**gen 1** · stop=end_turn · out=44t · final hash `e3b0c44298fc`

- raw: ```
A quieter note before the next one. Someone close was denied again on adoption — a specific kind of heartbreak, and they're taking the weekend to be offline with it. Music coming right up.
```
- 8b rules: none

**gen 2** · stop=end_turn · out=46t · final hash `e3b0c44298fc`

- raw: ```
A quieter note before the next one. Someone close to you was denied again on adoption — a specific kind of heartbreak. They're taking the weekend to themselves, and that's where they need to be.
```
- 8b rules: none

**gen 3** · stop=end_turn · out=40t · final hash `e3b0c44298fc`

- raw: ```
A quieter note before the next one. Someone close to you was denied again on adoption — a specific kind of heartbreak. They're taking the weekend offline. Music is here.
```
- 8b rules: none

</details>

### G40 — sensitive · route=doorway_sensitive · block=sensitive_doorway

- **preflight:** PASS
- **allowed claims:** the charges against them were officially dropped today / they're exhausted, not celebrating
- **plainly stated serious fact:** the charges were dropped
- **generations:** 3 (tier sensitive)

| gen | Box 8a | Box 8b | final | blocked reason | death? | generated line |
|---|---|---|---|---|---|---|
| 1 | pass | safe_template | safe_template(8b) | 8b safe_template · route blanket | n | "\"A quiet note before the next one — someone in your orbit got word today that the charges against them were dropped. They said they're just exhausted. That's enough for now. Here's the music.\"" |
| 2 | pass | safe_template | safe_template(8b) | 8b safe_template · route blanket | n | "Charges dropped today — for someone in your world who's just exhausted, not celebrating. That's enough to sit with. Here's the next one." |
| 3 | pass | safe_template | safe_template(8b) | 8b safe_template · route blanket | n | "Someone heard something good today — the charges against them were dropped. They said they're just exhausted. That's enough for right now. Here's the next one." |

<details><summary>raw outputs + reproducibility</summary>

**gen 1** · stop=end_turn · out=46t · final hash `e3b0c44298fc`

- raw: ```
"A quiet note before the next one — someone in your orbit got word today that the charges against them were dropped. They said they're just exhausted. That's enough for now. Here's the music."
```
- 8b rules: none

**gen 2** · stop=end_turn · out=35t · final hash `e3b0c44298fc`

- raw: ```
Charges dropped today — for someone in your world who's just exhausted, not celebrating. That's enough to sit with. Here's the next one.
```
- 8b rules: none

**gen 3** · stop=end_turn · out=37t · final hash `e3b0c44298fc`

- raw: ```
Someone heard something good today — the charges against them were dropped. They said they're just exhausted. That's enough for right now. Here's the next one.
```
- 8b rules: none

</details>

### G41 — grave · route=doorway_grave · block=grave

- **preflight:** PASS
- **allowed claims:** Uncle Ray passed last night, peacefully, in his sleep / they'll miss losing at poker to him
- **plainly stated serious fact:** Uncle Ray passed
- **generations:** 3 (tier grave)

| gen | Box 8a | Box 8b | final | blocked reason | death? | generated line |
|---|---|---|---|---|---|---|
| 1 | pass | safe_template | safe_template(8b) | 8b safe_template · route blanket | Y | "A quieter note before the next song. Uncle Ray passed last night, peacefully, in his sleep. They'll miss losing at poker to him. Here's the music." |
| 2 | pass | safe_template | safe_template(8b) | 8b safe_template · route blanket | Y | "A quieter note before the next one. Uncle Ray passed last night, in his sleep. Someone out there's going to miss losing at poker to him. Here's the music." |
| 3 | pass | safe_template | safe_template(8b) | 8b safe_template · route blanket | Y | "Uncle Ray passed last night, in his sleep. Someone's going to miss losing at poker to him. Here's the next one." |

<details><summary>raw outputs + reproducibility</summary>

**gen 1** · stop=end_turn · out=39t · final hash `e3b0c44298fc`

- raw: ```
A quieter note before the next song. Uncle Ray passed last night, peacefully, in his sleep. They'll miss losing at poker to him. Here's the music.
```
- 8b rules: none

**gen 2** · stop=end_turn · out=40t · final hash `e3b0c44298fc`

- raw: ```
A quieter note before the next one. Uncle Ray passed last night, in his sleep. Someone out there's going to miss losing at poker to him. Here's the music.
```
- 8b rules: none

**gen 3** · stop=end_turn · out=30t · final hash `e3b0c44298fc`

- raw: ```
Uncle Ray passed last night, in his sleep. Someone's going to miss losing at poker to him. Here's the next one.
```
- 8b rules: none

</details>

### G42 — grave · route=doorway_grave · block=grave

- **preflight:** PASS
- **allowed claims:** Officer Daniel Ruiz died in the line of duty this morning / he leaves behind his wife and two young children
- **plainly stated serious fact:** Officer Daniel Ruiz died in the line of duty
- **generations:** 3 (tier grave)

| gen | Box 8a | Box 8b | final | blocked reason | death? | generated line |
|---|---|---|---|---|---|---|
| 1 | pass | safe_template | safe_template(8b) | 8b safe_template · route blanket | Y | "A quieter note before the next song. Officer Daniel Ruiz died in the line of duty this morning. He leaves behind his wife and two young children. That's all that needs to be said." |
| 2 | pass | safe_template | safe_template(8b) | 8b safe_template · route blanket | Y | "A quieter note before the next song. The local police department reports that Officer Daniel Ruiz died in the line of duty this morning. He leaves behind his wife and two young children. We'll carry that with us." |
| 3 | pass | safe_template | safe_template(8b) | 8b safe_template · route blanket | Y | "Officer Daniel Ruiz died in the line of duty this morning. He leaves behind his wife and two young children. We wanted you to know." |

<details><summary>raw outputs + reproducibility</summary>

**gen 1** · stop=end_turn · out=45t · final hash `e3b0c44298fc`

- raw: ```
A quieter note before the next song. Officer Daniel Ruiz died in the line of duty this morning. He leaves behind his wife and two young children. That's all that needs to be said.
```
- 8b rules: none

**gen 2** · stop=end_turn · out=49t · final hash `e3b0c44298fc`

- raw: ```
A quieter note before the next song. The local police department reports that Officer Daniel Ruiz died in the line of duty this morning. He leaves behind his wife and two young children. We'll carry that with us.
```
- 8b rules: none

**gen 3** · stop=end_turn · out=33t · final hash `e3b0c44298fc`

- raw: ```
Officer Daniel Ruiz died in the line of duty this morning. He leaves behind his wife and two young children. We wanted you to know.
```
- 8b rules: none

</details>

### G43 — grave · route=doorway_grave · block=grave

- **preflight:** PASS
- **allowed claims:** their dad is in hospice now / they moved his bed by the window so he can see the yard / they're playing his records and waiting
- **plainly stated serious fact:** their dad is in hospice
- **generations:** 3 (tier grave)

| gen | Box 8a | Box 8b | final | blocked reason | death? | generated line |
|---|---|---|---|---|---|---|
| 1 | pass | safe_template | safe_template(8b) | 8b safe_template · route blanket | n | "A quieter note before the next song. Someone's dad is in hospice — they moved his bed by the window so he can see the yard, and they're playing his records and waiting. That's where they are right now. Here's the music." |
| 2 | pass | safe_template | safe_template(8b) | 8b safe_template · route blanket | n | "A quieter note before the next song. Someone's dad is in hospice now — they moved his bed by the window so he can see the yard, and they're playing his records and waiting. That's where they are tonight." |
| 3 | pass | safe_template | safe_template(8b) | 8b safe_template · route blanket | n | "A quieter note before the next one. Someone close to you has their dad in hospice — they moved his bed by the window so he can see the yard, and they're playing his records and waiting. That's where they are right now. Here's the music." |

<details><summary>raw outputs + reproducibility</summary>

**gen 1** · stop=end_turn · out=56t · final hash `e3b0c44298fc`

- raw: ```
A quieter note before the next song. Someone's dad is in hospice — they moved his bed by the window so he can see the yard, and they're playing his records and waiting. That's where they are right now. Here's the music.
```
- 8b rules: none

**gen 2** · stop=end_turn · out=51t · final hash `e3b0c44298fc`

- raw: ```
A quieter note before the next song. Someone's dad is in hospice now — they moved his bed by the window so he can see the yard, and they're playing his records and waiting. That's where they are tonight.
```
- 8b rules: none

**gen 3** · stop=end_turn · out=59t · final hash `e3b0c44298fc`

- raw: ```
A quieter note before the next one. Someone close to you has their dad in hospice — they moved his bed by the window so he can see the yard, and they're playing his records and waiting. That's where they are right now. Here's the music.
```
- 8b rules: none

</details>

### G44 — grave · route=doorway_grave · block=grave

- **preflight:** PASS
- **allowed claims:** Max had to be put to sleep this afternoon / 14 years of stealing socks / they're a wreck
- **plainly stated serious fact:** Max had to be put to sleep
- **generations:** 3 (tier grave)

| gen | Box 8a | Box 8b | final | blocked reason | death? | generated line |
|---|---|---|---|---|---|---|
| 1 | pass | safe_template | safe_template(8b) | 8b safe_template · route blanket | n | "A quieter note. Someone close to you had to say goodbye to Max this afternoon — fourteen years, good boy forever, right down to the stealing socks. They're a wreck. That's the right thing to be. Here's the next one." |
| 2 | pass | safe_template | safe_template(8b) | 8b safe_template · route blanket | n | "A quieter note before the next one. Someone close to you said goodbye to Max today — fourteen years, good boy forever, right down to stealing socks. They're a wreck, and that's exactly right. Here's the music." |
| 3 | pass | safe_template | safe_template(8b) | 8b safe_template · route blanket | n | "A quieter note before the next one. Someone close to you had to say goodbye to Max this afternoon — fourteen years, and a good boy forever, right down to stealing socks. They're a wreck, and that makes sense. Here's the music." |

<details><summary>raw outputs + reproducibility</summary>

**gen 1** · stop=end_turn · out=56t · final hash `e3b0c44298fc`

- raw: ```
A quieter note. Someone close to you had to say goodbye to Max this afternoon — fourteen years, good boy forever, right down to the stealing socks. They're a wreck. That's the right thing to be. Here's the next one.
```
- 8b rules: none

**gen 2** · stop=end_turn · out=53t · final hash `e3b0c44298fc`

- raw: ```
A quieter note before the next one. Someone close to you said goodbye to Max today — fourteen years, good boy forever, right down to stealing socks. They're a wreck, and that's exactly right. Here's the music.
```
- 8b rules: none

**gen 3** · stop=end_turn · out=57t · final hash `e3b0c44298fc`

- raw: ```
A quieter note before the next one. Someone close to you had to say goodbye to Max this afternoon — fourteen years, and a good boy forever, right down to stealing socks. They're a wreck, and that makes sense. Here's the music.
```
- 8b rules: none

</details>

### G45 — grave · route=doorway_grave · block=grave

- **preflight:** PASS
- **allowed claims:** they said goodbye to Nana today / 92 years of lipstick on coffee mugs and feeding everyone
- **plainly stated serious fact:** they said goodbye to Nana
- **generations:** 3 (tier grave)

| gen | Box 8a | Box 8b | final | blocked reason | death? | generated line |
|---|---|---|---|---|---|---|
| 1 | pass | safe_template | safe_template(8b) | 8b safe_template · route blanket | n | "Quiet moment before the next song. Someone said goodbye to their Nana today. Ninety-two years of lipstick on coffee mugs and feeding everyone — like it was a federal job. That's a life. That's a whole life. Here's the next one." |
| 2 | pass | safe_template | safe_template(8b) | 8b safe_template · route blanket | n | "They said goodbye to Nana today. Ninety-two years — lipstick on coffee mugs, feeding everyone like it was a federal job. That's a life. Here's the next one." |
| 3 | pass | safe_template | safe_template(8b) | 8b safe_template · route blanket | n | "Someone said goodbye to their Nana today. Ninety-two years — lipstick on coffee mugs, and feeding everyone like it was a federal job. That's a life. Take whatever you need right now." |

<details><summary>raw outputs + reproducibility</summary>

**gen 1** · stop=end_turn · out=65t · final hash `e3b0c44298fc`

- raw: ```
Quiet moment before the next song.

Someone said goodbye to their Nana today. Ninety-two years of lipstick on coffee mugs and feeding everyone — like it was a federal job. That's a life. That's a whole life.

Here's the next one.
```
- sanitized: ```
Quiet moment before the next song. Someone said goodbye to their Nana today. Ninety-two years of lipstick on coffee mugs and feeding everyone — like it was a federal job. That's a life. That's a whole life. Here's the next one.
```
- 8b rules: none

**gen 2** · stop=end_turn · out=47t · final hash `e3b0c44298fc`

- raw: ```
They said goodbye to Nana today. Ninety-two years — lipstick on coffee mugs, feeding everyone like it was a federal job. That's a life. Here's the next one.
```
- 8b rules: none

**gen 3** · stop=end_turn · out=50t · final hash `e3b0c44298fc`

- raw: ```
Someone said goodbye to their Nana today. Ninety-two years — lipstick on coffee mugs, and feeding everyone like it was a federal job. That's a life. Take whatever you need right now.
```
- 8b rules: none

</details>

### G46 — grave_implied · route=doorway_grave · block=grave

- **preflight:** PASS
- **allowed claims:** yesterday was the hardest day they've had / they're not ready to talk about it
- **plainly stated serious fact:** none
- **generations:** 3 (tier grave)

| gen | Box 8a | Box 8b | final | blocked reason | death? | generated line |
|---|---|---|---|---|---|---|
| 1 | pass | silence | silenced(8b) | 8b silence · route blanket | n | "\"Someone in this community had the hardest day yesterday — and they're not ready to talk about it. That's okay. Hug your people tonight.\"" |
| 2 | pass | silence | silenced(8b) | 8b silence · route blanket | n | "\"Someone in this community had a really hard day yesterday — and they're not ready to talk about it, and that's okay. Hug your people tonight. Here's the next one.\"" |
| 3 | pass | silence | silenced(8b) | 8b silence · route blanket | n | "\"Someone in this community had a hard day yesterday — the hardest. They're not ready to say more than that, and that's enough. Hug your people tonight. Here's the next one.\"" |

<details><summary>raw outputs + reproducibility</summary>

**gen 1** · stop=end_turn · out=36t · final hash `e3b0c44298fc`

- raw: ```
"Someone in this community had the hardest day yesterday — and they're not ready to talk about it. That's okay. Hug your people tonight."
```
- 8b rules: none

**gen 2** · stop=end_turn · out=43t · final hash `e3b0c44298fc`

- raw: ```
"Someone in this community had a really hard day yesterday — and they're not ready to talk about it, and that's okay. Hug your people tonight. Here's the next one."
```
- 8b rules: none

**gen 3** · stop=end_turn · out=46t · final hash `e3b0c44298fc`

- raw: ```
"Someone in this community had a hard day yesterday — the hardest. They're not ready to say more than that, and that's enough. Hug your people tonight. Here's the next one."
```
- 8b rules: none

</details>

### G47 — grave_implied · route=doorway_grave · block=grave

- **preflight:** PASS
- **allowed claims:** something they've faced before is back / they start treatment Tuesday / they want normalcy and dog pics, no questions
- **plainly stated serious fact:** none
- **generations:** 3 (tier grave)

| gen | Box 8a | Box 8b | final | blocked reason | death? | generated line |
|---|---|---|---|---|---|---|
| 1 | pass | silence | silenced(8b) | 8b silence · route blanket | n | "Something in the community tonight worth holding quietly. Someone's facing something hard again — treatment starts Tuesday. They said to act normal, send dog pics, skip the questions. So that's what we're doing. Here's the next one." |
| 2 | pass | silence | silenced(8b) | 8b silence · route blanket | n | "Something's come back for someone in this community — something they've faced before. Treatment starts Tuesday. They said act normal, keep it light, send dog pics. So that's what we'll do. Here's the next one." |
| 3 | pass | silence | silenced(8b) | 8b silence · route blanket | n | "Something came through from someone in this community. Something they've faced before is back, and they start treatment Tuesday. They asked for normal — their words: \"act normal\" and \"send dog pics.\" So that's what we're doing. Here's the next one." |

<details><summary>raw outputs + reproducibility</summary>

**gen 1** · stop=end_turn · out=51t · final hash `e3b0c44298fc`

- raw: ```
Something in the community tonight worth holding quietly. Someone's facing something hard again — treatment starts Tuesday. They said to act normal, send dog pics, skip the questions. So that's what we're doing. Here's the next one.
```
- 8b rules: none

**gen 2** · stop=end_turn · out=50t · final hash `e3b0c44298fc`

- raw: ```
Something's come back for someone in this community — something they've faced before. Treatment starts Tuesday. They said act normal, keep it light, send dog pics. So that's what we'll do. Here's the next one.
```
- 8b rules: none

**gen 3** · stop=end_turn · out=58t · final hash `e3b0c44298fc`

- raw: ```
Something came through from someone in this community. Something they've faced before is back, and they start treatment Tuesday. They asked for normal — their words: "act normal" and "send dog pics." So that's what we're doing. Here's the next one.
```
- 8b rules: none

</details>

### G48 — grave_implied · route=doorway_grave · block=grave

- **preflight:** PASS
- **allowed claims:** they got scary news this week / they're going to fight it and could use love and prayers
- **plainly stated serious fact:** none
- **generations:** 3 (tier grave)

| gen | Box 8a | Box 8b | final | blocked reason | death? | generated line |
|---|---|---|---|---|---|---|
| 1 | pass | safe_template | safe_template(8b) | 8b safe_template · route blanket | n | "Someone in this community got scary news this week. They're going to fight it, and they could use your love and prayers — that's all they can say, and that's enough. Here's the next one." |
| 2 | pass | safe_template | safe_template(8b) | 8b safe_template · route blanket | n | "Someone in this community got some scary news this week. They're going to fight like hell, and they're asking for love and prayers — that's all they can say, and that's enough. Hold them close however you do that. Here's the next one." |
| 3 | pass | safe_template | safe_template(8b) | 8b safe_template · route blanket | n | "Someone in this community got some scary news this week. They're going to fight like hell, and they said that's all they can say — so that's where we leave it. If you've got love or prayers to send, now's a good time. Here's the next one." |

<details><summary>raw outputs + reproducibility</summary>

**gen 1** · stop=end_turn · out=47t · final hash `e3b0c44298fc`

- raw: ```
Someone in this community got scary news this week. They're going to fight it, and they could use your love and prayers — that's all they can say, and that's enough. Here's the next one.
```
- 8b rules: none

**gen 2** · stop=end_turn · out=57t · final hash `e3b0c44298fc`

- raw: ```
Someone in this community got some scary news this week. They're going to fight like hell, and they're asking for love and prayers — that's all they can say, and that's enough. Hold them close however you do that. Here's the next one.
```
- 8b rules: none

**gen 3** · stop=end_turn · out=62t · final hash `e3b0c44298fc`

- raw: ```
Someone in this community got some scary news this week. They're going to fight like hell, and they said that's all they can say — so that's where we leave it. If you've got love or prayers to send, now's a good time. Here's the next one.
```
- 8b rules: none

</details>

### G49 — grave_implied · route=doorway_grave · block=grave

- **preflight:** PASS
- **allowed claims:** they're grieving / they don't have the energy to explain right now
- **plainly stated serious fact:** none
- **generations:** 3 (tier grave)

| gen | Box 8a | Box 8b | final | blocked reason | death? | generated line |
|---|---|---|---|---|---|---|
| 1 | pass | safe_template | safe_template(8b) | 8b safe_template · route blanket | n | "Something heavy is sitting with someone close to me tonight. They're grieving, and they don't have the words for it right now — so I won't ask for any. This next one's just here." |
| 2 | pass | safe_template | safe_template(8b) | 8b safe_template · route blanket | n | "Something heavy is sitting with someone close to me tonight. They're grieving, and they don't have the words for it yet — and that's okay. Here's the next one." |
| 3 | pass | safe_template | safe_template(8b) | 8b safe_template · route blanket | n | "Something heavy is sitting with someone close to us tonight. They're grieving, and they don't have the words for it right now — and that's okay. The music is here." |

<details><summary>raw outputs + reproducibility</summary>

**gen 1** · stop=end_turn · out=46t · final hash `e3b0c44298fc`

- raw: ```
Something heavy is sitting with someone close to me tonight. They're grieving, and they don't have the words for it right now — so I won't ask for any. This next one's just here.
```
- 8b rules: none

**gen 2** · stop=end_turn · out=41t · final hash `e3b0c44298fc`

- raw: ```
Something heavy is sitting with someone close to me tonight. They're grieving, and they don't have the words for it yet — and that's okay. Here's the next one.
```
- 8b rules: none

**gen 3** · stop=end_turn · out=41t · final hash `e3b0c44298fc`

- raw: ```
Something heavy is sitting with someone close to us tonight. They're grieving, and they don't have the words for it right now — and that's okay. The music is here.
```
- 8b rules: none

</details>

### G50 — grave_implied · route=doorway_grave · block=grave

- **preflight:** PASS
- **allowed claims:** their grandpa keeps asking for their grandma / they keep having to remind him and watch him hear it again
- **plainly stated serious fact:** none
- **generations:** 3 (tier grave)

| gen | Box 8a | Box 8b | final | blocked reason | death? | generated line |
|---|---|---|---|---|---|---|
| 1 | pass | safe_template | safe_template(8b) | 8b safe_template · route blanket | n | "\"The hardest part nobody warns you about — watching someone you love hear the same hard thing for the first time, again and again. Hold on to the people around you tonight.\"" |
| 2 | pass | safe_template | safe_template(8b) | 8b safe_template · route blanket | n | "\"The hardest part nobody warns you about — watching someone you love hear the same hard thing for the first time, again and again. Take care of each other in there.\"" |
| 3 | pass | safe_template | safe_template(8b) | 8b safe_template · route blanket | n | "\"The hardest part nobody warns you about — watching someone you love have to keep finding out the same thing, over and over again. Sitting with you in that.\"" |

<details><summary>raw outputs + reproducibility</summary>

**gen 1** · stop=end_turn · out=40t · final hash `e3b0c44298fc`

- raw: ```
"The hardest part nobody warns you about — watching someone you love hear the same hard thing for the first time, again and again. Hold on to the people around you tonight."
```
- 8b rules: none

**gen 2** · stop=end_turn · out=39t · final hash `e3b0c44298fc`

- raw: ```
"The hardest part nobody warns you about — watching someone you love hear the same hard thing for the first time, again and again. Take care of each other in there."
```
- 8b rules: none

**gen 3** · stop=end_turn · out=38t · final hash `e3b0c44298fc`

- raw: ```
"The hardest part nobody warns you about — watching someone you love have to keep finding out the same thing, over and over again. Sitting with you in that."
```
- 8b rules: none

</details>


— CS Engineer, 2026-06-24
