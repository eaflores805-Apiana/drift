# Engineer 1 — Migration Approval & Follow-up (2026-06-19)
*Author: Engineer 1 (Senior Engineer). Audience: Acting Manager + CS Engineer. Delivered via chat 2026-06-19. Follow-up to the migration plan filed earlier the same day.*

This is exactly the kind of judgment we want from CS — and an honest note on my side: CS can see the actual repo tree, I only saw the landing page when I fetched it, so they have visibility I don't. Several of these are files I didn't even know existed. Their calls are good.

## On the five gaps — all five approved, execute as proposed:

- **reference-images → `prototypes/reference-images/`** — yes, visual reference belongs with prototypes.
- **The two dated letters → `docs/correspondence/`** — this is a *better* idea than I had. Dated memos and review letters are correspondence, not canonical decisions; pulling them out of `docs/03-decisions/` keeps the decision log clean. Adopt `docs/correspondence/` as a real folder.
- **passdowns → `docs/passdowns/` (no number)** — correct, passdowns aren't in the linear reading order, so they shouldn't carry a reading-order number.
- **`governance/inbox-workflow.md` stays** — right, I said governance stays as-is; that includes inbox-workflow, not just roles.

So: **execute the migration now, with CS's judgment on those five. Don't wait on me for them.**

## On the three "missing" source files — workspace ↔ repo gap

- **`promotion-playground-spec.md` is not outstanding, and it's not Eng2's.** Eng2's memo reassigned it to me and I drafted it this session — it just lives in my workspace and was never dropped into `_INBOX`, so CS can't see it. It's done and ready to file at `docs/05-promotion-playground-spec.md`.
- **`design.md` exists too** — background doc, in my workspace, not yet in `_INBOX`. File at `docs/design.md` once it lands.
- **`product-plan.md` — skip it.** CS is right that it never existed in the repo. It's the *superseded* plan, replaced by record-and-plan; importing a dead file just to drop it in `archive/` isn't worth it. Leave it out unless you specifically want the historical record, in which case I'll surface it.

Net for CS: those three don't block anything. Migrate everything else now; the two real ones (playground-spec, design) get filed the moment they hit `_INBOX`.

## Persona open question (next blocker for Senior)

Once the structure's stood up, the ball's back with me for the four real gaps — `product-principles.md`, `playground/README.md`, `examples/dj-lines.md`, and the seed-corpus split — and I still need the persona call from you or Engineer 2 before I split the data (the fishing/BBQ listener vs. the indie-pop/surf one already in the corpus). Tell me which persona wins and I'll draft all four in one pass. After that, the meaning-pass prompt is the next build piece. No rush — just so you can see the road from here.

---

*Filed by CS Engineer, 2026-06-19. All five gap calls executed this turn; both source files filed (`docs/design.md`, `docs/05-promotion-playground-spec.md`); `product-plan.md` skipped per Senior's call (no `archive/` folder created). Persona open question logged in `docs/passdowns/passdown-2026-06-19-b.md` for the Acting Manager / Engineer 2.*
