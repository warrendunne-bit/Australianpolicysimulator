export * from './types';
export { ACTIVE_BASELINE_VERSION_ID, BASELINE_VERSIONS, getActiveBaselineVersion } from './data/baseline/baselineVersions';
export { BASELINE_VARIABLES, getBaselineVariable } from './data/baseline/variables';
export { BEHAVIOURAL_ASSUMPTIONS, getBehaviouralAssumption } from './assumptions/behaviouralAssumptions';
export { POLICY_SETTINGS, getPolicySetting } from './policies/policySettings';
export { SCENARIO_CONFIGS, getScenarioConfig } from './scenarios/scenarioConfigs';
export { CURRENT_POLICY_BASELINE_DEFINITION } from './scenarios/currentPolicyBaseline';
export { validateModelConfiguration } from './validation/validateModelConfiguration';
export { runBaselineBackTest } from './validation/backTest';
export { runMigrationSensitivity, runExpandedSensitivity } from './validation/sensitivity';
export { buildDataProvenanceRows } from './commentary/provenance';
export { buildCommentaryTrace } from './commentary/commentaryTrace';

import { BEHAVIOURAL_ASSUMPTIONS, getBehaviouralAssumption } from './assumptions/behaviouralAssumptions';
import { BASELINE_VERSIONS, getActiveBaselineVersion } from './data/baseline/baselineVersions';
import { BASELINE_VARIABLES, getBaselineVariable } from './data/baseline/variables';
import { POLICY_SETTINGS, getPolicySetting } from './policies/policySettings';
import { SCENARIO_CONFIGS, getScenarioConfig } from './scenarios/scenarioConfigs';
import type { ModelConfiguration, ScenarioPolicySnapshot } from './types';

export const MODEL_CONFIGURATION: ModelConfiguration = {
  baselineVariables: BASELINE_VARIABLES,
  behaviouralAssumptions: BEHAVIOURAL_ASSUMPTIONS,
  policySettings: POLICY_SETTINGS,
  scenarios: SCENARIO_CONFIGS,
  baselineVersions: BASELINE_VERSIONS,
};

export const GENERAL_BASELINE_VALUES = {
  population: getBaselineVariable('baseline.population.generalSimulator').value,
  averageHouseholdSize: getBaselineVariable('baseline.housing.householdSize.general').value,
  baseGovernmentRevenue: getBaselineVariable('baseline.fiscal.generalRevenue').value,
  baseGovernmentSpending: getBaselineVariable('baseline.fiscal.generalSpending').value,
  peoplePerImmigrationPercent: getBehaviouralAssumption('assumption.general.peoplePerImmigrationPercent').centralValue,
  baseEconomicGrowth: getBehaviouralAssumption('assumption.general.baseEconomicGrowth').centralValue,
} as const;

export const GENERAL_DEFAULT_POLICY_VALUES = {
  immigrationRate: getPolicySetting('policy.general.default.immigrationRate').value,
  housingBuildRate: getPolicySetting('policy.general.default.housingBuildRate').value,
  integrationEffectiveness: getPolicySetting('policy.general.default.integrationEffectiveness').value,
  skillsAlignment: getPolicySetting('policy.general.default.skillsAlignment').value,
  infrastructureReadiness: getPolicySetting('policy.general.default.infrastructureReadiness').value,
  taxRate: getPolicySetting('policy.general.default.taxRate').value,
  stimulusRate: getPolicySetting('policy.general.default.stimulusRate').value,
} as const;

export const IMMIGRATION_BASELINE_VALUES = {
  startYear: getActiveBaselineVersion().referenceYear,
  basePopulation: getBaselineVariable('baseline.population.total').value,
  baseDwellings: getBaselineVariable('baseline.housing.dwellingStock').value,
  migrantsAlreadyInAustralia: getBaselineVariable('baseline.population.migrantStock').value,
  naturalIncrease: getBaselineVariable('baseline.demography.naturalIncrease').value,
  fertilityRate: getBaselineVariable('baseline.demography.fertilityRate').value,
  deathRate: getBaselineVariable('baseline.demography.deathRate').value,
  householdSize: getBaselineVariable('baseline.housing.householdSize.immigration').value,
} as const;

export const IMMIGRATION_CURRENT_POLICY_VALUES = {
  netOverseasMigration: getPolicySetting('policy.immigration.currentPath.netOverseasMigration').value,
  housingBuildRate: getPolicySetting('policy.immigration.currentPath.housingBuildRate').value,
  regionalSettlementShare: getPolicySetting('policy.immigration.currentPath.regionalSettlementShare').value,
} as const;

export const IMMIGRATION_ASSUMPTION_VALUES = {
  migrantWorkingAgeShare: getBehaviouralAssumption('assumption.immigration.migrantWorkingAgeShare').centralValue,
  workforceParticipation: getBehaviouralAssumption('assumption.immigration.workforceParticipation').centralValue,
  productivityGrowth: getBehaviouralAssumption('assumption.immigration.productivityGrowth').centralValue,
  averageTaxPerWorker: getBehaviouralAssumption('assumption.immigration.averageTaxPerWorker').centralValue,
  governmentSpendingPerPerson: getBehaviouralAssumption('assumption.immigration.governmentSpendingPerPerson').centralValue,
  infrastructureCostPerAdditionalPerson: getBehaviouralAssumption('assumption.immigration.infrastructureCostPerAdditionalPerson').centralValue,
  socialCohesionSensitivity: getBehaviouralAssumption('assumption.immigration.socialCohesionSensitivity').centralValue,
  environmentalPressurePerPerson: getBehaviouralAssumption('assumption.immigration.environmentalPressurePerPerson').centralValue,
} as const;

export function createScenarioPolicySnapshot(
  scenarioId: string,
  overrides: Record<string, number> = {},
): ScenarioPolicySnapshot {
  const scenario = getScenarioConfig(scenarioId);
  const policyValues = Object.fromEntries(
    scenario.policySettingIds.map((id) => [id, overrides[id] ?? getPolicySetting(id).value]),
  );
  return {
    scenarioId,
    baselineVersionId: scenario.baselineVersionId,
    policyValues,
  };
}
