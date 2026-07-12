import { getBaselineVariable } from '../data/baseline/variables';
import { ACTIVE_BASELINE_VERSION_ID } from '../data/baseline/baselineVersions';
import { getImmigrationScenario, type ImmigrationScenarioPreset } from '../../topics/immigration/scenarios';
import { runImmigrationScenario } from '../../topics/immigration/model';
import type { ImmigrationAssumptions } from '../../topics/immigration/assumptions';

export type MigrationSensitivityCase = {
  label: 'low' | 'central' | 'high';
  netOverseasMigration: number;
  housingStressIndex: number;
  labourSupplyIndex: number;
  federalBudgetPressure: number;
  socialCohesionRisk: number;
  topAffectedGroups: string[];
};

export type MigrationSensitivityReport = {
  baselineVersionId: string;
  assumptionId: string;
  cases: MigrationSensitivityCase[];
  conclusionRisk: string;
};

export type ExpandedSensitivityDimension = {
  id: keyof ImmigrationAssumptions;
  low: number;
  central: number;
  high: number;
  dominantOutcome: string;
  conclusionRisk: string;
};

export type ExpandedSensitivityReport = {
  baselineVersionId: string;
  dimensions: ExpandedSensitivityDimension[];
};

function runNomCase(label: MigrationSensitivityCase['label'], netOverseasMigration: number): MigrationSensitivityCase {
  const base = getImmigrationScenario('current-path');
  const scenario: ImmigrationScenarioPreset = {
    ...base,
    id: base.id,
    name: `${base.name} (${label} NOM sensitivity)`,
    assumptionOverrides: { ...base.assumptionOverrides, netOverseasMigration },
  };
  const run = runImmigrationScenario(scenario);
  const year = run.timeline.find((item) => item.year === 2036) ?? run.timeline[10];
  return {
    label,
    netOverseasMigration,
    housingStressIndex: year.housingStressIndex,
    labourSupplyIndex: year.labourSupplyIndex,
    federalBudgetPressure: year.federalBudgetPressure,
    socialCohesionRisk: year.socialCohesionRisk,
    topAffectedGroups: year.tradeOffs
      .slice()
      .sort((a, b) => Math.abs(b.currentYearImpact) - Math.abs(a.currentYearImpact))
      .slice(0, 4)
      .map((item) => item.group),
  };
}

export function runMigrationSensitivity(): MigrationSensitivityReport {
  const nom = getBaselineVariable('baseline.migration.netOverseasMigration');
  const low = Math.max(0, Math.round(nom.centralEstimate * 0.75));
  const high = Math.round(nom.highEstimate * 1.2);
  const cases = [
    runNomCase('low', low),
    runNomCase('central', nom.centralEstimate),
    runNomCase('high', high),
  ];
  const housingSwing = Math.abs(cases[2].housingStressIndex - cases[0].housingStressIndex);
  return {
    baselineVersionId: ACTIVE_BASELINE_VERSION_ID,
    assumptionId: nom.id,
    cases,
    conclusionRisk:
      housingSwing > 10
        ? 'Housing and winners/losers conclusions are materially sensitive to NOM; show uncertainty warnings.'
        : 'Major conclusions are not dominated by the tested NOM range in this model run.',
  };
}

export function runExpandedSensitivity(): ExpandedSensitivityReport {
  const dimensions: Array<{ id: keyof ImmigrationAssumptions; low: number; central: number; high: number }> = [
    { id: 'netOverseasMigration', low: 225_750, central: 301_000, high: 367_200 },
    { id: 'housingBuildRate', low: 140_000, central: 175_264, high: 230_000 },
    { id: 'averageTaxPerWorker', low: 22_000, central: 28_000, high: 36_000 },
    { id: 'governmentSpendingPerPerson', low: 18_000, central: 23_000, high: 32_000 },
    { id: 'socialCohesionSensitivity', low: 25, central: 45, high: 70 },
  ];

  return {
    baselineVersionId: ACTIVE_BASELINE_VERSION_ID,
    dimensions: dimensions.map((dimension) => {
      const low = runSensitivityCase({ [dimension.id]: dimension.low });
      const high = runSensitivityCase({ [dimension.id]: dimension.high });
      const housingSwing = Math.abs(high.housingStressIndex - low.housingStressIndex);
      const fiscalSwing = Math.abs(high.commonwealthBalanceDollars - low.commonwealthBalanceDollars) / 1_000_000_000;
      const cohesionSwing = Math.abs(high.socialCohesionRisk - low.socialCohesionRisk);
      const dominantOutcome = [
        ['housing affordability', housingSwing],
        ['Commonwealth balance', fiscalSwing / 5],
        ['social cohesion risk', cohesionSwing],
      ].sort((a, b) => Number(b[1]) - Number(a[1]))[0][0] as string;

      return {
        ...dimension,
        dominantOutcome,
        conclusionRisk:
          Math.max(housingSwing, fiscalSwing / 5, cohesionSwing) > 8
            ? `${String(dimension.id)} materially changes ${dominantOutcome}; scenario conclusions should show uncertainty.`
            : `${String(dimension.id)} does not dominate 2036 outcomes in this range test.`,
      };
    }),
  };
}

function runSensitivityCase(overrides: Partial<ImmigrationAssumptions>) {
  const base = getImmigrationScenario('current-path');
  const scenario: ImmigrationScenarioPreset = {
    ...base,
    assumptionOverrides: { ...base.assumptionOverrides, ...overrides },
  };
  const run = runImmigrationScenario(scenario);
  return run.timeline.find((item) => item.year === 2036) ?? run.timeline[10];
}
