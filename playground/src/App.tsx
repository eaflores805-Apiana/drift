import { useEffect, useMemo, useState } from "react";
import { loadSimulated } from "./data/adapters/simulatedAdapter";
import { loadGoldLabels } from "./evaluation/goldLabels";
import { classifyComparison, type Comparison } from "./evaluation/mismatchTypes";
import { MeaningCache } from "./meaning/cache";
import { MockMeaningClient } from "./meaning/mockClient";
import { meaningBatch } from "./meaning/meaningPass";
import { type ModelDerived } from "./meaning/types";
import {
  DEFAULT_SETTINGS,
  scoreBatch,
  type MeaningMap,
  type ScoringSettings,
} from "./scoring/scoringEngine";
import { Playground } from "./ui/Playground";

export function App() {
  const { listener, items, warnings } = useMemo(() => loadSimulated(), []);
  const goldLabels = useMemo(() => loadGoldLabels(), []);
  const cache = useMemo(() => new MeaningCache(), []);
  const client = useMemo(() => new MockMeaningClient(), []);
  const [settings, setSettings] = useState<ScoringSettings>(DEFAULT_SETTINGS);
  const [meaningMap, setMeaningMap] = useState<MeaningMap | null>(null);

  useEffect(() => {
    let cancelled = false;
    meaningBatch(items, client, cache).then((m: Map<string, ModelDerived>) => {
      if (!cancelled) setMeaningMap(m);
    });
    return () => {
      cancelled = true;
    };
  }, [items, client, cache]);

  const decisions = useMemo(
    () => (meaningMap ? scoreBatch(items, listener, meaningMap, settings) : []),
    [items, listener, meaningMap, settings]
  );

  const comparisons = useMemo(() => {
    const map = new Map<string, Comparison>();
    for (const d of decisions) {
      const item = items.find((i) => i.id === d.item_id);
      if (!item) continue;
      const gold = goldLabels.get(d.item_id);
      const meaning = meaningMap?.get(d.item_id);
      map.set(d.item_id, classifyComparison(item, d, gold, meaning, listener));
    }
    return map;
  }, [items, listener, decisions, goldLabels, meaningMap]);

  return (
    <Playground
      listener={listener}
      items={items}
      decisions={decisions}
      comparisons={comparisons}
      warnings={warnings}
      settings={settings}
      onSettingsChange={setSettings}
      cacheStats={cache.stats()}
      clientId={client.id}
      promptVersion={client.prompt_version}
      meaningReady={meaningMap !== null}
    />
  );
}
