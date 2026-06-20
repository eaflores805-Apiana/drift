import { type Decision } from "../data/schemas";
import { type ScoringSettings } from "../scoring/scoringEngine";

type Props = {
  decision: Decision;
  settings: ScoringSettings;
};

/**
 * Factor bars per item — magnitude, closeness, relevance, timeliness,
 * focus weight, raw, effective. Effective is the score bar; it shows the
 * voice and expandable thresholds as vertical ticks so the team can see
 * whether an item is barely under or nowhere close.
 */
export function FactorBars({ decision, settings }: Props) {
  const b = decision.score_breakdown;
  if (Object.keys(b).length === 0) return null;

  const factors: Array<{ key: string; value: number; max: number }> = [
    { key: "magnitude", value: b.magnitude ?? 0, max: 1 },
    { key: "closeness", value: b.closeness ?? 0, max: 1 },
    { key: "relevance", value: b.relevance ?? 0, max: 1 },
    { key: "timeliness", value: b.timeliness ?? 0, max: 1 },
    { key: "focus_weight", value: b.focus_weight ?? 1, max: 2 },
    { key: "raw_score", value: b.raw_score ?? 0, max: 1 },
  ];

  return (
    <div className="factor-bars">
      {factors.map((f) => (
        <FactorRow key={f.key} label={f.key} value={f.value} max={f.max} />
      ))}
      <ScoreRow
        score={decision.score}
        voiceThreshold={settings.voiceThreshold}
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
  voiceThreshold,
  expandableThreshold,
}: {
  score: number;
  voiceThreshold: number;
  expandableThreshold: number;
}) {
  const pct = clampPct(score * 100);
  const voicePct = clampPct(voiceThreshold * 100);
  const expPct = clampPct(expandableThreshold * 100);
  return (
    <div className="factor-row factor-row-score">
      <span className="factor-label">effective_score</span>
      <div className="factor-bar factor-bar-score">
        <div className="factor-bar-fill factor-bar-fill-score" style={{ width: `${pct}%` }} />
        <div
          className="factor-bar-tick factor-bar-tick-voice"
          style={{ left: `${voicePct}%` }}
          title={`voice threshold ${voiceThreshold.toFixed(2)}`}
        />
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
