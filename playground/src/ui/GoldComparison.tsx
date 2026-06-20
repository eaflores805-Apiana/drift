import { type Comparison } from "../evaluation/mismatchTypes";

type Props = {
  comparison: Comparison;
};

/**
 * Neutral gold-vs-engine comparison panel.
 *
 * Per team ruling: gold-label agreement is a MEASUREMENT axis, not a
 * success/failure status. Uses a neutral palette (no green/yellow/red)
 * and never reuses the safety classes.
 */
export function GoldComparison({ comparison }: Props) {
  // Nothing to show: no gold AND no heuristic flag.
  if (!comparison.hasGold && comparison.mismatch === null) return null;

  if (comparison.hasGold) {
    return (
      <div className={`gold-comparison gold-${comparison.agreement ? "agreement" : "mismatch"}`}>
        <div className="gold-row">
          <span className="gold-key">Gold:</span>
          <span className="gold-val">{comparison.goldBucket}</span>
          <span className="gold-sep">·</span>
          <span className="gold-key">Engine:</span>
          <span className="gold-val">{comparison.engineBucket}</span>
        </div>
        <div className="gold-comparison-line">
          Comparison:{" "}
          {comparison.agreement ? (
            <span className="gold-agree">agreement</span>
          ) : (
            <>
              <span className="gold-mismatch-label">mismatch</span>
              {comparison.mismatch && (
                <>
                  {" — "}
                  <code className="gold-mismatch-type">{comparison.mismatch}</code>
                </>
              )}
            </>
          )}
        </div>
        {comparison.reason && <div className="gold-reason">{comparison.reason}</div>}
      </div>
    );
  }

  // Unlabeled with a heuristic flag — neutral "review needed" panel.
  return (
    <div className="gold-comparison gold-review-needed">
      <div className="gold-row">
        <span className="gold-key">Gold:</span>
        <span className="gold-val gold-val-missing">not labeled</span>
        <span className="gold-sep">·</span>
        <span className="gold-key">Engine:</span>
        <span className="gold-val">{comparison.engineBucket}</span>
      </div>
      <div className="gold-comparison-line">
        Comparison: <span className="gold-review-label">review needed</span>
        {" — "}
        <code className="gold-mismatch-type">{comparison.mismatch}</code>
      </div>
      <div className="gold-reason">{comparison.reason}</div>
    </div>
  );
}
