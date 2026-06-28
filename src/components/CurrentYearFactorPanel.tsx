import type { calculateSuccessScore } from '../simulation/SuccessScore';
import type { AnnualOutcome, SimulationResult } from '../simulation/model';
import { formatMoney, formatPercent } from './formatters';

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
  const rows = [
    {
      label: 'Economic Growth',
      score: successScore.componentScores.economicGrowth,
      previousScore: previousSuccessScore?.componentScores.economicGrowth,
      explanation: `Raw annual growth is ${formatPercent(outcomes.economicGrowth)}.`,
    },
    {
      label: 'Wellbeing / Happiness',
      score: successScore.componentScores.wellbeing,
      previousScore: previousSuccessScore?.componentScores.wellbeing,
      explanation: 'Reflects household consumption, housing security and social connection.',
    },
    {
      label: 'Fairness',
      score: successScore.componentScores.fairness,
      previousScore: previousSuccessScore?.componentScores.fairness,
      explanation: outcomes.fairnessExplanation,
    },
    {
      label: 'Social Cohesion',
      score: successScore.componentScores.socialCohesion,
      previousScore: previousSuccessScore?.componentScores.socialCohesion,
      explanation: 'Reflects integration, service capacity, trust and housing pressure.',
    },
    {
      label: 'Government Finances',
      score: successScore.componentScores.governmentFinances,
      previousScore: previousSuccessScore?.componentScores.governmentFinances,
      explanation: `Budget balance is ${formatMoney(outcomes.governmentBalance)}.`,
    },
    {
      label: 'Environment Score',
      score: successScore.componentScores.environment,
      previousScore: previousSuccessScore?.componentScores.environment,
      explanation: 'Calculated as 100 minus environmental pressure.',
    },
    {
      label: 'Environmental Pressure',
      score: outcomes.environmentalPressure,
      previousScore: previousOutcomes?.environmentalPressure,
      explanation: 'Lower pressure is better, so rising pressure weakens the scenario.',
      lowerIsBetter: true,
    },
  ];

  return (
    <section className="section-block">
      <h2>Selected Year Outcome Factors</h2>
      <div className="current-factor-panel">
        <div className="selected-year-label">Selected year: Year {selectedYear}</div>
        <div className="factor-score-list">
          {rows.map((row) => (
            <FactorScoreRow
              explanation={row.explanation}
              key={row.label}
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
