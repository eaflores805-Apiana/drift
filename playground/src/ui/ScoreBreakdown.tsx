import { type Decision } from "../data/schemas";

type Props = { decision: Decision };

export function ScoreBreakdown({ decision }: Props) {
  const b = decision.score_breakdown;
  if (Object.keys(b).length === 0) return null;
  return (
    <details className="breakdown">
      <summary>
        score <strong>{decision.score.toFixed(3)}</strong> · {decision.bucket}
      </summary>
      <table className="breakdown-table">
        <tbody>
          {Object.entries(b).map(([k, v]) => (
            <tr key={k}>
              <td className="key">{k}</td>
              <td className="val">{Number(v).toFixed(3)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="breakdown-reason">{decision.reason}</div>
    </details>
  );
}
