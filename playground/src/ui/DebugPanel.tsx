import { type Decision, type IngestedItem } from "../data/schemas";

type Props = {
  items: IngestedItem[];
  decisions: Decision[];
  warnings: string[];
};

export function DebugPanel({ items, decisions, warnings }: Props) {
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
          Model calls this run: <strong>0</strong>
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
