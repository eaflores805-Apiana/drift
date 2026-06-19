import { type Decision, type IngestedItem } from "../data/schemas";
import { type CacheStats } from "../meaning/cache";
import { type ScoringSettings } from "../scoring/scoringEngine";

type Props = {
  items: IngestedItem[];
  decisions: Decision[];
  warnings: string[];
  settings: ScoringSettings;
  cacheStats: CacheStats;
};

export function DebugPanel({ items, decisions, warnings, settings, cacheStats }: Props) {
  const dropped = decisions.filter((d) => d.bucket === "drop");
  return (
    <details className="debug" open>
      <summary>Debug</summary>
      <div className="debug-body">
        <div>
          Total items loaded: <strong>{items.length}</strong>
        </div>
        <div>
          Dropped by consent gate: <strong>{dropped.length}</strong>
        </div>
        <div>
          Live model calls this run: <strong>0</strong>
        </div>
        <div>
          Meaning cache — size: <strong>{cacheStats.size}</strong>{" "}
          · hits: <strong>{cacheStats.hits}</strong>{" "}
          · misses: <strong>{cacheStats.misses}</strong>
        </div>
        <div>
          Voice threshold: <strong>{settings.voiceThreshold.toFixed(2)}</strong>{" "}
          · Expandable: <strong>{settings.expandableThreshold.toFixed(2)}</strong>{" "}
          · Novelty window: <strong>{settings.noveltyWindowHours}h</strong>
        </div>
        {warnings.length > 0 && (
          <div className="warnings">
            <div className="warnings-title">Load warnings:</div>
            <ul>
              {warnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </div>
        )}
        <details>
          <summary>Consent-gate drops ({dropped.length})</summary>
          <ul>
            {dropped.map((d) => (
              <li key={d.item_id}>
                <strong>{d.item_id}</strong>:{" "}
                {d.safety_check.rejected_reason ?? "(no reason given)"}
              </li>
            ))}
          </ul>
        </details>
      </div>
    </details>
  );
}
