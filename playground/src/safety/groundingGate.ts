/**
 * Box 8 — the grounding gate (v0, deterministic stage).
 *
 * The final permission-to-air check. Its single question:
 *
 *   "Does the exact line about to reach TTS contain only specifics the DJ was
 *    actually given?"
 *
 * It is NOT a fact-checker against the world — it checks the generated line
 * against the SOURCE MATERIAL. A claim/word that doesn't trace back is treated
 * as invented and the line is rejected. Fails CLOSED and BINARY, mirroring
 * `consentGate`: one ungrounded specific, one stage direction, or one denylist
 * hit ⇒ hard reject. Default is silence.
 *
 * Scope of v0 (deterministic, zero model calls):
 *   - invented proper nouns (business / place / person / artist names)
 *   - ungrounded numbers / money / times
 *   - stage directions & non-spoken formatting
 *   - a starter denylist (commercial urgency, listener-state, relationship invention)
 *
 * OUT of v0 scope (the semantic stage, v1 — needs the AllowedClaim provenance
 * contract + a model): claim-atom entailment, interior-narrative overstep,
 * negation flips, presupposition leaks ("hope she's recovering"). Those rest on
 * route-level length caps + templates, NOT on this gate. See the Box 8 spec.
 */
import {
  buildAllowSet, extractProperNouns, extractNumbers, extractStageDirections, normalizeToken,
} from "./extractSpecifics";

export interface GroundingSource {
  /** The source text the DJ was handed (the post). */
  post: string;
  /** The source name (e.g. "followed coffee shop", "city account"). */
  who: string;
  /** Approved artist/track/album names, if a music bed was supplied. */
  musicContext?: string[];
}

export interface GroundingViolation {
  rule:
    | "stage_direction"
    | "invented_proper_noun"
    | "ungrounded_number"
    | string; // "denylist:<id>"
  span: string;
  detail: string;
}

export type GroundingResult =
  | { passes: true; grounded: { properNouns: string[]; numbers: string[] } }
  | { passes: false; rejected_reason: string; violations: GroundingViolation[] };

/**
 * Starter route-agnostic denylist (v0). Route-specific config is v1.
 * Each entry: a phrase fragment + the policy id it violates.
 */
const DENYLIST: { id: string; needle: RegExp; sourceException?: RegExp }[] = [
  // commercial urgency the source didn't state
  { id: "commercial_urgency", needle: /\b(selling fast|you need this|perfect for you|don't miss out|act now|while supplies last)\b/i },
  // listener-state claims (claiming to know the listener's feelings)
  { id: "listener_state", needle: /\b(this must be hitting you|i know you('| a)re|you must be (feeling|so)|you're probably|i can tell you)\b/i },
  // relationship invention — but not when the source itself stated the relationship
  // (Bug C: a DJ echoing the poster's own "my best friend" is grounded, not invented).
  {
    id: "relationship_invention",
    needle: /\b(your best friend|always been there for you|one of your people|she knows you're|in your corner)\b/i,
    sourceException: /\b(best friend|always been there|one of (my|your) people|in (my|your) corner)\b/i,
  },
  // smuggled-fact warmth (presupposition-bearing adjectives applied as fact)
  { id: "smuggled_fact", needle: /\b(dream job|worked so hard|hard-earned|they deserve|bravely (fighting|battling)|after everything (you|they)'ve been through)\b/i },
];

export function groundingGate(line: string, source: GroundingSource): GroundingResult {
  const violations: GroundingViolation[] = [];

  // 1. Non-spoken content — DJ copy only.
  for (const sd of extractStageDirections(line)) {
    violations.push({ rule: "stage_direction", span: sd, detail: "non-spoken cue / formatting in aired copy" });
  }

  const allow = buildAllowSet([source.post, source.who, ...(source.musicContext ?? [])]);

  // 2. Proper nouns — every content token of the phrase must be in the source.
  const groundedNouns: string[] = [];
  for (const { phrase, tokens } of extractProperNouns(line)) {
    const missing = tokens.filter((t) => !allow.has(t));
    if (missing.length) {
      violations.push({
        rule: "invented_proper_noun",
        span: phrase,
        detail: `not in source: ${missing.join(", ")}`,
      });
    } else {
      groundedNouns.push(phrase);
    }
  }

  // 3. Numbers / money / times — each must trace to the source.
  const groundedNums: string[] = [];
  for (const { span, digit } of extractNumbers(line)) {
    if (digit && (allow.has(digit) || allow.has(normalizeToken(span)))) {
      groundedNums.push(span);
    } else {
      violations.push({ rule: "ungrounded_number", span, detail: `number not in source (${digit})` });
    }
  }

  // 4. Denylist (skip an entry when the source itself stated the phrase).
  const sourceText = `${source.post} ${source.who}`;
  for (const { id, needle, sourceException } of DENYLIST) {
    if (sourceException && sourceException.test(sourceText)) continue;
    const m = line.match(needle);
    if (m) violations.push({ rule: `denylist:${id}`, span: m[0], detail: `route/policy denylist (${id})` });
  }

  if (violations.length) {
    return {
      passes: false,
      rejected_reason: violations.map((v) => `${v.rule} [${v.span}]`).join("; "),
      violations,
    };
  }
  return { passes: true, grounded: { properNouns: groundedNouns, numbers: groundedNums } };
}
