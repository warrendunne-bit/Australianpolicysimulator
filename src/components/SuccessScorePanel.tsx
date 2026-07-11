import type { calculateSuccessScore, SuccessWeights } from '../simulation/SuccessScore';

export function SuccessScorePanel({
  score,
  weights,
  change,
  hasStarted,
  onChange,
}: {
  score: ReturnType<typeof calculateSuccessScore>;
  weights: SuccessWeights;
  change: number;
  hasStarted: boolean;
  onChange: (key: keyof SuccessWeights, value: number) => void;
}) {
  const rows: { key: keyof SuccessWeights; label: string; help: string }[] = [
    {
      key: 'economicGrowth',
      label: 'Economic Growth',
      help: 'Growth score converts annual growth into a 0 to 100 score.',
    },
    {
      key: 'wellbeing',
      label: 'Wellbeing / Happiness',
      help: 'Uses the national wellbeing outcome directly.',
    },
    {
      key: 'fairness',
      label: 'Fairness',
      help: 'Uses an illustrative distribution score across representative households.',
    },
    {
      key: 'socialCohesion',
      label: 'Social Cohesion',
      help: 'Uses the national cohesion outcome directly.',
    },
    {
      key: 'governmentFinances',
      label: 'Government Finances',
      help: 'Budget balance is converted into a 0 to 100 score.',
    },
    {
      key: 'environment',
      label: 'Environment Score',
      help: 'Calculated as 100 minus environmental pressure.',
    },
  ];
  const changeLabel =
    change > 0.05 ? `+${change.toFixed(1)}` : change < -0.05 ? change.toFixed(1) : '0.0';

  return (
    <section className="section-block">
      <h2>Overall Success Score</h2>
      <p className="section-intro">
        Read this as a directional comparison across the chosen priorities, not as an official
        national performance measure.
      </p>
      <div className="success-panel">
        <div className="success-score-card">
          <div>
            <span>Selected year score</span>
            <strong>{score.score.toFixed(1)}</strong>
          </div>
          <em className={change < 0 ? 'is-negative' : ''}>{changeLabel}</em>
        </div>
        <div className="success-summary">
          <strong>Current weighting settings</strong>
          <span className={hasStarted ? 'run-state-badge' : 'run-state-badge is-preview'}>
            {hasStarted ? 'Started simulation run' : 'Live preview before Start Simulation'}
          </span>
          <p>
            Growth {weights.economicGrowth}%, Wellbeing {weights.wellbeing}%, Fairness{' '}
            {weights.fairness}%, Cohesion {weights.socialCohesion}%, Finances{' '}
            {weights.governmentFinances}%, Environment {weights.environment}%.
          </p>
          <p>{score.explanation}</p>
          <p>
            A higher score means this scenario is performing better against your selected weights;
            it does not mean the policy package is recommended.
          </p>
        </div>
        <details className="success-weight-controls">
          <summary>Adjust score weights</summary>
          <div className="success-weight-control-body">
            {rows.map((row) => (
              <label className="weight-row" key={row.key}>
                <span>
                  <strong>{row.label}</strong>
                  <small>{row.help}</small>
                </span>
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={1}
                  value={weights[row.key]}
                  onChange={(event) => onChange(row.key, Number(event.target.value))}
                />
              </label>
            ))}
            <div className={score.isValidWeightTotal ? 'weight-total' : 'weight-total is-invalid'}>
              <strong>Total weights: {score.totalWeight.toFixed(0)}%</strong>
              <span>
                {score.isValidWeightTotal
                  ? 'Weights total 100%.'
                  : 'Weights must total 100% before this score should be interpreted.'}
              </span>
            </div>
          </div>
        </details>
      </div>
    </section>
  );
}
