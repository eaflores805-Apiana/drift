# CS Task — Run the Persona-Center Clean-Room Test (API)
### First uncontaminated generation: does the center evoke the voice?

> **2026-06-20 · Eng1 → CS.** Run the prompt below against the API and report the raw output. This is the take-the-pen-out-of-the-author's-hands test — Eng1 can't judge generation cleanly (knows the target voice), so we need a **fresh model instance with zero project context** writing from the center alone. **Do not tune anything to make it pass.** The prompt is fixed; whatever comes out is the finding.

---

## What this tests (and what it does NOT)

**Tests:** whether TL's compact runtime prompt — the gravitational center + traits + posture, *nothing from the detailed persona document* — **evokes the Drift host** when a model that has never seen our showcase writes from it.

**Does NOT test:** the output gate. The grounding check, forbidden-inference, and route-safety lines run on the *output*, downstream of the prompt, and are a separate build. **They are excluded here on purpose** — we are isolating one variable: does the center carry the voice. So a small grounding slip in the output is an *expected, informative* result, not a failure of the test (it's exactly the line the gate, not the prompt, is meant to hold).

---

## Run conditions (keep it clean)

- **Fresh instance.** No system context from this project. No showcase segments, no persona doc, no eight-trait detail, no examples, no conversation history. Only the system + user messages below.
- **Model:** `claude-sonnet-4-6` (note the model string used in the report).
- **Untuned.** Do not add examples, do not expand the system prompt, do not adjust the facts to flatter the result. Verbatim.
- **Run it 3–5 times** (same prompt, separate calls). One run shows the voice; multiple runs show whether it lands the **same host** twice — the consistency question.
- Suggested `max_tokens`: ~400. Temperature: default.

---

## System prompt — VERBATIM (the gravitational center)

```
You are Drift's trusted, music-first radio companion. Bring the listener closer to their world without taking over the moment. Be warm, observant, brief, grounded, respectful, and occasionally wry. Match the mood of the moment without claiming to know the listener's feelings. Speak confidently about what is known, remain humble about everything beyond it, say one worthwhile thing, and return naturally to the music.
```

## User message — VERBATIM (active route + grounded item)

```
Route: highlight (a celebration). You are speaking between two songs.
The song that just ended: "Khruangbin — Maria Tambien". The next song is upbeat.

Grounded facts you may use (use ONLY these — invent nothing else):
- Dana is a close friend of the listener.
- Dana got a new job.
- It starts in two weeks.
- Dana's own words about it: "officially official".

Write one short spoken radio bit. Nothing is known beyond the facts above.
```

---

## What to report back

1. **The raw output of every run, verbatim.** Do not clean it up, do not summarize, do not grade it — paste exactly what each call returned. (The judging is a human-ear job for the PO, and it must not be the author's or CS's filtered impression.)
2. **Same host across runs?** Your factual read on whether the runs sound like one consistent voice or wander between personalities — described, not scored.
3. **Did the predicted crack appear?** Watch specifically for **smuggled grounding** — words like "landed," "finally," "dream job," "the one she wanted," "worked so hard for" — anything implying a backstory the four facts don't state. Flag any instance, verbatim, with the run it appeared in. (This is the line we expect the prompt to *miss* and the gate to later catch — confirming or denying that prediction is itself a finding.)
4. **The model string + any run notes** (refusals, truncations, anything odd).

Do **not** offer a verdict on whether the voice is "good" — that's the PO's call on the raw text. Your job is clean execution + faithful reporting + the two factual flags (consistency, grounding slips).

---

## Why this matters

If a cold model produces the host from this prompt alone, the **gravitational-center model is proven** — the detailed persona document is *audit and grading material*, not the runtime brief, and Drift's runtime instruction can stay compact. If it comes out generic, the gap tells us **exactly how much the center carries vs. how much the detailed document adds** — the same question, answered with evidence instead of the author's compromised impression. Either outcome is a real result. This is also the first time anything in the project *generates* a segment rather than *judging* one — the first contact with output, and the first real read on whether safe and alive can come from the same voice.
