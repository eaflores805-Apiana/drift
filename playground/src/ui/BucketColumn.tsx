import { type Bucket, type Decision, type IngestedItem } from "../data/schemas";
import { ItemCard } from "./ItemCard";

type Props = {
  bucket: Bucket;
  decisions: Decision[];
  itemById: Map<string, IngestedItem>;
};

export function BucketColumn({ bucket, decisions, itemById }: Props) {
  return (
    <div className={`column column-${bucket}`}>
      <h2 className="column-title">
        {bucket.toUpperCase()} <span className="count">({decisions.length})</span>
      </h2>
      <div className="cards">
        {decisions.map((d) => {
          const item = itemById.get(d.item_id);
          if (!item) return null;
          return <ItemCard key={d.item_id} item={item} decision={d} />;
        })}
      </div>
    </div>
  );
}
