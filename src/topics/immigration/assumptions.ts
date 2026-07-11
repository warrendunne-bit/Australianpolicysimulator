import type { ConfidenceRating } from './entities';

export type AssumptionKind = 'people' | 'housing' | 'economy' | 'government' | 'environment' | 'regions' | 'cohesion';

export type ImmigrationAssumptionKey =
  | 'netOverseasMigration'
  | 'naturalIncrease'
  | 'fertilityRate'
  | 'deathRate'
  | 'migrantWorkingAgeShare'
  | 'workforceParticipation'
  | 'productivityGrowth'
  | 'housingBuildRate'
  | 'constructionLabourConstraint'
  | 'healthAgedCareWorkerDemand'
  | 'averageTaxPerWorker'
  | 'governmentSpendingPerPerson'
  | 'infrastructureCostPerAdditionalPerson'
  | 'regionalSettlementShare'
  | 'socialCohesionSensitivity'
  | 'environmentalPressurePerPerson';

export type ImmigrationAssumptions = Record<ImmigrationAssumptionKey, number>;

export type ImmigrationAssumptionDefinition = {
  key: ImmigrationAssumptionKey;
  label: string;
  unit: string;
  kind: AssumptionKind;
  min: number;
  max: number;
  step: number;
  source: string;
  confidence: ConfidenceRating;
  explanation: string;
};

export const DEFAULT_IMMIGRATION_ASSUMPTIONS: ImmigrationAssumptions = {
  netOverseasMigration: 260_000,
  naturalIncrease: 110_000,
  fertilityRate: 1.65,
  deathRate: 7.1,
  migrantWorkingAgeShare: 78,
  workforceParticipation: 67,
  productivityGrowth: 1.2,
  housingBuildRate: 180_000,
  constructionLabourConstraint: 35,
  healthAgedCareWorkerDemand: 2.3,
  averageTaxPerWorker: 28_000,
  governmentSpendingPerPerson: 23_000,
  infrastructureCostPerAdditionalPerson: 13_000,
  regionalSettlementShare: 18,
  socialCohesionSensitivity: 45,
  environmentalPressurePerPerson: 1.0,
};

export const IMMIGRATION_ASSUMPTION_DEFINITIONS: ImmigrationAssumptionDefinition[] = [
  {
    key: 'netOverseasMigration',
    label: 'Net overseas migration',
    unit: 'people / year',
    kind: 'people',
    min: -50_000,
    max: 650_000,
    step: 10_000,
    source: 'Placeholder baseline — replace with ABS / Home Affairs series later',
    confidence: 'medium',
    explanation: 'Higher net migration raises population, labour supply and aggregate demand quickly; housing and infrastructure effects arrive immediately while tax and ageing effects build over time.',
  },
  {
    key: 'naturalIncrease',
    label: 'Natural increase',
    unit: 'people / year',
    kind: 'people',
    min: -20_000,
    max: 220_000,
    step: 5_000,
    source: 'Placeholder demographic assumption',
    confidence: 'low',
    explanation: 'Births minus deaths continue to change the population even if net overseas migration changes.',
  },
  {
    key: 'fertilityRate',
    label: 'Fertility rate',
    unit: 'births / woman',
    kind: 'people',
    min: 1.1,
    max: 2.2,
    step: 0.05,
    source: 'Placeholder demographic assumption',
    confidence: 'low',
    explanation: 'Higher fertility affects children and future workers slowly, not the immediate workforce.',
  },
  {
    key: 'deathRate',
    label: 'Death rate',
    unit: 'per 1,000 people',
    kind: 'people',
    min: 4,
    max: 12,
    step: 0.1,
    source: 'Placeholder demographic assumption',
    confidence: 'low',
    explanation: 'Mortality affects ageing, retirees and natural increase over time.',
  },
  {
    key: 'migrantWorkingAgeShare',
    label: 'Migrant working-age share',
    unit: '%',
    kind: 'people',
    min: 45,
    max: 95,
    step: 1,
    source: 'Placeholder age-profile assumption',
    confidence: 'medium',
    explanation: 'A younger migrant profile lifts workers per retiree, tax capacity and service staffing more than an older profile.',
  },
  {
    key: 'workforceParticipation',
    label: 'Workforce participation',
    unit: '% of working-age people',
    kind: 'economy',
    min: 50,
    max: 82,
    step: 1,
    source: 'Placeholder labour-market assumption',
    confidence: 'medium',
    explanation: 'Higher participation turns population into actual labour supply and tax revenue.',
  },
  {
    key: 'productivityGrowth',
    label: 'Productivity growth',
    unit: '% / year',
    kind: 'economy',
    min: -0.5,
    max: 3,
    step: 0.1,
    source: 'Placeholder productivity assumption',
    confidence: 'low',
    explanation: 'Productivity determines whether a bigger economy means higher living standards, not just more people.',
  },
  {
    key: 'housingBuildRate',
    label: 'Housing build rate',
    unit: 'dwellings / year',
    kind: 'housing',
    min: 60_000,
    max: 360_000,
    step: 5_000,
    source: 'Placeholder construction capacity assumption',
    confidence: 'medium',
    explanation: 'More housing supply reduces demand pressure, but labour/material constraints can delay the benefit.',
  },
  {
    key: 'constructionLabourConstraint',
    label: 'Construction labour constraint',
    unit: '0-100',
    kind: 'housing',
    min: 0,
    max: 100,
    step: 1,
    source: 'Placeholder bottleneck assumption',
    confidence: 'low',
    explanation: 'A higher constraint means planned dwellings are harder to deliver, especially when population growth is high.',
  },
  {
    key: 'healthAgedCareWorkerDemand',
    label: 'Health and aged care worker demand',
    unit: '% / year',
    kind: 'government',
    min: 0,
    max: 6,
    step: 0.1,
    source: 'Placeholder service-demand assumption',
    confidence: 'medium',
    explanation: 'Higher demand makes worker shortages more costly as the population ages.',
  },
  {
    key: 'averageTaxPerWorker',
    label: 'Average tax per worker',
    unit: '$ / worker / year',
    kind: 'government',
    min: 12_000,
    max: 55_000,
    step: 1_000,
    source: 'Placeholder fiscal assumption',
    confidence: 'low',
    explanation: 'Higher tax per worker improves budget capacity but does not remove state infrastructure pressure.',
  },
  {
    key: 'governmentSpendingPerPerson',
    label: 'Government spending per person',
    unit: '$ / person / year',
    kind: 'government',
    min: 8_000,
    max: 45_000,
    step: 1_000,
    source: 'Placeholder fiscal assumption',
    confidence: 'low',
    explanation: 'Higher per-person spending makes population growth more expensive unless revenue keeps pace.',
  },
  {
    key: 'infrastructureCostPerAdditionalPerson',
    label: 'Infrastructure cost per additional person',
    unit: '$ / person',
    kind: 'government',
    min: 2_000,
    max: 35_000,
    step: 1_000,
    source: 'Placeholder infrastructure assumption',
    confidence: 'low',
    explanation: 'Higher infrastructure cost shifts more burden to state governments and councils.',
  },
  {
    key: 'regionalSettlementShare',
    label: 'Regional settlement share',
    unit: '% of arrivals',
    kind: 'regions',
    min: 0,
    max: 70,
    step: 1,
    source: 'Placeholder regional-distribution assumption',
    confidence: 'low',
    explanation: 'Higher regional settlement can support towns and employers if housing, jobs and services are available.',
  },
  {
    key: 'socialCohesionSensitivity',
    label: 'Social cohesion sensitivity',
    unit: '0-100',
    kind: 'cohesion',
    min: 0,
    max: 100,
    step: 1,
    source: 'Placeholder social-system sensitivity',
    confidence: 'low',
    explanation: 'Higher sensitivity means rapid change and service pressure produce more cohesion risk unless integration works well.',
  },
  {
    key: 'environmentalPressurePerPerson',
    label: 'Environmental pressure per person',
    unit: 'index',
    kind: 'environment',
    min: 0.2,
    max: 2.2,
    step: 0.1,
    source: 'Placeholder environmental intensity assumption',
    confidence: 'low',
    explanation: 'Higher intensity means population and economic growth create more water, energy, emissions, waste and land-use pressure.',
  },
];

export function formatAssumptionValue(value: number, unit: string) {
  if (unit.includes('$')) return `$${Math.round(value).toLocaleString('en-AU')}`;
  if (unit.includes('people') || unit.includes('dwellings')) return Math.round(value).toLocaleString('en-AU');
  if (unit.includes('%') || unit.includes('0-100')) return value.toFixed(unit.includes('/ year') ? 1 : 0);
  return Number.isInteger(value) ? value.toFixed(0) : value.toFixed(2);
}
