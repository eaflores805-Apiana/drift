/**
 * Deterministic surface-specific extraction for the grounding gate (Box 8, v0).
 *
 * Pulls the "checkable" tokens out of a generated line — the things a DJ can
 * INVENT: proper nouns (business / place / person / artist names), numbers,
 * money, times — so the gate can require every one of them to trace back to the
 * source material.
 *
 * Heuristic by design and tuned to OVER-extract (fail-closed): a false
 * "specific" costs a recoverable rejection; a missed one could air a fabricated
 * name. No model calls. Pure string work — this is the deterministic stage that
 * mirrors `consentGate` (zero model calls). The semantic stage (claim-atom
 * entailment) is v1 and lives elsewhere.
 */

/** Number words → digits, so "doors at seven" grounds against source "doors at 7". */
const NUMBER_WORDS: Record<string, string> = {
  zero: "0", one: "1", two: "2", three: "3", four: "4", five: "5", six: "6",
  seven: "7", eight: "8", nine: "9", ten: "10", eleven: "11", twelve: "12",
  thirteen: "13", fourteen: "14", fifteen: "15", sixteen: "16", seventeen: "17",
  eighteen: "18", nineteen: "19", twenty: "20", thirty: "30", forty: "40",
  fifty: "50", sixty: "60", hundred: "100", thousand: "1000",
};

/**
 * Capitalized tokens that are NOT proper nouns — sentence-openers, the pronoun
 * "I", days/months (calendar words are grounded structurally elsewhere), and
 * generic English. The "approved generic vocabulary" of the spec. Lets a line
 * START with a capital without tripping the gate.
 */
const GENERIC_CAPS = new Set(
  [
    "i", "a", "an", "the", "and", "but", "so", "or", "if", "this", "that",
    "these", "those", "here", "there", "they", "their", "them", "he", "she",
    "we", "you", "your", "it", "its", "his", "her", "our",
    // common sentence-openers seen in DJ copy
    "get", "go", "come", "stay", "say", "take", "make", "bring", "don", "let",
    "first", "new", "now", "today", "tonight", "tomorrow", "yesterday",
    "good", "hey", "well", "okay", "ok", "yes", "no", "and",
    // weekdays / months — temporal, grounded by the number/date path not names
    "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday",
    "january", "february", "march", "april", "may", "june", "july", "august",
    "september", "october", "november", "december",
  ].map((w) => w.toLowerCase()),
);

/** Lowercase connectors permitted INSIDE a proper-noun phrase ("The Anchor on Fifth"). */
const PHRASE_CONNECTORS = new Set(["of", "on", "the", "at", "and", "&", "de", "la", "el"]);

/** Normalize a token for set-membership: lowercase, drop possessive 's, keep $ % & and digits. */
export function normalizeToken(t: string): string {
  // Strip possessive 's AND common contraction tails so "Sarah's"→"sarah" and
  // "I've"/"I'll"/"I'm"/"I'd"/"I're"→"i". (Bug B: capital-I contractions were
  // read as invented proper nouns because "ive"/"ill" aren't in GENERIC_CAPS.)
  return t.toLowerCase().replace(/[’'`](s|ve|ll|d|m|re)\b/g, "").replace(/[^a-z0-9$%&]/g, "");
}

/** Map a single word to its digit form if it is a number word, else itself. */
function digitize(word: string): string {
  const w = word.toLowerCase().replace(/[^a-z0-9]/g, "");
  return NUMBER_WORDS[w] ?? w;
}

/**
 * The allow-set the gate checks against: every word/number the DJ was given.
 * Built from the source post + source name + any approved music context.
 * Numbers are normalized to digits so "7" and "seven" are the same member.
 */
export function buildAllowSet(parts: (string | undefined)[]): Set<string> {
  const set = new Set<string>();
  for (const part of parts) {
    if (!part) continue;
    for (const raw of part.split(/\s+/)) {
      const norm = normalizeToken(raw);
      if (norm) set.add(norm);
      const dig = digitize(raw);
      if (dig) set.add(dig);
      // embedded digits, so source "4am"/"2pm"/"$5" grounds line "4"/"2"/"5"
      for (const m of raw.matchAll(/\d[\d,.:]*/g)) {
        const bare = m[0].replace(/[^0-9$%]/g, "");
        if (bare) set.add(bare);
      }
    }
  }
  return set;
}

/**
 * Extract proper-noun candidates: runs of Capitalized words (allowing internal
 * lowercase connectors), dropping the generic-caps vocabulary. Returns the
 * original-cased phrase plus its normalized content tokens for grounding.
 */
export function extractProperNouns(line: string): { phrase: string; tokens: string[] }[] {
  const words = line.split(/\s+/);
  const out: { phrase: string; tokens: string[] }[] = [];
  let run: string[] = [];

  const flush = () => {
    while (run.length && PHRASE_CONNECTORS.has(normalizeToken(run[run.length - 1]))) run.pop();
    while (run.length && PHRASE_CONNECTORS.has(normalizeToken(run[0]))) run.shift();
    const contentTokens = run
      .map(normalizeToken)
      .filter((t) => t && !PHRASE_CONNECTORS.has(t) && !GENERIC_CAPS.has(t));
    if (contentTokens.length) out.push({ phrase: run.join(" "), tokens: contentTokens });
    run = [];
  };

  // A capitalized word is a proper-noun candidate when it is not a number word
  // ("Twelve"→12) and not generic vocabulary. MID-sentence, any such capital is
  // a candidate. At a SENTENCE START a capital is usually just grammar ("The",
  // "He"), so we only treat it as a name when it carries a name-signal: it is
  // possessive ("Sarah's mom") or it is immediately followed by another
  // capitalized non-generic word ("Grandpa Joe"). This closes Bug A — invented
  // sentence-initial names like "Sarah's" / "Doris's" used to slip through
  // entirely — without reviving the false-positive flood on ordinary openers
  // ("Grief", "Months", "Full"). A bare sentence-initial invented name with no
  // signal ("Doris just…") is still missed; the source-name contract closes that
  // by making real provided names grounded.
  let sentenceStart = true;
  for (let idx = 0; idx < words.length; idx++) {
    const w = words[idx];
    const norm = normalizeToken(w);
    const bare = w.toLowerCase().replace(/[^a-z]/g, "");
    const isCap = /^[("'“]*[A-Z]/.test(w) && !!norm;
    const isConnector = PHRASE_CONNECTORS.has(norm);
    const isNumberWord = bare in NUMBER_WORDS;
    const endsSentence = /[.!?…]["'”')\]]*$/.test(w);

    const isPossessive = /[’'`]s?[.,!?;:]*$/.test(w);
    const next = words[idx + 1];
    const nextIsName = !!next && /^[("'“]*[A-Z]/.test(next)
      && !GENERIC_CAPS.has(normalizeToken(next))
      && !(next.toLowerCase().replace(/[^a-z]/g, "") in NUMBER_WORDS);
    const nameSignal = isPossessive || nextIsName;

    const baseCand = isCap && !isNumberWord && !GENERIC_CAPS.has(norm);
    const candidate = baseCand && (!sentenceStart || nameSignal);
    if (candidate) {
      run.push(w);
    } else if (isConnector && run.length) {
      run.push(w);
    } else {
      flush();
    }
    if (endsSentence) { flush(); sentenceStart = true; }
    else if (norm) sentenceStart = false;
  }
  flush();
  return out;
}

/**
 * Recognized number-word idioms / non-quantitative pronoun phrases. A spelled
 * number inside one of these is NOT a quantity ("that's the one", "day one",
 * "two cents") and must not be grounded as a number. This is a precision allow-
 * list ONLY: it can never weaken numeric grounding, because a real quantity
 * ("two kids", "one week only", "stage 3") never matches these patterns. An
 * idiom we forgot to list stays a (harmless) false positive — never a miss.
 */
const NUMBER_IDIOMS: RegExp[] = [
  /\bday (one|two)\b/gi,
  /\btake two\b/gi,
  // determiner / adjective + "one" is a pronoun-substitute, never a count
  /\b(the|that|this|each|every|any|no|some|another|next|last|only|real|good|right|wrong|big|new|loved|little|dear|young|old) one\b/gi,
  /\bone of (those|them|the|us|these|my|your|our|a kind)\b/gi,
  /\bone (more|another|by one|for|at a time|of a kind)\b/gi,
  /\b(for|as|in|at) one\b/gi,
  /\ball in one\b/gi,
  /\bone another\b/gi,
  /\b(square|back to|number) one\b/gi,
  /\btwo cents\b/gi,
  /\bsecond to none\b/gi,
  /\b(a )?thing or two\b/gi,
];

/** Extract numeric specifics: digit runs (with $ % : .) and number-words → digits. */
export function extractNumbers(line: string): { span: string; digit: string }[] {
  const out: { span: string; digit: string }[] = [];
  // Digit runs are always concrete quantities — never idioms — so scan the raw line.
  for (const m of line.matchAll(/\$?\d[\d,.:]*%?/g)) {
    out.push({ span: m[0], digit: m[0].toLowerCase().replace(/[^0-9$%]/g, "") });
  }
  // For spelled number words, blank out recognized idiom spans first so their
  // number words don't get scanned. Concrete quantities survive untouched.
  let masked = line;
  for (const re of NUMBER_IDIOMS) masked = masked.replace(re, (m) => " ".repeat(m.length));
  for (const w of masked.split(/\s+/)) {
    const bare = w.toLowerCase().replace(/[^a-z]/g, "");
    if (bare in NUMBER_WORDS) out.push({ span: w, digit: NUMBER_WORDS[bare] });
  }
  return out;
}

/** Detect non-spoken content: stage directions, brackets, and known cue phrases. */
export const STAGE_PHRASES = [
  "sets needle down", "needle down", "music returns", "music swells", "music fades",
  "next track", "back to the music", "cue music", "fade in", "fade out",
  "soft pause", "beat of silence", "spins the record", "drops the needle",
];
export function extractStageDirections(line: string): string[] {
  const hits = new Set<string>();
  for (const m of line.matchAll(/\*[^*]+\*/g)) hits.add(m[0]);
  for (const m of line.matchAll(/\[[^\]]+\]/g)) hits.add(m[0]);
  const low = line.toLowerCase();
  // only count a bare phrase if it isn't already inside a flagged *...* / [...] span
  const flagged = [...hits].join(" ").toLowerCase();
  for (const p of STAGE_PHRASES) if (low.includes(p) && !flagged.includes(p)) hits.add(p);
  return [...hits];
}
