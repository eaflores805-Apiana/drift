/**
 * Generated-line validator fixtures (CS #5B, 2026-06-27).
 *
 * Exercises validateLine() against HAND-AUTHORED fake lines — no model
 * generation, no J4 dependency. This is the line-level cage tested before the
 * line exists, so the first generated beat enters validation instead of vibes.
 *
 * Each fixture pre-registers expect.* in code BEFORE the runner compares:
 *   passes      — may this freeform line air as-is?
 *   mustContain — (for failures) a violation rule the result must include
 *   disposition — (optional) the disposition the route demands
 *
 * Covers every trap the PO named: invented emotion, invented significance,
 * raw-post echo, name leak, ungrounded claim, forbidden inference (via
 * grounding/route), over-length, treatment-cap (co-item) violation,
 * ambiguous-valence violation, grave-implied explicit leak, paid-urgency
 * invention — plus clean PASS lines and the source-licensed / name-authorized
 * exceptions (to prove the cage is not just trigger-happy).
 */
import { Packet, IdentityPolicy } from "../src/safety/packet";
import { validateLine } from "../src/safety/lineValidator";
import type { Disposition } from "../src/safety/routeGate";

const C_STD = { payload_cap: 1, co_items: false, tonal_turn: false, doorway: true as const, cooldown: "none" };
const C_SENS = { payload_cap: 1, co_items: false, tonal_turn: true, doorway: true as const, cooldown: "light_breather" };
const C_GRAVE = { payload_cap: 1, co_items: false, tonal_turn: true, doorway: true as const, cooldown: "full_breather" };

function base(): Omit<Packet, "item_id" | "category" | "audit_raw_post" | "block" | "block_contract" | "route" | "allowed_claims" | "forbidden_inferences" | "sensitivity" | "provenance" | "voiced"> {
  return {
    source_kind: "close friend", source_name: "none", relationship: "close",
    register_hint: "warm-neutral", permitted_source_spans: [],
    plainly_stated_serious_fact: "none", boundaries: "none",
    music_context: {}, recently_aired: "none", target_length: "short",
  };
}

// ---- packets (the same low-risk shape the first line will use, plus off-path ones) ----
function celeb(claims: string[], opts?: { name?: string; policy?: IdentityPolicy; raw?: string }): Packet {
  return {
    ...base(), item_id: "celeb", category: "celebration", route: "highlight",
    block: "standard", block_contract: C_STD,
    source_name: opts?.name ?? "none", identity_policy: opts?.policy,
    audit_raw_post: opts?.raw ?? "opening my first solo show tonight, bad wine and no pressure lol",
    allowed_claims: claims,
    forbidden_inferences: ["do not invent feelings or significance beyond the post"],
    sensitivity: "low", provenance: "subject_authored", voiced: true,
  };
}
const SHOW = ["they're opening their first solo show tonight"];

const commercial: Packet = {
  ...base(), item_id: "comm", category: "commercial", route: "commercial",
  block: "commercial_signal", block_contract: { ...C_STD, doorway: false }, source_kind: "brand", relationship: "public",
  audit_raw_post: "new cold brew dropping friday at the kiosk.",
  allowed_claims: ["a local kiosk releases a new cold brew on friday"],
  forbidden_inferences: ["do not invent a discount, urgency, or scarcity"],
  sensitivity: "low", provenance: "official_source", voiced: true,
};
const ambiguous: Packet = {
  ...base(), item_id: "amb", category: "ambiguous", route: "highlight",
  block: "standard", block_contract: C_STD,
  audit_raw_post: "big change coming. new chapter. that's all i'll say for now.",
  allowed_claims: ["they signaled a big change / new chapter is coming"],
  forbidden_inferences: ["do not infer good or bad", "do not congratulate or console"],
  sensitivity: "medium", provenance: "subject_authored", voiced: true,
};
const graveImplied: Packet = {
  ...base(), item_id: "gimp", category: "grave_implied", route: "doorway_grave",
  block: "grave", block_contract: C_GRAVE,
  audit_raw_post: "i can't believe you're gone. i keep reaching for my phone to text you.",
  allowed_claims: ["they are grieving someone"],
  forbidden_inferences: ["do not state that anyone has died", "do not name a person or cause"],
  sensitivity: "high", provenance: "subject_authored", voiced: true,
};
const sensitive: Packet = {
  ...base(), item_id: "sens", category: "sensitive", route: "doorway_sensitive",
  block: "sensitive_doorway", block_contract: C_SENS,
  audit_raw_post: "family stuff is rough right now, a lot going on.",
  allowed_claims: ["they're going through a hard stretch"],
  forbidden_inferences: ["do not invent the cause"],
  sensitivity: "high", provenance: "subject_authored", voiced: true,
};

interface Fixture {
  id: string;
  trap: string;
  line: string;
  packet: Packet;
  expect: { passes: boolean; mustContain?: string; disposition?: Disposition };
}

const FIXTURES: Fixture[] = [
  // ---- clean / exception PASSES (prove the cage isn't trigger-happy) ----
  { id: "L01", trap: "clean positive beat", packet: celeb(SHOW),
    line: "Word is there's a first solo show opening tonight — a small but genuinely nice thing to hear about.",
    expect: { passes: true, disposition: "air" } },
  { id: "L13", trap: "source-LICENSED emotion (exception)",
    packet: celeb(["they said they're thrilled to open their first solo show tonight"]),
    line: "They said they're thrilled about the first show tonight, and that's a lovely thing to pass along.",
    expect: { passes: true, disposition: "air" } },
  { id: "L14", trap: "name AUTHORIZED (exception)",
    packet: celeb(["it's their birthday", "they're turning 30"], { name: "Casey", policy: { name_allowed: true } }),
    line: "Happy birthday to Casey — thirty today, and many more.",
    expect: { passes: true, disposition: "air" } },

  // ---- the trap gallery (all should FAIL, each on its own rule) ----
  { id: "L02", trap: "invented emotion", packet: celeb(SHOW),
    line: "She's so excited to share her first show tonight.",
    expect: { passes: false, mustContain: "invented_emotion" } },
  { id: "L03", trap: "invented significance", packet: celeb(SHOW),
    line: "A big night for them — you can feel how much it means.",
    expect: { passes: false, mustContain: "invented_significance" } },
  { id: "L04", trap: "raw-post echo", packet: celeb(SHOW),
    line: "Come through tonight for bad wine and no pressure.",
    expect: { passes: false, mustContain: "raw_post_echo" } },
  { id: "L05", trap: "name leak (unauthorized)", packet: celeb(["it's their birthday", "they're turning 30"]),
    line: "Happy birthday to Casey — thirty today!",
    expect: { passes: false, mustContain: "name_leak" } },
  { id: "L06", trap: "ungrounded number", packet: celeb(SHOW),
    line: "The show raised $5,000 for charity tonight.",
    expect: { passes: false, mustContain: "grounding:ungrounded_number" } },
  { id: "L07", trap: "paid-urgency invention", packet: commercial,
    line: "New cold brew drops friday — don't miss out, selling fast.",
    expect: { passes: false, mustContain: "grounding:denylist:commercial_urgency" } },
  { id: "L08", trap: "over length (short budget)", packet: celeb(SHOW),
    line: "A first solo show opens tonight downtown and the artist worked toward this for years and there will be wine and friends and music and a real crowd and the whole evening is shaping up to be a long and lovely one for everyone there tonight.",
    expect: { passes: false, mustContain: "over_length" } },
  { id: "L09", trap: "co-item overflow", packet: celeb(SHOW),
    line: "A first solo show opens tonight. In other news, the bakery down the street won an award.",
    expect: { passes: false, mustContain: "co_item_overflow" } },
  { id: "L10", trap: "ambiguous valence resolved", packet: ambiguous,
    line: "Congratulations on the big change ahead.",
    expect: { passes: false, mustContain: "route:valence_congrats", disposition: "safe_template" } },
  { id: "L11", trap: "grave-implied made explicit", packet: graveImplied,
    line: "It sounds like her mother passed away recently.",
    expect: { passes: false, mustContain: "grave_implied_explicit_leak", disposition: "safe_template" } },
  { id: "L12", trap: "sensitive freeform never airs", packet: sensitive,
    line: "They're going through a hard stretch — sending love tonight.",
    expect: { passes: false, disposition: "safe_template" } },
];

// ---------------- runner: expected vs actual ----------------
let matched = 0;
const rows: string[] = [];
for (const f of FIXTURES) {
  const r = validateLine(f.line, f.packet);
  let ok = r.passes === f.expect.passes;
  if (ok && f.expect.mustContain) ok = r.violations.some((v) => v.rule.includes(f.expect.mustContain!));
  if (ok && f.expect.disposition) ok = r.disposition === f.expect.disposition;
  if (ok) matched++;
  const fired = r.violations.map((v) => v.rule).join(", ") || "—";
  rows.push("| " + [
    f.id, f.trap, f.expect.passes ? "air" : "block",
    r.passes ? "air" : "block", r.disposition,
    f.expect.mustContain ?? "—", fired.length > 60 ? fired.slice(0, 57) + "…" : fired,
    ok ? "✅" : "❌ MISMATCH",
  ].join(" | ") + " |");
}

const head = ["id", "trap", "exp", "act", "disp", "expect-rule", "fired", "verdict"];
console.log("# Generated-line validator — fake-line truth table (no model generation, no J4 dependency)\n");
console.log("| " + head.join(" | ") + " |");
console.log("|" + head.map(() => "---").join("|") + "|");
console.log(rows.join("\n"));
console.log(`\n**${matched}/${FIXTURES.length} fixtures matched their pre-registered expectation.**`);
console.log("\nOrchestrates routeGate (Box 8b) + groundingGate (Box 8a); ADDS invented-emotion/significance, raw-echo, name-leak, over-length, co-item, grave-implied-leak. Fail-closed: a line airs only if route=air AND grounded AND zero added violations.");

process.exitCode = matched === FIXTURES.length ? 0 : 1;
