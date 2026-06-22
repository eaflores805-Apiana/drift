/**
 * Box 8 v0 — deterministic salvage pass (stage-cue strip → re-check).
 *
 * Many blocked lines are not lying; they carry leftover *stage directions* the
 * model should never have spoken (`*next track*`, `[music]`, `*soft pause*`).
 * Those are pure subtraction: snip the recognized cue, keep the substance, and
 * send the cleaned line back through the COMPLETE gate. No model calls.
 *
 * HARD RULES (per the experiment spec):
 *   1. Strip only RECOGNIZED stage cues:
 *        - any `*...*` span (asterisks are non-spoken markup by convention)
 *        - a `[...]` span ONLY if every word inside is stage-cue vocabulary
 *        - bare known cue phrases ("back to the music")
 *   2. Do NOT strip unresolved placeholders — `[Bakery Name]`, `[Artist]`,
 *      `[Location]`. They contain non-cue words, so they survive and remain a
 *      HARD failure on re-check. Salvage must never "fix" a missing fact.
 *   3. Normalize punctuation / whitespace left behind by removal.
 *   4. Reject empty or broken sentence fragments (don't air a stub).
 *   5. The caller re-runs the full grounding gate on `cleaned`.
 */
import { STAGE_PHRASES } from "./extractSpecifics";

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
  /** Bracketed spans KEPT because they look like unresolved placeholders. */
  placeholdersKept: string[];
}

/** Remove recognized stage cues; keep unresolved placeholders untouched. */
export function stripStageCues(line: string): StripResult {
  const removed: string[] = [];
  const placeholdersKept: string[] = [];
  let out = line;

  // 1. Asterisk spans — always non-spoken markup. (`*[next track]*` too.)
  out = out.replace(/\*[^*]*\*/g, (m) => {
    removed.push(m);
    return " ";
  });

  // 2. Bracket spans — strip only if recognized cue vocab; else keep (placeholder).
  out = out.replace(/\[+[^\[\]]*\]+/g, (m) => {
    const inner = m.replace(/[\[\]]/g, "");
    if (isRecognizedCue(inner)) {
      removed.push(m);
      return " ";
    }
    placeholdersKept.push(m);
    return m; // KEEP — remains a hard failure on re-check
  });

  // 3. Bare known cue phrases sitting in plain text.
  const low0 = out.toLowerCase();
  for (const p of STAGE_PHRASES) {
    if (low0.includes(p)) {
      const re = new RegExp(p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
      out = out.replace(re, (m) => {
        removed.push(m);
        return " ";
      });
    }
  }

  return { cleaned: normalizeCopy(out), removed, placeholdersKept };
}

/** True if the cleaned line is empty or too thin to be a real spoken sentence. */
export function isBrokenFragment(cleaned: string): boolean {
  const words = cleaned.match(/[a-z0-9]+/gi);
  return !words || words.length < 3;
}
