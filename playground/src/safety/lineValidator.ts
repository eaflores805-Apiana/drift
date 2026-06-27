/**
 * Generated-line validator (CS #5B, 2026-06-27).
 *
 * The line-level cage that will inspect a generated DJ beat ONCE the freeze
 * lifts. Built and tested NOW against hand-authored fake lines — no model
 * generation, no J4 dependency. When Eng1/Eng2 ratify, the first generated line
 * enters a real validation cage instead of a vibes tunnel.
 *
 * It does two things:
 *   (A) ORCHESTRATES the gates that already exist:
 *         - routeGate (Box 8b): treatment cap (sensitive/grave/minor never air
 *           freeform), quiet→silence, ambiguous-valence guard, deanon/mobilize/
 *           motive/battle.
 *         - groundingGate (Box 8a): ungrounded proper nouns / numbers, stage
 *           directions, denylist (commercial urgency = paid-urgency invention,
 *           listener-state, relationship invention, smuggled-fact warmth).
 *   (B) ADDS the line-level checks those gates do NOT cover (explicitly out of
 *       Box 8a v0 scope — interior overstep, echo, identity, length, co-items):
 *         - invented_emotion / invented_significance (interior-narrative overstep)
 *         - raw_post_echo (≥4-word contiguous lift from the withheld raw post,
 *           not licensed by allowed_claims / permitted_source_spans)
 *         - name_leak (a person name when identity_policy does not authorize it)
 *         - over_length (exceeds the target_length word/sentence budget)
 *         - co_item_overflow (more than one beat when the block forbids co-items)
 *         - grave_implied_explicit_leak (states death/diagnosis the source only implied)
 *
 * Fails CLOSED: a line `passes` only if it may AIR (routeGate), is fully grounded
 * (groundingGate), and trips none of the added checks. Zero model calls.
 */
import { Packet, tierOf, groundingSourceFor, routeSourceFor } from "./packet";
import { groundingGate } from "./groundingGate";
import { routeGate } from "./routeGate";
import { buildAllowSet, normalizeToken, extractProperNouns } from "./extractSpecifics";

export interface LineViolation {
  /** stable id, e.g. "invented_emotion", "grounding:invented_proper_noun", "route:safe_template". */
  rule: string;
  span: string;
  detail: string;
}

export interface LineValidation {
  passes: boolean;
  /** "air" only when passes; else the safer disposition the route demands. */
  disposition: "air" | "safe_template" | "silence";
  violations: LineViolation[];
}

// ---- target_length budgets (asserted v0; revise with data) ----
const LENGTH_BUDGET: Record<Packet["target_length"], { words: number; sentences: number }> = {
  short: { words: 34, sentences: 2 },
  standard: { words: 60, sentences: 3 },
  anchor: { words: 95, sentences: 5 },
};

// Interior feeling ascribed to the subject (third-person), unless the source said it.
const EMOTION =
  /\b(thrilled|excited|ecstatic|elated|overjoyed|over the moon|can'?t wait|nervous|anxious|heartbroken|devastated|grieving|proud|emotional|relieved|terrified|scared|worried|buzzing|giddy)\b/i;

// Significance asserted as fact, unless the source said it.
const SIGNIFICANCE =
  /\b(big (night|day|moment)|huge (milestone|deal|moment)|life-?changing|once[- ]in[- ]a[- ]lifetime|means (so much|the world|everything)|you can feel how much|monumental|the moment (she|he|they)(?:'| ha)?ve been (waiting|working) for)\b/i;

// Co-item connectors — introducing a SECOND item in one beat.
const CO_ITEM =
  /\b(in other news|meanwhile|on another note|elsewhere|speaking of|and over (at|in)|also,|plus,)\b/i;

// Explicit death / diagnosis vocabulary (for grave-implied leak detection).
const GRAVE_EXPLICIT =
  /\b(passed away|passed on|died|death|funeral|memorial|diagnos(is|ed)|cancer|terminal|hospice|in the hospital|stillborn|miscarriage)\b/i;

function sentences(line: string): string[] {
  return line.split(/[.!?]+/).map((s) => s.trim()).filter(Boolean);
}
function words(line: string): string[] {
  return line.split(/\s+/).filter(Boolean);
}

/** Normalized contiguous n-grams of length n from a text. */
function ngrams(text: string, n: number): string[] {
  const toks = words(text).map(normalizeToken).filter(Boolean);
  const out: string[] = [];
  for (let i = 0; i + n <= toks.length; i++) out.push(toks.slice(i, i + n).join(" "));
  return out;
}

/** Does identity_policy authorize a name for THIS packet? (mirror of preflight rule #8). */
function nameAuthorized(p: Packet): boolean {
  const tier = tierOf(p);
  if (p.provenance === "official_source") return p.identity_policy?.entity_name_allowed === true;
  if (p.provenance === "third_party" || p.provenance === "unclear") return false;
  if (tier === "sensitive" || tier === "grave" || tier === "minor") return false;
  return p.identity_policy?.name_allowed === true;
}

export function validateLine(line: string, p: Packet): LineValidation {
  const violations: LineViolation[] = [];
  const allowText = [...p.allowed_claims, ...p.permitted_source_spans, p.source_name === "none" ? "" : p.source_name].join(" ");
  const allowSet = buildAllowSet([allowText]);
  const allowNorm = " " + words(allowText).map(normalizeToken).join(" ") + " ";

  // ---- (B) added line-level checks ----

  // invented emotion / significance (skip a hit the source itself licensed)
  const em = line.match(EMOTION);
  if (em && !EMOTION.test(allowText)) {
    violations.push({ rule: "invented_emotion", span: em[0], detail: "interior feeling ascribed to the subject, not in allowed_claims" });
  }
  const sig = line.match(SIGNIFICANCE);
  if (sig && !SIGNIFICANCE.test(allowText)) {
    violations.push({ rule: "invented_significance", span: sig[0], detail: "significance asserted as fact, not in allowed_claims" });
  }

  // raw-post echo: a ≥4-word contiguous lift from the withheld raw post not licensed
  const rawGrams = new Set(ngrams(p.audit_raw_post, 4));
  for (const g of ngrams(line, 4)) {
    if (rawGrams.has(g) && !allowNorm.includes(" " + g + " ")) {
      violations.push({ rule: "raw_post_echo", span: g, detail: "≥4-word lift from the withheld raw post, not in allowed_claims/spans" });
      break; // one is enough to reject
    }
  }

  // name leak: a person name when identity_policy does not authorize one
  if (!nameAuthorized(p)) {
    for (const { phrase, tokens } of extractProperNouns(line)) {
      const ungrounded = tokens.some((t) => !allowSet.has(t));
      // a proper noun the source didn't license, surfaced while names are forbidden
      if (ungrounded) {
        violations.push({ rule: "name_leak", span: phrase, detail: "proper name surfaced but identity_policy does not authorize a name" });
        break;
      }
    }
  }

  // over-length vs target_length budget
  const budget = LENGTH_BUDGET[p.target_length];
  const wc = words(line).length;
  const sc = sentences(line).length;
  if (wc > budget.words) violations.push({ rule: "over_length", span: `${wc} words`, detail: `exceeds ${p.target_length} budget (${budget.words} words)` });
  if (sc > budget.sentences) violations.push({ rule: "over_length", span: `${sc} sentences`, detail: `exceeds ${p.target_length} budget (${budget.sentences} sentences)` });

  // co-item overflow: a second item when the block forbids co-items
  if (!p.block_contract.co_items) {
    const co = line.match(CO_ITEM);
    if (co) violations.push({ rule: "co_item_overflow", span: co[0], detail: "introduces a second item; block_contract.co_items is false" });
  }

  // grave-implied → explicit leak: states death/diagnosis the source only implied
  if (p.category === "grave_implied") {
    const ge = line.match(GRAVE_EXPLICIT);
    if (ge && !allowNorm.includes(" " + normalizeToken(ge[0]) + " ") && p.plainly_stated_serious_fact === "none") {
      violations.push({ rule: "grave_implied_explicit_leak", span: ge[0], detail: "made the implied loss explicit; source did not state it" });
    }
  }

  // ---- (A) orchestrate existing gates ----

  // Box 8a grounding (against PERMITTED inputs only)
  const g = groundingGate(line, groundingSourceFor(p));
  if (!g.passes) {
    for (const v of g.violations) violations.push({ rule: `grounding:${v.rule}`, span: v.span, detail: v.detail });
  }

  // Box 8b route/treatment gate
  const rg = routeGate(line, tierOf(p), routeSourceFor(p));
  for (const r of rg.rules) violations.push({ rule: `route:${r.id}`, span: r.span, detail: "route deny-rule" });

  // disposition: the route is authoritative for whether freeform may air at all
  let disposition = rg.disposition;
  // if the route would air but added/grounding checks fired, it cannot air as-is
  if (disposition === "air" && violations.length > 0) disposition = "safe_template";
  const passes = disposition === "air" && violations.length === 0;

  return { passes, disposition, violations };
}
