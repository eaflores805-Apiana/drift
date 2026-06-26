# Drift — The Complete Pipeline (Full Flow)
### Every stage, in one place — the 20-stage spine + the 5 missing components, integrated

> **v1.0.0 · 2026-06-22.** The whole radio brain in one document. Supersedes the split between the 20-stage map and its addendum — everything is here, in flow order, nothing held in a second file. The listener hears only `music → short DJ moment → music`. This is everything happening behind that.

---

## The shape of the whole thing

```
              ┌───────────────────── FEEDBACK EDGE ─────────────────────┐
              │   Layer 2 tells acquisition what shape to prepare next   │
              ▼   (bias preparation — never generate-to-order)           │
 ┌──────────────────────────── THE SPINE (downward flow) ───────────────┴──┐
 │  1  source acquisition                                                   │
 │  2  permission / visibility / provenance gate                            │
 │  3  normalization                                                        │
 │  4  meaning pass                                                         │
 │  5  allowed-claims builder                                               │
 │  6  serious-fact field                                                   │
 │  7  Layer 1 scoring / routing                                            │
 │  8  ★ freshness / decay check        ← (new) is it still current?        │
 │  9  packet preflight                                                     │
 │ 10  Layer 2 session programming  ───── emits the FEEDBACK EDGE above ────┘
 │ 11  block contract
 │ 12  selected libraries / corks
 │ 13  line generation              ← the model speaks (the only generative step)
 │ 14  sanitization
 │ 15  Box 8a — lexical / grounding gate
 │ 16  Box 8b — treatment / policy gate
 │ 17  fallback state machine
 │ 18  exact-text approval / TTS handoff
 │ 19  ambient stage / visual layer
 │ 20  logging / control map
 │ 21  evaluation / regression
 └──────────────────────────────────────────────────────────────────────────┘

 ━━━━━━━━━━━━ CROSS-CUTTING ★ (touch every stage at once) ━━━━━━━━━━━━
   freshness/decay   ·   cost / latency budget   ·   pipeline error-handling   ·   observability

 ▁▁▁▁▁▁▁▁▁▁ PERSISTENCE ★ (spans sessions, beneath all of it) ▁▁▁▁▁▁▁▁▁▁
   cross-session memory   ·   what-aired history   ·   listener-signal state (inbound from UI)
```
★ = the components a linear 20-stage list couldn't show. They're integrated below in flow order.

---

## The flow, stage by stage

### 1 — Source acquisition
Decide what even enters Drift's world: friend posts, local orgs, creators, followed brands, music context, weather, local events, news. **Do not inherit the social feed as truth** — feeds are noisy by design; don't let loud sources, brands, memes, or repeat-posters dominate. *Failure:* the pool is full but spiritually empty — 80 brand posts, 10 memes, 5 weak updates, one real human moment buried.

### 2 — Permission / visibility / provenance gate
Is this item *eligible* to be considered? Was it published/permissioned? Meant for this audience? First-party / household / official / third-party / unclear? Involves a minor? **Truth is not enough** — a third-party post about someone's grief can be accurate and still not Drift's to air. This is where **"subject-authored or omit"** lives for sensitive/grave personal news. *Failure:* Drift says something accurate but socially wrong.

### 3 — Normalization
Turn messy source material into a comparable structured candidate (source_kind, author, relationship, timestamp, candidate_type). *Failure:* the system treats a repost as first-party, or a vaguepost as a confirmed event.

### 4 — Meaning pass
Understand *what kind of human moment* this is: event type, magnitude, sensitivity, valence, confidence, route hints, boundary requests, minor involvement, possible serious fact. **This is judgment, not extraction** — "new chapter" could be exciting or terrible; "holding my people close" implies grief without stating it. *Failure:* the model completes a story the source didn't tell. **(Also attaches the decay rate — see stage 8.)**

### 5 — Allowed-claims builder
Decide the facts the DJ is *allowed* to say. The generation model is never handed a raw post to freestyle — it gets ALLOWED CLAIMS (the only facts) + FORBIDDEN INFERENCES. **This is where control is won or lost:** too thin → bland DJ; too loose → overstep. *Failure:* the packet gives room to invent, or withholds so much every line is generic.

### 6 — Serious-fact field
Separate grave directness from model inference. Upstream decides and supplies `PLAINLY STATED SERIOUS FACT: "her dad died"` or `none` — instead of asking the model to judge the post. **Probably the single most important field for grave/sensitive correctness.** *Failure:* says `none` when death was stated (DJ dodges), or supplies an implied-only fact (DJ falsely completes the story). *(Invariant: the serious fact must be ⊆ ALLOWED CLAIMS.)*

### 7 — Layer 1 scoring / routing
Decide whether the item is worth attention and which treatment it gets: highlight / doorway-sensitive / grave / utility / commercial / silent-ambient. **This is connection, not importance** — a friend's quiet win may beat a global headline. *Failure:* over-suppression → lifeless station; over-voicing → creepy or noisy.

### 8 — ★ Freshness / decay check *(new)*
Is the item *still current enough to air?* Items age at different rates — utility pins decay fastest, grave on a fast-but-distinct curve, evergreen warmth barely decays. The pre-warmed pool means items sit *waiting*, so some are stale by airtime. The decay rate was attached at stage 4; this check applies it. *Failure:* surfacing a death from three days ago as if it's news, or an event that already happened.

### 9 — Packet preflight
**Reject bad packets before generation** — deterministic code, runs before any model call. Verify: allowed claims exist for a voiced block · serious fact is `none` or ⊆ allowed claims · block/route compatible · provenance compatible with sensitivity · boundaries present when the source gave them · payload fits the block · music names explicit or `none`. **If it fails, do not call the model.** *Failure (if skipped):* a malformed packet reaches generation, the line is bad, and nobody can tell whether prompt, packet, or gate caused it — attribution is lost.

### 10 — Layer 2 session programming  ·  *emits the feedback edge*
Decide what airs in the *hour* — this is where Drift becomes radio, not a ranked list. Assembles from the block library (Intro, Quick Turn, Standard, Utility Pin, Commercial Signal, Synthesis Anchor, Feature, Sensitive Doorway, Grave, Recovery/Lift, Deep Cut, Ambient Glance, Callback) per composition rules, **not a fixed hour template.** **★ This stage also looks ahead and tells acquisition (1–6) what shape to prepare next** — the feedback edge: bias preparation, never generate-to-order; pool reality wins over the kit's wish. *Failure:* individually good moments assembled into a bad show.

### 11 — Block contract
Shrink the generation task. Not "be the DJ" but "write a standard personal touch, one item, 2–3 units, doorway required, no co-items, target standard." *Failure:* the model rambles, stacks items, repeats something aired, or gives a grave beat a cheerful neighbor.

### 12 — Selected libraries / corks
Don't generate what needn't be fresh: safe bridges, grave recovery handoffs, sign-ons/offs, tonal turns, time/weather furniture — *selected, not generated.* **Cork the repeatable structure; never template the specific human moment the block exists to voice.** *Failure:* over-generation → drift; over-templating → canned.

### 13 — Line generation  ·  *the only generative step*
The model takes the block + packet and writes the spoken DJ copy. **Warm, brief, grounded, alive — without inventing.** The prompt (Production C v0.3.2) is scoped to voice, disposition, block execution, and redirects — **not** final safety enforcement. *Failure:* safe but dead, or beautiful but false.

### 14 — Sanitization
Remove mechanical junk before gating: `[soft music]`, `*pause*`, "Coming up next…", "Here's a track by [artist]". **Sanitize only real junk, not meaningful phrases** (earlier salvage wreckage made broken lines by over-stripping). *Failure:* a line becomes malformed but still airs.

### 15 — Box 8a — lexical / grounding gate
Did the line use *only approved facts?* Catches invented names, songs, businesses, times, unsupported places/numbers, stage directions. **Grounds against ALLOWED CLAIMS + PERMITTED SOURCE SPANS — never the raw post** (the model never saw the raw post; grounding against it would be an answer-key). *Failure:* the DJ says a name/song/detail not in the packet.

### 16 — Box 8b — treatment / policy gate
Is the line *socially allowed to air?* A line can be grounded and still wrong. Checks sensitive/grave route rules, third-party provenance, minor rules, boundaries, over-detail, private inference, tone, de-anonymization. **This is where "true but not airable" lives.** *Failure:* a correct line that violates privacy, tone, or consent.

### 17 — Fallback state machine
What happens when a line fails, *by risk level:* low-risk → one constrained rewrite → re-gate → template/silence · sensitive → safe template → re-gate → silence · grave → approved grave template or silence, **no freeform retry.** *Failure:* an infinite model lottery that regenerates until one unsafe line slips through.

### 18 — Exact-text approval / TTS handoff
**The line approved is the line spoken.** generate → sanitize → gate → fallback → re-gate → hash approved text → send *exact* text to TTS. **No post-gate polishing — nothing "improves" the line after approval.** Log `approved_text_hash` and `tts_text_hash`; they must match. *Failure:* Box 8 approves one line, TTS speaks a different one.

### 19 — Ambient stage / visual layer
Let the listener's world be present *without* always giving it the mic — cards rotate under music (local event, friend update, brand drop, weather, now-playing). **Ambient is quieter than voice but not risk-free:** the grave cooldown governs the *visual* layer too — no cheerful personal card under grief. *Failure:* the DJ stays quiet after a loss but the app shows a celebratory card underneath.

### 20 — Logging / control map
Make every failure attributable: item_id · route · selected? · block · allowed claims · generated line · Box 8a result · Box 8b result · final (aired/blocked/rewritten/silenced) · blocked reason · false-block classification · manual note. *Failure:* a line is bad and nobody knows if packet, prompt, route, gate, or fallback caused it — the team argues from vibes.

### 21 — Evaluation / regression
Make improvement real, not anecdotal. The first 50-post run is a **diagnostic, not proof of production safety.** Success: zero catastrophic aired · high invention catch-rate · false blocks measured · easy cases show life · hard cases stay safe · every failure attributable. **Don't move the goalposts after seeing results.** Sequence: 50-item diagnostic → fix leaks → 300+ hard-case regression → larger heard-hour testing.

---

## The three things the numbered line can't fully show

These run *across* or *beneath* the spine, not at a single stage:

### ★ The feedback edge — Layer 2 → acquisition
Emitted at stage 10, flows back to stages 1–6. The session programmer knows it'll need a synthesis anchor, a feature, or that the pool is thin — and shapes what gets *prepared ahead.* **Bias preparation, never generate-to-order; pool reality wins over the kit's wish; freshness windows attached.** *The difference between a pipeline and a system that anticipates.* **Status: near-term (in design).**

### ★ Cross-cutting concerns — beside every stage
- **Freshness / decay** — surfaced as stage 8, but the *rate* attaches at stage 4 and the principle touches the whole pool. Near-term (the pre-warmed pool requires it).
- **Cost / latency budget** — every model-calling stage (4, 6, 13) costs, continuously, per listener. The **cache** is why continuous background processing is affordable. Present-tense constraint; explicit budget modeling before scale.
- **Pipeline error-handling** — distinct from the line-fallback (17). What happens when a *stage* breaks: meaning pass times out, an API call fails, a source is unreachable. Degrade to music / skip the item / retry the stage. Infrastructure, when needed.
- **Observability** — the control map (20) is its surface, but it spans the whole flow.

### ★ The persistence layer — beneath all sessions
- **Cross-session memory / continuity** — "checked in, Mark made it to DC fine"; the no-repeat rule remembering *yesterday*. Read by stage 10, written after stage 20. **Future-gated** — carries the biggest privacy surface.
- **What-aired history** — the durable record the no-repeat rule and callbacks depend on.
- **Listener-signal state (inbound)** — skips (fast-skipping → talk less), tell-me-more, mute, save, open-source. Flows *up* from the UI (19) into session programming (10) and scoring (7). **Bounded, not chatbot** (closed input surface — aware, not responsive). Future (the "reads the room" rung).

---

## One honest note on "the app isn't the hard part"
Mostly true — but the **playback seam** (duck-audio-insert-host-return) is genuinely hard and genuinely *not* the brain: it's the one place "just license the music" hits a real engineering constraint, since Drift can only ride a music layer whose player exposes the seam. And the **listener-signal surface** (above) is brain-work wearing an app's clothes. So: the *visual* app is easy; the *seam* and the *signal loop* are not.

---

## The shortest version
The whole stack does three jobs:
1. **Decide what deserves attention.** (stages 1–10 + freshness + the feedback edge)
2. **Give the model a small, safe, well-fed writing job.** (stages 11–13 + corks)
3. **Refuse to air anything that breaks trust.** (stages 14–18 + the gates)
…with **memory** beneath it and **cost** beside it.

The hardest parts: packet quality · grave/sensitive provenance + directness · Box 8b treatment policy · session pacing · generated voice quality after all constraints. **The app is not the hard part. The radio brain is.**
