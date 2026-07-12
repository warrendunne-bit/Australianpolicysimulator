import { getBaselineVariable } from '../data/baseline/variables';
import { ACTIVE_BASELINE_VERSION_ID } from '../data/baseline/baselineVersions';
import { runImmigrationScenario } from '../../topics/immigration/model';
import { getImmigrationScenario } from '../../topics/immigration/scenarios';

export type BackTestResult = {
  variable: string;
  observed: number | null;
  simulated: number | null;
  unit: string;
  referencePeriod: string;
  differenceReason: string;
};

export type BaselineBackTest = {
  baselineVersionId: string;
  period: string;
  method: string;
  results: BackTestResult[];
  calibrationChanges: string[];
};

export function runBaselineBackTest(): BaselineBackTest {
  const scenario = getImmigrationScenario('current-path');
  const run = runImmigrationScenario(scenario);
  const firstYear = run.timeline[0];
  const population = getBaselineVariable('baseline.population.total');
  const nom = getBaselineVariable('baseline.migration.netOverseasMigration');
  const unemployment = getBaselineVariable('baseline.labour.unemploymentRate');
  const gdp = getBaselineVariable('baseline.economy.gdpQuarterlyGrowth');
  const completions = getBaselineVariable('baseline.housing.completionsAnnualised');
  const revenue = getBaselineVariable('baseline.fiscal.commonwealthRevenue');
  const expenses = getBaselineVariable('baseline.fiscal.commonwealthExpenses');

  return {
    baselineVersionId: ACTIVE_BASELINE_VERSION_ID,
    period: '2025-26 evidence cross-check using latest available official releases',
    method:
      'This is a reproducible first-pass back-test/cross-check. It compares v1.0 baseline inputs and first-year immigration-model outputs with observed/forecast source values where the current model has a comparable metric. It does not tune coefficients to force a fit.',
    results: [
      {
        variable: 'population',
        observed: population.value,
        simulated: firstYear.population,
        unit: population.unit,
        referencePeriod: population.referencePeriod,
        differenceReason: 'The model starts from the observed population and then applies annual NOM plus natural increase, so first-year population is expected to exceed the reference-date observed stock.',
      },
      {
        variable: 'net overseas migration',
        observed: nom.value,
        simulated: firstYear.netOverseasMigration,
        unit: nom.unit,
        referencePeriod: nom.referencePeriod,
        differenceReason: 'Comparable because v1.0 current-path NOM is set to the ABS annual component; future projections still require a forecast path.',
      },
      {
        variable: 'unemployment',
        observed: unemployment.value,
        simulated: null,
        unit: unemployment.unit,
        referencePeriod: unemployment.referencePeriod,
        differenceReason: 'Not directly modelled; difference arises from missing variables and no unemployment stock/rate in the current engine.',
      },
      {
        variable: 'GDP growth',
        observed: gdp.value,
        simulated: null,
        unit: gdp.unit,
        referencePeriod: gdp.referencePeriod,
        differenceReason: 'Current engine uses abstract business capacity/growth scores rather than national accounts GDP; inappropriate formula for direct GDP back-test.',
      },
      {
        variable: 'housing construction',
        observed: completions.value,
        simulated: firstYear.dwellingStock - getBaselineVariable('baseline.housing.dwellingStock').value,
        unit: completions.unit,
        referencePeriod: completions.referencePeriod,
        differenceReason: 'Comparable only approximately because model applies construction-labour constraint to the policy build-rate setting.',
      },
      {
        variable: 'government revenue',
        observed: revenue.value,
        simulated: null,
        unit: revenue.unit,
        referencePeriod: revenue.referencePeriod,
        differenceReason: 'General model fiscal units and immigration fiscal pressure indices are not Commonwealth budget dollars; missing variables and incompatible definitions.',
      },
      {
        variable: 'government expenditure',
        observed: expenses.value,
        simulated: null,
        unit: expenses.unit,
        referencePeriod: expenses.referencePeriod,
        differenceReason: 'General model fiscal units and immigration fiscal pressure indices are not Commonwealth budget dollars; missing variables and incompatible definitions.',
      },
    ],
    calibrationChanges: [
      'Updated population, NOM, natural increase, labour, GDP context, CPI context and housing-completion baseline values from authoritative sources.',
      'Aligned immigration current-path NOM and housing build-rate settings to the reviewed v1.0 baseline central values.',
      'Did not add unexplained balancing factors or tune coefficients solely for historical fit.',
    ],
  };
}
