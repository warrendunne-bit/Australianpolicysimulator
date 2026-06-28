import {
  createEnvironment,
  createGovernment,
  createRepresentativeCompanies,
  createRepresentativeHouseholds,
  financeScore,
  clamp,
  type Company,
  type Environment,
  type Household,
} from './entities';
import type { SimulationEvent } from './events';
import type { OutcomeContributionKey } from './outcomes';
import type { World } from './World';

export type EntityKind = 'Household' | 'Company' | 'Government' | 'Environment';

export type EntityImpact = Record<OutcomeContributionKey, number>;

export type EntityDashboardItem = {
  id: string;
  name: string;
  kind: EntityKind;
  score: number;
  previousScore: number;
  movement: number;
  condition: string;
  mainPressure: string;
  policySensitivity: string;
  explanation: string;
  impacts: EntityImpact;
};

export type EventEntityResponse = {
  entityName: string;
  effectScore: number;
  reason: string;
};

export type EventResponseSummary = {
  eventName: string;
  mostAffected: EventEntityResponse[];
  leastAffected: EventEntityResponse[];
};

export function buildEntityDashboard(
  world: World,
  previousEntities: EntityDashboardItem[] = [],
): EntityDashboardItem[] {
  const initialHouseholds = createRepresentativeHouseholds();
  const initialCompanies = createRepresentativeCompanies();
  const initialGovernment = createGovernment();
  const initialEnvironment: Environment = createEnvironment();
  const householdItems = world.households.map((household) => {
    const initial = initialHouseholds.find((item) => item.id === household.id) ?? household;
    const score = household.wellbeing;
    const previousScore =
      previousEntities.find((item) => item.id === household.id)?.score ?? initial.wellbeing;

    return {
      id: household.id,
      name: titleCase(household.type),
      kind: 'Household' as const,
      score,
      previousScore,
      movement: score - previousScore,
      condition: getCondition(score),
      mainPressure: getWeakestHouseholdArea(household),
      policySensitivity: getHouseholdSensitivity(household),
      explanation: `${titleCase(household.type)} wellbeing moved as consumption, housing security and social connection responded to policy settings.`,
      impacts: {
        economicGrowth: clamp((household.consumption - 50) * household.weight * 1.4, -100, 100),
        wellbeing: clamp((household.wellbeing - 50) * household.weight * 2.2, -100, 100),
        fairness: clamp(
          (household.housingSecurity + household.wellbeing - 110) * household.weight * 1.8,
          -100,
          100,
        ),
        socialCohesion: clamp((household.cohesion - 50) * household.weight * 2, -100, 100),
        governmentFinances: clamp((household.income / 100_000) * household.weight * 12 - 5, -100, 100),
        environmentalPressure: clamp(household.consumption * household.weight * 0.7, -100, 100),
      },
    };
  });

  const companyItems = world.companies.map((company) => {
    const initial = initialCompanies.find((item) => item.id === company.id) ?? company;
    const score = (company.productivity + company.profitability + company.investment) / 3;
    const previousScore =
      previousEntities.find((item) => item.id === company.id)?.score ??
      (initial.productivity + initial.profitability + initial.investment) / 3;

    return {
      id: company.id,
      name: titleCase(company.type),
      kind: 'Company' as const,
      score,
      previousScore,
      movement: score - previousScore,
      condition: getCondition(score),
      mainPressure: getCompanyPressure(company),
      policySensitivity: getCompanySensitivity(company),
      explanation: `${titleCase(company.type)} condition reflects productivity, profitability, hiring demand and investment after policy and event effects.`,
      impacts: {
        economicGrowth: clamp((company.productivity - 50) * company.weight * 2.4, -100, 100),
        wellbeing: clamp((company.hiringDemand - 50) * company.weight * 1.2, -100, 100),
        fairness: clamp((company.hiringDemand - 55) * company.weight * 0.8, -100, 100),
        socialCohesion: clamp((company.hiringDemand - 50) * company.weight * 0.9, -100, 100),
        governmentFinances: clamp((company.profitability - 50) * company.weight * 1.9, -100, 100),
        environmentalPressure: clamp(company.emissionsIntensity * company.weight * 1.2, -100, 100),
      },
    };
  });

  const governmentScore = financeScore(world.government.financeRating);
  const initialGovernmentScore =
    previousEntities.find((item) => item.id === 'government')?.score ??
    financeScore(initialGovernment.financeRating);
  const environmentScore = 100 - world.environment.pressure;
  const initialEnvironmentScore =
    previousEntities.find((item) => item.id === 'environment')?.score ??
    100 - initialEnvironment.pressure;

  return [
    ...householdItems,
    ...companyItems,
    {
      id: 'government',
      name: 'Government',
      kind: 'Government',
      score: governmentScore,
      previousScore: initialGovernmentScore,
      movement: governmentScore - initialGovernmentScore,
      condition: world.government.financeRating,
      mainPressure:
        world.government.budgetBalance < 0
          ? 'Budget deficit and service demand'
          : 'Maintaining surplus without weakening services',
      policySensitivity: 'Most sensitive to tax, stimulus, infrastructure and integration costs.',
      explanation:
        'Government condition changes as revenue, spending, debt pressure and service capacity update after entity responses.',
      impacts: {
        economicGrowth: clamp(world.government.serviceCapacity - 50, -100, 100),
        wellbeing: clamp(world.government.serviceCapacity - 45, -100, 100),
        fairness: clamp(world.government.serviceCapacity - 55, -100, 100),
        socialCohesion: clamp(world.government.serviceCapacity - 45, -100, 100),
        governmentFinances: clamp(world.government.budgetBalance / 2, -100, 100),
        environmentalPressure: clamp(world.policies.stimulusRate * 5, -100, 100),
      },
    },
    {
      id: 'environment',
      name: 'Environment',
      kind: 'Environment',
      score: environmentScore,
      previousScore: initialEnvironmentScore,
      movement: environmentScore - initialEnvironmentScore,
      condition: getCondition(environmentScore),
      mainPressure:
        world.environment.climateDamage > 0
          ? 'Climate damage and resource use'
          : 'Resource use from population and activity',
      policySensitivity:
        'Most sensitive to stimulus, population growth, company emissions and climate events.',
      explanation:
        'Environment condition falls when resource use, emissions intensity or climate damage increase environmental pressure.',
      impacts: {
        economicGrowth: clamp(-world.environment.climateDamage * 1.5, -100, 100),
        wellbeing: clamp(environmentScore - 55, -100, 100),
        fairness: clamp((environmentScore - 55) * 0.5, -100, 100),
        socialCohesion: clamp((environmentScore - 55) * 0.6, -100, 100),
        governmentFinances: clamp(-world.environment.climateDamage * 0.8, -100, 100),
        environmentalPressure: clamp(world.environment.pressure, -100, 100),
      },
    },
  ];
}

export function buildEventResponses(world: World): EventResponseSummary[] {
  if (!world.events.length) {
    return [];
  }

  const entities = buildEntityDashboard(world);

  return world.events.map((event) => {
    const responses = entities
      .map((entity) => ({
        entityName: entity.name,
        effectScore: getEventSensitivity(entity, event),
        reason: getEventSensitivityReason(entity, event),
      }))
      .sort((a, b) => b.effectScore - a.effectScore);

    return {
      eventName: event.name,
      mostAffected: responses.slice(0, 3),
      leastAffected: responses.slice(-3).reverse(),
    };
  });
}

function getWeakestHouseholdArea(household: Household) {
  const areas = [
    { label: 'Housing security', value: household.housingSecurity },
    { label: 'Consumption', value: household.consumption },
    { label: 'Social connection', value: household.cohesion },
  ].sort((a, b) => a.value - b.value);

  return areas[0].label;
}

function getHouseholdSensitivity(household: Household) {
  if (household.type === 'low-income renter') return 'Most sensitive to housing supply, inflation, tax and stimulus.';
  if (household.type === 'middle-income mortgage holder') return 'Most sensitive to tax, interest-like cost pressure and employment conditions.';
  if (household.type === 'high-income investor') return 'Most sensitive to tax, growth and company profitability.';
  if (household.type === 'retiree household') return 'Most sensitive to inflation, services and government finances.';
  return 'Most sensitive to housing supply, wages, integration and job creation.';
}

function getCompanyPressure(company: Company) {
  const areas = [
    { label: 'Productivity', value: company.productivity },
    { label: 'Profitability', value: company.profitability },
    { label: 'Investment', value: company.investment },
    { label: 'Hiring demand', value: company.hiringDemand },
  ].sort((a, b) => a.value - b.value);

  return areas[0].label;
}

function getCompanySensitivity(company: Company) {
  if (company.type === 'small business') return 'Most sensitive to tax, inflation, labour supply and local demand.';
  if (company.type === 'large employer') return 'Most sensitive to skills alignment, tax and broad demand.';
  if (company.type === 'exporter') return 'Most sensitive to productivity, skills and geopolitical shocks.';
  if (company.type === 'construction company') return 'Most sensitive to housing build rate, stimulus and supply shocks.';
  return 'Most sensitive to demand, environmental pressure, climate events and investment settings.';
}

function getCondition(score: number) {
  if (score >= 75) return 'Strong';
  if (score >= 60) return 'Stable';
  if (score >= 45) return 'Pressured';
  return 'Stressed';
}

function titleCase(value: string) {
  return value
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function getEventSensitivity(entity: EntityDashboardItem, event: SimulationEvent) {
  let score = event.intensity * 20;

  if (event.kind === 'inflation shock') {
    if (entity.name.includes('Low-Income') || entity.name.includes('Young Worker')) score += 38;
    if (entity.kind === 'Company') score += 18;
    if (entity.name === 'Government') score += 10;
  }
  if (event.kind === 'war / geopolitical shock') {
    if (entity.name.includes('Exporter')) score += 42;
    if (entity.name === 'Government') score += 24;
    if (entity.kind === 'Household') score += 10;
  }
  if (event.kind === 'housing supply shock') {
    if (entity.name.includes('Renter') || entity.name.includes('Young Worker')) score += 42;
    if (entity.name.includes('Construction')) score += 32;
    if (entity.kind === 'Household') score += 12;
  }
  if (event.kind === 'productivity shock') {
    if (entity.kind === 'Company') score += 36;
    if (entity.name === 'Government') score += 16;
    if (entity.kind === 'Household') score += 8;
  }
  if (event.kind === 'climate event') {
    if (entity.name === 'Environment') score += 52;
    if (entity.name.includes('Energy')) score += 28;
    if (entity.name === 'Government') score += 22;
  }
  if (event.kind === 'policy change') {
    if (entity.name === 'Government') score += 34;
    if (entity.kind === 'Household') score += 18;
    if (entity.kind === 'Company') score += 10;
  }

  return clamp(score, 0, 100);
}

function getEventSensitivityReason(entity: EntityDashboardItem, event: SimulationEvent) {
  if (event.kind === 'inflation shock') {
    return entity.kind === 'Household'
      ? 'Household purchasing power changes quickly when prices rise.'
      : 'Higher prices change costs, margins or public spending pressure.';
  }
  if (event.kind === 'housing supply shock') {
    return entity.kind === 'Household'
      ? 'Housing security is directly exposed to construction delays.'
      : 'Housing shortages change costs, demand and service pressure.';
  }
  if (event.kind === 'productivity shock') {
    return entity.kind === 'Company'
      ? 'Productivity shocks directly change company output and profitability.'
      : 'Productivity flows through indirectly via jobs, revenue and services.';
  }
  if (event.kind === 'climate event') {
    return entity.name === 'Environment'
      ? 'Climate events directly raise environmental pressure and damage.'
      : 'Climate events affect costs, services and wellbeing indirectly.';
  }
  if (event.kind === 'war / geopolitical shock') {
    return entity.name.includes('Exporter')
      ? 'Exporters are highly exposed to trade disruption.'
      : 'Geopolitical shocks flow through prices, confidence and public spending.';
  }
  return 'Policy changes alter support, service delivery, costs or incentives.';
}
