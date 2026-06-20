import { type Decision, type IngestedItem } from "../data/schemas";
import { type Comparison } from "../evaluation/mismatchTypes";
import { type ScoringSettings } from "../scoring/scoringEngine";
import { FactorBars } from "./FactorBars";
import { GoldComparison } from "./GoldComparison";
import { PipelineStrip } from "./PipelineStrip";

type Props = {
  item: IngestedItem;
  decision: Decision;
  comparison: Comparison;
  settings: ScoringSettings;
};

export function ItemCard({ item, decision, comparison, settings }: Props) {
  const dropped = decision.bucket === "drop";
  return (
    <div className={`card ${dropped ? "card-dropped" : ""}`}>
      <div className="card-header">
        <span className="item-id">{item.id}</span>
        <span className="source">
          {item.source_name} <em>({item.source_type})</em>
        </span>
        <span className={`scope scope-${item.audience_scope}`}>
          {item.audience_scope}
        </span>
      </div>
      <div className="card-text">{item.raw_text}</div>
      {dropped && decision.safety_check.rejected_reason && (
        <div className="card-reason">{decision.safety_check.rejected_reason}</div>
      )}
      <PipelineStrip decision={decision} />
      <GoldComparison comparison={comparison} />
      {!dropped && (
        <details className="breakdown">
          <summary>factor bars + reason</summary>
          <FactorBars decision={decision} settings={settings} />
          <div className="breakdown-reason">{decision.reason}</div>
        </details>
      )}
    </div>
  );
}
