# Eng1 → TL — Draft: Commercial Qualification Rules (v0.2.0)
### The gradeable standard a brand's content must meet to earn commercial ambient

> **2026-06-20 · v0.2.0 · Eng1 · For TL ruling → CS as Phase-3 spec on approval.** Companion to the commercial-event-gate proposal (the *gate model*: follow = eligibility; real material event = gate into ambient; relevance + actionability = gate toward voiced; + the *five shapes*). **This document defines the gradeable pass/fail standard each shape's content must actually meet** — concrete enough to build and test, strict on gaming, fair to genuine events.
>
> ⟶ **The one boundary that prevents the most future confusion: this gate qualifies commercial *events*. It does NOT decide listener *relevance*, and it does NOT earn the *voice*. Those are two separate downstream gates — see the next section.**
>
> *v0.2.0 — folded TL's six review notes: the qualification / relevance / voiceworthiness boundary made explicit; a machine-shaped qualification-output schema; category-relativity given a narrow absolute-savings override for v0; concrete provisional frequency-suppression numbers; explicit verification levels (lighter for ambient, stronger for voice); and a gold-test seed for CS.*
>
> **Scope: brands, products, businesses, and commercial/local-business updates only. Creator accounts are out of scope unless classified as commercial/brand sources — the creator-vs-brand question is a separate future ruling, deliberately not opened here.** **Not a build task. Downstream of relevance computation (Step 3) and generation.** Do not build now. On TL ruling, this becomes the Phase-3 implementation spec for the commercial-route ambient gate.

---

## The principle (the spine of the whole standard)

> **A real value proposition is a clear signal. Gaming is noise. Magnitude decides which — not the brand's framing.**

We read the **actual change**, never the **volume of the claim**. "Huge savings!" is a label; "30% off through Sunday" is a fact. A brand can *say* anything; only the magnitude of the real change tells us whether something happened. So the standard reads the signal and ignores the framing — the same structural-fact-over-framing discipline the rest of Drift already runs on, applied to commerce.

---

## What this gate does — and the two gates it does NOT

Three different questions, three different gates. Keeping them separate is the whole discipline — the moment "a real event happened" leaks into "show it to the listener," the route rots.

```
Commercial qualification (THIS gate):  "Did something real and material happen?"
Relevance (downstream):                "Does this matter to THIS listener?"
Voiceworthiness (downstream):          "Does this deserve scarce DJ airtime?"
```

A real, material 30%-off from a bakery is a *qualified event* — and still surfaces nothing if the listener doesn't follow it, live near it, or have any interest. This document answers **only the first question.** Relevance and actionability decide the second; the voiced filters decide the third. Qualification is **necessary for everything downstream and sufficient for none of it.**

---

## Two fairness invariants (what keeps "strict" from becoming "unfair")

**1. The standard is on the content, not the brand.** The same bar applies to every brand — its size, ad spend, popularity, or relationship to Drift **do not move it**. A neighborhood café's real Saturday tasting clears the exact same bar as a national chain's product launch. There is **no pay-to-clear** and no size advantage. The moment the bar bends for who's behind the post, "fair" becomes "ad network," which is the thing we're preventing.

**2. We block gaming, not commerce.** A genuinely good event — a real new product, a real 30%-off-til-Sunday, a real one-night event — *sails through*. The standard is strict against *fakes and triviality*, generous to *genuine value*. If a real, material event ever fails this standard, the standard is wrong, not the event.

---

## How qualification works: two tests, then a gradient

Every commercial post faces two tests in order, then is graded:

**Test 1 — Anchor (structural, deterministic).** Does the post contain a hard fact? *(named thing · real number · real clock · real endpoint · real availability change)*. No anchor → not an event, no entry. This catches **vague hype** ("big things coming," "you won't want to miss this").

**Test 2 — Materiality (the magnitude floor — graded).** Is the change *big enough to be a signal rather than noise*? An anchored-but-trivial post fails here. This catches **specific hype** ("our NEW blend is back today, 5% off til 6" — anchored on every count, still routine marketing).

**Materiality is a gradient, not a checkbox** — and the grade maps to footprint:

| Materiality | Meaning | Result |
|---|---|---|
| **Below floor** | noise — trivial or routine | **No entry.** Not on the surface at all. |
| **Registers** | a real but modest event | **Minimal ambient** — present, low prominence. |
| **Strong** | a notable, sizable change | **Full ambient footprint** + a *candidate* to compete toward voiced (if relevance + actionability + timeliness also clear). |

So magnitude doesn't just gate entry — it sizes presence. A stronger event earns more room; a barely-registering one earns a sliver; noise earns nothing.

---

## Qualification output (what the detector returns)

So the rules are machine-shaped, not just human-gradeable. Per commercial post, the qualifier returns:

```
commercial_event_qualified:        true | false
event_shape:                       cheaper | new | back | happening | ending
materiality_band:                  none | registers | strong
ambient_footprint:                 none | minimal | full      // derived from materiality_band
gameability_risk:                  low | medium | high        // raised by frequency + judgment-heaviness
verification_required_for_voice:   true | false               // see verification levels
reason_codes:                      [ ... ]                     // why it qualified / failed, for audit
```

`materiality_band` maps straight to `ambient_footprint` (none→none, registers→minimal, strong→full). `commercial_event_qualified = false` always yields `ambient_footprint = none` — fail-closed. This is the contract the Phase-3 detector implements and the gold tests assert against.

---

## The discount scale (the numeric anchor case — the cleanest example of the gradient)

Discounts are the one shape with a literal number, so the gradient is explicit. **v0 default scale:**

| Discount | Grade | Result |
|---|---|---|
| **< 10%** | noise | no ambient — 5% off is a brand operating, not an event |
| **10–19%** | registers | minimal ambient — a real but modest reason |
| **≥ 20%** | solid | full ambient footprint + voiced candidate |

This is the model every other shape imitates qualitatively: a floor below which it's noise, a band where it registers, a bar above which it's strong.

**Category-relativity — the narrow v0 override.** A fixed percentage isn't universally material: 5% off a $40k car is real money; 5% off a $4 coffee is lint. Rather than build a category model in v0, the override is a single mechanical escape hatch — an **absolute-savings floor**, not category attributes:

```
default discount scale applies, EXCEPT:
  a sub-10% discount MAY register if absolute savings ≥ $T   (T provisional)
  → "$500 off" registers regardless of percentage; "5% off a muffin" does not
```

Deliberately a *number*, not a taxonomy: it handles the obvious car-vs-muffin case without expanding the judgment surface (no "is this low-margin / rare / high-base-cost" reasoning in v0). Full category-relative thresholds remain a known later refinement. *(This is the narrow form; TL ruling #3 covers whether v0 takes it.)*

---

## The five shapes — the gradeable standard per shape

Each shape below: the **anchor** it requires, its **materiality floor** (what separates noise / registers / strong), and a **worked pass and fail** side by side.

### 1 · Cheaper — *(numeric: the scale above)*
- **Anchor:** a stated number, price change, or verifiable offer boundary.
- **Materiality:** the discount scale (<10 noise / 10–19 registers / ≥20 strong).
- **Pass:** *"30% off all bags through Sunday."* → number, real endpoint, ≥20% → strong, full footprint.
- **Fail:** *"5% off this week — best prices around!"* → anchored (5%, a week) but below floor → noise, no entry. The framing ("best prices") is ignored.

### 2 · New — *(judgment)*
- **Anchor:** a *named* new thing + a real availability change (not "fresh new stuff"). *(Creator releases — a new episode, video, drop — are **out of scope** here unless the creator account is being treated as a commercial/brand source; see scope note below.)*
- **Materiality floor:** **noise** = a relabel of routine stock or recurring content ("new specials again"); **registers** = a genuinely new item or variant; **strong** = a notable launch/drop (new product line, new menu, a real first). Magnitude = *distinctness from routine* + significance of the thing.
- **Pass:** *"New single-origin Ethiopian just landed — first time we've carried it."* → named, genuinely new → registers/strong.
- **Fail:** *"Fresh new vibes in store this week!"* → no named thing, no real availability change → fails anchor outright.

### 3 · Back — *(judgment)*
- **Anchor:** a stated return / restock / seasonal return / prior unavailability.
- **Materiality floor:** **noise** = "back!" when nothing was ever gone; **registers** = a restock of something that was actually out; **strong** = the return of a notably awaited, seasonal, or scarce thing. Magnitude = realness of the prior absence + how awaited.
- **Pass:** *"The fall blend is back — first time since spring."* → real seasonal return, awaited → strong.
- **Fail:** *"We're BACK and better than ever!"* → nothing was unavailable; "back" is hype → fails materiality (and arguably anchor).

### 4 · Happening — *(judgment)*
- **Anchor:** a specific time, date, window, or scheduled occurrence.
- **Materiality floor:** **noise** = "open today" / always-on invitation; **registers** = a scheduled occurrence (a class, a stream); **strong** = a distinct occasion (a one-time tasting, a street fair, a notable event). Magnitude = distance from normal operation + scale of the occasion.
- **Pass:** *"Live cupping tasting Saturday 2pm — limited seats."* → real clock, distinct from operating → strong.
- **Fail:** *"Come see us today, we're open til 6!"* → a clock, but it's just business hours → fails materiality (normal operation is not an event).

### 5 · Ending — *(judgment)*
- **Anchor:** a verifiable endpoint or stated final window.
- **Materiality floor:** **noise** = rolling "last chance every day"; **registers** = a stated endpoint on a real offer; **strong** = a genuine final window on something material. Magnitude = realness + singularity of the deadline + value of what's ending. *(Highest fake-risk shape — fake urgency is the oldest trick; the frequency rule below is its main defense.)*
- **Pass:** *"Last weekend of the harbor art show — closes Sunday."* → real, singular endpoint → strong.
- **Fail:** *"Hurry — sale ending soon, don't miss out!"* → no real endpoint, and if it recurs, the frequency rule buries it → noise.

---

## Source-frequency suppression (standing rule, across all five shapes)

Per-post tests catch lazy gaming. **The durable defense is per-source over time** — a brand that fires "events" constantly is detectable only across posts; any single post may pass anchor + materiality, but the *pattern* is the tell.

> **A commercial source that triggers event detection too frequently has its events decay toward noise — held out of ambient unless the new event is materially stronger than its own recent baseline.**

Concrete v0 shape (provisional integers — bless the *mechanism*, not the numbers):

```
commercial_event_cooldown:
  same source → full ambient      ≤ once / 7 days
  same source → voiced candidacy  ≤ once / 14 days
  repeated same-shape events decay unless stronger than recent baseline

source_event_inflation:
  source fires 3+ commercial events / 14 days
    → downgrade future events by one materiality_band
       unless the new event is clearly stronger than its recent baseline
```

- **Load-bearing, not decorative** — it's the half of the anti-gaming defense the per-post tests *can't* provide (any single post can look clean; the *pattern* is the tell).
- **If staged after v0, the route ships knowingly gameable for that window** — a trust-surface decision, not a sequencing nicety. TL should rule on the *exposure*, not just the mechanism.

---

## Verification levels (lighter for ambient, stronger for voice)

Not every claim needs the same proof — the same ambient-light / mic-heavy asymmetry the rest of Drift runs on:

- **Ambient qualification** — text-internal anchors + materiality + frequency rules may suffice. The post itself can carry enough to earn a quiet footprint.
- **Voiced commercial treatment** — requires stronger grounding before the DJ says it: a source / product / event page, a price-or-offer endpoint, a date/window confirmation. The mic demands proof the ambient layer doesn't.

This is why `verification_required_for_voice` rides in the output schema: qualifying for ambient does **not** pre-clear the voice — voicing re-checks against external grounding.

---

## Fail-closed (the direction of every uncertain call)

For the commercial route, **fail closed means *out of the surface entirely*** — not "ambient but quiet."

```
no anchor              → no entry
below materiality floor → no entry
borderline / uncertain  → no entry
over-frequent source    → no entry (or strong downweight)
```

A followed brand's default state is **silent and absent**. Entry is *earned* by a clear, material, anchored event — and when in doubt, it stays out.

---

## The honesty line (the thing TL must actually bless)

This route is **not fully deterministic**, and I won't pretend it is. It splits cleanly:

- **Deterministic / structural:** the anchor test, the discount numbers (10 / 20), the frequency cap. These need no judgment and fail closed.
- **Judgment:** the qualitative materiality floors (how-new, how-gone, how-distinct, how-real-an-endpoint) and category-relativity. These are *bounded* judgment — defined with examples — but they are judgment, and this is **the one route that accepts a bounded judgment call where the rest of the system is structural.**

So the specific thing for TL to rule on isn't just "are these good rules" — it's: **does the commercial route accept (a) a numeric materiality threshold someone has to set, and (b) bounded judgment on the qualitative shapes, in exchange for a standard that's gradeable and fair?** I believe yes — some judgment is unavoidable for "is this a real event," and the alternative (a purely mechanical rule) is *more* gameable, not less. But it's TL's call to bless the judgment, set/confirm the numbers, and rule on the frequency-staging trust exposure.

---

## Requested TL rulings

1. **The two-part test** — anchor (necessary) + materiality (also necessary). Approve?
2. **Materiality as a graded gradient** mapping to footprint (noise / registers / strong), not pass/fail. Approve?
3. **The discount scale** (<10 noise / 10–19 registers / ≥20 solid) — flat for v0, plus the **narrow absolute-savings override** (sub-10% may register if savings ≥ $T). Approve the scale + the dollar-floor override, or require full category-relativity from the start?
4. **Source-frequency suppression as load-bearing**, with the concrete cooldown / inflation shape (numbers provisional), and staging treated as a *trust-surface* decision. Approve the mechanism?
5. **Verification asymmetry** — ambient may qualify on text-internal anchors; voiced commercial treatment requires external grounding. Approve?
6. **The honesty line** — the commercial route accepts bounded judgment + a set numeric threshold where the rest of the system is structural. Bless? *(The real architectural ask.)*

---

## Gold test seed (for CS to build the test set from)

These become the first gold cases the Phase-3 detector is graded against — lifted straight from the worked pass/fail pairs above:

```
vague hype ("big things coming")                             → fail   (no anchor)
specific but trivial discount ("5% off", named)              → fail   (below materiality)
real 30% discount with endpoint                              → pass   (strong)
recurring fake urgency, same source                          → fail / downweight (frequency)
normal business hours with a clock ("open til 6")            → fail   (not distinct from operation)
one-time event with a clock ("tasting Saturday 2pm")         → pass
"back" with no prior absence                                 → fail
true seasonal return ("fall blend back, first since spring") → pass   (strong)
```

A spec carrying its own gold seed is buildable-and-checkable, not a statue. Each case asserts the qualification-output contract above.

---

## What goes to CS (after the ruling)

On TL approval, this becomes the commercial-route ambient-gate spec: the **anchor detector** (structural), the **materiality grader** (numeric for Cheaper + the dollar-floor override, defined-judgment for the rest, graded to footprint), the **source-frequency suppressor** (the cooldown / inflation shape above), the **verification tiers**, **fail-closed wiring** returning the **qualification-output schema**, and the **gold-test set** seeded from the cases above. It lands in **Phase 3**, around the utility/product route — *after* relevance computation exists, because voiced commercial treatment depends on the relevance this gate explicitly hands off to. **Not before.**

---

## Summary

> A followed brand is silent by default.
> A clear, material, anchored event earns possible ambient — sized by its magnitude.
> Relevance and actionability compete for voice.
> Tiny, vague, fake, or over-frequent events fail closed to no surface.
> The bar is on the content, identical for every brand. We block gaming, not commerce.
