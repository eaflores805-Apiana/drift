import { useMemo, useState } from "react";
import { loadSimulated } from "./data/adapters/simulatedAdapter";
import {
  DEFAULT_SETTINGS,
  scoreBatch,
  type ScoringSettings,
} from "./scoring/scoringEngine";
import { Playground } from "./ui/Playground";

export function App() {
  const { listener, items, warnings } = useMemo(() => loadSimulated(), []);
  const [settings, setSettings] = useState<ScoringSettings>(DEFAULT_SETTINGS);
  const decisions = useMemo(
    () => scoreBatch(items, listener, settings),
    [items, listener, settings]
  );
  return (
    <Playground
      listener={listener}
      items={items}
      decisions={decisions}
      warnings={warnings}
      settings={settings}
      onSettingsChange={setSettings}
    />
  );
}
