import type { PolicySetting } from '../types';
import { ACTIVE_BASELINE_VERSION_ID } from '../data/baseline/baselineVersions';

function policy(setting: Omit<PolicySetting, 'classification' | 'baselineVersion'>): PolicySetting {
  return { ...setting, classification: 'policy-setting', baselineVersion: ACTIVE_BASELINE_VERSION_ID };
}

export const POLICY_SETTINGS: PolicySetting[] = [
  policy({ id: 'policy.general.default.immigrationRate', name: 'General simulator immigration rate', description: 'Default abstract migration input used by the general simulator.', value: 2, unit: 'annual population growth input', confidenceRating: 'low', materiality: 'high', userControlled: true, affectedModelAreas: ['population', 'housing', 'growth', 'services'], notes: 'Policy setting retained as an abstract scenario control; not observed data.' }),
  policy({ id: 'policy.general.default.housingBuildRate', name: 'General simulator housing build rate', description: 'Default annual housing construction input used by the general simulator.', value: 175_264, unit: 'homes/year', confidenceRating: 'moderate', materiality: 'high', userControlled: true, affectedModelAreas: ['housing', 'wellbeing', 'fairness'], notes: 'Aligned to annualised ABS March quarter 2026 completions; scenario control remains user-editable.' }),
  policy({ id: 'policy.general.default.integrationEffectiveness', name: 'General simulator integration effectiveness', description: 'Default policy/service capacity index.', value: 65, unit: '0-100 index', confidenceRating: 'exploratory', materiality: 'high', userControlled: true, affectedModelAreas: ['cohesion', 'wellbeing', 'services'], notes: 'Policy/service setting; exploratory pending evidence review.' }),
  policy({ id: 'policy.general.default.skillsAlignment', name: 'General simulator skills alignment', description: 'Default policy/economy match index.', value: 70, unit: '0-100 index', confidenceRating: 'exploratory', materiality: 'high', userControlled: true, affectedModelAreas: ['productivity', 'growth', 'tax revenue'], notes: 'Policy/economic setting; exploratory pending evidence review.' }),
  policy({ id: 'policy.general.default.infrastructureReadiness', name: 'General simulator infrastructure readiness', description: 'Default infrastructure capacity setting.', value: 60, unit: '0-100 index', confidenceRating: 'exploratory', materiality: 'high', userControlled: true, affectedModelAreas: ['housing', 'services', 'cohesion'], notes: 'Policy/capacity setting; exploratory pending evidence review.' }),
  policy({ id: 'policy.general.default.taxRate', name: 'General simulator tax rate', description: 'Default tax policy input used by the general simulator.', value: 25, unit: 'percent/income index', confidenceRating: 'low', materiality: 'high', userControlled: true, affectedModelAreas: ['government finances', 'consumption', 'investment'], notes: 'Abstract policy input; not an observed average tax rate.' }),
  policy({ id: 'policy.general.default.stimulusRate', name: 'General simulator stimulus rate', description: 'Default fiscal stimulus/spending input.', value: 2, unit: 'extra spending index', confidenceRating: 'low', materiality: 'medium', userControlled: true, affectedModelAreas: ['growth', 'spending', 'environment'], notes: 'Abstract policy input.' }),
  policy({ id: 'policy.immigration.currentPath.netOverseasMigration', name: 'Current-path net overseas migration setting', description: 'Current-path annual NOM scenario setting used by the immigration topic model.', value: 301_000, unit: 'people/year', confidenceRating: 'high', materiality: 'high', userControlled: true, affectedModelAreas: ['population', 'housing', 'labour', 'fiscal', 'environment'], notes: 'Aligned to ABS year-ending Dec 2025 NOM for v1.0 baseline; future phase should separate observed actuals from Treasury forecast path.' }),
  policy({ id: 'policy.immigration.currentPath.housingBuildRate', name: 'Current-path housing build rate setting', description: 'Annual dwelling construction setting used by the immigration current path.', value: 175_264, unit: 'dwellings/year', confidenceRating: 'moderate', materiality: 'high', userControlled: true, affectedModelAreas: ['housing', 'services', 'capital city pressure'], notes: 'Annualised ABS March quarter 2026 completions; volatile quarterly value.' }),
  policy({ id: 'policy.immigration.currentPath.regionalSettlementShare', name: 'Regional settlement share', description: 'Share of arrivals directed/settling regionally in the current-path scenario.', value: 18, unit: 'percent', confidenceRating: 'low', materiality: 'medium', userControlled: true, affectedModelAreas: ['regions', 'capital city pressure', 'services'], notes: 'Retained from Phase 1B pending Home Affairs/ABS regional settlement review.' }),
];

export function getPolicySetting(id: string) {
  const setting = POLICY_SETTINGS.find((item) => item.id === id);
  if (!setting) throw new Error(`Unknown policy setting: ${id}`);
  return setting;
}
