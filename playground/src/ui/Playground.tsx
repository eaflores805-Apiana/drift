import {
  type Bucket,
  type Decision,
  type IngestedItem,
  type Listener,
} from "../data/schemas";
import { type ScoringSettings } from "../scoring/scoringEngine";
import { BucketColumn } from "./BucketColumn";
import { DebugPanel } from "./DebugPanel";
import { SliderPanel } from "./SliderPanel";

type Props = {
  listener: Listener;
  items: IngestedItem[];
  decisions: Decision[];
  warnings: string[];
  settings: ScoringSettings;
  onSettingsChange: (next: ScoringSettings) => void;
};

const BUCKETS: Bucket[] = ["drop", "ambient", "voiced", "expandable"];

export function Playground({
  listener,
  items,
  decisions,
  warnings,
  settings,
  onSettingsChange,
}: Props) {
  const itemById = new Map(items.map((i) => [i.id, i]));
  const grouped = new Map<Bucket, Decision[]>(BUCKETS.map((b) => [b, []]));
  for (const d of decisions) {
    grouped.get(d.bucket)!.push(d);
  }

  return (
    <div className="playground">
      <header className="playground-header">
        <h1>Drift Playground — Step 2: Deterministic Scorer + Sliders</h1>
        <div className="meta">
          <span>
            Listener: <strong>{listener.name}</strong>
            {listener.location ? ` (${listener.location})` : ""}
          </span>
          <span>·</span>
          <span>
            Items: <strong>{items.length}</strong>
          </span>
          <span>·</span>
          <span>
            Model calls: <strong>0</strong>
          </span>
        </div>
      </header>

      <SliderPanel settings={settings} onChange={onSettingsChange} />

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

      <DebugPanel
        items={items}
        decisions={decisions}
        warnings={warnings}
        settings={settings}
      />
    </div>
  );
}
