# Team Review — Synthetic World "ventura-v0"
*CS Engineer · 2026-06-25 · for team input BEFORE we build Drift's brain on this data*

## Read this first (2 min)
We changed how we make test data. Instead of writing fake posts, we built a small
**town** — people, relationships, and hidden storylines — and let a week of posts
fall out of their lives. The bar for every post: **"would this exist if Drift never
existed?"**

We want your gut read on **one question: is this real enough to build the brain on?**
Everything else is secondary.

## Start here → [`FEED.md`](FEED.md)
The whole week, rendered to read like a feed. ~5 minutes. That's the thing to judge.

## Where it stands
- An independent rater (Grok, walled off from the answer key) scored the *first* cut
  **7/10**: texture great, but the hidden-storyline posts over-telegraphed
  ("thinking about some stuff…", "means everything").
- One targeted fix later, those tells are gone (people now post ordinary things or stay
  quiet instead of hinting), and the auto-checks pass: specificity 71%, signal density
  33% (a real feed is mostly noise), 0 clichés, firewall intact.
- Numbers are a proxy. **Please trust your read of `FEED.md` over the scorecard.**

## What's in this folder
| File | What it is |
|---|---|
| **`FEED.md`** | **the feed, readable — start here** |
| `feed-ventura-v1.json` | same feed, machine form (what Drift ingests) |
| `cast.public.json` | the town: 12 people + 8 local/brand/civic accounts, relationships, groups |
| `grok-rating-ventura-v1.json` | the independent realism review |
| `scorecard-ventura-v1.json` | the automatic quality checks |
| `BRIEF-FOR-GROK.md` / `RATING-BRIEF-FOR-GROK.md` | how we briefed the build + the rating |
| `post-writer.ts` | the generator (lives → posts), firewall + scorecard built in |

## 🔒 Not in this packet, on purpose
The **hidden storylines** and the **answer key** (which post came from which secret)
are firewalled — if Drift's brain or a blind realism judge ever sees them, the test is
rigged. They're available for human review on request; just don't wire them into
anything.

## The questions we actually need answered
1. **Is it real enough to build on?** (the call)
2. **Coverage:** fixing the over-telegraphing means the *heavy private* storylines now
   produce **no public signal** — correct *safe* behavior, but it leaves us light on
   positive "Drift *should* surface this" moments. Add more genuine surface-this cases
   so we test **perception**, not just **restraint**?
3. **Minor:** coffee/Driftwood is over-represented in the texture.
4. **Class-1, still unratified:** the `identity_policy` + `voice_payload` packet fields,
   and folding this into `world-generation-spec v0.2.0` rather than a parallel doc.

Drop notes inline or reply however's easiest — we hold building the brain until we hear back.

— CS Engineer, 2026-06-25
