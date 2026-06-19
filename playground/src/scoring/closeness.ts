import { type IngestedItem, type Listener } from "../data/schemas";

/**
 * Closeness is a LOOKUP from listener.closeness_map keyed by account_id —
 * never a guess. Per Eng1 R1 and BUILD.md hard check #1.
 */
const TIER_VALUE: Record<string, number> = {
  close: 0.9,
  known: 0.5,
  acquaintance: 0.4,
  distant_family: 0.5,
  followed: 0.3,
};

const DEFAULT_CLOSENESS = 0.2; // unknown sources: barely-there closeness

export type ClosenessResult = {
  value: number;
  tier: string;
  lookup_key: string;
};

export function closeness(item: IngestedItem, listener: Listener): ClosenessResult {
  const key = item.account_id ?? "";
  const tier = listener.closeness_map[key] ?? "unknown";
  const value = TIER_VALUE[tier] ?? DEFAULT_CLOSENESS;
  return { value, tier, lookup_key: key };
}
