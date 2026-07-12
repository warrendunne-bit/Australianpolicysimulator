import {
  DEFAULT_FEEDBACK_EFFECTS,
  DEFAULT_FEEDBACK_STATE,
  calculateFeedbackPressures,
  type FeedbackEffects,
  type FeedbackState,
} from './FeedbackSystem';
import {
  createEnvironment,
  createGovernment,
  createRepresentativeCompanies,
  createRepresentativeHouseholds,
  updateCompanies,
  updateEnvironment,
  updateGovernment,
  updateHouseholds,
  weightedAverage,
  clamp,
  type Company,
  type Environment,
  type Government,
  type Household,
} from './entities';
import { DEFAULT_EVENTS, getEventEffects, type SimulationEvent } from './events';
import { buildEntityDashboard, buildEventResponses, type EntityDashboardItem, type EventResponseSummary } from './entityInsights';
import { DEFAULT_POLICY_SETTINGS } from './presets';
import { GENERAL_BASELINE_VALUES } from '../model';
import {
  buildExplanations,
  buildNegativeDrivers,
  buildPositiveDrivers,
  buildWellbeingFactors,
  buildYearSummary,
  calculateMetrics,
  calculateOutcomes,
  type AnnualOutcome,
  type OutcomeScores,
  type WellbeingFactor,
} from './outcomes';

export type SimulationHorizon = 1 | 5 | 10;

export type PolicySettings = {
  immigrationRate: number;
  housingBuildRate: number;
  integrationEffectiveness: number;
  skillsAlignment: number;
  infrastructureReadiness: number;
  taxRate: number;
  stimulusRate: number;
};

export type SimulationResult = {
  world: World;
  outcomes: OutcomeScores;
  history: AnnualOutcome[];
  feedback: FeedbackState;
  feedbackExplanations: string[];
  wellbeingFactors: WellbeingFactor[];
  entityDashboard: EntityDashboardItem[];
  impactMatrix: EntityDashboardItem[];
  eventResponses: EventResponseSummary[];
  explanations: ReturnType<typeof buildExplanations>;
  positiveDrivers: string[];
  negativeDrivers: string[];
  tradeOffs: string[];
  metrics: ReturnType<typeof calculateMetrics>;
};

export type BaselineComparison = {
  scenario: SimulationResult;
  baseline: SimulationResult;
  deltas: Pick<
    OutcomeScores,
    | 'economicGrowth'
    | 'wellbeing'
    | 'fairness'
    | 'socialCohesion'
    | 'governmentBalance'
    | 'environmentalPressure'
    | 'housingStress'
  >;
  summary: string;
};

export type World = {
  year: number;
  population: number;
  policies: PolicySettings;
  feedback: FeedbackState;
  pendingFeedbackEffects: FeedbackEffects;
  households: Household[];
  companies: Company[];
  government: Government;
  environment: Environment;
  events: SimulationEvent[];
  history: AnnualOutcome[];
};

const BASE_POPULATION = GENERAL_BASELINE_VALUES.population;
const PEOPLE_PER_IMMIGRATION_PERCENT = GENERAL_BASELINE_VALUES.peoplePerImmigrationPercent;
const AVERAGE_HOUSEHOLD_SIZE = GENERAL_BASELINE_VALUES.averageHouseholdSize;
const BASE_ECONOMIC_GROWTH = GENERAL_BASELINE_VALUES.baseEconomicGrowth;

export function runSimulation(
  policies: PolicySettings,
  horizon: SimulationHorizon,
  selectedEventIds: string[],
): SimulationResult {
  const events = DEFAULT_EVENTS.filter((event) => selectedEventIds.includes(event.id));
  let world = createWorld(policies, events);

  for (let year = 1; year <= horizon; year += 1) {
    world = stepWorld(world, year);
  }

  return buildResult(world);
}

export function compareToBaseline(
  policies: PolicySettings,
  horizon: SimulationHorizon,
  selectedEventIds: string[],
): BaselineComparison {
  const scenario = runSimulation(policies, horizon, selectedEventIds);
  const baseline = runSimulation(DEFAULT_POLICY_SETTINGS, horizon, selectedEventIds);
  const deltas = {
    economicGrowth: scenario.outcomes.economicGrowth - baseline.outcomes.economicGrowth,
    wellbeing: scenario.outcomes.wellbeing - baseline.outcomes.wellbeing,
    fairness: scenario.outcomes.fairness - baseline.outcomes.fairness,
    socialCohesion: scenario.outcomes.socialCohesion - baseline.outcomes.socialCohesion,
    governmentBalance: scenario.outcomes.governmentBalance - baseline.outcomes.governmentBalance,
    environmentalPressure:
      scenario.outcomes.environmentalPressure - baseline.outcomes.environmentalPressure,
    housingStress: scenario.outcomes.housingStress - baseline.outcomes.housingStress,
  };
  const strongestChange = Object.entries(deltas)
    .map(([key, value]) => ({ key, value, size: Math.abs(value) }))
    .sort((a, b) => b.size - a.size)[0];

  return {
    scenario,
    baseline,
    deltas,
    summary: `Compared with the default baseline, the largest movement is ${formatDeltaKey(strongestChange.key)} (${strongestChange.value >= 0 ? '+' : ''}${strongestChange.value.toFixed(1)}).`,
  };
}

function formatDeltaKey(key: string) {
  return key.replace(/[A-Z]/g, (match) => ` ${match.toLowerCase()}`);
}

function createWorld(policies: PolicySettings, events: SimulationEvent[]): World {
  return {
    year: 0,
    population: BASE_POPULATION,
    policies,
    feedback: DEFAULT_FEEDBACK_STATE,
    pendingFeedbackEffects: DEFAULT_FEEDBACK_EFFECTS,
    households: createRepresentativeHouseholds(),
    companies: createRepresentativeCompanies(),
    government: createGovernment(),
    environment: createEnvironment(),
    events,
    history: [],
  };
}

export function stepWorld(world: World, year: number): World {
  const activeEvents = world.events.filter((event) => event.year === year);
  const effects = getEventEffects(activeEvents);
  const feedbackEffects = world.pendingFeedbackEffects;
  const populationIncrease = world.policies.immigrationRate * PEOPLE_PER_IMMIGRATION_PERCENT;
  const population = world.population + populationIncrease;
  const housingDemand = populationIncrease / AVERAGE_HOUSEHOLD_SIZE;
  const effectiveBuildRate = world.policies.housingBuildRate * effects.housingSupply;
  const housingGap = housingDemand - effectiveBuildRate;
  const housingStress = calculateHousingStress(world, housingGap, effects, feedbackEffects);
  const effectivePolicies = applyPolicyEffectiveness(world.policies, feedbackEffects);
  const companies = updateCompanies(
    world.companies,
    effectivePolicies,
    housingStress,
    effects,
    feedbackEffects,
  );
  const companyGrowth = weightedAverage(companies, 'productivity') * 0.035 - 0.4;
  const economicGrowth = calculateEconomicGrowth(
    world,
    companyGrowth,
    housingStress,
    effects,
    feedbackEffects,
  );
  const households = updateHouseholds(
    world.households,
    effectivePolicies,
    economicGrowth,
    housingStress,
    effects,
    feedbackEffects,
  );
  const government = updateGovernment(world, economicGrowth, effects, feedbackEffects);
  const environment = updateEnvironment(
    world.environment,
    world.policies,
    companies,
    economicGrowth,
    effects,
  );
  const outcomes = calculateOutcomes(
    world,
    population,
    populationIncrease,
    housingDemand,
    housingGap,
    housingStress,
    households,
    government,
    environment,
    economicGrowth,
  );
  const feedbackResult = calculateFeedbackPressures({
    outcomes,
    policies: world.policies,
    previousState: world.feedback,
    activeEvents,
  });
  const nextWorld = {
    ...world,
    year,
    population,
    feedback: feedbackResult.state,
    pendingFeedbackEffects: feedbackResult.nextEffects,
    households,
    companies,
    government,
    environment,
  };
  const entityDashboard = buildEntityDashboard(
    nextWorld,
    world.history.at(-1)?.entityDashboard,
  );
  const yearSummary = buildYearSummary(year, outcomes, feedbackResult.explanations);

  return {
    ...nextWorld,
    history: [
      ...world.history,
      {
        ...outcomes,
        year,
        activeEvents: activeEvents.map((event) => event.name),
        feedback: feedbackResult.state,
        feedbackExplanations: feedbackResult.explanations,
        entityDashboard,
        positiveDrivers: buildPositiveDrivers(nextWorld, outcomes),
        negativeDrivers: buildNegativeDrivers(nextWorld, outcomes),
        yearSummary,
        narrativeSummary: yearSummary.narrative,
      },
    ],
  };
}

function buildResult(world: World): SimulationResult {
  const outcomes =
    world.history.at(-1) ??
    calculateOutcomes(
      world,
      world.population,
      0,
      0,
      0,
      30,
      world.households,
      world.government,
      world.environment,
      BASE_ECONOMIC_GROWTH,
    );
  const metrics = calculateMetrics(world, outcomes.economicGrowth, outcomes.housingStress);
  const wellbeingFactors = buildWellbeingFactors(world, outcomes);
  const entityDashboard =
    world.history.at(-1)?.entityDashboard ?? buildEntityDashboard(world);

  return {
    world,
    outcomes,
    history: world.history,
    feedback: world.feedback,
    feedbackExplanations: world.history.at(-1)?.feedbackExplanations ?? [],
    wellbeingFactors,
    entityDashboard,
    impactMatrix: entityDashboard,
    eventResponses: buildEventResponses(world),
    explanations: buildExplanations(world),
    positiveDrivers: buildPositiveDrivers(world, outcomes),
    negativeDrivers: buildNegativeDrivers(world, outcomes),
    tradeOffs: [
      'Higher tax improves government revenue but slightly reduces household consumption and company investment.',
      'Government stimulus supports demand and construction but increases spending and environmental pressure.',
      'Higher immigration can lift company hiring and growth, but housing and services must keep pace to protect wellbeing.',
    ],
    metrics,
  };
}

function calculateEconomicGrowth(
  world: World,
  companyGrowth: number,
  housingStress: number,
  effects: ReturnType<typeof getEventEffects>,
  feedbackEffects: FeedbackEffects,
) {
  const integrationMultiplier =
    (world.policies.integrationEffectiveness + world.policies.skillsAlignment) / 200;
  const immigrationGrowthBoost = world.policies.immigrationRate * 0.5 * integrationMultiplier;
  const stimulusGrowthBoost = world.policies.stimulusRate * 0.2;
  const taxGrowthDrag = world.policies.taxRate * 0.05;
  const housingGrowthDrag = housingStress * 0.01;

  return clamp(
    BASE_ECONOMIC_GROWTH +
      companyGrowth +
      immigrationGrowthBoost +
      stimulusGrowthBoost -
      taxGrowthDrag -
      housingGrowthDrag +
      effects.growth -
      feedbackEffects.fiscalDrag -
      feedbackEffects.businessInvestmentDrag * 0.02,
    -5,
    8,
  );
}

function calculateHousingStress(
  world: World,
  housingGap: number,
  effects: ReturnType<typeof getEventEffects>,
  feedbackEffects: FeedbackEffects,
) {
  const housingGapPressure = Math.max(0, housingGap / 10_000) * 1.2;
  const supplyRelief = Math.max(0, -housingGap / 10_000) * 0.5;

  return clamp(
    30 +
      housingGapPressure -
      supplyRelief +
      (100 - world.policies.infrastructureReadiness) * 0.18 +
      (1 - effects.housingSupply) * 35 +
      feedbackEffects.housingStressPressure,
    0,
    100,
  );
}

function applyPolicyEffectiveness(
  policies: PolicySettings,
  feedbackEffects: FeedbackEffects,
): PolicySettings {
  const multiplier = feedbackEffects.policyEffectivenessMultiplier;

  return {
    ...policies,
    integrationEffectiveness: clamp(policies.integrationEffectiveness * multiplier, 0, 100),
    skillsAlignment: clamp(policies.skillsAlignment * multiplier, 0, 100),
    infrastructureReadiness: clamp(policies.infrastructureReadiness * multiplier, 0, 100),
    stimulusRate: clamp(policies.stimulusRate * multiplier, 0, 10),
  };
}
