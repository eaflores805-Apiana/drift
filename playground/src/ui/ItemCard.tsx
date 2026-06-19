import { type Decision, type IngestedItem } from "../data/schemas";

type Props = {
  item: IngestedItem;
  decision: Decision;
};

export function ItemCard({ item, decision }: Props) {
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
    </div>
  );
}
