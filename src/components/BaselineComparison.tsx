import type { BaselineComparison } from '../simulation/model';
import { formatMoney, formatPercent } from './formatters';
import { MovementBadge } from './shared';

export function BaselineComparisonPanel({ comparison }: { comparison: BaselineComparison }) {
  const rows = [
    {
      label: 'Economic growth',
      value: formatPercent(comparison.scenario.outcomes.economicGrowth),
      baseline: formatPercent(comparison.baseline.outcomes.economicGrowth),
      delta: comparison.deltas.economicGrowth,
      lowerIsBetter: false,
    },
    {
      label: 'Wellbeing',
      value: comparison.scenario.outcomes.wellbeing.toFixed(1),
      baseline: comparison.baseline.outcomes.wellbeing.toFixed(1),
      delta: comparison.deltas.wellbeing,
      lowerIsBetter: false,
    },
    {
      label: 'Fairness',
      value: comparison.scenario.outcomes.fairness.toFixed(1),
      baseline: comparison.baseline.outcomes.fairness.toFixed(1),
      delta: comparison.deltas.fairness,
      lowerIsBetter: false,
    },
    {
      label: 'Housing stress',
      value: comparison.scenario.outcomes.housingStress.toFixed(1),
      baseline: comparison.baseline.outcomes.housingStress.toFixed(1),
      delta: comparison.deltas.housingStress,
      lowerIsBetter: true,
    },
    {
      label: 'Budget balance',
      value: formatMoney(comparison.scenario.outcomes.governmentBalance),
      baseline: formatMoney(comparison.baseline.outcomes.governmentBalance),
      delta: comparison.deltas.governmentBalance,
      lowerIsBetter: false,
    },
    {
      label: 'Environmental pressure',
      value: comparison.scenario.outcomes.environmentalPressure.toFixed(1),
      baseline: comparison.baseline.outcomes.environmentalPressure.toFixed(1),
      delta: comparison.deltas.environmentalPressure,
      lowerIsBetter: true,
    },
  ];

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
