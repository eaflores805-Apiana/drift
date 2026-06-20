import { type Decision } from "../data/schemas";

type Status = "pass" | "caution" | "fail" | "na";

type Stage = {
  label: string;
  status: Status;
  note?: string;
};

type Props = {
  decision: Decision;
};

/**
 * Decision pipeline strip: Consent → Meaning → Score → Safety/Tone → Bucket.
 *
 * Color is SAFETY-coded only (green/yellow/red/gray). Gold-label agreement
 * is rendered separately by `GoldComparison` and never reuses these colors.
 */
export function PipelineStrip({ decision }: Props) {
  const stages = stagesFor(decision);
  return (
    <div className="pipeline-strip" role="list">
      {stages.map((s, i) => (
        <span key={s.label} role="listitem" className={`stage stage-${s.status}`} title={s.note ?? s.label}>
          {s.label}
          {i < stages.length - 1 && <span className="stage-sep">→</span>}
        </span>
      ))}
    </div>
  );
}

function stagesFor(decision: Decision): Stage[] {
  const dropped = decision.bucket === "drop";
  const consentFailed = !decision.safety_check.passed;

  if (consentFailed) {
    // Consent gate dropped this — downstream stages are not applicable.
    return [
      { label: "Consent", status: "fail", note: decision.safety_check.rejected_reason ?? "consent failure" },
      { label: "Meaning", status: "na" },
      { label: "Score", status: "na" },
      { label: "Safety", status: "na" },
      { label: `Bucket: ${decision.bucket}`, status: "na" },
    ];
  }

  if (dropped) {
    // Non-consent drop (e.g., missing meaning) — caution downstream.
    return [
      { label: "Consent", status: "pass" },
      { label: "Meaning", status: "caution", note: "no meaning entry; default drop" },
      { label: "Score", status: "na" },
      { label: "Safety", status: "na" },
      { label: `Bucket: ${decision.bucket}`, status: "caution" },
    ];
  }

  const hasBreakdown = Object.keys(decision.score_breakdown).length > 0;
  return [
    { label: "Consent", status: "pass" },
    { label: "Meaning", status: hasBreakdown ? "pass" : "caution" },
    { label: "Score", status: "pass", note: `effective_score=${decision.score.toFixed(3)}` },
    { label: "Safety", status: decision.safety_check.passed ? "pass" : "fail" },
    { label: `Bucket: ${decision.bucket}`, status: "pass" },
  ];
}
