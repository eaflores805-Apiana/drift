import {
  type Bucket,
  type Decision,
  type IngestedItem,
  type Listener,
} from "../data/schemas";
import { BucketColumn } from "./BucketColumn";
import { DebugPanel } from "./DebugPanel";

type Props = {
  listener: Listener;
  items: IngestedItem[];
  decisions: Decision[];
  warnings: string[];
};

const BUCKETS: Bucket[] = ["drop", "ambient", "voiced", "expandable"];

export function Playground({ listener, items, decisions, warnings }: Props) {
  const itemById = new Map(items.map((i) => [i.id, i]));
  const grouped = new Map<Bucket, Decision[]>(BUCKETS.map((b) => [b, []]));
  for (const d of decisions) {
    grouped.get(d.bucket)!.push(d);
  }

  return (
    <div className="playground">
      <header className="playground-header">
        <h1>Drift Playground — Step 1: Shell + Consent Gate</h1>
        <div className="meta">
          <span>
            Listener: <strong>{listener.name}</strong>
            {listener.location ? ` (${listener.location})` : ""}
          </span>
          <span>·</span>
          <span>
            Items loaded: <strong>{items.length}</strong>
          </span>
          <span>·</span>
          <span>
            Model calls: <strong>0</strong>
          </span>
        </div>
      </header>

      <div className="columns">
        {BUCKETS.map((bucket) => (
          <BucketColumn
            key={bucket}
            bucket={bucket}
            decisions={grouped.get(bucket) ?? []}
            itemById={itemById}
          />
        ))}
      </div>

      <DebugPanel items={items} decisions={decisions} warnings={warnings} />
    </div>
  );
}
