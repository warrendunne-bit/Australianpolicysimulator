import { round } from "../core/modelMath";
import { runSimulation } from "../core/simulationEngine";
import type { SimulationState } from "../core/types";
import { responseParameters } from "../data/calibration";
import { defaultAssumptions } from "../data/defaultAssumptions";
import { defaultPolicies } from "../data/defaultPolicies";
import { defaultState } from "../data/defaultState";
import { budgetModule } from "../modules/budgetModule";
import { housingModule, housingSupplyGap, weeklyRentProxy } from "../modules/housingModule";
import { populationModule } from "../modules/populationModule";

const weeksPerYear = 52;
const dollarsPerBillion = 1_000_000_000;
const tenures = ["Private renter", "Mortgage holder", "Outright owner"] as const;

export type HousingTenure = typeof tenures[number];
export type HousingIncomeGroup = "Lower" | "Middle" | "Higher";
export type HousingScenarioId = "baseline" | "faster-supply" | "supply-rental-support";

interface IncomeProfile {
  income: HousingIncomeGroup;
  disposableIncome: number;
  rentMultiplier: number;
  mortgagePrincipal: number;
  annualOwnerCosts: number;
  unemploymentExposure: number;
}

const incomeProfiles: readonly IncomeProfile[] = Object.freeze([
  Object.freeze({ income: "Lower", disposableIncome: 42_000, rentMultiplier: 0.8, mortgagePrincipal: 235_000, annualOwnerCosts: 4_000, unemploymentExposure: 1.5 }),
  Object.freeze({ income: "Middle", disposableIncome: 75_000, rentMultiplier: 1, mortgagePrincipal: 435_000, annualOwnerCosts: 6_000, unemploymentExposure: 1 }),
  Object.freeze({ income: "Higher", disposableIncome: 125_000, rentMultiplier: 1.25, mortgagePrincipal: 620_000, annualOwnerCosts: 9_000, unemploymentExposure: 0.5 }),
]);

// Additional settings are pilot assumptions. The baseline dwelling-growth,
// earnings-growth and rent-response settings are inherited from the core model.
const assumptions = Object.freeze({
  horizonYears: 10,
  baselineStockGrowthPercent: defaultPolicies.housingConstructionRate,
  downturnStartYear: defaultState.year + 2,
  downturnEndYear: defaultState.year + 4,
  unemploymentIncreasePp: 2,
  constructionCapacityFactor: 0.65,
  recoveryCapacityFactor: 1.2,
  additionalDwellingsFundedPerYear: 40_000,
  deliveryLagYears: 2,
  stateCapitalPerDwelling: 32_000,
  localCapitalPerDwelling: 8_000,
  weeklyRentalSupport: 60,
  eligibleHouseholdShare: 0.08,
  eligibleTakeUpRate: 0.8,
  earningsGrowthPercent: defaultAssumptions.baseIncomeGrowthRate * 100,
  rentSupplyGapCoefficient: responseParameters.rentGapEffect,
  mortgageInterestPercent: 5,
  mortgageTermYears: 25,
  incomeProfiles,
});

export { assumptions as housingPilotAssumptions };

export const housingDownturns = {
  none: { label: "No downturn", unemploymentIncreasePp: 0, constructionCapacityFactor: 1 },
  mild: { label: "Mild downturn", unemploymentIncreasePp: 1, constructionCapacityFactor: 0.85 },
  central: { label: "Central downturn", unemploymentIncreasePp: assumptions.unemploymentIncreasePp, constructionCapacityFactor: assumptions.constructionCapacityFactor },
  severe: { label: "Severe downturn", unemploymentIncreasePp: 3.5, constructionCapacityFactor: 0.45 },
} as const;

export const housingRentResponses = {
  low: { label: "Low", coefficient: round(assumptions.rentSupplyGapCoefficient * 0.5) },
  central: { label: "Central", coefficient: assumptions.rentSupplyGapCoefficient },
  high: { label: "High", coefficient: round(assumptions.rentSupplyGapCoefficient * 1.5) },
} as const;

export const housingSupportTakeUp = {
  low: { label: "Low", rate: 0.6 },
  central: { label: "Central", rate: assumptions.eligibleTakeUpRate },
  high: { label: "High", rate: 0.95 },
} as const;

export interface HousingPilotSettings {
  downturn: keyof typeof housingDownturns;
  rentResponse: keyof typeof housingRentResponses;
  supportTakeUp: keyof typeof housingSupportTakeUp;
}

export const defaultHousingPilotSettings = Object.freeze<HousingPilotSettings>({
  downturn: "central",
  rentResponse: "central",
  supportTakeUp: "central",
});

/** Incremental spending by payer, in nominal AUD billions. */
export interface PublicCosts {
  commonwealthOperating: number;
  stateCapital: number;
  localCapital: number;
  total: number;
}

/** Nominal annual cash flows for one representative household. */
export interface HousingPilotCohort {
  id: string;
  income: HousingIncomeGroup;
  tenure: HousingTenure;
  /** Disposable income before the pilot rental top-up. */
  annualDisposableIncome: number;
  /** Out-of-pocket housing cost after any pilot rental top-up. */
  annualHousingCosts: number;
  annualRentalSupport: number;
  annualAfterHousingIncome: number;
  housingBurdenPercent: number;
}

export interface HousingPilotYear {
  year: number;
  downturn: {
    unemploymentIncreasePp: number;
    constructionCapacityFactor: number;
  };
  unemploymentRate: number;
  dwellings: number;
  netAdditions: number;
  additionalDwellingsFunded: number;
  additionalDwellingsDelivered: number;
  /** Funded units still in the delivery lag or awaiting delivery capacity. */
  additionalDwellingsPending: number;
  weeklyMarketRent: number;
  rentSupportRecipients: number;
  publicCosts: PublicCosts;
  cumulativePublicCosts: PublicCosts;
  cohorts: HousingPilotCohort[];
}

export interface HousingPilotScenario {
  id: HousingScenarioId;
  label: string;
  description: string;
  years: HousingPilotYear[];
  cumulativePublicCosts: PublicCosts;
}

export interface HousingPilotResult {
  baselineYear: number;
  assumptions: typeof assumptions;
  scenarios: readonly [HousingPilotScenario, HousingPilotScenario, HousingPilotScenario];
}

interface HousingPackage {
  id: HousingScenarioId;
  label: string;
  description: string;
  enablesSupply: boolean;
  providesRentalSupport: boolean;
}

const baselinePackage: HousingPackage = {
  id: "baseline",
  label: "Baseline",
  description: "Reference settings without the additional supply or rental support programmes.",
  enablesSupply: false,
  providesRentalSupport: false,
};

const supplyPackage: HousingPackage = {
  id: "faster-supply",
  label: "Faster supply",
  description: "State and local infrastructure enables additional homes after a delivery lag.",
  enablesSupply: true,
  providesRentalSupport: false,
};

const supportPackage: HousingPackage = {
  id: "supply-rental-support",
  label: "Supply plus rental support",
  description: "The same supply programme with a Commonwealth top-up for eligible lower-income private renters.",
  enablesSupply: true,
  providesRentalSupport: true,
};

interface SharedYear {
  reference: SimulationState;
  ordinaryNetAdditions: number;
  downturn: HousingPilotYear["downturn"];
  unemploymentRate: number;
}

function buildSharedYears(downturn: HousingPilotSettings["downturn"]): SharedYear[] {
  const conditions = housingDownturns[downturn];
  const years = runSimulation({
    initialState: defaultState,
    policies: { ...defaultPolicies, simulationYears: assumptions.horizonYears },
    assumptions: defaultAssumptions,
    modules: [populationModule, budgetModule, housingModule],
  });

  return years.map(({ state: reference }, index) => {
    const opening = index === 0 ? defaultState : years[index - 1].state;
    const isDownturn = downturn !== "none" && reference.year >= assumptions.downturnStartYear && reference.year <= assumptions.downturnEndYear;
    let constructionCapacityFactor = 1;
    if (isDownturn) constructionCapacityFactor = conditions.constructionCapacityFactor;
    if (downturn !== "none" && reference.year > assumptions.downturnEndYear) constructionCapacityFactor = assumptions.recoveryCapacityFactor;
    const unemploymentIncreasePp = isDownturn ? conditions.unemploymentIncreasePp : 0;
    return {
      reference,
      ordinaryNetAdditions: reference.housingSupply - opening.housingSupply,
      downturn: { unemploymentIncreasePp, constructionCapacityFactor },
      unemploymentRate: reference.unemploymentRate + unemploymentIncreasePp,
    };
  });
}

function annualMortgagePayments(principal: number): number {
  const monthlyRate = assumptions.mortgageInterestPercent / 100 / 12;
  const months = assumptions.mortgageTermYears * 12;
  return 12 * principal * monthlyRate / (1 - (1 + monthlyRate) ** -months);
}

function householdOutcomes(
  year: SharedYear,
  weeklyMarketRent: number,
  providesRentalSupport: boolean,
): HousingPilotCohort[] {
  const earningsScale = year.reference.averageIncome / defaultState.averageIncome;
  const employmentLoss = year.downturn.unemploymentIncreasePp / (100 - year.reference.unemploymentRate);

  return assumptions.incomeProfiles.flatMap((profile) => {
    const annualDisposableIncome = round(profile.disposableIncome * earningsScale * (1 - profile.unemploymentExposure * employmentLoss));
    const ownerRunningCosts = profile.annualOwnerCosts * earningsScale;
    const grossCosts: Record<HousingTenure, number> = {
      "Private renter": round(weeklyMarketRent * profile.rentMultiplier * weeksPerYear),
      "Mortgage holder": round(annualMortgagePayments(profile.mortgagePrincipal) + ownerRunningCosts),
      "Outright owner": round(ownerRunningCosts),
    };

    return tenures.map((tenure) => {
      const receivesSupport = providesRentalSupport && profile.income === "Lower" && tenure === "Private renter";
      const annualRentalSupport = receivesSupport
        ? Math.min(assumptions.weeklyRentalSupport * weeksPerYear, grossCosts[tenure])
        : 0;
      const annualHousingCosts = round(grossCosts[tenure] - annualRentalSupport);
      return {
        id: `${profile.income}-${tenure}`.toLowerCase().replace(/ /g, "-"),
        income: profile.income,
        tenure,
        annualDisposableIncome,
        annualHousingCosts,
        annualRentalSupport,
        annualAfterHousingIncome: round(annualDisposableIncome - annualHousingCosts),
        housingBurdenPercent: 100 * annualHousingCosts / annualDisposableIncome,
      };
    });
  });
}

function spending(commonwealthOperating: number, stateCapital: number, localCapital: number): PublicCosts {
  // Nine decimals in billions retain dollar precision across annual totals.
  return {
    commonwealthOperating: round(commonwealthOperating, 9),
    stateCapital: round(stateCapital, 9),
    localCapital: round(localCapital, 9),
    total: round(commonwealthOperating + stateCapital + localCapital, 9),
  };
}

function runPackage(sharedYears: SharedYear[], policy: HousingPackage, settings: HousingPilotSettings): HousingPilotScenario {
  let dwellings = defaultState.housingSupply;
  let ordinaryDwellingsDue = 0;
  let additionalDwellingsDue = 0;
  let additionalDwellingsPending = 0;
  let costsToDate = spending(0, 0, 0);
  const annualFunding = policy.enablesSupply ? assumptions.additionalDwellingsFundedPerYear : 0;
  const referenceGap = housingSupplyGap(defaultState.households, defaultState.housingSupply);
  const { coefficient } = housingRentResponses[settings.rentResponse];
  const takeUpRate = housingSupportTakeUp[settings.supportTakeUp].rate;

  const years = sharedYears.map((year, index): HousingPilotYear => {
    const capacity = year.downturn.constructionCapacityFactor;
    ordinaryDwellingsDue += year.ordinaryNetAdditions;
    const ordinaryDelivered = Math.min(ordinaryDwellingsDue, Math.round(year.ordinaryNetAdditions * capacity));
    ordinaryDwellingsDue -= ordinaryDelivered;

    // Capex is paid when enabling infrastructure is committed. A funded cohort
    // joins the delivery queue only once its full delivery lag has elapsed.
    additionalDwellingsPending += annualFunding;
    if (index >= assumptions.deliveryLagYears) additionalDwellingsDue += annualFunding;
    const additionalDwellingsDelivered = Math.min(additionalDwellingsDue, Math.round(annualFunding * capacity));
    additionalDwellingsDue -= additionalDwellingsDelivered;
    additionalDwellingsPending -= additionalDwellingsDelivered;

    const netAdditions = ordinaryDelivered + additionalDwellingsDelivered;
    dwellings += netAdditions;
    const gapChange = housingSupplyGap(year.reference.households, dwellings) - referenceGap;
    const incomeScale = year.reference.averageIncome / defaultState.averageIncome;
    const weeklyMarketRent = weeklyRentProxy(defaultState.averageRent, incomeScale, gapChange, coefficient);
    const cohorts = householdOutcomes(year, weeklyMarketRent, policy.providesRentalSupport);
    const rentSupportRecipients = policy.providesRentalSupport
      ? Math.round(year.reference.households * assumptions.eligibleHouseholdShare * takeUpRate)
      : 0;
    const recipientTopUp = cohorts.find(({ annualRentalSupport }) => annualRentalSupport > 0)?.annualRentalSupport ?? 0;
    const publicCosts = spending(
      rentSupportRecipients * recipientTopUp / dollarsPerBillion,
      annualFunding * assumptions.stateCapitalPerDwelling / dollarsPerBillion,
      annualFunding * assumptions.localCapitalPerDwelling / dollarsPerBillion,
    );
    costsToDate = spending(
      costsToDate.commonwealthOperating + publicCosts.commonwealthOperating,
      costsToDate.stateCapital + publicCosts.stateCapital,
      costsToDate.localCapital + publicCosts.localCapital,
    );

    return {
      year: year.reference.year,
      downturn: { ...year.downturn },
      unemploymentRate: year.unemploymentRate,
      dwellings,
      netAdditions,
      additionalDwellingsFunded: annualFunding,
      additionalDwellingsDelivered,
      additionalDwellingsPending,
      weeklyMarketRent,
      rentSupportRecipients,
      publicCosts,
      cumulativePublicCosts: costsToDate,
      cohorts,
    };
  });

  return { id: policy.id, label: policy.label, description: policy.description, years, cumulativePublicCosts: costsToDate };
}

export function runHousingPilot(settings: HousingPilotSettings = defaultHousingPilotSettings): HousingPilotResult {
  const sharedYears = buildSharedYears(settings.downturn);
  return {
    baselineYear: defaultState.year,
    assumptions,
    scenarios: [
      runPackage(sharedYears, baselinePackage, settings),
      runPackage(sharedYears, supplyPackage, settings),
      runPackage(sharedYears, supportPackage, settings),
    ],
  };
}
