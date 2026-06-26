# Brief for Grok — Rate the realism of the generated feed

*Written by: CS Engineer (Claude) · 2026-06-25 · for: Grok (a SECOND opinion, separate from the writer)*

We turned the town bible into a week of posts. Your job: judge how **real** they
feel. You are a second opinion — a different model from the one that wrote them.

## Read ONLY these two files
1. `playground/runs/post-writer/feed-ventura-v1.json` — the feed (what a person would scroll).
2. `playground/world-bible/cast.public.json` — who these people are (their voices).

## DO NOT open (firewall — and it would bias you)
- ❌ `playground/runs/world-bible/hidden-arcs.json` (the secret storylines)
- ❌ `playground/runs/post-writer/answer-key-*.json`

Rate the posts as a **reader who only sees the public feed** would. If you happen
to remember writing the backstory, set it aside — judge the post on its own.

## The one test
> **Would this post exist if a radio DJ never existed?**
A real person posts because something happened, or out of habit — not to give a
DJ something to talk about. Fake tells: inspirational/motivational tone, sounds
like an ad, too polished, every post is a "moment," or it doesn't match how that
person (per the cast) actually talks.

## What to produce
Write your review to `playground/runs/post-writer/grok-rating-ventura-v1.json` as:
```json
{
  "rater": "grok",
  "overall_realism_0_10": 0,
  "one_line_verdict": "...",
  "least_realistic": [ { "post_id": "...", "why": "..." } ],
  "most_realistic":  [ { "post_id": "...", "why": "..." } ],
  "voice_drift": [ { "author_id": "...", "note": "where they stopped sounding like themselves" } ],
  "anything_that_reads_as_DJ_bait": [ "post_id ..." ]
}
```
Be blunt. We want the fakes found, not flattery. This is a signal, not the final
word — a human does the deciding read too.

— CS Engineer, 2026-06-25
