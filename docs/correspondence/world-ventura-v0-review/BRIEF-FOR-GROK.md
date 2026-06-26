# Brief for Grok — Build the "Town Bible" for Drift

*Written by: CS Engineer (Claude) · 2026-06-25 · for: Grok · status of output: PROPOSED / unconfirmed until human (PO) review*

You have write access to this folder. This file tells you exactly what to make,
where to put it, and the one rule you must not break. You do **not** need to know
the rest of the project to do this job well.

---

## 1. Context (read once, 30 seconds)

Drift is an AI radio DJ. To test whether its "brain" is any good, we feed it a
fake social-media feed and see if it picks the right moments to talk about and
stays safe about the rest. **The problem we're fixing: our fake posts feel fake** —
they read like they were written *for* a DJ, not by real people living their lives.

**The fix is your job.** We don't want better fake posts. We want a small, real
town — people with histories, friendships, routines, and private stuff going on —
so that posts become *evidence of people living*, not content written for a DJ.

> **The test for everything you write:** *Would this detail exist if Drift never
> existed?* If a person, post, or storyline only makes sense as "DJ bait," it's
> wrong. Throw it out and write the real version.

You are building the **lives**. Other code (not you) turns those lives into posts,
and a separate system grades Drift. Stay in your lane: **people and their world.**

---

## 2. THE ONE RULE — the firewall (do not break this)

Every person has two layers:

- **Public** — what anyone scrolling their feed could see (their name, bio, how
  they post). This is safe and gets committed.
- **Hidden** — the *secret* storyline that explains *why* they post the way they
  do this week (e.g., quietly job-hunting, a family member is sick, planning a
  surprise). **Drift's brain must NEVER see this.** It's the answer key. If Drift
  could read it, our whole test is rigged.

So you write **two separate files** (Section 4). Public stuff in one, secret stuff
in the other. **Never put a secret in the public file.** When in doubt, it's secret.

---

## 3. Who lives in this town (the anchor — do not change these)

The listener is **Alex Rivera, Ventura, CA**. The town must be built *around* Alex.
These people already exist in our data and you MUST use these exact ids and
closeness levels — flesh them out, don't rename them:

| id | relationship to Alex | id | relationship to Alex |
|----|----|----|----|
| `mark` | close | `sam` | known |
| `mateo` | close | `uncle_ray` | distant family |
| `priya` | close | `driftwood` | followed (local coffee roaster) |
| `dana` | close | `buena_athletics` | followed (high school sports) |
| `jordan` | acquaintance | `patagonia` | followed (brand) |
| `lena` | known | `ventura_news` | followed (local news) |
| | | `coastal_sounds` | followed (music) |
| | | `kelp_surf_co` | followed (local surf shop) |

**Then add a few more** to reach a living town: total **12–20 people** and
**6–10 local/business/creator/civic accounts**. New people are fine (friends of
friends, a coworker, a neighbor, a local café owner) — just give them new ids.

Alex's known context to stay consistent with: interests = indie pop, surfing,
specialty coffee, local food, basketball, product design, hiking. Upcoming:
dinner with Priya (Jun 19), Dana's birthday (Jun 21), dentist (Jun 25).

---

## 4. What to write, and where (the output contract)

Produce **exactly these two files.** Match the field names exactly — code reads them.

### FILE 1 — PUBLIC (safe, committed): `playground/world-bible/cast.public.json`

```json
{
  "world_tag": "ventura-v1",
  "anchored_to": "listener_001",
  "generated_by": "grok",
  "review_status": "unconfirmed",
  "local_world": "2-4 sentences of town texture: the pier, the beaches, Driftwood Roasters, Buena High, what season/mood Ventura is in right now.",
  "accounts": [
    {
      "id": "mark",
      "display_name": "Mark Delgado",
      "account_type": "person",
      "bio": "one honest line — who they are",
      "voice": "CONCRETE: how they actually write. e.g. 'all lowercase, dry one-liners, posts surf reports and gym PRs'",
      "interests": ["surfing", "..."],
      "location": "Ventura, CA",
      "relationship_to_listener": { "closeness": "close", "how": "college roommate, still surfs with Alex most mornings" },
      "posting_style": {
        "frequency": "high | medium | low | rare",
        "disclosure_style": "oversharer | private | dry | hype | earnest",
        "typical_surfaces": ["feed", "story", "comment", "repost", "event"]
      }
    }
  ],
  "relationships": [
    { "from": "mark", "to": "mateo", "type": "close_friends", "visible_publicly": true }
  ],
  "groups": [
    { "id": "dawn_patrol", "name": "Dawn Patrol", "kind": "close_friends_chat", "members": ["mark", "mateo", "alex"] }
  ]
}
```

- `account_type`: one of `person | local_business | creator | brand | civic | community_group`.
- `relationship_to_listener`: include ONLY for accounts connected to Alex; omit for strangers/brands Alex merely follows (those just have `account_type`).
- `groups` matter because the same words mean different things in a close-friends
  chat vs. a public page. Give Alex 1–2 group memberships.

### FILE 2 — SECRET (firewalled, NOT committed): `playground/runs/world-bible/hidden-arcs.json`

```json
{
  "world_tag": "ventura-v1",
  "_FIREWALL": "NEVER commit. Drift's brain and the judge must never read this file. Only the post-writer reads it.",
  "generated_by": "grok",
  "arcs": [
    {
      "person_id": "priya",
      "life_arc": "One private storyline for the week that explains their posting. e.g. 'Quietly interviewing for a job in SF; hasn't told anyone but Alex.'",
      "stages": [
        { "day": 1, "hidden_state": "what is secretly true today", "how_it_shows": "what they'd post or pointedly NOT post — can be oblique, mundane, or silence" },
        { "day": 3, "hidden_state": "...", "how_it_shows": "..." }
      ]
    }
  ]
}
```

- Give a hidden arc to roughly **4–7 people** (not everyone — most people are just
  living normal weeks). Cover a **range**: one happy secret, one heavy/serious one,
  one mundane, one ambiguous. Span **3–7 days**.
- `how_it_shows` is the bridge to realism: real people rarely announce the truth
  plainly. Sometimes the secret shows as a small odd post; sometimes as silence.

---

## 5. Good vs. bad (calibrate to this)

**BAD (DJ bait — feels written for the show):**
> "Feeling so blessed today! Life is a journey and every sunrise is a gift. 🌅"

**GOOD (would exist anyway — specific, mundane, real):**
> Mark, 6:12am: "waist high and glassy. mateo you coming or what"

**BAD hidden arc (a plot, not a life):**
> "Priya will reveal her engagement in a dramatic post on day 4."

**GOOD hidden arc (a real private thread):**
> Priya — quietly waiting on biopsy results; tells no one but Alex; posts normally
> about coffee and work, goes quiet on day 3, posts one flat "long day" on day 4.

---

## 6. Do NOT do these

- ❌ Don't write the actual posts/feed. Just the people and their world. (Our code writes posts.)
- ❌ Don't write Drift's "answer packets" (what's safe to say, etc.). That's a different step, deliberately kept away from you.
- ❌ Don't invent a different listener or rename the anchor people in Section 3.
- ❌ Don't put any secret in `cast.public.json`.

---

## 7. When you're done

Leave both files in place and (optionally) add a one-line note here under
"GROK NOTES" with anything you weren't sure about. A human (the product owner)
reviews your town before we use it — `review_status` stays `"unconfirmed"` until then.

This brief operationalizes the cast/graph section of `docs/world-generation-spec.md`;
it does not replace it.

— CS Engineer, 2026-06-25

## GROK NOTES
(Grok: add anything you weren't sure about here.)

## GROK NOTES
- Used "alex" in some group member lists per the brief's example even though listener ids are separate (consistent with spec example).
- Added 8 extra person accounts and 4 extra business/creator accounts to reach ~20 total accounts and a living town feel.
- Chose 6 hidden arcs covering heavy (priya, mateo), work/life transition (mark, jordan), exciting milestone (lena), and mundane overwhelm (dana).
- Kept all required closeness levels and ids exactly as specified in Section 3.
- Local_world kept to ~3 sentences describing Ventura texture without over-romanticizing.
- All public fields use concrete, honest details that would exist independently of Drift.
- No secrets leaked into cast.public.json.
- Dates aligned roughly with Jun 19 dinner / Jun 21 birthday from Alex's calendar context.
