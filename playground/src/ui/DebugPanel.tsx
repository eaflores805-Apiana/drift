import { type Decision, type IngestedItem } from "../data/schemas";
import { type Comparison, type MismatchType } from "../evaluation/mismatchTypes";
import { type CacheStats } from "../meaning/cache";
import { type ScoringSettings } from "../scoring/scoringEngine";

type Props = {
  items: IngestedItem[];
  decisions: Decision[];
  comparisons: Map<string, Comparison>;
  warnings: string[];
  settings: ScoringSettings;
  cacheStats: CacheStats;
};

export function DebugPanel({
  items,
  decisions,
  comparisons,
  warnings,
  settings,
  cacheStats,
}: Props) {
  const dropped = decisions.filter((d) => d.bucket === "drop");
  const summary = summarizeComparisons(comparisons);

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
        <div className="comparison-summary">
          Gold (neutral):{" "}
          <strong>{summary.labeled}</strong> labeled ·{" "}
          <strong>{summary.agreements}</strong> agree ·{" "}
          <strong>{summary.mismatches}</strong> mismatch ·{" "}
          <strong>{summary.reviewNeeded}</strong> review-needed
          {summary.mismatchTypes.size > 0 && (
            <div className="comparison-types">
              {Array.from(summary.mismatchTypes.entries()).map(([type, count]) => (
                <span key={type} className="comparison-type">
                  <code>{type}</code>: {count}
                </span>
              ))}
            </div>
          )}
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

function summarizeComparisons(comparisons: Map<string, Comparison>): {
  labeled: number;
  agreements: number;
  mismatches: number;
  reviewNeeded: number;
  mismatchTypes: Map<MismatchType, number>;
} {
  let labeled = 0;
  let agreements = 0;
  let mismatches = 0;
  let reviewNeeded = 0;
  const types = new Map<MismatchType, number>();
  for (const c of comparisons.values()) {
    if (c.hasGold) {
      labeled++;
      if (c.agreement) agreements++;
      else mismatches++;
    } else if (c.mismatch === "label_review_needed") {
      reviewNeeded++;
    }
    if (c.mismatch) {
      types.set(c.mismatch, (types.get(c.mismatch) ?? 0) + 1);
    }
  }
  return { labeled, agreements, mismatches, reviewNeeded, mismatchTypes: types };
}
