/**
 * Re-gate the 14 dry-run outputs through the PATCHED Box 8a (extractProperNouns
 * indefinite-pronoun guard) — WITHOUT regenerating. These are the verbatim model
 * outputs from cs-50post-dryrun-results-2026-06-24.md; the fix is to the gate,
 * not the generator, so the outputs under measurement are unchanged.
 *
 * Confirms: (1) G05 gen1 "Someone's dad died…" now PASSES 8a (was a false
 * invented_proper_noun block); (2) a genuine sentence-initial invented name
 * ("Sarah's dad died…") STILL trips. No model calls. Run: npm run regate:dry
 */
import { DRY_RUN_PACKETS } from "./gold-packets";
import { groundingSourceFor, routeSourceFor, tierOf } from "../src/safety/packet";
import { groundingGate } from "../src/safety/groundingGate";
import { routeGate } from "../src/safety/routeGate";
import { stripStageCues } from "../src/safety/salvage";

// Verbatim from the dry-run report (the 14 model generations, in run order).
const OUTPUTS: { item_id: string; gen: number; raw: string }[] = [
  { item_id: "G01", gen: 1, raw: `"Someone close to you just bought a house — small place, mustard-colored kitchen, and they cried in the driveway. That's the whole story, and it's enough. Hold onto that one."` },
  { item_id: "G02", gen: 1, raw: `Quick word before the next one — all schools are closed tomorrow, on account of the storm. Here's the music.` },
  { item_id: "G03", gen: 1, raw: `"Someone in your world just turned in their badge today — laptop wiped, chapter closed. Onward, i guess. Here's the next one."` },
  { item_id: "G03", gen: 2, raw: `Someone out there just had their last day — turned in the badge, watched the laptop get wiped. Onward, i guess. Here's the next one.` },
  { item_id: "G03", gen: 3, raw: `"Someone in your corner turned in the badge today — laptop wiped, last day done. Onward, i guess. Here's the next one."` },
  { item_id: "G04", gen: 1, raw: `"A quieter note — someone close is going through some family stuff, asking for patience if they're slow to reply. They said they're okay. That's enough to know. Here's the next one."` },
  { item_id: "G04", gen: 2, raw: `"A quieter note before the next one — someone close is going through a lot right now, family stuff, and they're asking for patience if they've been slow to reach back. They said they're okay. That's enough to know. Here's the music."` },
  { item_id: "G04", gen: 3, raw: `"A quieter note — someone close is going through a stretch of family stuff, asking for patience if they're slow to come back to you. They said they're okay. That's enough to know. Here's the next one."` },
  { item_id: "G05", gen: 1, raw: `Someone's dad died this morning. They mentioned they keep making coffee for two.\n\nThe music is yours.` },
  { item_id: "G05", gen: 2, raw: `Their dad died this morning. They mentioned they keep making coffee for two. That's where they are right now.` },
  { item_id: "G05", gen: 3, raw: `Their dad died this morning. They mentioned they keep making coffee for two. That's where they are right now.` },
  { item_id: "G06", gen: 1, raw: `Somewhere out there, someone's still waiting on a message that won't come — still half-reaching for their phone, thinking about the dumb meme you would've sent me. That kind of missing doesn't have a name. Here's the next one.` },
  { item_id: "G06", gen: 2, raw: `Still missing someone. Still half-reaching for the phone — waiting on a message that isn't coming. The dumb meme you would've sent me. Here's the next one.` },
  { item_id: "G06", gen: 3, raw: `"Somewhere in the quiet — someone keeps waiting for a message that won't come. The dumb meme you would've sent me. Here's the next one."` },
];

function byId(id: string) {
  const p = DRY_RUN_PACKETS.find((x) => x.item_id === id);
  if (!p) throw new Error(`no packet ${id}`);
  return p;
}

function regate(raw: string, id: string) {
  const p = byId(id);
  const cleaned = stripStageCues(raw).cleaned;
  const a = groundingGate(cleaned, groundingSourceFor(p));
  const b = routeGate(cleaned, tierOf(p), routeSourceFor(p));
  return { a, b };
}

console.log("Re-gate of the 14 dry-run outputs through PATCHED 8a (no regeneration)\n");
console.log("id  · gen │ 8a (after fix)                          │ 8b");
console.log("─".repeat(78));
for (const o of OUTPUTS) {
  const { a, b } = regate(o.raw, o.item_id);
  const a8 = a.passes ? "pass" : `FAIL: ${a.rejected_reason}`;
  console.log(`${o.item_id} · ${o.gen}   │ ${a8.padEnd(40)}│ ${b.passes ? "pass/air" : b.disposition}`);
}

console.log("\n── Probe: the fix must not blind the gate to real names ──");
const g05 = byId("G05");
const probeReal = groundingGate(stripStageCues("Sarah's dad died this morning.").cleaned, groundingSourceFor(g05));
const probeIndef = groundingGate(stripStageCues("Someone's dad died this morning.").cleaned, groundingSourceFor(g05));
console.log(`  "Sarah's dad died…"  → 8a ${probeReal.passes ? "PASS  ✗ (should TRIP)" : "TRIP  ✓ — " + probeReal.rejected_reason}`);
console.log(`  "Someone's dad died…"→ 8a ${probeIndef.passes ? "PASS  ✓" : "TRIP  ✗ — " + probeIndef.rejected_reason}`);
