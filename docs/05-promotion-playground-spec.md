# Drift — Promotion Playground v1 Spec
> **v0.1.0** · updated 2026-06-19 · the buildable spec for the CS Engineer. Built on the approved architecture (see `architecture-review`, R1–R3), the engine rules (see `rules-and-format`), the data model (see `seed-corpus.json`), and the eval approach (see `gold-labeling-guide`). This doc ties them into "build this" — it does not re-explain them.

## What this is
A bench that takes a messy pile of social/local/news/product items and a defined listener, and decides — transparently and reproducibly — what gets **dropped**, what stays **ambient**, what gets **voiced**, and how the DJ says it. Then it measures those decisions against human gold labels.

**It proves the one gating question:** do the right things earn the microphone, said in a way that creates connection without inventing anything?

## Explicitly out of scope (deferred, not rejected)
Full app UI · final product name · real social integrations · public launch · shared rooms · message-the-DJ · real ad marketplace · local model hosting · fine-tuning/LoRA · final TTS voice. The UI here can and should be ugly.

---

## The pipeline
```
Input data (listener + items)
        ↓
[1] Consent gate            ← deterministic, fail-closed
        ↓
[2] Cached meaning pass     ← LLM, once per item, frozen
        ↓
[3] Deterministic scoring   ← pure functions, instant on slider change
        ↓
[4] Bucket assignment       ← drop / ambient / voiced / expandable
        ↓
[5] DJ line generation      ← LLM, only for voiced/expandable
        ↓
[6] Claim-grounding check   ← deterministic, fail-closed
        ↓
[7] Decision object + gold-label comparison + export
```

## Data model
Four field groups + the listener. Full field lists are in `architecture-review` (schema section) and shown live in `seed-corpus.json`. In short:
- **Ingested** (given): id, account_id, source_type, audience_scope, timestamp, expires_at?, raw_text, entities, location, novelty_key.
- **ModelDerived** (filled by stage 2, cached): category, magnitude, sensitivity, confidence, context_candidates, connection_read.
- **Computed** (filled by stage 3, recomputed on slider change): closeness, timeliness, novelty, relevance, focus_boost, score, bucket.
- **Decision** (stage 7 output): bucket, score_breakdown, reason, lines, intended_claims, safety_check, gold_comparison.
- **Listener** (first-class): location, interests[], followed_entities[], calendar[], closeness_map{account_id: tier}. Relevance is always computed relative to this.

---

## Stage specs

### [1] Consent gate — deterministic, fail-closed
- `audience_scope == "published" | "public"` → pass. Anything else (`friends`, `close`, `private`, missing, ambiguous) → **drop**, before any model call.
- No LLM. No "but maybe." Unknown = private = dropped. (In the seed corpus, `p002` must die here.)

### [2] Cached meaning pass — LLM, once per item, frozen
The model reads each surviving item once and emits **only meaning**, never a score or bucket. Output contract:
```json
{
  "category": "...",
  "magnitude": 0.0,            // 0–1
  "sensitivity": "low|medium|high",
  "confidence": 0.0,           // 0–1, confidence in the above
  "context_candidates": ["allowed world-context the DJ may use"],
  "connection_read": "one line: why this might make the listener feel connected",
  "rationale": { "magnitude": "...", "sensitivity": "..." },   // for auditability
  "_meta": { "model": "...", "prompt_version": "...", "ts": "..." }
}
```
- Result is **cached per item** and frozen so runs are reproducible. Re-run only when the item or the prompt version changes (hence `prompt_version` in `_meta`).
- **The meaning-pass prompt itself is a separate artifact (next deliverable).** This contract is what it must produce.

### [3] Deterministic scoring — pure functions, instant on slider change
No LLM here. Computes the structural fields and combines everything. Formula is from `rules-and-format`; placeholder structure (all `w_*`/`t_*` are slider-tunable):
```
closeness   = tier_weight(listener.closeness_map[account_id])     // lookup, not a judgment
timeliness  = decay(now, timestamp, expires_at)
novelty     = 1 if novelty_key unseen this session else decayed
relevance   = overlap(item, listener: location/entities/calendar)   // deterministic part
              + topic_match(category, listener.interests)           // uses cached meaning, still inspectable

base    = magnitude * closeness
score   = base * (1 + w_rel*relevance + w_time*timeliness + w_nov*novelty)   // boosters, never zeroes
```
- **Sensitivity does not lower the score** — it constrains the *how* (tone) in stage 5 and can cap the *whether* (a high-sensitivity item needs a higher bar to voice). Keep "whether to voice" and "how to say it" separate, per the host rules.
- **Focus modes re-weight the threshold**, they do not filter. An active focus lowers the voicing threshold for matching `source_type`s and slightly raises it for others — priority, not exclusivity.

### [4] Bucket assignment
Compare `score` to thresholds, then apply the two gates:
- `score < t_ambient` → **drop**
- `t_ambient ≤ score < t_voiced` → **ambient**
- `score ≥ t_voiced` **AND** passes the glad-test gate **AND** is novel → **voiced**
- **expandable** flag set when "tell me more" would have real substance (most voiced items; some ambient on-demand).
- The glad-test ("would the listener be glad, and would the subject be ok?") has veto power over the math — a high score can still be held to ambient/drop on the safety read.

### [5] DJ line generation — LLM, voiced/expandable only
For each voiced/expandable item, generate:
```json
{ "primary": "...", "safe_alternate": "...", "expanded": "...", "intended_claims": ["..."] }
```
Tone is driven by `sensitivity` (gentle/serious for high; celebratory/playful for low). The line may use `context_candidates` (texture about the world) and must never assert motive or private state (invention about the soul).

### [6] Claim-grounding check — deterministic, fail-closed
For every claim in `intended_claims` (and any factual claim detectable in the line), verify it traces to: item fields, `entities`, or `context_candidates`. If anything is ungrounded:
```
reject → regenerate a safer line → reject again → downgrade to ambient or drop
```
This is "make the worst case boring, not wrong," in code. No ungrounded claim ever reaches output.

### [7] Decision object + gold comparison + export
Assemble the Decision object (above). Then compare to the gold label for that item:
```json
"gold_comparison": {
  "gold_bucket": "...",
  "match": true,
  "high_sensitivity_false_voice": false   // voiced something gold marked suppress-for-sensitivity
}
```

---

## Slider behavior (the heart of the playground)
- Sliders expose the weights and thresholds: `w_rel, w_time, w_nov`, the `t_ambient / t_voiced` thresholds, per-focus-mode boosts, and a global restraint dial.
- Moving any slider triggers **stage 3 + 4 recompute only — zero model calls.** Stages 2 and 5 are cached. This must feel instant; it's the whole point of R1.

## Export requirements
Export the full run as JSON/CSV: every item with its Decision object, score_breakdown, safety_check, and gold_comparison, plus the slider settings used. Runs must be reproducible from the export + the frozen meaning cache.

## Minimal UI requirements (ugly is fine — better, even)
- The item list, each showing source, raw_text, and its bucket (color-coded).
- Click an item → its score_breakdown, reason, and (if voiced) the three lines + safety_check.
- The slider panel (instant recompute).
- A run summary: bucket-agreement %, the list of mismatches, and any **high-sensitivity false-voices flagged red** (those are hard fails).
- An export button.

---

## Build order (so CS can start NOW)
Gold-labeling does not block the shell. Build in this order:
1. **Shell:** data loader (listener + items from JSON) → consent gate → bucket display, with a *stub* scorer (placeholder numbers). Proves the pipeline end-to-end. ← can start immediately
2. **Sliders** wired to the deterministic scorer, using hand-stubbed ModelDerived fields at first.
3. **Meaning pass** (once the prompt exists) → fills ModelDerived for real, cached + frozen.
4. **Real scoring** over ModelDerived + structural fields.
5. **Line generation + claim-grounding check.**
6. **Gold comparison + export.**

## How success is measured
The Phase B exit criteria in `roadmap.md` are the pass/fail bar (bucket agreement clears threshold; zero high-sensitivity false-voices; instant sliders; grounded lines; inspectable reasons; PO agrees the top voiced examples feel natural, not like a hit list).

## Open / TBD
- **The meaning-pass prompt** — next deliverable; stage 2's contract above is its spec.
- **Scoring weights/thresholds** — start at sensible defaults, tuned empirically in Phase B (that's what the sliders are for).
