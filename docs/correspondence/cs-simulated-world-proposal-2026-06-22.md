# Proposal — The Simulated Social World ("Layer 0 Living Source")

> **STATUS: PROPOSED — pending team sign-off (Eng1 / Eng2 / PO).** · **v0.2 · 2026-06-22** · Authored by CS Engineer at PO's request. · **Decision class:** Class 1 (new architecture + a methodology that touches the eval/moat claim — requires three-way sign-off before any hardening). · **Companion artifacts:** `docs/layer0-pool-acquisition.md` (the layer this feeds), `docs/build-map.md` (Track A + Parallel-track placement), decision **E3** (no scraping real people), ADR **J3** (relevance deferred — this unblocks it), `docs/airtime-budget.md`, `playground/data/seed-items.json` (the fixture this replaces/scales), `playground/scripts/world-sim-prototype.ts` (the throwaway proof-of-concept), `playground/runs/world-sim-prototype-output.json` (its output).
>
> **v0.2 changes (after a live proof-of-concept run + PO design pass):** (1) the world emits a **typed event stream**, not just posts; (2) **staggered arcs + two run modes** (batch/snapshot for tuning, live/background for demo); (3) **the listener becomes an actor** — a *listener activity stream* (revealed preference) is now the centerpiece relevance signal; (4) the prototype run results are banked as §A; (5) a product principle is flagged for promotion (§7).

---

## 1. The proposal in one paragraph

Build a small **agent-based social world**: ~12–20 simulated people, each with an identity, relationships, and one or two ongoing *life arcs*, who autonomously post, comment, react, and share across a shared timeline that advances in **ticks**. The output is a **typed event stream** (posts, comments, likes, shares, plus injected platform noise — ads, memes, suggestions, news), not a list of posts. Crucially, **the listener (Alex) is an actor too**, producing a *listener activity stream* — who Alex likes, comments on, and checks up on — which is the strongest relevance signal there is. Stagger the arcs, run roughly a simulated week or two, and harvest the feed + interaction graph + listener-activity. This living world becomes Drift's **Layer 0 stand-in**, the **corpus engine** for Track A, and the seed of the **acquisition demo** — three needs, one build — and it **unblocks relevance (ADR J3)** by producing both the candidate variety and the behavioral signal a relevance function needs.

---

## 2. Why — the problem this solves

Today Drift's only world is **45 hand-authored posts** around one fictional, **passive** listener (`seed-items.json`, `listener_001`). That fixture carried Phase 1 but cannot support what's next:

- **It's too small and too legible.** Hand-authored posts announce themselves; Drift's value is judging the *oblique* case.
- **There is no Layer 0 to test.** The pool-acquisition layer is specified but has no input to act on.
- **The corpus can't scale by hand** (Track A needs 40 → 150 → 500).
- **Relevance is uncomputed (ADR J3)** and the utility route is deferred for lack of a relevance signal *and* a real local/commercial cluster — the sim supplies both.
- **The listener is modeled as a static profile** — interests and follows — which is the *weakest* form of relevance data (see §6).

A simulated world addresses all of these at once, **without crossing E3** — no real person is scraped; the "people" are agents we own.

---

## 3. What it is

A bounded, agent-based simulation of a social feed:

- **A cast** of ~12–20 agents around the listener (Alex Rivera): close friends, friends, a sibling, acquaintances, local orgs, followed brands.
- **The listener as an actor** at the center — not just the audience (§6).
- **A typed event stream** (the "feed") agents post, comment, and react to.
- **A world clock** advancing in ticks (proposed: one tick = a half-day).
- **Staggered life-arcs** so agents are at different phases at any sampled hour.
- **Emergence by design:** seeded world-events + arcs produce reactions and storylines nobody scripted.

It is *not* a polished social app. v1 is **headless** — it emits JSON. A UI to *watch* the world is a later, demo-only addition.

---

## 4. THE CONTAMINATION WALL (load-bearing — read before §5)

> **The model that writes the world must never be the source of truth that grades Drift's judgment.**

If Claude authors the posts and Claude judges them, the test secretly measures *"can the model read what the model wrote,"* not *"can the engine read real human obliqueness."* The proof-of-concept made this concrete (§A): Priya's brilliant oblique post existed *because the model was told the secret and told to hide it* — it **performed** obliqueness. Convincing, but it's obliqueness-as-a-writer-imagines-it, not necessarily as real life is.

Binding rules if approved:

1. **The simulated world is for development, plumbing, selection-testing, relevance-tuning, and demos — NOT the gold eval set and NOT the moat evidence.** Gold labels and the inter-rater-agreement moat claim (Track A) stay grounded in **human-labeled, real-anonymized** material. The world feeds the *machine*; humans still feed the *proof*.
2. **Author model ≠ judge model where feasible** (generate on a cheaper/different model than the Sonnet judge).
3. **Optionally seed obliqueness from real-anonymized public posts** (E3-clean) so the world doesn't inherit only the generator's idea of "subtle."

---

## 5. Architecture (v1, deliberately thin)

### 5.1 The tick loop
```
for each tick (= half-day of world-time):
  1. advance clock; maybe inject a seeded world-event + platform noise
  2. for each agent (incl. the listener):
        perceive: my recent memory + my active arc-stage + my friends' recent events
        decide:   post | comment | react | share | do-nothing   (one LLM call for language acts)
        act:      append a typed event to the shared timeline
  3. cheap rules: likes/shares by closeness×salience (NO model call)
  4. propagate perception windows
end
→ harvest: typed event stream + interaction graph + listener activity stream
```

### 5.2 The typed event stream (NOT just posts)
A real feed is mostly *non-post* content, and most of it costs **zero model calls**:

| Event type | Source | Cost | Role for Drift |
|---|---|---|---|
| original post | agent | LLM call | the life event (signal) |
| comment / reply | agent | LLM call (short) | interaction graph + oblique signal |
| like / reaction | agent | **rule, no LLM** | interaction graph + weight |
| share / repost | agent | rule (LLM if quoted) | propagation; changes candidate type |
| DM | agent | LLM call | closeness; *never airs* (visibility gate) |
| ad / sponsored | platform pool | templated | **noise to reject** (commercial gate) |
| suggestion / PYMK | platform inject | rule | **noise** |
| meme / viral media | shared pool | pooled | noise + occasional signal |
| trending / local news | news pool | pooled | utility-route candidate |

The agent/platform split mirrors the Layer 0 stance: Drift's pool is the listener's *world*, not the platform's *engagement feed* — so the platform noise is precisely what Drift must filter out.

### 5.3 The agent + life arcs ("purpose" and "main events")
```
static:   id, name, age, location, relationships[], interests[], voice, source_kind
dynamic:  mood, active_arcs[], recent_memory (last N perceived events)
purpose:  active_arcs[] — a multi-stage life thread that ADVANCES over ticks,
          with disclosure_style controlling how openly it surfaces
```
The **experiences come from the arcs** — the engine of "what happens." An arc is the substitution for Stanford's plan-and-wander life-sim; the *main events Drift cares about are arc payoffs*, earned over many ticks. **Arcs must be staggered** (different start ticks) so any sampled hour shows lives at different phases. v1 memory is **"recent events + my arcs"** — deliberately *not* the full retrieval/reflection memory stream; flagged as a known limit, the tuning lever if realism falls short.

### 5.4 Run modes (build batch first)
- **Mode A — Batch / snapshot (build first):** run headless → write the timeline to a file → Drift runs against **frozen** snapshots. Reproducible; required for *tuning* (you can't tune against a feed that never holds still).
- **Mode B — Live / background (later, for the demo):** world runs continuously on a slow clock; Drift tunes in and filters in real time. Non-reproducible; this is the "watch radio mode on a live graph" demo.
- Same producer, two drains (write-to-file or emit-to-stream).

---

## 6. The listener activity stream — revealed preference (the relevance core)

> **This is the most important section of the proposal. It is what makes relevance actually good, and it was missing from v0.1.**

The listener is **not a passive center.** When someone uses social media *valuably* (not mindless scrolling), they are *directed*: they jump to specific friends' pages, like their posts, check what specific people are up to. **That directed behavior is the truest statement of "who is in my world right now"** — and it is the single strongest relevance signal available.

### The relevance hierarchy (three tiers, NOT equal)
```
1. STATED preference   — what's in the profile ("interests: surfing, coffee").
                         Weak. What you SAY you care about; static; can be stale.
2. PASSIVE exposure    — what the algorithm puts in front of you while scrolling.
                         NOISE. This is the valueless scroll Drift exists to ignore.
3. DIRECTED action     — who you GO CHECK ON: likes, comments, profile visits,
                         DMs, searches. GOLD. Revealed preference — behavior, not
                         words. The directed graph, not the algorithmic feed.
```

**Behavior doesn't lie.** A profile may say "sister Dana — close_friend," but if Alex gives her zero engagement for months, that's a **stale tie** (Layer 0 predicted it). Conversely, if Alex liked Priya's last five posts and visited her page twice this week, *Priya matters right now* regardless of any label. Static profile-matching yields mediocre relevance; **the listener's own behavior yields strong, dynamic relevance** — "boost the people Alex is actively orbiting this week."

### What the sim must produce (the missing data)
A **listener activity stream** alongside the feed — Alex's outbound actions per tick:
```
likes_given[], comments_made[], profiles_visited[], dms_sent[], searches[], dwell_signals[]
```
We generate it by making **Alex an actor**: each tick Alex also acts, driven by Alex's affinities and the feed. Drift's Layer 0 then consumes **both** — the feed (candidates) *and* Alex's activity (the closeness/relevance weighting). The directed-engagement graph falls out as exhaust, same as the agent interactions.

### Why this is the answer to "is there enough data for relevance?"
- **For building/tuning relevance — yes, and this is the half that was missing.** The sim supplies candidate variety (a Driftwood promo and a 101-closure *should* score high for Alex; a meal-kit ad *should* score ~0) **and** the behavioral signal that makes the function good. It also gives the utility route the real local/commercial cluster ADR **J3** said was absent — so this **unblocks J3**.
- **For validating relevance rigorously — no.** Same wall as gold labels: certifying the *correct* relevance is a human (PO) taste call. And relevance is a **deterministic computed feature** (interest overlap + entity match + locality + followed-entity boost + recency + **behavioral closeness**), not a data-hungry ML model — so the bottleneck is function design + a small human-labeled validation slice, not raw volume.

### Privacy note (load-bearing)
The listener activity stream is the **most sensitive** data in the system — it reveals who Alex watches. It is consented (Alex's own account) but must stay private and **never leak into what airs.** Highest value, highest care.

---

## 7. Permanent product principle (promote pending sign-off)

> **Weight what the listener seeks out; discount what merely passes by. Revealed preference (directed action) beats stated preference (the profile) beats passive exposure (the feed).**

This belongs in `docs/01-product-principles.md`, not just here — it is the operational definition of Drift's core stance (program the listener's *world*, not the platform's *engagement feed*). **Flagged for promotion; pending PO/Eng1 sign-off** (CS does not promote principles unilaterally).

---

## 8. How it plugs into Drift

- **Layer 0 stand-in.** The harvested feed *is* the candidate pool Layer 1 consumes; each event carries the Layer 0 metadata (`source_kind`, `relationship`, `posted_at`, `reciprocal_interaction_level`, `author_frequency`, `visibility`) — now *true of the world*, not fabricated.
- **Listener activity → closeness/relevance.** The activity stream feeds the dynamic closeness + relevance weighting (§6), unblocking J3.
- **Deterministic testing via snapshots** (Mode A): living world for realism; frozen hours for repeatable tests.
- **Corpus harvest** for Track A — subject to the §4 wall (machine corpus, not gold set).

---

## 9. Scope — what's in v1 and what's explicitly out

**In:** ~12–20 agents + the listener-as-actor; tick loop; typed event stream; 1–2 staggered arcs per agent; simple memory; platform-noise pool; listener activity stream; batch snapshot output; a tool to freeze an hour into a Drift fixture; a relevance pass against Alex's profile + activity.

**Out (v1):** no UI; no full memory/retrieval/reflection engine; no open-ended "runs forever"; no economy/geography sim; no real-anonymized seeding (add later per §4.3); not wired live into the Drift pipeline (produces fixtures; doesn't replace Layer 0 in code yet); Mode B (live/background) is later.

---

## 10. Cost & risk (self-audited)

- **LLM call volume — measured (proof-of-concept):** the throwaway run did **12 model calls** for 5 agents × 3 ticks and produced **17 feed events** (`4 posts, 7 comments, 2 ads, 2 memes, 1 suggestion, 1 news`); likes/ads/memes/suggestions/news cost **0 calls**. *(measured from the run, §A.)*
- **LLM call volume — computed estimate for v1:** ~15 agents × ~28 ticks × ~1 language-act call ≈ **~400 calls** for a two-week world, plus listener-activity language acts. *(computed from asserted cast/tick values; not measured at v1 scale.)*
- **Model — asserted:** generate on a small model (e.g., Haiku) for cost + light author/judge separation; the proof-of-concept used Sonnet to test the quality ceiling.
- **Top risks:** (1) *contamination* (§4) — walled, not eliminated; (2) *scope creep* — the most seductive [SUPPORT] artifact we could build (§12); v1 "out" list (§9) is the guard; (3) *arcs don't always drive posts* — observed in §A (Dana rode a running joke instead of her arc); realistic, but means signal coverage isn't guaranteed without a mix of agents.

---

## 11. Open decisions for the team

1. **Primary-purpose ordering** — PO indicated *all three*; recommend **test-bed-first**, corpus + demo as follow-ons. *Needs ratification.*
2. **Generator model** — Haiku (recommended) vs. Sonnet.
3. **Real-anonymized seeding** (§4.3) — adopt in v1 or defer? (Defer recommended.)
4. **Cast size / tick granularity** — 15 agents / half-day ticks / ~2-week run proposed.
5. **Promote the §7 principle** to `01-product-principles.md`? *(PO/Eng1 call.)*
6. **Relevance validation slice** — who labels the human relevance ground truth (PO), and how big?

---

## 12. Where this sits on the build map (the honest placement)

This is **Layer 0 substrate + Track A corpus engine + the relevance-data source** — all real, all on the destination path, and **off the Phase-2 critical path.** The current highest-value link is still the **claim-grounding output gate (L2b / build-map step 2.2).** A living world is the single most fun, impressive, time-consuming thing we could build that does **not** move us toward "one safe spoken segment." **Recommended sequencing:** a **parallel track**, time-boxed to the thin v1, explicitly not a reason to defer the gate. *Caveat to that:* this is also the thing that unblocks relevance/J3 and gives every later phase real data to tune on — so it earns parallel status, not deferral-to-someday.

---

## 13. Gate to start & done-condition

- **Gate to start:** team sign-off (Class 1) + decisions on §11.
- **Done-condition (v1):** the sim runs ~2 weeks of staggered world-time headless; emits a typed event stream + interaction graph + **listener activity stream** carrying Layer 0 metadata; a snapshot tool freezes a believable, noisy, oblique hour into a Drift fixture the existing engine scores end-to-end; and a relevance pass demonstrably ranks Alex-relevant items above noise using profile **+ behavior**.

---

## A. World-sim run + hour test (banked evidence, 2026-06-22)

Full instrument `playground/scripts/world-sim.ts` (staggered arcs, listener-as-actor, typed events + noise, answer-key separation). One ~96-call Haiku run over a calendar-coherent week (Dana birthday Sun Jun 21):

- 77 typed events (34 posts, 32 comments, 3 news, 3 ads, 3 memes, 2 suggestions).
- 75 listener actions (likes, profile visits, comments, shares, searches) — the revealed-preference stream.
- Snapshot: `world-sim-snapshot.json` (18 schema-valid IngestedItems, clean source-type spread, cast IDs match listener_001 closeness_map). Drops straight into the pipeline.

**Hour test (real pipeline run):** consentGate → MockMeaningClient + meaningBatch → scoreBatch (DEFAULT_SETTINGS) on the 18-item snapshot.
- 18/18 eligible.
- Bucket distribution: 18 ambient (no voiced in this sparse sample hour — expected).
- Top scores: community/local items (Ventura News farmers market ~0.371, Buena athletics camp ~0.371, Coastal Sounds show ~0.392, etc.).
- Quiet/personal items scored low: Dana vents 0.16–0.182, Priya terse "rip" 0.182.

**The two critical findings (validated by the run + hour test):**

1. **The heaviest signal is often the absence of signal.** Priya (worst week — mother's health declining) produced zero original posts. Only terse comments on unrelated threads + silent no-show on the Jun-19 dinner in Alex's calendar. Mateo: minimal presence after initial surf post. A feed-only hour misses them completely. The real signal is relational: *close tie + sudden quiet + missed calendar event*. This is the strongest possible validation of proposal §6 (listener activity + calendar + closeness layer) and proves the feed alone is insufficient.

2. **Raw revealed-preference rewards the loud, not the deep.** In the full world ranking (engagement counts), chatty/good-news Mark topped the list while close/grieving/silent Mateo scored very low. Pure "who Alex engaged with most" would deprioritize the people who most need quiet attention. Relevance must explicitly treat "close-tie-going-quiet" as a positive signal (not just positive engagement).

**Calendar-coherent emergence observed:** arcs + staggered timing produced Dana birthday buildup (wishes appearing), Priya's reactive-only behavior on her heavy day, and realistic thin post signal from heavy-arc agents.

**Honest limits (unchanged family):** arcs do not always drive originating posts (Priya mostly reacted); heavy agents can be near-silent in the visible feed. This is realistic and reinforces why the relational + activity layer must carry load beyond per-item scoring.

The snapshot + world data are now the first non-hand-authored corpus exercised end-to-end by the engine.

---

## B. Self-audit (per `governance/reporting-standards.md`)

- *measured:* current fixture = **45 posts / 1 listener** (read from `seed-items.json`, `listener.json`).
- *measured:* comprehensive world-sim run = **~96 calls, 77 typed events + 75 listener actions** (full week); snapshot = **18 IngestedItems** exercised through consent → meaning → scoring (hour test above).
- *asserted:* agent-based simulation is feasible at this scale — grounded in the Generative Agents precedent + both the prototype and full world-sim runs; the richer run supplies the first non-hand-authored corpus for the engine.
- *computed:* the ~400-calls/2-week estimate remains directionally valid (actual measured lower on Haiku for the week run).
- *asserted (the proposal's most important UNPROVEN claim):* that listener-behavior relevance (§6) outperforms profile-matching. The run strongly validates the *need* (absence + quiet-tie misranking) but the full relevance pass + J3 work is still the measurement point.
- *asserted:* the contamination-wall reasoning (§4) — now made concrete by two runs and the clean snapshot.
- *measured in hour test:* absence-of-signal and quiet-close-tie cases do not surface as high-scoring individual items; they require the relational + activity + calendar layer.
- *unverified — no check covers this yet:* full J3 relevance function on the revealed-preference stream; whether longer runs produce enough originating post signal from heavy arcs (feed vs. relational balance).

---

— CS Engineer, 2026-06-22
