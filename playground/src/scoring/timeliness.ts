/**
 * Deterministic timeliness from expires_at relative to a fixed "now".
 * Per BUILD.md hard check #2: same-day events/promos must behave
 * differently than stale or unexpiring posts.
 *
 * Higher value = more urgent. Items with no expires_at fall back to a
 * baseline (slider-controllable). Past-expired items get 0.
 *
 * The "now" is fixed for reproducibility across runs.
 */

export const FIXED_NOW_MS = new Date("2026-06-19T13:00:00").getTime();

export type TimelinessResult = {
  value: number;
  hours_until_expiry: number | null; // null when no expiry
  expired: boolean;
};

export function timeliness(
  expires_at: string | null | undefined,
  baseline: number,
  nowMs: number = FIXED_NOW_MS
): TimelinessResult {
  if (!expires_at) {
    return { value: baseline, hours_until_expiry: null, expired: false };
  }
  const expiry = new Date(expires_at).getTime();
  const hours = (expiry - nowMs) / 3.6e6;
  if (hours <= 0) return { value: 0, hours_until_expiry: hours, expired: true };
  let value: number;
  if (hours <= 6) value = 1.0;
  else if (hours <= 24) value = 0.85;
  else if (hours <= 72) value = 0.55;
  else value = 0.35;
  return { value, hours_until_expiry: hours, expired: false };
}
