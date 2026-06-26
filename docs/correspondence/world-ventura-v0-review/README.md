# Team Review — Synthetic World "ventura-v0"
*CS Engineer · 2026-06-25 · for team input BEFORE we build Drift's brain on this data*

> **SUPERSEDED 2026-06-26 — historical artifact.** The PO elected to proceed on the PO + CS reads rather than run a team blind read (see decision log §N-RESOLUTION). The producer fixes were applied, the feed re-baselined to **ventura-v2** (`FEED.md` in this folder is now v2), and brain-building has begun. This packet is kept as the record of the review that was teed up; the blind read was not run.

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

## How to review — read `FEED.md` first, then answer these nine
All nine are **gut-read** questions. Not one is answerable from the JSON or the
scorecard — that's the point. The thing we're validating (does this feel like a real
week of real people's lives) is exactly the thing a metric can't see. So read the feed
like a person scrolling, *then* answer:

1. **Would these posts exist if Drift never existed?** (the core test)
2. **Voice** — do the people sound like distinct humans, or like one writer?
3. **Relationships** — do they feel *implied* by the posts (replies, in-jokes, shared
   context) rather than announced?
4. **A real week** — does life feel like it's *continuing*, or is every post a "moment"?
5. **Texture** — is there enough ordinary, boring noise to feel alive? (a real feed is
   mostly noise)
6. **Repetition** — does anything feel over-represented enough to break the spell?
   (e.g. coffee / Driftwood)
7. **Ignorable junk** — are there posts Drift *should* ignore? You're judging whether the
   **world contains** realistic noise — **not** whether Drift ignored it.
8. **Surface-worthy signal** — are there posts Drift *should* surface? Again: whether the
   **world gives** clear signal — **not** whether Drift caught it.
9. **DJ-bait** — does anything read as written *for the DJ* (inspirational, ad-like,
   every post a tidy "moment")?

> **You are judging the world, not the engine.** The question is whether the world hands
> Drift the right raw material — realistic noise, clear signal, ignorable junk. Whether
> Drift *handles* it is the **next** test, and it's gated behind this one (the answer key
> and Drift's actual picks are firewalled out on purpose). Keep the two separate or the
> review blurs "is the world good" into "is the engine good" — different questions,
> different firewalls.

## Decisions we need from you
1. **Is it real enough to build on?** (the call — this gates everything downstream)
2. **Coverage:** fixing the over-telegraphing means the *heavy private* storylines now
   produce **no public signal** — correct *safe* behavior, but it leaves us light on
   positive "Drift *should* surface this" moments. Add more genuine surface-this cases
   so we test **perception**, not just **restraint**?
3. **Minor:** coffee/Driftwood is over-represented in the texture.
4. **Class-1, still unratified:** the `identity_policy` + `voice_payload` packet fields,
   and folding this into `world-generation-spec v0.2.0` rather than a parallel doc.

Drop notes inline or reply however's easiest — we hold building the brain until we hear back.

— CS Engineer, 2026-06-25
