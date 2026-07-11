import type { SimulationResult } from '../../simulation/model';
import { formatMoney, formatPercent } from '../formatters';
import { MetricStrip, Panel, PolicyCard, PolicySlider } from '../shared';
import type { Outcome, SetNumber } from './cockpitShared';
import { FinanceBreakdownList } from './cockpitShared';

export function BudgetPage({
  outcomes,
  results,
  financeBreakdown,
  taxRate,
  stimulusRate,
  onTaxChange,
  onStimulusChange,
}: {
  outcomes: Outcome;
  results: SimulationResult;
  financeBreakdown: Outcome['financeBreakdown'];
  taxRate: number;
  stimulusRate: number;
  onTaxChange: SetNumber;
  onStimulusChange: SetNumber;
}) {
  return (
    <section className="section-block budget-console-section">
      <p className="eyebrow">Budget Console</p>
      <h2>National budget position</h2>
      <div className="budget-console-grid">
        <PolicyCard title="Fiscal levers">
          <PolicySlider label="Tax Rate" value={taxRate} min={0} max={50} step={1} unit="of income" valueFormatter={formatPercent} onChange={onTaxChange} />
          <PolicySlider label="Government Stimulus" value={stimulusRate} min={0} max={10} step={0.5} unit="extra spending" valueFormatter={formatPercent} onChange={onStimulusChange} />
        </PolicyCard>
        <Panel title="Budget Balance">
          <MetricStrip items={[["Revenue", formatMoney(results.world.government.revenue)], ["Spending", formatMoney(results.world.government.spending)], ["Balance", formatMoney(outcomes.governmentBalance)], ["Fiscal pressure", financeBreakdown.eventSpending > 0 ? 'Event affected' : 'Normal']]} />
          <p className="panel-note">This is a simplified national budget console, not an accounting report.</p>
        </Panel>
        <Panel title="Government Finance Breakdown">
          <FinanceBreakdownList financeBreakdown={financeBreakdown} />
        </Panel>
      </div>
    </section>
  );
}
