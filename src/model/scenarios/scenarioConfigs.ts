import type { ScenarioConfig } from '../types';
import { ACTIVE_BASELINE_VERSION_ID } from '../data/baseline/baselineVersions';

export const SCENARIO_CONFIGS: ScenarioConfig[] = [
  {
    id: 'scenario.general.default',
    name: 'General simulator default scenario',
    description: 'Default settings used by the general cockpit simulator.',
    baselineVersionId: ACTIVE_BASELINE_VERSION_ID,
    policySettingIds: [
      'policy.general.default.immigrationRate',
      'policy.general.default.housingBuildRate',
      'policy.general.default.integrationEffectiveness',
      'policy.general.default.skillsAlignment',
      'policy.general.default.infrastructureReadiness',
      'policy.general.default.taxRate',
      'policy.general.default.stimulusRate',
    ],
    assumptionIds: [
      'assumption.general.peoplePerImmigrationPercent',
      'assumption.general.baseEconomicGrowth',
    ],
    notes: 'Migrated from existing defaults; still illustrative.',
  },
  {
    id: 'scenario.immigration.currentPath',
    name: 'Immigration current path',
    description: 'Current-path immigration scenario using the reviewed v1.0 Australian baseline plus documented current-policy scenario settings.',
    baselineVersionId: ACTIVE_BASELINE_VERSION_ID,
    policySettingIds: [
      'policy.immigration.currentPath.netOverseasMigration',
      'policy.immigration.currentPath.housingBuildRate',
      'policy.immigration.currentPath.regionalSettlementShare',
    ],
    assumptionIds: [
      'assumption.immigration.migrantWorkingAgeShare',
      'assumption.immigration.workforceParticipation',
      'assumption.immigration.productivityGrowth',
      'assumption.immigration.averageTaxPerWorker',
      'assumption.immigration.governmentSpendingPerPerson',
      'assumption.immigration.infrastructureCostPerAdditionalPerson',
      'assumption.immigration.socialCohesionSensitivity',
      'assumption.immigration.environmentalPressurePerPerson',
    ],
    notes: 'Current path separates observed baseline facts from scenario settings and forecast/trend assumptions. See currentPolicyBaseline.ts.',
  },
];

export function getScenarioConfig(id: string) {
  const scenario = SCENARIO_CONFIGS.find((item) => item.id === id);
  if (!scenario) throw new Error(`Unknown scenario config: ${id}`);
  return scenario;
}
