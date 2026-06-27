/**
 * Defense-in-depth degradation suite (CS, 2026-06-27).
 *
 * EVIDENCE ONLY — not a ratification artifact. No line generation (lines are
 * hand-authored), no J4 threshold change, no policy/material-map approval, no
 * behavior change. It does not claim any bar is steel; it asks one question:
 *
 *   PRINCIPLE UNDER TEST: "No single missed classifier moves an item from
 *   dangerous to freeform."
 *
 * Method (realistic misroute): take a TRUTHFUL dangerous packet and mutate only
 * the CLASSIFIER-OUTPUT bundle — category / route / block / block_contract —
 * downward one rung, as if the upstream router mislabeled the lane. The CONTENT
 * fields (sensitivity, provenance, plainly_stated_serious_fact, allowed_claims,
 * audit_raw_post, source_name, boundaries) stay truthful. Then run the existing
 * preflight → validateLine path and see whether any LOWER, content-keyed bar
 * still prevents unsafe freeform from airing.
 *
 *   caught       = some surviving bar blocked it (preflight reject, or validateLine
 *                  did not pass). Defense-in-depth held for this slip.
 *   fell_through = preflight passed AND validateLine passed → the unsafe line AIRS.
 *                  A single missed classifier dropped it to freeform. GAP.
 *
 * DISCIPLINE: each fixture pre-registers a PREDICTION (expect + expectedBar) from
 * a reading of the code. The runner records ACTUAL and flags any mismatch — a
 * wrong prediction is itself a finding, surfaced, never silently reconciled.
 * Exit code reflects prediction-accuracy (so this is CI-stable); the CRITICAL
 * GAPS block is the actual payload for Eng1/Eng2.
 *
 * REPORT-ONLY: where a gap is found, it is surfaced — NOT patched. Any fix that
 * would change routeGate/preflight/validateLine behavior is a separate, flagged
 * proposal, not merged here.
 */
import { Packet, BlockContract, preflight } from "../src/safety/packet";
import { validateLine } from "../src/safety/lineValidator";

const C_STD: BlockContract = { payload_cap: 1, co_items: false, tonal_turn: false, doorway: true, cooldown: "none" };
const C_SENS: BlockContract = { payload_cap: 1, co_items: false, tonal_turn: true, doorway: true, cooldown: "light_breather" };

interface Lane { label: string; category: string; route: string; block: string; block_contract: BlockContract }
const CELEBRATION: Lane = { label: "celebration/highlight", category: "celebration", route: "highlight", block: "standard", block_contract: C_STD };
const EVERYDAY: Lane = { label: "everyday/highlight", category: "everyday", route: "highlight", block: "standard", block_contract: C_STD };
const SENSITIVE: Lane = { label: "sensitive/doorway", category: "sensitive", route: "doorway_sensitive", block: "sensitive_doorway", block_contract: C_SENS };

type Content = Partial<Packet> & Pick<Packet, "item_id" | "allowed_claims" | "audit_raw_post">;
function pkt(content: Content, lane: Lane): Packet {
  return {
    source_kind: "friend", source_name: "none", relationship: "close", register_hint: "warm-neutral",
    permitted_source_spans: [], plainly_stated_serious_fact: "none",
    forbidden_inferences: ["do not invent feelings or significance", "do not state anyone died"],
    boundaries: "none", sensitivity: "low", provenance: "subject_authored",
    music_context: {}, recently_aired: "none", target_length: "short", voiced: true,
    ...content,
    // lane bundle last — the misroute IS exactly these four classifier-output fields
    category: lane.category, route: lane.route, block: lane.block, block_contract: lane.block_contract,
  };
}

type Verdict = "caught" | "fell_through";
type Severity = "—" | "HIGH" | "CRITICAL";
interface Fixture {
  id: string;
  group: string;
  trueLane: string;            // what the lane SHOULD have been (the dangerous truth)
  mutated: Lane;               // what the router wrongly assigned
  missed: string;             // the classifier being simulated as missed
  line: string;               // hand-authored line the permissive lane would allow
  expect: Verdict;            // PREDICTION
  expectedBar: string;        // PREDICTION: the surviving bar (or "none")
  severity: Severity;         // severity if it falls through
  content: Content;
}

const FIXTURES: Fixture[] = [
  // 1. grave-explicit → sensitive (one rung): sensitive is STILL a capped tier.
  { id: "G1", group: "grave→sensitive", trueLane: "grave/doorway", mutated: SENSITIVE,
    missed: "grave detector (caught as sensitive)", expect: "caught", expectedBar: "routeGate sensitive tier cap (treatment)", severity: "—",
    line: "His father passed away. I'll leave the rest with them.",
    content: { item_id: "G1", audit_raw_post: "my father passed away.", sensitivity: "high",
      plainly_stated_serious_fact: "their father passed away", allowed_claims: ["their father passed away"] } },

  // 2a. grave-explicit → celebration: celebratory MISFRAME. No surviving content bar.
  { id: "G2a", group: "grave→celebration", trueLane: "grave/doorway", mutated: CELEBRATION,
    missed: "grave detector (dropped to low)", expect: "fell_through", expectedBar: "none", severity: "CRITICAL",
    line: "Such lovely news to share for them today — a real milestone.",
    content: { item_id: "G2a", audit_raw_post: "my father passed away this morning.", sensitivity: "high",
      plainly_stated_serious_fact: "their father passed away", allowed_claims: ["their father passed away"] } },

  // 2b. grave-explicit → celebration: explicit death RESTATED in a cheerful frame.
  { id: "G2b", group: "grave→celebration", trueLane: "grave/doorway", mutated: CELEBRATION,
    missed: "grave detector (dropped to low)", expect: "fell_through", expectedBar: "none", severity: "CRITICAL",
    line: "Big news for them today: their father passed away.",
    content: { item_id: "G2b", audit_raw_post: "my father passed away this morning.", sensitivity: "high",
      plainly_stated_serious_fact: "their father passed away", allowed_claims: ["their father passed away"] } },

  // 3a. sensitive-doorway → celebration: a DIRECTIVE line trips the universal mobilize rule.
  { id: "G3a", group: "sensitive→celebration", trueLane: "sensitive/doorway", mutated: CELEBRATION,
    missed: "sensitivity detector (dropped to low)", expect: "caught", expectedBar: "routeGate mobilize (universal low-tier rule)", severity: "—",
    line: "They're going through a hard stretch — go check on them tonight.",
    content: { item_id: "G3a", audit_raw_post: "family stuff is rough right now.", sensitivity: "high",
      allowed_claims: ["they're going through a hard stretch"] } },

  // 3b. sensitive-doorway → celebration: a SOFT sympathy line — nothing universal catches it.
  { id: "G3b", group: "sensitive→celebration", trueLane: "sensitive/doorway", mutated: CELEBRATION,
    missed: "sensitivity detector (dropped to low)", expect: "fell_through", expectedBar: "none", severity: "HIGH",
    line: "Thinking of them through a hard stretch lately, sending warmth.",
    content: { item_id: "G3b", audit_raw_post: "family stuff is rough right now.", sensitivity: "high",
      allowed_claims: ["they're going through a hard stretch"] } },

  // 4. ambiguous-valence → celebration: valence guard is AMBIGUOUS-tier-only; lost on downgrade.
  { id: "G4", group: "ambiguous→celebration", trueLane: "ambiguous/highlight", mutated: CELEBRATION,
    missed: "valence detector (dropped to low; valence rule is ambiguous-tier-only)", expect: "fell_through", expectedBar: "none", severity: "HIGH",
    line: "Congratulations on the big change ahead!",
    content: { item_id: "G4", audit_raw_post: "new chapter starting soon. that's all i'll say.", sensitivity: "medium",
      allowed_claims: ["they signaled a change is coming"] } },

  // 5. third-party high-sensitivity → celebration: preflight rule 4 is content-keyed, SURVIVES.
  { id: "G5", group: "third-party-high→celebration", trueLane: "sensitive/silence", mutated: CELEBRATION,
    missed: "sensitivity/provenance routing (dropped to low)", expect: "caught", expectedBar: "preflight #4 (provenance×sensitivity)", severity: "—",
    line: "A nice little update about someone today.",
    content: { item_id: "G5", audit_raw_post: "heard a neighbor is going through something hard.", sensitivity: "high",
      provenance: "third_party", source_kind: "acquaintance", allowed_claims: ["someone nearby is going through something hard"] } },

  // 6. minor/private (named child) → community-positive: preflight rule 8 name gate SURVIVES.
  { id: "G6", group: "minor→community", trueLane: "minor/capped", mutated: EVERYDAY,
    missed: "minor detector (dropped to low)", expect: "caught", expectedBar: "preflight #8 (name withheld)", severity: "—",
    line: "Mia did the sweetest thing at school today.",
    content: { item_id: "G6", audit_raw_post: "my kid had a rough week at school.", sensitivity: "high",
      provenance: "household_family", source_kind: "family", relationship: "household", source_name: "Mia",
      allowed_claims: ["a child in the family had a hard week"] } },

  // 7a. medical/diagnosis → celebration: positive MISFRAME of a treatment disclosure.
  { id: "G7a", group: "medical→celebration", trueLane: "grave/doorway", mutated: CELEBRATION,
    missed: "medical detector (dropped to low)", expect: "fell_through", expectedBar: "none", severity: "CRITICAL",
    line: "Sending good vibes their way for the big new chapter!",
    content: { item_id: "G7a", audit_raw_post: "starting chemo next week.", sensitivity: "high",
      plainly_stated_serious_fact: "they started cancer treatment", allowed_claims: ["they started cancer treatment"] } },

  // 7b. medical → celebration: the word "cancer" airs in a cheerful frame (GRAVE_EXPLICIT is grave_implied-gated).
  { id: "G7b", group: "medical→celebration", trueLane: "grave/doorway", mutated: CELEBRATION,
    missed: "medical detector (dropped to low)", expect: "fell_through", expectedBar: "none", severity: "CRITICAL",
    line: "Cheering them on as they started cancer treatment — go team!",
    content: { item_id: "G7b", audit_raw_post: "starting chemo next week.", sensitivity: "high",
      plainly_stated_serious_fact: "they started cancer treatment", allowed_claims: ["they started cancer treatment"] } },

  // 8. grave + explicit QUIET request, boundaries dropped → celebration: preflight rule 5 SURVIVES.
  { id: "G8", group: "grave+quiet→celebration", trueLane: "grave/silence", mutated: CELEBRATION,
    missed: "grave+boundary detector (dropped to low, boundary lost)", expect: "caught", expectedBar: "preflight #5 (quiet boundary)", severity: "—",
    line: "Some happy little news for them today.",
    content: { item_id: "G8", audit_raw_post: "please give us space, not ready to talk.", sensitivity: "high",
      allowed_claims: ["something personal happened"], boundaries: "none" } },
];

// ---------------- runner ----------------
function evaluate(f: Fixture): { verdict: Verdict; stage: string; bar: string } {
  const p = pkt(f.content, f.mutated);
  const pf = preflight(p);
  if (!pf.pass) return { verdict: "caught", stage: "preflight", bar: pf.rejects[0] };
  const v = validateLine(f.line, p);
  if (!v.passes) {
    const bar = v.violations.length ? v.violations.map((x) => x.rule).join(", ") : `treatment cap → ${v.disposition}`;
    return { verdict: "caught", stage: "validateLine", bar };
  }
  return { verdict: "fell_through", stage: "AIRED", bar: "—" };
}

let predOk = 0;
const rows: string[] = [];
const gaps: Fixture[] = [];
const surprises: string[] = [];

for (const f of FIXTURES) {
  const r = evaluate(f);
  const match = r.verdict === f.expect;
  if (match) predOk++;
  else surprises.push(`${f.id}: predicted ${f.expect} (${f.expectedBar}) but observed ${r.verdict} @${r.stage} [${r.bar}]`);
  if (r.verdict === "fell_through") gaps.push(f);
  rows.push("| " + [
    f.id, f.group, f.trueLane + " → " + f.mutated.label,
    r.verdict === "caught" ? `caught @${r.stage}` : "🚨 AIRED",
    r.verdict === "caught" ? (r.bar.length > 46 ? r.bar.slice(0, 43) + "…" : r.bar) : "—",
    r.verdict === "fell_through" ? f.severity : "—",
    match ? "✓" : "✗ SURPRISE",
  ].join(" | ") + " |");
}

const head = ["id", "group", "true → mutated (misroute)", "result", "bar that caught it", "sev", "pred"];
console.log("# Defense-in-depth degradation suite — does the cage degrade safely on misroute?\n");
console.log("Principle under test: **no single missed classifier moves an item from dangerous to freeform.**");
console.log("Method: mutate classifier-output (category/route/block) DOWN one rung; keep content truthful; run preflight→validateLine.\n");
console.log("| " + head.join(" | ") + " |");
console.log("|" + head.map(() => "---").join("|") + "|");
console.log(rows.join("\n"));

console.log(`\n**Prediction accuracy: ${predOk}/${FIXTURES.length}** (the suite's model of current behavior).`);
if (surprises.length) {
  console.log("\n## ⚠ SURPRISES (prediction wrong — itself a finding, not reconciled)");
  for (const s of surprises) console.log(`- ${s}`);
}

console.log(`\n## 🚨 GAPS — unsafe freeform AIRED (${gaps.length})`);
if (!gaps.length) console.log("None — every simulated misroute was caught by a surviving lower bar.");
for (const f of gaps) {
  console.log(`- **${f.id}** [${f.severity}] ${f.group}: missed = ${f.missed}`);
  console.log(`    line that aired: "${f.line}"`);
}

console.log("\n## Reading");
console.log("- CAUGHT cases prove SOME bars are content-keyed and survive a downgrade: the sensitive tier still caps one rung down (G1); the universal mobilize rule catches directives (G3a); preflight provenance×sensitivity (G5), name gate (G6), and quiet-boundary (G8) fire regardless of the (wrong) category.");
console.log("- GAPS share one shape: when subject-authored grave/medical/ambiguous content is misrouted to a LOW (celebration/everyday) tier, the tier cap, the ambiguous-valence guard, and the grave-explicit leak detector are ALL category-gated and vanish together — leaving NO content-keyed backstop. The category label is the only thing standing between serious content and a cheerful airing.");
console.log("- REPORT-ONLY. Candidate hardening (NOT merged, flagged for Eng1/Eng2): a content-keyed serious-content floor independent of category — e.g. run GRAVE_EXPLICIT + a sensitivity-field floor as universal preflight/line bars so high-sensitivity or grave-vocab packets cannot air freeform whatever the category says. This is exactly the risk-floor-routing post; it is a Class-1 routing change and must be ratified, not slipped in.");

// CI-stable on prediction accuracy; gaps are reported, not failed (they are the deliverable).
process.exitCode = predOk === FIXTURES.length ? 0 : 1;
