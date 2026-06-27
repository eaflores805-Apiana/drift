/**
 * Positive-personal-touch packet diversity (CS #5D, 2026-06-27).
 *
 * The six J4 candidates were a MONOCULTURE — every structural column identical
 * (ratification §4). This builds SYNTHETIC handoff packets (NOT world-sim posts,
 * NOT J4 output) across ordinary low-risk relational variety, and runs PREFLIGHT
 * ONLY. No lines generated, no J4 thresholds touched, no model calls.
 *
 * Goal: prove the packet contract handles relational variety beyond the one lane,
 * so the first generated line is less likely to be a fluke of a single shape.
 *
 * These packets are hand-authored to the §5 mapping defaults (celebration →
 * highlight/standard/short, source_name "none", spans usually empty). Variety is
 * injected in relationship, register_hint, source_kind, claim count, permitted
 * spans, and provenance — the columns the monoculture held fixed.
 *
 * DISCIPLINE: expect.preflight pre-registered in code. The DIVERSITY SUMMARY at
 * the end proves the columns actually vary (else this is just 10× the same row).
 * Two "tempting but must-reject" cases prove the contract still bites in-lane.
 */
import { Packet, IdentityPolicy, preflight } from "../src/safety/packet";

const C_STD = { payload_cap: 1, co_items: false, tonal_turn: false, doorway: true as const, cooldown: "none" };

function mk(o: Partial<Packet> & Pick<Packet, "item_id" | "allowed_claims">): Packet {
  return {
    category: "celebration", route: "highlight", block: "standard", block_contract: C_STD,
    audit_raw_post: "(synthetic diversity packet — authored by hand, not world-sim)",
    source_kind: "friend", source_name: "none", relationship: "close", register_hint: "warm",
    permitted_source_spans: [], plainly_stated_serious_fact: "none",
    forbidden_inferences: ["do not invent feelings or significance beyond the post"],
    boundaries: "none", sensitivity: "low", provenance: "subject_authored",
    music_context: {}, recently_aired: "none", target_length: "short", voiced: true,
    ...o,
  };
}

interface Fixture {
  id: string;
  kind: string;
  packet: Packet;
  expect: { preflight: "PASS" | "REJECT"; rejectContains?: string };
}

const FIXTURES: Fixture[] = [
  { id: "P01", kind: "birthday", expect: { preflight: "PASS" },
    packet: mk({ item_id: "P01", relationship: "close friend", register_hint: "playful",
      allowed_claims: ["it's their birthday", "they're turning 30"] }) },
  { id: "P02", kind: "promotion", expect: { preflight: "PASS" },
    packet: mk({ item_id: "P02", source_kind: "coworker", relationship: "colleague", register_hint: "warm-neutral",
      allowed_claims: ["they started a new role"] }) },
  { id: "P03", kind: "safe arrival (family)", expect: { preflight: "PASS" },
    packet: mk({ item_id: "P03", source_kind: "family", relationship: "household", register_hint: "calm", provenance: "household_family",
      allowed_claims: ["they landed safely after a long trip"] }) },
  { id: "P04", kind: "finished a race", expect: { preflight: "PASS" },
    packet: mk({ item_id: "P04", relationship: "friend", register_hint: "upbeat",
      allowed_claims: ["they finished their first 5k", "they crossed the line"] }) },
  { id: "P05", kind: "passed a license exam", expect: { preflight: "PASS" },
    packet: mk({ item_id: "P05", relationship: "friend", register_hint: "warm",
      allowed_claims: ["they passed their licensing exam"] }) },
  { id: "P06", kind: "low-key gathering (licensed span)", expect: { preflight: "PASS" },
    packet: mk({ item_id: "P06", relationship: "friend", register_hint: "easy",
      permitted_source_spans: ["porch hang, bring nothing"],
      allowed_claims: ["they're hosting a low-key porch hang"] }) },
  { id: "P07", kind: "small community win (entity named, authorized)", expect: { preflight: "PASS" },
    packet: mk({ item_id: "P07", source_kind: "local_org", relationship: "public", register_hint: "neutral",
      source_name: "Riverside Library", identity_policy: { entity_name_allowed: true } as IdentityPolicy,
      provenance: "official_source",
      allowed_claims: ["the library hit a summer reading milestone"] }) },
  { id: "P08", kind: "travel milestone", expect: { preflight: "PASS" },
    packet: mk({ item_id: "P08", relationship: "friend", register_hint: "warm",
      allowed_claims: ["they're back from a long-planned trip"] }) },
  { id: "P09", kind: "new pet", expect: { preflight: "PASS" },
    packet: mk({ item_id: "P09", relationship: "close friend", register_hint: "playful",
      allowed_claims: ["they adopted a rescue dog"] }) },
  { id: "P10", kind: "neighbor's garden", expect: { preflight: "PASS" },
    packet: mk({ item_id: "P10", source_kind: "neighbor", relationship: "acquaintance", register_hint: "gentle",
      allowed_claims: ["the community garden's first tomatoes came in"] }) },

  // ---- tempting but MUST REJECT (the contract still bites in-lane) ----
  { id: "P11", kind: "REJECT: family member named, no policy", expect: { preflight: "REJECT", rejectContains: "name_allowed=true" },
    packet: mk({ item_id: "P11", source_kind: "family", relationship: "household", provenance: "household_family",
      source_name: "Sam", allowed_claims: ["they landed safely"] }) },
  { id: "P12", kind: "REJECT: voiced but no claims", expect: { preflight: "REJECT", rejectContains: "allowed_claims empty" },
    packet: mk({ item_id: "P12", relationship: "friend", allowed_claims: [] }) },
];

// ---------------- runner ----------------
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
  const p = f.packet;
  rows.push("| " + [
    f.id, f.kind, p.relationship, p.register_hint, p.source_kind, p.provenance,
    String(p.allowed_claims.length), p.permitted_source_spans.length ? "yes" : "no",
    p.source_name === "none" ? "none" : p.source_name,
    f.expect.preflight, actual, ok ? "✅" : "❌ MISMATCH",
  ].join(" | ") + " |");
}

const head = ["id", "kind", "relation", "register", "source_kind", "provenance", "claims", "spans", "name", "exp", "act", "verdict"];
console.log("# Positive-personal-touch packet diversity — preflight only (no lines, no J4)\n");
console.log("| " + head.join(" | ") + " |");
console.log("|" + head.map(() => "---").join("|") + "|");
console.log(rows.join("\n"));
console.log(`\n**${matched}/${FIXTURES.length} fixtures matched their pre-registered expectation.**`);

// diversity proof — the columns the monoculture held fixed must actually vary
const passing = FIXTURES.filter((f) => f.expect.preflight === "PASS").map((f) => f.packet);
const uniq = (xs: string[]) => [...new Set(xs)];
console.log("\n## Diversity summary (proves this is NOT 10× the same row)");
console.log(`- relationships:  ${uniq(passing.map((p) => p.relationship)).join(", ")}`);
console.log(`- registers:      ${uniq(passing.map((p) => p.register_hint)).join(", ")}`);
console.log(`- source_kinds:   ${uniq(passing.map((p) => p.source_kind)).join(", ")}`);
console.log(`- provenances:    ${uniq(passing.map((p) => p.provenance)).join(", ")}`);
console.log(`- claim counts:   ${uniq(passing.map((p) => String(p.allowed_claims.length))).join(", ")}`);
console.log(`- spans present:  ${passing.filter((p) => p.permitted_source_spans.length).length}/${passing.length}`);
console.log("\nContrast: the six J4 candidates were identical on every one of these columns (ratification §4). Same lane, varied shape, all clear preflight. The two REJECTs (P11/P12) prove the contract still bites in-lane.");

process.exitCode = matched === FIXTURES.length ? 0 : 1;
