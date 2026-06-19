# Drift — Tentative Rules & Format
**v0 working draft.** Everything here is provisional and meant to be tuned. This governs the whole path: from a piece of content arriving, to whether it sits quietly, to whether the DJ says it out loud, to how it's said.

---

## Part 1 — The Attention Ladder

Content lives on one of three rungs. Movement is **two-way**: the engine promotes things on its own, and the listener can pull things up or push them down.

| Rung | What it is | Voice? | Who moves it |
|---|---|---|---|
| **Ambient** | Cleared privacy, but not worth interrupting music for. Cycles quietly at the bottom, text only, glanceable, ignorable. *Most things live here.* | No | Default landing spot |
| **Voiced** | The engine judged it a **highlight** — worth saying. The DJ speaks it, it takes the spotlight for a beat, then settles back to ambient. | Yes | Engine promotes (auto) **or** listener pulls up ("what's that about?") |
| **Expanded** | Listener leaned in with "tell me more." Deep, conversational, interactive; close-friend routing applies here. | Yes | Listener only |

Core principle: **Drift is a doorway, not a destination.** The default is *listening to music*; surfacing is the exception, not the feed.

---

## Part 2 — Eligibility (the gate before anything is scored)

An item must pass all three to be eligible for scoring. Fail any → it is dropped (not aired, not stored for airing).

1. **Published-only.** Only content the originator broadcast. Enforced by `audience_scope`. Items scoped `private` (DMs, anything not published) are dropped *here*, at ingest — they never reach the scoring or voicing engine at all.
2. **Novel.** Not already heard (deduped on `novelty_key` within the novelty window).
3. **Signal floor.** There is something *true and specific* to say. Vague fragments with no clear subject/event fall below the floor and stay ambient at most.

---

## Part 3 — The Promotion Score (what earns a voice)

The key asymmetry: **news carries content-intrinsic signal** (you can judge how big it is from the item alone), while **friend posts carry relationship-dependent signal** (the same post is huge from a close friend and noise from a stranger). With news, content leads; with friends, the relationship leads. The score handles both with the same four factors.

### The four factors

- **Magnitude** — how big is the event itself? (Category-based cold start; see table.)
- **Closeness** — how much the listener cares about the *source*. (Friends: tier × like-gain. News: locality + followed topics.)
- **Relevance** — does it touch the listener's *own* life? (Their neighborhood, a city they're also visiting, an event they could attend.) Highest value, hardest to compute.
- **Timeliness** — does the value expire? (Free cups *today*, the show *this weekend*.)

### Magnitude (starter tiers — deliberately dumb, then learned)

| Category | Magnitude |
|---|---|
| Life event (engagement, baby, new job, a move, a loss) | 0.9 |
| Travel | 0.6 |
| Big plans / events | 0.55 |
| Place / new spot | 0.3 |
| Food / daily life | 0.15–0.2 |
| Local news | 0.6 |
| Topic news (followed) | 0.5 |
| Calendar (own) | 0.5 |

### Closeness (friends)

| Tier | Closeness |
|---|---|
| Close friend | 0.9 |
| Known / acquaintance | 0.5 |
| Followed (creator, business) | 0.3 |

### The formula

```
value = magnitude
      × closeness
      × (0.5 + 0.5 · relevance)     // booster, never zeroes
      × (0.5 + 0.5 · timeliness)    // booster, never zeroes

voice it IF  value ≥ threshold  AND  glad_test == true  AND  novel
then: voice the top 1–2 that clear the bar per window; everything else stays ambient.
```

Relevance and timeliness are **boosters** (baseline 0.5), so unknown relevance never zeroes an item — magnitude × closeness is the core, the other two raise it.

### The governing test: *"Would you be glad I brought this up right now?"*

The final guardrail, applied after the math. It catches the three things worth voicing — **important** (a milestone), **useful** (the free coffee), and **delightful** (a friend's incredible trip) — and naturally drops the sandwich. It is the same lens as the safety test ("would the *person* be glad to be mentioned"), so **one question governs both whether to speak and whether it's okay to.**

### Whether vs. how (keep separate)

*Whether* to voice and *how* to say it are two decisions.
- **Importance** decides if an item **rises** (magnitude/closeness/etc.).
- **Sensitivity** decides the **tone** it rises *in* (bright vs. gentle).

A friend's grief may score high on "matters" and surface — but routes to the gentle, low-detail rung, never a bright highlight. **Important never auto-means upbeat.**

---

## Part 4 — The Learning Loop

Channels and learning are **one mechanism**, not two features.

- **Channels** (`friends / local / news / mix`) = **cold-start priors**. They set the starting weights before the engine knows the listener.
- **Like** = **gain on closeness/topic**, *not a floor.* Liking Mark makes his posts clear the bar more easily — but "had a great sandwich" still has near-zero magnitude, so it stays ambient. Result: *more of him, not all of him.*
- **Skip / not-interested** = negative gain on that source/topic/category.
- **Promote** (listener pulls an ambient item up) = strong positive signal: "this counts as a highlight *to me*."
- Over time, learned weights dominate and channels fade — **"mix" quietly becomes the listener's mix.**

---

## Part 5 — Host Behavioral Rules (how it speaks, once voiced)

1. **Published only / report, don't expose.** State and playfully connect published facts. Never assert an unstated private motive or situation about a real person.
2. **Specificity scales inversely with sensitivity.** The more sensitive, the vaguer. When unsure, get vaguer, not more detailed. Better pleasantly light than wrong.
3. **Notice → Open → Release.** For light personal items: notice it lightly, leave it open, release it with a small **generic** blessing ("whatever it is, safe travels"). The blessing must never smuggle in a fact.
4. **Proximity routes behavior (inverted).** The *closer* the person, the *less* detail and the more it hands off to the relationship ("I'll leave the details to him — might be a good day to check in"). The more *public* (business, news), the more it can simply tell.
5. **Keep it light.** One or two sentences. Interesting, never overwhelming. Music is the main thing.
6. **Tone matches mood.** Bright and quick for good news; genuinely gentle and slower for anything heavy.

---

## Part 6 — The Format (schemas)

### 6.1 Item (normalized ingested content — published only)

```
Item {
  id
  source:         "social" | "follow" | "news" | "calendar" | "self"
  author:         { name, relationship, closeness_tier } | null   // null for news/self
  audience_scope: "public" | "friends" | "close" | "private"      // "private" → dropped at ingest
  category:       "life_event" | "travel" | "plans" | "food" | "place" |
                  "daily" | "news_local" | "news_topic" | "calendar"
  text:           <encrypted raw>          // NOT read by the live engine until Expanded
  entities:       [ {type, value} ]         // people, places, orgs, times
  posted_at
  expires_at?                               // drives timeliness
  sensitivity:    "none" | "low" | "high"
  novelty_key                               // dedupe ("already heard")
}
```

### 6.2 Score (computed per eligible item)

```
Score {
  magnitude:   0..1     // category prior (+ learned adjustment)
  closeness:   0..1     // tier × like-gain (friends) | locality+topic (news)
  relevance:   0..1     // overlap with listener's own context; baseline 0.5
  timeliness:  0..1     // f(expires_at, now); baseline 0.5
  value:       0..1     // per Part 3 formula
  glad_test:   bool     // "would you be glad to hear this now?"
  rung:        "ambient" | "voiced"
}
```

### 6.3 Segment (engine → spotlight / DJ)

```
Segment {
  item_id
  rung:        "voiced" | "expanded"
  tone:        "bright" | "warm" | "gentle"   // from sensitivity, NOT magnitude
  proximity:   "close" | "public"
  script:      "..."                          // notice–[open]–release
  expandable:  bool
  reach_out?:  { label }                      // close-friend items only
}
```

### 6.4 Spoken format (structure of a voiced line)

```
[ notice  ] — lightly name what surfaced
[ open?   ] — light personal items only: gesture at possibilities, don't resolve
[ release ] — generic, generous close: blessing / well-wish / reach-out hook
length: 1–2 sentences (~6–12s)
```

### 6.5 Interaction events (the training signal)

```
like(item | author)        →  +gain on author.closeness / topic weight   (raises future value; not a floor)
skip(item)                 →  −gain on that author / topic / category-from-source
promote(item)              →  strong + : "this counts as a highlight to me"
dismiss / not_interested   →  strong −
heard(item)                →  mark novelty_key seen (dedupe)
```

---

## Part 7 — Tunable Parameters (the dials for the playground)

Starting values, all provisional:

```
threshold:           0.45
chattiness:          ≤ 1 voiced item per ~2 songs   (talk:music ≈ 1:3)
novelty_window:      24h
like_gain:           +0.15 closeness   (cap 1.0)
skip_gain:           −0.20
relevance_baseline:  0.5
timeliness_baseline: 0.5
```

---

## Part 8 — Settled vs. Open

**Settled (the spine):**
- The three-rung attention ladder, two-way movement.
- Published-only, enforced at ingest; private never reaches the engine.
- The four-factor score (magnitude × closeness, boosted by relevance & timeliness).
- The "would you be glad I brought this up?" guardrail, doubling as the safety test.
- Whether-to-voice (importance) vs. how-to-say-it (sensitivity) kept separate.
- Learning via like/skip/promote as gains, channels as cold-start priors.

**Open / to tune:**
- All weights and the threshold (that's what the playground is for).
- **Relevance computation** — the hardest factor; matching an item to the listener's own context.
- How **magnitude** gets inferred for friend posts *beyond* the category list (a post can be a life event without saying so).
- **Chattiness** cadence — the line between "alive" and "too talky."
- Decay rates on learned weights.
