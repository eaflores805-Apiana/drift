import { type IngestedItem } from "../data/schemas";
import { type ModelDerived } from "../meaning/types";
import { type Route } from "./routes";
import { hasNearTermExpiry } from "./routeClassifier";

/**
 * Treatment BANDS (ADR J4) — a refinement layer that sits between the
 * structural route and the voiced bar.
 *
 * WHY THIS EXISTS (the World-Ventura finding):
 * The first brain run on a realistic friend-feed exposed a route-taxonomy
 * gap, not a generation bug. The old classifier sent EVERY low-sensitivity
 * personal post to "highlight" (gated by the community-pride bar 0.532),
 * which buried ordinary personal wins (Nico's first podium 0.528, Lena's
 * gallery opening 0.527 — under the bar), while routing every medium-
 * sensitivity personal post to "doorway" (bar 0.100), which over-voiced
 * routine venting (corrupted files, kid logistics). Net inversion: the DJ
 * aired mild stress but stayed silent on genuine good news.
 *
 * The fix (TL direction + PO refinements, 2026-06-26): split the personal
 * branches into treatment bands so ordinary wins get their own lane with a
 * bar calibrated to them, and routine chatter / mild stress are pushed to
 * ambient EXCLUSION bands rather than competing for the mic.
 *
 *   Route semantics (unchanged):
 *     highlight = positive / celebratory / pride family
 *     doorway   = gentle / sensitive / relationship-check family
 *     utility   = useful / time-bound
 *     silent    = fail-closed default (no voiced bar)
 *
 *   Bands (this file):
 *     positive_personal_touch  highlight-family. Ordinary personal wins
 *                              the old community-pride bar buried. VOICED-
 *                              eligible on its own (lower) bar.
 *     community_highlight      community / civic / brand-pride. Keeps the
 *                              fitted highlight bar (0.532).
 *     doorway_sensitive        genuine sensitive / relationship-check
 *                              moments. Keeps the doorway bar (0.100).
 *     mild_stress              EXCLUSION/ambient. Routine medium-sensitivity
 *                              venting — kept off the mic unless substantive
 *                              enough to be a real doorway moment.
 *     everyday_texture         EXCLUSION/ambient. Low-value personal chatter.
 *     utility / silent         as before; no voiced bar today.
 *
 * Decision class: ADR J4 — ESCALATE-IF-CHANGED / Class 1 (it changes what
 * may be voiced). Route assignment stays structural; the band thresholds
 * are tunable AND are demo scaffolding (see DEFAULT_BAND_THRESHOLDS).
 *
 * Determinism + firewall: reads only structural item fields + the meaning
 * pass output (category text is NOT switched on — it is free-form, see the
 * World-Ventura run). No closeness here: per PO refinement #1, closeness
 * already lives in the score and must NOT be re-applied as a second gate
 * (no double-damp). Closeness modulates TREATMENT DEPTH at the packet stage,
 * not band qualification here.
 */
export type Band =
  | "doorway_sensitive"
  | "mild_stress"
  | "utility"
  | "community_highlight"
  | "positive_personal_touch"
  | "everyday_texture"
  | "silent";

/**
 * Magnitude floor separating a genuine personal milestone (podium, opening,
 * cert pass, pitch win, reading) from everyday texture (coffee runs, kid
 * anecdotes, "morning sesh was clean"). On World Ventura genuine wins sit at
 * mag 0.45–0.65 and texture at ≤0.35; 0.40 sits in the wide gap between them.
 *
 * ⚠ FITTED ON WORLD VENTURA ONLY — INVALID FOR PRODUCTION.
 * RE-DERIVE ON A HUMAN / REALISTIC CORPUS before any real-feed use.
 */
export const POSITIVE_TOUCH_MAG_FLOOR = 0.4;

/**
 * Substance floor that lets a medium-sensitivity personal post ESCALATE
 * from mild_stress (ambient) up to doorway_sensitive — a genuinely weighty
 * sensitive moment, not routine venting. Keyed on magnitude (substance),
 * deliberately NOT on closeness: a second closeness gate would double-damp
 * (closeness is already in the score) and per PO refinement #1 requires team
 * sign-off before coding. On World Ventura no medium-sensitivity personal
 * post reaches this, so it escalates nothing here; it future-proofs against
 * burying a substantive sensitive moment as mere "mild stress".
 *
 * ⚠ FITTED ON WORLD VENTURA ONLY — INVALID FOR PRODUCTION.
 * RE-DERIVE ON A HUMAN / REALISTIC CORPUS before any real-feed use.
 */
export const MILD_STRESS_DOORWAY_MAG = 0.5;

export function classifyBand(item: IngestedItem, meaning: ModelDerived): Band {
  const src = item.source_type;
  const personal = src === "friend" || src === "family" || src === "coworker";

  // (1) High-sensitivity personal → genuine doorway. Real emotional /
  //     relationship weight ("rough week, holding my people close").
  if (personal && meaning.sensitivity === "high") {
    return "doorway_sensitive";
  }

  // (2) Medium-sensitivity personal → mild_stress (ambient) by default.
  //     Routine venting (corrupted files, "the pier is SO crowded") is kept
  //     off the mic. Escalates to doorway only when substantive enough.
  if (personal && meaning.sensitivity === "medium") {
    return meaning.magnitude >= MILD_STRESS_DOORWAY_MAG ? "doorway_sensitive" : "mild_stress";
  }

  // (3) Utility — time-bound actionable (mirrors the route classifier).
  if (src === "calendar" || src === "weather") {
    return "utility";
  }
  if ((src === "news" || src === "local_org" || src === "brand") && hasNearTermExpiry(item)) {
    return "utility";
  }

  // (4) Community / civic / brand-pride (no near-term expiry) → the existing
  //     community-pride highlight band at the fitted 0.532 bar.
  if (src === "news" || src === "local_org" || src === "brand") {
    return "community_highlight";
  }

  // (5) Low-sensitivity personal → positive milestone vs everyday texture.
  if (personal && meaning.sensitivity === "low") {
    return meaning.magnitude >= POSITIVE_TOUCH_MAG_FLOOR
      ? "positive_personal_touch"
      : "everyday_texture";
  }

  // (6) Fail-closed default (creator is parked per meta-spec; anything else).
  return "silent";
}

/**
 * Band → structural Route. Route stays the 4-value gold vocabulary; bands
 * are a finer treatment grouping over it. positive_personal_touch is a
 * HIGHLIGHT-family band (it shares the highlight treatment register) but
 * carries its own threshold via DEFAULT_BAND_THRESHOLDS.
 */
export const BAND_ROUTE: Record<Band, Route> = {
  doorway_sensitive: "doorway",
  mild_stress: "silent",
  utility: "utility",
  community_highlight: "highlight",
  positive_personal_touch: "highlight",
  everyday_texture: "silent",
  silent: "silent",
};

/**
 * Band-specific voiced thresholds. A band listed here uses this value; a
 * band NOT listed falls back to the route threshold for BAND_ROUTE[band]
 * (so community_highlight→0.532, doorway_sensitive→0.100, and the exclusion
 * bands → route "silent" → no voiced bar → always ambient).
 *
 * positive_personal_touch = 0.30 — derived from the band's own magnitude
 * floor (0.40) under typical damping, NOT fitted to any single item: the
 * mag≥0.40 membership gate does the selecting; this bar is a light backstop
 * against heavily time-decayed / low-confidence stragglers. On World Ventura
 * the genuine wins cluster at 0.365–0.528 and the nearest excluded items are
 * in OTHER bands (everyday_texture), so nothing sits between 0.30 and the
 * cluster — this is not threading two items.
 *
 * ⚠ FITTED ON WORLD VENTURA ONLY — INVALID FOR PRODUCTION.
 * RE-DERIVE ON A HUMAN / REALISTIC CORPUS before any real-feed use.
 */
export type BandThresholds = Partial<Record<Band, number>>;

export const DEFAULT_BAND_THRESHOLDS: BandThresholds = {
  positive_personal_touch: 0.3,
};
