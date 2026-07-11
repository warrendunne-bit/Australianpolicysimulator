import { formatMoney } from '../formatters';
import type { SimulationResult } from '../../simulation/model';

export type Outcome = SimulationResult['outcomes'];
export type YearOutcome = SimulationResult['history'][number];
export type SetNumber = (value: number) => void;

export function FinanceBreakdownList({
  financeBreakdown,
  results,
  outcomes,
}: {
  financeBreakdown: Outcome['financeBreakdown'];
  results?: SimulationResult;
  outcomes?: Outcome;
}) {
  return (
    <ul>
      <li>Base revenue: {formatMoney(financeBreakdown.baseRevenue)}.</li>
      <li>Tax revenue boost: {formatMoney(financeBreakdown.taxRevenueBoost)}.</li>
      <li>Growth revenue boost: {formatMoney(financeBreakdown.growthRevenueBoost)}.</li>
      <li>
        Integration and skills revenue: {formatMoney(financeBreakdown.integrationSkillsRevenueBoost)}.
      </li>
      <li>Base spending: {formatMoney(financeBreakdown.baseSpending)}.</li>
      <li>Stimulus spending: {formatMoney(financeBreakdown.stimulusSpendingBoost)}.</li>
      <li>
        Infrastructure pressure: {formatMoney(financeBreakdown.infrastructureSpendingPressure)}.
      </li>
      <li>Event spending: {formatMoney(financeBreakdown.eventSpending)}.</li>
      {results && outcomes ? (
        <li>
          Revenue {formatMoney(results.world.government.revenue)} - spending{' '}
          {formatMoney(results.world.government.spending)} = budget balance{' '}
          {formatMoney(outcomes.governmentBalance)}.
        </li>
      ) : null}
    </ul>
  );
}

export function DashboardIndicator({
  label,
  value,
  status,
  note,
}: {
  label: string;
  value: string;
  status: string;
  note: string;
}) {
  return (
    <article className="dashboard-indicator-card">
      <div>
        <span>{label}</span>
        <StatusBadge status={status} />
      </div>
      <strong>{value}</strong>
      <p>{note}</p>
    </article>
  );
}

export function CompactPolicyLever({
  label,
  value,
  stance,
  onOpen,
}: {
  label: string;
  value: string;
  stance: string;
  onOpen: () => void;
}) {
  return (
    <button className="compact-policy-lever" type="button" onClick={onOpen}>
      <span>{label}</span>
      <strong>{value}</strong>
      <em>{stance}</em>
      <small>Adjust details</small>
    </button>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const className = `status-badge status-${status.toLowerCase().replace(/\s+/g, '-')}`;
  return <em className={className}>{status}</em>;
}

export function policyStance(value: number, balanced: number, high: number, veryHigh: number) {
  if (value >= veryHigh) return 'Very High';
  if (value >= high) return 'High';
  if (value >= balanced) return 'Balanced';
  return 'Low';
}
