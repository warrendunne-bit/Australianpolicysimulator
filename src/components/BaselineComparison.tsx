import {
  BASELINE_COMPARISON_OUTCOMES,
  type BaselineComparison,
  type OutcomeScores,
} from '../simulation/model';
import { formatMoney, formatPercent } from './formatters';
import { MovementBadge } from './shared';

export function BaselineComparisonPanel({ comparison }: { comparison: BaselineComparison }) {
  const rows = BASELINE_COMPARISON_OUTCOMES.map((definition) => ({
    label: definition.label,
    value: formatOutcome(definition.key, comparison.scenario.outcomes[definition.key]),
    baseline: formatOutcome(definition.key, comparison.baseline.outcomes[definition.key]),
    delta: comparison.deltas[definition.key as keyof BaselineComparison['deltas']],
    lowerIsBetter: definition.lowerIsBetter,
  }));

  return (
    <section className="section-block baseline-panel">
      <div>
        <h2>Baseline Comparison</h2>
        <p>{comparison.summary}</p>
      </div>
      <div className="baseline-grid">
        {rows.map((row) => (
          <article key={row.label}>
            <span>{row.label}</span>
            <strong>{row.value}</strong>
            <small>Baseline: {row.baseline}</small>
            <MovementBadge movement={row.lowerIsBetter ? -row.delta : row.delta} />
          </article>
        ))}
      </div>
    </section>
  );
}

function formatOutcome(key: keyof OutcomeScores, value: number | string) {
  if (typeof value !== 'number') return String(value);
  if (key === 'economicGrowth') return formatPercent(value);
  if (key === 'governmentBalance') return formatMoney(value);
  return value.toFixed(1);
}
