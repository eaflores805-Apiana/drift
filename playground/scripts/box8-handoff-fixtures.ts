/**
 * Box 8 handoff fixture suite — off-happy-path stress for the Decision→generation
 * boundary (CS, 2026-06-26). Built at the PO's #3 direction after the World-Ventura
 * J4 run produced a MONOCULTURE (all six voiced candidates were the same lane:
 * low-sensitivity, subject-authored, positive_personal_touch → celebration/standard).
 * That proved the happy path. This proves (or fails to prove) the contract OFF it.
 *
 * SCOPE — what runs WITHOUT a generated line (stays inside the J4 freeze):
 *   (1) preflight(packet)         — the deterministic packet-defect gate (7 rules).
 *   (2) routeGate(_, tier, src)   — the STRUCTURAL treatment cap only: sensitive/
 *       grave/minor force safe_template|silence regardless of content. A fixed
 *       neutral sentinel exercises the structural branch (NOT a generated line,
 *       same technique as grounding-harness.ts probes). No model calls.
 *
 * OUT OF SCOPE (needs a generated line — frozen until J4 ratified):
 *   Box 8a lexical grounding; Box 8b CONTENT deny-rules (valence/motive/deanon).
 *   Where a safety property depends on those, the fixture says so (enforcedBy).
 *
 * DISCIPLINE: every fixture PRE-REGISTERS its expected outcome (expect.*) in code.
 * The runner compares expected vs actual and emits a VERDICT. No expectation is
 * written after seeing output. Generates NO spoken line; depends on NO J4 pick.
 */
import { Packet, preflight, renderPacketForModel, tierOf } from "../src/safety/packet";
import { routeGate, type Disposition } from "../src/safety/routeGate";

const SENTINEL = "[structural-probe]"; // not a line; exercises the gate's tier branch only

type Enforce =
  | "preflight"          // machine-enforced by the deterministic packet gate
  | "gate-structural"    // machine-enforced by routeGate tier cap (no line needed)
  | "gate-on-line"       // needs the generated line (frozen) — NOT proven here
  | "upstream-scoring"   // a scorer/novelty decision, never reaches preflight
  | "by-construction"    // packet authored correctly; no machine check yet
  | "unratified";        // identity_policy / §5 mapping — held, not built

interface Fixture {
  id: string;
  lane: string;
  property: string;                 // the safety property under test
  enforcedBy: Enforce;
  packet: Packet;
  expect: {
    preflight: "PASS" | "REJECT";
    rejectContains?: string;        // substring the reject reason must contain
    disposition?: Disposition;      // expected routeGate structural disposition (if checked)
  };
}

// ---- shared block contracts (gold-packet-derived) ----
const C_STD = { payload_cap: 1, co_items: false, tonal_turn: false, doorway: true as const, cooldown: "none" };
const C_SENS = { payload_cap: 1, co_items: false, tonal_turn: true, doorway: true as const, cooldown: "light_breather" };
const C_GRAVE = { payload_cap: 1, co_items: false, tonal_turn: true, doorway: true as const, cooldown: "full_breather" };
const C_UTIL = { payload_cap: 1, co_items: false, tonal_turn: false, doorway: false as const, cooldown: "none" };

function base(): Omit<Packet, "item_id" | "category" | "audit_raw_post" | "block" | "block_contract" | "route" | "allowed_claims" | "forbidden_inferences" | "sensitivity" | "provenance" | "voiced"> {
  return {
    source_kind: "friend", source_name: "none", relationship: "known",
    register_hint: "neutral", permitted_source_spans: [],
    plainly_stated_serious_fact: "none", boundaries: "none",
    music_context: {}, recently_aired: "none", target_length: "short",
  };
}

const FIXTURES: Fixture[] = [
  // ============ LANE FIXTURES (well-formed; the contract should hold) ============
  {
    id: "F01", lane: "sensitive-doorway", property: "no cause invented; treatment capped to template",
    enforcedBy: "gate-structural",
    packet: { ...base(), item_id: "F01", category: "sensitive", route: "doorway_sensitive",
      block: "sensitive_doorway", block_contract: C_SENS, source_kind: "close friend", relationship: "close",
      audit_raw_post: "family stuff is rough right now, just a lot going on.",
      allowed_claims: ["they're going through a hard stretch"],
      forbidden_inferences: ["do not invent the cause", "do not name anyone", "do not characterize their emotions"],
      sensitivity: "high", provenance: "subject_authored", voiced: true },
    expect: { preflight: "PASS", disposition: "safe_template" },
  },
  {
    id: "F02", lane: "sensitive-doorway + quiet", property: "explicit quiet request → SILENCE",
    enforcedBy: "gate-structural",
    packet: { ...base(), item_id: "F02", category: "sensitive", route: "doorway_sensitive",
      block: "sensitive_doorway", block_contract: C_SENS, source_kind: "close friend", relationship: "close",
      audit_raw_post: "going through it. please give us space and no questions for a while.",
      boundaries: "source asked for space; no questions",
      allowed_claims: ["they asked for some space"],
      forbidden_inferences: ["do not ask the listener to reach out", "do not invent the cause"],
      sensitivity: "high", provenance: "subject_authored", voiced: true },
    expect: { preflight: "PASS", disposition: "silence" },
  },
  {
    id: "F03", lane: "grave-implied", property: "must NOT assert death; template cap",
    enforcedBy: "gate-structural",
    packet: { ...base(), item_id: "F03", category: "grave_implied", route: "doorway_grave",
      block: "grave", block_contract: C_GRAVE, source_kind: "friend", relationship: "close",
      audit_raw_post: "i can't believe you're gone. i keep reaching for my phone to text you.",
      allowed_claims: ["they are grieving someone"],
      forbidden_inferences: ["do not state that anyone has died", "do not name a person", "do not name a cause"],
      sensitivity: "high", provenance: "subject_authored", voiced: true },
    expect: { preflight: "PASS", disposition: "safe_template" },
  },
  {
    id: "F04", lane: "grave-explicit (well-formed)", property: "stated fact grounded in claims; no emotional color",
    enforcedBy: "preflight",
    packet: { ...base(), item_id: "F04", category: "grave", route: "doorway_grave",
      block: "grave", block_contract: C_GRAVE, source_kind: "friend", relationship: "close",
      audit_raw_post: "my dad passed away this morning.",
      plainly_stated_serious_fact: "their father passed away",
      allowed_claims: ["their father passed away"],
      forbidden_inferences: ["do not add cause or timing detail", "do not characterize their grief"],
      sensitivity: "high", provenance: "subject_authored", voiced: true },
    expect: { preflight: "PASS", disposition: "safe_template" },
  },
  {
    id: "F05", lane: "ambiguous-valence", property: "no good/bad assumed",
    enforcedBy: "gate-on-line", // structural gate returns AIR on a clean probe — valence guard needs the line
    packet: { ...base(), item_id: "F05", category: "ambiguous", route: "highlight",
      block: "standard", block_contract: C_STD,
      audit_raw_post: "big change coming. new chapter. that's all i'll say for now.",
      allowed_claims: ["they signaled a big change / new chapter is coming"],
      forbidden_inferences: ["do not infer whether this is good or bad", "do not congratulate or console", "do not infer the nature of the change"],
      sensitivity: "medium", provenance: "subject_authored", voiced: true },
    expect: { preflight: "PASS", disposition: "air" }, // honest: structural cap does NOT protect ambiguous
  },
  {
    id: "F06", lane: "name-eligible low-risk (name withheld)", property: "name disclosure gated by identity_policy",
    enforcedBy: "unratified",
    packet: { ...base(), item_id: "F06", category: "celebration", route: "highlight",
      block: "standard", block_contract: C_STD, source_kind: "close friend", relationship: "close",
      audit_raw_post: "thirty trips around the sun today.",
      allowed_claims: ["it's their birthday", "they're turning 30"],
      forbidden_inferences: ["do not invent plans or feelings beyond the post"],
      sensitivity: "low", provenance: "subject_authored", voiced: true },
    expect: { preflight: "PASS", disposition: "air" },
  },
  {
    id: "F06b", lane: "name PRESENT, no policy", property: "name without identity_policy → REJECT (#5A closed this hole)",
    enforcedBy: "preflight", // was "unratified"/PASS until CS #5A added preflight rule #8 (fail-closed name gate)
    packet: { ...base(), item_id: "F06b", category: "celebration", route: "highlight",
      block: "standard", block_contract: C_STD, source_kind: "close friend", relationship: "close",
      source_name: "Alex",
      audit_raw_post: "thirty trips around the sun today.",
      allowed_claims: ["it's their birthday", "they're turning 30"],
      forbidden_inferences: ["do not invent plans or feelings beyond the post"],
      sensitivity: "low", provenance: "subject_authored", voiced: true },
    expect: { preflight: "REJECT", rejectContains: "name_allowed=true" }, // hole closed: a name now needs explicit policy
  },
  {
    id: "F07", lane: "third-party + HIGH sensitivity", property: "third-party serious news must NOT voice",
    enforcedBy: "preflight", // rule #4 (subject-authored-or-omit)
    packet: { ...base(), item_id: "F07", category: "sensitive", route: "doorway_sensitive",
      block: "sensitive_doorway", block_contract: C_SENS,
      audit_raw_post: "heard through a friend that someone in our circle is going through chemo. sending love.",
      allowed_claims: ["someone in the community is unwell"],
      forbidden_inferences: ["do not name anyone", "do not state the diagnosis"],
      sensitivity: "high", provenance: "third_party", voiced: true },
    expect: { preflight: "REJECT", rejectContains: "provenance third_party + sensitivity high" },
  },
  {
    id: "F08", lane: "third-party + LOW sensitivity (public)", property: "public third-party low-risk MAY voice",
    enforcedBy: "preflight",
    packet: { ...base(), item_id: "F08", category: "celebration", route: "highlight",
      block: "standard", block_contract: C_STD, source_kind: "friend", relationship: "known",
      audit_raw_post: "shoutout to the corner bakery for winning best croissant in the county!",
      allowed_claims: ["a local bakery won a county award for best croissant"],
      forbidden_inferences: ["do not name the owners", "do not invent the prize details"],
      sensitivity: "low", provenance: "third_party", voiced: true },
    expect: { preflight: "PASS", disposition: "air" },
  },
  {
    id: "F09", lane: "minor / group-level", property: "no individual minor named; treatment capped",
    enforcedBy: "gate-structural",
    packet: { ...base(), item_id: "F09", category: "minor", route: "highlight",
      block: "standard", block_contract: C_STD, source_kind: "local_org", source_name: "none", relationship: "public",
      audit_raw_post: "the buena high robotics team took first at regionals!",
      allowed_claims: ["a local high school robotics team won first at regionals"],
      forbidden_inferences: ["do not name any individual student", "do not single out a minor"],
      sensitivity: "low", provenance: "official_source", voiced: true },
    expect: { preflight: "PASS", disposition: "safe_template" }, // minor tier caps even a happy win
  },
  {
    id: "F10", lane: "utility", property: "actionable; no invented urgency (content = generation-time)",
    enforcedBy: "by-construction",
    packet: { ...base(), item_id: "F10", category: "utility", route: "utility",
      block: "utility_pin", block_contract: C_UTIL, source_kind: "school district", source_name: "none", relationship: "public",
      audit_raw_post: "all schools closed tomorrow due to the storm.",
      allowed_claims: ["all schools are closed tomorrow", "reason: the storm"],
      forbidden_inferences: ["do not invent closure times or safety instructions"],
      sensitivity: "low", provenance: "official_source", voiced: true },
    expect: { preflight: "PASS", disposition: "air" },
  },
  {
    id: "F11", lane: "commercial edge", property: "restrained; no paid priority (priority = scoring-time)",
    enforcedBy: "by-construction",
    packet: { ...base(), item_id: "F11", category: "commercial", route: "commercial",
      block: "commercial_signal", block_contract: C_UTIL, source_kind: "brand", source_name: "none", relationship: "public",
      audit_raw_post: "new cold brew dropping friday at the kiosk.",
      allowed_claims: ["a local kiosk is releasing a new cold brew on friday"],
      forbidden_inferences: ["do not invent a discount, urgency, or scarcity"],
      sensitivity: "low", provenance: "official_source", voiced: true },
    expect: { preflight: "PASS", disposition: "air" },
  },
  {
    id: "F12", lane: "stale serious → silence", property: "stale grave item must not re-air (decided UPSTREAM, not by preflight)",
    enforcedBy: "upstream-scoring",
    packet: { ...base(), item_id: "F12", category: "grave", route: "doorway_grave",
      block: "grave", block_contract: C_GRAVE,
      audit_raw_post: "(diagnosis posted three weeks ago; already acknowledged once)",
      allowed_claims: [], // nothing to air — voiced false
      forbidden_inferences: ["do not reference the old news again"],
      sensitivity: "high", provenance: "subject_authored", voiced: false },
    expect: { preflight: "PASS" }, // preflight cannot tell stale from fresh; it just doesn't object to a silent packet
  },

  // ============ MALFORMED FIXTURES (fail-closed; one per preflight rule) ============
  {
    id: "M01", lane: "malformed: voiced + empty claims", property: "rule#1 allowed_claims non-empty",
    enforcedBy: "preflight",
    packet: { ...base(), item_id: "M01", category: "celebration", route: "highlight",
      block: "standard", block_contract: C_STD, audit_raw_post: "good news!",
      allowed_claims: [], forbidden_inferences: [], sensitivity: "low", provenance: "subject_authored", voiced: true },
    expect: { preflight: "REJECT", rejectContains: "allowed_claims empty" },
  },
  {
    id: "M02", lane: "malformed: serious fact ⊄ claims", property: "rule#2 grave fact must be grounded",
    enforcedBy: "preflight",
    packet: { ...base(), item_id: "M02", category: "grave", route: "doorway_grave",
      block: "grave", block_contract: C_GRAVE, audit_raw_post: "hard day.",
      plainly_stated_serious_fact: "their mother died",
      allowed_claims: ["they are having a hard day"], // does NOT support "mother died"
      forbidden_inferences: [], sensitivity: "high", provenance: "subject_authored", voiced: true },
    expect: { preflight: "REJECT", rejectContains: "serious fact not" },
  },
  {
    id: "M03", lane: "malformed: block/route incompatible", property: "rule#3 block⟷route",
    enforcedBy: "preflight",
    packet: { ...base(), item_id: "M03", category: "grave", route: "doorway_grave",
      block: "standard", block_contract: C_STD, audit_raw_post: "loss in the family.",
      plainly_stated_serious_fact: "none",
      allowed_claims: ["they had a loss in the family"], forbidden_inferences: [],
      sensitivity: "high", provenance: "subject_authored", voiced: true },
    expect: { preflight: "REJECT", rejectContains: "incompatible with route" },
  },
  {
    id: "M05", lane: "malformed: boundary present, BOUNDARIES none", property: "rule#5 boundary must be captured",
    enforcedBy: "preflight",
    packet: { ...base(), item_id: "M05", category: "sensitive", route: "doorway_sensitive",
      block: "sensitive_doorway", block_contract: C_SENS, audit_raw_post: "please don't text me right now, i need quiet.",
      boundaries: "none", allowed_claims: ["they asked for quiet"], forbidden_inferences: [],
      sensitivity: "high", provenance: "subject_authored", voiced: true },
    expect: { preflight: "REJECT", rejectContains: "BOUNDARIES is none" },
  },
  {
    id: "M06", lane: "malformed: empty source_name", property: 'rule#6 source_name explicit or "none"',
    enforcedBy: "preflight",
    packet: { ...base(), item_id: "M06", category: "celebration", route: "highlight",
      block: "standard", block_contract: C_STD, source_name: "  ", audit_raw_post: "yay",
      allowed_claims: ["something good happened"], forbidden_inferences: [],
      sensitivity: "low", provenance: "subject_authored", voiced: true },
    expect: { preflight: "REJECT", rejectContains: "source_name must be" },
  },
  {
    id: "M07", lane: "malformed: payload over cap", property: "rule#7 payload ≤ cap",
    enforcedBy: "preflight",
    packet: { ...base(), item_id: "M07", category: "celebration", route: "highlight",
      block: "standard", block_contract: { ...C_STD, payload_cap: 0 }, audit_raw_post: "yay",
      allowed_claims: ["something good happened"], forbidden_inferences: [],
      sensitivity: "low", provenance: "subject_authored", voiced: true },
    expect: { preflight: "REJECT", rejectContains: "exceeds payload_cap" },
  },
];

// ---------------- runner: expected vs actual ----------------
let matched = 0;
const rows: string[] = [];
for (const f of FIXTURES) {
  const pf = preflight(f.packet);
  const actualPf = pf.pass ? "PASS" : "REJECT";
  let ok = actualPf === f.expect.preflight;
  if (ok && f.expect.preflight === "REJECT" && f.expect.rejectContains) {
    ok = pf.rejects.some((r) => r.includes(f.expect.rejectContains!));
  }

  // structural disposition (only meaningful for voiced packets we pre-registered a disposition for)
  let actualDisp = "—";
  if (f.expect.disposition && f.packet.voiced) {
    const disp = routeGate(SENTINEL, tierOf(f.packet), f.packet.audit_raw_post).disposition;
    actualDisp = disp;
    if (ok) ok = disp === f.expect.disposition;
  }

  // escape hatch is a renderer property — verify it appears for any voiced packet
  const escape = f.packet.voiced
    ? (renderPacketForModel(f.packet).includes("empty string if it can't be aired safely") ? "yes" : "**NO**")
    : "n/a";

  if (ok) matched++;
  rows.push(
    "| " + [
      f.id, f.lane, f.packet.relationship, f.packet.provenance, f.packet.sensitivity,
      f.expect.preflight, actualPf,
      f.expect.disposition ?? "—", actualDisp,
      String(f.packet.allowed_claims.length), String(f.packet.forbidden_inferences.length),
      f.packet.permitted_source_spans.length ? "yes" : "no",
      f.packet.source_name === "none" ? "no" : `yes(${f.packet.source_name.trim()})`,
      escape, f.enforcedBy, ok ? "✅" : "❌ MISMATCH",
    ].join(" | ") + " |"
  );
}

const head = ["id","lane","relation","provenance","sens","exp.pre","act.pre","exp.disp","act.disp","claims","forbid","spans","name","escape","enforcedBy","verdict"];
console.log("# Box 8 handoff fixture suite — expected vs actual (no lines generated, no J4 dependency)\n");
console.log("| " + head.join(" | ") + " |");
console.log("|" + head.map(() => "---").join("|") + "|");
console.log(rows.join("\n"));
console.log(`\n**${matched}/${FIXTURES.length} fixtures matched their pre-registered expectation.**`);

console.log("\n## Enforcement map (what actually has machine teeth at the handoff)");
console.log("- **preflight (deterministic):** claims-non-empty · grave-fact⊆claims · block⟷route(treatment) · provenance×sensitivity (third-party-or-omit) · boundary-capture · source_name format · payload≤cap.");
console.log("- **gate-structural (no line needed):** sensitive/grave/minor → safe_template|silence cap; quiet→silence.");
console.log("- **gate-on-line (FROZEN — not proven here):** ambiguous valence guard, motive/deanon/mobilize content rules, lexical grounding (Box 8a).");
console.log("- **upstream-scoring (not a preflight concern):** stale-serious → silence (novelty/recency).");
console.log("- **preflight name gate (CS #5A):** name-disclosure is now FAIL-CLOSED — a source_name other than \"none\" REJECTS unless identity_policy authorizes it (F06b now REJECTs; full matrix in identity-gate-fixtures.ts). The ALLOW flags remain a Class-1 proposal.");
console.log("- **by-construction (no machine check yet):** 'no invented urgency' (utility), 'no paid priority' (commercial), minor-not-named in claims — authored correctly, enforced at generation/scoring.");

process.exitCode = matched === FIXTURES.length ? 0 : 1;
