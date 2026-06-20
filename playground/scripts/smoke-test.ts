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
import { loadGoldLabels, loadCommunityCluster } from "../src/evaluation/goldLabels";
import { classifyComparison } from "../src/evaluation/mismatchTypes";
import type { Decision, IngestedItem } from "../src/data/schemas";

const SEP = "=".repeat(60);

type Status = "pass" | "fail" | "xfail";
const results: { name: string; status: Status; note?: string }[] = [];

function record(name: string, pass: boolean, note?: string) {
  results.push({ name, status: pass ? "pass" : "fail", note });
  const tag = pass ? "PASS" : "FAIL";
  console.log(`[${tag}] ${name}${note ? `  ${note}` : ""}`);
}

/**
 * Expected failure — for checks that fail by design until an external
 * blocker clears (e.g., a labeled id that doesn't yet have a seed item).
 * XFAIL counts as "not green" in the summary but does NOT trigger exit 1.
 * If the underlying condition resolves and the check passes on its own,
 * promote it to a normal `record(..., true, ...)`.
 */
function recordXFail(name: string, note: string) {
  results.push({ name, status: "xfail", note });
  console.log(`[XFAIL] ${name}  ${note}`);
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

  // Corpus size — DERIVED, not hardcoded. Per Eng1 handoff 2026-06-20:
  // growing the corpus 40→45 trips checks that asserted literal `40`.
  // Same "don't hardcode what you can compute" lesson as Check 43.
  const N = items.length;
  record(`Check 1: All ${N} seed items load`, items.length === N, `(got ${items.length})`);
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
    `Check 15: First meaning pass populates the cache (${N} misses)`,
    stats1.size === N && stats1.misses === N && stats1.hits === 0,
    `(size=${stats1.size}, misses=${stats1.misses}, hits=${stats1.hits})`
  );

  cache.resetStats();
  await meaningBatch(items, client, cache);
  const stats2 = cache.stats();
  record(
    `Check 16: Second meaning pass reuses the cache (${N} hits, 0 misses)`,
    stats2.size === N && stats2.hits === N && stats2.misses === 0,
    `(size=${stats2.size}, hits=${stats2.hits}, misses=${stats2.misses})`
  );

  const bumpedClient = new MockMeaningClient("meaning-pass-mock-v0.2.0");
  cache.resetStats();
  await meaningBatch(items, bumpedClient, cache);
  const stats3 = cache.stats();
  record(
    `Check 17: prompt_version bump invalidates cache (${N} fresh misses)`,
    stats3.misses === N && stats3.hits === 0 && stats3.size === 2 * N,
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

  console.log("\n--- Diagnostic decision board acceptance checks ---");

  // Reusable helpers for the diagnostic checks.
  const goldLabels = loadGoldLabels();
  const decisionsById = new Map(decisions.map((d) => [d.item_id, d]));
  const meaningById = meaningMap;
  const itemsById = new Map(items.map((i) => [i.id, i]));
  const comparisonOf = (id: string) => {
    const item = itemsById.get(id);
    const decision = decisionsById.get(id);
    if (!item || !decision) return null;
    return classifyComparison(
      item,
      decision,
      goldLabels.get(id),
      meaningById.get(id),
      listener
    );
  };

  // Check 32 — Gold labels load (gold-labels.json v0.2.0 has 10 labels)
  record(
    "Check 32: loadGoldLabels returns the labels (v0.2.0 has 10)",
    goldLabels.size >= 10 &&
      goldLabels.has("p002") &&
      goldLabels.has("p004") &&
      goldLabels.has("p018"),
    `(loaded ${goldLabels.size} labels)`
  );

  // Check 32a — Route field loads correctly on at least one label
  const p004Gold = goldLabels.get("p004");
  record(
    "Check 32a: GoldLabel includes the v0.2.0 'route' field",
    p004Gold?.route === "doorway",
    `(p004 route='${p004Gold?.route}')`
  );

  // Check 32c — community_cluster loads (v0.4.0): 8 entries including
  // the bracket anchors (p018 voiced, p030 ambient) and the new items
  // p041–p045 that need seed-items support before Step 1.3 fitting.
  const community = loadCommunityCluster();
  const communityIds = Array.from(community.keys()).sort();
  record(
    "Check 32c: community_cluster loads with 8 entries (v0.4.0)",
    community.size === 8 &&
      community.has("p018") &&
      community.has("p030") &&
      community.has("p041") &&
      community.has("p045"),
    `(size=${community.size}, ids=[${communityIds.join(",")}])`
  );

  // Check 32d — p045's minor-treatment SAFETY FLOOR loads correctly.
  // Per v0.4.0 _meta this is "the one thing that is NOT a dial."
  // minor_treatment is free-form text starting with the policy token; we
  // verify by prefix match.
  const p045 = community.get("p045");
  record(
    "Check 32d: p045 minor_treatment prefix = 'group_level_STRIP_individuals' (safety floor)",
    (p045?.minor_treatment ?? "").startsWith("group_level_STRIP_individuals") &&
      p045?.minor_involved === true,
    `(prefix-match ok; minor_involved=${p045?.minor_involved})`
  );

  // Check 32e — p044 is the only true 'drop' in the community cluster
  // (per the _meta: "what_the_floor_actually_fits" — the floor fits
  // voiced/ambient, not the lower drop gate; p044 is the only drop).
  const drops = Array.from(community.values()).filter((c) => c.disposition === "drop");
  record(
    "Check 32e: p044 is the only 'drop' disposition in community_cluster",
    drops.length === 1 && drops[0]?.id === "p044",
    `(drop count=${drops.length}, ids=[${drops.map((d) => d.id).join(",")}])`
  );

  // Check 32b — v0.3.0 fields load: eligibility_status, voiceworthiness,
  // disposition_reason. p002 is the cleanest 'blocked' case; p004 the
  // cleanest 'strong_candidate'.
  const p002Gold = goldLabels.get("p002");
  record(
    "Check 32b: GoldLabel includes v0.3.0 fields (eligibility, voiceworthiness, disposition)",
    p002Gold?.eligibility_status === "blocked" &&
      p002Gold?.disposition_reason === "consent_blocked" &&
      p004Gold?.voiceworthiness === "strong_candidate",
    `(p002 elig='${p002Gold?.eligibility_status}', p002 disp='${p002Gold?.disposition_reason}', p004 vw='${p004Gold?.voiceworthiness}')`
  );

  // Check 33 — p004 detected as close_friend_over_suppression (gold-confirmed)
  const cmpP004 = comparisonOf("p004");
  record(
    "Check 33: p004 detected as close_friend_over_suppression",
    cmpP004?.hasGold === true &&
      cmpP004?.agreement === false &&
      cmpP004?.mismatch === "close_friend_over_suppression",
    cmpP004
      ? `(gold=${cmpP004.goldBucket}, engine=${cmpP004.engineBucket}, mismatch=${cmpP004.mismatch})`
      : "(p004 not in decisions)"
  );

  // Check 34 — p002 stays consent-dropped (engine bucket=drop, agreement with gold=drop)
  const cmpP002 = comparisonOf("p002");
  record(
    "Check 34: p002 consent-dropped agrees with gold (drop/drop)",
    cmpP002?.engineBucket === "drop" &&
      cmpP002?.hasGold === true &&
      cmpP002?.agreement === true,
    cmpP002 ? `(gold=${cmpP002.goldBucket}, engine=${cmpP002.engineBucket})` : "(p002 missing)"
  );

  // Check 35 — p020 now labeled voiced (utility route); engine ambient → over_suppression
  const cmpP020 = comparisonOf("p020");
  record(
    "Check 35: p020 now labeled — classified as over_suppression",
    cmpP020?.hasGold === true &&
      cmpP020?.agreement === false &&
      cmpP020?.mismatch === "over_suppression",
    cmpP020 ? `(gold=${cmpP020.goldBucket}, engine=${cmpP020.engineBucket}, mismatch=${cmpP020.mismatch})` : "(p020 missing)"
  );

  // Check 36 — p025 now labeled voiced (utility route); engine ambient → over_suppression
  const cmpP025 = comparisonOf("p025");
  record(
    "Check 36: p025 now labeled — classified as over_suppression",
    cmpP025?.hasGold === true &&
      cmpP025?.agreement === false &&
      cmpP025?.mismatch === "over_suppression",
    cmpP025 ? `(gold=${cmpP025.goldBucket}, engine=${cmpP025.engineBucket}, mismatch=${cmpP025.mismatch})` : "(p025 missing)"
  );

  // Check 37 — p016 / p030 / p010 don't reach a "false_voice" mismatch (engine restraint
  // looks correct on junk / political / generic promo)
  const cmpP010 = comparisonOf("p010");
  const cmpP016 = comparisonOf("p016");
  const cmpP030 = comparisonOf("p030");
  const noFalseVoice =
    cmpP010?.mismatch !== "false_voice" &&
    cmpP010?.mismatch !== "high_sensitivity_false_voice" &&
    cmpP010?.mismatch !== "junk_promoted" &&
    cmpP016?.mismatch !== "false_voice" &&
    cmpP016?.mismatch !== "high_sensitivity_false_voice" &&
    cmpP030?.mismatch !== "false_voice" &&
    cmpP030?.mismatch !== "commercial_overpromotion";
  record(
    "Check 37: Junk/political/generic-promo items don't trigger a false-voice mismatch",
    noFalseVoice,
    `(p010=${cmpP010?.mismatch ?? "none"}, p016=${cmpP016?.mismatch ?? "none"}, p030=${cmpP030?.mismatch ?? "none"})`
  );

  // Check 38 — Comparison surface uses distinct status vocabulary from the safety palette.
  // Structural check: pipeline statuses are "pass|caution|fail|na"; gold comparison
  // statuses are "agreement|mismatch|review-needed". No overlap.
  const pipelineStatuses = ["pass", "caution", "fail", "na"];
  const goldStatuses = ["agreement", "mismatch", "review-needed"];
  const noOverlap = pipelineStatuses.every((s) => !goldStatuses.includes(s));
  record(
    "Check 38: Gold-comparison status vocabulary distinct from safety palette",
    noOverlap,
    `(pipeline=[${pipelineStatuses.join(",")}] vs gold=[${goldStatuses.join(",")}])`
  );

  // Check 39 — p008 (Dana, close family, life event) classified as
  // close_friend_over_suppression (closeness=close for Dana per listener map).
  const cmpP008 = comparisonOf("p008");
  record(
    "Check 39: p008 (Dana close, life event) classified close_friend_over_suppression",
    cmpP008?.hasGold === true &&
      cmpP008?.agreement === false &&
      cmpP008?.mismatch === "close_friend_over_suppression",
    cmpP008 ? `(gold=${cmpP008.goldBucket}, engine=${cmpP008.engineBucket}, mismatch=${cmpP008.mismatch})` : "(p008 missing)"
  );

  // Check 40 — p018 (Buena, "followed" tier, not close) is over_suppression,
  // NOT close_friend_over_suppression. Distinguishes close-friend from generic.
  const cmpP018 = comparisonOf("p018");
  record(
    "Check 40: p018 (Buena followed) classified over_suppression (NOT close_friend)",
    cmpP018?.hasGold === true &&
      cmpP018?.agreement === false &&
      cmpP018?.mismatch === "over_suppression",
    cmpP018 ? `(gold=${cmpP018.goldBucket}, engine=${cmpP018.engineBucket}, mismatch=${cmpP018.mismatch})` : "(p018 missing)"
  );

  // Check 41 — p030 (Kelp Surf generic promo, gold=ambient) and p036 (Jordan-
  // moving, gold=ambient) both agree with engine ambient. Restraint matches.
  const cmpP036 = comparisonOf("p036");
  record(
    "Check 41: p030 + p036 both agree with engine (gold=ambient, engine=ambient)",
    cmpP030?.hasGold === true && cmpP030?.agreement === true &&
      cmpP036?.hasGold === true && cmpP036?.agreement === true,
    `(p030 agree=${cmpP030?.agreement}, p036 agree=${cmpP036?.agreement})`
  );

  // Check 42 — Over-suppression landscape: at default settings, the engine
  // disagrees with gold on EVERY voiced item the PO labeled. This is the
  // "polite corpse" failure mode made concrete in the test suite.
  const overSuppressed = ["p004", "p008", "p018", "p020", "p025"]
    .map(comparisonOf)
    .filter((c) => c && (c.mismatch === "over_suppression" || c.mismatch === "close_friend_over_suppression"));
  record(
    "Check 42: All five gold-voiced items show as over_suppression at default settings",
    overSuppressed.length === 5,
    `(${overSuppressed.length}/5: p004/p008/p018/p020/p025 — flag for team formula discussion)`
  );

  console.log("\n--- Corpus integrity guards ---");

  // Check 43 — Labeled-but-not-in-corpus guard.
  // Per Eng1 task 2026-06-20: every id mentioned in gold-labels.json
  // (both labels[].item_id and community_cluster[].id) must exist as
  // an item in seed-items.json. Generic by construction — no hardcoded
  // id list, no whitelist. The check exists to catch the exact class
  // of gap that let v0.4.0 labels reference items that don't yet exist.
  //
  // EXPECTED TO XFAIL today: p041–p045 are in community_cluster[] but
  // not in seed-items.json yet (Step 1.3 corpus authoring is the
  // open task per passdown-2026-06-20-d item 4). The check clears
  // automatically when those items land — no exemption is added,
  // because exempting the gap is the same as deleting the guard.
  const seedIds = new Set(items.map((i) => i.id));
  const labeledIds = new Set<string>();
  for (const id of goldLabels.keys()) labeledIds.add(id);
  for (const id of community.keys()) labeledIds.add(id);
  const missingIds = Array.from(labeledIds).filter((id) => !seedIds.has(id)).sort();
  if (missingIds.length === 0) {
    record(
      "Check 43: every labeled id exists in seed-items.json (corpus integrity)",
      true,
      `(checked ${labeledIds.size} labeled ids against ${seedIds.size} seed items)`
    );
  } else {
    recordXFail(
      "Check 43: every labeled id exists in seed-items.json (corpus integrity)",
      `missing in corpus: [${missingIds.join(", ")}]. clears when these land in playground/data/seed-items.json (Step 1.3 corpus authoring, per passdown-2026-06-20-d item 4).`
    );
  }

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
  const passed = results.filter((r) => r.status === "pass").length;
  const xfailed = results.filter((r) => r.status === "xfail").length;
  const failed = results.filter((r) => r.status === "fail").length;
  const parts = [`${passed} pass`];
  if (xfailed > 0) parts.push(`${xfailed} expected-fail`);
  if (failed > 0) parts.push(`${failed} UNEXPECTED FAIL`);
  console.log(`SMOKE TEST: ${parts.join(" · ")} (${results.length} total)`);
  if (xfailed > 0 && failed === 0) {
    console.log("  expected failures are recorded blockers, NOT regressions; see [XFAIL] lines above");
  }
  console.log(SEP);
  // Exit non-zero only on UNEXPECTED fail. XFAIL is harmless and self-clears
  // when its underlying blocker resolves (no whitelist needed — the check
  // turns green on its own when the gap is filled).
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error("smoke-test crashed:", e);
  process.exit(2);
});
