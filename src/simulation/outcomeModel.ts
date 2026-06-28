import type { AnnualOutcome, OutcomeScores } from './outcomes';
import type { PolicySettings, SimulationHorizon } from './World';

export type PolicyInputKey = keyof PolicySettings;

export type PolicyInputDefinition = {
  key: PolicyInputKey;
  label: string;
  min: number;
  max: number;
  step: number;
  unit: string;
  explanation: string;
};

export type ModelAssumption = {
  label: string;
  value: string;
  explanation: string;
};

export type OutcomeDefinition = {
  key: keyof Pick<
    OutcomeScores,
    | 'economicGrowth'
    | 'wellbeing'
    | 'fairness'
    | 'socialCohesion'
    | 'governmentBalance'
    | 'environmentalPressure'
    | 'housingStress'
  >;
  label: string;
  shortLabel: string;
  lowerIsBetter: boolean;
  score: (outcomes: OutcomeScores) => number;
  explanation: (outcomes: OutcomeScores) => string;
};

export type OutcomeFactorRow = {
  key: string;
  label: string;
  score: number;
  previousScore?: number;
  explanation: string;
  lowerIsBetter?: boolean;
};

export const MODEL_ASSUMPTIONS = {
  basePopulation: 27_000_000,
  peoplePerImmigrationPercent: 100_000,
  averageHouseholdSize: 2.5,
  baseEconomicGrowth: 2,
  scope:
    'Illustrative scenario model only. It is not calibrated to official Australian forecasts, budget estimates or policy advice.',
} as const;

export const MODEL_ASSUMPTION_LIST: ModelAssumption[] = [
  {
    label: 'Model scope',
    value: 'Illustrative only',
    explanation:
      'The simulator is intended for comparing broad scenarios and trade-offs, not predicting official outcomes.',
  },
  {
    label: 'Starting population',
    value: MODEL_ASSUMPTIONS.basePopulation.toLocaleString(),
    explanation: 'Population starts from a rounded baseline for simple scenario arithmetic.',
  },
  {
    label: 'Migration input',
    value: `${MODEL_ASSUMPTIONS.peoplePerImmigrationPercent.toLocaleString()} people per percentage point`,
    explanation:
      'Each immigration-rate percentage point adds a simplified annual population increment.',
  },
  {
    label: 'Household demand',
    value: `${MODEL_ASSUMPTIONS.averageHouseholdSize} people per household`,
    explanation: 'Housing demand is approximated from population growth and average household size.',
  },
  {
    label: 'Fairness score',
    value: '0 to 100 directional score',
    explanation:
      'Fairness compares representative household outcomes; it is not a measured inequality statistic.',
  },
  {
    label: 'Government finances',
    value: 'Simplified balance units',
    explanation:
      'Revenue and spending drivers are transparent scenario components, not budget forecasts.',
  },
];

export const POLICY_INPUT_DEFINITIONS: PolicyInputDefinition[] = [
  {
    key: 'immigrationRate',
    label: 'Immigration Rate',
    min: 0,
    max: 5,
    step: 0.1,
    unit: 'annual population growth input',
    explanation: 'Higher migration can lift labour supply and growth, but increases housing and service demand.',
  },
  {
    key: 'housingBuildRate',
    label: 'Housing Build Rate',
    min: 50_000,
    max: 350_000,
    step: 5_000,
    unit: 'homes per year',
    explanation: 'More construction reduces housing stress when it keeps pace with household demand.',
  },
  {
    key: 'integrationEffectiveness',
    label: 'Integration Effectiveness',
    min: 0,
    max: 100,
    step: 1,
    unit: 'capacity score',
    explanation: 'Integration affects cohesion, household outcomes and service pressure.',
  },
  {
    key: 'skillsAlignment',
    label: 'Skills Alignment',
    min: 0,
    max: 100,
    step: 1,
    unit: 'match score',
    explanation: 'Skills alignment affects productivity, hiring demand and growth benefits.',
  },
  {
    key: 'infrastructureReadiness',
    label: 'Infrastructure Readiness',
    min: 0,
    max: 100,
    step: 1,
    unit: 'capacity score',
    explanation: 'Infrastructure readiness affects absorptive capacity and government spending pressure.',
  },
  {
    key: 'taxRate',
    label: 'Tax Rate',
    min: 0,
    max: 50,
    step: 1,
    unit: 'of income',
    explanation: 'Higher tax improves revenue but can drag on growth and household consumption.',
  },
  {
    key: 'stimulusRate',
    label: 'Government Stimulus',
    min: 0,
    max: 10,
    step: 0.5,
    unit: 'extra spending',
    explanation: 'Stimulus can support growth and wellbeing while worsening finances and pressure.',
  },
];

export const OUTCOME_DEFINITIONS: OutcomeDefinition[] = [
  {
    key: 'economicGrowth',
    label: 'Economic Growth',
    shortLabel: 'Growth',
    lowerIsBetter: false,
    score: (outcomes) => scoreEconomicGrowth(outcomes.economicGrowth),
    explanation: (outcomes) =>
      `Economic growth is a directional annual growth score derived from company productivity, migration, tax, stimulus, housing stress and events. Current raw value: ${outcomes.economicGrowth.toFixed(1)}.`,
  },
  {
    key: 'wellbeing',
    label: 'Wellbeing / Happiness',
    shortLabel: 'Wellbeing',
    lowerIsBetter: false,
    score: (outcomes) => outcomes.wellbeing,
    explanation: () =>
      'Wellbeing reflects representative household consumption, housing security and social connection.',
  },
  {
    key: 'fairness',
    label: 'Fairness',
    shortLabel: 'Fairness',
    lowerIsBetter: false,
    score: (outcomes) => outcomes.fairness,
    explanation: (outcomes) => outcomes.fairnessExplanation,
  },
  {
    key: 'socialCohesion',
    label: 'Social Cohesion',
    shortLabel: 'Cohesion',
    lowerIsBetter: false,
    score: (outcomes) => outcomes.socialCohesion,
    explanation: () =>
      'Social cohesion reflects integration, service capacity, trust, household connection and housing pressure.',
  },
  {
    key: 'governmentBalance',
    label: 'Government Finances',
    shortLabel: 'Finances',
    lowerIsBetter: false,
    score: (outcomes) => scoreGovernmentFinances(outcomes.governmentBalance),
    explanation: (outcomes) =>
      `Government finances convert the simplified budget balance into a 0 to 100 component score. Current balance: ${outcomes.governmentBalance.toFixed(1)}.`,
  },
  {
    key: 'environmentalPressure',
    label: 'Environment Score',
    shortLabel: 'Environment',
    lowerIsBetter: true,
    score: (outcomes) => scoreEnvironment(outcomes.environmentalPressure),
    explanation: () =>
      'Environment score is calculated as 100 minus environmental pressure; lower pressure is better.',
  },
  {
    key: 'housingStress',
    label: 'Housing Stress',
    shortLabel: 'Housing Stress',
    lowerIsBetter: true,
    score: (outcomes) => outcomes.housingStress,
    explanation: () =>
      'Housing stress compares estimated household demand with housing supply and capacity pressure; lower stress is better.',
  },
];

export const BASELINE_COMPARISON_OUTCOMES = OUTCOME_DEFINITIONS.filter((definition) =>
  [
    'economicGrowth',
    'wellbeing',
    'fairness',
    'housingStress',
    'governmentBalance',
    'environmentalPressure',
  ].includes(definition.key),
);

export const ENTITY_IMPACT_COLUMNS = [
  { key: 'economicGrowth', label: 'Growth' },
  { key: 'wellbeing', label: 'Wellbeing' },
  { key: 'fairness', label: 'Fairness' },
  { key: 'socialCohesion', label: 'Cohesion' },
  { key: 'governmentFinances', label: 'Finances' },
  { key: 'environmentalPressure', label: 'Env. Pressure' },
] as const;

export function scoreEconomicGrowth(growth: number) {
  return clamp(50 + growth * 8, 0, 100);
}

export function scoreGovernmentFinances(balance: number) {
  return clamp(60 + balance * 0.35, 0, 100);
}

export function scoreEnvironment(environmentalPressure: number) {
  return clamp(100 - environmentalPressure, 0, 100);
}

export function buildOutcomeFactorRows({
  outcomes,
  previousOutcomes,
}: {
  outcomes: OutcomeScores;
  previousOutcomes?: AnnualOutcome;
}): OutcomeFactorRow[] {
  return OUTCOME_DEFINITIONS.map((definition) => ({
    key: definition.key,
    label: definition.label,
    score: definition.score(outcomes),
    previousScore: previousOutcomes ? definition.score(previousOutcomes) : undefined,
    explanation: definition.explanation(outcomes),
    lowerIsBetter: definition.key === 'housingStress',
  }));
}

export function buildTransparentCalculationNotes({
  outcomes,
  metrics,
}: {
  outcomes: OutcomeScores;
  metrics: {
    immigrationGrowthBoost: number;
    stimulusGrowthBoost: number;
    taxGrowthDrag: number;
    housingGrowthDrag: number;
  };
}) {
  return [
    `Population begins at ${MODEL_ASSUMPTIONS.basePopulation.toLocaleString()} and adds ${MODEL_ASSUMPTIONS.peoplePerImmigrationPercent.toLocaleString()} people per immigration percentage point in each annual step.`,
    `Absorptive capacity averages housing capacity, integration, skills and infrastructure = ${outcomes.absorptiveCapacityScore.toFixed(1)}.`,
    `Economic growth combines company productivity, migration boost ${formatSignedPercent(metrics.immigrationGrowthBoost)}, stimulus ${formatSignedPercent(metrics.stimulusGrowthBoost)}, tax drag ${formatSignedPercent(metrics.taxGrowthDrag)}, housing drag ${formatSignedPercent(metrics.housingGrowthDrag)} and active event effects.`,
    `Fairness score ${outcomes.fairness.toFixed(1)} compares representative household outcomes and penalises stress falling more heavily on renters and young workers.`,
  ];
}

export function buildScenarioSummary(
  policies: PolicySettings,
  horizon: SimulationHorizon,
  selectedEventIds: string[],
  outcomes: OutcomeScores,
) {
  const eventText = selectedEventIds.length ? selectedEventIds.join(', ') : 'none';

  return [
    `Australia Social Simulator scenario (${horizon} year${horizon === 1 ? '' : 's'})`,
    `Settings: immigration ${policies.immigrationRate.toFixed(1)}%, housing ${policies.housingBuildRate.toLocaleString()} homes/year, integration ${policies.integrationEffectiveness}, skills ${policies.skillsAlignment}, infrastructure ${policies.infrastructureReadiness}, tax ${policies.taxRate.toFixed(1)}%, stimulus ${policies.stimulusRate.toFixed(1)}%.`,
    `Events selected: ${eventText}.`,
    `Headline illustrative outcomes: growth ${outcomes.economicGrowth.toFixed(1)}%, wellbeing ${outcomes.wellbeing.toFixed(1)}, fairness ${outcomes.fairness.toFixed(1)}, social cohesion ${outcomes.socialCohesion.toFixed(1)}, budget balance ${outcomes.governmentBalance.toFixed(1)}, environmental pressure ${outcomes.environmentalPressure.toFixed(1)}.`,
    'Disclaimer: this is an illustrative simplified simulator, not an official forecast, cost estimate or policy recommendation.',
  ].join('\n');
}

function formatSignedPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}
