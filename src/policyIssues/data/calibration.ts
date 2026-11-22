import type { Assumptions, PolicySettings, SimulationState } from "../core/types";

export const calibrationMetadata = {
  version: "au-2025.1",
  referenceDate: "2025-06-30",
  checkedAt: "2026-11-15",
} as const;

export interface CalibrationSource {
  title: string;
  publisher: string;
  url: string;
  publishedAt: string;
  referencePeriod: string;
  accessedAt: string;
}

function source(title: string, publisher: string, url: string, publishedAt: string, referencePeriod: string): CalibrationSource {
  return { title, publisher, url, publishedAt, referencePeriod, accessedAt: calibrationMetadata.checkedAt };
}

export const calibrationSources: Record<string, CalibrationSource> = {
  population: source("National, state and territory population, June 2025", "ABS", "https://www.abs.gov.au/statistics/people/population/national-state-and-territory-population/jun-2025", "2025-12-18", "30 June 2025; annual changes to that date"),
  labour: source("Labour Force, Australia, June 2025 — seasonally adjusted", "ABS", "https://www.abs.gov.au/statistics/labour/employment-and-unemployment/labour-force-australia/jun-2025", "2025-07-17", "June 2025"),
  earnings: source("Average Weekly Earnings, May 2025 — all employees, total earnings, original", "ABS", "https://www.abs.gov.au/statistics/labour/earnings-and-working-conditions/average-weekly-earnings-australia/may-2025", "2025-08-14", "May 2025"),
  earningsMethod: source("Average Weekly Earnings methodology, May 2025", "ABS", "https://www.abs.gov.au/methodologies/average-weekly-earnings-australia-methodology/may-2025", "2025-08-14", "May 2025 survey scope"),
  wages: source("Wage Price Index, June 2025", "ABS", "https://www.abs.gov.au/statistics/economy/price-indexes-and-inflation/wage-price-index-australia/jun-2025", "2025-08-13", "Year to June 2025"),
  dwellings: source("Total Value of Dwellings, June quarter 2025 — Table 1", "ABS", "https://www.abs.gov.au/statistics/economy/price-indexes-and-inflation/total-value-dwellings/jun-quarter-2025", "2025-09-09", "June 2025 and revised June 2024 stock"),
  households: source("Household and Family Projections, 2021–2046 — medium population, series II", "ABS", "https://www.abs.gov.au/statistics/people/population/household-and-family-projections-australia/2021-2046", "2024-06-28", "2025 projection from a 2021 base"),
  rent: source("Housing Occupancy and Costs methodology, 2019–20 — Table A1 rent payments", "ABS", "https://www.abs.gov.au/methodologies/housing-occupancy-and-costs-methodology/2019-20", "2022-05-25", "FY 2019–20; private-landlord renters"),
  rentCpi: source("Consumer Price Index, June quarter 2025 — Table 7, Rents A2331876F", "ABS", "https://www.abs.gov.au/statistics/economy/price-indexes-and-inflation/consumer-price-index-australia/jun-quarter-2025", "2025-07-30", "FY 2019–20 quarterly indices and June 2025"),
  rentScope: source("Latest insights into the rental market", "ABS", "https://www.abs.gov.au/articles/latest-insights-rental-market", "2025-05-28", "Rental series coverage and CPI distinctions"),
  fiscal: source("Final Budget Outcome 2024–25 — Appendix B, Tables B.1 and B.5", "Australian Government Treasury / Finance", "https://archive.budget.gov.au/2024-25/fbo/download/06_appendix_b.pdf", "2025-09-29", "FY 2024–25 cash outcomes; debt at 30 June 2025"),
  withholding: source("Final Budget Outcome 2024–25 — Part 1, Table 1.3", "Australian Government Treasury / Finance", "https://archive.budget.gov.au/2024-25/fbo/download/01_part_1.pdf", "2025-09-29", "FY 2024–25 cash tax receipts"),
  fiscalFunctions: source("Final Budget Outcome 2024–25 — Appendix A, Table A.1", "Australian Government Treasury / Finance", "https://archive.budget.gov.au/2024-25/fbo/download/05_appendix_a.pdf", "2025-09-29", "FY 2024–25 accrual expenses, not cash payments"),
  fiscalFinancing: source("Final Budget Outcome 2024–25 — Part 2, Table 2.3", "Australian Government Treasury / Finance", "https://archive.budget.gov.au/2024-25/fbo/download/02_part_2.pdf", "2025-09-29", "FY 2024–25 financing and cash-flow reconciliation"),
};

/** Selected release-vintage values, before rounding controls or deriving proxies. */
export const observations = {
  population: 27_614_411,
  populationAnnualChange: 420_125,
  naturalIncrease: 114_556,
  netOverseasMigration: 305_569,
  employed: 14_619_300,
  unemployed: 659_600,
  weeklyEmployeeEarnings: 1542.30,
  annualWagePriceGrowthPercent: 3.4,
  projectedHouseholds: 10_622_921,
  dwellingStock: 11_373_900,
  priorDwellingStock: 11_200_100,
  meanDwellingPrice: 1_016_700,
  privateWeeklyRent2019_20: 410,
  rentCpi2019_20: [112.4, 112.4, 112.5, 111.0],
  rentCpiJune2025: 135.0,
  receipts: 716.951,
  payments: 726.941,
  underlyingCashBalance: -9.990,
  grossDebt: 928.639,
  priorGrossDebt: 906.939,
  cashInterest: 24.270,
  grossWithholding: 295.827,
} as const;

const priorPopulation = observations.population - observations.populationAnnualChange;
const labourForce = observations.employed + observations.unemployed;
const rentCpiBase = observations.rentCpi2019_20.reduce((sum, value) => sum + value, 0) / 4;
const round = (value: number, decimals = 2) => Math.round(value * 10 ** decimals) / 10 ** decimals;

export type CalibrationStatus = "official" | "projection" | "derived" | "illustrative";
export interface ParameterEvidence {
  label: string;
  value: number;
  unit: string;
  status: CalibrationStatus;
  referencePeriod: string;
  sourceIds: string[];
  derivation?: string;
  notes: string;
}
export interface CalibrationEntry extends ParameterEvidence { group: string; key: string }

function evidence(label: string, value: number, unit: string, status: CalibrationStatus, referencePeriod: string, sourceIds: string[], notes: string, derivation?: string): ParameterEvidence {
  return { label, value, unit, status, referencePeriod, sourceIds, notes, ...(derivation ? { derivation } : {}) };
}
function illustrative(label: string, value: number, unit: string, notes: string): ParameterEvidence {
  return evidence(label, value, unit, "illustrative", "Model choice; not an observed statistic", [], notes);
}

export const stateCalibration: Record<keyof SimulationState, ParameterEvidence> = {
  year: evidence("Starting year", 2025, "year", "derived", "30 June 2025 / FY 2024–25", ["population", "fiscal"], "Selected historical reference set, not the latest available release for every series. Annual steps are years ending June."),
  population: evidence("Estimated resident population", observations.population, "people", "official", "30 June 2025", ["population"], "ABS estimate in the December 2025 release; subject to revision."),
  workforce: evidence("Labour force", labourForce, "people", "derived", "June 2025", ["labour"], "Seasonally adjusted survey counts. Total population and labour-force survey universes differ.", "14,619,300 employed + 659,600 unemployed"),
  households: evidence("Projected households", observations.projectedHouseholds, "households", "projection", "2025 projection; release June 2024", ["households"], "Medium population projection, series II living arrangements. Not an observed household count or the ABS projection model reproduced in full."),
  housingSupply: evidence("Residential dwelling stock", observations.dwellingStock, "dwellings", "official", "June quarter 2025", ["dwellings"], "Table 1 Data1!AT66, thousands × 1,000. Preliminary estimate; includes dwellings not available for immediate occupation."),
  averageHousePrice: evidence("Mean residential dwelling price", observations.meanDwellingPrice, "AUD", "official", "June quarter 2025", ["dwellings"], "Table 1 Data1!AK66, thousands × 1,000. All residential dwelling types; not a median sale price or houses-only measure."),
  averageRent: evidence("CPI-updated private-rent proxy", round(observations.privateWeeklyRent2019_20 * observations.rentCpiJune2025 / rentCpiBase), "AUD / week", "derived", "2019–20 mean updated to June 2025 prices", ["rent", "rentCpi", "rentScope"], "National private-landlord mean updated using eight-capital-city CPI rents, which also includes government rents and rent-assistance effects. Not an observed 2025 national mean.", "410 × 135.0 / mean(112.4, 112.4, 112.5, 111.0), rounded to cents"),
  housingStress: illustrative("Starting housing-pressure index", 31, "index / 100", "Arbitrary reference index; not the measured share of households in rental stress."),
  averageIncome: evidence("Annualised employee-earnings proxy", round(observations.weeklyEmployeeEarnings * 52), "AUD / year", "derived", "May 2025 survey week × 52", ["earnings", "earningsMethod"], "All employees, total earnings, original series. Typical-week annualisation is not observed annual income. Applying it to all employed people includes a coverage mismatch with self-employed people and excluded industries.", "1,542.30 × 52"),
  unemploymentRate: evidence("Unemployment from published counts", observations.unemployed / labourForce * 100, "%", "derived", "June 2025", ["labour"], "Preserves the published employed/unemployed count identity. The ABS headline rate is rounded to 4.3%; the input counts are themselves rounded.", "659,600 / 15,278,900 × 100"),
  taxRevenue: evidence("Commonwealth GGS total cash receipts", observations.receipts, "AUD bn", "official", "FY 2024–25", ["fiscal"], "Includes tax and non-tax receipts; excludes consolidated state/local government budgets. Table B.1, millions ÷ 1,000."),
  governmentSpending: evidence("Commonwealth GGS cash payments", observations.payments, "AUD bn", "official", "FY 2024–25", ["fiscal"], "Table B.1 cash payments; not accrual expenses. Includes non-financial asset purchases and lease principal payments."),
  budgetBalance: evidence("Underlying cash balance", observations.underlyingCashBalance, "AUD bn", "official", "FY 2024–25", ["fiscal", "fiscalFinancing"], "Published balance also reconciles to receipts minus payments. Different from the headline cash balance.", "716.951 − 726.941 = −9.990"),
  governmentDebt: evidence("Gross debt, AGS face value", observations.grossDebt, "AUD bn", "official", "30 June 2025", ["fiscal", "fiscalFinancing"], "Australian Government Securities face value, not net debt. Future debt changes omit financial-asset and other financing transactions."),
  inequalityScore: illustrative("Starting inequality index", 35, "index / 100", "Synthetic reference index, not a Gini coefficient or a measured Australian inequality statistic."),
  environmentScore: illustrative("Starting environment index", 62, "index / 100", "Synthetic reference index, not observed emissions, biodiversity or an official composite indicator."),
  wellbeingScore: illustrative("Starting wellbeing index", 68, "index / 100", "Synthetic reference index, not a survey-derived Australian wellbeing score."),
};

export const policyCalibration: Record<keyof PolicySettings, ParameterEvidence> = {
  immigrationRate: evidence("Net overseas migration rate", round(observations.netOverseasMigration / priorPopulation * 100), "% / year", "derived", "Year to June 2025, carried forward", ["population"], "Historical net migration divided by opening population, rounded to a 0.01 percentage-point control step. Constant future growth is a scenario assumption, not an ABS/Treasury forecast.", "305,569 / 27,194,286 × 100 = 1.12365149%, rounded to 1.12%"),
  housingConstructionRate: evidence("Net dwelling-stock growth", round((observations.dwellingStock / observations.priorDwellingStock - 1) * 100), "% / year", "derived", "June 2024 to June 2025, same release vintage", ["dwellings"], "Net stock additions, not gross construction completions. A constant future rate is an illustrative continuation.", "(11,373,900 − 11,200,100) / 11,200,100 × 100 = 1.55177186%, rounded to 1.55%"),
  incomeTaxRate: illustrative("Reference income-tax setting", 24, "%", "Illustrative reference for scaling observed gross withholding and the after-tax affordability proxy; not an observed average or statutory Australian tax rate."),
  welfareSpendingLevel: illustrative("Welfare multiplier", 1, "×", "Neutral multiplier of an illustrative cash allocation; not a measured policy intensity."),
  infrastructureSpendingLevel: illustrative("Infrastructure multiplier", 1, "×", "Neutral multiplier of an illustrative cash allocation."),
  environmentalProtectionLevel: illustrative("Environmental spending multiplier", 1, "×", "Neutral multiplier of an illustrative cash allocation."),
  simulationYears: illustrative("Default simulation horizon", 10, "years", "User-configurable exploration horizon, not an official forecast period."),
};

export const assumptionCalibration: Record<keyof Assumptions, ParameterEvidence> = {
  naturalGrowthRate: evidence("Natural population growth anchor", observations.naturalIncrease / priorPopulation, "fraction / year", "derived", "Year to June 2025, carried forward", ["population"], "Historical births minus deaths divided by opening population. Keeping it fixed omits age structure and changing fertility/mortality.", "114,556 / 27,194,286"),
  workforceParticipationRate: evidence("Labour force / total population", labourForce / observations.population, "fraction", "derived", "June 2025", ["labour", "population"], "Model ratio, not the official working-age participation rate of 67.1%. Held constant in scenarios.", "15,278,900 / 27,614,411"),
  averageHouseholdSize: evidence("Residents per projected household", observations.population / observations.projectedHouseholds, "people / household", "derived", "June 2025 ERP / 2025 household projection", ["population", "households"], "Combines different statistical universes and release vintages. Not observed private-household size; no explicit institutional-population adjustment.", "27,614,411 / 10,622,921"),
  baseIncomeGrowthRate: evidence("Historical wage-growth anchor", observations.annualWagePriceGrowthPercent / 100, "fraction / year", "derived", "Year to June 2025, carried forward", ["wages", "earningsMethod"], "Seasonally adjusted WPI rose 3.4%. Applying fixed-job wage-price growth to an annualised mean-earnings proxy and holding it constant are modelling assumptions.", "3.4 / 100"),
  referenceWithholdingReceipts: evidence("Reference gross income-tax withholding", observations.grossWithholding, "AUD bn", "official", "FY 2024–25", ["withholding"], "Table 1.3 gross withholding before refunds. Includes non-wage payments; model employment/earnings scaling is a proxy. Other receipts and net refund effects remain in the residual."),
  welfareSpendingShare: { ...illustrative("Welfare cash-allocation share", 0.30, "fraction", "Not calibrated: published social-security/welfare function expenses are accrual amounts and cannot be silently divided by cash payments."), sourceIds: ["fiscalFunctions"] },
  infrastructureSpendingShare: { ...illustrative("Infrastructure cash-allocation share", 0.12, "fraction", "Not calibrated: transport/communication accrual expenses are neither a cash measure nor all infrastructure."), sourceIds: ["fiscalFunctions"] },
  environmentalSpendingShare: { ...illustrative("Environment cash-allocation share", 0.03, "fraction", "Not calibrated: environment-protection accrual expenses omit related spending in other functions and do not map directly to cash."), sourceIds: ["fiscalFunctions"] },
  debtInterestRate: evidence("Cash interest / closing gross debt proxy", observations.cashInterest / observations.grossDebt, "fraction / year", "derived", "FY 2024–25 interest / 30 June 2025 debt", ["fiscal"], "All-GGS cash interest divided by closing AGS face value, not average debt. Includes non-AGS interest; not a bond yield or marginal borrowing rate. Fixed future use is illustrative.", "24.270 / 928.639"),
  housingStressRentToIncomeThreshold: illustrative("Rent-to-income reference threshold", 0.30, "fraction", "Heuristic scale for a one-earner after-tax income proxy, not the distributional 30/40 housing-stress measure."),
};

/** These coefficients are deliberately not estimated from a single aggregate observation. */
export const responseCalibration = {
  infrastructureIncomeEffect: illustrative("Infrastructure → annual income growth", 0.002, "fraction / extra ×", "Illustrative response, no causal estimate fitted."),
  infrastructureUnemploymentEffect: illustrative("Infrastructure → unemployment target", 0.6, "percentage points / extra ×", "Illustrative response, no causal estimate fitted."),
  unemploymentAdjustment: illustrative("Annual unemployment target adjustment", 0.25, "fraction", "Illustrative adjustment speed."),
  housePriceGapEffect: illustrative("Dwelling price supply-gap coefficient", 0.8, "coefficient", "Illustrative exponential level response; not an estimated supply elasticity."),
  rentGapEffect: illustrative("Rent supply-gap coefficient", 0.6, "coefficient", "Illustrative exponential level response; not an estimated supply elasticity."),
  stressAffordabilityEffect: illustrative("Affordability → housing-pressure index", 45, "index weight", "Illustrative index weight."),
  stressGapEffect: illustrative("Supply gap → housing-pressure index", 50, "index weight", "Illustrative index weight; aggregate stock surplus is not a vacancy measure."),
  inequalityHousingEffect: illustrative("Housing pressure → inequality index", 0.3, "index weight", "Illustrative index weight."),
  inequalityWelfareEffect: illustrative("Welfare → inequality index", 6, "index points / extra ×", "Illustrative response; not a distributional tax-benefit model."),
  environmentProtectionEffect: illustrative("Protection → environment index", 12, "index points / extra ×", "Illustrative response; no emissions or ecological model."),
  environmentInfrastructureEffect: illustrative("Infrastructure → environment index", 3, "index points / extra ×", "Illustrative response; ignores project type and mitigation."),
  wellbeingHousingEffect: illustrative("Housing pressure → wellbeing", 0.35, "index weight", "Illustrative index weight."),
  wellbeingUnemploymentEffect: illustrative("Unemployment → wellbeing", 1.5, "index weight", "Illustrative index weight."),
  wellbeingInequalityEffect: illustrative("Inequality → wellbeing", 0.25, "index weight", "Illustrative index weight."),
  wellbeingEnvironmentEffect: illustrative("Environment → wellbeing", 0.2, "index weight", "Illustrative index weight."),
  migrationWarning: illustrative("Migration warning threshold", 1.8, "% / year", "Model signal, not an empirically established safe migration limit."),
  deficitWarning: illustrative("Deficit warning threshold", 80, "AUD bn", "Fixed model signal, not a debt-sustainability assessment."),
  shortageWarning: illustrative("Aggregate supply-gap warning threshold", 0.04, "fraction", "Model gap threshold, not an observed vacancy/shortage standard."),
  wellbeingWarning: illustrative("Wellbeing warning threshold", 55, "index / 100", "Illustrative signal on a synthetic scale."),
};

export function calibrationValues<T extends Record<string, ParameterEvidence>>(entries: T): { [K in keyof T]: number } {
  return Object.fromEntries(Object.entries(entries).map(([key, entry]) => [key, entry.value])) as { [K in keyof T]: number };
}
export const responseParameters = calibrationValues(responseCalibration);

export const calibrationEntries: CalibrationEntry[] = [
  ...Object.entries(stateCalibration).map(([key, entry]) => ({ group: "Starting state", key, ...entry })),
  ...Object.entries(policyCalibration).map(([key, entry]) => ({ group: "Policy defaults", key, ...entry })),
  ...Object.entries(assumptionCalibration).map(([key, entry]) => ({ group: "Assumptions", key, ...entry })),
  ...Object.entries(responseCalibration).map(([key, entry]) => ({ group: "Relationships and warning thresholds", key, ...entry })),
];
