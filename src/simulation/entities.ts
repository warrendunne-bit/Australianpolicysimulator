import type { FeedbackEffects } from './FeedbackSystem';
import type { EventEffects } from './events';
import type { PolicySettings, World } from './World';

export type HouseholdType =
  | 'low-income renter'
  | 'middle-income mortgage holder'
  | 'high-income investor'
  | 'retiree household'
  | 'young worker household';

export type CompanyType =
  | 'small business'
  | 'large employer'
  | 'exporter'
  | 'construction company'
  | 'energy company';

export type CapacityStatus = 'Low' | 'Medium' | 'High';
export type DebtPressure = 'Low' | 'Medium' | 'High';
export type FinanceRating = 'Strong' | 'Improving' | 'Stable' | 'Weak' | 'Stressed';

export type FinanceBreakdown = {
  baseRevenue: number;
  baseSpending: number;
  taxRevenueBoost: number;
  growthRevenueBoost: number;
  integrationSkillsRevenueBoost: number;
  stimulusSpendingBoost: number;
  integrationSupportCosts: number;
  infrastructureSpendingPressure: number;
  eventSpending: number;
  feedbackSpendingPressure: number;
  climateDisasterCost: number;
};

export type Person = {
  id: string;
  role: string;
  income: number;
  skills: number;
  wellbeing: number;
  socialConnection: number;
};

export type Household = {
  id: string;
  type: HouseholdType;
  weight: number;
  people: Person[];
  income: number;
  housingSecurity: number;
  consumption: number;
  wellbeing: number;
  cohesion: number;
};

export type Company = {
  id: string;
  type: CompanyType;
  weight: number;
  productivity: number;
  hiringDemand: number;
  profitability: number;
  investment: number;
  emissionsIntensity: number;
};

export type Government = {
  revenue: number;
  spending: number;
  budgetBalance: number;
  debtPressure: DebtPressure;
  financeRating: FinanceRating;
  serviceCapacity: number;
  financeBreakdown: FinanceBreakdown;
};

export type Environment = {
  pressure: number;
  climateDamage: number;
  resourceUse: number;
};

export const BASE_GOVERNMENT_REVENUE = 600;
export const BASE_GOVERNMENT_SPENDING = 620;

export function createRepresentativeHouseholds(): Household[] {
  return [
    createHousehold('h-low-renter', 'low-income renter', 0.24, 58_000, 42, 58, 56),
    createHousehold('h-mortgage', 'middle-income mortgage holder', 0.32, 126_000, 62, 66, 68),
    createHousehold('h-investor', 'high-income investor', 0.12, 260_000, 86, 78, 70),
    createHousehold('h-retiree', 'retiree household', 0.18, 72_000, 70, 60, 72),
    createHousehold('h-young-worker', 'young worker household', 0.14, 88_000, 48, 64, 62),
  ];
}

export function createRepresentativeCompanies(): Company[] {
  return [
    createCompany('c-small', 'small business', 0.28, 58, 56, 54, 44),
    createCompany('c-large', 'large employer', 0.27, 70, 62, 66, 50),
    createCompany('c-exporter', 'exporter', 0.14, 68, 54, 64, 52),
    createCompany('c-construction', 'construction company', 0.18, 60, 70, 58, 58),
    createCompany('c-energy', 'energy company', 0.13, 66, 46, 70, 82),
  ];
}

export function createGovernment(): Government {
  const financeBreakdown = createFinanceBreakdown();

  return {
    revenue: BASE_GOVERNMENT_REVENUE,
    spending: BASE_GOVERNMENT_SPENDING,
    budgetBalance: BASE_GOVERNMENT_REVENUE - BASE_GOVERNMENT_SPENDING,
    debtPressure: 'Medium',
    financeRating: 'Stable',
    serviceCapacity: 64,
    financeBreakdown,
  };
}

function createFinanceBreakdown(overrides: Partial<FinanceBreakdown> = {}): FinanceBreakdown {
  return {
    baseRevenue: BASE_GOVERNMENT_REVENUE,
    baseSpending: BASE_GOVERNMENT_SPENDING,
    taxRevenueBoost: 0,
    growthRevenueBoost: 0,
    integrationSkillsRevenueBoost: 0,
    stimulusSpendingBoost: 0,
    integrationSupportCosts: 0,
    infrastructureSpendingPressure: 0,
    eventSpending: 0,
    feedbackSpendingPressure: 0,
    climateDisasterCost: 0,
    ...overrides,
  };
}

export function createEnvironment(): Environment {
  return { pressure: 36, climateDamage: 0, resourceUse: 45 };
}

function createHousehold(
  id: string,
  type: HouseholdType,
  weight: number,
  income: number,
  housingSecurity: number,
  consumption: number,
  cohesion: number,
): Household {
  return {
    id,
    type,
    weight,
    income,
    housingSecurity,
    consumption,
    cohesion,
    wellbeing: (housingSecurity + consumption + cohesion) / 3,
    people: [
      {
        id: `${id}-person`,
        role: type.includes('retiree') ? 'retiree' : 'worker',
        income: income / 2,
        skills: type.includes('high') ? 82 : type.includes('young') ? 70 : 60,
        wellbeing: 64,
        socialConnection: cohesion,
      },
    ],
  };
}

function createCompany(
  id: string,
  type: CompanyType,
  weight: number,
  productivity: number,
  hiringDemand: number,
  profitability: number,
  emissionsIntensity: number,
): Company {
  return {
    id,
    type,
    weight,
    productivity,
    hiringDemand,
    profitability,
    investment: 55,
    emissionsIntensity,
  };
}

export function updateHouseholds(
  households: Household[],
  policies: PolicySettings,
  economicGrowth: number,
  housingStress: number,
  effects: EventEffects,
  feedbackEffects: FeedbackEffects,
): Household[] {
  return households.map((household) => {
    const incomeGrowth =
      economicGrowth * (household.type.includes('high-income') ? 0.7 : 0.45) -
      feedbackEffects.householdIncomeDrag;
    const taxDrag = policies.taxRate * (household.type.includes('low-income') ? 0.12 : 0.18);
    const housingDrag =
      housingStress *
      (household.type.includes('renter') || household.type.includes('young') ? 0.34 : 0.18);
    const integrationLift = policies.integrationEffectiveness * 0.05;
    const consumption = clamp(
      household.consumption +
        incomeGrowth -
        taxDrag -
        effects.inflation * 4 +
        feedbackEffects.wellbeingSupport,
      0,
      100,
    );
    const housingSecurity = clamp(household.housingSecurity - housingDrag * 0.08, 0, 100);
    const cohesion = clamp(
      household.cohesion + integrationLift - housingStress * 0.035 + effects.cohesion,
      0,
      100,
    );
    const wellbeing = clamp(consumption * 0.35 + housingSecurity * 0.35 + cohesion * 0.3, 0, 100);

    return { ...household, consumption, housingSecurity, cohesion, wellbeing };
  });
}

export function updateCompanies(
  companies: Company[],
  policies: PolicySettings,
  housingStress: number,
  effects: EventEffects,
  feedbackEffects: FeedbackEffects,
): Company[] {
  return companies.map((company) => {
    const skillLift = policies.skillsAlignment * 0.045;
    const stimulusLift = policies.stimulusRate * (company.type === 'construction company' ? 0.8 : 0.35);
    const taxDrag = policies.taxRate * 0.08;
    const housingDrag = housingStress * 0.035;
    const eventProductivity = effects.productivity * (company.type === 'exporter' ? 1.15 : 1);
    const productivity = clamp(company.productivity + skillLift + eventProductivity - housingDrag, 0, 100);
    const profitability = clamp(
      company.profitability +
        stimulusLift +
        productivity * 0.025 -
        taxDrag -
        effects.inflation * 2 -
        feedbackEffects.businessInvestmentDrag * 0.4,
      0,
      100,
    );
    const hiringDemand = clamp(
      company.hiringDemand + policies.immigrationRate * 0.7 + policies.stimulusRate * 0.4 - housingStress * 0.04,
      0,
      100,
    );
    const investment = clamp(
      company.investment + profitability * 0.025 - taxDrag + stimulusLift * 0.5 - feedbackEffects.businessInvestmentDrag,
      0,
      100,
    );

    return { ...company, productivity, profitability, hiringDemand, investment };
  });
}

export function updateGovernment(
  world: World,
  economicGrowth: number,
  effects: EventEffects,
  feedbackEffects: FeedbackEffects,
): Government {
  const taxRevenueBoost = world.policies.taxRate * 6;
  const growthRevenueBoost = Math.max(0, economicGrowth) * 20;
  const integrationSkillsRevenueBoost =
    ((world.policies.integrationEffectiveness + world.policies.skillsAlignment) / 2 - 50) * 2;
  const stimulusSpendingBoost = world.policies.stimulusRate * 15;
  const integrationSupportCosts = Math.max(0, 70 - world.policies.integrationEffectiveness) * 2;
  const infrastructureSpendingPressure = Math.max(0, 70 - world.policies.infrastructureReadiness) * 2;
  const feedbackSpendingPressure =
    feedbackEffects.spendingPressure + feedbackEffects.infrastructureSpendingPressure;
  const financeBreakdown = createFinanceBreakdown({
    taxRevenueBoost,
    growthRevenueBoost,
    integrationSkillsRevenueBoost,
    stimulusSpendingBoost,
    integrationSupportCosts,
    infrastructureSpendingPressure,
    eventSpending: effects.spending,
    feedbackSpendingPressure,
    climateDisasterCost: feedbackEffects.climateDisasterCost,
  });
  const revenue = BASE_GOVERNMENT_REVENUE + taxRevenueBoost + growthRevenueBoost + integrationSkillsRevenueBoost;
  const spending =
    BASE_GOVERNMENT_SPENDING +
    stimulusSpendingBoost +
    integrationSupportCosts +
    infrastructureSpendingPressure +
    effects.spending +
    feedbackSpendingPressure +
    feedbackEffects.climateDisasterCost;
  const budgetBalance = revenue - spending;
  const debtPressure = getDebtPressure(budgetBalance);
  const financeRating = getFinanceRating(budgetBalance, debtPressure);
  const serviceCapacity = clamp(
    world.policies.infrastructureReadiness +
      world.policies.stimulusRate * 0.8 -
      Math.max(0, -budgetBalance) * 0.04 -
      feedbackEffects.fiscalDrag,
    0,
    100,
  );

  return { revenue, spending, budgetBalance, debtPressure, financeRating, serviceCapacity, financeBreakdown };
}

export function updateEnvironment(
  environment: Environment,
  policies: PolicySettings,
  companies: Company[],
  economicGrowth: number,
  effects: EventEffects,
): Environment {
  const emissions = weightedAverage(companies, 'emissionsIntensity');
  const resourceUse = clamp(
    environment.resourceUse + Math.max(0, economicGrowth) * 0.7 + policies.immigrationRate * 0.5,
    0,
    100,
  );
  const pressure = clamp(
    30 + resourceUse * 0.32 + emissions * 0.22 + policies.stimulusRate * 0.7 + effects.environment,
    0,
    100,
  );
  const climateDamage = clamp(environment.climateDamage + effects.environment * 0.35, 0, 100);

  return { pressure, climateDamage, resourceUse };
}

export function getCapacityStatus(score: number): CapacityStatus {
  if (score < 40) return 'Low';
  if (score <= 70) return 'Medium';
  return 'High';
}

export function getDebtPressure(balance: number): DebtPressure {
  if (balance >= 0) return 'Low';
  if (balance > -80) return 'Medium';
  return 'High';
}

export function getFinanceRating(balance: number, debtPressure: DebtPressure): FinanceRating {
  if (balance < -80 || debtPressure === 'High') return 'Stressed';
  if (balance > 20 && debtPressure === 'Low') return 'Strong';
  if (balance > 20 && debtPressure === 'Medium') return 'Improving';
  if (balance >= -20 && balance <= 20) return 'Stable';
  if (balance >= -80 && balance < -20) return 'Weak';
  return 'Stressed';
}

export function getFinanceExplanation(
  rating: FinanceRating,
  balance: number,
  debtPressure: DebtPressure,
) {
  if (rating === 'Strong') {
    return 'Government finances are Strong because the budget is in surplus and debt pressure is low.';
  }
  if (rating === 'Improving') {
    return 'Government finances are Improving because the budget is in surplus, although debt pressure is still medium.';
  }
  if (rating === 'Stable') {
    return 'Government finances are Stable because the budget is near break-even.';
  }
  if (rating === 'Weak') {
    return 'Government finances are Weak because the budget remains in deficit.';
  }
  if (balance < -80) {
    return 'Government finances are Stressed because the budget deficit is strongly negative.';
  }
  return `Government finances are Stressed because debt pressure is ${debtPressure.toLowerCase()}.`;
}

export function financeScore(rating: FinanceRating) {
  if (rating === 'Strong') return 88;
  if (rating === 'Improving') return 76;
  if (rating === 'Stable') return 68;
  if (rating === 'Weak') return 52;
  return 34;
}

export function weightedAverage<T extends { weight: number }>(items: T[], key: keyof T) {
  const totalWeight = items.reduce((total, item) => total + item.weight, 0);
  return items.reduce((total, item) => total + Number(item[key]) * item.weight, 0) / totalWeight;
}

export function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}
