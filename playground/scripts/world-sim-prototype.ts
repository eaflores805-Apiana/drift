/**
 * World-Sim Prototype (THROWAWAY) — 2026-06-22.
 *
 * A thin proof-of-concept for the Simulated Social World proposal
 * (docs/correspondence/cs-simulated-world-proposal-2026-06-22.md).
 *
 * Goal of THIS test: see whether a handful of agents, each carrying a hidden
 * multi-stage life-arc, produce a feed that (a) reads as *lived* and *oblique*
 * and (b) is a real typed event stream — posts, comments, likes, plus injected
 * platform noise (ads / memes / suggestions / local news) — not just posts.
 *
 * NOT production. No memory engine, no planning, no spatial world. Arcs advance
 * one stage per tick. Likes/shares are cheap probability rules (no LLM). Only
 * original posts + comments cost a model call.
 *
 * Run: npx tsx scripts/world-sim-prototype.ts
 */

import Anthropic from "@anthropic-ai/sdk";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

function loadDotenv(path: string): void {
  if (!existsSync(path)) return;
  for (const rawLine of readFileSync(path, "utf-8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq < 0) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = val;
  }
}
loadDotenv(resolve(ROOT, ".env"));

const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
  console.error("No ANTHROPIC_API_KEY in playground/.env — cannot run the live test.");
  process.exit(1);
}
const anthropic = new Anthropic({ apiKey });
const MODEL = process.env.WORLD_MODEL ?? "claude-sonnet-4-6";

// ---------------------------------------------------------------------------
// The listener at the center (the existing fixture).
// ---------------------------------------------------------------------------
const LISTENER = {
  name: "Alex Rivera",
  location: "Ventura, CA",
  note: "Alex is the radio listener. Agents are people in Alex's life. They are NOT posting to Alex; they post to their own followers as people really do.",
};

// ---------------------------------------------------------------------------
// The cast. Each agent has an identity + a hidden, multi-stage life-arc.
// `stages[tick]` is the PRIVATE truth of where their life is that day.
// `disclosureStyle` controls how openly they post about it.
// ---------------------------------------------------------------------------
type Agent = {
  id: string;
  name: string;
  source_kind: "close_friend" | "friend" | "sibling" | "acquaintance" | "brand";
  bio: string;
  voice: string;
  disclosureStyle: string;
  postiness: number; // 0..1 likelihood-ish of doing something each tick
  arcName: string;
  stages: string[]; // private truth, one per tick
};

const AGENTS: Agent[] = [
  {
    id: "priya",
    name: "Priya",
    source_kind: "close_friend",
    bio: "31, ER nurse in Ventura. Does Tuesday trivia with Alex. Dry humor, warm, private about hard things.",
    voice: "understated, a little wry, rarely dramatic",
    disclosureStyle:
      "When something is heavy, she does NOT announce it. She cancels plans, goes quiet, or posts something small and adjacent. Never says the real thing outright.",
    postiness: 0.85,
    arcName: "her mother's health is declining",
    stages: [
      "Day 1: Mom has a doctor's appointment today that Priya is privately worried about, but it might be nothing.",
      "Day 2: The tests came back not good. Priya found out this afternoon. She is shaken and has not told most people.",
      "Day 3: Mom starts treatment next week. Priya is exhausted and running on fumes, holding it together.",
    ],
  },
  {
    id: "mark",
    name: "Mark",
    source_kind: "friend",
    bio: "34, product manager, friends with Alex from college. In DC this week for a make-or-break work pitch.",
    voice: "energetic, slightly self-deprecating, posts in the moment",
    disclosureStyle:
      "Fairly open and upbeat. Posts about the trip and nerves, but spins stress as excitement.",
    postiness: 0.9,
    arcName: "a high-stakes work pitch in DC",
    stages: [
      "Day 1: Just landed in DC. The big pitch is in two days. Nervous but hyping himself up.",
      "Day 2: Pitch is tomorrow. Up late rehearsing in the hotel, anxious, ordering bad room-service.",
      "Day 3: The pitch happened this morning. It went really well — relief and elation.",
    ],
  },
  {
    id: "dana",
    name: "Dana",
    source_kind: "sibling",
    bio: "Alex's younger sister, 28, lives nearby, two kids. Chatty, posts a LOT, mostly mundane daily life.",
    voice: "casual, emoji-ish, high-volume, low-stakes",
    disclosureStyle: "Very open about small stuff. Over-shares the mundane. Nothing heavy this week.",
    postiness: 1.0,
    arcName: "ordinary busy-parent week + planning Alex's birthday surprise",
    stages: [
      "Day 1: Normal chaotic morning with the kids. Quietly starting to plan a surprise for Alex's birthday (does not name it publicly).",
      "Day 2: Kid spilled juice on the laptop. Venting comedically. Still secretly coordinating the birthday thing.",
      "Day 3: Found the perfect gift for the birthday surprise, thrilled, but stays vague so it stays a surprise.",
    ],
  },
  {
    id: "mateo",
    name: "Mateo",
    source_kind: "friend",
    bio: "29, surfs, knows Alex from the break. Recently lost his older brother. Posts rarely.",
    voice: "spare, gentle, says little",
    disclosureStyle:
      "Grieving. Mostly silent. When he posts, it is oblique and quiet — a photo, a few words — never a grief announcement.",
    postiness: 0.45,
    arcName: "early grief after losing his brother",
    stages: [
      "Day 1: First week back to normal routines after the funeral. Numb. Went for a dawn surf alone.",
      "Day 2: A hard day — would have been his brother's birthday. Mostly offline.",
      "Day 3: A small okay moment — coffee with their mom, a flicker of lightness.",
    ],
  },
  {
    id: "driftwood",
    name: "Driftwood Roasters",
    source_kind: "brand",
    bio: "Local Ventura coffee roaster Alex follows. Posts promos and shop updates.",
    voice: "friendly small-business marketing",
    disclosureStyle: "Commercial. Posts offers, new drinks, events. This is the noise/utility a brand produces.",
    postiness: 0.7,
    arcName: "summer seasonal launch",
    stages: [
      "Day 1: Teasing a new summer cold-brew flavor dropping this week.",
      "Day 2: The summer cold-brew is now available. Promo with a discount code.",
      "Day 3: Weekend live-music event at the shop announcement.",
    ],
  },
];

// ---------------------------------------------------------------------------
// The feed (typed event stream) + event factory (defined before use).
// ---------------------------------------------------------------------------
type FeedEvent = {
  id: string;
  tick: number;
  type: "post" | "comment" | "ad" | "meme" | "suggestion" | "news" | "dm";
  author: string;
  source_kind: string;
  visibility: "public" | "friends" | "private";
  text: string;
  parent?: string;
  likes: number;
  hidden_truth?: string; // ground truth (engine never sees this; test-only)
};

let SEQ = 0;
function ev(
  type: FeedEvent["type"],
  author: string,
  source_kind: string,
  text: string,
  visibility: FeedEvent["visibility"],
  extra: Partial<FeedEvent> = {}
): FeedEvent {
  return { id: `e${++SEQ}`, tick: -1, type, author, source_kind, visibility, text, likes: 0, ...extra };
}

const FEED: FeedEvent[] = [];

// Platform-injected content — NOT from the cast. The engagement noise Drift
// must reject. Pooled/templated, no model calls.
const PLATFORM_POOL: { tick: number; item: FeedEvent }[] = [
  { tick: 0, item: ev("ad", "FreshFork Meal Kits", "brand", "🍳 Dinner solved. Get 60% off your first 3 FreshFork boxes — code SUMMER60. Sponsored.", "public") },
  { tick: 0, item: ev("suggestion", "Platform", "platform", "People you may know: Greg Halloran, Maritime Coffee Co., 3 others →", "public") },
  { tick: 1, item: ev("meme", "Coastal Memes", "page", "[image] 'Me checking the surf report for the 9th time before work' 😂 14k shares", "public") },
  { tick: 1, item: ev("news", "Ventura County News", "org", "Lane closures on the 101 NB near Seaward through Friday for repaving.", "public") },
  { tick: 2, item: ev("ad", "ClariSkin", "brand", "Dermatologists hate this one trick. Tap to see what's really in your serum. Sponsored.", "public") },
  { tick: 2, item: ev("meme", "Dog Rates Daily", "page", "[image] '13/10 would let him drive the boat' 🐶 28k shares", "public") },
];

// Cheap closeness used for the likes rule (no model calls).
const CLOSENESS: Record<string, number> = {
  priya: 0.9, mark: 0.7, dana: 0.95, mateo: 0.6, driftwood: 0.3,
};

// ---------------------------------------------------------------------------
// The model call: an agent decides what (if anything) to do this tick.
// ---------------------------------------------------------------------------
function stripFences(s: string): string {
  return s.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
}

async function agentAct(agent: Agent, tick: number, recentFeed: FeedEvent[]): Promise<void> {
  const recent = recentFeed
    .slice(-6)
    .map((e) => `- [${e.type}] ${e.author}: ${e.text}`)
    .join("\n") || "(quiet so far)";

  const system =
    `You are role-playing a real person on a social network. You are ${agent.name}: ${agent.bio} ` +
    `Voice: ${agent.voice}. Disclosure style: ${agent.disclosureStyle} ` +
    `Behave like a REAL person on social media: most posts are mundane; people do not narrate their inner lives; ` +
    `heavy things show up obliquely (a cancelled plan, a short flat line, going quiet) — never as an announcement. ` +
    `You may also just react to someone else's post with a short comment, or do nothing at all. Keep it short and real.`;

  const user =
    `TODAY (private truth only you know): ${agent.stages[tick]}\n\n` +
    `Recent feed you've seen:\n${recent}\n\n` +
    `Decide ONE action for today. Respond with ONLY a JSON object, no prose, no fences:\n` +
    `{"action":"post"|"comment"|"skip","text":"<what you write, or empty if skip>","reply_to":"<author name if comment, else empty>"}`;

  let raw = "";
  try {
    const resp = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 300,
      system,
      messages: [{ role: "user", content: user }],
    });
    raw = resp.content.map((b) => (b.type === "text" ? b.text : "")).join("");
  } catch (err) {
    console.error(`  ! ${agent.name} model error:`, (err as Error).message);
    return;
  }

  let parsed: { action: string; text?: string; reply_to?: string };
  try {
    parsed = JSON.parse(stripFences(raw));
  } catch {
    // Fallback: treat any prose as a post.
    parsed = { action: raw.trim() ? "post" : "skip", text: raw.trim() };
  }

  if (parsed.action === "skip" || !parsed.text?.trim()) return;

  const vis: FeedEvent["visibility"] = agent.source_kind === "brand" ? "public" : "friends";
  if (parsed.action === "comment" && parsed.reply_to) {
    const parent = [...FEED].reverse().find((e) => e.author.toLowerCase() === parsed.reply_to!.toLowerCase());
    FEED.push(
      ev("comment", agent.name, agent.source_kind, parsed.text.trim(), vis, {
        tick, parent: parent?.id, hidden_truth: agent.stages[tick],
      })
    );
  } else {
    FEED.push(
      ev("post", agent.name, agent.source_kind, parsed.text.trim(), vis, {
        tick, hidden_truth: agent.stages[tick],
      })
    );
  }
}

// Cheap likes rule: each agent maybe-likes each post from this tick.
function applyLikes(tick: number): void {
  const postsThisTick = FEED.filter((e) => e.tick === tick && (e.type === "post" || e.type === "comment"));
  for (const post of postsThisTick) {
    let likes = 0;
    for (const a of AGENTS) {
      if (a.name === post.author) continue;
      const p = (CLOSENESS[a.id] ?? 0.3) * 0.8;
      if (Math.random() < p) likes++;
    }
    // a little ambient public liking
    likes += Math.floor(Math.random() * (post.source_kind === "brand" ? 25 : 8));
    post.likes = likes;
  }
}

// ---------------------------------------------------------------------------
// Run the world.
// ---------------------------------------------------------------------------
async function main(): Promise<void> {
  const TICKS = 3;
  console.log(`\n=== WORLD-SIM PROTOTYPE — ${AGENTS.length} agents × ${TICKS} ticks — model ${MODEL} ===`);
  console.log(`Listener at center: ${LISTENER.name} (${LISTENER.location})\n`);

  let calls = 0;
  for (let tick = 0; tick < TICKS; tick++) {
    // platform injections first
    for (const p of PLATFORM_POOL.filter((x) => x.tick === tick)) {
      FEED.push({ ...p.item, tick });
    }
    // agents act (in random order)
    for (const agent of [...AGENTS].sort(() => Math.random() - 0.5)) {
      if (Math.random() > agent.postiness) continue;
      await agentAct(agent, tick, FEED);
      calls++;
    }
    applyLikes(tick);
  }

  // ---- readable output ----
  for (let tick = 0; tick < TICKS; tick++) {
    console.log(`\n──────────── DAY ${tick + 1} ────────────`);
    for (const e of FEED.filter((x) => x.tick === tick)) {
      const tag =
        e.type === "post" ? `📝 POST` :
        e.type === "comment" ? `   ↳ comment` :
        e.type === "ad" ? `📣 AD (platform noise)` :
        e.type === "meme" ? `😂 MEME (platform noise)` :
        e.type === "suggestion" ? `🔗 SUGGESTION (platform noise)` :
        e.type === "news" ? `📰 NEWS` : e.type.toUpperCase();
      const likes = e.likes ? `  ♥ ${e.likes}` : "";
      const vis = e.visibility !== "public" ? `  [${e.visibility}]` : "";
      console.log(`${tag} — ${e.author} (${e.source_kind})${vis}${likes}`);
      console.log(`     "${e.text}"`);
      if (e.hidden_truth) console.log(`     · ground truth (engine never sees): ${e.hidden_truth}`);
    }
  }

  // ---- summary ----
  const byType: Record<string, number> = {};
  for (const e of FEED) byType[e.type] = (byType[e.type] ?? 0) + 1;
  console.log(`\n=== SUMMARY ===`);
  console.log(`model calls (cost): ${calls}  |  feed events: ${FEED.length}`);
  console.log(`event types:`, byType);
  console.log(`(likes are a cheap rule — 0 model calls; ads/memes/suggestions/news are pooled — 0 model calls)`);

  // ---- dump JSON ----
  const outDir = resolve(ROOT, "runs");
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
  const outPath = resolve(outDir, "world-sim-prototype-output.json");
  writeFileSync(outPath, JSON.stringify({ listener: LISTENER, agents: AGENTS.map((a) => a.id), feed: FEED }, null, 2));
  console.log(`\nfull typed event stream written to: runs/world-sim-prototype-output.json`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
