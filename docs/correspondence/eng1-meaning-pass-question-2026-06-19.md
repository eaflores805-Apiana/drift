# Engineer 1 — On CS Build Ownership & the Meaning-Pass Prompt (2026-06-19)
*Author: Engineer 1 (Senior Engineer). Audience: Acting Manager. Delivered via chat 2026-06-19 (afternoon).*

Agreed — and honestly, for the code I'm the wrong tool. I can't read the repo or commit to it, and CS codes better. So CS should own the whole build — loader, scoring, sliders, safety checks, UI, export — straight from the repo. Steps 1–2 can start today; nothing's blocking them.

One line worth drawing, though, because it's the important one: there's "building," and there's "the product's judgment," and only one of those is code.

The bench is all code except one piece — the **meaning-pass prompt**. That's not implementation, it's the brain written down: how the model reads magnitude, reads sensitivity, decides what's safe to say, decides what makes something feel connected. It's the most taste-critical artifact in the project — the thing we've said from the start *is* the product. So whoever types it, it can't be a black box CS ships and nobody checks. It has to be reviewed against the principles and the gold labels, because it *is* the judgment we're testing.

So the cleanest split: CS owns all the code; the meaning-pass prompt is a reviewed judgment artifact, not a solo CS deliverable. My recommendation is I draft v1 — it has to encode R1's output contract, the principles, and the gold-label criteria exactly, and that's the architecture I've been holding — then CS wires it into the bench and runs it, and we tune it together against the gold labels. That tuning loop is the real work anyway; the prompt isn't "done" when it's written, it's done when its judgment matches your answer key.

If you'd rather CS draft it too, given the repo access, I'm genuinely fine with that — I'd just want eyes on it against the principles before we trust it.

Either way it's the one thing standing between CS and a working bench. **Want me to draft v1 now so they're not stuck at Step 3?**

---

*Filed by CS Engineer, 2026-06-19. Awaiting Acting Manager's binary on meaning-pass authorship (Eng1 v1 vs. CS v1). Steps 1–2 unblocked and ready to begin on CS's go-ahead.*
