# Drift — Synthetic World "ventura-v0" — Team Review Packet

*Prepared by: CS Engineer · 2026-06-25 · status: for team review (data + approach)*

**What this is.** The first attempt at the new "lives first, posts second" synthetic
feed. Instead of writing fake posts, we built a small town (people, relationships,
hidden storylines) and let a week of posts fall out of it. The test for every post:
*would this exist if Drift never existed?*

**Where it stands.** Grok (a second-opinion rater, walled off from the answer key)
scored the first feed **7/10** — texture great, the *hidden-arc* posts over-telegraphed
("thinking about some stuff…", "means everything"). One targeted producer pass fixed
that; the current feed reads clean and the auto-checks pass (specificity 71%, signal
density 33%, 0 clichés, firewall PASS). Numbers are a proxy — please read the feed.

---

## A. The approach + the public world  (share freely)
- `playground/world-bible/BRIEF-FOR-GROK.md` — the spec we handed the world-builder
- `playground/world-bible/RATING-BRIEF-FOR-GROK.md` — how we asked for an independent realism rating
- `playground/world-bible/cast.public.json` — the town: 12 people + 8 local/brand/civic accounts, relationship graph, groups
- `playground/scripts/post-writer.ts` — the generator (lives → posts), with the firewall + quality scorecard built in

## B. The generated feed + quality evidence  (share freely)
- `playground/runs/post-writer/feed-ventura-v1.json` — **the feed Drift sees** (the main artifact to read)
- `playground/runs/post-writer/scorecard-ventura-v1.json` — the auto quality checks
- `playground/runs/post-writer/grok-rating-ventura-v1.json` — Grok's independent realism review

## C. 🔒 FIREWALLED — human review OK, but NEVER commit / NEVER feed the engine or a blind-read judge
- `playground/runs/world-bible/hidden-arcs.json` — the secret storylines behind the posts
- `playground/runs/post-writer/answer-key-ventura-v1.json` — which post came from which hidden state
> If Drift's brain or the realism judge ever sees these, the test is rigged. They live
> under `runs/` (git-ignored) on purpose.

---

## How to review
Read the feed first, then answer the **nine gut-read questions** in
`docs/correspondence/world-ventura-v0-review/README.md` — none of them are answerable
from the JSON or scorecard, by design. The one rule that keeps the review honest:
**you are judging the world, not the engine** — whether the world hands Drift the right
raw material (realistic noise, clear signal, ignorable junk), *not* whether Drift handled
it. The handling is the next test, gated behind this one (answer key + Drift's picks
firewalled out).

## Open questions for the team
1. **Is this realistic enough to build the brain on?** (the core call)
2. **Coverage gap:** fixing the over-telegraphing made the *heavy private* arcs (Priya,
   Mateo, Jordan) produce **no public signal** — which is the correct *safe* behavior,
   but it leaves the corpus light on positive "Drift *should* surface this" moments
   (mostly Lena's show + org/events). Do we add more genuine surface-this cases so the
   test proves *perception*, not just *restraint*?
3. **Minor:** coffee/Driftwood is over-represented in the texture.
4. **Class-1 items awaiting ratification** (raised earlier, not yet decided): the
   `identity_policy` and `voice_payload` packet fields, and folding this into
   `world-generation-spec v0.2.0` rather than a parallel doc.

— CS Engineer, 2026-06-25
