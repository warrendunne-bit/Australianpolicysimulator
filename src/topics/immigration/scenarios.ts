import type { ImmigrationAssumptions } from './assumptions';
import { DEFAULT_IMMIGRATION_ASSUMPTIONS } from './assumptions';

export type ImmigrationScenarioId =
  | 'current-path'
  | 'zero-net-overseas-migration'
  | 'no-new-immigration'
  | 'low-immigration'
  | 'skilled-migration-focus'
  | 'regional-settlement-focus'
  | 'high-migration';

export type ImmigrationScenarioPreset = {
  id: ImmigrationScenarioId;
  name: string;
  shortName: string;
  description: string;
  assumptionOverrides: Partial<ImmigrationAssumptions>;
  framing: string;
};

export const IMMIGRATION_SCENARIO_PRESETS: ImmigrationScenarioPreset[] = [
  {
    id: 'current-path',
    name: 'Current Path',
    shortName: 'Current',
    description: 'A placeholder continuation path with moderate net overseas migration and current-style settlement patterns.',
    framing: 'Tests whether housing, services and infrastructure keep pace with a continued migration-driven population path.',
    assumptionOverrides: {},
  },
  {
    id: 'zero-net-overseas-migration',
    name: 'Zero Net Overseas Migration',
    shortName: 'Zero NOM',
    description: 'Arrivals and departures balance out, so overseas migration contributes no net population growth.',
    framing: 'Separates the effect of net migration from natural increase, ageing and existing population momentum.',
    assumptionOverrides: {
      netOverseasMigration: 0,
      migrantWorkingAgeShare: 65,
      regionalSettlementShare: 10,
    },
  },
  {
    id: 'no-new-immigration',
    name: 'No New Immigration',
    shortName: 'No new',
    description: 'A stricter scenario with no new arrivals and continuing departures from temporary residents and Australians moving overseas.',
    framing: 'Tests the claim that stopping inflows fixes pressure, while exposing labour-force, tax-base and ageing trade-offs.',
    assumptionOverrides: {
      netOverseasMigration: -80_000,
      migrantWorkingAgeShare: 55,
      regionalSettlementShare: 5,
    },
  },
  {
    id: 'low-immigration',
    name: 'Low Immigration',
    shortName: 'Low',
    description: 'A lower-growth path that reduces inflow pressure while keeping some migration channels open.',
    framing: 'Tests a slower population path with less immediate housing demand and less labour-market expansion.',
    assumptionOverrides: {
      netOverseasMigration: 100_000,
      migrantWorkingAgeShare: 72,
      regionalSettlementShare: 15,
    },
  },
  {
    id: 'skilled-migration-focus',
    name: 'Skilled Migration Focus',
    shortName: 'Skilled',
    description: 'A similar-sized program tilted toward skilled working-age arrivals and critical-sector labour supply.',
    framing: 'Tests whether better skill alignment changes the balance between growth, services, tax and housing pressure.',
    assumptionOverrides: {
      netOverseasMigration: 240_000,
      migrantWorkingAgeShare: 86,
      workforceParticipation: 72,
      productivityGrowth: 1.55,
      averageTaxPerWorker: 32_000,
    },
  },
  {
    id: 'regional-settlement-focus',
    name: 'Regional Settlement Focus',
    shortName: 'Regional',
    description: 'A program that directs a larger share of arrivals toward regional towns and rural labour markets.',
    framing: 'Tests whether regional settlement can support towns and employers without simply transferring pressure to smaller service systems.',
    assumptionOverrides: {
      netOverseasMigration: 220_000,
      regionalSettlementShare: 42,
      housingBuildRate: 190_000,
      infrastructureCostPerAdditionalPerson: 14_500,
    },
  },
  {
    id: 'high-migration',
    name: 'High Migration',
    shortName: 'High',
    description: 'A high-growth path with strong arrivals, larger aggregate economy and higher pressure on housing, services and resources.',
    framing: 'Tests whether stronger population and labour-force growth produces broad benefits when capacity has to catch up.',
    assumptionOverrides: {
      netOverseasMigration: 450_000,
      migrantWorkingAgeShare: 80,
      housingBuildRate: 210_000,
      constructionLabourConstraint: 50,
      socialCohesionSensitivity: 55,
      environmentalPressurePerPerson: 1.08,
    },
  },
];

export function getImmigrationScenario(id: ImmigrationScenarioId | string) {
  return IMMIGRATION_SCENARIO_PRESETS.find((scenario) => scenario.id === id) ?? IMMIGRATION_SCENARIO_PRESETS[0];
}

export function buildScenarioAssumptions(
  scenario: ImmigrationScenarioPreset,
  overrides: Partial<ImmigrationAssumptions> = {},
): ImmigrationAssumptions {
  return {
    ...DEFAULT_IMMIGRATION_ASSUMPTIONS,
    ...scenario.assumptionOverrides,
    ...overrides,
  };
}
