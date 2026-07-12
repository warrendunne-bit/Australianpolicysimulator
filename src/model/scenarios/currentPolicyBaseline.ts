import { ACTIVE_BASELINE_VERSION_ID } from '../data/baseline/baselineVersions';

export type CurrentPolicyCategory =
  | 'observed-data'
  | 'current-legislated-policy'
  | 'announced-policy'
  | 'government-forecast'
  | 'market-condition'
  | 'demographic-trend'
  | 'temporary-condition'
  | 'long-run-structural-assumption';

export type CurrentPolicyTrajectory = 'constant' | 'external-projection' | 'dynamic' | 'return-to-long-run';

export type CurrentPolicyRule = {
  variableId: string;
  category: CurrentPolicyCategory;
  trajectory: CurrentPolicyTrajectory;
  explanation: string;
};

export const CURRENT_POLICY_BASELINE_DEFINITION = {
  id: 'current-policy-baseline-v1.0',
  baselineVersionId: ACTIVE_BASELINE_VERSION_ID,
  label: 'Current-policy baseline',
  summary:
    'The v1.0 current-policy baseline starts from the latest authoritative observed Australian data where available, uses Budget/Treasury values only as forecasts, treats policy levers as scenario settings, and does not freeze temporary economic conditions indefinitely.',
  rules: [
    {
      variableId: 'baseline.population.total',
      category: 'observed-data',
      trajectory: 'dynamic',
      explanation: 'Population starts from ABS ERP and then changes through NOM plus natural increase in the model.',
    },
    {
      variableId: 'policy.immigration.currentPath.netOverseasMigration',
      category: 'demographic-trend',
      trajectory: 'external-projection',
      explanation: 'NOM is set to the latest ABS annual contribution for v1.0, but should be replaced by a documented projection path in a future phase.',
    },
    {
      variableId: 'baseline.fiscal.commonwealthRevenue',
      category: 'government-forecast',
      trajectory: 'external-projection',
      explanation: 'Commonwealth revenue uses Budget 2026-27 estimate metadata and is not an observed outturn.',
    },
    {
      variableId: 'baseline.fiscal.commonwealthExpenses',
      category: 'government-forecast',
      trajectory: 'external-projection',
      explanation: 'Commonwealth expenses use Budget 2026-27 estimate metadata and are not an observed outturn.',
    },
    {
      variableId: 'baseline.prices.cpiAnnualInflation',
      category: 'temporary-condition',
      trajectory: 'return-to-long-run',
      explanation: 'Latest monthly CPI inflation is recorded as context; the baseline does not assume it persists forever.',
    },
    {
      variableId: 'policy.immigration.currentPath.housingBuildRate',
      category: 'market-condition',
      trajectory: 'dynamic',
      explanation: 'Housing completions are annualised from the latest ABS quarter and should respond to construction capacity and policy settings.',
    },
  ] satisfies CurrentPolicyRule[],
};
