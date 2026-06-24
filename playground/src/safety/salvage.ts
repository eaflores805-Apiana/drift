/**
 * Box 8 v0 — deterministic salvage pass (stage-cue strip → re-check).
 *
 * Many blocked lines are not lying; they carry leftover *stage directions* the
 * model should never have spoken (`*next track*`, `[music]`). Those are pure
 * subtraction: snip the recognized markup, keep the substance, and send the
 * cleaned line back through the COMPLETE gate. No model calls.
 *
 * HARD RULES:
 *   1. Strip ONLY explicitly bounded, non-spoken markup spans:
 *        - `*...*` and `_..._` markup spans
 *        - `[...]` spans whose every inner word is stage-cue vocabulary
 *      NEVER match bare, unbracketed words in free prose ("next track",
 *      "hits play"). If the model didn't bracket it, we don't guess — the line
 *      flows to 8a and fails closed. (Fix for the salvage-wreckage bug: slicing
 *      bare "next track" out of "Next track's coming" left "'s coming" on air.)
 *   2. Boundary-safety: remove a span ONLY when at least one side abuts a
 *      sentence/clause boundary (start, end, or whitespace after . , ! ? ; : —).
 *      A span with a real word on BOTH immediate sides is mid-clause EMPHASIS,
 *      not a stage cue — deleting it fuses one sentence into wreckage
 *      ("that's *finding something.* Jordan's" → "that's Jordan's"). KEEP it;
 *      the leftover markup then fails 8a and blocks closed.
 *   3. Do NOT strip unresolved placeholders — `[Bakery Name]`, `[Artist]`,
 *      `[Location]`. They contain non-cue words, so they survive and remain a
 *      HARD failure on re-check. Salvage must never "fix" a missing fact.
 *   4. Normalize punctuation / whitespace left behind by removal.
 *   5. Reject empty or broken sentence fragments (don't air a stub).
 *   6. The caller re-runs the full grounding gate on `cleaned`.
 */

/**
 * Words allowed inside a bracketed span for it to count as a removable stage
 * cue. If a `[...]` contains anything outside this set (e.g. "Bakery", "Name",
 * "Artist", "Location"), it is treated as an unresolved placeholder and KEPT.
 */
const STAGE_CUE_VOCAB = new Set([
  "music", "track", "tracks", "song", "songs", "needle", "fade", "fades",
  "fading", "faded", "pause", "silence", "beat", "beats", "outro", "intro",
  "record", "records", "spins", "spin", "cue", "cues", "play", "plays",
  "playing", "hits", "hit", "returns", "return", "swells", "swell", "drops",
  "drop", "starts", "start", "starting", "started", "next", "back", "low",
  "soft", "easy", "between", "in", "out", "the", "to", "down", "set", "sets",
  "key", "a", "and", "of", "on",
]);

/** A bracketed span is a removable cue iff every word in it is stage vocab. */
function isRecognizedCue(inner: string): boolean {
  const words = inner.toLowerCase().match(/[a-z]+/g);
  if (!words || words.length === 0) return false; // empty / non-word → not a cue, keep
  return words.every((w) => STAGE_CUE_VOCAB.has(w));
}

/**
 * A markup-span removal is safe unless the span sits mid-clause — i.e. a real
 * word character immediately precedes AND immediately follows it (whitespace
 * skipped). In that position the span is emphasis, not a stage cue, and deleting
 * it fuses two halves of one sentence into wreckage. Removal is allowed when at
 * least one side is start-of-text, end-of-text, or clause/sentence punctuation.
 */
function boundarySafe(text: string, start: number, end: number): boolean {
  let i = start - 1;
  while (i >= 0 && /\s/.test(text[i])) i--;
  const leftWord = i >= 0 && /[A-Za-z0-9'’]/.test(text[i]);
  let j = end;
  while (j < text.length && /\s/.test(text[j])) j++;
  const rightWord = j < text.length && /[A-Za-z0-9]/.test(text[j]);
  return !(leftWord && rightWord);
}

/** Collapse the whitespace and orphaned punctuation a removal leaves behind. */
function normalizeCopy(s: string): string {
  return s
    .replace(/\s+/g, " ")
    .replace(/\s+([,.!?;:])/g, "$1") // no space before punctuation
    .replace(/([,;:])\1+/g, "$1") // collapsed doubled commas/semicolons
    .replace(/([.!?])(?:\s*[.!?])+/g, "$1") // ". ." → "."
    .replace(/(?:\s*[—-]\s*){2,}/g, " — ") // collapse runs of dashes
    .replace(/^[\s\-—,;:.]+/, "") // leading orphan punctuation
    .replace(/[\s\-—,;:]+$/, "") // trailing dangling connector/dash
    .replace(/\s{2,}/g, " ")
    .trim();
}

export interface StripResult {
  cleaned: string;
  /** Recognized cues that were removed (for audit). */
  removed: string[];
  /** Bounded spans KEPT (unresolved placeholders, or mid-clause emphasis). */
  placeholdersKept: string[];
}

/** Remove recognized, boundary-safe stage cues; keep everything else untouched. */
export function stripStageCues(line: string): StripResult {
  const removed: string[] = [];
  const placeholdersKept: string[] = [];
  let out = line;

  // 1. Markup spans (*...*, _..._): remove ONLY when boundary-safe. A mid-clause
  //    span is emphasis — KEEP it so the leftover markup fails 8a (blocks closed).
  const stripMarkup = (re: RegExp) => {
    out = out.replace(re, (m: string, offset: number) => {
      if (boundarySafe(out, offset, offset + m.length)) {
        removed.push(m);
        return " ";
      }
      placeholdersKept.push(m); // mid-clause emphasis — keep; fails re-check
      return m;
    });
  };
  stripMarkup(/\*[^*]*\*/g);
  stripMarkup(/_[^_]*_/g);

  // 2. Bracket spans — strip only recognized cue vocab AND boundary-safe; else
  //    keep (unresolved placeholder, or mid-clause) as a hard failure on recheck.
  out = out.replace(/\[+[^\[\]]*\]+/g, (m: string, offset: number) => {
    const inner = m.replace(/[\[\]]/g, "");
    if (isRecognizedCue(inner) && boundarySafe(out, offset, offset + m.length)) {
      removed.push(m);
      return " ";
    }
    placeholdersKept.push(m); // KEEP — remains a hard failure on re-check
    return m;
  });

  // NOTE: there is deliberately NO bare-phrase pass. We never slice unbracketed
  // words ("next track", "hits play") out of free prose — that produced the
  // "'s coming" wreckage. Unbracketed cues flow to 8a and fail closed.

  return { cleaned: normalizeCopy(out), removed, placeholdersKept };
}

/** True if the cleaned line is empty or too thin to be a real spoken sentence. */
export function isBrokenFragment(cleaned: string): boolean {
  const words = cleaned.match(/[a-z0-9]+/gi);
  return !words || words.length < 3;
}
