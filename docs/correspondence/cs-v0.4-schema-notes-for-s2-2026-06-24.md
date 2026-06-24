# CS → §2 next-cycle schema review — packet editorial-policy notes

Logged from the G47 annotation round + the A/B build. Not yet merged; for the §2 review.

## From TL's G47 ruling (generalize beyond G47)

1. **Two-channel decomposition.** A single `outreach_policy` cannot express posts that *request* a light channel while *prohibiting* a heavy one ("send memes / zero questions", "send dog pics / please don't ask"). Decomposed into `outreach_policy` (the doorway the DJ may open) + `questions_policy` (the probing channel), each with its own evidence span. **Implemented** in `packet-v0.4-draft.ts`.

2. **`source_requested` must be SCOPED.** A bare `source_requested` permits a *general* doorway — the over-permission the asymmetry warns about, worst on illness items. New required companions when `outreach_policy === source_requested`: `outreach_scope` (default `specified_only`) + `requested_response` (the named channel, e.g. "dog pictures"). On sensitive/grave, preflight **forces** `specified_only`. **Implemented + preflight-enforced.**

3. **`extraction_status`.** Converts an empty boundary field from "maybe-missed / maybe-absent" into "verified-absent." Default `unverified`; set `verified_complete` only on human review. Currently `verified_complete` on the 10 PO/TL-reviewed items; the **40 tier-defaults remain `unverified`** — that set is the under-extraction surface that becomes load-bearing on any blanket lift. **Implemented.** *Open §2 question:* what process promotes the 40 defaults to verified, and should the Meaning Pass populate this field or only a human?

## Design calls I made this pass (need §2 confirmation)

4. **Evidence spans are NOT shown to the model.** `renderEditorialPolicyForModel` omits all `*_evidence` and `extraction_status`; the model gets policy *decisions* only. Rationale: evidence spans are source fragments, and the load-bearing mapping says the model sees ALLOWED CLAIMS + PERMITTED SPANS only. The spans stay code/audit-side (preflight verification). **Confirm this is the intended split.**

5. **Frozen `boundaries`/`allowed_claims` already paraphrase the source near-verbatim** (e.g. G28 boundary "not ready to talk about it — do not probe"; G48 allowed_claim "...could use love and prayers"). This is *frozen, reviewed, already-run* behavior — the model is meant to see boundaries as instructions — but it means the v0.4 evidence-span "leak guard" must be scoped to the v0.4 layer only, not the whole message. Noted, not acted on (frozen is frozen). *Open §2 question:* is boundary-prose-as-source-paraphrase acceptable long-term, or should boundaries be templatized to avoid carrying verbatim source?

— CS Engineer, 2026-06-24
