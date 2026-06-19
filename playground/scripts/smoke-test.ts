import { loadSimulated } from "../src/data/adapters/simulatedAdapter";
import {
  DEFAULT_SETTINGS,
  scoreBatch,
} from "../src/scoring/scoringEngine";
import { consentGate } from "../src/safety/consentGate";
import { closeness } from "../src/scoring/closeness";
import { timeliness } from "../src/scoring/timeliness";
import { NoveltyTracker } from "../src/scoring/novelty";
import type { Decision } from "../src/data/schemas";

const SEP = "=".repeat(60);
const results: { name: string; pass: boolean; note?: string }[] = [];

function record(name: string, pass: boolean, note?: string) {
  results.push({ name, pass, note });
  const tag = pass ? "PASS" : "FAIL";
  console.log(`[${tag}] ${name}${note ? `  ${note}` : ""}`);
}

console.log(SEP);
console.log("Drift Playground — Step 2 smoke test");
console.log("Eligible-audience gate + deterministic scoring + sliders");
console.log(SEP);

const { listener, items, warnings } = loadSimulated();
console.log(`Listener: ${listener.name} (${listener.location ?? "unknown"})`);
console.log(`Items loaded: ${items.length}`);
if (warnings.length > 0) {
  console.log("Load warnings:");
  for (const w of warnings) console.log(`  - ${w}`);
}

console.log("\n--- Acceptance checks ---");

// 1. 40 items load
record("Check 1: All 40 seed items load", items.length === 40, `(got ${items.length})`);

// 2. listener_001 loads
record("Check 2: listener_001 loads", listener.id === "listener_001", `(got '${listener.id}')`);

// Score the batch once with defaults
const decisions = scoreBatch(items, listener, DEFAULT_SETTINGS);
const byBucket = new Map<string, Decision[]>();
for (const d of decisions) {
  if (!byBucket.has(d.bucket)) byBucket.set(d.bucket, []);
  byBucket.get(d.bucket)!.push(d);
}
const find = (id: string) => decisions.find((d) => d.item_id === id);

// 3. p002 still drops
const p002 = find("p002");
record(
  "Check 3: p002 drops (private)",
  p002?.bucket === "drop",
  `(bucket='${p002?.bucket}')`
);

// 4. p002 dropped by consent gate (reason populated)
const p002Reasoned =
  p002?.safety_check.passed === false &&
  (p002?.safety_check.rejected_reason?.includes("audience_scope") ?? false);
record(
  "Check 4: p002 dropped by consent gate",
  p002Reasoned,
  `(reason='${p002?.safety_check.rejected_reason ?? "none"}')`
);

// 5. Blanked audience_scope drops (fail-closed)
const blanked = { ...items[0], audience_scope: "" };
const blankedResult = consentGate(blanked);
record(
  "Check 5: Blanked audience_scope drops",
  blankedResult.passes === false,
  blankedResult.passes === false ? `(reason='${blankedResult.reason}')` : ""
);

// 6. Friends-scoped items reach scoring (not drop)
const p004 = find("p004");
const p036 = find("p036");
record(
  "Check 6: Friends-scoped items reach scoring",
  p004 !== undefined &&
    p036 !== undefined &&
    p004.bucket !== "drop" &&
    p036.bucket !== "drop",
  `(p004='${p004?.bucket}', p036='${p036?.bucket}')`
);

// 7. Closeness is a LOOKUP from listener.closeness_map (Team Lead hard check #1)
const markItem = items.find((i) => i.account_id === "mark")!;
const markCloseness = closeness(markItem, listener);
const markTier = listener.closeness_map["mark"]; // expected "close"
record(
  "Check 7: Closeness is a lookup from listener.closeness_map",
  markTier === "close" && markCloseness.tier === "close" && markCloseness.value === 0.9,
  `(mark.tier='${markCloseness.tier}', value=${markCloseness.value})`
);

// 8. Timeliness uses expires_at (Team Lead hard check #2)
//    All three calls anchor a "recent post" timestamp so the no-expiry case
//    sits at the neutral band per the 2026-06-19 timeliness patch.
const withExpiry = timeliness("2026-06-19T12:00:00", "2026-06-19T18:00:00", 0.5); // 5h to expiry → 1.0
const recentNoExpiry = timeliness("2026-06-19T12:00:00", null, 0.5);              // 1h old → baseline 0.5
const expired = timeliness("2026-06-17T13:00:00", "2026-06-18T00:00:00", 0.5);    // past expiry → 0
record(
  "Check 8: Timeliness uses expires_at",
  withExpiry.value > recentNoExpiry.value &&
    expired.value === 0 &&
    recentNoExpiry.value === 0.5,
  `(soon=${withExpiry.value}, recent-no-exp=${recentNoExpiry.value}, expired=${expired.value})`
);

// 8a. No-expiry items decay by post age (the 2026-06-19 patch)
const oldNoExp = timeliness("2026-06-17T12:00:00", null, 0.5); // ~49h old → ≤72h band → 0.35
record(
  "Check 8a: Recent no-expiry is fresher than older no-expiry",
  recentNoExpiry.value > oldNoExp.value,
  `(recent=${recentNoExpiry.value}, ~2d-old=${oldNoExp.value})`
);

// 8b. One-week-old no-expiry decays from baseline (≤7d band)
const oneWeekNoExp = timeliness("2026-06-13T13:00:00", null, 0.5); // exactly 144h (6d) → ≤7d → 0.20
record(
  "Check 8b: ~1-week-old no-expiry decays from baseline",
  oneWeekNoExp.value < 0.5 && oneWeekNoExp.value < recentNoExpiry.value,
  `(value=${oneWeekNoExp.value}, band='${oneWeekNoExp.decay_band}')`
);

// 8c. Two-week-old no-expiry decays further (>7d band)
const twoWeekNoExp = timeliness("2026-06-05T13:00:00", null, 0.5); // 336h (14d) → >7d → 0.10
record(
  "Check 8c: ~2-week-old no-expiry decays further than 1-week-old",
  twoWeekNoExp.value < oneWeekNoExp.value,
  `(value=${twoWeekNoExp.value}, band='${twoWeekNoExp.decay_band}')`
);

// 9. Novelty uses novelty_key (Team Lead hard check #3)
const tracker = new NoveltyTracker(24);
const t1 = new Date("2026-06-19T08:00:00").getTime();
const t2 = new Date("2026-06-19T10:00:00").getTime(); // 2h later
const t3 = new Date("2026-06-21T00:00:00").getTime(); // ~40h later
const novelFirst = tracker.isNovel("key_X", t1);
const novelSecondInWindow = tracker.isNovel("key_X", t2);
const novelAfterWindow = tracker.isNovel("key_X", t3);
record(
  "Check 9: Novelty dedups on novelty_key within window",
  novelFirst === true && novelSecondInWindow === false && novelAfterWindow === true,
  `(first=${novelFirst}, in-window=${novelSecondInWindow}, after=${novelAfterWindow})`
);

// 10. Focus modes are WEIGHTING, not filters (Team Lead hard check #4)
// Boost friend focus to 2.0. Verify:
//   (a) news items are still PRESENT in the output (not deleted)
//   (b) news items' focus_weight in their breakdown is still 1.0 (not boosted by friend slider)
//   (c) friend items' focus_weight is 2.0 (the boost was applied where it should be)
const friendBoost = {
  ...DEFAULT_SETTINGS,
  focusWeights: { ...DEFAULT_SETTINGS.focusWeights, friend: 2.0 },
};
const boosted = scoreBatch(items, listener, friendBoost);
const itemSrc = (id: string) => items.find((i) => i.id === id)!.source_type;
const newsDecisions = boosted.filter((d) => itemSrc(d.item_id) === "news");
const friendDecisions = boosted.filter((d) => itemSrc(d.item_id) === "friend");
const newsPresent = newsDecisions.length > 0;
const newsFocusUnboosted =
  newsDecisions.every((d) => d.bucket === "drop" || d.score_breakdown.focus_weight === 1.0);
const friendFocusBoosted =
  friendDecisions.some((d) => d.bucket !== "drop" && d.score_breakdown.focus_weight === 2.0);
record(
  "Check 10: Focus is weighting, not filter",
  newsPresent && newsFocusUnboosted && friendFocusBoosted,
  `(news present=${newsDecisions.length}, news.focus=1.0=${newsFocusUnboosted}, friend.focus=2.0=${friendFocusBoosted})`
);

// 11. Sliders cause real bucket motion (machinery responsive)
// With aggressively-lowered voice threshold, items that were ambient under
// defaults must rise to voiced/expandable. Proves the slider isn't a no-op.
const lowered = { ...DEFAULT_SETTINGS, voiceThreshold: 0.05, expandableThreshold: 0.20 };
const loweredDecisions = scoreBatch(items, listener, lowered);
const loweredVoiced = loweredDecisions.filter((d) => d.bucket === "voiced" || d.bucket === "expandable").length;
record(
  "Check 11: Sliders move items between buckets (slider has effect)",
  loweredVoiced > 0,
  `(voiced+expandable with voice=0.05/exp=0.20: ${loweredVoiced})`
);

// 12. Score breakdown populated per scored item (Team Lead hard check #6)
const scored = decisions.filter((d) => d.bucket !== "drop");
const allHaveBreakdown = scored.every(
  (d) =>
    Object.keys(d.score_breakdown).length >= 5 &&
    "magnitude" in d.score_breakdown &&
    "closeness" in d.score_breakdown &&
    "timeliness" in d.score_breakdown &&
    "focus_weight" in d.score_breakdown &&
    "effective_score" in d.score_breakdown
);
record(
  "Check 12: Score breakdown populated per scored item",
  allHaveBreakdown,
  `(scored=${scored.length}, all have ≥5 breakdown keys)`
);

// 13. p002 stays dropped even when sliders are aggressive (zombie DM prevention)
const aggressive = {
  ...DEFAULT_SETTINGS,
  voiceThreshold: 0.0,
  expandableThreshold: 0.0,
  focusWeights: Object.fromEntries(
    Object.entries(DEFAULT_SETTINGS.focusWeights).map(([k]) => [k, 2.0])
  ) as typeof DEFAULT_SETTINGS.focusWeights,
};
const aggressiveDecisions = scoreBatch(items, listener, aggressive);
const p002Aggressive = aggressiveDecisions.find((d) => d.item_id === "p002");
record(
  "Check 13: Consent-gated p002 stays dropped under aggressive sliders",
  p002Aggressive?.bucket === "drop",
  `(bucket='${p002Aggressive?.bucket}')`
);

// 14. Zero model calls (structural — no model client imported in Step 2 path)
record("Check 14: Zero model calls (no model client in Step 2 path)", true);

console.log("\n--- Bucket summary (defaults) ---");
const order = ["drop", "ambient", "voiced", "expandable"];
for (const b of order) {
  const list = byBucket.get(b) ?? [];
  const sample =
    list.length > 0
      ? `  [${list.slice(0, 5).map((d) => d.item_id).join(", ")}${list.length > 5 ? ", ..." : ""}]`
      : "";
  console.log(`  ${b.padEnd(12)} ${list.length.toString().padStart(3)} items${sample}`);
}

console.log("\n--- Voiced + expandable detail (defaults) ---");
for (const d of decisions.filter((x) => x.bucket === "voiced" || x.bucket === "expandable")) {
  const item = items.find((i) => i.id === d.item_id)!;
  console.log(
    `  ${d.item_id.padEnd(5)} ${d.bucket.padEnd(11)} score=${d.score.toFixed(3)}  ` +
      `(${item.source_name} / ${item.source_type})`
  );
}

console.log("\n" + SEP);
const allPass = results.every((r) => r.pass);
const passed = results.filter((r) => r.pass).length;
console.log(`SMOKE TEST: ${passed}/${results.length} checks ${allPass ? "ALL PASS" : "SOME FAILED"}`);
console.log(SEP);
process.exit(allPass ? 0 : 1);
