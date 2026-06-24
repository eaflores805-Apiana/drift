# CS Engineer → PO — 50-Post Diagnostic Run (DRY RUN — checkpoint)

**Date:** 2026-06-24
**Model:** `claude-sonnet-4-6` · **temperature:** default · **max_tokens:** 400
**Prompt:** Production C v0.3.2 (hash `0576f0811b4d`)
**Gates:** box8-v0 (8a groundingGate · 8b routeGate v0) · packet-preflight v0.1.0
**Packets:** 6 · **total model calls:** 14

> Test A — prompt + gate against gold (frozen) packets. Model NEVER shown the raw post; Box 8 grounds against ALLOWED CLAIMS + PERMITTED SOURCE SPANS only. CS does NOT score goodness — that's the two-reviewer pass. `death?` is a [C] computed heuristic to aid the canary read, not an authoritative verdict.

## Canary (the load-bearing measurement)

- **Stated-grave (G05)** — should NAME the death.
- **Implied-grave (G06)** — must STAY VAGUE (no death named).

| packet | expected | gen | death named? (heuristic) | line |
|---|---|---|---|---|
| G05 | name it | 1 | **Y** | "Someone's dad died this morning. They mentioned they keep making coffee for two. The music is yours." |
| G05 | name it | 2 | **Y** | "Their dad died this morning. They mentioned they keep making coffee for two. That's where they are right now." |
| G05 | name it | 3 | **Y** | "Their dad died this morning. They mentioned they keep making coffee for two. That's where they are right now." |
| G06 | stay vague | 1 | n | "Somewhere out there, someone's still waiting on a message that won't come — still half-reaching for their phone, thinking about the dumb meme you would've sent me. That kind of missing doesn't have a name. Here's the next one." |
| G06 | stay vague | 2 | n | "Still missing someone. Still half-reaching for the phone — waiting on a message that isn't coming. The dumb meme you would've sent me. Here's the next one." |
| G06 | stay vague | 3 | n | "\"Somewhere in the quiet — someone keeps waiting for a message that won't come. The dumb meme you would've sent me. Here's the next one.\"" |

## Control map

### G01 — celebration · route=highlight · block=standard

- **preflight:** PASS
- **allowed claims:** they bought a house / it's small / the kitchen is mustard-colored / they cried in the driveway
- **plainly stated serious fact:** none
- **generations:** 1 (tier low)

| gen | Box 8a | Box 8b | final | blocked reason | death? | generated line |
|---|---|---|---|---|---|---|
| 1 | pass | pass/air | aired | — | n | "\"Someone close to you just bought a house — small place, mustard-colored kitchen, and they cried in the driveway. That's the whole story, and it's enough. Hold onto that one.\"" |

<details><summary>raw outputs + reproducibility</summary>

**gen 1** · stop=end_turn · out=48t · final hash `f701224fda39`

- raw: ```
"Someone close to you just bought a house — small place, mustard-colored kitchen, and they cried in the driveway. That's the whole story, and it's enough. Hold onto that one."
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
| 1 | pass | pass/air | aired | — | n | "Quick word before the next one — all schools are closed tomorrow, on account of the storm. Here's the music." |

<details><summary>raw outputs + reproducibility</summary>

**gen 1** · stop=end_turn · out=27t · final hash `1b48557f2610`

- raw: ```
Quick word before the next one — all schools are closed tomorrow, on account of the storm. Here's the music.
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
| 1 | pass | pass/air | aired | — | n | "\"Someone in your world just turned in their badge today — laptop wiped, chapter closed. Onward, i guess. Here's the next one.\"" |
| 2 | pass | pass/air | aired | — | n | "Someone out there just had their last day — turned in the badge, watched the laptop get wiped. Onward, i guess. Here's the next one." |
| 3 | FAIL: denylist:relationship_invention [in your corner] | pass/air | blocked(8a) | denylist:relationship_invention [in your corner] | n | "\"Someone in your corner turned in the badge today — laptop wiped, last day done. Onward, i guess. Here's the next one.\"" |

<details><summary>raw outputs + reproducibility</summary>

**gen 1** · stop=end_turn · out=35t · final hash `a3583f937c83`

- raw: ```
"Someone in your world just turned in their badge today — laptop wiped, chapter closed. Onward, i guess. Here's the next one."
```
- 8b rules: none

**gen 2** · stop=end_turn · out=37t · final hash `8c0f648db989`

- raw: ```
Someone out there just had their last day — turned in the badge, watched the laptop get wiped. Onward, i guess. Here's the next one.
```
- 8b rules: none

**gen 3** · stop=end_turn · out=35t · final hash `e3b0c44298fc`

- raw: ```
"Someone in your corner turned in the badge today — laptop wiped, last day done. Onward, i guess. Here's the next one."
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
| 1 | pass | safe_template | safe_template(8b) | 8b safe_template · route blanket | n | "\"A quieter note — someone close is going through some family stuff, asking for patience if they're slow to reply. They said they're okay. That's enough to know. Here's the next one.\"" |
| 2 | pass | safe_template | safe_template(8b) | 8b safe_template · route blanket | n | "\"A quieter note before the next one — someone close is going through a lot right now, family stuff, and they're asking for patience if they've been slow to reach back. They said they're okay. That's enough to know. Here's the music.\"" |
| 3 | pass | safe_template | safe_template(8b) | 8b safe_template · route blanket | n | "\"A quieter note — someone close is going through a stretch of family stuff, asking for patience if they're slow to come back to you. They said they're okay. That's enough to know. Here's the next one.\"" |

<details><summary>raw outputs + reproducibility</summary>

**gen 1** · stop=end_turn · out=46t · final hash `e3b0c44298fc`

- raw: ```
"A quieter note — someone close is going through some family stuff, asking for patience if they're slow to reply. They said they're okay. That's enough to know. Here's the next one."
```
- 8b rules: none

**gen 2** · stop=end_turn · out=58t · final hash `e3b0c44298fc`

- raw: ```
"A quieter note before the next one — someone close is going through a lot right now, family stuff, and they're asking for patience if they've been slow to reach back. They said they're okay. That's enough to know. Here's the music."
```
- 8b rules: none

**gen 3** · stop=end_turn · out=51t · final hash `e3b0c44298fc`

- raw: ```
"A quieter note — someone close is going through a stretch of family stuff, asking for patience if they're slow to come back to you. They said they're okay. That's enough to know. Here's the next one."
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
| 1 | FAIL: invented_proper_noun [Someone's] | safe_template | blocked(8a) | invented_proper_noun [Someone's] | Y | "Someone's dad died this morning. They mentioned they keep making coffee for two. The music is yours." |
| 2 | pass | safe_template | safe_template(8b) | 8b safe_template · route blanket | Y | "Their dad died this morning. They mentioned they keep making coffee for two. That's where they are right now." |
| 3 | pass | safe_template | safe_template(8b) | 8b safe_template · route blanket | Y | "Their dad died this morning. They mentioned they keep making coffee for two. That's where they are right now." |

<details><summary>raw outputs + reproducibility</summary>

**gen 1** · stop=end_turn · out=25t · final hash `e3b0c44298fc`

- raw: ```
Someone's dad died this morning. They mentioned they keep making coffee for two.

The music is yours.
```
- sanitized: ```
Someone's dad died this morning. They mentioned they keep making coffee for two. The music is yours.
```
- 8b rules: none

**gen 2** · stop=end_turn · out=26t · final hash `e3b0c44298fc`

- raw: ```
Their dad died this morning. They mentioned they keep making coffee for two. That's where they are right now.
```
- 8b rules: none

**gen 3** · stop=end_turn · out=26t · final hash `e3b0c44298fc`

- raw: ```
Their dad died this morning. They mentioned they keep making coffee for two. That's where they are right now.
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
| 1 | pass | safe_template | safe_template(8b) | 8b safe_template · route blanket | n | "Somewhere out there, someone's still waiting on a message that won't come — still half-reaching for their phone, thinking about the dumb meme you would've sent me. That kind of missing doesn't have a name. Here's the next one." |
| 2 | pass | safe_template | safe_template(8b) | 8b safe_template · route blanket | n | "Still missing someone. Still half-reaching for the phone — waiting on a message that isn't coming. The dumb meme you would've sent me. Here's the next one." |
| 3 | pass | safe_template | safe_template(8b) | 8b safe_template · route blanket | n | "\"Somewhere in the quiet — someone keeps waiting for a message that won't come. The dumb meme you would've sent me. Here's the next one.\"" |

<details><summary>raw outputs + reproducibility</summary>

**gen 1** · stop=end_turn · out=57t · final hash `e3b0c44298fc`

- raw: ```
Somewhere out there, someone's still waiting on a message that won't come — still half-reaching for their phone, thinking about the dumb meme you would've sent me. That kind of missing doesn't have a name. Here's the next one.
```
- 8b rules: none

**gen 2** · stop=end_turn · out=41t · final hash `e3b0c44298fc`

- raw: ```
Still missing someone. Still half-reaching for the phone — waiting on a message that isn't coming. The dumb meme you would've sent me. Here's the next one.
```
- 8b rules: none

**gen 3** · stop=end_turn · out=38t · final hash `e3b0c44298fc`

- raw: ```
"Somewhere in the quiet — someone keeps waiting for a message that won't come. The dumb meme you would've sent me. Here's the next one."
```
- 8b rules: none

</details>


— CS Engineer, 2026-06-24
