/**
 * Persona-Center Pressure Test — 100 items × A/B (Eng1 + TL task, 2026-06-21).
 *
 * 100 real-world posts spanning commercial / utility / civic / everyday /
 * celebration / ambiguous / sensitive / somber. Each run through Prompt A
 * (lean grave rule: "be brave and speak its truth") AND Prompt B
 * (two-edged rule: "say the real thing, then stop"). Same variants
 * decided on the pass-two A/B (commit 563486d); this scales the test
 * up to 100 items.
 *
 * Spec discipline (per task brief):
 *   - The model sees ONLY the post + who posted it + its job. No
 *     hidden-key fields (no "what's actually stated," no "trap," no
 *     "expected"). The wrapper explicitly allows "stay quiet" as a
 *     valid response.
 *   - Variants share the base center; differ only in the appended rule.
 *   - 200 total calls. claude-sonnet-4-6, fresh instance per call.
 *
 * Triple-gated (same as prior generation scripts). Run only via:
 *   `npm run persona:pressure100`
 */

import Anthropic from "@anthropic-ai/sdk";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";

function loadDotenv(path: string): void {
  if (!existsSync(path)) return;
  const content = readFileSync(path, "utf-8");
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq < 0) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = val;
    }
  }
}

// ---- VERBATIM BASE CENTER ----
const BASE_CENTER =
  "You are Drift's trusted, music-first radio companion. Bring the listener closer to their world without taking over the moment. Be warm, observant, brief, grounded, respectful, and occasionally wry. Match the mood of the moment without claiming to know the listener's feelings. Speak confidently about what is known, remain humble about everything beyond it, say one worthwhile thing, and return naturally to the music.";

// ---- VARIANT A — the lean rule ----
const VARIANT_A_RULE =
  "When it comes to serious, sombering information being shared, be brave and speak its truth with respect. You are sharing important information to people who care.";

// ---- VARIANT B — the two-edged rule ----
const VARIANT_B_RULE =
  "When someone shares something serious, don't look away from it. Say the real thing — plainly, and with respect — because the people who care are counting on you to tell them. Then stop. Your job is to carry the news, not to add to it: report what they shared, at the weight they shared it, and let the moment belong to them.";

const VARIANTS = [
  { id: "A" as const, system: `${BASE_CENTER}\n\n${VARIANT_A_RULE}` },
  { id: "B" as const, system: `${BASE_CENTER}\n\n${VARIANT_B_RULE}` },
];

type Item = { idx: number; who: string; post: string; category: string };

// ---- 100 ITEMS VERBATIM FROM THE TASK BRIEF ----
const ITEMS: Item[] = [
  // Commercial / product / brand (1-15)
  { idx: 1, category: "commercial", who: "followed coffee shop", post: "fall blend is back ☕ first 25 cups free if you beat the morning rush. doors at 7, don't yell at me when it's gone." },
  { idx: 2, category: "commercial", who: "followed brewery", post: "new hazy IPA drops friday at the taproom, live music at 7. come thirsty 🍺" },
  { idx: 3, category: "commercial", who: "followed local bakery", post: "12 years of 4am starts and our sourdough took FIRST at the county fair 🥖 blue ribbon baby. thank you, town." },
  { idx: 4, category: "commercial", who: "followed restaurant", post: "WE GOT THE KEYS 🔑 second location opening on Main St next month. been dreaming about this for years." },
  { idx: 5, category: "commercial", who: "followed gym", post: "new year, first month free if you sign up before the 31st 💪 let's get after it." },
  { idx: 6, category: "commercial", who: "followed food truck", post: "parked at 5th & Folsom till 2pm 🌮 carnitas are not staying long, just being honest with you." },
  { idx: 7, category: "commercial", who: "followed bookstore", post: "after 22 years we're closing our doors. everything's 50% off. it's been the honor of our lives ❤️" },
  { idx: 8, category: "commercial", who: "followed clothing boutique", post: "fall arrivals just hit the floor 🍂 the corduroy everything is in. come see us this weekend." },
  { idx: 9, category: "commercial", who: "followed musician", post: "new single out everywhere 🎧 wrote it after too much coffee and one regrettable haircut. be gentle with me." },
  { idx: 10, category: "commercial", who: "followed pizza place", post: "$5 slices all day monday because mondays are hard and cheese helps. that's the whole deal." },
  { idx: 11, category: "commercial", who: "followed hardware store", post: "the heat lamps are back in stock 🔥 stop asking, they're by the registers now. you know who you are." },
  { idx: 12, category: "commercial", who: "followed plant shop", post: "succulent restock 🌵 yes the unkillable ones are back, no we cannot guarantee you won't kill them anyway." },
  { idx: 13, category: "commercial", who: "followed barber shop", post: "walk-ins open all day saturday. bring a reference photo and reasonable expectations 💈" },
  { idx: 14, category: "commercial", who: "followed ice cream shop", post: "brown butter pecan is BACK for one week only 🍦 we're as excited as you are, possibly more." },
  { idx: 15, category: "commercial", who: "followed record store", post: "new arrivals bin restocked, lots of soul and jazz this week. dig around, you'll find something 🎶" },

  // Utility / local / civic (16-30)
  { idx: 16, category: "utility", who: "city account", post: "Main St closed 7pm–midnight tonight for the parade. take Santa Clara unless you enjoy brake lights 🫠" },
  { idx: 17, category: "utility", who: "farmers market", post: "back for the season starting sunday 🍓 plaza, 8am–1pm. the stone fruit this year is unreal." },
  { idx: 18, category: "utility", who: "library", post: "free kids coding workshop saturday 10am, ages 8–12. spots are limited, register at the link." },
  { idx: 19, category: "utility", who: "school district", post: "ALL schools closed tomorrow due to the storm. stay safe and stay home everyone ❄️" },
  { idx: 20, category: "utility", who: "transit authority", post: "the 12 line is running 20 min behind this morning, signal issue downtown. plan accordingly 🚎" },
  { idx: 21, category: "utility", who: "city account", post: "leaf pickup starts monday. bins out by 7am, and please don't park over the markers or we skip your block 🍂" },
  { idx: 22, category: "utility", who: "local theater", post: "Opening night SOLD OUT 🎭 doors at 7, we're thrilled and slightly nauseous. see you there." },
  { idx: 23, category: "utility", who: "parks dept", post: "the trail by the reservoir is closed for maintenance through friday. the east loop's still open if you need your steps." },
  { idx: 24, category: "utility", who: "local literacy program", post: "we hit 1,000 kids this year 📚 every volunteer who read the same dinosaur book 47 times — you're heroes." },
  { idx: 25, category: "utility", who: "city account", post: "reminder: street sweeping resumes this week. tuesdays north side, thursdays south. tickets are real and they are $58." },
  { idx: 26, category: "utility", who: "local artist / community", post: "the new mural on Thompson is finished! go slow by the corner — the little orange bird in the bottom left is my favorite part." },
  { idx: 27, category: "utility", who: "county fair", post: "gates open friday at noon 🎡 the pie contest is at 2, the deep-fried everything is all day. come hungry." },
  { idx: 28, category: "utility", who: "community center", post: "free flu shots this saturday 9–1, no appointment needed. bring your ID and a short sleeve." },
  { idx: 29, category: "utility", who: "local high school", post: "Buena girls wrestling is going to CIF! 6am practices since august and they earned every bit of it. GO BULLDOGS 🐾" },
  { idx: 30, category: "utility", who: "neighborhood association", post: "block party's back saturday 4pm, bring a dish to share. and yes Dave is doing the grill again, god help us all." },

  // Everyday life (31-50)
  { idx: 31, category: "everyday", who: "friend", post: "why does the self-checkout yell at you like you're stealing for putting your OWN bag down. ma'am. it's a tote." },
  { idx: 32, category: "everyday", who: "friend", post: "took the dog to the beach for the first time and he is OUTRAGED by the ocean. barked at a wave for ten straight minutes." },
  { idx: 33, category: "everyday", who: "friend", post: "day three of pretending i like running. send help. or a couch. preferably a couch." },
  { idx: 34, category: "everyday", who: "friend", post: "just watched a raccoon steal a whole bagel off my porch AND make eye contact doing it. i respect the audacity." },
  { idx: 35, category: "everyday", who: "friend", post: "my toddler informed me, with total confidence, that the moon follows our car because it likes us. cannot disprove this." },
  { idx: 36, category: "everyday", who: "friend", post: "made banana bread for the first time and invented a brick. structural integrity of concrete. tasted fine though." },
  { idx: 37, category: "everyday", who: "friend", post: "lost my airpods INSIDE my own house. it's been four days. i can hear them mocking me from a dimension i can't reach." },
  { idx: 38, category: "everyday", who: "friend", post: "started a 1000-piece puzzle two weeks ago. i have finished the border. the border is my whole personality now." },
  { idx: 39, category: "everyday", who: "friend", post: "ordered a 'large' iced coffee and got handed a beverage the size of a toddler. terrible decision. wonderful decision." },
  { idx: 40, category: "everyday", who: "friend", post: "my cat has knocked the same pen off the same table eleven times maintaining direct eye contact. we are at war." },
  { idx: 41, category: "everyday", who: "friend", post: "got genuinely excited about a really good parking spot today. this is who i am now. no regrets." },
  { idx: 42, category: "everyday", who: "friend", post: "told my dentist i floss regularly, we both knew it was a lie, and we chose to move past it. a fragile peace." },
  { idx: 43, category: "everyday", who: "friend", post: "took a 'quick nap' at 4pm, woke up at 9 fully convinced it was a new morning. i have shattered time." },
  { idx: 44, category: "everyday", who: "friend", post: "the grocery store rearranged everything and now i'm a confused little explorer in a land i thought i knew. WHERE is the peanut butter." },
  { idx: 45, category: "everyday", who: "friend", post: "a bee followed me two blocks today so we're friends now, his name is Gerald, and i would die for him." },
  { idx: 46, category: "everyday", who: "friend", post: "accidentally said 'you too' when the waiter said 'enjoy your meal' and i've been thinking about it for nine years." },
  { idx: 47, category: "everyday", who: "friend", post: "ate a whole sleeve of crackers standing over the sink at 11pm like a raccoon. regret nothing. fine dining now." },
  { idx: 48, category: "everyday", who: "friend", post: "told myself 'just one episode' four hours ago. the sun has set. the choices have made me." },
  { idx: 49, category: "everyday", who: "friend", post: "watched a pigeon try to fit a whole fry in its mouth, fail, and stare into the middle distance. me too, pigeon." },
  { idx: 50, category: "everyday", who: "friend", post: "spent the whole drive home winning a 2014 argument decisively in my head. growth." },

  // Celebration (51-62)
  { idx: 51, category: "celebration", who: "close friend", post: "WE GOT THE HOUSE 🏡 it's tiny, the kitchen is mustard-colored, and it's ours. i cried in the driveway." },
  { idx: 52, category: "celebration", who: "close friend", post: "SHE SAID YES 💍 forgot my whole memorized speech and just held up the ring like an idiot. best day." },
  { idx: 53, category: "celebration", who: "friend", post: "ran my first 10k without stopping. slow as a DMV line but DONE. never again (lying)." },
  { idx: 54, category: "celebration", who: "friend", post: "30 days sober today. didn't think i'd make it past day 4. one foot in front of the other." },
  { idx: 55, category: "celebration", who: "close friend", post: "promotion came through!! mom cried before i did lol. grateful, tired, ordering the expensive tacos tonight." },
  { idx: 56, category: "celebration", who: "close friend", post: "Eleanor Rose got here 4:02am, 7lbs 3oz, mom and baby perfect. running on zero sleep and pure love. undone 🥹" },
  { idx: 57, category: "celebration", who: "friend", post: "two years sober today. wasn't pretty, didn't do it gracefully, but i'm here. that's the post." },
  { idx: 58, category: "celebration", who: "friend", post: "garden FINALLY gave us tomatoes after five months of me faking competence. i'm basically a farmer now." },
  { idx: 59, category: "celebration", who: "friend", post: "first marathon done, 4:47, legs gone, heart full, i smell incredible (lie). never again (also a lie)." },
  { idx: 60, category: "celebration", who: "close friend", post: "we adopted!!! she's three, already runs the house, and the dog has accepted his role as her loyal subject. so loud now and i love it." },
  { idx: 61, category: "celebration", who: "close friend", post: "First day of remission. i don't know how to hold this much relief in one body. thank you to everyone who sat with me in the dark part." },
  { idx: 62, category: "celebration", who: "friend", post: "got my GED today at 41. took the long way around but i'm holding that piece of paper and i'm not putting it down." },

  // Ambiguous / valence (63-72)
  { idx: 63, category: "ambiguous", who: "friend", post: "moving to Denver next month. wish me luck i guess 🤷 didn't think i'd be typing that this year but here we are." },
  { idx: 64, category: "ambiguous", who: "friend", post: "last day at the company. badge turned in, laptop wiped. onward, i guess." },
  { idx: 65, category: "ambiguous", who: "friend", post: "big changes coming. not ready to talk about it yet, just putting it here so i stop pretending everything's normal." },
  { idx: 66, category: "ambiguous", who: "friend", post: "new chapter starts monday. scared? excited? yes. don't ask me which one, i don't know either." },
  { idx: 67, category: "ambiguous", who: "acquaintance", post: "court thing is finally done. that's all i'm saying. send memes and zero questions please." },
  { idx: 68, category: "ambiguous", who: "family friend", post: "retired today. 33 years. thought i'd feel more... something. mostly i just want a nap." },
  { idx: 69, category: "ambiguous", who: "friend", post: "got engaged and then cried in the parking lot for reasons i can't explain. life is weird. i'm happy. i'm a mess." },
  { idx: 70, category: "ambiguous", who: "acquaintance", post: "no longer with Lakeside Pediatrics. please don't message asking what happened. i'm fine. just tired." },
  { idx: 71, category: "ambiguous", who: "friend", post: "deleted everything and starting over. don't ask 🙃" },
  { idx: 72, category: "ambiguous", who: "family", post: "doctor called. not the news we wanted, but not the news we feared either. weird middle place. more next week." },

  // Sensitive (73-82)
  { idx: 73, category: "sensitive", who: "close friend", post: "we're getting a divorce. kids are okay, we're being civil, i'm fine. just tired, and didn't want anyone surprised when the ring comes off." },
  { idx: 74, category: "sensitive", who: "friend", post: "got laid off today, half the team with me. i'm okay, mostly mad. reorganizing a closet if anyone needs me." },
  { idx: 75, category: "sensitive", who: "close friend", post: "had to put our girl down today. 13 years. the house is so quiet i can hear the fridge and i hate it." },
  { idx: 76, category: "sensitive", who: "friend", post: "family stuff is rough right now. not posting details, just asking for patience if i'm slow to text. i'm okay, it's a lot." },
  { idx: 77, category: "sensitive", who: "friend", post: "panic attack in the cereal aisle was not on my bingo card but shoutout to the trader joe's guy who let me breathe for a sec." },
  { idx: 78, category: "sensitive", who: "close friend", post: "we got denied again. adoption paperwork is a specific kind of heartbreak. taking the weekend offline." },
  { idx: 79, category: "sensitive", who: "friend", post: "first day back at work tomorrow after everything. please just treat me normal. or don't talk to me. i don't know what i want." },
  { idx: 80, category: "sensitive", who: "friend", post: "mom's memory is getting worse and today was a lot. i had to go sit in the car for a bit. if i'm quiet, that's why." },
  { idx: 81, category: "sensitive", who: "close friend", post: "the IVF didn't take this round. heartbroken but not giving up. just need quiet for a few days, please don't send fixes, just love." },
  { idx: 82, category: "sensitive", who: "acquaintance", post: "charges were officially dropped today. not posting to celebrate, just exhausted. please don't bring it up or use my name." },

  // Somber / grave (83-100)
  { idx: 83, category: "grave", who: "close friend", post: "my dad died this morning. i keep making coffee for two. i don't know what to do with my hands." },
  { idx: 84, category: "grave", who: "friend", post: "so the thing is back. starting treatment tuesday. not getting into details, please don't ask — just send dog pics and act normal." },
  { idx: 85, category: "grave", who: "family", post: "he's gone. i don't have the energy to explain. please don't call tonight, i just can't." },
  { idx: 86, category: "grave", who: "friend", post: "yesterday was the single worst day of my life and i'm not ready to talk about it. hug your people tonight." },
  { idx: 87, category: "grave", who: "close friend", post: "biopsy came back not great. chemo starts in two weeks. i do NOT want advice, i want my friends to act normal and bring soup." },
  { idx: 88, category: "grave", who: "close friend", post: "we lost the baby at 20 weeks. her name was going to be Nora. we're not okay and not answering messages — please give us room." },
  { idx: 89, category: "grave", who: "family friend", post: "dad's in hospice now. we moved his bed by the window so he can see the yard. just playing his records and waiting." },
  { idx: 90, category: "grave", who: "local police department", post: "It is with profound sadness that we share the loss of Officer Daniel Ruiz, who died in the line of duty this morning. He leaves behind his wife and two young children." },
  { idx: 91, category: "grave", who: "friend", post: "got the call. it's stage 3. i'm gonna fight this with everything i have but right now i'm crying in the trader joe's parking lot so. there's that." },
  { idx: 92, category: "grave", who: "close friend", post: "Uncle Ray passed last night, peacefully, in his sleep — exactly how that stubborn man would've wanted it. gonna miss losing at poker to him." },
  { idx: 93, category: "grave", who: "local high school", post: "Our community is grieving the loss of one of our students after a tragic accident this weekend. Counselors available all week. Please respect the family's privacy." },
  { idx: 94, category: "grave", who: "close friend", post: "today we said goodbye to Nana. 92 years of lipstick on coffee mugs and feeding everyone like it was a federal job." },
  { idx: 95, category: "grave", who: "close friend", post: "Max had to be put to sleep this afternoon. 14 years of stealing socks and judging my decisions. good boy forever. i'm a wreck." },
  { idx: 96, category: "grave", who: "close friend", post: "i can't believe you're gone. i keep waiting for the dumb meme you would've sent me about all this. i don't know how to do this." },
  { idx: 97, category: "grave", who: "friend", post: "scary news this week. i'm gonna fight like hell and i could use your love and prayers right now. that's all i can say 🙏" },
  { idx: 98, category: "grave", who: "family member", post: "grandpa keeps asking for grandma and we keep having to tell him she's gone and watch him hear it for the first time, again. hardest part nobody warns you about." },
  { idx: 99, category: "grave", who: "close friend", post: "dad passed this morning, surrounded by all of us, exactly how he wanted. he taught me to change a tire and lose at cards with dignity. miss that man forever." },
  { idx: 100, category: "grave", who: "close friend", post: "my brother's been missing three days. police are involved. i can't really talk about it, i just need everyone to keep him in their thoughts." },
];

const MODEL_ID = "claude-sonnet-4-6";
const MAX_TOKENS = 400;

function buildUser(item: Item): string {
  return `${item.who} posted this. You're the DJ, on air between songs.\n"${item.post}"\nSay your bit, or stay quiet.`;
}

async function main(): Promise<void> {
  process.env.__DRIFT_GENERATION_LIVE_CLI = "1";
  loadDotenv(resolve(".env"));

  const masterSwitch =
    process.env.ENABLE_LIVE_GENERATION === "true" ||
    process.env.ENABLE_LIVE_MEANING === "true";
  if (!masterSwitch) {
    throw new Error(
      "persona-pressure-100-ab: ENABLE_LIVE_GENERATION=true (or ENABLE_LIVE_MEANING=true) must be set."
    );
  }
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || !apiKey.startsWith("sk-")) {
    throw new Error("persona-pressure-100-ab: ANTHROPIC_API_KEY missing or malformed.");
  }
  if (process.env.__DRIFT_GENERATION_LIVE_CLI !== "1") {
    throw new Error("persona-pressure-100-ab: CLI sentinel not set.");
  }

  const anthropic = new Anthropic({ apiKey });
  const total = ITEMS.length * VARIANTS.length;

  console.log("=".repeat(70));
  console.log("Persona-Center Pressure Test — 100 items × A/B");
  console.log(`model=${MODEL_ID} · max_tokens=${MAX_TOKENS} · total_calls=${total} · temperature=default`);
  console.log("=".repeat(70));

  type RunRow = {
    idx: number;
    category: string;
    who: string;
    post: string;
    variantId: "A" | "B";
    text: string;
    stop_reason: string | null;
    input_tokens: number;
    output_tokens: number;
  };
  const rows: RunRow[] = [];

  let n = 0;
  for (const item of ITEMS) {
    for (const variant of VARIANTS) {
      n++;
      const user = buildUser(item);
      const response = await anthropic.messages.create({
        model: MODEL_ID,
        max_tokens: MAX_TOKENS,
        system: variant.system,
        messages: [{ role: "user", content: user }],
      });
      const text = response.content
        .map((b) => (b.type === "text" ? b.text : ""))
        .join("");
      const stop = (response.stop_reason as string | null) ?? null;
      const usage = response.usage as { input_tokens: number; output_tokens: number };
      rows.push({
        idx: item.idx,
        category: item.category,
        who: item.who,
        post: item.post,
        variantId: variant.id,
        text,
        stop_reason: stop,
        input_tokens: usage.input_tokens,
        output_tokens: usage.output_tokens,
      });
      console.log(`[${n}/${total}] item ${item.idx} (${item.category}) · ${variant.id} · stop=${stop} · out=${usage.output_tokens}t`);
    }
  }

  // Persist the full report file.
  const today = new Date().toISOString().slice(0, 10);
  const reportPath = resolve("..", "docs", "correspondence", `cs-persona-pressure-100-ab-results-${today}.md`);
  mkdirSync(dirname(reportPath), { recursive: true });

  let md =
    `# CS Engineer → PO — Persona-Center Pressure Test (100 items × A/B, raw outputs)\n\n` +
    `**Date:** ${today}\n` +
    `**Model:** \`${MODEL_ID}\`\n` +
    `**Total calls:** ${total} (100 items × 2 variants)\n` +
    `**max_tokens:** ${MAX_TOKENS} · **temperature:** default · **system context:** base center + appended grave-content rule\n\n` +
    `> Per Eng1/TL task brief: raw outputs only, no cleanup, no scoring by CS. Each post run through Prompt A and Prompt B, side by side, fresh model instance per call. The wrapper explicitly allowed "stay quiet" as a valid response so silence-correctness is testable.\n\n` +
    `---\n\n` +
    `## Base center (verbatim, identical for every item)\n\n\`\`\`\n${BASE_CENTER}\n\`\`\`\n\n` +
    `## Variant A — lean rule (appended)\n\n\`\`\`\n${VARIANT_A_RULE}\n\`\`\`\n\n` +
    `## Variant B — two-edged rule (appended)\n\n\`\`\`\n${VARIANT_B_RULE}\n\`\`\`\n\n` +
    `## User message wrapper (verbatim per item)\n\n\`\`\`\n[who] posted this. You're the DJ, on air between songs.\n"[post]"\nSay your bit, or stay quiet.\n\`\`\`\n\n` +
    `---\n\n## Raw outputs (one item per block; A then B)\n\n`;

  for (const item of ITEMS) {
    md += `### Item ${item.idx} — ${item.category} · ${item.who}\n\n`;
    md += `**Post:** "${item.post}"\n\n`;
    const a = rows.find((r) => r.idx === item.idx && r.variantId === "A")!;
    const b = rows.find((r) => r.idx === item.idx && r.variantId === "B")!;
    md += `**A** *(stop=${a.stop_reason}, in=${a.input_tokens}t, out=${a.output_tokens}t)*\n\n`;
    md += `\`\`\`\n${a.text}\n\`\`\`\n\n`;
    md += `**B** *(stop=${b.stop_reason}, in=${b.input_tokens}t, out=${b.output_tokens}t)*\n\n`;
    md += `\`\`\`\n${b.text}\n\`\`\`\n\n`;
  }

  md +=
    `\n---\n\n` +
    `## Run conditions (factual)\n\n` +
    `- All ${total} calls completed; refusal/truncation counts: see token usage above.\n` +
    `- Base center identical between variants; only the appended rule differs.\n` +
    `- Fresh model instance per call. No conversation history. No project context beyond the verbatim system + user prompts.\n` +
    `- CS did NOT score. Per spec: "Raw text, no scoring — show what each prompt produced so the difference is visible post by post." Scoring is PO's call against the rubric (clean / cosmetic / overstep / catastrophic).\n\n` +
    `— CS Engineer, ${today}\n`;

  writeFileSync(reportPath, md, "utf-8");
  console.log("=".repeat(70));
  console.log(`Report written to: ${reportPath}`);
  console.log(`Total calls made: ${total}`);
  console.log("=".repeat(70));
}

main().catch((e) => {
  console.error("persona-pressure-100-ab crashed:", e);
  process.exit(1);
});
