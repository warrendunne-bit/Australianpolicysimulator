import type { FeedbackState } from './FeedbackSystem';
import {
  financeScore,
  getCapacityStatus,
  getFinanceExplanation,
  type CapacityStatus,
  type FinanceRating,
  type Government,
  type Environment,
  type Household,
  weightedAverage,
  clamp,
} from './entities';
import type { EntityDashboardItem } from './entityInsights';
import type { World } from './World';

export type OutcomeScores = {
  population: number;
  populationIncrease: number;
  housingDemand: number;
  housingGap: number;
  housingStress: number;
  housingBuildCapacityScore: number;
  absorptiveCapacityScore: number;
  absorptiveCapacityStatus: CapacityStatus;
  economicGrowth: number;
  wellbeing: number;
  socialCohesion: number;
  governmentFinances: FinanceRating;
  governmentBalance: number;
  environmentalPressure: number;
};

export type YearSummary = {
  title: string;
  narrative: string;
  whatChanged: string;
  feedbackLoop: string;
};

export type AnnualOutcome = OutcomeScores & {
  year: number;
  activeEvents: string[];
  feedback: FeedbackState;
  feedbackExplanations: string[];
  entityDashboard: EntityDashboardItem[];
  positiveDrivers: string[];
  negativeDrivers: string[];
  yearSummary: YearSummary;
  narrativeSummary: string;
};

export type WellbeingFactor = {
  name: string;
  score: number;
  explanation: string;
};

export type OutcomeContributionKey =
  | 'economicGrowth'
  | 'wellbeing'
  | 'socialCohesion'
  | 'governmentFinances'
  | 'environmentalPressure';

export function calculateOutcomes(
  world: World,
  population: number,
  populationIncrease: number,
  housingDemand: number,
  housingGap: number,
  housingStress: number,
  households: Household[],
  government: Government,
  environment: Environment,
  economicGrowth: number,
): OutcomeScores {
  const housingBuildCapacityScore = clamp((world.policies.housingBuildRate / 350_000) * 100, 0, 100);
  const absorptiveCapacityScore = clamp(
    (housingBuildCapacityScore +
      world.policies.integrationEffectiveness +
      world.policies.skillsAlignment +
      world.policies.infrastructureReadiness) /
      4,
    0,
    100,
  );
  const wellbeing = weightedAverage(households, 'wellbeing');
  const socialCohesion = clamp(
    weightedAverage(households, 'cohesion') * 0.55 +
      absorptiveCapacityScore * 0.2 +
      government.serviceCapacity * 0.15 +
      (100 - housingStress) * 0.1,
    0,
    100,
  );

  return {
    population,
    populationIncrease,
    housingDemand,
    housingGap,
    housingStress,
    housingBuildCapacityScore,
    absorptiveCapacityScore,
    absorptiveCapacityStatus: getCapacityStatus(absorptiveCapacityScore),
    economicGrowth,
    wellbeing,
    socialCohesion,
    governmentFinances: government.financeRating,
    governmentBalance: government.budgetBalance,
    environmentalPressure: environment.pressure,
  };
}

export function calculateMetrics(world: World, economicGrowth: number, housingStress: number) {
  return {
    immigrationGrowthBoost:
      world.policies.immigrationRate *
      0.5 *
      ((world.policies.integrationEffectiveness + world.policies.skillsAlignment) / 200),
    stimulusGrowthBoost: world.policies.stimulusRate * 0.2,
    taxGrowthDrag: world.policies.taxRate * 0.05,
    housingGrowthDrag: housingStress * 0.01,
    taxRevenueBoost: world.policies.taxRate * 6,
    growthRevenueBoost: Math.max(0, economicGrowth) * 20,
    integrationSkillsRevenueBoost:
      ((world.policies.integrationEffectiveness + world.policies.skillsAlignment) / 2 - 50) * 2,
    stimulusSpendingBoost: world.policies.stimulusRate * 15,
    integrationSupportCosts: Math.max(0, 70 - world.policies.integrationEffectiveness) * 2,
    infrastructureSpendingPressure: Math.max(0, 70 - world.policies.infrastructureReadiness) * 2,
  };
}

export function buildWellbeingFactors(world: World, outcomes: OutcomeScores): WellbeingFactor[] {
  return [
    {
      name: 'Housing Affordability',
      score: clamp(100 - outcomes.housingStress * 0.9, 0, 100),
      explanation:
        outcomes.housingGap > 0
          ? 'Affordability falls because representative households face more demand than annual construction supplies.'
          : 'Affordability improves because construction is meeting estimated household demand.',
    },
    {
      name: 'Household Consumption',
      score: weightedAverage(world.households, 'consumption'),
      explanation: 'Consumption reflects household income, tax settings, inflation events and economic growth.',
    },
    {
      name: 'Government Stability',
      score: financeScore(world.government.financeRating),
      explanation: getFinanceExplanation(
        world.government.financeRating,
        world.government.budgetBalance,
        world.government.debtPressure,
      ),
    },
    {
      name: 'Environmental Quality',
      score: clamp(100 - outcomes.environmentalPressure, 0, 100),
      explanation:
        'Environmental quality falls when resource use, emissions, stimulus-driven activity or climate events increase pressure.',
    },
    {
      name: 'Social Cohesion',
      score: outcomes.socialCohesion,
      explanation:
        'Cohesion reflects integration, housing stress, service capacity and representative household connection.',
    },
  ];
}

export function buildExplanations(world: World) {
  const eventText = world.history.at(-1)?.activeEvents.length
    ? ` Active events: ${world.history.at(-1)?.activeEvents.join(', ')}.`
    : '';

  return {
    economicGrowth: `Growth changed because representative companies responded to skills alignment, stimulus, tax, housing stress and event shocks.${eventText}`,
    wellbeing: `Wellbeing changed because representative households updated consumption, housing security and social connection under the current policy settings.${eventText}`,
    socialCohesion:
      'Social cohesion changed with integration effectiveness, infrastructure capacity, government services and pressure on housing.',
    governmentFinances: getFinanceExplanation(
      world.government.financeRating,
      world.government.budgetBalance,
      world.government.debtPressure,
    ),
    environmentalPressure:
      'Environmental pressure changed with population growth, company emissions intensity, economic activity, stimulus and climate events.',
  };
}

export function buildPositiveDrivers(world: World, outcomes: OutcomeScores): string[] {
  const drivers = [
    outcomes.economicGrowth > 2
      ? 'Economic growth improved because companies gained from skills alignment, immigration and stimulus.'
      : '',
    outcomes.absorptiveCapacityScore >= 70
      ? 'Absorptive capacity is high, so households and services handle population growth more smoothly.'
      : '',
    world.government.financeRating === 'Strong' || world.government.financeRating === 'Improving'
      ? 'Government finances are a positive driver because revenue is above spending.'
      : '',
    outcomes.environmentalPressure < 45 ? 'Environmental pressure is contained in this scenario.' : '',
  ].filter(Boolean);

  return drivers.length ? drivers : ['No strong positive driver is dominant in this scenario.'];
}

export function buildNegativeDrivers(world: World, outcomes: OutcomeScores): string[] {
  const drivers = [
    outcomes.housingGap > 0
      ? 'Housing stress increased because representative household demand is above construction supply.'
      : '',
    world.government.debtPressure === 'High'
      ? 'Government finances are under stress because the deficit is large.'
      : '',
    outcomes.absorptiveCapacityStatus === 'Low'
      ? 'Low absorptive capacity is weakening cohesion and wellbeing.'
      : '',
    outcomes.environmentalPressure > 65
      ? 'Environmental pressure is high because growth, population and event effects are adding resource demand.'
      : '',
  ].filter(Boolean);

  return drivers.length ? drivers : ['No severe negative driver is dominant in this scenario.'];
}

export function buildYearSummary(
  year: number,
  outcomes: OutcomeScores,
  feedbackExplanations: string[],
): YearSummary {
  const wellbeingDirection =
    outcomes.wellbeing >= 65
      ? 'Wellbeing improved'
      : outcomes.wellbeing >= 50
        ? 'Wellbeing was mixed'
        : 'Wellbeing weakened';
  const financeDirection =
    outcomes.governmentBalance < -80
      ? 'fiscal capacity weakened due to higher spending and deficits'
      : outcomes.governmentBalance < 0
        ? 'government finances remained under pressure'
        : 'government finances stayed comparatively stable';
  const feedbackLoop =
    feedbackExplanations.find((item) => item.includes('public pressure')) ??
    feedbackExplanations[0] ??
    'Feedback pressures remained modest.';
  const narrative = `Year ${year}: ${wellbeingDirection} while ${financeDirection}. ${feedbackLoop}`;

  return {
    title: `Year ${year}`,
    narrative,
    whatChanged: `${wellbeingDirection} while ${financeDirection}.`,
    feedbackLoop,
  };
}
