# _INBOX — Drop Zone
*Files dropped here are swept, classified, and filed by the CS Engineer each session.*

## How it works

1. Anyone (acting manager, Engineer 1, Engineer 2) drops files into this folder during or between sessions.
2. The CS Engineer (Claude) reads each file at the start of the next session, classifies it, and moves it to its proper destination under `docs/`, `experiments/`, or elsewhere.
3. After filing, the CS Engineer commits and pushes, then reports what landed where (with the post-push remote HEAD).
4. `_INBOX/` should be empty at the end of every CS Engineer turn.

## Naming hints

Filenames don't have to be perfect — the CS Engineer renames during filing — but a hint helps classification:

| Filename hint | Destination |
|---|---|
| `drift-decision-*`, decision logs | `docs/03-decisions/` |
| `drift-eng[12]-*` (Eng1/Eng2 reviews & specs) | `docs/03-decisions/` or `docs/01-spec/` |
| `drift-spec-*`, engine schema updates | `docs/01-spec/` |
| `drift-design-*`, `*.html`, `*.png` mockups | `docs/02-design/` |
| `passdown-*` | `docs/04-passdowns/` |
| `phase[012]-*` artifact | `experiments/phase-N-.../` |

## What does NOT go here

- Production code (goes to a future `src/` when we have one).
- Anything that should land on a feature branch — drop a passdown note instead.
- `.DS_Store` / OS junk (caught by `.gitignore`).
