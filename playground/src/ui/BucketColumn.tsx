import { type Bucket, type Decision, type IngestedItem } from "../data/schemas";
import { type Comparison } from "../evaluation/mismatchTypes";
import { type ScoringSettings } from "../scoring/scoringEngine";
import { ItemCard } from "./ItemCard";

type Props = {
  bucket: Bucket;
  decisions: Decision[];
  itemById: Map<string, IngestedItem>;
  comparisonById: Map<string, Comparison>;
  settings: ScoringSettings;
};

export function BucketColumn({ bucket, decisions, itemById, comparisonById, settings }: Props) {
  return (
    <div className={`column column-${bucket}`}>
      <h2 className="column-title">
        {bucket.toUpperCase()} <span className="count">({decisions.length})</span>
      </h2>
      <div className="cards">
        {decisions.map((d) => {
          const item = itemById.get(d.item_id);
          const cmp = comparisonById.get(d.item_id);
          if (!item || !cmp) return null;
          return (
            <ItemCard
              key={d.item_id}
              item={item}
              decision={d}
              comparison={cmp}
              settings={settings}
            />
          );
        })}
      </div>
    </div>
  );
}
