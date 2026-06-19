import listenerData from "../../../data/listener.json";
import seedFile from "../../../data/seed-items.json";
import {
  type IngestedItem,
  type Listener,
  IngestedItemSchema,
  ListenerSchema,
} from "../schemas";

type RawAccount = {
  account_id: string;
  name: string;
  source_type: string;
};

type RawItem = {
  id: string;
  account_id: string;
  source_name: string;
  audience_scope: string;
  timestamp: string;
  expires_at?: string | null;
  raw_text: string;
  entities?: Array<{ type: string; value: string }>;
  location?: string | null;
  novelty_key: string;
};

type RawSeedFile = {
  _meta?: unknown;
  accounts: RawAccount[];
  items: RawItem[];
};

export type SimulatedLoad = {
  listener: Listener;
  items: IngestedItem[];
  warnings: string[];
};

/**
 * Load the simulated corpus (listener + seed items) and normalize each item
 * into IngestedItem (Connection Point 1). Soft-warns on items that can't be
 * normalized (unknown account_id, schema mismatch); does not throw.
 */
export function loadSimulated(): SimulatedLoad {
  const warnings: string[] = [];

  const listener = ListenerSchema.parse(listenerData);

  const seed = seedFile as RawSeedFile;
  const accountMap = new Map(seed.accounts.map((a) => [a.account_id, a]));

  const items: IngestedItem[] = [];
  for (const raw of seed.items) {
    const account = accountMap.get(raw.account_id);
    if (!account) {
      warnings.push(`item ${raw.id}: unknown account_id '${raw.account_id}' — skipped`);
      continue;
    }
    const candidate = {
      id: raw.id,
      source_type: account.source_type,
      source_name: raw.source_name,
      account_id: raw.account_id,
      audience_scope: raw.audience_scope,
      timestamp: raw.timestamp,
      expires_at: raw.expires_at ?? null,
      raw_text: raw.raw_text,
      entities: raw.entities ?? [],
      location: raw.location ?? null,
      novelty_key: raw.novelty_key,
    };
    const parsed = IngestedItemSchema.safeParse(candidate);
    if (!parsed.success) {
      warnings.push(`item ${raw.id}: ${parsed.error.message}`);
      continue;
    }
    items.push(parsed.data);
  }

  return { listener, items, warnings };
}
