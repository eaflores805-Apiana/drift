/**
 * post-writer.ts — turn the "town bible" into a feed (lives → posts).
 *
 * Reads the cast (public personas) + hidden arcs (sealed truth) and generates a
 * week of posts. The governing idea (per the world-model spec): posts are
 * EVIDENCE OF PEOPLE LIVING, not content written for the DJ. The test for every
 * post: "would this exist if Drift never existed?"
 *
 * FIREWALL (non-negotiable):
 *  - The model writing person X's post sees ONLY X's own hidden state — never
 *    anyone else's secret.
 *  - The public feed (what Drift sees) carries NO hidden truth.
 *  - The answer key (post → hidden state it came from) is written under runs/,
 *    which is git-ignored, and is verified to never echo hidden text verbatim.
 *
 * Generator = Haiku (cheap), deliberately ≠ the Sonnet judge.
 * Producer change ⇒ re-baseline: any prompt change here invalidates prior numbers.
 *
 * Run:  cd playground && WORLD_DRY=1 npx tsx scripts/post-writer.ts   # no API
 *       cd playground && npx tsx scripts/post-writer.ts               # live
 */
import Anthropic from "@anthropic-ai/sdk";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

// --- env (same loader as world-sim.ts) ------------------------------------
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
const TAG = process.env.WORLD_TAG ?? "ventura-v1";
const DAYS = Number(process.env.WORLD_DAYS ?? 7);
const SEED = Number(process.env.WORLD_SEED ?? 1234);
const WORLD_START = new Date("2026-06-15T00:00:00"); // Mon (matches world-sim.ts convention)

// Seeded RNG — controls who-posts-when + post-shape, so runs are reproducible.
// (LLM token sampling is still stochastic; that's the only non-determinism.)
function mulberry32(a: number): () => number {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rng = mulberry32(SEED);
const pick = <T>(xs: T[]): T => xs[Math.floor(rng() * xs.length)];

let anthropic: Anthropic | null = null;
if (!DRY) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("No ANTHROPIC_API_KEY in playground/.env — set WORLD_DRY=1 to run without the API.");
    process.exit(1);
  }
  anthropic = new Anthropic({ apiKey });
}

// --- types -----------------------------------------------------------------
interface Account {
  id: string;
  display_name: string;
  account_type: string;
  bio: string;
  voice: string;
  interests?: string[];
  location?: string;
  relationship_to_listener?: { closeness: string; how: string };
  posting_style: { frequency: string; disclosure_style: string; typical_surfaces: string[] };
}
interface Cast {
  world_tag: string;
  anchored_to: string;
  local_world: string;
  accounts: Account[];
  relationships: { from: string; to: string; type: string; visible_publicly: boolean }[];
  groups: { id: string; name: string; kind: string; members: string[] }[];
}
interface ArcStage { day: number; hidden_state: string; how_it_shows: string }
interface Arc { person_id: string; life_arc: string; stages: ArcStage[] }
interface Hidden { world_tag: string; arcs: Arc[] }

interface FeedPost {
  id: string;
  author_id: string;
  author_name: string;
  account_type: string;
  day: number;
  date: string;
  surface: string;
  text: string;
  reply_to: string | null;
}
interface KeyEntry {
  post_id: string;
  author_id: string;
  day: number;
  surface: string;
  driven_by: string | null;   // the hidden_state that produced it, or null (ordinary)
  life_arc: string | null;
  klass: "signal" | "texture";
}

// --- load the world --------------------------------------------------------
const cast: Cast = JSON.parse(readFileSync(resolve(ROOT, "world-bible/cast.public.json"), "utf-8"));
const hidden: Hidden = JSON.parse(readFileSync(resolve(ROOT, "runs/world-bible/hidden-arcs.json"), "utf-8"));
const listener = JSON.parse(readFileSync(resolve(ROOT, "data/listener.json"), "utf-8"));
interface PublicEvent { person_id: string; day: number; event: string }
const publicEventsPath = resolve(ROOT, "world-bible/public-events.json");
const publicEvents: PublicEvent[] = existsSync(publicEventsPath)
  ? (JSON.parse(readFileSync(publicEventsPath, "utf-8")).events ?? [])
  : [];
const LISTENER_NAME: string = listener.name ?? "Alex Rivera";
const LISTENER_FIRST = LISTENER_NAME.split(" ")[0];

const byId = new Map(cast.accounts.map((a) => [a.id, a]));
const arcOf = new Map(hidden.arcs.map((a) => [a.person_id, a]));
const people = cast.accounts.filter((a) => a.account_type === "person");
const orgs = cast.accounts.filter((a) => a.account_type !== "person");

// names this person can plausibly mention (relationships + shared groups + listener)
function mentionable(id: string): string[] {
  const ids = new Set<string>();
  for (const r of cast.relationships) {
    if (r.from === id) ids.add(r.to);
    if (r.to === id) ids.add(r.from);
  }
  for (const g of cast.groups) if (g.members.includes(id)) for (const m of g.members) if (m !== id) ids.add(m);
  const names = [...ids].map((x) => (x === "alex" || x === listener.id ? LISTENER_FIRST : byId.get(x)?.display_name)).filter(Boolean) as string[];
  return [...new Set(names)];
}

function hiddenForDay(id: string, day: number): ArcStage | null {
  const arc = arcOf.get(id);
  if (!arc) return null;
  // the most recent stage on or before `day` (a state persists until the next stage)
  const elig = arc.stages.filter((s) => s.day <= day).sort((a, b) => b.day - a.day);
  return elig[0] ?? null;
}

function publicEventForDay(id: string, day: number): PublicEvent | null {
  return publicEvents.find((e) => e.person_id === id && e.day === day) ?? null;
}

function dateForDay(day: number, phase: "morning" | "evening"): string {
  const d = new Date(WORLD_START);
  d.setDate(d.getDate() + (day - 1));
  d.setHours(phase === "morning" ? 8 : 19, Math.floor(rng() * 50), 0, 0);
  return d.toISOString();
}

const POST_PROB: Record<string, number> = { high: 0.85, medium: 0.5, low: 0.28, rare: 0.12 };
const SHAPES = [
  "a quick check-in about your day",
  "a photo with a short caption",
  "a small gripe or complaint",
  "a plain observation about something around you",
  "a reply or comment to a recent post you saw",
  "sharing/plugging something (an event, a spot, a find)",
  "asking the group or friends a question",
];

// --- the writer ------------------------------------------------------------
let CALLS = 0;

async function llm(system: string, user: string, fallback: string): Promise<string> {
  if (DRY || !anthropic) return fallback;
  CALLS++;
  try {
    const resp = await anthropic.messages.create({
      model: MODEL, max_tokens: 400, temperature: 1, system,
      messages: [{ role: "user", content: user }],
    });
    return resp.content.map((b) => (b.type === "text" ? b.text : "")).join("");
  } catch (err) {
    console.error(`  ! model error: ${(err as Error).message}`);
    return fallback;
  }
}

function parseAction(raw: string): { action: string; surface: string; text: string; reply_to: string | null } {
  try {
    const m = raw.match(/\{[\s\S]*\}/);
    if (m) {
      const o = JSON.parse(m[0]);
      return {
        action: String(o.action ?? "skip"),
        surface: String(o.surface ?? "feed"),
        text: String(o.text ?? "").trim(),
        reply_to: o.reply_to && o.reply_to !== "null" ? String(o.reply_to) : null,
      };
    }
  } catch { /* fall through */ }
  return { action: "skip", surface: "feed", text: "", reply_to: null };
}

const SYSTEM = `You are role-playing a REAL person posting on a social feed. You are not writing for an audience, a brand, or a radio show — you post the way THIS specific person would, because something happened, or just out of habit.
Rules of realism:
- Most posts are short and mundane. Many moments you would post nothing at all.
- Write in this person's actual voice, and KEEP that voice even on a hard day. Lowercase, typos, fragments, dry humor — whatever fits them. Do NOT get more reflective, earnest, or "writerly" than they normally are.
- NEVER sound inspirational, motivational, or like an advertisement. No "blessed", no "life is a journey", no "grateful", no "means everything".
- If something private is going on, you do NOT gesture at it. BANNED: "thinking about some stuff", "processing", "some changes", "big things coming", "a lot on my mind", "trying not to spiral". Hinting at a secret is itself a tell. Real people either post about something totally ordinary, or post nothing — they don't drop vague hints.
- It's fine to name specific people, places, or things you'd really mention.
- Don't default to coffee or the cafe as your subject. Once in a while is fine, but a real town isn't all coffee — reach for the specific texture of THIS person's actual interests and day.
Output ONLY a JSON object, nothing else.`;

async function writePost(p: Account, day: number, phase: "morning" | "evening", recent: FeedPost[], surfacePublic: boolean): Promise<{ post: FeedPost; key: KeyEntry } | null> {
  const stage = hiddenForDay(p.id, day);
  // surface a public event AT MOST ONCE (the caller gates this) — otherwise a person
  // re-announces the same good news every phase they post that day (a synthetic tell).
  const pubEvent = surfacePublic ? publicEventForDay(p.id, day) : null;
  const shape = pick(SHAPES);
  const names = mentionable(p.id);
  const recentTxt = recent.slice(-5).map((e) => `  - ${e.author_name} (${e.surface}, post ${e.id}): ${e.text}`).join("\n") || "  (the feed is quiet)";

  const privateBlock = stage
    ? `WHAT'S GOING ON FOR YOU (PRIVATE context — only you know the full picture):\n  ${stage.hidden_state}\n  How to handle it: if this is genuinely something you'd announce in public (a real event, plain good or bad news you'd actually share), you may post it — but flatly, in your OWN normal voice, never earnest or writerly. If it's private or heavy, you do NOT post about it and you do NOT hint at it: post about something totally ordinary, or post nothing. Never gesture at a secret.`
    : `WHAT'S GOING ON FOR YOU: an ordinary day, nothing notable.`;

  const publicBlock = pubEvent
    ? `GOOD NEWS TODAY (genuinely public — you'd actually share this; it is NOT a secret): ${pubEvent.event}\n  Share it plainly in your own voice. Don't inflate it, don't make it inspirational — just say the real thing the way you'd say it.`
    : "";

  const user = `WHO YOU ARE:
  ${p.display_name} — ${p.bio}
  Voice: ${p.voice}
  You tend to: ${p.posting_style.disclosure_style}. Interests: ${(p.interests ?? []).join(", ")}.

YOUR WORLD:
  ${cast.local_world}
  People you might naturally mention: ${names.join(", ") || "(no one in particular)"}
  It is ${phase} on day ${day} of the week.

WHAT YOU'VE SEEN ON THE FEED RECENTLY:
${recentTxt}

${privateBlock}
${publicBlock}

If you post, aim loosely for: ${shape}.

Decide whether you'd actually post right now. If you wouldn't, skip — silence is realistic.
Reply with ONLY this JSON:
{"action":"post"|"skip","surface":"feed"|"story"|"comment","text":"the post in your own voice, or empty if skip","reply_to":"a post id you're replying to, or null"}`;

  const fallback = `{"action":"${rng() < 0.5 ? "post" : "skip"}","surface":"feed","text":"[dry-run ${p.id} d${day}]","reply_to":null}`;
  const a = parseAction(await llm(SYSTEM, user, fallback));
  if (a.action !== "post" || !a.text) return null;

  const id = `${p.id}-d${day}-${phase[0]}`;
  const post: FeedPost = {
    id, author_id: p.id, author_name: p.display_name, account_type: p.account_type,
    day, date: dateForDay(day, phase), surface: a.surface, text: a.text,
    reply_to: a.reply_to && recent.some((r) => r.id === a.reply_to) ? a.reply_to : null,
  };
  const key: KeyEntry = {
    post_id: id, author_id: p.id, day, surface: a.surface,
    driven_by: pubEvent ? `[public] ${pubEvent.event}` : (stage ? stage.hidden_state : null),
    life_arc: stage ? (arcOf.get(p.id)?.life_arc ?? null) : null,
    klass: (pubEvent || stage) ? "signal" : "texture",
  };
  return { post, key };
}

async function writeOrgPost(o: Account, day: number, ownRecent: string[], probDamp: number): Promise<FeedPost | null> {
  if (rng() > (POST_PROB[o.posting_style.frequency] ?? 0.4) * probDamp) return null;
  const recentTxt = ownRecent.slice(-3).map((t) => `  - ${t}`).join("\n") || "  (none yet)";
  const user = `You run the account "${o.display_name}" (${o.account_type}) in Ventura, CA. ${o.bio}
Voice: ${o.voice}. Write ONE short, on-brand post for today — a special, an event, an update, or a drop. One or two sentences. Realistic, not salesy hype.
YOUR RECENT POSTS (do NOT reuse their shape or phrasing — vary the angle; never repeat a tasting-note formula like "wild [fruit] thing going on" or sign-offs like "grab a bag before we run out" / "hitting different"):
${recentTxt}
Output ONLY: {"text":"..."}`;
  const fb = `{"text":"[dry-run ${o.id} d${day}]"}`;
  const raw = await llm("You write short, realistic posts for local businesses and orgs. No hashtag spam, no fake enthusiasm.", user, fb);
  let text = "";
  try { text = String(JSON.parse(raw.match(/\{[\s\S]*\}/)?.[0] ?? "{}").text ?? "").trim(); } catch { /* */ }
  if (!text) return null;
  return {
    id: `${o.id}-d${day}`, author_id: o.id, author_name: o.display_name, account_type: o.account_type,
    day, date: dateForDay(day, "morning"), surface: "feed", text, reply_to: null,
  };
}

// --- main ------------------------------------------------------------------
async function main(): Promise<void> {
  console.log(`[post-writer] tag=${TAG} model=${DRY ? "DRY" : MODEL} days=${DAYS} seed=${SEED}`);
  const feed: FeedPost[] = [];
  const key: KeyEntry[] = [];
  const publicSurfaced = new Set<string>(); // `${person}:${day}` once a public event has been posted

  for (let day = 1; day <= DAYS; day++) {
    for (const phase of ["morning", "evening"] as const) {
      // people act, in a seeded order, each gated by how often they post
      const order = [...people].sort(() => rng() - 0.5);
      for (const p of order) {
        const stage = hiddenForDay(p.id, day);
        const pe = publicEventForDay(p.id, day);
        // arc days are NOT nudged up — over-posting on a hard day produced reflective/writerly
        // posts (the v1 weak spot). Let silence happen; signal should be a minority of the feed.
        let prob = (POST_PROB[p.posting_style.frequency] ?? 0.4) * (phase === "evening" ? 0.7 : 1);
        // a genuine public "today this happened" moment should reliably appear ONCE (morning),
        // never re-announced in a later phase the same day.
        const pubKey = `${p.id}:${day}`;
        const surfacePublic = !!pe && phase === "morning" && !publicSurfaced.has(pubKey);
        if (surfacePublic) prob = Math.max(prob, 0.92);
        if (rng() > prob) continue;
        const r = await writePost(p, day, phase, feed, surfacePublic);
        if (r) { feed.push(r.post); key.push(r.key); if (surfacePublic) publicSurfaced.add(pubKey); process.stdout.write("."); }
      }
    }
    // an org or two posts each day — capped per category so one category can't flood the day
    const ORG_CATEGORY: Record<string, string> = {
      driftwood: "coffee", mesa_roasters: "coffee", pacific_cafe: "coffee",
      patagonia: "apparel", kelp_surf_co: "surf", coastal_sounds: "music",
      buena_athletics: "sports", ventura_news: "news",
    };
    const CATEGORY_DAILY_CAP: Record<string, number> = { coffee: 1 };   // <=1 coffee/roaster post per day
    const CATEGORY_PROB_DAMP: Record<string, number> = { coffee: 0.5 }; // coffee orgs post less often
    const catCountToday: Record<string, number> = {};
    for (const o of [...orgs].sort(() => rng() - 0.5)) {
      const cat = ORG_CATEGORY[o.id] ?? "other";
      if ((catCountToday[cat] ?? 0) >= (CATEGORY_DAILY_CAP[cat] ?? 99)) continue;
      const ownRecent = feed.filter((f) => f.author_id === o.id).map((f) => f.text);
      const op = await writeOrgPost(o, day, ownRecent, CATEGORY_PROB_DAMP[cat] ?? 1);
      if (op) {
        feed.push(op);
        key.push({ post_id: op.id, author_id: o.id, day, surface: "feed", driven_by: null, life_arc: null, klass: "texture" });
        catCountToday[cat] = (catCountToday[cat] ?? 0) + 1;
        process.stdout.write("o");
      }
    }
  }
  console.log(`\n[post-writer] generated ${feed.length} posts in ${CALLS} model calls`);

  // ---- firewall self-check: no hidden_state text may appear in the public feed ----
  const leaks: string[] = [];
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
  for (const a of hidden.arcs) for (const s of a.stages) {
    const hs = norm(s.hidden_state);
    // flag if a long (>=6-word) window of the hidden state shows up in any post
    const win = hs.split(" ").slice(0, 8).join(" ");
    if (win.split(" ").length >= 6) for (const post of feed) if (norm(post.text).includes(win)) leaks.push(`${post.id} echoes hidden: "${win}"`);
  }
  const firewall = leaks.length === 0 ? "PASS" : "FAIL";

  // ---- quality scorecard (auto checks; honest about what it does NOT cover) ----
  const posts = feed.filter((f) => f.account_type === "person");
  const texts = posts.map((p) => p.text);
  const wordsOf = (t: string) => norm(t).split(" ").filter(Boolean);

  // 1) specificity: % with >=1 concrete token (number, @mention, or a known name)
  const knownNames = new Set([LISTENER_FIRST.toLowerCase(), ...cast.accounts.flatMap((a) => a.display_name.toLowerCase().split(" "))]);
  const hasConcrete = (t: string) => /\d/.test(t) || /@\w+/.test(t) || wordsOf(t).some((w) => knownNames.has(w));
  const specific = texts.filter(hasConcrete).length;

  // 2) variety: length stdev + duplicate rate + type-token ratio
  const lens = texts.map((t) => t.length);
  const mean = lens.reduce((a, b) => a + b, 0) / (lens.length || 1);
  const stdev = Math.sqrt(lens.reduce((a, b) => a + (b - mean) ** 2, 0) / (lens.length || 1));
  const dupes = texts.length - new Set(texts.map(norm)).size;
  const allWords = texts.flatMap(wordsOf);
  const ttr = new Set(allWords).size / (allWords.length || 1);

  // 3) mundanity: signal (arc-driven) should be the MINORITY of the feed
  const sig = key.filter((k) => k.klass === "signal").length;
  const sigPct = sig / (key.length || 1);

  // 4) cliché filter
  const CLICHES = ["blessed", "life is a journey", "every sunrise", "grateful for", "living my best life", "good vibes only", "chase your dreams", "rise and grind", "sending love", "journey of", "means everything", "means the world", "trying not to spiral"];
  const cliche = texts.filter((t) => CLICHES.some((c) => t.toLowerCase().includes(c)));

  const pct = (n: number, d: number) => `${((n / (d || 1)) * 100).toFixed(0)}%`;
  const card = {
    tag: TAG, generated_at: new Date().toISOString(), model: DRY ? "DRY" : MODEL, seed: SEED,
    totals: { posts_total: feed.length, person_posts: posts.length, org_posts: feed.length - posts.length, model_calls: CALLS },
    firewall_check: { result: firewall, leaks },
    checks: {
      specificity:  { measured: pct(specific, posts.length), formula: "person posts with >=1 number/@mention/known-name ÷ person posts", target: ">=70%", value: `${specific}/${posts.length}` },
      variety:      { length_stdev_chars: +stdev.toFixed(1), duplicate_posts: dupes, type_token_ratio: +ttr.toFixed(3), note: "low stdev + low TTR + dupes>0 ⇒ mode collapse" },
      mundanity:    { measured: pct(sig, key.length), formula: "arc-driven (signal) posts ÷ all posts", target: "<35% (a real feed is mostly texture)", value: `${sig}/${key.length}` },
      cliche:       { count: cliche.length, target: "0", offenders: cliche.slice(0, 5) },
      voice_consistency: "NOT auto-scored — goes to the blind read + Grok second-opinion (a model judging a model is circular; see data-and-classification-findings #4)",
    },
  };

  // ---- write outputs (ALL under runs/, git-ignored, firewall-safe) ----
  const outDir = resolve(ROOT, "runs/post-writer");
  mkdirSync(outDir, { recursive: true });
  writeFileSync(resolve(outDir, `feed-${TAG}.json`), JSON.stringify({ world_tag: TAG, listener: listener.id, generated_by: "post-writer", model: DRY ? "DRY" : MODEL, seed: SEED, posts: feed }, null, 2));
  writeFileSync(resolve(outDir, `answer-key-${TAG}.json`), JSON.stringify({ _FIREWALL: "NEVER commit / never show Drift. Maps each post to the hidden state that produced it.", world_tag: TAG, key }, null, 2));
  writeFileSync(resolve(outDir, `scorecard-${TAG}.json`), JSON.stringify(card, null, 2));

  console.log(`\n=== quality scorecard (${TAG}) ===`);
  console.log(`firewall: ${firewall}${leaks.length ? " — " + leaks.length + " leak(s)!" : ""}`);
  console.log(`specificity:   ${card.checks.specificity.measured}  (target ${card.checks.specificity.target})  [${card.checks.specificity.value}]`);
  console.log(`variety:       stdev=${card.checks.variety.length_stdev_chars}  dupes=${dupes}  TTR=${card.checks.variety.type_token_ratio}`);
  console.log(`mundanity:     ${card.checks.mundanity.measured} signal  (target ${card.checks.mundanity.target})  [${card.checks.mundanity.value}]`);
  console.log(`cliché hits:   ${cliche.length}  (target 0)${cliche.length ? " — " + cliche.slice(0, 3).join(" | ") : ""}`);
  console.log(`voice:         deferred to blind read + Grok`);
  console.log(`\nwrote: runs/post-writer/{feed,answer-key,scorecard}-${TAG}.json`);
  if (firewall === "FAIL") { console.error("\nFIREWALL FAILED — do not use this feed."); process.exit(2); }
}

main().catch((e) => { console.error(e); process.exit(1); });
