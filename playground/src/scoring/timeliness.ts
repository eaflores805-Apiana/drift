/**
 * Deterministic timeliness from `expires_at` AND `timestamp` relative to a
 * fixed "now". Per BUILD.md hard check #2 and the 2026-06-19 team patch:
 *
 *   - If `expires_at` is present, value is driven by expiry (soon/active/
 *     expired buckets).
 *   - If `expires_at` is null/missing, value decays by **post age** so that
 *     no-expiry does not mean eternally fresh.
 *
 * Higher value = more urgent / fresher. Past-expired items get 0.
 * The "now" is fixed for reproducibility across runs.
 */

export const FIXED_NOW_MS = new Date("2026-06-19T13:00:00").getTime();

export type TimelinessResult = {
  value: number;
  hours_until_expiry: number | null; // null when no expiry
  hours_since_post: number;          // always populated
  expired: boolean;
  decay_band: string;                // which band produced the value
};

export function timeliness(
  timestamp: string,
  expires_at: string | null | undefined,
  baseline: number,
  nowMs: number = FIXED_NOW_MS
): TimelinessResult {
  const postedMs = new Date(timestamp).getTime();
  const hoursSincePost = (nowMs - postedMs) / 3.6e6;

  // Case A: has expiry — drive value from time-until-expiry
  if (expires_at) {
    const expiryMs = new Date(expires_at).getTime();
    const hoursUntilExpiry = (expiryMs - nowMs) / 3.6e6;
    if (hoursUntilExpiry <= 0) {
      return {
        value: 0,
        hours_until_expiry: hoursUntilExpiry,
        hours_since_post: hoursSincePost,
        expired: true,
        decay_band: "expired",
      };
    }
    let value: number;
    let band: string;
    if (hoursUntilExpiry <= 6) {
      value = 1.0;
      band = "≤6h to expiry";
    } else if (hoursUntilExpiry <= 24) {
      value = 0.85;
      band = "≤24h to expiry";
    } else if (hoursUntilExpiry <= 72) {
      value = 0.55;
      band = "≤72h to expiry";
    } else {
      value = 0.35;
      band = ">72h to expiry";
    }
    return {
      value,
      hours_until_expiry: hoursUntilExpiry,
      hours_since_post: hoursSincePost,
      expired: false,
      decay_band: band,
    };
  }

  // Case B: no expiry — decay by post age. baseline tunes the "neutral" value
  // for recent items; older posts decay relative to it.
  let value: number;
  let band: string;
  if (hoursSincePost <= 24) {
    value = baseline;
    band = "≤24h since post (neutral)";
  } else if (hoursSincePost <= 72) {
    value = baseline * 0.7;
    band = "≤72h since post";
  } else if (hoursSincePost <= 168) {
    value = baseline * 0.4;
    band = "≤7d since post";
  } else {
    value = baseline * 0.2;
    band = ">7d since post";
  }
  return {
    value,
    hours_until_expiry: null,
    hours_since_post: hoursSincePost,
    expired: false,
    decay_band: band,
  };
}
