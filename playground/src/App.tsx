import { useEffect, useMemo, useState } from "react";
import { loadSimulated } from "./data/adapters/simulatedAdapter";
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
  const cache = useMemo(() => new MeaningCache(), []);
  const client = useMemo(() => new MockMeaningClient(), []);
  const [settings, setSettings] = useState<ScoringSettings>(DEFAULT_SETTINGS);
  const [meaningMap, setMeaningMap] = useState<MeaningMap | null>(null);

  // Meaning pass runs ONCE on load (and on client change). Sliders do not
  // trigger this — they only re-run scoring.
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

  return (
    <Playground
      listener={listener}
      items={items}
      decisions={decisions}
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
