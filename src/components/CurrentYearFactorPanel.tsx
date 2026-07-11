import type { calculateSuccessScore } from '../simulation/SuccessScore';
import { buildOutcomeFactorRows, type AnnualOutcome, type SimulationResult } from '../simulation/model';

export function CurrentYearFactorPanel({
  outcomes,
  previousOutcomes,
  selectedYear,
  successScore,
  previousSuccessScore,
}: {
  outcomes: AnnualOutcome | SimulationResult['outcomes'];
  previousOutcomes?: AnnualOutcome;
  selectedYear: number;
  successScore: ReturnType<typeof calculateSuccessScore>;
  previousSuccessScore: ReturnType<typeof calculateSuccessScore> | null;
}) {
  const rows = buildOutcomeFactorRows({ outcomes, previousOutcomes });
  void successScore;
  void previousSuccessScore;

  return (
    <section className="section-block">
      <h2>Selected Year Outcome Factors</h2>
      <p className="section-intro">
        These 0-100 factors explain what is pulling the selected year up or down. For Housing
        Stress, a lower number is better.
      </p>
      <div className="current-factor-panel">
        <div className="selected-year-label">Selected year: Year {selectedYear}</div>
        <div className="factor-score-list">
          {rows.map((row) => (
            <FactorScoreRow
              explanation={row.explanation}
              key={row.key}
              label={row.label}
              lowerIsBetter={row.lowerIsBetter}
              previousScore={row.previousScore}
              score={row.score}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function FactorScoreRow({
  label,
  score,
  previousScore,
  lowerIsBetter = false,
  explanation,
}: {
  label: string;
  score: number;
  previousScore?: number;
  lowerIsBetter?: boolean;
  explanation: string;
}) {
  const movement = previousScore === undefined ? 0 : score - previousScore;
  const effectiveMovement = lowerIsBetter ? -movement : movement;
  const status =
    effectiveMovement > 1 ? 'Improving' : effectiveMovement < -1 ? 'Weakening' : 'Stable';
  const movementLabel =
    movement > 0.05 ? `+${movement.toFixed(0)}` : movement < -0.05 ? movement.toFixed(0) : '0';

  return (
    <article className="factor-score-row">
      <div>
        <strong>{label}</strong>
        <span>{explanation}</span>
      </div>
      <div className="factor-score-values">
        <strong>{score.toFixed(0)}</strong>
        <em className={effectiveMovement < -1 ? 'is-negative' : ''}>{movementLabel}</em>
        <span className={effectiveMovement < -1 ? 'is-weakening' : ''}>{status}</span>
      </div>
    </article>
  );
}
