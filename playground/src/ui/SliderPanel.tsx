import { type SourceType } from "../data/schemas";
import { type ScoringSettings } from "../scoring/scoringEngine";
import { ROUTES } from "../scoring/routes";

type Props = {
  settings: ScoringSettings;
  onChange: (next: ScoringSettings) => void;
};

const FOCUS_SOURCES: SourceType[] = [
  "friend", "family", "local_org", "brand", "creator", "news",
];

export function SliderPanel({ settings, onChange }: Props) {
  const set = (patch: Partial<ScoringSettings>) =>
    onChange({ ...settings, ...patch });
  const setFocus = (k: SourceType, v: number) =>
    onChange({
      ...settings,
      focusWeights: { ...settings.focusWeights, [k]: v },
    });

  return (
    <div className="slider-panel">
      <div className="slider-group">
        <div className="slider-group-label">
          Route thresholds <span className="hint">fitted per Step 1.3 · read-only</span>
        </div>
        {ROUTES.map((route) => {
          const v = settings.routeThresholds[route];
          return (
            <div key={route} className="slider-row">
              <span className="slider-label">{route}</span>
              <div className="slider-value">
                {v === undefined ? <em>no voiced bar</em> : v.toFixed(3)}
              </div>
            </div>
          );
        })}
        <SliderRow
          label="Expandable threshold"
          value={settings.expandableThreshold}
          min={0} max={1} step={0.01}
          onChange={(v) => set({ expandableThreshold: v })}
        />
        <SliderRow
          label="Relevance baseline"
          value={settings.relevanceBaseline}
          min={0} max={1} step={0.05}
          onChange={(v) => set({ relevanceBaseline: v })}
        />
        <SliderRow
          label="Timeliness baseline"
          value={settings.timelinessBaseline}
          min={0} max={1} step={0.05}
          onChange={(v) => set({ timelinessBaseline: v })}
        />
        <SliderRow
          label="Novelty window"
          value={settings.noveltyWindowHours}
          min={1} max={168} step={1}
          onChange={(v) => set({ noveltyWindowHours: v })}
          format={(v) => `${v}h`}
        />
      </div>

      <div className="slider-group">
        <div className="slider-group-label">
          Focus weights <span className="hint">multiplicative — never filters</span>
        </div>
        {FOCUS_SOURCES.map((s) => (
          <SliderRow
            key={s}
            label={s}
            value={settings.focusWeights[s]}
            min={0.5} max={2.0} step={0.05}
            onChange={(v) => setFocus(s, v)}
            format={(v) => `×${v.toFixed(2)}`}
          />
        ))}
      </div>
    </div>
  );
}

function SliderRow({
  label, value, min, max, step, onChange, format,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
}) {
  return (
    <label className="slider-row">
      <span className="slider-label">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.currentTarget.value))}
      />
      <span className="slider-value">{format ? format(value) : value.toFixed(2)}</span>
    </label>
  );
}
