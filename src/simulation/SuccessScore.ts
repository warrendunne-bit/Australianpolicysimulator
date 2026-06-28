import type { OutcomeScores } from './model';

export type SuccessWeights = {
  economicGrowth: number;
  wellbeing: number;
  fairness: number;
  socialCohesion: number;
  governmentFinances: number;
  environment: number;
};

export type SuccessScoreResult = {
  score: number;
  totalWeight: number;
  isValidWeightTotal: boolean;
  componentScores: SuccessWeights;
  topContributor: string;
  weakestFactor: string;
  explanation: string;
};

export const DEFAULT_SUCCESS_WEIGHTS: SuccessWeights = {
  economicGrowth: 20,
  wellbeing: 20,
  fairness: 15,
  socialCohesion: 15,
  governmentFinances: 15,
  environment: 15,
};

export function calculateSuccessScore(
  outcomes: OutcomeScores,
  weights: SuccessWeights,
): SuccessScoreResult {
  const componentScores: SuccessWeights = {
    economicGrowth: scoreEconomicGrowth(outcomes.economicGrowth),
    wellbeing: outcomes.wellbeing,
    fairness: outcomes.fairness,
    socialCohesion: outcomes.socialCohesion,
    governmentFinances: scoreGovernmentFinances(outcomes.governmentBalance),
    environment: 100 - outcomes.environmentalPressure,
  };
  const totalWeight = Object.values(weights).reduce((total, weight) => total + weight, 0);
  const weightedTotal = Object.entries(weights).reduce((total, [key, weight]) => {
    return total + componentScores[key as keyof SuccessWeights] * (weight / 100);
  }, 0);

  const drivers = getSuccessDrivers(componentScores, weights);

  return {
    score: clamp(weightedTotal, 0, 100),
    totalWeight,
    isValidWeightTotal: Math.abs(totalWeight - 100) < 0.001,
    componentScores,
    topContributor: drivers.topContributor,
    weakestFactor: drivers.weakestFactor,
    explanation: buildSuccessExplanation(drivers.topContributor, drivers.weakestFactor),
  };
}

export function buildYearlySuccessNarrative({
  year,
  currentScore,
  previousScore,
  topContributor,
  weakestFactor,
  feedbackExplanations,
}: {
  year: number;
  currentScore: number;
  previousScore?: number;
  topContributor: string;
  weakestFactor: string;
  feedbackExplanations: string[];
}) {
  const movement =
    previousScore === undefined
      ? `started at ${currentScore.toFixed(0)}`
      : currentScore >= previousScore
        ? `improved from ${previousScore.toFixed(0)} to ${currentScore.toFixed(0)}`
        : `fell from ${previousScore.toFixed(0)} to ${currentScore.toFixed(0)}`;
  const feedback =
    feedbackExplanations.find((item) => item.includes('increased') || item.includes('reduced')) ??
    feedbackExplanations[0] ??
    'No major feedback loop was triggered.';

  return `Year ${year}: Overall Success ${movement}. ${topContributor} contributed most under the current weights. The score was held back by ${weakestFactor.toLowerCase()}. ${feedback}`;
}

function scoreEconomicGrowth(growth: number) {
  return clamp(50 + growth * 8, 0, 100);
}

function scoreGovernmentFinances(balance: number) {
  return clamp(60 + balance * 0.35, 0, 100);
}

function getSuccessDrivers(componentScores: SuccessWeights, weights: SuccessWeights) {
  const weightedComponents = Object.entries(componentScores)
    .map(([key, score]) => ({
      label: getLabel(key as keyof SuccessWeights),
      score,
      weight: weights[key as keyof SuccessWeights],
      contribution: score * (weights[key as keyof SuccessWeights] / 100),
    }))
    .sort((a, b) => b.contribution - a.contribution);
  const strongest = weightedComponents[0];
  const weakest = [...weightedComponents].sort((a, b) => a.score - b.score)[0];

  return {
    topContributor: strongest.label,
    weakestFactor: weakest.label,
  };
}

function buildSuccessExplanation(topContributor: string, weakestFactor: string) {
  return `Overall success is mostly supported by ${topContributor.toLowerCase()}, but the score is held back by ${weakestFactor.toLowerCase()}.`;
}

function getLabel(key: keyof SuccessWeights) {
  if (key === 'economicGrowth') return 'Economic Growth';
  if (key === 'wellbeing') return 'Wellbeing';
  if (key === 'fairness') return 'Fairness';
  if (key === 'socialCohesion') return 'Social Cohesion';
  if (key === 'governmentFinances') return 'Government Finances';
  return 'Environment Score';
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}
