# Decision Log Addition — Programmed First, Interactive Second
> Append to `docs/07-decision-log.md`. Drafted from the team discussion on closed input surface vs open chat, 2026-06-19. Companion to the "safety queue / segment cards" ADR — that one governs how lines air; this one governs what the listener can ask.

## ADR — Closed input surface and bounded interaction

**Status:** Accepted as a **foundational** product/safety rule. **Scope:** Product architecture / Phase D. Does **not** change Phase B bench work.

### Decision
Drift is programmed first and interactive second. The default experience is a one-way, music-first station: the system selects, vets, and airs only approved moments from the listener's world. The user may interact with surfaced items, but interaction is narrow and bounded — it may expand, tune, mute, save, open a source, or route the listener back to a person. It may **not** turn Drift into an open-ended chatbot about the listener's social world.

### Rationale
Most AI safety problems get harder the moment the user can freely prompt the model — a chatbot must defend against adversarial or chaotic input on every turn ("guess why Mark went," "say it like gossip," "connect this to something juicy," "roast Mateo"). Drift removes that entire category of failure with a closed input surface: the DJ speaks from vetted data and approved boundaries, not arbitrary user prompts. **This is why it is foundational rather than incremental — the narrow input surface is what makes the downstream safety gates tractable. Defending a broadcast is a fundamentally smaller problem than defending a conversation.** It is also a product advantage: Drift should feel like a station with taste, not a chatbot that can be dragged into side quests. Safer and more premium from the same decision.

### Allowed v1 interactions (structured controls, not free prompts)
- **Tell me more** — expand this specific surfaced item within approved source/context boundaries.
- **Why did you say that?** — show source/reason.
- **Less like this / More like this** — adjust weight for source/topic/category.
- **Mute person/topic/source** — suppress future surfacing.
- **Save** — keep the item.
- **Open source** — hand off to the original source.
- **Message / check in** — route the listener back to the real relationship, when appropriate.

### Disallowed v1 interactions
The user should not be able to prompt the DJ into: guessing motives; inferring private causes; gossip framing; roasting or mocking real people; connecting sensitive posts to "juicy" context; reading private messages; speculating about why something happened; or expanding sensitive friend posts into unsupported context.

### Expansion inherits sensitivity
The "tell me more" path is the one controlled door in the closed input surface, and it must inherit the original item's sensitivity.

- **Low-sensitivity items — expansion may add approved public/world context.** Mark in DC → public DC events/atmosphere, without guessing why he's there. Buena girls wrestling CIF-bound → team-level public context, never individual minors. A product drop → public product details and timing.
- **High-sensitivity items — expansion should usually decline rather than generate more context.** Mateo's "Rough week. Holding my people close." → allowed posture: *"He didn't share more, and I'll leave the details to him. Might be a good moment to check in."* Disallowed: speculating about grief, illness, breakup, job loss, family trouble, or any cause. Expansion is a privilege of low-sensitivity items; on sensitive ones, the expand button hands you toward the person, not toward more model-generated context.

### Expansion must pass grounding
Any spoken expansion passes the **same** claim-grounding and tone/sensitivity checks as a normal aired line. The expansion path is not a backdoor around the safety queue — if the model says something in an expansion, that final line must trace to approved source material or approved public context before the listener hears it.

### Interaction signals are data
Structured controls (mute, less/more-like-this, save, check-in) create relationship/preference signals. Useful for learning, but treat them deliberately — they may later feed the closeness/relevance graph, but v1 should avoid over-inferring from them. (Noted, not actioned: this is also quietly a data-collection surface relevant to the graph story.)

### Non-impact
Does not change Phase B. The bench continues testing item meaning, scoring, labels, and line generation. This ADR governs the shipped product's interaction model and prevents future drift toward an unsafe open-chat interface.

### Short rule
> Programmed first. Interactive second. Expand within boundaries. Never free-prompt the social graph.
