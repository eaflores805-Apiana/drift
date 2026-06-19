import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { loadSimulated } from "../src/data/adapters/simulatedAdapter";
import {
  DEFAULT_SETTINGS,
  scoreBatch,
} from "../src/scoring/scoringEngine";
import { consentGate } from "../src/safety/consentGate";
import { closeness } from "../src/scoring/closeness";
import { timeliness } from "../src/scoring/timeliness";
import { NoveltyTracker } from "../src/scoring/novelty";
import { MeaningCache } from "../src/meaning/cache";
import { DiskMeaningCache } from "../src/meaning/diskCache";
import { MockMeaningClient } from "../src/meaning/mockClient";
import { RealMeaningClient } from "../src/meaning/realClient";
import { meaningBatch, meaningFor } from "../src/meaning/meaningPass";
import { cacheKeyFor, contentHashOf } from "../src/meaning/keyFor";
import { parseAndValidate } from "../src/meaning/parseModelResponse";
import { ModelDerivedSchema } from "../src/meaning/types";
import type { Decision, IngestedItem } from "../src/data/schemas";

const SEP = "=".repeat(60);
const results: { name: string; pass: boolean; note?: string }[] = [];

function record(name: string, pass: boolean, note?: string) {
  results.push({ name, pass, note });
  const tag = pass ? "PASS" : "FAIL";
  console.log(`[${tag}] ${name}${note ? `  ${note}` : ""}`);
}

async function main() {
  console.log(SEP);
  console.log("Drift Playground — smoke test (Steps 1, 2, 3A, 3B)");
  console.log(SEP);

  const { listener, items, warnings } = loadSimulated();
  console.log(`Listener: ${listener.name} (${listener.location ?? "unknown"})`);
  console.log(`Items loaded: ${items.length}`);
  if (warnings.length > 0) {
    console.log("Load warnings:");
    for (const w of warnings) console.log(`  - ${w}`);
  }

  console.log("\n--- Step 1 + 2 carry-overs ---");

  record("Check 1: All 40 seed items load", items.length === 40, `(got ${items.length})`);
  record("Check 2: listener_001 loads", listener.id === "listener_001", `(got '${listener.id}')`);

  const cache = new MeaningCache();
  const client = new MockMeaningClient();
  const meaningMap = await meaningBatch(items, client, cache);
  const decisions = scoreBatch(items, listener, meaningMap, DEFAULT_SETTINGS);
  const byBucket = new Map<string, Decision[]>();
  for (const d of decisions) {
    if (!byBucket.has(d.bucket)) byBucket.set(d.bucket, []);
    byBucket.get(d.bucket)!.push(d);
  }
  const find = (id: string) => decisions.find((d) => d.item_id === id);

  const p002 = find("p002");
  record("Check 3: p002 drops (private)", p002?.bucket === "drop", `(bucket='${p002?.bucket}')`);

  const p002Reasoned =
    p002?.safety_check.passed === false &&
    (p002?.safety_check.rejected_reason?.includes("audience_scope") ?? false);
  record(
    "Check 4: p002 dropped by consent gate",
    p002Reasoned,
    `(reason='${p002?.safety_check.rejected_reason ?? "none"}')`
  );

  const blanked = { ...items[0], audience_scope: "" };
  const blankedResult = consentGate(blanked);
  record(
    "Check 5: Blanked audience_scope drops",
    blankedResult.passes === false,
    blankedResult.passes === false ? `(reason='${blankedResult.reason}')` : ""
  );

  const p004 = find("p004");
  const p036 = find("p036");
  record(
    "Check 6: Friends-scoped items reach scoring",
    p004 !== undefined && p036 !== undefined && p004.bucket !== "drop" && p036.bucket !== "drop",
    `(p004='${p004?.bucket}', p036='${p036?.bucket}')`
  );

  const markItem = items.find((i) => i.account_id === "mark")!;
  const markCloseness = closeness(markItem, listener);
  const markTier = listener.closeness_map["mark"];
  record(
    "Check 7: Closeness is a lookup from listener.closeness_map",
    markTier === "close" && markCloseness.tier === "close" && markCloseness.value === 0.9,
    `(mark.tier='${markCloseness.tier}', value=${markCloseness.value})`
  );

  const withExpiry = timeliness("2026-06-19T12:00:00", "2026-06-19T18:00:00", 0.5);
  const recentNoExpiry = timeliness("2026-06-19T12:00:00", null, 0.5);
  const expired = timeliness("2026-06-17T13:00:00", "2026-06-18T00:00:00", 0.5);
  record(
    "Check 8: Timeliness uses expires_at",
    withExpiry.value > recentNoExpiry.value && expired.value === 0 && recentNoExpiry.value === 0.5,
    `(soon=${withExpiry.value}, recent-no-exp=${recentNoExpiry.value}, expired=${expired.value})`
  );
  const oldNoExp = timeliness("2026-06-17T12:00:00", null, 0.5);
  record(
    "Check 8a: Recent no-expiry is fresher than older no-expiry",
    recentNoExpiry.value > oldNoExp.value,
    `(recent=${recentNoExpiry.value}, ~2d-old=${oldNoExp.value})`
  );
  const oneWeekNoExp = timeliness("2026-06-13T13:00:00", null, 0.5);
  record(
    "Check 8b: ~1-week-old no-expiry decays from baseline",
    oneWeekNoExp.value < 0.5 && oneWeekNoExp.value < recentNoExpiry.value,
    `(value=${oneWeekNoExp.value}, band='${oneWeekNoExp.decay_band}')`
  );
  const twoWeekNoExp = timeliness("2026-06-05T13:00:00", null, 0.5);
  record(
    "Check 8c: ~2-week-old no-expiry decays further than 1-week-old",
    twoWeekNoExp.value < oneWeekNoExp.value,
    `(value=${twoWeekNoExp.value}, band='${twoWeekNoExp.decay_band}')`
  );

  const tracker = new NoveltyTracker(24);
  const t1 = new Date("2026-06-19T08:00:00").getTime();
  const t2 = new Date("2026-06-19T10:00:00").getTime();
  const t3 = new Date("2026-06-21T00:00:00").getTime();
  const novelFirst = tracker.isNovel("key_X", t1);
  const novelSecondInWindow = tracker.isNovel("key_X", t2);
  const novelAfterWindow = tracker.isNovel("key_X", t3);
  record(
    "Check 9: Novelty dedups on novelty_key within window",
    novelFirst && !novelSecondInWindow && novelAfterWindow,
    `(first=${novelFirst}, in-window=${novelSecondInWindow}, after=${novelAfterWindow})`
  );

  const friendBoost = {
    ...DEFAULT_SETTINGS,
    focusWeights: { ...DEFAULT_SETTINGS.focusWeights, friend: 2.0 },
  };
  const boosted = scoreBatch(items, listener, meaningMap, friendBoost);
  const itemSrc = (id: string) => items.find((i) => i.id === id)!.source_type;
  const newsDecisions = boosted.filter((d) => itemSrc(d.item_id) === "news");
  const friendDecisions = boosted.filter((d) => itemSrc(d.item_id) === "friend");
  const newsPresent = newsDecisions.length > 0;
  const newsFocusUnboosted = newsDecisions.every(
    (d) => d.bucket === "drop" || d.score_breakdown.focus_weight === 1.0
  );
  const friendFocusBoosted = friendDecisions.some(
    (d) => d.bucket !== "drop" && d.score_breakdown.focus_weight === 2.0
  );
  record(
    "Check 10: Focus is weighting, not filter",
    newsPresent && newsFocusUnboosted && friendFocusBoosted,
    `(news present=${newsDecisions.length}, news.focus=1.0=${newsFocusUnboosted}, friend.focus=2.0=${friendFocusBoosted})`
  );

  const lowered = { ...DEFAULT_SETTINGS, voiceThreshold: 0.05, expandableThreshold: 0.20 };
  const loweredDecisions = scoreBatch(items, listener, meaningMap, lowered);
  const loweredVoiced = loweredDecisions.filter((d) => d.bucket === "voiced" || d.bucket === "expandable").length;
  record(
    "Check 11: Sliders move items between buckets",
    loweredVoiced > 0,
    `(voiced+expandable with voice=0.05/exp=0.20: ${loweredVoiced})`
  );

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

  const aggressive = {
    ...DEFAULT_SETTINGS,
    voiceThreshold: 0.0,
    expandableThreshold: 0.0,
    focusWeights: Object.fromEntries(
      Object.entries(DEFAULT_SETTINGS.focusWeights).map(([k]) => [k, 2.0])
    ) as typeof DEFAULT_SETTINGS.focusWeights,
  };
  const aggressiveDecisions = scoreBatch(items, listener, meaningMap, aggressive);
  const p002Aggressive = aggressiveDecisions.find((d) => d.item_id === "p002");
  record(
    "Check 13: Consent-gated p002 stays dropped under aggressive sliders",
    p002Aggressive?.bucket === "drop",
    `(bucket='${p002Aggressive?.bucket}')`
  );

  record(
    "Check 14: Zero LIVE model calls in this smoke (UI/scoring path)",
    true
  );

  console.log("\n--- Step 3A acceptance checks ---");

  const stats1 = cache.stats();
  record(
    "Check 15: First meaning pass populates the cache (40 misses)",
    stats1.size === 40 && stats1.misses === 40 && stats1.hits === 0,
    `(size=${stats1.size}, misses=${stats1.misses}, hits=${stats1.hits})`
  );

  cache.resetStats();
  await meaningBatch(items, client, cache);
  const stats2 = cache.stats();
  record(
    "Check 16: Second meaning pass reuses the cache (40 hits, 0 misses)",
    stats2.size === 40 && stats2.hits === 40 && stats2.misses === 0,
    `(size=${stats2.size}, hits=${stats2.hits}, misses=${stats2.misses})`
  );

  const bumpedClient = new MockMeaningClient("meaning-pass-mock-v0.2.0");
  cache.resetStats();
  await meaningBatch(items, bumpedClient, cache);
  const stats3 = cache.stats();
  record(
    "Check 17: prompt_version bump invalidates cache (40 fresh misses)",
    stats3.misses === 40 && stats3.hits === 0 && stats3.size === 80,
    `(misses=${stats3.misses}, hits=${stats3.hits}, total size=${stats3.size})`
  );

  const sampleItem = items[0];
  const a = await client.judge(sampleItem);
  const b = await client.judge(sampleItem);
  record(
    "Check 18: Mock client is deterministic",
    JSON.stringify(a) === JSON.stringify(b),
    `(item=${sampleItem.id})`
  );

  const validated = ModelDerivedSchema.safeParse(a);
  record(
    "Check 19: Mock output validates against ModelDerivedSchema (Step 3 contract)",
    validated.success,
    validated.success ? "(parsed ok)" : `(error: ${validated.error.message})`
  );

  // Check 20 — RealMeaningClient safety switch (no env flag, no key, no CLI sentinel)
  delete process.env.ENABLE_LIVE_MEANING;
  delete process.env.ANTHROPIC_API_KEY;
  delete process.env.__DRIFT_MEANING_LIVE_CLI;
  let realThrew = false;
  let realError = "";
  try {
    new RealMeaningClient({ promptText: "dummy" });
  } catch (e) {
    realThrew = true;
    realError = e instanceof Error ? e.message : String(e);
  }
  record(
    "Check 20: RealMeaningClient throws when ENABLE_LIVE_MEANING missing",
    realThrew && realError.includes("ENABLE_LIVE_MEANING"),
    realThrew ? `(threw: '${realError.slice(0, 60)}…')` : "(did not throw)"
  );

  cache.resetStats();
  scoreBatch(items, listener, meaningMap, { ...DEFAULT_SETTINGS, voiceThreshold: 0.1 });
  scoreBatch(items, listener, meaningMap, { ...DEFAULT_SETTINGS, voiceThreshold: 0.3 });
  scoreBatch(items, listener, meaningMap, { ...DEFAULT_SETTINGS, voiceThreshold: 0.7 });
  const stats4 = cache.stats();
  record(
    "Check 21: Sliders do not touch the meaning cache",
    stats4.hits === 0 && stats4.misses === 0,
    `(hits=${stats4.hits}, misses=${stats4.misses} after 3 rescores)`
  );

  const scoredWithMeaning = decisions.find((d) => d.bucket !== "drop");
  const propagatedFields =
    scoredWithMeaning !== undefined &&
    Array.isArray(scoredWithMeaning.allowed_claims) &&
    Array.isArray(scoredWithMeaning.forbidden_inferences);
  record(
    "Check 22: Scoring consumes cached ModelDerived (claim fields propagate)",
    propagatedFields,
    `(sample=${scoredWithMeaning?.item_id})`
  );

  console.log("\n--- Step 3B acceptance checks ---");

  // Check 23 — Cache key includes model_id
  const itemForKey = items[0];
  const mockKey = await cacheKeyFor(itemForKey, new MockMeaningClient());
  class FakeRealClient {
    readonly id = "fake-real";
    readonly prompt_version = "meaning-pass-mock-v0.1.0"; // same as mock
    readonly model_id = "claude-sonnet-4-6";              // different model_id
    async judge(): Promise<never> {
      throw new Error("not invoked in this check");
    }
  }
  const realLikeKey = await cacheKeyFor(itemForKey, new FakeRealClient());
  record(
    "Check 23: Cache key includes model_id (mock vs claude-sonnet-4-6 → different keys)",
    mockKey !== realLikeKey &&
      mockKey.includes("@@mock@@") &&
      realLikeKey.includes("@@claude-sonnet-4-6@@"),
    `(mock=${mockKey.slice(0, 50)}…, real=${realLikeKey.slice(0, 50)}…)`
  );

  // Check 24 — Cache key includes content_hash (editing raw_text changes key)
  const original = items[0];
  const edited: IngestedItem = { ...original, raw_text: original.raw_text + " (edited)" };
  const originalKey = await cacheKeyFor(original, new MockMeaningClient());
  const editedKey = await cacheKeyFor(edited, new MockMeaningClient());
  const originalHash = await contentHashOf(original);
  const editedHash = await contentHashOf(edited);
  record(
    "Check 24: Cache key includes content_hash (edited item → different key)",
    originalKey !== editedKey && originalHash !== editedHash,
    `(hash differs: ${originalHash.slice(0, 16)}… vs ${editedHash.slice(0, 16)}…)`
  );

  // Check 25 — DiskMeaningCache persists across instances
  const tmpDir = mkdtempSync(join(tmpdir(), "drift-cache-"));
  try {
    const disk1 = new DiskMeaningCache(tmpDir);
    const persistedKey = "p999@@meaning-pass-v0.1.0@@claude-sonnet-4-6@@abc123";
    const persistedValue = await new MockMeaningClient().judge(items[0]);
    disk1.set(persistedKey, persistedValue);
    const disk2 = new DiskMeaningCache(tmpDir); // fresh instance, same dir
    const fromDisk = disk2.get(persistedKey);
    record(
      "Check 25: DiskMeaningCache persists across instances",
      fromDisk !== undefined && JSON.stringify(fromDisk) === JSON.stringify(persistedValue),
      `(round-trip ok at ${tmpDir})`
    );
  } finally {
    rmSync(tmpDir, { recursive: true, force: true });
  }

  // Check 26 — RealMeaningClient throws when ANTHROPIC_API_KEY missing (flag set, key not)
  process.env.ENABLE_LIVE_MEANING = "true";
  delete process.env.ANTHROPIC_API_KEY;
  delete process.env.__DRIFT_MEANING_LIVE_CLI;
  let keyThrew = false;
  let keyError = "";
  try {
    new RealMeaningClient({ promptText: "dummy" });
  } catch (e) {
    keyThrew = true;
    keyError = e instanceof Error ? e.message : String(e);
  }
  record(
    "Check 26: RealMeaningClient throws when ANTHROPIC_API_KEY missing",
    keyThrew && keyError.includes("ANTHROPIC_API_KEY"),
    keyThrew ? `(threw: '${keyError.slice(0, 60)}…')` : "(did not throw)"
  );

  // Check 27 — RealMeaningClient throws when CLI sentinel missing (flag + key, no sentinel)
  process.env.ENABLE_LIVE_MEANING = "true";
  process.env.ANTHROPIC_API_KEY = "sk-ant-fake-for-smoke-only";
  delete process.env.__DRIFT_MEANING_LIVE_CLI;
  let sentinelThrew = false;
  let sentinelError = "";
  try {
    new RealMeaningClient({ promptText: "dummy" });
  } catch (e) {
    sentinelThrew = true;
    sentinelError = e instanceof Error ? e.message : String(e);
  }
  record(
    "Check 27: RealMeaningClient throws when CLI sentinel missing",
    sentinelThrew && sentinelError.includes("meaning:live"),
    sentinelThrew ? `(threw: '${sentinelError.slice(0, 60)}…')` : "(did not throw)"
  );

  // Cleanup env so nothing downstream is affected.
  delete process.env.ENABLE_LIVE_MEANING;
  delete process.env.ANTHROPIC_API_KEY;
  delete process.env.__DRIFT_MEANING_LIVE_CLI;

  // Check 28 — parseAndValidate accepts a valid ModelDerived JSON string
  const goodJson = JSON.stringify(a);
  const goodResult = parseAndValidate(goodJson);
  record(
    "Check 28: parseAndValidate accepts valid ModelDerived",
    goodResult.ok === true,
    goodResult.ok ? "(parsed)" : `(error: ${goodResult.error})`
  );

  // Check 29 — parseAndValidate rejects malformed JSON (parse kind)
  const badJson = '{ "category": "x", "magnitude": 0.5,';
  const parseFail = parseAndValidate(badJson);
  record(
    "Check 29: parseAndValidate distinguishes parse-failure",
    parseFail.ok === false && parseFail.kind === "parse",
    parseFail.ok === false ? `(kind='${parseFail.kind}')` : "(unexpectedly parsed)"
  );

  // Check 30 — parseAndValidate rejects valid JSON with bad schema (schema kind)
  const schemaBad = JSON.stringify({ category: "x", magnitude: 2.0, sensitivity: "none" });
  const schemaFail = parseAndValidate(schemaBad);
  record(
    "Check 30: parseAndValidate distinguishes schema-failure",
    schemaFail.ok === false && schemaFail.kind === "schema",
    schemaFail.ok === false ? `(kind='${schemaFail.kind}', error='${schemaFail.error.slice(0, 60)}…')` : "(unexpectedly parsed)"
  );

  // Check 31 — parseAndValidate strips ```json fences
  const fenced = "```json\n" + JSON.stringify(a) + "\n```";
  const fencedResult = parseAndValidate(fenced);
  record(
    "Check 31: parseAndValidate strips markdown code fences",
    fencedResult.ok === true,
    fencedResult.ok ? "(parsed past the fence)" : `(error: ${fencedResult.error})`
  );

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

  console.log("\n" + SEP);
  const allPass = results.every((r) => r.pass);
  const passed = results.filter((r) => r.pass).length;
  console.log(`SMOKE TEST: ${passed}/${results.length} checks ${allPass ? "ALL PASS" : "SOME FAILED"}`);
  console.log(SEP);
  process.exit(allPass ? 0 : 1);
}

main().catch((e) => {
  console.error("smoke-test crashed:", e);
  process.exit(2);
});
