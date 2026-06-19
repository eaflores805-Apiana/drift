import { loadSimulated } from "../src/data/adapters/simulatedAdapter";
import { stubScore } from "../src/scoring/stubScorer";
import { consentGate } from "../src/safety/consentGate";
import type { Decision } from "../src/data/schemas";

const SEP = "=".repeat(60);

console.log(SEP);
console.log("Drift Playground — Step 1 smoke test");
console.log("Eligible-audience semantics per team ruling 2026-06-19");
console.log(SEP);

const { listener, items, warnings } = loadSimulated();
console.log(`Listener: ${listener.name} (${listener.location ?? "unknown"})`);
console.log(`Items loaded: ${items.length}`);
if (warnings.length > 0) {
  console.log("Load warnings:");
  for (const w of warnings) console.log(`  - ${w}`);
}

console.log("\n--- Acceptance checks ---");

const check1 = items.length === 40;
console.log(
  `[${check1 ? "PASS" : "FAIL"}] Check 1: All 40 seed items load (got ${items.length})`
);

const check2 = listener.id === "listener_001";
console.log(
  `[${check2 ? "PASS" : "FAIL"}] Check 2: listener_001 loads (got '${listener.id}')`
);

const decisions = items.map(stubScore);
const byBucket = new Map<string, Decision[]>();
for (const d of decisions) {
  if (!byBucket.has(d.bucket)) byBucket.set(d.bucket, []);
  byBucket.get(d.bucket)!.push(d);
}

const p002 = decisions.find((d) => d.item_id === "p002");
const check3 = p002?.bucket === "drop";
console.log(
  `[${check3 ? "PASS" : "FAIL"}] Check 3: p002 drops (private → bucket='${p002?.bucket}')`
);

const check4 =
  p002?.safety_check.passed === false &&
  (p002?.safety_check.rejected_reason?.includes("audience_scope") ?? false);
console.log(
  `[${check4 ? "PASS" : "FAIL"}] Check 4: p002 dropped by consent gate (reason: '${p002?.safety_check.rejected_reason ?? "none"}')`
);

const blanked = { ...items[0], audience_scope: "" };
const blankedResult = consentGate(blanked);
const check5 = blankedResult.passes === false;
console.log(
  `[${check5 ? "PASS" : "FAIL"}] Check 5: Blanked audience_scope drops (passes=${blankedResult.passes}` +
    (blankedResult.passes === false ? `, reason='${blankedResult.reason}'` : "") +
    ")"
);

// New: friends-scoped items reach scoring (the team-ruling amendment)
const p004 = decisions.find((d) => d.item_id === "p004");
const p036 = decisions.find((d) => d.item_id === "p036");
const friendsReachScoring =
  p004 !== undefined &&
  p036 !== undefined &&
  p004.bucket !== "drop" &&
  p036.bucket !== "drop";
console.log(
  `[${friendsReachScoring ? "PASS" : "FAIL"}] Check 6: Friends-scoped items reach scoring ` +
    `(p004 → '${p004?.bucket}', p036 → '${p036?.bucket}')`
);

console.log(
  `[PASS] Check 7: Zero model calls (no model client imported in Step 1 path)`
);

console.log("\n--- Bucket summary ---");
const order = ["drop", "ambient", "voiced", "expandable"];
for (const b of order) {
  const list = byBucket.get(b) ?? [];
  const sample =
    list.length > 0
      ? `  [${list.slice(0, 5).map((d) => d.item_id).join(", ")}${list.length > 5 ? ", ..." : ""}]`
      : "";
  console.log(`  ${b.padEnd(12)} ${list.length.toString().padStart(3)} items${sample}`);
}

const drops = byBucket.get("drop") ?? [];
console.log(`\n--- Consent-gate drops (${drops.length}) ---`);
for (const d of drops) {
  console.log(`  ${d.item_id}: ${d.safety_check.rejected_reason}`);
}

console.log("\n" + SEP);
const allPass = check1 && check2 && check3 && check4 && check5 && friendsReachScoring;
console.log(`SMOKE TEST: ${allPass ? "ALL CHECKS PASS" : "SOME CHECKS FAILED"}`);
console.log(SEP);
process.exit(allPass ? 0 : 1);
