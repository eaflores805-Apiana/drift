# Layer-2 Structure — Sets, Breaks, and the Shape Vocabulary
### v0.5.0 addition — FOLD INTO `docs/09-break-structure-spec.md`

> **2026-06-21 · Eng1.** This is **not a new document.** It is the v0.5.0 content for the existing break-structure spec — the session-programming structure, restated in its true currency. Merge it into `09-break-structure-spec.md` and bump that doc to v0.5.0; do not file it as a separate Layer-2 doc. *(Discipline: the break-spec is already the Layer-2 doc; this completes it, it doesn't compete with it.)*
>
> **What v0.5.0 adds:** (1) the **set/break currency** — the hour is counted in sets and breaks, not time; (2) the **six-shape vocabulary** the programmer composes from; (3) **hour-as-composition**. The unit budget, residual load, and owns-the-break rules from v0.3.0/v0.4.0 are unchanged — this sits on top of them.

---

## The currency: sets and breaks, not time

The hour was being sketched on a clock (:00, :08, :30…). That was wrong, for the reason the whole product rests on: **the music owns the clock.** Songs run 2:47 or 6:20; the listener skips; a track runs long. A break can't be scheduled at :30 because there is no :30 the music agreed to. Breaks happen **at the seams the music creates** — a song ends, that's an opening.

So the hour is counted in the music's own units:

- **A set** = a run of songs played back-to-back, bounded by breaks. Measured in **songs** (song 1, song 2, song 3), *never in minutes* — a song's duration is the music's business, and putting durations on the structure reintroduces the clock through the back door.
- **A break** = what happens *between* sets — where the host speaks. Measured in **units of listener load** (per the v0.3.0 budget), *never in seconds*.
- **An hour** = roughly *how many sets fit* — an **estimate**, because set length floats with song length. The format is the *pattern of breaks across the sets*, not a timetable.

**Why this matters beyond vocabulary:** every Layer-2 rule we already wrote is stated in *breaks*, not time — the unit budget is per-break, residual load accrues per-break, owns-the-break is named for the break. The clock was the one piece fighting the music-first invariant. Counting in sets and breaks makes the structure speak the same currency as its own rules. The system can reason about *how many songs ride between breaks* and *how heavy the break is* without ever consulting a stopwatch.

---

## The set shape vocabulary

A set is not one fixed shape. A good station varies its breathing — sometimes a quick song-and-talk, sometimes a long uninterrupted run. So the programmer composes from a **vocabulary of shapes**, each a run of songs bounded by breaks, varying on **two independent dials**:

- **how many songs** are in the run (the pace / the breathing), and
- **how heavy the bounding break** is (the load, in units).

A long music run is restful *if the breaks around it are light*; "four songs with no talk" is only heavy if you expect a rich break after each one. Width (songs) and weight (units) are separate — that separation is what lets the programmer answer "this feels heavy here" with "then use a lighter shape."

### The four free shapes *(chosen by feel)*

| Shape | Run | Bounding break | When |
|---|---|---|---|
| **Quick turn** | 1 song | light (≈1u) either side | keeps the host *present* — pops in between single songs |
| **Standard** | 2 songs | light open, fuller close (≈2–3u) | the everyday shape — most of the hour |
| **Deep cut** | 3–4 songs | light (≈1u) either side | **breathing room** — long music run, host gets out of the way |
| **Feature** | ~2 songs | into a heavy anchor (≈4.5–5.5u) | where a mid-hour primary moment / synthesis lands |

### The two ruled shapes *(rules welded on — not free choices)*

| Shape | Structure | The rule |
|---|---|---|
| **Top of the hour** | heavy anchor (≈5.5u) → short run | the **heaviest break** — carries the day's cross-set **synthesis**, opens a fresh hour. Distinct from *feature* by role (hour-opening + cross-day through-line), not just weight. |
| **Grave** | grave break (**owns it**, one item) → recovery run → **forced-light** next break | **coupled.** The serious beat owns the whole break — no co-items, regardless of what the unit math would permit — and the recovery run + forced-light next break are **part of the same shape.** The cooldown is not a separate decision; it is bolted to the grave shape. The music run carries the mood (per the persona's "return-to-music honors the tone"). |

*The grave shape is the one shape the programmer cannot decompose: owns-the-break (v0.4.0 hard floor) + the residual-load cooldown, fused into a single unit.*

**This is a starter vocabulary, not the locked set.** More shapes will surface by composing real hours and listening (a sensitive shape distinct from grave; a bottom-of-hour heavier than feature). Six is enough to make the *method* concrete; the real list is found by use.

---

## The hour as composition

An hour is a **sentence composed from the shape vocabulary**, not a clock filled in. Example:

```
Top of hour → Standard → Quick turn → Bottom-of-hour anchor → Deep cut (breather) → Standard → Reset
```

The rhythm the composition follows:
- **Two anchors per hour, spaced apart** — one opens the hour, one mid-hour. ("Twice an hour you get a big break," placed by *position in the sequence*, not at :00/:30.)
- **Light shapes carry the stretches between** — standards and quick turns keep the host present without overload.
- **A breather follows the weight** — a deep cut after an anchor is the cooldown made visible (heavy break → long music recovery). If a *grave* beat aired, its shape forces this breather automatically.
- **The hour ends on a reset** — a light handoff into the next hour's top.

Two encodings make a composed hour legible: **break weight** (which shapes are heavy) and **song count** (how long each run breathes). No minute appears anywhere — correct, because the music keeps the clock.

---

## Decided vs. by-ear *(the honest split)*

| | Status |
|---|---|
| Set/break currency (count songs, budget breaks, estimate the hour in sets) | **Decided** — replaces the clock |
| The two dials (run length × break weight) | **Decided** |
| The six-shape vocabulary as *options* | **Decided** (starter set; structural; **buildable now**) |
| Hour-as-composition; two anchors, light between, breather after weight | **Decided** (the rhythm) |
| Grave shape coupling (owns-the-break + forced cooldown fused) | **Decided** (inherits v0.4.0 hard floors) |
| **Which shape to reach for at which moment** | **By ear** — taste, tuned by composing real hours and listening |
| The exact anchor spacing across real song lengths | **By ear** |
| The full shape list (beyond the starter six) | **Found by use** |

**The by-ear half is gated on the generation layer.** You cannot tune "when a deep cut vs. a quick turn" against hours you cannot yet generate. So: the vocabulary and the composition *method* are buildable now (they are structural); the *selection logic* is found later, by listening — same discipline as the unit constants (framework decided, values found by ear). **Alphabet now; fluent sentences later.**

---

## Cross-references
- **Unit budget, residual load, owns-the-break** — `09-break-structure-spec.md` v0.3.0/v0.4.0 (unchanged; this sits on top).
- **"Let the music carry the moment"** — the persona center (`dj-persona-v0.md`); the deep-cut and grave-recovery shapes are that center made structural.
- **Grave-doorway protocol** — `10-life-event-taxonomy.md` (the grave shape's "owns it + mood carried" is its Layer-2 form).
- **Layer-1 / Layer-2 boundary** — ADR J1 (Layer 1 ranks within route; Layer 2 owns cross-route airtime and *now* the shape composition).
