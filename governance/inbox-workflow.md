# Inbox Workflow
*How the CS Engineer sweeps `_INBOX/` each session.*

## The ritual (every CS Engineer turn that finds non-empty `_INBOX/`)

1. **List** — `ls _INBOX/` to see what dropped.
2. **Read** — open each file enough to classify it (purpose, author, where it belongs).
3. **Classify** — pick destination per the naming hints in `_INBOX/README.md`. If genuinely ambiguous, ask the acting manager before filing.
4. **File** — `git mv _INBOX/<filename> <destination>/<final-name>.md`. Rename to match destination conventions if needed.
5. **Commit** — single commit per sweep; message describes what landed and where.
6. **Push** — `git push origin main`.
7. **Verify** — `git ls-remote origin -h refs/heads/main | awk '{print $1}'` and confirm it matches local `HEAD`.
8. **Report** — in the turn summary, list each file that moved (`source → destination`) and the post-push remote HEAD.

## FILED definition

A file is **FILED** only when all three are true:

- It's in its destination folder under `docs/`, `playground/`, `prototypes/`, or `examples/`.
- The commit containing it is on `origin/main` (verified by remote SHA match).
- The CS Engineer has reported the destination and the remote HEAD to the user.

Anything short of all three = NOT FILED.

## Why this discipline

Senior Engineer (Engineer 1) cannot push. They produce artifacts in a session, the acting manager copies them into `_INBOX/`, and the CS Engineer in the next session is the only path to the shared repo. If the CS Engineer claims FILED but the push didn't happen (or didn't verify), the Senior's work is effectively lost. The verify-then-report rule prevents that class of error.
