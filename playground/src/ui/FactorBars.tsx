import { type Decision } from "../data/schemas";
import { type ScoringSettings } from "../scoring/scoringEngine";

type Props = {
  decision: Decision;
  settings: ScoringSettings;
};

/**
 * Factor bars per item — v3 decomposition: magnitude, closeness,
 * relevance, timeliness, confidence, sensitivity_damper, focus weight,
 * base, value. The effective_score bar shows the item's route-local
 * voiced threshold and the (global) expandable threshold as vertical
 * ticks. Items on routes with no voiced bar (utility per ADR J3,
 * silent fail-closed) render without the voice tick.
 */
export function FactorBars({ decision, settings }: Props) {
  const b = decision.score_breakdown;
  if (Object.keys(b).length === 0) return null;

  const factors: Array<{ key: string; value: number; max: number }> = [
    { key: "magnitude", value: b.magnitude ?? 0, max: 1 },
    { key: "closeness", value: b.closeness ?? 0, max: 1 },
    { key: "relevance", value: b.relevance ?? 0, max: 1 },
    { key: "timeliness", value: b.timeliness ?? 0, max: 1 },
    { key: "confidence", value: b.confidence ?? 0, max: 1 },
    { key: "sensitivity_damper", value: b.sensitivity_damper ?? 1, max: 1 },
    { key: "focus_weight", value: b.focus_weight ?? 1, max: 2 },
    { key: "base", value: b.base ?? 0, max: 1 },
    { key: "value", value: b.value ?? 0, max: 1 },
  ];

  const routeThreshold = b.route_threshold; // undefined when route has no voiced bar
  return (
    <div className="factor-bars">
      {factors.map((f) => (
        <FactorRow key={f.key} label={f.key} value={f.value} max={f.max} />
      ))}
      <ScoreRow
        score={decision.score}
        route={decision.route}
        routeThreshold={routeThreshold}
        expandableThreshold={settings.expandableThreshold}
      />
    </div>
  );
}

function FactorRow({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = clampPct((value / max) * 100);
  return (
    <div className="factor-row">
      <span className="factor-label">{label}</span>
      <div className="factor-bar">
        <div className="factor-bar-fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="factor-value">{value.toFixed(3)}</span>
    </div>
  );
}

function ScoreRow({
  score,
  route,
  routeThreshold,
  expandableThreshold,
}: {
  score: number;
  route: Decision["route"];
  routeThreshold: number | undefined;
  expandableThreshold: number;
}) {
  const pct = clampPct(score * 100);
  const expPct = clampPct(expandableThreshold * 100);
  const voicePct =
    routeThreshold !== undefined ? clampPct(routeThreshold * 100) : null;
  return (
    <div className="factor-row factor-row-score">
      <span className="factor-label">effective_score {route ? `(${route})` : ""}</span>
      <div className="factor-bar factor-bar-score">
        <div className="factor-bar-fill factor-bar-fill-score" style={{ width: `${pct}%` }} />
        {voicePct !== null ? (
          <div
            className="factor-bar-tick factor-bar-tick-voice"
            style={{ left: `${voicePct}%` }}
            title={`voice threshold ${routeThreshold!.toFixed(3)} (${route} route)`}
          />
        ) : null}
        <div
          className="factor-bar-tick factor-bar-tick-expandable"
          style={{ left: `${expPct}%` }}
          title={`expandable threshold ${expandableThreshold.toFixed(2)}`}
        />
      </div>
      <span className="factor-value">{score.toFixed(3)}</span>
    </div>
  );
}

function clampPct(p: number): number {
  if (Number.isNaN(p)) return 0;
  if (p < 0) return 0;
  if (p > 100) return 100;
  return p;
}
