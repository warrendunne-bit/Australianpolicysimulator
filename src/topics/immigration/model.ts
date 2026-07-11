import type { ImmigrationAssumptions } from './assumptions';
import type { ConfidenceRating, NetImpact, TradeOffGroup } from './entities';
import { TRADE_OFF_GROUPS } from './entities';
import { buildScenarioAssumptions, type ImmigrationScenarioPreset } from './scenarios';

export const IMMIGRATION_START_YEAR = 2026;
export const IMMIGRATION_END_YEAR = 2066;
export const IMMIGRATION_TIMELINE_YEARS = Array.from(
  { length: IMMIGRATION_END_YEAR - IMMIGRATION_START_YEAR + 1 },
  (_, index) => IMMIGRATION_START_YEAR + index,
);

export type ImmigrationYearMetrics = {
  year: number;
  population: number;
  annualPopulationChange: number;
  netOverseasMigration: number;
  futureArrivals: number;
  futureDepartures: number;
  cumulativeNetMigration: number;
  workingAgePopulation: number;
  retirees: number;
  students: number;
  children: number;
  migrantsAlreadyInAustralia: number;
  householdDemand: number;
  dwellingStock: number;
  housingShortfall: number;
  housingStressIndex: number;
  labourSupplyIndex: number;
  constructionCapacityIndex: number;
  businessCapacityIndex: number;
  taxRevenue: number;
  federalBudgetPressure: number;
  stateBudgetPressure: number;
  healthAgedCarePressure: number;
  educationPressure: number;
  infrastructurePressure: number;
  welfarePensionPressure: number;
  environmentalPressure: number;
  regionalPopulationShare: number;
  capitalCityPressure: number;
  socialCohesionRisk: number;
  dependencyRatio: number;
};

export type NationalBriefing = {
  whatChanged: string;
  mostAffectedEntities: string[];
  assumptionsDrivingResult: string[];
  immediateEffects: string[];
  delayedEffects: string[];
  buildingRisks: string[];
  beneficiaries: string[];
  costBearers: string[];
  unintendedConsequences: string[];
};

export type TradeOffAssessment = {
  group: TradeOffGroup;
  currentYearImpact: number;
  cumulativeImpact: number;
  mainBenefit: string;
  mainCost: string;
  netImpact: NetImpact;
  confidence: ConfidenceRating;
  explanation: string;
  entityPathway: string;
  offsettingPolicies: string[];
};

export type MythTestResult = {
  claim: string;
  status: 'supported' | 'challenged' | 'mixed' | 'uncertain';
  modelCheck: string;
  evidence: string[];
};

export type CauseEffectNode = {
  id: string;
  label: string;
  timing: 'immediate' | 'lagged' | 'feedback' | 'uncertain' | 'stakeholder-specific';
  explanation: string;
  downstream: string[];
};

export type ImmigrationSimulationYear = ImmigrationYearMetrics & {
  briefing: NationalBriefing;
  tradeOffs: TradeOffAssessment[];
  mythTests: MythTestResult[];
};

export type ImmigrationSimulationResult = {
  scenario: ImmigrationScenarioPreset;
  assumptions: ImmigrationAssumptions;
  timeline: ImmigrationSimulationYear[];
};

const BASE_POPULATION = 26_900_000;
const BASE_DWELLINGS = 10_950_000;
const BASE_MIGRANTS_ALREADY_IN_AUSTRALIA = 8_200_000;

export const IMMIGRATION_CAUSE_EFFECT_MAP: CauseEffectNode[] = [
  { id: 'migration-setting', label: 'Migration setting changes', timing: 'immediate', explanation: 'The selected scenario changes the net flow of arrivals and departures.', downstream: ['population-growth', 'age-structure'] },
  { id: 'population-growth', label: 'Population growth changes', timing: 'immediate', explanation: 'Population changes through net overseas migration plus natural increase.', downstream: ['household-formation', 'infrastructure-demand', 'environmental-pressure'] },
  { id: 'age-structure', label: 'Age structure changes', timing: 'lagged', explanation: 'A younger arrival profile changes workers per retiree over time.', downstream: ['labour-supply', 'tax-revenue', 'health-aged-care'] },
  { id: 'household-formation', label: 'Household formation changes', timing: 'immediate', explanation: 'More people form more households, but household size and age profile matter.', downstream: ['housing-demand'] },
  { id: 'housing-demand', label: 'Housing demand changes', timing: 'immediate', explanation: 'Demand rises quickly, while new dwellings arrive more slowly.', downstream: ['construction-capacity', 'stakeholder-impacts'] },
  { id: 'labour-supply', label: 'Labour supply changes', timing: 'immediate', explanation: 'Working-age arrivals can ease worker shortages and increase competition for some jobs.', downstream: ['business-capacity', 'tax-revenue', 'construction-capacity'] },
  { id: 'construction-capacity', label: 'Construction capacity changes', timing: 'feedback', explanation: 'Migration can add construction workers, but housing shortages also make construction labour harder to attract.', downstream: ['housing-demand', 'infrastructure-demand'] },
  { id: 'business-capacity', label: 'Business capacity changes', timing: 'stakeholder-specific', explanation: 'Employers may gain workers and customers, while households may face competition and rent pressure.', downstream: ['tax-revenue', 'social-cohesion'] },
  { id: 'tax-revenue', label: 'Tax revenue changes', timing: 'lagged', explanation: 'Revenue grows when more people work productively, not merely when population rises.', downstream: ['government-spending'] },
  { id: 'health-aged-care', label: 'Health and aged care pressure changes', timing: 'lagged', explanation: 'Population ageing raises demand; working-age migration can help staff the system.', downstream: ['government-spending'] },
  { id: 'infrastructure-demand', label: 'Infrastructure demand changes', timing: 'lagged', explanation: 'Transport, schools, hospitals, utilities and local services need staged investment.', downstream: ['government-spending', 'social-cohesion'] },
  { id: 'government-spending', label: 'Government budget trade-offs change', timing: 'stakeholder-specific', explanation: 'Federal revenue and state delivery costs do not always move together.', downstream: ['stakeholder-impacts'] },
  { id: 'environmental-pressure', label: 'Environmental pressure changes', timing: 'lagged', explanation: 'Land, water, energy, emissions, waste and biodiversity pressure grow unless efficiency improves.', downstream: ['stakeholder-impacts'] },
  { id: 'social-cohesion', label: 'Social cohesion changes', timing: 'uncertain', explanation: 'Cohesion depends on settlement success, service capacity, public trust and local pressure.', downstream: ['stakeholder-impacts'] },
  { id: 'stakeholder-impacts', label: 'Winners, losers and trade-offs differ by group', timing: 'stakeholder-specific', explanation: 'A group can gain through one channel and lose through another.', downstream: [] },
];

export function runImmigrationScenario(
  scenario: ImmigrationScenarioPreset,
  assumptionOverrides: Partial<ImmigrationAssumptions> = {},
): ImmigrationSimulationResult {
  const assumptions = buildScenarioAssumptions(scenario, assumptionOverrides);
  const timeline: ImmigrationSimulationYear[] = [];
  let population = BASE_POPULATION;
  let dwellingStock = BASE_DWELLINGS;
  let migrantsAlreadyInAustralia = BASE_MIGRANTS_ALREADY_IN_AUSTRALIA;
  let cumulativeNetMigration = 0;
  let cumulativeShortfall = 0;
  let previous: ImmigrationYearMetrics | undefined;

  for (const year of IMMIGRATION_TIMELINE_YEARS) {
    const elapsed = year - IMMIGRATION_START_YEAR;
    const ageingFactor = elapsed * 0.003;
    const workforceAgeShare = clamp((assumptions.migrantWorkingAgeShare / 100) * 0.55 + 0.08 - ageingFactor, 0.48, 0.68);
    const retireeShare = clamp(0.17 + elapsed * 0.0028 - assumptions.migrantWorkingAgeShare * 0.00055, 0.13, 0.31);
    const childrenShare = clamp(0.19 + (assumptions.fertilityRate - 1.65) * 0.035 - elapsed * 0.0007, 0.14, 0.24);
    const studentShare = clamp(0.06 + Math.max(0, assumptions.netOverseasMigration) / 12_000_000, 0.04, 0.105);
    const netOverseasMigration = assumptions.netOverseasMigration;
    const departures = Math.max(45_000, Math.round(Math.max(0, -netOverseasMigration) + Math.max(120_000, Math.abs(netOverseasMigration) * 0.32)));
    const arrivals = Math.max(0, Math.round(netOverseasMigration + departures));
    const naturalIncrease = assumptions.naturalIncrease + (assumptions.fertilityRate - 1.65) * 45_000 - (assumptions.deathRate - 7.1) * 12_000;
    const annualPopulationChange = Math.round(netOverseasMigration + naturalIncrease);

    population = Math.max(18_000_000, population + annualPopulationChange);
    cumulativeNetMigration += netOverseasMigration;
    migrantsAlreadyInAustralia = Math.max(0, migrantsAlreadyInAustralia + netOverseasMigration * 0.82);

    const effectiveBuildRate = assumptions.housingBuildRate * (1 - assumptions.constructionLabourConstraint / 180);
    dwellingStock += Math.max(30_000, effectiveBuildRate);
    const householdDemand = population / 2.52;
    const annualShortfall = householdDemand - dwellingStock;
    cumulativeShortfall = Math.max(0, cumulativeShortfall * 0.88 + annualShortfall);
    const housingStressIndex = clamp(44 + cumulativeShortfall / 45_000 + Math.max(0, netOverseasMigration - 180_000) / 18_000 - assumptions.housingBuildRate / 18_000, 10, 100);

    const workingAgePopulation = population * workforceAgeShare;
    const retirees = population * retireeShare;
    const children = population * childrenShare;
    const students = population * studentShare;
    const labourSupplyIndex = clamp(58 + (workingAgePopulation / BASE_POPULATION - 0.58) * 130 + (assumptions.workforceParticipation - 67) * 1.4, 20, 100);
    const constructionCapacityIndex = clamp(62 + labourSupplyIndex * 0.18 - assumptions.constructionLabourConstraint * 0.7 + Math.max(0, netOverseasMigration) / 22_000, 10, 100);
    const businessCapacityIndex = clamp(52 + labourSupplyIndex * 0.34 + assumptions.productivityGrowth * 8 - housingStressIndex * 0.14, 10, 100);
    const taxRevenue = (workingAgePopulation * (assumptions.workforceParticipation / 100) * assumptions.averageTaxPerWorker) / 1_000_000_000;
    const serviceCost = (population * assumptions.governmentSpendingPerPerson) / 1_000_000_000;
    const infrastructurePressure = clamp(30 + Math.max(0, annualPopulationChange) / 7_500 + assumptions.infrastructureCostPerAdditionalPerson / 850 - assumptions.housingBuildRate / 14_000, 5, 100);
    const healthAgedCarePressure = clamp(36 + retireeShare * 130 + assumptions.healthAgedCareWorkerDemand * elapsed * 0.9 - labourSupplyIndex * 0.22, 5, 100);
    const educationPressure = clamp(30 + childrenShare * 110 + studentShare * 90 + Math.max(0, annualPopulationChange) / 18_000, 5, 100);
    const welfarePensionPressure = clamp(34 + retireeShare * 145 - taxRevenue / 24, 5, 100);
    const federalBudgetPressure = clamp(50 + serviceCost / 18 - taxRevenue / 16 + welfarePensionPressure * 0.18, 5, 100);
    const stateBudgetPressure = clamp(42 + infrastructurePressure * 0.42 + healthAgedCarePressure * 0.28 + educationPressure * 0.22 - taxRevenue / 55, 5, 100);
    const environmentalPressure = clamp(32 + (population - BASE_POPULATION) / 150_000 * assumptions.environmentalPressurePerPerson + infrastructurePressure * 0.11, 5, 100);
    const regionalPopulationShare = clamp(29 + assumptions.regionalSettlementShare * 0.13 - capitalCityGravity(netOverseasMigration), 20, 42);
    const capitalCityPressure = clamp(36 + housingStressIndex * 0.38 + (100 - assumptions.regionalSettlementShare) * 0.2 + Math.max(0, netOverseasMigration) / 11_000, 5, 100);
    const dependencyRatio = ((retirees + children) / Math.max(1, workingAgePopulation)) * 100;
    const socialCohesionRisk = clamp(28 + housingStressIndex * 0.22 + infrastructurePressure * 0.2 + assumptions.socialCohesionSensitivity * 0.22 - labourSupplyIndex * 0.12, 5, 100);

    const metrics: ImmigrationYearMetrics = {
      year,
      population,
      annualPopulationChange,
      netOverseasMigration,
      futureArrivals: arrivals,
      futureDepartures: departures,
      cumulativeNetMigration,
      workingAgePopulation,
      retirees,
      students,
      children,
      migrantsAlreadyInAustralia,
      householdDemand,
      dwellingStock,
      housingShortfall: Math.max(0, annualShortfall),
      housingStressIndex,
      labourSupplyIndex,
      constructionCapacityIndex,
      businessCapacityIndex,
      taxRevenue,
      federalBudgetPressure,
      stateBudgetPressure,
      healthAgedCarePressure,
      educationPressure,
      infrastructurePressure,
      welfarePensionPressure,
      environmentalPressure,
      regionalPopulationShare,
      capitalCityPressure,
      socialCohesionRisk,
      dependencyRatio,
    };

    const tradeOffs = assessTradeOffs(metrics, previous, assumptions, scenario);
    const briefing = buildNationalBriefing(metrics, previous, assumptions, tradeOffs, scenario);
    const mythTests = testImmigrationMyths(metrics, assumptions, scenario);
    timeline.push({ ...metrics, briefing, tradeOffs, mythTests });
    previous = metrics;
  }

  return { scenario, assumptions, timeline };
}

export function assessTradeOffs(
  metrics: ImmigrationYearMetrics,
  previous: ImmigrationYearMetrics | undefined,
  assumptions: ImmigrationAssumptions,
  scenario: ImmigrationScenarioPreset,
): TradeOffAssessment[] {
  const housingRelief = 70 - metrics.housingStressIndex;
  const labourBenefit = metrics.labourSupplyIndex - 55;
  const serviceCost = 60 - (metrics.stateBudgetPressure + metrics.infrastructurePressure) / 2;
  const environmentCost = 55 - metrics.environmentalPressure;
  const taxBenefit = 70 - metrics.federalBudgetPressure;
  const regionalBenefit = metrics.regionalPopulationShare - 28;
  const change = previous ? metrics.annualPopulationChange - previous.annualPopulationChange : metrics.annualPopulationChange;

  return TRADE_OFF_GROUPS.map((group) => {
    const groupScore = scoreGroup(group, {
      housingRelief,
      labourBenefit,
      serviceCost,
      environmentCost,
      taxBenefit,
      regionalBenefit,
      metrics,
      assumptions,
    });
    const currentYearImpact = clamp(groupScore / 2, -50, 50);
    const cumulativeImpact = clamp(groupScore + (metrics.year - IMMIGRATION_START_YEAR) * currentYearImpact * 0.08, -100, 100);
    const netImpact = classifyImpact(currentYearImpact, groupScore);
    const { mainBenefit, mainCost, explanation, entityPathway, offsettingPolicies } = describeGroupImpact(group, metrics, assumptions, scenario, netImpact, change);

    return {
      group,
      currentYearImpact,
      cumulativeImpact,
      mainBenefit,
      mainCost,
      netImpact,
      confidence: confidenceForGroup(group),
      explanation,
      entityPathway,
      offsettingPolicies,
    };
  });
}

function scoreGroup(group: TradeOffGroup, inputs: {
  housingRelief: number;
  labourBenefit: number;
  serviceCost: number;
  environmentCost: number;
  taxBenefit: number;
  regionalBenefit: number;
  metrics: ImmigrationYearMetrics;
  assumptions: ImmigrationAssumptions;
}) {
  const { housingRelief, labourBenefit, serviceCost, environmentCost, taxBenefit, regionalBenefit, metrics, assumptions } = inputs;
  const scores: Record<TradeOffGroup, number> = {
    'Young renters': housingRelief * 0.9 + labourBenefit * 0.2 + taxBenefit * 0.15 + serviceCost * 0.25,
    'First-home buyers': housingRelief * 0.85 + labourBenefit * 0.2 + serviceCost * 0.2,
    Homeowners: -housingRelief * 0.35 + serviceCost * 0.2 + taxBenefit * 0.2,
    'Property investors': -housingRelief * 0.75 + metrics.capitalCityPressure * 0.18,
    'Existing workers': labourBenefit * -0.18 + metrics.businessCapacityIndex * 0.35 + serviceCost * 0.2,
    'Job seekers': labourBenefit * -0.35 + metrics.businessCapacityIndex * 0.45 + housingRelief * 0.15,
    'Small businesses': metrics.businessCapacityIndex * 0.58 + labourBenefit * 0.28 - metrics.capitalCityPressure * 0.22,
    'Large businesses': metrics.businessCapacityIndex * 0.72 + labourBenefit * 0.36,
    Retirees: taxBenefit * 0.38 + (70 - metrics.healthAgedCarePressure) * 0.58 + housingRelief * 0.12,
    'Future generations': taxBenefit * 0.28 + environmentCost * 0.45 + (70 - metrics.dependencyRatio) * 0.35,
    'Federal government': taxBenefit * 0.75 + labourBenefit * 0.3,
    'State governments': serviceCost * 0.75 + (70 - metrics.infrastructurePressure) * 0.35,
    'Regional towns': regionalBenefit * 1.2 + metrics.businessCapacityIndex * 0.22 - (assumptions.regionalSettlementShare > 35 ? metrics.infrastructurePressure * 0.18 : 0),
    'Capital cities': housingRelief * 0.35 + metrics.businessCapacityIndex * 0.25 - metrics.capitalCityPressure * 0.55,
    Universities: Math.max(0, assumptions.netOverseasMigration) / 7_000 + metrics.students / 380_000 - housingRelief * 0.1,
    'Health and aged care providers': labourBenefit * 0.45 + (70 - metrics.healthAgedCarePressure) * 0.5,
    'Migrants and migrant families': labourBenefit * 0.42 + serviceCost * 0.3 + housingRelief * 0.35 - metrics.socialCohesionRisk * 0.15,
    Environment: environmentCost * 1.1,
  };

  return scores[group];
}

function describeGroupImpact(
  group: TradeOffGroup,
  metrics: ImmigrationYearMetrics,
  assumptions: ImmigrationAssumptions,
  scenario: ImmigrationScenarioPreset,
  netImpact: NetImpact,
  populationChangeDelta: number,
) {
  const isLowMigration = assumptions.netOverseasMigration <= 100_000;
  const mainBenefit = (() => {
    if (group.includes('renters') || group === 'First-home buyers') return isLowMigration ? 'Less immediate demand pressure on rents and entry-level housing.' : 'More jobs and services may emerge if supply catches up.';
    if (group.includes('businesses') || group === 'Large businesses') return 'A deeper labour market and larger customer base can improve capacity.';
    if (group.includes('government')) return 'More workers can expand the tax base, while slower growth can reduce delivery pressure.';
    if (group === 'Environment') return isLowMigration ? 'Lower population growth reduces resource pressure.' : 'More people can fund cleaner infrastructure if policy keeps pace.';
    if (group === 'Migrants and migrant families') return 'Successful settlement can improve income, opportunity and community links.';
    return 'The scenario changes one or more pressures affecting this group.';
  })();
  const mainCost = (() => {
    if (group.includes('renters') || group === 'First-home buyers') return isLowMigration ? 'Weaker growth may reduce job opportunities and future tax capacity.' : 'Housing demand can rise before new dwellings are delivered.';
    if (group.includes('businesses')) return isLowMigration ? 'Worker shortages and weaker customer growth may constrain expansion.' : 'Rents, congestion and service gaps can raise costs.';
    if (group.includes('government')) return isLowMigration ? 'Ageing pressure can rise relative to the worker tax base.' : 'Infrastructure, health, education and housing delivery can lag revenue.';
    if (group === 'Environment') return 'More land, water, energy, emissions and waste pressure unless efficiency improves.';
    if (group === 'Migrants and migrant families') return 'Housing stress, credential recognition and cohesion risks can reduce settlement benefits.';
    return 'The same scenario can create a benefit through one pathway and a cost through another.';
  })();

  return {
    mainBenefit,
    mainCost,
    explanation: `${group} has a ${netImpact} impact in ${scenario.name}. The result is not a political conclusion: it combines housing stress (${metrics.housingStressIndex.toFixed(0)}), labour supply (${metrics.labourSupplyIndex.toFixed(0)}), service pressure (${metrics.stateBudgetPressure.toFixed(0)}) and environmental pressure (${metrics.environmentalPressure.toFixed(0)}).`,
    entityPathway: `Migration setting → population change (${Math.round(metrics.annualPopulationChange).toLocaleString('en-AU')} this year, ${populationChangeDelta >= 0 ? 'rising' : 'falling'} momentum) → households/workers/services → ${group}.`,
    offsettingPolicies: offsetPoliciesForGroup(group),
  };
}

function offsetPoliciesForGroup(group: TradeOffGroup) {
  if (group.includes('renters') || group === 'First-home buyers') return ['Accelerate well-located housing supply', 'Target rental assistance', 'Fund transport to unlock cheaper suburbs'];
  if (group.includes('businesses') || group === 'Health and aged care providers') return ['Target skills recognition', 'Train local workers', 'Support regional settlement where jobs exist'];
  if (group.includes('government')) return ['Tie intake settings to infrastructure funding', 'Stage service-capacity triggers', 'Share revenue with delivery governments'];
  if (group === 'Environment') return ['Raise efficiency standards', 'Protect high-value habitat', 'Invest in water, energy and waste infrastructure'];
  return ['Improve settlement support', 'Monitor local capacity', 'Use targeted compensation or transition support'];
}

function confidenceForGroup(group: TradeOffGroup): ConfidenceRating {
  if (group === 'Young renters' || group === 'First-home buyers' || group === 'Federal government') return 'medium';
  if (group === 'Environment' || group === 'Future generations') return 'low';
  return 'low';
}

function classifyImpact(currentYearImpact: number, rawScore: number): NetImpact {
  if (Math.abs(currentYearImpact) < 8 || Math.abs(rawScore) < 12) return 'mixed';
  if (currentYearImpact > 0 && rawScore > 0) return 'positive';
  if (currentYearImpact < 0 && rawScore < 0) return 'negative';
  return 'uncertain';
}

function buildNationalBriefing(
  metrics: ImmigrationYearMetrics,
  previous: ImmigrationYearMetrics | undefined,
  assumptions: ImmigrationAssumptions,
  tradeOffs: TradeOffAssessment[],
  scenario: ImmigrationScenarioPreset,
): NationalBriefing {
  const mostAffected = [...tradeOffs]
    .sort((a, b) => Math.abs(b.currentYearImpact) - Math.abs(a.currentYearImpact))
    .slice(0, 4);
  const beneficiaries = tradeOffs.filter((item) => item.netImpact === 'positive').slice(0, 4).map((item) => item.group);
  const costBearers = tradeOffs.filter((item) => item.netImpact === 'negative').slice(0, 4).map((item) => item.group);
  const populationChange = previous ? metrics.population - previous.population : metrics.annualPopulationChange;

  return {
    whatChanged: `${metrics.year}: ${scenario.name} changed population by about ${Math.round(populationChange).toLocaleString('en-AU')} people this year. Housing stress is ${metrics.housingStressIndex.toFixed(0)} and labour supply is ${metrics.labourSupplyIndex.toFixed(0)} on the placeholder index.`,
    mostAffectedEntities: mostAffected.map((item) => item.group),
    assumptionsDrivingResult: [
      `Net overseas migration: ${Math.round(assumptions.netOverseasMigration).toLocaleString('en-AU')} per year`,
      `Housing build rate: ${Math.round(assumptions.housingBuildRate).toLocaleString('en-AU')} dwellings per year`,
      `Migrant working-age share: ${assumptions.migrantWorkingAgeShare.toFixed(0)}%`,
      `Regional settlement share: ${assumptions.regionalSettlementShare.toFixed(0)}%`,
    ],
    immediateEffects: [
      'Population and household demand change immediately.',
      'Employer labour supply and customer demand respond quickly.',
      'Rent and vacancy pressure can move before new housing is built.',
    ],
    delayedEffects: [
      'Tax revenue, ageing pressure and service staffing compound over years.',
      'Infrastructure and housing delivery lag behind demand when capacity is constrained.',
      'Environmental pressure accumulates through land, water, energy, emissions and waste channels.',
    ],
    buildingRisks: [
      metrics.housingStressIndex > 65 ? 'Housing stress is building.' : 'Housing stress is contained for now but still depends on supply.',
      metrics.stateBudgetPressure > 65 ? 'State service budgets are under pressure.' : 'State service pressure is not yet the binding constraint.',
      metrics.environmentalPressure > 65 ? 'Environmental pressure is accumulating.' : 'Environmental pressure remains moderate in this placeholder run.',
    ],
    beneficiaries: beneficiaries.length ? beneficiaries : ['No group is a simple winner in this year.'],
    costBearers: costBearers.length ? costBearers : ['Costs are dispersed or uncertain in this year.'],
    unintendedConsequences: [
      'Lower migration can ease housing demand while weakening labour supply and the future tax base.',
      'Higher migration can improve business capacity while worsening housing and infrastructure pressure if delivery lags.',
      'Regional settlement can help towns only when jobs, homes and services exist together.',
    ],
  };
}

export function testImmigrationMyths(
  metrics: ImmigrationYearMetrics,
  assumptions: ImmigrationAssumptions,
  scenario: ImmigrationScenarioPreset,
): MythTestResult[] {
  const lowMigration = assumptions.netOverseasMigration <= 100_000;
  return [
    {
      claim: 'Stopping immigration fixes housing',
      status: lowMigration && metrics.housingStressIndex < 58 ? 'mixed' : 'challenged',
      modelCheck: 'Compare housing stress with labour supply, tax capacity and ageing pressure.',
      evidence: [
        `Housing stress index: ${metrics.housingStressIndex.toFixed(0)}.`,
        `Labour supply index: ${metrics.labourSupplyIndex.toFixed(0)}.`,
        'The model treats housing as supply plus demand, not demand alone.',
      ],
    },
    {
      claim: 'Immigration only affects population size',
      status: 'challenged',
      modelCheck: 'Trace age structure, households, labour supply, revenue, services and environment.',
      evidence: [
        `Working-age population: ${Math.round(metrics.workingAgePopulation).toLocaleString('en-AU')}.`,
        `State budget pressure: ${metrics.stateBudgetPressure.toFixed(0)}.`,
        `Environmental pressure: ${metrics.environmentalPressure.toFixed(0)}.`,
      ],
    },
    {
      claim: 'Migration is only permanent migration',
      status: 'challenged',
      modelCheck: 'Use arrivals, departures and net overseas migration instead of a single permanent intake.',
      evidence: [
        `Future arrivals: ${Math.round(metrics.futureArrivals).toLocaleString('en-AU')}.`,
        `Future departures: ${Math.round(metrics.futureDepartures).toLocaleString('en-AU')}.`,
        `Net overseas migration: ${Math.round(metrics.netOverseasMigration).toLocaleString('en-AU')}.`,
      ],
    },
    {
      claim: 'GDP growth means everyone is better off',
      status: 'challenged',
      modelCheck: 'Compare business capacity with renters, services and environment.',
      evidence: [
        `Business capacity: ${metrics.businessCapacityIndex.toFixed(0)}.`,
        `Housing stress: ${metrics.housingStressIndex.toFixed(0)}.`,
        'The winners/losers engine allows a group to gain in one channel and lose in another.',
      ],
    },
    {
      claim: 'Lower migration always reduces pressure on services',
      status: lowMigration && metrics.dependencyRatio > 54 ? 'challenged' : 'mixed',
      modelCheck: 'Compare immediate population pressure with worker tax base and ageing.',
      evidence: [
        `Dependency ratio: ${metrics.dependencyRatio.toFixed(0)} dependants per 100 working-age people.`,
        `Health and aged care pressure: ${metrics.healthAgedCarePressure.toFixed(0)}.`,
        'Lower inflows can reduce school or housing pressure while worsening staff shortages.',
      ],
    },
    {
      claim: 'Immigration is either all good or all bad',
      status: 'challenged',
      modelCheck: 'Inspect mixed impacts across groups instead of a single verdict.',
      evidence: [
        `${scenario.name} produces different effects for renters, employers, governments, regions and the environment.`,
        'The app reports trade-offs rather than forcing a political conclusion.',
      ],
    },
  ];
}

function capitalCityGravity(netOverseasMigration: number) {
  return Math.max(0, netOverseasMigration - 150_000) / 80_000;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
