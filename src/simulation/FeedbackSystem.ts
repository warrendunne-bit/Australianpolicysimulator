import type { OutcomeScores, PolicySettings, SimulationEvent } from './model';

export type FeedbackState = {
  publicPressure: number;
  trustInGovernment: number;
  businessConfidence: number;
  householdStress: number;
  fiscalCapacity: number;
  infrastructurePressure: number;
  policyEffectiveness: number;
};

export type FeedbackEffects = {
  spendingPressure: number;
  wellbeingSupport: number;
  fiscalDrag: number;
  policyEffectivenessMultiplier: number;
  businessInvestmentDrag: number;
  householdIncomeDrag: number;
  housingStressPressure: number;
  infrastructureSpendingPressure: number;
  climateDisasterCost: number;
};

export type FeedbackResult = {
  state: FeedbackState;
  nextEffects: FeedbackEffects;
  explanations: string[];
};

export const DEFAULT_FEEDBACK_STATE: FeedbackState = {
  publicPressure: 35,
  trustInGovernment: 62,
  businessConfidence: 62,
  householdStress: 38,
  fiscalCapacity: 65,
  infrastructurePressure: 38,
  policyEffectiveness: 68,
};

export const DEFAULT_FEEDBACK_EFFECTS: FeedbackEffects = {
  spendingPressure: 0,
  wellbeingSupport: 0,
  fiscalDrag: 0,
  policyEffectivenessMultiplier: 1,
  businessInvestmentDrag: 0,
  householdIncomeDrag: 0,
  housingStressPressure: 0,
  infrastructureSpendingPressure: 0,
  climateDisasterCost: 0,
};

export function calculateFeedbackPressures({
  outcomes,
  policies,
  previousState,
  activeEvents,
}: {
  outcomes: OutcomeScores;
  policies: PolicySettings;
  previousState: FeedbackState;
  activeEvents: SimulationEvent[];
}): FeedbackResult {
  const publicPressure = clamp(
    previousState.publicPressure * 0.35 +
      (100 - outcomes.wellbeing) * 0.38 +
      outcomes.housingStress * 0.2 +
      Math.max(0, -outcomes.governmentBalance) * 0.05,
    0,
    100,
  );
  const fiscalCapacity = clamp(
    previousState.fiscalCapacity * 0.4 +
      70 -
      Math.max(0, -outcomes.governmentBalance) * 0.28 -
      policies.stimulusRate * 1.1,
    0,
    100,
  );
  const trustInGovernment = clamp(
    previousState.trustInGovernment * 0.4 +
      outcomes.socialCohesion * 0.24 +
      fiscalCapacity * 0.2 +
      (100 - publicPressure) * 0.16,
    0,
    100,
  );
  const businessConfidence = clamp(
    previousState.businessConfidence * 0.35 +
      (50 + outcomes.economicGrowth * 8) * 0.3 +
      fiscalCapacity * 0.15 +
      (100 - outcomes.housingStress) * 0.1 +
      trustInGovernment * 0.1,
    0,
    100,
  );
  const householdStress = clamp(
    previousState.householdStress * 0.35 +
      outcomes.housingStress * 0.35 +
      (100 - outcomes.wellbeing) * 0.25 +
      Math.max(0, -outcomes.economicGrowth) * 3,
    0,
    100,
  );
  const infrastructurePressure = clamp(
    previousState.infrastructurePressure * 0.3 +
      policies.immigrationRate * 9 +
      outcomes.housingStress * 0.28 +
      Math.max(0, outcomes.populationIncrease / 100_000) * 4,
    0,
    100,
  );
  const policyEffectiveness = clamp(
    previousState.policyEffectiveness * 0.3 +
      outcomes.socialCohesion * 0.36 +
      trustInGovernment * 0.24 +
      (100 - publicPressure) * 0.1,
    0,
    100,
  );

  const state: FeedbackState = {
    publicPressure,
    trustInGovernment,
    businessConfidence,
    householdStress,
    fiscalCapacity,
    infrastructurePressure,
    policyEffectiveness,
  };

  return {
    state,
    nextEffects: {
      spendingPressure: Math.max(0, publicPressure - 55) * 0.55,
      wellbeingSupport: Math.max(0, publicPressure - 55) * 0.08,
      fiscalDrag: Math.max(0, 55 - fiscalCapacity) * 0.05,
      policyEffectivenessMultiplier: 0.72 + (policyEffectiveness / 100) * 0.45,
      businessInvestmentDrag: Math.max(0, 55 - businessConfidence) * 0.12,
      householdIncomeDrag: Math.max(0, 55 - businessConfidence) * 0.045,
      housingStressPressure: Math.max(0, infrastructurePressure - 55) * 0.16,
      infrastructureSpendingPressure: Math.max(0, infrastructurePressure - 60) * 0.45,
      climateDisasterCost:
        Math.max(0, outcomes.environmentalPressure - 60) * 0.28 +
        activeEvents.filter((event) => event.kind === 'climate event').length * 6,
    },
    explanations: buildFeedbackExplanations(state, outcomes),
  };
}

function buildFeedbackExplanations(state: FeedbackState, outcomes: OutcomeScores) {
  const explanations = [
    state.publicPressure > 55
      ? 'Lower wellbeing increased public pressure, which caused government spending pressure to rise in the following year.'
      : 'Public pressure stayed contained because wellbeing and housing stress were not severe enough to force extra spending pressure.',
    state.fiscalCapacity < 55
      ? 'Higher deficits reduced fiscal capacity, making future stimulus and services harder to fund.'
      : 'Fiscal capacity stayed usable because the budget position did not create severe debt pressure.',
    state.policyEffectiveness < 55
      ? 'Falling social cohesion reduced policy effectiveness, so future policy settings deliver weaker results.'
      : 'Policy effectiveness held up because cohesion and trust remained high enough for policies to work.',
    state.businessConfidence < 55
      ? 'Lower business confidence reduced future investment and hiring, which then weighs on household income and spending.'
      : 'Business confidence supported investment and hiring, helping household income and spending in later years.',
    state.infrastructurePressure > 55
      ? 'Population growth increased housing and infrastructure pressure because supply did not fully keep up.'
      : 'Infrastructure pressure remained manageable because population growth and housing stress were absorbed.',
    outcomes.environmentalPressure > 60
      ? 'Higher environmental pressure increased future climate and disaster costs.'
      : 'Environmental pressure did not create major future disaster costs in this year.',
  ];

  return explanations;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}
