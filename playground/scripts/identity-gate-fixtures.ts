/**
 * Identity / name-disclosure gate fixtures (CS #5A, 2026-06-27).
 *
 * Box 8 fixture F06b proved the seam: before this gate, a source_name sailed
 * through preflight ungated — "Alex" passed. CS #5A added preflight rule #8, a
 * FAIL-CLOSED name gate. This suite is its pre-registered truth table.
 *
 * THE RULE (fail-closed; absent policy ⇒ no name):
 *   - official_source (public entity/org/civic account):
 *         PASS iff identity_policy.entity_name_allowed === true
 *   - third_party | unclear (a non-subject person):
 *         REJECT always — non-subject persons are never named in v0
 *   - personal subject (subject_authored | household_family):
 *         on sensitive/grave/minor tier → REJECT always (tier ban beats the flag)
 *         on a low tier → PASS iff identity_policy.name_allowed === true
 *
 * DENY direction is ratification-independent (only ever makes the default safer).
 * The ALLOW flags are a Class-1 proposal: no production path sets them, and
 * first-line generation runs name-withheld. Generates NO line; depends on NO J4 pick.
 *
 * DISCIPLINE: every fixture PRE-REGISTERS expect.* in code before the runner compares.
 */
import { Packet, IdentityPolicy, preflight } from "../src/safety/packet";

const C_STD = { payload_cap: 1, co_items: false, tonal_turn: false, doorway: true as const, cooldown: "none" };
const C_SENS = { payload_cap: 1, co_items: false, tonal_turn: true, doorway: true as const, cooldown: "light_breather" };
const C_GRAVE = { payload_cap: 1, co_items: false, tonal_turn: true, doorway: true as const, cooldown: "full_breather" };

function base(): Omit<Packet, "item_id" | "category" | "audit_raw_post" | "block" | "block_contract" | "route" | "allowed_claims" | "forbidden_inferences" | "sensitivity" | "provenance" | "voiced"> {
  return {
    source_kind: "friend", source_name: "none", relationship: "known",
    register_hint: "neutral", permitted_source_spans: [],
    plainly_stated_serious_fact: "none", boundaries: "none",
    music_context: {}, recently_aired: "none", target_length: "short",
  };
}

interface Fixture {
  id: string;
  scenario: string;
  packet: Packet;
  expect: { preflight: "PASS" | "REJECT"; rejectContains?: string };
}

// celebration/low-tier personal packet, name "Casey" by default unless overridden
function celeb(name: string, policy?: IdentityPolicy): Packet {
  return {
    ...base(), item_id: "x", category: "celebration", route: "highlight",
    block: "standard", block_contract: C_STD, source_kind: "close friend", relationship: "close",
    source_name: name, identity_policy: policy,
    audit_raw_post: "thirty trips around the sun today.",
    allowed_claims: ["it's their birthday", "they're turning 30"],
    forbidden_inferences: ["do not invent plans or feelings beyond the post"],
    sensitivity: "low", provenance: "subject_authored", voiced: true,
  };
}

const FIXTURES: Fixture[] = [
  // ---- personal subject, low celebratory tier ----
  { id: "I01", scenario: "personal low-tier + name_allowed=true",
    packet: celeb("Casey", { name_allowed: true }),
    expect: { preflight: "PASS" } },
  { id: "I02", scenario: "personal low-tier + name, NO policy → withheld by default",
    packet: celeb("Casey"),
    expect: { preflight: "REJECT", rejectContains: "name_allowed=true" } },
  { id: "I03", scenario: "personal low-tier, name 'none' (baseline) → always fine",
    packet: celeb("none"),
    expect: { preflight: "PASS" } },
  { id: "I04", scenario: "personal low-tier + name + WRONG flag (entity flag only)",
    packet: celeb("Casey", { entity_name_allowed: true }),
    expect: { preflight: "REJECT", rejectContains: "name_allowed=true" } },

  // ---- personal subject, protected tiers: tier ban beats the flag ----
  { id: "I05", scenario: "sensitive doorway + name (+name_allowed) → REJECT (tier ban)",
    packet: { ...base(), item_id: "I05", category: "sensitive", route: "doorway_sensitive",
      block: "sensitive_doorway", block_contract: C_SENS, source_kind: "close friend", relationship: "close",
      source_name: "Casey", identity_policy: { name_allowed: true },
      audit_raw_post: "rough stretch lately, a lot going on.",
      allowed_claims: ["they're going through a hard stretch"],
      forbidden_inferences: ["do not invent the cause"],
      sensitivity: "high", provenance: "subject_authored", voiced: true },
    expect: { preflight: "REJECT", rejectContains: "on sensitive tier" } },
  { id: "I06", scenario: "grave + name (+name_allowed) → REJECT (tier ban)",
    packet: { ...base(), item_id: "I06", category: "grave", route: "doorway_grave",
      block: "grave", block_contract: C_GRAVE, source_kind: "friend", relationship: "close",
      source_name: "Casey", identity_policy: { name_allowed: true },
      audit_raw_post: "my dad passed away this morning.",
      plainly_stated_serious_fact: "their father passed away",
      allowed_claims: ["their father passed away"],
      forbidden_inferences: ["do not add cause or timing"],
      sensitivity: "high", provenance: "subject_authored", voiced: true },
    expect: { preflight: "REJECT", rejectContains: "on grave tier" } },
  { id: "I07", scenario: "minor + name (+name_allowed) → REJECT (tier ban)",
    packet: { ...base(), item_id: "I07", category: "minor", route: "highlight",
      block: "standard", block_contract: C_STD, source_kind: "parent", relationship: "known",
      source_name: "Jamie", identity_policy: { name_allowed: true },
      audit_raw_post: "so proud of my kid today.",
      allowed_claims: ["a young person had a proud moment"],
      forbidden_inferences: ["do not single out a minor"],
      sensitivity: "low", provenance: "subject_authored", voiced: true },
    expect: { preflight: "REJECT", rejectContains: "on minor tier" } },

  // ---- non-subject persons: never named ----
  { id: "I08", scenario: "third_party + name → REJECT always",
    packet: { ...base(), item_id: "I08", category: "celebration", route: "highlight",
      block: "standard", block_contract: C_STD, source_kind: "friend", relationship: "known",
      source_name: "Robin", identity_policy: { name_allowed: true },
      audit_raw_post: "heard robin got a new job, good for them.",
      allowed_claims: ["someone in the circle started a new job"],
      forbidden_inferences: ["do not name them"],
      sensitivity: "low", provenance: "third_party", voiced: true },
    expect: { preflight: "REJECT", rejectContains: "third_party provenance" } },
  { id: "I09", scenario: "unclear provenance + name → REJECT always",
    packet: { ...base(), item_id: "I09", category: "celebration", route: "highlight",
      block: "standard", block_contract: C_STD, source_kind: "unknown", relationship: "unknown",
      source_name: "Pat", identity_policy: { name_allowed: true, entity_name_allowed: true },
      audit_raw_post: "saw something about pat, not sure of the details.",
      allowed_claims: ["a positive note about someone"],
      forbidden_inferences: ["do not name them", "do not guess details"],
      sensitivity: "low", provenance: "unclear", voiced: true },
    expect: { preflight: "REJECT", rejectContains: "unclear provenance" } },

  // ---- public entity / org / civic account ----
  { id: "I10", scenario: "entity + entity_name_allowed=true → PASS",
    packet: { ...base(), item_id: "I10", category: "celebration", route: "highlight",
      block: "standard", block_contract: C_STD, source_kind: "local_org", relationship: "public",
      source_name: "Corner Bakery", identity_policy: { entity_name_allowed: true },
      audit_raw_post: "the corner bakery won best croissant in the county!",
      allowed_claims: ["a local bakery won a county award"],
      forbidden_inferences: ["do not name the owners"],
      sensitivity: "low", provenance: "official_source", voiced: true },
    expect: { preflight: "PASS" } },
  { id: "I11", scenario: "entity + name, NO policy → REJECT",
    packet: { ...base(), item_id: "I11", category: "celebration", route: "highlight",
      block: "standard", block_contract: C_STD, source_kind: "local_org", relationship: "public",
      source_name: "Corner Bakery",
      audit_raw_post: "the corner bakery won best croissant in the county!",
      allowed_claims: ["a local bakery won a county award"],
      forbidden_inferences: ["do not name the owners"],
      sensitivity: "low", provenance: "official_source", voiced: true },
    expect: { preflight: "REJECT", rejectContains: "entity_name_allowed=true" } },
  { id: "I12", scenario: "entity + name + WRONG flag (personal flag only) → REJECT",
    packet: { ...base(), item_id: "I12", category: "celebration", route: "highlight",
      block: "standard", block_contract: C_STD, source_kind: "local_org", relationship: "public",
      source_name: "Corner Bakery", identity_policy: { name_allowed: true },
      audit_raw_post: "the corner bakery won best croissant in the county!",
      allowed_claims: ["a local bakery won a county award"],
      forbidden_inferences: ["do not name the owners"],
      sensitivity: "low", provenance: "official_source", voiced: true },
    expect: { preflight: "REJECT", rejectContains: "entity_name_allowed=true" } },
];

// ---------------- runner: expected vs actual ----------------
let matched = 0;
const rows: string[] = [];
for (const f of FIXTURES) {
  const pf = preflight(f.packet);
  const actual = pf.pass ? "PASS" : "REJECT";
  let ok = actual === f.expect.preflight;
  if (ok && f.expect.preflight === "REJECT" && f.expect.rejectContains) {
    ok = pf.rejects.some((r) => r.includes(f.expect.rejectContains!));
  }
  if (ok) matched++;
  const reason = pf.pass ? "—" : pf.rejects.join(" / ");
  rows.push("| " + [
    f.id, f.scenario, f.packet.provenance,
    f.packet.source_name === "none" ? "none" : f.packet.source_name,
    f.expect.preflight, actual, ok ? "✅" : "❌ MISMATCH",
  ].join(" | ") + " |");
  if (!ok) rows.push(`|   ↳ actual reason: ${reason} ||||||`);
}

const head = ["id", "scenario", "provenance", "name", "exp", "act", "verdict"];
console.log("# Identity / name-disclosure gate — preflight rule #8 truth table (no lines generated)\n");
console.log("| " + head.join(" | ") + " |");
console.log("|" + head.map(() => "---").join("|") + "|");
console.log(rows.join("\n"));
console.log(`\n**${matched}/${FIXTURES.length} fixtures matched their pre-registered expectation.**`);
console.log("\nDENY direction is ratification-independent. ALLOW flags (name_allowed / entity_name_allowed) are a Class-1 proposal — no production path sets them; first-line generation runs name-withheld.");

process.exitCode = matched === FIXTURES.length ? 0 : 1;
