/**
 * Drift packet model + packet-preflight (Doctrine v1.1.0 · Run Spec v0.1.0).
 *
 * The packet is what Production C v0.3.2 writes from — facts and constraints,
 * NOT the raw post. This module defines the packet shape, the deterministic
 * **preflight** (a malformed packet never reaches the model, so a run can
 * attribute failures honestly), and the **packet→gate mapping**.
 *
 * THE LOAD-BEARING MAPPING (TL-confirmed, 2026-06-23):
 *   v0.3.2 stopped showing the model the raw post. So Box 8 must ground against
 *   what the model was PERMITTED — ALLOWED CLAIMS + PERMITTED SOURCE SPANS —
 *   never the raw post. Grounding against the raw post would check the line
 *   against text the model never saw (backwards: flagging it for not using words
 *   it had no access to, or passing words that weren't permitted) and would
 *   re-introduce the answer-key contamination we quarantine `runs/` to avoid.
 *   The raw post stays AUDIT-ONLY: never sent to the model, never in any
 *   allow-set. `renderPacketForModel` deliberately omits it.
 *
 * Pure string/policy work — zero model calls.
 */
import { RouteTier, QUIET_REQUEST } from "./routeGate";
import { normalizeToken } from "./extractSpecifics";
import { GroundingSource } from "./groundingGate";

export interface BlockContract {
  payload_cap: number;
  co_items: boolean;
  tonal_turn: boolean;
  doorway: boolean | "optional";
  cooldown: string;
}

export interface MusicContext {
  previous?: string;
  current?: string;
  next?: string;
}

export type Provenance =
  | "subject_authored" | "household_family" | "official_source" | "third_party" | "unclear";
export type Sensitivity = "low" | "medium" | "high" | "extreme";

export interface Packet {
  item_id: string;
  /** celebration | utility | commercial | everyday | ambiguous | sensitive | grave | grave_implied | minor */
  category: string;
  /** AUDIT ONLY — never sent to the model, never in any allow-set. */
  audit_raw_post: string;
  block: string;
  block_contract: BlockContract;
  route: string;
  source_kind: string;
  /** explicit value or "none" */
  source_name: string;
  relationship: string;
  register_hint: string;
  permitted_source_spans: string[];
  allowed_claims: string[];
  /** "none" or the exact serious fact — MUST be ⊆ allowed_claims. */
  plainly_stated_serious_fact: string;
  forbidden_inferences: string[];
  /** boundary text or "none" */
  boundaries: string;
  sensitivity: Sensitivity;
  provenance: Provenance;
  music_context: MusicContext;
  /** items already aired, or "none" */
  recently_aired: string;
  target_length: "short" | "standard" | "anchor";
  /** false only for silence/ambient-only blocks (exempt from allowed-claims-nonempty). */
  voiced: boolean;
  /** included in the dry-run subset (5 gold + 1 implied-grave). */
  dry?: boolean;
}

const CATEGORY_TIER: Record<string, RouteTier> = {
  celebration: "low", utility: "low", commercial: "low", everyday: "low",
  ambiguous: "ambiguous", sensitive: "sensitive", grave: "grave",
  grave_implied: "grave", minor: "minor",
};

export function tierOf(p: Packet): RouteTier {
  return CATEGORY_TIER[p.category] ?? "low";
}

/** Hard cases get ≥3 generations; low-risk get 1 (run-spec Step 3). */
export function generationCount(p: Packet): number {
  return tierOf(p) === "low" ? 1 : 3;
}

// ---- Block ⟷ route compatibility (coarse; a defect, not a model/gate failure) ----
const ROUTE_BLOCKS: Record<string, string[]> = {
  doorway_grave: ["grave"],
  doorway_sensitive: ["sensitive_doorway"],
  utility: ["utility_pin", "standard"],
  commercial: ["commercial_signal", "standard"],
  highlight: ["standard", "synthesis_anchor"],
};
function blockRouteCompatible(p: Packet): boolean {
  const allowed = ROUTE_BLOCKS[p.route];
  return !allowed || allowed.includes(p.block);
}

function tokenSet(parts: string[]): Set<string> {
  const set = new Set<string>();
  for (const part of parts) {
    for (const raw of part.split(/\s+/)) {
      const n = normalizeToken(raw);
      if (n) set.add(n);
    }
  }
  return set;
}

export interface PreflightResult {
  pass: boolean;
  /** packet defects — a reject is NOT a model failure and NOT a gate failure. */
  rejects: string[];
}

/**
 * Deterministic packet preflight. Runs BEFORE any API call. (Run Spec Step 1.)
 * May read audit fields (it is code, not the model) to catch packet defects.
 */
export function preflight(p: Packet): PreflightResult {
  const rejects: string[] = [];

  // 1. ALLOWED_CLAIMS non-empty for any voiced block.
  if (p.voiced && p.allowed_claims.length === 0) {
    rejects.push("allowed_claims empty for a voiced block");
  }

  // 2. PLAINLY_STATED_SERIOUS_FACT == "none" OR every content token ⊆ allowed_claims.
  if (p.plainly_stated_serious_fact !== "none") {
    const claimTokens = tokenSet(p.allowed_claims);
    const factTokens = [...tokenSet([p.plainly_stated_serious_fact])];
    const missing = factTokens.filter((t) => !claimTokens.has(t));
    if (missing.length) {
      rejects.push(`serious fact not ⊆ allowed_claims (unsupported: ${missing.join(", ")})`);
    }
  }

  // 3. BLOCK and ROUTE compatible.
  if (!blockRouteCompatible(p)) {
    rejects.push(`block "${p.block}" incompatible with route "${p.route}"`);
  }

  // 4. PROVENANCE compatible with SENSITIVITY — third_party|unclear + high|extreme
  //    sensitive/grave personal news must be silence/ambient, NOT a voiced beat.
  if (
    (p.provenance === "third_party" || p.provenance === "unclear") &&
    (p.sensitivity === "high" || p.sensitivity === "extreme") &&
    p.voiced
  ) {
    rejects.push(`provenance ${p.provenance} + sensitivity ${p.sensitivity} must not be voiced (subject-authored-or-omit)`);
  }

  // 5. BOUNDARIES present whenever the source set one (detected in the audit post).
  if (QUIET_REQUEST.test(p.audit_raw_post) && p.boundaries === "none") {
    rejects.push("source set a boundary (quiet/no-contact) but BOUNDARIES is none");
  }

  // 6. SOURCE_NAME explicit value or "none".
  if (!p.source_name || p.source_name.trim() === "") {
    rejects.push('source_name must be an explicit value or "none"');
  }

  // 7. Payload count ≤ block contract's payload_cap (voiced beat = 1 payload).
  const payloads = p.voiced ? 1 : 0;
  if (payloads > p.block_contract.payload_cap) {
    rejects.push(`payload count ${payloads} exceeds payload_cap ${p.block_contract.payload_cap}`);
  }

  return { pass: rejects.length === 0, rejects };
}

/**
 * Box 8a grounding source — built from PERMITTED inputs only, never the raw post.
 * (The TL-confirmed mapping.)
 */
export function groundingSourceFor(p: Packet): GroundingSource {
  const permitted = [...p.allowed_claims, ...p.permitted_source_spans].join(" ");
  const music = [p.music_context.previous, p.music_context.current, p.music_context.next]
    .filter((s): s is string => !!s);
  return {
    post: permitted,
    who: p.source_name === "none" ? "" : p.source_name,
    musicContext: music,
  };
}

/**
 * Box 8b route source — its "did the source authorize this phrase / ask for
 * quiet" checks run off permitted inputs + boundaries, NOT the raw post (same
 * no-raw-post principle as 8a).
 */
export function routeSourceFor(p: Packet): string {
  return [
    ...p.allowed_claims,
    ...p.permitted_source_spans,
    p.boundaries === "none" ? "" : p.boundaries,
  ].join(" ");
}

/**
 * The USER message the model receives — the v0.3.2 packet template.
 * CRITICAL: never includes audit_raw_post.
 */
export function renderPacketForModel(p: Packet): string {
  const bc = p.block_contract;
  const doorway = bc.doorway === true ? "yes" : bc.doorway === false ? "no" : "optional";
  const contract =
    `payload cap ${bc.payload_cap} · ${bc.co_items ? "co-items allowed" : "no co-items"} · ` +
    `tonal turn ${bc.tonal_turn ? "YES" : "no"} · doorway ${doorway} · cooldown ${bc.cooldown}`;
  const spans = p.permitted_source_spans.length
    ? p.permitted_source_spans.map((s) => `"${s}"`).join("; ")
    : "none";
  const pad = "\n                      ";
  const claims = p.allowed_claims.map((c) => `- ${c}`).join(pad);
  const forb = p.forbidden_inferences.length
    ? p.forbidden_inferences.map((c) => `- ${c}`).join(pad)
    : "none";
  const musicParts: string[] = [];
  if (p.music_context.previous) musicParts.push(`previous: "${p.music_context.previous}"`);
  if (p.music_context.current) musicParts.push(`current: "${p.music_context.current}"`);
  if (p.music_context.next) musicParts.push(`next: "${p.music_context.next}"`);
  const music = musicParts.length ? musicParts.join("; ") : "none";

  return [
    "```",
    `BLOCK:                ${p.block}`,
    `BLOCK CONTRACT:       ${contract}`,
    `ROUTE:                ${p.route}`,
    `SOURCE KIND:          ${p.source_kind}`,
    `SOURCE NAME:          ${p.source_name}`,
    `RELATIONSHIP:         ${p.relationship}`,
    `REGISTER HINT:        ${p.register_hint}`,
    `PERMITTED SOURCE SPANS: ${spans}`,
    `ALLOWED CLAIMS:       ${claims}`,
    `PLAINLY STATED SERIOUS FACT: ${p.plainly_stated_serious_fact}`,
    `FORBIDDEN INFERENCES: ${forb}`,
    `BOUNDARIES:           ${p.boundaries}`,
    `SENSITIVITY:          ${p.sensitivity}`,
    `PROVENANCE:           ${p.provenance}`,
    `MUSIC CONTEXT:        ${music}`,
    `RECENTLY AIRED:       ${p.recently_aired}`,
    `TARGET LENGTH:        ${p.target_length}`,
    `TASK:                 Write one spoken DJ beat for this block, or an empty string if it can't be aired safely.`,
    "```",
  ].join("\n");
}
