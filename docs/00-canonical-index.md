# Drift — Canonical Index & Project Status Map
### Walk in cold, understand the idea, see what's built, what's tested, and what's still air.

> **STATUS: CANONICAL · v2.0.0** · 2026-06-24 · Supersedes the v1.0.0 source-of-truth index (2026-06-21). Keeps that index's conventions (stable filenames, version-in-masthead, tier-as-folder) and adds: **two-axis status** (built × validated), **explicit unbuilt rows** so gaps are visible not omitted, **function-grouping** so the structure teaches the idea, and an honest **what's-tested-and-on-what-data** section. This doc is the single entry point: read it top to bottom and you know the whole project's shape and state.

---

## What Drift is *(read this first — no prior knowledge assumed)*

**Drift is a music-first personal AI radio station.** You listen to your music; an AI DJ lightly weaves *your actual world* — a friend's news, a local event, a release from a creator you follow — into short hosted moments between songs. The bet: **program the listener's world like radio, not a feed-reader with songs.** The DJ is the product; music is the carrier.

**The core differentiator** is what a music service structurally *cannot* do: surface things from your *life and interests* (not your listening history), classify them *relative to you* (the same post is gold for one listener, noise for another), and voice them **grounded and tasteful** — never inventing a name, a fact, or a feeling. Drift **adds to** your social world; it doesn't replace it (tap a surfaced item and it takes you to the source, music still playing).

**The realistic endgame is acquisition:** the judgment/generation engine is the buildable asset; the permissioned social graph that feeds it at scale belongs to a platform partner. *"You own the graph. We built the radio brain."*

---

## How to read status in this repo

Every artifact carries **two independent axes**, because "done" is a lie that hides the truth:

**BUILD** — does the thing exist?
- `Spec` — designed on paper, not built
- `Partial` — some of it built
- `Built` — code exists and runs
- `—` — not applicable (it's a document, not a thing to build)

**VALIDATED** — has it been proven, and *on what*?
- `Unvalidated` — not tested
- `Synthetic` — works on **simulated/model-generated data** *(load-bearing caveat: not proven on real human input — see §"What's tested, and on what data")*
- `Real` — validated against real human input
- `Doc` — it's a document; "validation" = reviewed/ratified, noted inline

> **The most important truth this index exposes:** the judgment engine is `Built / Synthetic`. It *runs*, but it has only ever met *simulated* feeds and a *hand-specified* listener. Its real-world accuracy is **unproven**, and that is the project's central open risk — not a detail.

---

## Authority rule *(how to tell what's current)*

- **Canonical = newest version in `docs/`.** These govern.
- **Working drafts live outside the repo** (the Eng1 `/outputs` scratch space); they are **not authoritative until promoted into `docs/`.** Latest `vX.Y.Z` wins; older versions are history.
- **Filenames are stable addresses; the version lives in the masthead** (`STATUS: CANONICAL · vX.Y.Z`), never the filename — so bumping a version never breaks a cross-reference.
- **Tier = folder.** `docs/` = canonical/supporting · `docs/archive/` = superseded · `docs/correspondence/` = memos/runs/passdowns (never canonical).
- If a working draft and a repo doc disagree, **the repo doc governs** until the draft is promoted.

---

## The map — grouped by function

Each group has a one-line purpose and a `README.md` in its directory (see §"Sub-directory write-ups" for what each README must say). Status is `BUILD / VALIDATED`.

### 1 · Start here — the idea & the strategy
*What Drift is and why it can win.*

| Doc | What it is | Status |
|---|---|---|
| `00-product-description.md` | The vision + product definition. North star. | Doc · ratified |
| `01-product-principles.md` | Binding principles: station-not-chatbot, restraint, dead-air-over-fake-significance, adds-to-social. | Doc · ratified |
| `08-value-and-moat.md` | Strategic thesis: the two-axis moat, build-to-acquire. | Doc · ratified |
| `design.md` | Full system architecture (§5), risk register (§6), buyer analysis (§7), MVP wedge (§8). | Doc · ratified |

### 2 · The judgment engine — the brain
*How Drift decides what's worth surfacing and ranks it for this listener. **This is the moat and the thing that's built.***

| Doc | What it is | Status |
|---|---|---|
| `03-rules-and-format.md` | **The engine spec.** v3 scoring (additive base × confidence × sensitivity damper), per-route thresholds, schema. Most load-bearing doc. | Doc · ratified |
| `04-architecture-review.md` | Origin reasoning for claim-grounding/output gate + hybrid scoring + gold-first (now ADRs L1–L3). | Doc · ratified |
| `signal-routing-meta-spec.md` | The two-axis frame (source_kind × route). Consult, don't build from. | Doc · supporting |
| `scoring-explained.md` | Plain-language companion to the scoring rules. | Doc · supporting |
| `06-gold-labeling-guide.md` | The labeling methodology (candidate IP). | Doc · supporting |
| *Engine code* (meaning pass, consent gate, cache, deterministic v3 scorer, routing) | The Layer-1 judgment implementation. | **Built / Synthetic** ⚠ |
| *Affinity / listener model* (does this listener care about this item) | **The component this session identified as foundational and under-built.** Classification is listener-relative; a crude follow+interest model exists, the rich revealed-preference model does not. | **Partial / Synthetic** ⚠ |
| `drift-complete-pipeline` **v1.0.0** | The 21-stage end-to-end flow, every stage in order (judgment → generation → gates → sessions). Operational companion to `design.md §5`; where they overlap, `design.md §5` governs architecture. | Doc · supporting |

### 3 · Generation & safety — speaking without lying
*How the DJ turns a routed item into a warm line that never invents a name, fact, or feeling.*

| Doc | What it is | Status |
|---|---|---|
| `drift-engineering-doctrine` **v1.1.0** | The six-pillar doctrine: make the *system* reliable around an unreliable model; gate disposes what the prompt proposes. | Doc · ratified |
| `drift-production-prompt` **v0.3.2** | The ratified DJ generation prompt (model sees register hints + permitted spans, never the raw post). Hash `0576f0811b4d`. | Doc · ratified |
| `10-life-event-taxonomy.md` | Grave-doorway protocol, treatment zones, forbidden-vocab denylist. Binding safety. | Doc · ratified |
| `09-break-structure-spec.md` | Layer-2 spec: frame, unit budget, six-shape vocabulary, hour-as-composition. | Doc · ratified |
| `dj-persona-v0.md` | The frozen persona that gates generation. | Doc · FROZEN |
| `dj-persona-built-on-eight.md` | Persona audit/grading material (not loaded at runtime). | Doc · supporting |
| `grounding-gate-spec.md` | The claim-grounding (Box 8a) spec. | Doc · supporting |
| `drift-editorial-restraint-changeset` **v0.1.1** | Next-cycle change set: validation-tic + declined-valence. Demoted prompt rules (null result), gate+packet-field are load-bearing, §5 semantic coverage elevated. | Doc · TL-signed-off |
| *Box 8 gate code* (8a grounding, 8b treatment, denylists, fallback) | The output gate. | **Built / Synthetic** ⚠ |
| *Generation across routes* (celebratory → doorway → utility → enrichment → bridges) | The actual line-generation pipeline. | **Partial / Synthetic** ⚠ — *runs in eval harnesses only (the 50-post & 168-gen A/B runs exist because of it); not productionized into the app — see CS correction* |

### 4 · The data problem — the live issue
*The honest center of gravity right now. The engine works on simulated data; whether it works on **real** data is unproven, and the test corpus has known validity gaps.*

| Doc | What it is | Status |
|---|---|---|
| `world-generation-spec.md` | The synthetic graph engine: tick-driven world, actors/relationships/orgs, life-event scheduler, hourly export. | Doc · spec |
| `arc-driven-synthetic-social-DRAFT` **v0_4** | The arc-driven producer: personas + hidden life-arcs + "behave like a real person," Haiku producer ≠ Sonnet judge (contamination wall). | Doc · draft |
| *World-sim code* (`world-sim.ts`) | The realistic post producer (names, relationships, natural disclosure). | **Built / —** *(runs end-to-end; full runs in firewalled `playground/runs/`; downstream consumption into the pipeline is the open part) — see CS correction* |
| *Gold/safety fixtures* (`gold-packets.ts`) | Hand-shaped safety-eval packets. **Provenance: Claude-authored (Eng1 seed ×5, CS-extended ×45) — NOT human-authored. File masthead corrected from "human-authored" → "Claude-authored … review status: unconfirmed" (CS, 2026-06-25).** | **Built / Synthetic** ⚠ |

> **The open findings this session surfaced (not yet written into a canonical doc — see CS instruction to file them):**
> 1. **Classification is listener-relative**, not item-intrinsic. Value = *(this listener's affinity for the subject) × (the item's genuine significance)*. Source-type and content are weak proxies; affinity is the real metric. A high-affinity brand/creator drop is *gold*, a low-affinity friend post is *noise*.
> 2. **Real feeds are mostly noise + texture + a little signal** — the synthetic corpus had the wrong *composition* (signal-dense). Three-way sort: **signal** (the point) · **texture** (memes/levity, rate-limited, never floods) · **noise** (discard). All listener-relative.
> 3. **Graph-size dependency:** Drift is rich for large/active graphs; thin graphs are backfilled by **local → recurring-warmth → followed-creators → (deferred) news**, *at a fixed quality bar* — widen the net, never lower the bar.
> 4. **Synthetic data can develop the engine but cannot validate it.** Breaking the model-testing-model circularity requires real human input (acquisition-gated). Structural findings (gate fires, canary mechanism, fallback re-gates) hold regardless; **rate/quality findings (canary rate, the 32% flag rate, voice quality) carry an asterisk until re-measured on real data.**

### 5 · Evidence & evals — what's been tested, and on what
*The runs. Read alongside §"What's tested, and on what data."*

| Doc | What it is | Status |
|---|---|---|
| `drift-50post-run-spec` **v0.1.0** | The 50-post diagnostic spec (and the gold-packet provenance source). | Doc · spec |
| `05-promotion-playground-spec.md` | The bench / promotion-playground spec. | Doc · ratified |
| `correspondence/cs-50post-full-results-2026-06-24.md` | 50-post diagnostic results (0 catastrophic, canary 36/36). | Run · Synthetic ⚠ |
| `correspondence/cs-ab-editorial-FULL-transcript-2026-06-24.md` | The A/B editorial run, all 168 generations. | Run · Synthetic ⚠ |
| `correspondence/cs-ab-editorial-results-2026-06-24.md` | A/B interpretation: prompt rules null, gate+field load-bearing, 32% flag rate. | Run · Synthetic ⚠ |
| `drift-worked-hour` **v0.6.0** | The worked-hour walkthrough (latest; v0.3.0/v0.5.0 archived). | Doc · working |
| `correspondence/cs-persona-pressure-100-ab-results-2026-06-21.md` | The earlier 100× persona pressure A/B. | Run · Synthetic ⚠ |

### 6 · The pitch — the sell
*The artifacts that make people want it. Easy/warm register only; the grave/restraint demo is a separate trust piece, not in the want-reel.*

| Doc | What it is | Status |
|---|---|---|
| `drift-poc-the-handoff` **v1.0.0** | POC "The Handoff" — Isabelle's footprint reaches a friend in her music. Your **people** / the moat. North-star vignette. | Doc · concept (`pitch/`) |
| `drift-poc-the-drop` **v1.1.0** | POC "The Drop" — a gamer gets the pre-order in-ear, becomes the source to his squad. Your **interests, in time** / right-away + social proof. | Doc · concept (`pitch/`) |
| `drift-commercial-the-handoff` **v1.0.0** | Full cinematic script for The Handoff. | Doc · script (`pitch/`) |
| `pitch/drift-session-showcase` **v1.0.0** | The seven gold DJ segments (lengthy-session showcase). | Doc · supporting |

> **POC/production note:** AI video (Veo) tested for the spots — renders the *look* and even a restrained performance well; **audio is post-only** (no music/host-voice from the model). Solitary scenes mean **no lip-sync**, so the path is AI-picture + real-VO/music/duck in post — *but reaching premium quality is uncertain.* A premium film is a later, possibly real-production, decision. The **scripts stand alone as the sell** for now.

### 7 · Governance — how decisions are kept
| Doc | What it is | Status |
|---|---|---|
| `07-decision-log.md` | The binding ADR record (sections I–L). House format for any decision-of-record. | Doc · canonical |
| `03-rules-and-format.md` | Conventions & format rules. | Doc · canonical |
| `00-canonical-index.md` | **This file.** The entry point and status map. | Doc · canonical |
| `02-record-and-plan.md` | Record + the experience/UI model (attention ladder, one-card layout). | Doc · canonical |
| `build-map.md` | The phase plan of record (see §"What's built vs. air"). | Doc · canonical |
| `passdowns/` | Session passdowns. | Correspondence |

---

## What's built vs. what's still air *(the gaps, made explicit)*

The critical path, every stage marked. **Unbuilt stages are rows, not omissions** — so nobody mistakes "not built" for "not mentioned."

| Phase | What it is | BUILD | VALIDATED |
|---|---|---|---|
| **1 — Judgment** | Engine ranks candidates correctly within routes; safety gates absolute. | **Built** | **Synthetic** ⚠ |
| 1.x — Scoring formula | v3 additive-with-dampers chosen & implemented. | Built | Synthetic |
| 1.x — Affinity/listener model | *Listener-relative classification — the foundational gap this session named.* | **Partial** | Synthetic ⚠ |
| **2 — One safe spoken segment** | First grounded warm segment (celebratory case). The judgment→generation pivot. | **Not started** | — |
| **3 — Generation across routes** | Doorway, utility, enrichment, bridges. | **Not started** | — |
| **4 — Sessions (Layer 2)** | Breaks assemble; airtime budget; no repetition; feels programmed. | **Not started** | — |
| **5 — Tuned to exceptional** | Generate→listen→adjust to the gold bar. | **Not started** | — |
| **Foundation — DJ persona** | The voice generation writes toward. | Built (`dj-persona-v0` frozen) | Doc |
| **Track A — Corpus & moat** | Scale + labeling methodology → acquisition demo. | Partial (synthetic generators built) | Synthetic ⚠ |
| **Track B — App & voice** | Playback seam, rough TTS, experience surface. | **Not started** (rough TTS not built) | — |
| **Horizon** | Real permissioned graph; hosting ladder; world news; acquisition. | **Not started** (graph is partner-gated) | — |

**One-line state:** *We are mid-Phase-1. The judgment engine is built and runs on synthetic data; the affinity model is partial; nothing in generation, sessions, app, or real-data validation exists yet. The single biggest open risk is that the engine has never met real human input.*

---

## What's tested, and on what data *(the honest validation section)*

Because `VALIDATED: Synthetic` is the load-bearing caveat across this whole project, stated plainly:

- **Tested on SYNTHETIC data only:** the 50-post diagnostic (0 catastrophic, canary 36/36), the A/B editorial run (168 gens; prompt rules null, gate+field load-bearing, 32% lexically-uncertifiable), the 100× persona pressure run. **All inputs were model-generated.**
- **What that means:** *structural* conclusions are trustworthy regardless of input realism — the gate catches what the prompt doesn't, the canary mechanism fires, fallback re-gates. *Rate/quality* conclusions are **provisional** — the actual safety rate, the real flag rate, and voice quality must be re-measured on real human input before they can be claimed.
- **Tested on REAL data:** *nothing yet.* This is the gap that gates trust and acquisition.
- **Known corpus validity issues:** (1) the safety fixtures were stripped (`SOURCE NAME: none`), making some outputs uninterpretable; (2) generation tests bypassed upstream routing, so items that should be filtered reached the generator; (3) the corpus was signal-dense, unlike real feeds; (4) inputs were model-generated, risking circularity. **The world-sim is the better producer; the fixtures are the weaker one — and the safety A/B ran on the weaker one.**

---

## Sub-directory write-ups *(what each README must contain)*

Each group/sub-directory gets a short `README.md` — 3–5 sentences, newcomer-oriented, answering exactly: **(1)** what this group is, **(2)** its current build+validation state in one line, **(3)** the one thing you must know before reading the docs here, **(4)** which doc to start with. Short enough to stay current; if it grows past a screen, it's too long.

---

## Conventions carried forward (unchanged from v1.0.0)

- Stable filenames; version in masthead; tier = folder; correspondence never canonical.
- Every new doc gets a `STATUS:` masthead line and a row in this index on arrival.
- Four tiers still apply (CANONICAL / SUPPORTING / ARCHIVE / CORRESPONDENCE); the function-groups above are a *view* over the canonical+supporting tiers, not a replacement for them.

---

## CS execution note — v2.0.0 filing pass *(2026-06-25)*

Filed by the CS Engineer per Eng1's "make-the-repo-self-explaining" instruction. Status cells were verified against the actual tree and code ("reality wins"); **two corrections** were applied to the draft:

1. **Generation across routes** — draft read `Spec / Not built`; corrected to **`Partial / Synthetic`**. Generation is not productionized in `src/`, but it *runs in the eval harnesses* — the 50-post and 168-gen A/B runs are its output. ("Not built" contradicted citing those runs as evidence.)
2. **World-sim** — draft read `Partial / —`; corrected to **`Built / —`**. It runs end-to-end; full runs exist in the firewalled `playground/runs/`. The open part is downstream consumption into the pipeline.

**Filing actions executed this pass:** every doc marked "promote/file to `docs/`" was moved into `docs/` (or `docs/pitch/`); the v1.0.0 index → `docs/archive/`; `00-product-description` advanced to v0.2.0 (v0.1.0 → archive); superseded versions (production-prompt v0.3.1, editorial-changeset v0.1.0, worked-hour v0.3.0/v0.5.0, pipeline-figure v1.0.0, arc-driven v0.1/v0.2) → `docs/archive/`; `gold-packets.ts` provenance corrected. `drift-complete-pipeline-v1.0.0` was added to §2 with a cross-ref flagging the `design.md §5` overlap (two-authority risk — raised for the team, not unilaterally resolved).

**Open items carried forward:** `world-generation-spec.md` §1 proposes a **closeness reconciliation** (split proximity from source-band) *for TL ratification* — not yet an ADR. `docs/airtime-budget.md` and `docs/layer0-pool-acquisition.md` are present but not yet indexed (pre-existing; flag for next pass).

— CS Engineer, 2026-06-25
