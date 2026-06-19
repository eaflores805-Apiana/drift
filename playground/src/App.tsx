import { useMemo } from "react";
import { loadSimulated } from "./data/adapters/simulatedAdapter";
import { stubScore } from "./scoring/stubScorer";
import { Playground } from "./ui/Playground";

export function App() {
  const { listener, items, warnings } = useMemo(() => loadSimulated(), []);
  const decisions = useMemo(() => items.map(stubScore), [items]);
  return (
    <Playground
      listener={listener}
      items={items}
      decisions={decisions}
      warnings={warnings}
    />
  );
}
