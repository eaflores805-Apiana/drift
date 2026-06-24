/**
 * World-Sim v1 — the comprehensive simulated social world ("Layer 0 Living Source").
 * Proposal: docs/correspondence/cs-simulated-world-proposal-2026-06-22.md
 *
 * This is the instrument we lean on for the real-world test. Unlike the throwaway
 * prototype, it:
 *   - has a full cast (~14) whose IDs match listener_001.closeness_map,
 *   - runs a staggered, multi-day world (default 1 week of half-day ticks),
 *   - emits a TYPED EVENT STREAM (posts, comments, likes, shares + platform noise),
 *   - makes the LISTENER AN ACTOR — a listener-activity stream (revealed preference),
 *   - keeps ground truth in a SEPARATE answer key (the engine never sees it),
 *   - SNAPSHOTS a window into `IngestedItem[]` (schemas.ts Connection Point 1),
 *     i.e. a fixture that flows straight into consent → meaning → scoring → routing.
 *
 * Contamination wall (proposal §4): this world is for dev / test-bed / tuning / demo.
 * It is NOT the gold eval set and NOT the moat evidence. Generate on a CHEAP model
 * (Haiku) so the author model differs from the Sonnet judge.
 *
 * Run:        npx tsx scripts/world-sim.ts
 * Cheap dry:  WORLD_DRY=1 npx tsx scripts/world-sim.ts   (no API calls; templated text)
 * Knobs:      WORLD_DAYS=7  WORLD_MODEL=claude-haiku-4-5  WORLD_CONCURRENCY=4
 */

import Anthropic from "@anthropic-ai/sdk";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

// --- env -------------------------------------------------------------------
function loadDotenv(path: string): void {
  if (!existsSync(path)) return;
  for (const rawLine of readFileSync(path, "utf-8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq < 0) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
    if (!(key in process.env)) process.env[key] = val;
  }
}
loadDotenv(resolve(ROOT, ".env"));

const DRY = process.env.WORLD_DRY === "1";
const MODEL = process.env.WORLD_MODEL ?? "claude-haiku-4-5"; // cheap generator ≠ Sonnet judge
const DAYS = Number(process.env.WORLD_DAYS ?? 7);
const TICKS = DAYS * 2; // two half-day ticks per day
const CONCURRENCY = Number(process.env.WORLD_CONCURRENCY ?? 4);
const WORLD_START = new Date("2026-06-15T00:00:00"); // Mon; day6 = 2026-06-21 (Dana's birthday)

// E1 ablation: "baseline" = hidden-truth channel + natural disclosure (the locked config);
//              "persona"  = naive control, the truth handed openly in the persona, no channel separation.
const ARM = (process.env.WORLD_ARM ?? "baseline").toLowerCase();
const TAG = process.env.WORLD_TAG ?? (ARM === "persona" ? "persona" : "natural");
// Seeded RNG so both arms share IDENTICAL who-acts-when / noise / listener mechanics —
// the ONLY variable across arms is the prompt. (LLM stochasticity aside.)
const SEED = Number(process.env.WORLD_SEED ?? 1234);
function mulberry32(a: number): () => number {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rng = mulberry32(SEED);

let anthropic: Anthropic | null = null;
if (!DRY) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("No ANTHROPIC_API_KEY in playground/.env — set WORLD_DRY=1 to run without the API.");
    process.exit(1);
  }
  anthropic = new Anthropic({ apiKey });
}

// --- listener at the center (mirrors data/listener.json) -------------------
const LISTENER = {
  id: "listener_001",
  name: "Alex Rivera",
  location: "Ventura, CA",
  interests: ["indie pop", "surfing", "specialty coffee", "local food", "basketball", "product design", "hiking"],
  // closeness label per id (from listener.json closeness_map)
  closeness: {
    priya: "close", mark: "close", mateo: "close", dana: "close",
    jordan: "acquaintance", lena: "known", sam: "known", uncle_ray: "distant_family",
    buena_athletics: "followed", driftwood: "followed", patagonia: "followed",
    ventura_news: "followed", coastal_sounds: "followed", kelp_surf_co: "followed",
  } as Record<string, string>,
  calendar: [
    { title: "Dinner with Priya", when: "2026-06-19T19:00:00" }, // day4 — Priya may quietly cancel
    { title: "Dana's birthday", when: "2026-06-21T00:00:00" },   // day6
    { title: "Dentist", when: "2026-06-25T14:00:00" },
  ],
};

// numeric closeness for cheap rules (likes / listener engagement)
const CLOSE_W: Record<string, number> = {
  close: 0.92, acquaintance: 0.5, known: 0.4, distant_family: 0.45, followed: 0.3,
};

// --- the cast --------------------------------------------------------------
type SourceType = "friend" | "family" | "coworker" | "local_org" | "brand" | "news" | "creator";

type Arc = {
  name: string;
  startDay: number;
  // dayOffset (0-based from startDay) -> the PRIVATE truth of that day (ground truth)
  stages: Record<number, string>;
};

type Agent = {
  id: string;
  name: string;
  source_type: SourceType;
  bio: string;
  voice: string;
  interests: string[];
  disclosureStyle: string;
  postiness: number;          // base per-tick chance of doing something
  arc?: Arc;                  // people: a hidden life-arc
  schedule?: Record<number, string>; // orgs/brands: day -> deterministic post topic
};

const AGENTS: Agent[] = [
  // ---- signal-bearing people (staggered arcs) ----
  {
    id: "priya", name: "Priya", source_type: "friend",
    bio: "31, ER nurse in Ventura. Tuesday trivia with Alex. Dry, warm, very private about hard things.",
    voice: "understated, a little wry, rarely dramatic",
    interests: ["local food", "specialty coffee", "hiking"],
    disclosureStyle: "A fairly private person; when life gets heavy she tends to get quieter rather than louder, though it can slip out sideways.",
    postiness: 0.75,
    arc: {
      name: "her mother's health is declining", startDay: 1,
      stages: {
        0: "Mom has a doctor's appointment today Priya is privately worried about. Might be nothing.",
        1: "The tests came back not good. She found out this afternoon. Shaken; has told almost no one.",
        2: "Mom starts treatment next week. Priya is exhausted, holding it together, picking up extra shifts.",
        3: "Thursday is dinner-with-Alex night (Jun 19) but Priya can't face it — she quietly cancels or goes vague.",
        4: "A slightly steadier day. Still heavy underneath, but a small ordinary moment of relief.",
      },
    },
  },
  {
    id: "mark", name: "Mark", source_type: "friend",
    bio: "34, product manager, college friend of Alex. In DC this week for a make-or-break pitch.",
    voice: "energetic, self-deprecating, posts in the moment",
    interests: ["product design", "basketball", "indie pop"],
    disclosureStyle: "Open and upbeat. Posts the trip and nerves but spins stress as excitement.",
    postiness: 0.85,
    arc: {
      name: "a high-stakes work pitch in DC", startDay: 0,
      stages: {
        0: "Just landed in DC. Big pitch in two days. Nervous, hyping himself up.",
        1: "Pitch is tomorrow. Up late rehearsing, bad room-service, anxious.",
        2: "Pitch happened this morning — it went really well. Relief and elation.",
        3: "They hinted at a bigger role… that might mean relocating. Quietly unsettled under the win.",
        4: "Flying home. Processing the relocation question. Doesn't post the hard part.",
      },
    },
  },
  {
    id: "mateo", name: "Mateo", source_type: "friend",
    bio: "29, surfs the same break as Alex. Recently lost his older brother. Posts rarely.",
    voice: "spare, gentle, says very little",
    interests: ["surfing", "hiking"],
    disclosureStyle: "Grieving and not very online right now; when he does post it's usually just a photo or a few words.",
    postiness: 0.4,
    arc: {
      name: "early grief after losing his brother", startDay: 0,
      stages: {
        0: "First week back to routine after the funeral. Numb. Dawn surf alone.",
        2: "Would have been his brother's birthday. Mostly offline.",
        4: "A small okay moment — coffee with their mom, a flicker of lightness.",
      },
    },
  },
  {
    id: "lena", name: "Lena", source_type: "creator",
    bio: "27, makes ceramics + small-batch art, known to Alex through the local maker scene.",
    voice: "warm, earnest, a little vulnerable when promoting her work",
    interests: ["product design", "local food", "indie pop"],
    disclosureStyle: "Promotes her work but lets the nerves show. Mixes real life with the hustle.",
    postiness: 0.6,
    arc: {
      name: "first solo art show", startDay: 2,
      stages: {
        0: "Prepping for her first solo show this weekend. Excited and terrified, glazing late.",
        2: "Opening night tonight. Stomach in knots, hoping anyone shows up.",
        3: "Opening went well — sold a few pieces, overwhelmed and grateful.",
      },
    },
  },
  {
    id: "jordan", name: "Jordan", source_type: "friend",
    bio: "33, acquaintance of Alex from pickup basketball. Training for a half-marathon.",
    voice: "competitive, gym-bro-ish but likeable, lots of stats",
    interests: ["basketball", "hiking", "surfing"],
    disclosureStyle: "Posts workouts openly. Downplays setbacks — an injury shows up as a terse, off mood, not a complaint.",
    postiness: 0.55,
    arc: {
      name: "half-marathon training + a quiet injury", startDay: 1,
      stages: {
        0: "Great long run today. Feeling strong, posting the splits.",
        2: "Tweaked his knee. Frustrated but won't say it outright — vague, short, 'rest day' framing.",
        4: "Back to easy miles, being cautious, not fully himself yet.",
      },
    },
  },
  // ---- ambient life ----
  {
    id: "dana", name: "Dana", source_type: "family",
    bio: "Alex's younger sister, 28, two kids, lives nearby. Chatty, posts a LOT, mostly mundane.",
    voice: "casual, emoji-ish, high-volume, low-stakes",
    interests: ["local food", "specialty coffee"],
    disclosureStyle: "Very open about small stuff, over-shares the mundane. Her own birthday is Sunday (Jun 21).",
    postiness: 0.95,
    arc: {
      name: "ordinary busy-parent week into her own birthday", startDay: 0,
      stages: {
        0: "Chaotic kid morning. Normal week.",
        1: "Kid spilled juice on the laptop. Venting comedically.",
        4: "Half-excited, half 'ugh getting older' about her birthday Sunday.",
        6: "It's her birthday. Happy, a little sentimental.",
      },
    },
  },
  {
    id: "sam", name: "Sam", source_type: "coworker",
    bio: "Alex's coworker on the design team. Posts work-life, occasional design links.",
    voice: "mild, professional, dry humor",
    interests: ["product design", "specialty coffee"],
    disclosureStyle: "Keeps it light and professional. A midweek deadline crunch shows as tiredness, not drama.",
    postiness: 0.45,
    arc: {
      name: "a midweek work deadline", startDay: 2,
      stages: { 0: "Crunch day before a big design review. Heads-down, lots of coffee.", 1: "Review went fine. Relieved, low-key." },
    },
  },
  {
    id: "uncle_ray", name: "Uncle Ray", source_type: "family",
    bio: "Alex's uncle, 60s. Posts rarely — forwarded articles, fishing photos.",
    voice: "earnest boomer, a little corny",
    interests: ["hiking"],
    disclosureStyle: "Low frequency. Shares a forwarded link or a fishing photo. Nothing heavy.",
    postiness: 0.3,
    arc: { name: "a weekend fishing trip", startDay: 4, stages: { 0: "Planning a weekend fishing trip, excited.", 2: "Out on the water, big catch, proud." } },
  },
  // ---- orgs / brands / news (scheduled, deterministic — fixes brand under-posting) ----
  {
    id: "driftwood", name: "Driftwood Roasters", source_type: "brand",
    bio: "Local Ventura coffee roaster Alex follows.", voice: "friendly small-business marketing",
    interests: ["specialty coffee", "local food"], disclosureStyle: "Commercial: offers, new drinks, events.",
    postiness: 1, schedule: { 1: "teasing a new summer cold-brew dropping this week", 2: "summer cold-brew now available, promo code SUMMER", 5: "weekend live-music night at the shop" },
  },
  {
    id: "kelp_surf_co", name: "Kelp Surf Co.", source_type: "brand",
    bio: "Local surf shop Alex follows.", voice: "stoked, surf-casual marketing",
    interests: ["surfing"], disclosureStyle: "Commercial: gear sales, dawn-patrol meetups.",
    postiness: 1, schedule: { 1: "wetsuit clearance sale", 5: "Saturday dawn-patrol community meetup at the point" },
  },
  {
    id: "buena_athletics", name: "Buena High Athletics", source_type: "local_org",
    bio: "Local high school sports the listener follows.", voice: "civic, school-spirit",
    interests: ["basketball"], disclosureStyle: "Announcements: camps, game recaps.",
    postiness: 1, schedule: { 3: "summer youth basketball camp sign-ups open", 6: "weekend tournament recap, big win" },
  },
  {
    id: "patagonia", name: "Patagonia", source_type: "brand",
    bio: "National brand Alex follows.", voice: "values-forward brand marketing",
    interests: ["hiking", "surfing"], disclosureStyle: "Commercial + campaign mix.",
    postiness: 1, schedule: { 2: "summer gear sale", 4: "an environmental campaign / coastal cleanup call" },
  },
  {
    id: "ventura_news", name: "Ventura County News", source_type: "news",
    bio: "Local news outlet Alex follows.", voice: "neutral local-news headline style",
    interests: ["local food"], disclosureStyle: "Headlines: traffic, civic, weather.",
    postiness: 1, schedule: { 0: "lane closures on the 101 NB near Seaward through Friday", 3: "downtown farmers market expanding hours for summer", 5: "heat advisory for inland valleys this weekend" },
  },
  {
    id: "coastal_sounds", name: "Coastal Sounds", source_type: "local_org",
    bio: "Local live-music venue Alex follows.", voice: "tastemaker venue marketing",
    interests: ["indie pop"], disclosureStyle: "Show announcements.",
    postiness: 1, schedule: { 4: "this weekend's indie show lineup announcement" },
  },
];

// --- the typed event stream ------------------------------------------------
type EventType = "post" | "comment" | "like" | "share" | "ad" | "meme" | "suggestion" | "news" | "dm";
type Visibility = "public" | "friends" | "private";

type FeedEvent = {
  id: string;
  tick: number;
  type: EventType;
  author_id: string;     // agent id or "platform"
  author_name: string;
  source_type: string;
  visibility: Visibility;
  text: string;
  parent?: string;       // event id this replies to / shares
  likes: number;
  shares: number;
};

type ListenerAction = {
  tick: number;
  kind: "like" | "comment" | "profile_visit" | "share" | "dm" | "search";
  target_id: string;       // agent id Alex engaged with
  target_event?: string;
  text?: string;
};

let SEQ = 0;
const FEED: FeedEvent[] = [];
const LISTENER_ACTIVITY: ListenerAction[] = [];
const ANSWER_KEY: Record<string, { agent_id: string; arc?: string; private_truth?: string }> = {}; // eventId -> ground truth (engine NEVER sees)

function pushEvent(e: Omit<FeedEvent, "id" | "likes" | "shares">, truth?: { agent_id: string; arc?: string; private_truth?: string }): FeedEvent {
  const ev: FeedEvent = { id: `e${++SEQ}`, likes: 0, shares: 0, ...e };
  FEED.push(ev);
  if (truth) ANSWER_KEY[ev.id] = truth;
  return ev;
}

// --- time helpers ----------------------------------------------------------
function tickDate(tick: number): Date {
  const day = Math.floor(tick / 2);
  const hour = tick % 2 === 0 ? 9 : 18;
  const d = new Date(WORLD_START);
  d.setDate(d.getDate() + day);
  d.setHours(hour, 0, 0, 0);
  return d;
}
const dayOf = (tick: number) => Math.floor(tick / 2);

// --- active arc stage (staggered) ------------------------------------------
function activeTruth(agent: Agent, tick: number): string | undefined {
  if (!agent.arc) return undefined;
  const off = dayOf(tick) - agent.arc.startDay;
  if (off < 0) return undefined;
  // use the latest defined stage at or before this offset (stages persist)
  let chosen: string | undefined;
  for (const k of Object.keys(agent.arc.stages).map(Number).sort((a, b) => a - b)) {
    if (k <= off) chosen = agent.arc.stages[k];
  }
  return chosen;
}

// --- light entity tagging (helps later relevance) --------------------------
const ENTITY_VOCAB = ["Ventura", "101", "farmers market", "cold-brew", "coffee", "surf", "basketball", "art show", "fishing", "pitch", "DC", "marathon", "birthday"];
function tagEntities(text: string): { type: string; value: string }[] {
  const t = text.toLowerCase();
  return ENTITY_VOCAB.filter((v) => t.includes(v.toLowerCase())).map((v) => ({ type: "topic", value: v }));
}

// --- model call ------------------------------------------------------------
function stripFences(s: string): string {
  return s.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
}

async function llm(system: string, user: string, fallback: string): Promise<string> {
  if (DRY || !anthropic) return fallback;
  try {
    const resp = await anthropic.messages.create({ model: MODEL, max_tokens: 300, system, messages: [{ role: "user", content: user }] });
    return resp.content.map((b) => (b.type === "text" ? b.text : "")).join("");
  } catch (err) {
    console.error(`  ! model error: ${(err as Error).message}`);
    return fallback;
  }
}

let CALLS = 0;

// people: decide an action and write a typed event
async function personAct(agent: Agent, tick: number, perceived: FeedEvent[]): Promise<void> {
  const truth = activeTruth(agent, tick);
  const recent = perceived.slice(-6).map((e) => `- [${e.type}] ${e.author_name}: ${e.text}`).join("\n") || "(quiet so far)";
  const phase = tick % 2 === 0 ? "morning" : "evening";

  // ----- ARM B (persona-only control): the naive baseline. The situation is handed to the
  //       model OPENLY as part of who it is — no hidden channel, no answer-key sequestration,
  //       no engineered restraint. This is what a normal practitioner would write.
  // ----- ARM A (baseline, default): hidden-truth channel + natural disclosure (the locked config).
  let system: string, user: string;
  if (ARM === "persona") {
    system =
      `You are ${agent.name}: ${agent.bio} Voice: ${agent.voice}. ` +
      (truth ? `Your current life situation, which you feel and are open about: ${truth} ` : `Life is ordinary right now, nothing notable. `) +
      `Post on social media the way this person would today. You may post, comment on someone, or do nothing. Keep it short.`;
    user =
      `It is ${phase}, day ${dayOf(tick) + 1}.\n` +
      `\nRecent feed you've seen:\n${recent}\n\n` +
      `Decide ONE action. Respond with ONLY JSON, no prose, no fences:\n` +
      `{"action":"post"|"comment"|"skip","text":"<text or empty>","reply_to":"<author name or empty>"}`;
  } else {
    system =
      `You are role-playing a real person on a social network. You are ${agent.name}: ${agent.bio} ` +
      `Voice: ${agent.voice}. Tendency: ${agent.disclosureStyle} ` +
      `Behave like a REAL person — however THIS person actually would. Most posts are mundane. When life is heavy, real ` +
      `people vary: some go quiet, some post something small and adjacent, some say it straight out, some overshare. Post ` +
      `the way your persona would, not the way that's "appropriate" — don't perform restraint you wouldn't feel, and don't ` +
      `announce things this person would keep private. You may post, react with a short comment to someone, or do nothing. ` +
      `Keep it short and real.`;
    user =
      `It is ${phase}, day ${dayOf(tick) + 1}.\n` +
      (truth ? `PRIVATE truth only you know today: ${truth}\n` : `Nothing notable today; just ordinary life.\n`) +
      `\nRecent feed you've seen:\n${recent}\n\n` +
      `Decide ONE action. Respond with ONLY JSON, no prose, no fences:\n` +
      `{"action":"post"|"comment"|"skip","text":"<text or empty>","reply_to":"<author name or empty>"}`;
  }

  const fallback = truth
    ? `{"action":"post","text":"${phase} — ${agent.name.split(" ")[0].toLowerCase()} stuff.","reply_to":""}`
    : `{"action":"skip","text":"","reply_to":""}`;

  CALLS++;
  const raw = await llm(system, user, fallback);
  let parsed: { action: string; text?: string; reply_to?: string };
  try { parsed = JSON.parse(stripFences(raw)); }
  catch { parsed = { action: raw.trim() ? "post" : "skip", text: raw.trim() }; }
  if (parsed.action === "skip" || !parsed.text?.trim()) return;

  const vis: Visibility = "friends";
  const groundTruth = { agent_id: agent.id, arc: agent.arc?.name, private_truth: truth };
  if (parsed.action === "comment" && parsed.reply_to) {
    const parent = [...FEED].reverse().find((e) => e.author_name.toLowerCase() === parsed.reply_to!.toLowerCase());
    pushEvent({ tick, type: "comment", author_id: agent.id, author_name: agent.name, source_type: agent.source_type, visibility: vis, text: parsed.text.trim(), parent: parent?.id }, groundTruth);
  } else {
    pushEvent({ tick, type: "post", author_id: agent.id, author_name: agent.name, source_type: agent.source_type, visibility: vis, text: parsed.text.trim() }, groundTruth);
  }
}

// orgs/brands: deterministic scheduled post (still natural language)
async function orgPost(agent: Agent, tick: number, topic: string): Promise<void> {
  const system = `You write short social posts for ${agent.name}: ${agent.bio} Voice: ${agent.voice}. One or two sentences, realistic, on-brand.`;
  const user = `Write today's post about: ${topic}. Just the post text, no quotes.`;
  CALLS++;
  const fallback = `${topic}.`;
  const raw = (await llm(system, user, fallback)).trim().replace(/^"|"$/g, "");
  const type: EventType = agent.source_type === "news" ? "news" : "post";
  pushEvent({ tick, type, author_id: agent.id, author_name: agent.name, source_type: agent.source_type, visibility: "public", text: raw }, { agent_id: agent.id, arc: "scheduled", private_truth: topic });
}

// --- platform noise pool (no model calls) ----------------------------------
const PLATFORM_POOL: { tick: number; type: EventType; name: string; text: string }[] = [
  { tick: 1, type: "ad", name: "FreshFork Meal Kits", text: "🍳 Dinner solved. 60% off your first 3 boxes — code SUMMER60. Sponsored." },
  { tick: 1, type: "suggestion", name: "Platform", text: "People you may know: Greg Halloran, Maritime Coffee Co., 3 others →" },
  { tick: 3, type: "meme", name: "Coastal Memes", text: "[image] 'Me checking the surf report for the 9th time before work' 😂 14k shares" },
  { tick: 5, type: "ad", name: "ClariSkin", text: "Dermatologists hate this one trick. Tap to see what's in your serum. Sponsored." },
  { tick: 7, type: "meme", name: "Dog Rates Daily", text: "[image] '13/10 would let him drive the boat' 🐶 28k shares" },
  { tick: 8, type: "ad", name: "RapidLoan", text: "Need cash fast? Approved in minutes. Rates from 5.9% APR. Sponsored." },
  { tick: 9, type: "suggestion", name: "Platform", text: "Trending near you: #VenturaSummer — 2.1k posts →" },
  { tick: 11, type: "meme", name: "Relatable Co.", text: "[image] 'adulthood is just googling how to do things' 😩 41k shares" },
];

// --- cheap interaction rules (no model calls) ------------------------------
function applyInteractions(tick: number): void {
  const fresh = FEED.filter((e) => e.tick === tick && (e.type === "post" || e.type === "comment" || e.type === "news"));
  for (const post of fresh) {
    let likes = 0, shares = 0;
    for (const a of AGENTS) {
      if (a.id === post.author_id) continue;
      const w = CLOSE_W[LISTENER.closeness[a.id] ?? "followed"] ?? 0.3;
      if (rng() < w * 0.7) likes++;
      if (rng() < w * 0.08) shares++;
    }
    likes += Math.floor(rng() * (post.source_type === "brand" || post.source_type === "news" ? 30 : 6));
    post.likes = likes; post.shares = shares;
  }
}

// --- the listener as an actor (revealed preference; mostly 0-cost) ---------
function interestOverlap(agent: Agent | undefined): number {
  if (!agent) return 0;
  const set = new Set(LISTENER.interests);
  const hits = agent.interests.filter((i) => set.has(i)).length;
  return Math.min(1, hits / 2);
}

async function listenerAct(tick: number): Promise<void> {
  const visible = FEED.filter(
    (e) => e.tick === tick && e.author_id !== LISTENER.id && (e.visibility === "public" || e.visibility === "friends") && e.type !== "ad" && e.type !== "suggestion"
  );
  for (const e of visible) {
    const agent = AGENTS.find((a) => a.id === e.author_id);
    const closeW = CLOSE_W[LISTENER.closeness[e.author_id] ?? "followed"] ?? 0.2;
    const affinity = Math.min(1, closeW * 0.7 + interestOverlap(agent) * 0.5);

    // DIRECTED ACTION = revealed preference. Alex engages more with people Alex cares about.
    if (rng() < affinity * 0.8) LISTENER_ACTIVITY.push({ tick, kind: "like", target_id: e.author_id, target_event: e.id });
    if (rng() < affinity * 0.35) LISTENER_ACTIVITY.push({ tick, kind: "profile_visit", target_id: e.author_id });
    if (rng() < affinity * 0.12) LISTENER_ACTIVITY.push({ tick, kind: "share", target_id: e.author_id, target_event: e.id });

    // occasional real comment (the only LLM cost on the listener side) on a close person's post
    if (closeW > 0.8 && e.type === "post" && rng() < 0.18) {
      const system = `You are Alex Rivera, ${LISTENER.location}. Warm, brief, real. You're commenting on a friend's post.`;
      const user = `Your friend ${e.author_name} posted: "${e.text}"\nWrite a short, natural comment (one line). Just the text.`;
      CALLS++;
      const text = (await llm(system, user, "love this")).trim().replace(/^"|"$/g, "").slice(0, 120);
      LISTENER_ACTIVITY.push({ tick, kind: "comment", target_id: e.author_id, target_event: e.id, text });
      pushEvent({ tick, type: "comment", author_id: LISTENER.id, author_name: LISTENER.name, source_type: "self", visibility: "friends", text, parent: e.id });
    }
  }
  // a directed search now and then (looking someone up = strong revealed preference)
  if (tick % 4 === 0) {
    const close = AGENTS.filter((a) => (LISTENER.closeness[a.id] ?? "") === "close");
    const who = close[Math.floor(rng() * close.length)];
    if (who) LISTENER_ACTIVITY.push({ tick, kind: "search", target_id: who.id, text: who.name });
  }
}

// --- concurrency helper ----------------------------------------------------
async function pool<T>(items: T[], n: number, fn: (t: T) => Promise<void>): Promise<void> {
  const q = [...items];
  const workers = Array.from({ length: Math.max(1, n) }, async () => {
    while (q.length) { const it = q.shift()!; await fn(it); }
  });
  await Promise.all(workers);
}

// --- snapshot: a window -> IngestedItem[] (schemas.ts Connection Point 1) --
function snapshot(endTick: number, windowTicks: number): any[] {
  const startTick = Math.max(0, endTick - windowTicks + 1);
  const items = FEED.filter(
    (e) => e.tick >= startTick && e.tick <= endTick && e.author_id !== LISTENER.id &&
      (e.visibility === "public" || e.visibility === "friends") &&
      (e.type === "post" || e.type === "comment" || e.type === "news" || e.type === "ad" || e.type === "meme" || e.type === "suggestion")
  );
  return items.map((e) => {
    const ts = tickDate(e.tick).toISOString();
    const audience = e.source_type === "brand" || e.source_type === "news" || e.source_type === "local_org" ? "public" : e.visibility;
    // platform noise carries the source_type the consent/commercial gates expect
    const source_type =
      e.type === "ad" ? "brand" : e.type === "meme" || e.type === "suggestion" ? "creator" :
      ["friend", "family", "coworker", "local_org", "brand", "news", "creator"].includes(e.source_type) ? e.source_type : "creator";
    return {
      id: e.id,
      source_type,
      source_name: e.author_name,
      account_id: e.author_id,
      audience_scope: audience,
      timestamp: ts,
      expires_at: null,
      raw_text: e.text,
      entities: tagEntities(e.text),
      location: e.source_type === "brand" || e.source_type === "news" || e.source_type === "local_org" ? "Ventura, CA" : null,
      novelty_key: `${e.author_id}:${e.text.toLowerCase().split(/\s+/).slice(0, 6).join("-").replace(/[^a-z0-9-]/g, "")}`,
    };
  });
}

// --- run -------------------------------------------------------------------
async function main(): Promise<void> {
  console.log(`\n=== WORLD-SIM v1 — ${AGENTS.length} agents × ${TICKS} ticks (${DAYS} days) — model ${DRY ? "DRY (no API)" : MODEL} ===`);
  console.log(`Listener-actor at center: ${LISTENER.name} (${LISTENER.location})`);
  console.log(`World start ${WORLD_START.toDateString()} → day7 = ${tickDate(13).toDateString()}\n`);

  for (let tick = 0; tick < TICKS; tick++) {
    const day = dayOf(tick);
    // 1) platform noise
    for (const p of PLATFORM_POOL.filter((x) => x.tick === tick)) {
      pushEvent({ tick, type: p.type, author_id: "platform", author_name: p.name, source_type: "platform", visibility: "public", text: p.text });
    }
    // 2) orgs/brands fire their schedule (deterministic) once per day, on the morning tick
    if (tick % 2 === 0) {
      const orgs = AGENTS.filter((a) => a.schedule && a.schedule[day] !== undefined);
      await pool(orgs, CONCURRENCY, (a) => orgPost(a, tick, a.schedule![day]));
    }
    // 3) people act (perceive a frozen view of the feed-so-far, then act concurrently)
    const perceived = [...FEED];
    const people = AGENTS.filter((a) => !a.schedule).filter((a) => {
      const boost = activeTruth(a, tick) ? 0.15 : 0; // arc-active days slightly more likely to post
      return rng() < Math.min(1, a.postiness + boost);
    });
    await pool(people, CONCURRENCY, (a) => personAct(a, tick, perceived));
    // 4) cheap interactions + 5) the listener acts
    applyInteractions(tick);
    await listenerAct(tick);
    process.stdout.write(`  · tick ${tick + 1}/${TICKS} (day ${day + 1} ${tick % 2 === 0 ? "AM" : "PM"}) — feed ${FEED.length}, calls ${CALLS}\r`);
  }
  console.log("\n");

  // ---- console readout (by day) ----
  for (let day = 0; day < DAYS; day++) {
    console.log(`\n──────────── DAY ${day + 1} (${tickDate(day * 2).toDateString()}) ────────────`);
    for (const e of FEED.filter((x) => dayOf(x.tick) === day && x.author_id !== LISTENER.id)) {
      const tag = { post: "📝 POST", comment: "   ↳ comment", news: "📰 NEWS", ad: "📣 AD (noise)", meme: "😂 MEME (noise)", suggestion: "🔗 SUGGESTION (noise)", like: "♥", share: "↗ share", dm: "✉ DM" }[e.type] ?? e.type;
      const meta = `${e.likes ? `  ♥${e.likes}` : ""}${e.shares ? `  ↗${e.shares}` : ""}${e.visibility !== "public" ? `  [${e.visibility}]` : ""}`;
      console.log(`${tag} — ${e.author_name} (${e.source_type})${meta}`);
      console.log(`     "${e.text}"`);
      const gt = ANSWER_KEY[e.id];
      if (gt?.private_truth && gt.arc !== "scheduled") console.log(`     · ground truth (engine never sees): ${gt.private_truth}`);
    }
    const acts = LISTENER_ACTIVITY.filter((a) => dayOf(a.tick) === day);
    if (acts.length) {
      const by: Record<string, number> = {};
      for (const a of acts) by[`${a.kind}→${a.target_id}`] = (by[`${a.kind}→${a.target_id}`] ?? 0) + 1;
      console.log(`   👤 Alex (revealed preference): ${Object.entries(by).map(([k, v]) => `${k}${v > 1 ? `×${v}` : ""}`).join(", ")}`);
    }
  }

  // ---- summary ----
  const byType: Record<string, number> = {};
  for (const e of FEED) byType[e.type] = (byType[e.type] ?? 0) + 1;
  const actByKind: Record<string, number> = {};
  for (const a of LISTENER_ACTIVITY) actByKind[a.kind] = (actByKind[a.kind] ?? 0) + 1;
  console.log(`\n=== SUMMARY ===`);
  console.log(`model calls: ${CALLS}  |  feed events: ${FEED.length}  |  listener actions: ${LISTENER_ACTIVITY.length}`);
  console.log(`event types:`, byType);
  console.log(`listener activity:`, actByKind);

  // ---- revealed-preference ranking (who is in Alex's world THIS week, by behavior) ----
  const score: Record<string, number> = {};
  const W = { like: 1, comment: 4, profile_visit: 3, share: 3, search: 5, dm: 4 } as Record<string, number>;
  for (const a of LISTENER_ACTIVITY) score[a.target_id] = (score[a.target_id] ?? 0) + (W[a.kind] ?? 1);
  const ranked = Object.entries(score).sort((a, b) => b[1] - a[1]);
  console.log(`\n=== REVEALED PREFERENCE — who Alex actually engaged with (behavior, not profile) ===`);
  for (const [id, s] of ranked) {
    const label = LISTENER.closeness[id] ?? "?";
    console.log(`  ${String(s).padStart(3)}  ${id} (${label})`);
  }
  console.log(`  (compare to the STATIC profile labels in parens — behavior is the stronger relevance signal, proposal §6)`);

  // ---- write outputs ----
  const outDir = resolve(ROOT, "runs"); if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
  const sfx = `-${TAG}`; // e.g. -natural / -persona — keeps E1 arms from clobbering
  const cleanFeed = FEED.map(({ ...e }) => e); // no hidden truth on the feed itself
  writeFileSync(resolve(outDir, `world-sim-world${sfx}.json`), JSON.stringify({
    config: { arm: ARM, seed: SEED, days: DAYS, ticks: TICKS, model: DRY ? "dry" : MODEL, world_start: WORLD_START.toISOString() },
    listener: LISTENER, agents: AGENTS.map(({ arc, schedule, ...a }) => a),
    feed: cleanFeed, listener_activity: LISTENER_ACTIVITY, revealed_preference: ranked,
  }, null, 2));
  writeFileSync(resolve(outDir, `world-sim-answer-key${sfx}.json`), JSON.stringify(ANSWER_KEY, null, 2));

  // ground-truth timeline for the E1 scorer: per arc-carrying agent, the active private truths
  // AND everything they emitted (empty = they stayed silent). This is answer-key family — never the feed.
  const truths = AGENTS.filter((a) => a.arc).map((a) => ({
    agent_id: a.id, name: a.name, arc: a.arc!.name, closeness: LISTENER.closeness[a.id] ?? "?",
    truths_active: Array.from({ length: TICKS }, (_, t) => ({ tick: t, truth: activeTruth(a, t) })).filter((x) => x.truth),
    emitted: FEED.filter((e) => e.author_id === a.id).map((e) => ({ tick: e.tick, type: e.type, text: e.text })),
  }));
  writeFileSync(resolve(outDir, `world-sim-truths${sfx}.json`), JSON.stringify(truths, null, 2));

  // a snapshot Drift can actually score: a 2-day window ending mid-week (day 4 PM = Priya's dinner night)
  const snapEnd = Math.min(TICKS - 1, 9); // tick 9 = day5 PM-ish; window back 2 days
  const fixture = snapshot(snapEnd, 4);
  writeFileSync(resolve(outDir, `world-sim-snapshot${sfx}.json`), JSON.stringify(fixture, null, 2));

  console.log(`\n[arm=${ARM} seed=${SEED}] wrote:`);
  console.log(`  runs/world-sim-world${sfx}.json      (full timeline + listener activity + revealed-preference ranking)`);
  console.log(`  runs/world-sim-answer-key${sfx}.json (ground truth — the engine must NEVER read this)`);
  console.log(`  runs/world-sim-snapshot${sfx}.json   (${fixture.length} IngestedItem[] — a frozen window, ready for consent→meaning→scoring)`);
}

main().catch((e) => { console.error(e); process.exit(1); });
