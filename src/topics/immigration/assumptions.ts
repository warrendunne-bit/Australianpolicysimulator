import type { ConfidenceRating } from './entities';
import { getBehaviouralAssumption } from '../../model/assumptions/behaviouralAssumptions';
import { getBaselineVariable } from '../../model/data/baseline/variables';
import { getPolicySetting } from '../../model/policies/policySettings';

const immigrationBaselineValues = {
  naturalIncrease: getBaselineVariable('baseline.demography.naturalIncrease').value,
  fertilityRate: getBaselineVariable('baseline.demography.fertilityRate').value,
  deathRate: getBaselineVariable('baseline.demography.deathRate').value,
};

const immigrationCurrentPolicyValues = {
  netOverseasMigration: getPolicySetting('policy.immigration.currentPath.netOverseasMigration').value,
  housingBuildRate: getPolicySetting('policy.immigration.currentPath.housingBuildRate').value,
  regionalSettlementShare: getPolicySetting('policy.immigration.currentPath.regionalSettlementShare').value,
};

const immigrationAssumptionValues = {
  migrantWorkingAgeShare: getBehaviouralAssumption('assumption.immigration.migrantWorkingAgeShare').centralValue,
  workforceParticipation: getBehaviouralAssumption('assumption.immigration.workforceParticipation').centralValue,
  productivityGrowth: getBehaviouralAssumption('assumption.immigration.productivityGrowth').centralValue,
  averageTaxPerWorker: getBehaviouralAssumption('assumption.immigration.averageTaxPerWorker').centralValue,
  governmentSpendingPerPerson: getBehaviouralAssumption('assumption.immigration.governmentSpendingPerPerson').centralValue,
  infrastructureCostPerAdditionalPerson: getBehaviouralAssumption('assumption.immigration.infrastructureCostPerAdditionalPerson').centralValue,
  socialCohesionSensitivity: getBehaviouralAssumption('assumption.immigration.socialCohesionSensitivity').centralValue,
  environmentalPressurePerPerson: getBehaviouralAssumption('assumption.immigration.environmentalPressurePerPerson').centralValue,
};

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
  netOverseasMigration: immigrationCurrentPolicyValues.netOverseasMigration,
  naturalIncrease: immigrationBaselineValues.naturalIncrease,
  fertilityRate: immigrationBaselineValues.fertilityRate,
  deathRate: immigrationBaselineValues.deathRate,
  migrantWorkingAgeShare: immigrationAssumptionValues.migrantWorkingAgeShare,
  workforceParticipation: immigrationAssumptionValues.workforceParticipation,
  productivityGrowth: immigrationAssumptionValues.productivityGrowth,
  housingBuildRate: immigrationCurrentPolicyValues.housingBuildRate,
  constructionLabourConstraint: 35,
  healthAgedCareWorkerDemand: 2.3,
  averageTaxPerWorker: immigrationAssumptionValues.averageTaxPerWorker,
  governmentSpendingPerPerson: immigrationAssumptionValues.governmentSpendingPerPerson,
  infrastructureCostPerAdditionalPerson: immigrationAssumptionValues.infrastructureCostPerAdditionalPerson,
  regionalSettlementShare: immigrationCurrentPolicyValues.regionalSettlementShare,
  socialCohesionSensitivity: immigrationAssumptionValues.socialCohesionSensitivity,
  environmentalPressurePerPerson: immigrationAssumptionValues.environmentalPressurePerPerson,
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
    source: 'ABS National, state and territory population, year ending 31 December 2025; scenario projection path still requires review',
    confidence: 'high',
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
    source: 'ABS National, state and territory population, year ending 31 December 2025',
    confidence: 'high',
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
    source: 'Placeholder demographic assumption retained pending ABS fertility-series review',
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
    source: 'Placeholder demographic assumption retained pending ABS mortality-series review',
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
    source: 'Model assumption retained pending ABS/Home Affairs age-profile segmentation',
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
    source: 'Model assumption retained; ABS Labour Force May 2026 total labour context recorded separately',
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
    source: 'Model assumption retained; ABS National Accounts GDP context recorded separately',
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
    source: 'ABS Building Activity, March quarter 2026 completions annualised; construction capacity remains uncertain',
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
