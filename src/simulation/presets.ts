import type { PolicySettings } from './World';
import { GENERAL_DEFAULT_POLICY_VALUES } from '../model';

export type ScenarioPreset = {
  id: string;
  name: string;
  description: string;
  policies: PolicySettings;
};

export const DEFAULT_POLICY_SETTINGS: PolicySettings = {
  immigrationRate: GENERAL_DEFAULT_POLICY_VALUES.immigrationRate,
  housingBuildRate: GENERAL_DEFAULT_POLICY_VALUES.housingBuildRate,
  integrationEffectiveness: GENERAL_DEFAULT_POLICY_VALUES.integrationEffectiveness,
  skillsAlignment: GENERAL_DEFAULT_POLICY_VALUES.skillsAlignment,
  infrastructureReadiness: GENERAL_DEFAULT_POLICY_VALUES.infrastructureReadiness,
  taxRate: GENERAL_DEFAULT_POLICY_VALUES.taxRate,
  stimulusRate: GENERAL_DEFAULT_POLICY_VALUES.stimulusRate,
};

export const SCENARIO_PRESETS: ScenarioPreset[] = [
  {
    id: 'balanced',
    name: 'Balanced',
    description: 'Keeps settings close to the default illustrative assumptions.',
    policies: DEFAULT_POLICY_SETTINGS,
  },
  {
    id: 'housing-first',
    name: 'Housing First',
    description: 'Prioritises construction and infrastructure capacity to reduce household stress.',
    policies: {
      immigrationRate: 2,
      housingBuildRate: 300_000,
      integrationEffectiveness: 70,
      skillsAlignment: 70,
      infrastructureReadiness: 78,
      taxRate: 26,
      stimulusRate: 3,
    },
  },
  {
    id: 'high-migration',
    name: 'High Migration',
    description: 'Tests stronger population growth with better skills alignment and integration support.',
    policies: {
      immigrationRate: 4,
      housingBuildRate: 220_000,
      integrationEffectiveness: 78,
      skillsAlignment: 82,
      infrastructureReadiness: 68,
      taxRate: 25,
      stimulusRate: 3,
    },
  },
  {
    id: 'fiscal-repair',
    name: 'Fiscal Repair',
    description: 'Raises revenue and reduces stimulus to improve the budget balance.',
    policies: {
      immigrationRate: 1.6,
      housingBuildRate: 170_000,
      integrationEffectiveness: 62,
      skillsAlignment: 68,
      infrastructureReadiness: 58,
      taxRate: 32,
      stimulusRate: 1,
    },
  },
  {
    id: 'green-transition',
    name: 'Green Transition',
    description: 'Uses infrastructure and moderate stimulus to support wellbeing while limiting pressure.',
    policies: {
      immigrationRate: 1.8,
      housingBuildRate: 230_000,
      integrationEffectiveness: 72,
      skillsAlignment: 78,
      infrastructureReadiness: 82,
      taxRate: 28,
      stimulusRate: 4,
    },
  },
  {
    id: 'high-stimulus',
    name: 'High Stimulus',
    description: 'Explores a demand-support approach with stronger short-term growth and fiscal trade-offs.',
    policies: {
      immigrationRate: 2.4,
      housingBuildRate: 210_000,
      integrationEffectiveness: 66,
      skillsAlignment: 72,
      infrastructureReadiness: 64,
      taxRate: 24,
      stimulusRate: 8,
    },
  },
];
