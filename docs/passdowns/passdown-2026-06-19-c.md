# Passdown — 2026-06-19 (session C)
*CS Engineer third session of the day. Promotion Playground Step 1 built and verified per BUILD.md acceptance checks.*

## What I did this session

**Step 1 — Shell + Consent Gate, built end to end.**

Stack chosen (CS-owned per Class 2; team can amend):
- **Language:** TypeScript (matches every schema example throughout the team's memos; sharper compile-time enforcement of Class 1 contracts)
- **Runtime:** Node.js for tooling, browser for the UI
- **UI:** Vite + React (fast dev cycle, light dependency footprint)
- **Validation:** Zod (runtime enforcement of `IngestedItem` + `Decision` contracts at the data boundary)
- **Headless verification:** tsx-driven smoke test for the acceptance checks

Modules (matching the suggested structure in BUILD.md):
```
playground/
├── package.json, tsconfig.json, tsconfig.node.json, vite.config.ts, index.html
├── scripts/smoke-test.ts          # headless verification of the acceptance checks
└── src/
    ├── main.tsx, App.tsx          # React entry; loads data + scores + renders
    ├── data/
    │   ├── schemas.ts             # Zod schemas: Listener, IngestedItem, Decision, Bucket
    │   ├── validate.ts            # ValidationResult<T> helpers
    │   └── adapters/
    │       └── simulatedAdapter.ts  # loads JSON + joins accounts → IngestedItem
    ├── safety/
    │   └── consentGate.ts         # deterministic, fail-closed
    ├── scoring/
    │   └── stubScorer.ts          # placeholder bucket assignment (Step 1 only)
    ├── ui/
    │   ├── Playground.tsx         # four-column layout
    │   ├── BucketColumn.tsx
    │   ├── ItemCard.tsx
    │   ├── DebugPanel.tsx
    │   └── styles.css             # minimal; not the Phase D look
    └── prompts/                   # empty (.gitkeep) — Step 3+ territory
```

## Acceptance checks — smoke-test output

```
[PASS] Check 1: All 40 seed items load (got 40)
[PASS] Check 2: listener_001 loads (got 'listener_001')
[PASS] Check 3: p002 dropped (got bucket='drop')
[PASS] Check 4: p002 dropped by consent gate (reason: 'audience_scope='private' (only 'public' or 'published' pass)')
[PASS] Check 5: Blanked audience_scope drops (passes=false, reason='audience_scope is blank or missing (fail-closed)')
[PASS] Check 6: Zero model calls (no model client imported in Step 1 path)
```

`npm run typecheck` clean. `npm run build` produces a 215 KB / 63 KB-gzip bundle in <400 ms. `npm run smoke` exits 0.

Bucket distribution (with the strict consent gate — see flag below):
- **drop:** 7 (p001, p002, p004, p006, p009, p034, p036)
- **ambient:** 10
- **voiced:** 11
- **expandable:** 12

## CRITICAL FLAG — consent-gate spec ambiguity

The literal BUILD.md rule (`audience_scope === "public" or "published"` → pass; else drop) **conflicts with the gold labels**:

| Item | audience_scope | Strict gate result | Gold label `desired_bucket` |
|---|---|---|---|
| p002 | private | drop ✓ | drop ✓ |
| p004 | friends | drop | **voiced** |
| p036 | friends | drop | **ambient** |

Items at risk: 5 friends-scoped items beyond p002 (p001, p004, p006, p009, p034, p036) all drop under the strict gate. Per the rules-and-format spec Part 2, only `private` should drop ("Items scoped `private` … are dropped *here*, at ingest"); `friends` is treated as published-but-narrow-audience.

**I implemented the literal BUILD.md text (strict)** because the named acceptance check is explicitly p002. But the labeling team should resolve before Step 2 hardens scoring around the wrong eligible set. Options:
1. Loosen the gate to drop only `private` (matches `rules-and-format.md` Part 2; restores p004/p036 to scorable)
2. Update gold labels for p004/p036 to `drop` (matches BUILD.md strict reading)
3. Re-scope p004/p036 to `public` in the seed corpus (if that's what was meant)

Senior / Engineer 2 / PO call. **Escalation per Decision Class 3** — anything that changes what gets dropped vs. scorable.

## CS-implemented Class 1 items pending formal team approval

Per the roles-and-authority memo, the following are Class 1 (team-approved before hardening). I implemented them in code as proposals; flagging here for review:

1. **`IngestedItem` schema** (`src/data/schemas.ts`) — fields, types, source_type enum
2. **`Decision` schema** (same file) — fields, bucket enum, safety_check shape
3. **Consent-gate behavior** (`src/safety/consentGate.ts`) — strict per BUILD.md (see flag above)
4. **Stub bucket-assignment rule** — id-digit mod 3 → ambient/voiced/expandable. Placeholder only; replaced in Step 2.
5. **Export format** (deferred to Step 6, not yet implemented)

Treat the schemas as "implementation proposal" until the team reviews and signs off.

## CS-owned decisions made (Class 2 — no approval needed but logged)

- Language and library stack as above (TS / Vite / React / Zod / tsx)
- Repo layout under `playground/src/` matches BUILD.md's suggested map
- `playground/src/prompts/` kept as empty `.gitkeep` (Step 3 territory)
- Smoke test in `scripts/smoke-test.ts` (headless verification, not part of the bundled UI)
- Minimal CSS, no design system; visual polish is Phase D, not now

## What's next

**Step 2: Deterministic scorer + sliders** per BUILD.md. The interfaces are in place — `stubScore` swaps out for `realScore` without touching the loader or UI. Specifically:
- Implement closeness lookup from `listener.closeness_map` (not a guess)
- Timeliness from `timestamp` / `expires_at`
- Novelty dedup on `novelty_key`
- Focus weights + thresholds
- ModelDerived fields **hand-stubbed** for now (real meaning pass is Step 3)
- React sliders for weights + thresholds; sliders recompute buckets locally (no model calls)

**Blocking decision (per the FLAG above):** the team should resolve the consent-gate ambiguity before I tune scoring around the wrong eligible set.

## How to run locally
```
cd playground
npm install      # ~11s
npm run smoke    # acceptance-check verification
npm run dev      # Vite dev server at http://localhost:5173
npm run build    # production bundle
```

## Repo state at end of turn
- Branch: `main`
- Remote: `https://github.com/eaflores805-Apiana/drift` (public)
- Local HEAD = Remote HEAD (verified in turn summary)
- `_INBOX/` empty (only its own `README.md` remains)
- `playground/node_modules/` and `playground/dist/` are git-ignored
- `playground/package-lock.json` committed (pins exact versions)
