import {
  type Bucket,
  type Decision,
  type IngestedItem,
  type Listener,
} from "../data/schemas";
import { type Comparison } from "../evaluation/mismatchTypes";
import { type CacheStats } from "../meaning/cache";
import { type ScoringSettings } from "../scoring/scoringEngine";
import { BucketColumn } from "./BucketColumn";
import { DebugPanel } from "./DebugPanel";
import { SliderPanel } from "./SliderPanel";

type Props = {
  listener: Listener;
  items: IngestedItem[];
  decisions: Decision[];
  comparisons: Map<string, Comparison>;
  warnings: string[];
  settings: ScoringSettings;
  onSettingsChange: (next: ScoringSettings) => void;
  cacheStats: CacheStats;
  clientId: string;
  promptVersion: string;
  meaningReady: boolean;
};

const BUCKETS: Bucket[] = ["drop", "ambient", "voiced", "expandable"];

export function Playground({
  listener,
  items,
  decisions,
  comparisons,
  warnings,
  settings,
  onSettingsChange,
  cacheStats,
  clientId,
  promptVersion,
  meaningReady,
}: Props) {
  const itemById = new Map(items.map((i) => [i.id, i]));
  const grouped = new Map<Bucket, Decision[]>(BUCKETS.map((b) => [b, []]));
  for (const d of decisions) {
    grouped.get(d.bucket)!.push(d);
  }

  return (
    <div className="playground">
      <header className="playground-header">
        <h1>Drift Playground — Diagnostic Decision Board</h1>
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
            Live model calls: <strong>0</strong>
          </span>
          <span>·</span>
          <span>
            Meaning client: <strong>{clientId}</strong> ({promptVersion})
          </span>
          {!meaningReady && (
            <>
              <span>·</span>
              <span className="loading">loading meaning…</span>
            </>
          )}
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
            comparisonById={comparisons}
            settings={settings}
          />
        ))}
      </div>

      <DebugPanel
        items={items}
        decisions={decisions}
        comparisons={comparisons}
        warnings={warnings}
        settings={settings}
        cacheStats={cacheStats}
      />
    </div>
  );
}
