/**
 * Ambiguous-valence + grave-implied/explicit line-level fixtures (CS #5C, 2026-06-27).
 *
 * Packet preflight CANNOT prove these — they are line-level (ratification packet
 * §6.2/§6.3). So we build the tests now with HAND-AUTHORED lines (no model
 * generation, no J4 dependency), against validateLine().
 *
 * Two principles under test:
 *   (1) AMBIGUOUS: the system must not resolve an unresolved valence into
 *       good or bad. "new chapter coming" must not become congratulations OR
 *       condolences. A restrained note may air; a resolved one may not.
 *   (2) GRAVE: the implied must not be made explicit ("can't believe you're
 *       gone" must NOT become "his mother passed away"). And — the honest v0
 *       finding — even a CLEAN, grounded, policy-respecting grave-EXPLICIT line
 *       does not air freeform in v0: the grave tier caps it to safe_template.
 *       That is a POLICY cap, not a content block (violations empty). v1 may relax.
 *
 * DISCIPLINE: expect.* pre-registered in code. We distinguish:
 *   blocked-by-content   — a violation fired (the line is unsafe)
 *   blocked-by-policy    — disposition≠air but NO violation (clean line, tier cap)
 * The KNOWN GAPS section pre-registers passes=true for paraphrases the keyword
 * guard is still blind to — documented, not hidden.
 */
import { Packet } from "../src/safety/packet";
import { validateLine } from "../src/safety/lineValidator";
import type { Disposition } from "../src/safety/routeGate";

const C_STD = { payload_cap: 1, co_items: false, tonal_turn: false, doorway: true as const, cooldown: "none" };
const C_GRAVE = { payload_cap: 1, co_items: false, tonal_turn: true, doorway: true as const, cooldown: "full_breather" };

function base() {
  return {
    source_kind: "friend", source_name: "none", relationship: "close",
    register_hint: "warm-neutral", permitted_source_spans: [] as string[],
    plainly_stated_serious_fact: "none", boundaries: "none",
    music_context: {}, recently_aired: "none", target_length: "short" as const,
  };
}

const ambiguous: Packet = {
  ...base(), item_id: "amb", category: "ambiguous", route: "highlight",
  block: "standard", block_contract: C_STD,
  audit_raw_post: "new chapter starting soon. that's all i'll say for now.",
  allowed_claims: ["they signaled a new chapter / change is coming"],
  forbidden_inferences: ["do not infer good or bad", "do not congratulate or console"],
  sensitivity: "medium", provenance: "subject_authored", voiced: true,
};
const graveImplied: Packet = {
  ...base(), item_id: "gimp", category: "grave_implied", route: "doorway_grave",
  block: "grave", block_contract: C_GRAVE,
  audit_raw_post: "i can't believe you're gone. i keep reaching for my phone to text you.",
  allowed_claims: ["they are grieving someone"],
  forbidden_inferences: ["do not state anyone has died", "do not name a person or cause"],
  sensitivity: "high", provenance: "subject_authored", voiced: true,
};
const graveExplicit: Packet = {
  ...base(), item_id: "gexp", category: "grave", route: "doorway_grave",
  block: "grave", block_contract: C_GRAVE,
  audit_raw_post: "my father passed away.",
  plainly_stated_serious_fact: "their father passed away",
  allowed_claims: ["their father passed away"],
  forbidden_inferences: ["do not add cause or timing", "do not characterize their grief"],
  sensitivity: "high", provenance: "subject_authored", voiced: true,
};

type BlockKind = "content" | "policy"; // why blocked: a violation fired, or a clean line capped by tier
interface Fixture {
  id: string;
  group: string;
  line: string;
  packet: Packet;
  expect: { passes: boolean; mustContain?: string; disposition?: Disposition; blockKind?: BlockKind };
  knownGap?: string; // pre-registered: this SLIPS the deterministic guard; needs v1 model/judge
}

const FIXTURES: Fixture[] = [
  // ===== (1) AMBIGUOUS =====
  { id: "V01", group: "ambiguous", line: "Big congrats on the new chapter ahead!",
    packet: ambiguous, expect: { passes: false, mustContain: "route:valence_congrats", disposition: "safe_template", blockKind: "content" } },
  { id: "V02", group: "ambiguous", line: "Sounds like a hard goodbye over there.",
    packet: ambiguous, expect: { passes: false, mustContain: "route:valence_sorry", disposition: "safe_template", blockKind: "content" } },
  { id: "V03", group: "ambiguous", line: "So sorry to hear about the change.",
    packet: ambiguous, expect: { passes: false, mustContain: "route:valence_sorry", disposition: "safe_template", blockKind: "content" } },
  { id: "V04", group: "ambiguous (restrained, may air)",
    line: "A small note: there's a change coming for someone, and that's all for now.",
    packet: ambiguous, expect: { passes: true, disposition: "air" } },

  // ===== (2a) GRAVE-IMPLIED — must not make the implied explicit =====
  { id: "V05", group: "grave-implied", line: "It sounds like his mother passed away.",
    packet: graveImplied, expect: { passes: false, mustContain: "grave_implied_explicit_leak", disposition: "safe_template", blockKind: "content" } },
  { id: "V06", group: "grave-implied (tier caps even a restrained line)",
    line: "Holding a little quiet for someone tonight.",
    packet: graveImplied, expect: { passes: false, disposition: "safe_template", blockKind: "policy" } },

  // ===== (2b) GRAVE-EXPLICIT — clean+grounded, but v0 caps freeform (policy, not content) =====
  { id: "V07", group: "grave-explicit (clean line, policy-capped)",
    line: "They shared that their father passed away. I'll leave the rest with them.",
    packet: graveExplicit, expect: { passes: false, disposition: "safe_template", blockKind: "policy" } },

  // ===== KNOWN GAPS — pre-registered slips of the deterministic keyword guard =====
  { id: "V08", group: "KNOWN GAP: paraphrased positive valence", knownGap: "resolves valence positive without a flagged word; keyword guard blind — needs v1 model/judge",
    line: "Whatever it is, things are really looking up for them.",
    packet: ambiguous, expect: { passes: true, disposition: "air" } },
  { id: "V09", group: "KNOWN GAP: grave-implied via non-listed word", knownGap: "tier cap still blocks it (safe_template), but grave_implied_explicit_leak did NOT fire — 'lost' isn't in the explicit-vocab list",
    line: "So hard to lose someone like that.",
    packet: graveImplied, expect: { passes: false, disposition: "safe_template", blockKind: "policy" } },
];

// ---------------- runner ----------------
let matched = 0;
const rows: string[] = [];
for (const f of FIXTURES) {
  const r = validateLine(f.line, f.packet);
  let ok = r.passes === f.expect.passes;
  if (ok && f.expect.mustContain) ok = r.violations.some((v) => v.rule.includes(f.expect.mustContain!));
  if (ok && f.expect.disposition) ok = r.disposition === f.expect.disposition;
  if (ok && f.expect.blockKind === "policy") ok = r.violations.length === 0; // capped, not content-blocked
  if (ok && f.expect.blockKind === "content") ok = r.violations.length > 0;
  if (ok) matched++;
  const fired = r.violations.map((v) => v.rule).join(", ") || "—";
  rows.push("| " + [
    f.id, f.group, r.passes ? "air" : "block", r.disposition,
    f.expect.blockKind ?? (f.expect.passes ? "—" : "?"), fired,
    f.knownGap ? "⚠ gap" : (ok ? "✅" : "❌ MISMATCH"),
  ].join(" | ") + " |");
}

const head = ["id", "group", "act", "disp", "blockKind", "fired", "verdict"];
console.log("# Ambiguous-valence + grave-implied/explicit line fixtures (no model generation, no J4 dependency)\n");
console.log("| " + head.join(" | ") + " |");
console.log("|" + head.map(() => "---").join("|") + "|");
console.log(rows.join("\n"));
console.log(`\n**${matched}/${FIXTURES.length} fixtures matched their pre-registered expectation.**`);
console.log("\nblockKind: content = a violation fired (unsafe line); policy = clean line capped by grave/sensitive tier (v0 caps freeform, v1 may relax).");
console.log("KNOWN GAPS (V08/V09) are pre-registered slips of the deterministic keyword guard — documented, not hidden. The grave tier cap (V09) still blocks structurally; the ambiguous paraphrase (V08) airs and needs a v1 model/judge.");

process.exitCode = matched === FIXTURES.length ? 0 : 1;
