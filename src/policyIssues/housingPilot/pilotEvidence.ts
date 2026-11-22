import {
  assumptionCalibration, calibrationSources, policyCalibration, stateCalibration,
} from "../data/calibration";
import { housingDownturns, housingPilotAssumptions, housingRentResponses, housingSupportTakeUp } from "./model";

export type PilotEvidenceBasis = "official" | "projection" | "derived" | "illustrative" | "accounting";

interface PilotEvidenceSource {
  label: string;
  url: string;
  role: string;
}

interface PilotEvidenceEntry {
  id: string;
  title: string;
  basis: readonly PilotEvidenceBasis[];
  context: string;
  inputs: string;
  timing: string;
  limitation: string;
  sources: readonly PilotEvidenceSource[];
}

const count = new Intl.NumberFormat("en-AU");
const aud = (value: number) => `A$${count.format(value)}`;
const percent = (fraction: number) => `${count.format(fraction * 100)}%`;

function coreSource(id: string, role: string): PilotEvidenceSource {
  const { publisher, title, url } = calibrationSources[id];
  return { label: `${publisher} · ${title}`, url, role };
}

const housingSystemReport: PilotEvidenceSource = {
  label: "National Housing Supply and Affordability Council · State of the Housing System 2026",
  url: "https://nhsac.gov.au/reports-and-submissions/state-housing-system-2026",
  role: "Australian supply and delivery context",
};

const assumptions = housingPilotAssumptions;
const downturnSettings = Object.values(housingDownturns).map(({ label, unemploymentIncreasePp, constructionCapacityFactor }) => {
  const capacity = percent(constructionCapacityFactor);
  if (unemploymentIncreasePp === 0) {
    return `${label} keeps unemployment on its reference path and construction capacity at ${capacity} of usual.`;
  }
  return `${label} adds ${unemploymentIncreasePp} pp to unemployment and sets construction capacity at ${capacity} of usual.`;
}).join(" ");
const rentSettings = Object.values(housingRentResponses).map(({ coefficient }) => coefficient).join(", ");
const takeUpSettings = Object.values(housingSupportTakeUp).map(({ rate }) => percent(rate)).join(", ");

export const pilotEvidenceEntries: readonly PilotEvidenceEntry[] = [
  {
    id: "stock-and-households",
    title: "Dwelling stock and household formation",
    basis: ["official", "projection", "illustrative"],
    context: "National residential dwellings at June 2025 and an Australian household projection for 2025, based on 2021 living arrangements.",
    inputs: `${count.format(stateCalibration.housingSupply.value)} dwellings and ${count.format(stateCalibration.households.value)} projected households at the reference date. The baseline carries forward ${policyCalibration.housingConstructionRate.value}% annual net dwelling-stock growth at normal capacity and ${assumptionCalibration.averageHouseholdSize.value.toFixed(2)} residents per projected household.`,
    timing: "Annual updates from the June 2025 reference.",
    limitation: "The stock includes dwellings that may be unavailable for occupation. The aggregate difference between dwelling and household counts cannot measure local shortages or vacancies. Carrying the historical growth and household-size ratios forward is a model choice.",
    sources: [
      coreSource("dwellings", "Published stock level and historical growth calculation"),
      coreSource("households", "Projected households at the reference date"),
      coreSource("population", "Population starting point and historical flows"),
    ],
  },
  {
    id: "enabling-works",
    title: "Enabling works and additional homes",
    basis: ["illustrative"],
    context: "The same national supply programme is applied to both packages that build extra homes.",
    inputs: `The programme funds enabling works for ${count.format(assumptions.additionalDwellingsFundedPerYear)} additional homes each year. Funded homes enter the additional construction queue after a ${assumptions.deliveryLagYears}-year lag. Available construction capacity can defer delivery further.`,
    timing: `The earliest delivery is ${assumptions.deliveryLagYears} annual steps after funding. Capacity constraints can lengthen the lag.`,
    limitation: "The Auckland study supports a construction response to upzoning in its study area. Applying that finding to the size or timing of an Australian enabling-works package would require local evidence. The pilot has separate construction queues and leaves displacement of other projects, location and tenure of new homes outside its scope.",
    sources: [
      {
        label: "Greenaway-McGrevy and Phillips · The Impact of Upzoning on Housing Construction in Auckland",
        url: "https://elischolar.library.yale.edu/cowles-discussion-paper-series/2689/",
        role: "Quasi-experimental research context for supply response",
      },
      housingSystemReport,
    ],
  },
  {
    id: "downturn-and-recovery",
    title: "Downturn, construction capacity and recovery",
    basis: ["derived", "illustrative"],
    context: "The unemployment baseline uses seasonally adjusted Australian labour-force counts from June 2025. Each economic setting applies the same external conditions to all three policy packages.",
    inputs: downturnSettings,
    timing: `Shocks affect ${assumptions.downturnStartYear}–${assumptions.downturnEndYear}. Recovery capacity of up to ${percent(assumptions.recoveryCapacityFactor)} of usual allows queued homes to be delivered later.`,
    limitation: "These are illustrative settings for testing sensitivity. Estimating shock probabilities or lending, mortgage repricing and demographic effects would require separate models and data.",
    sources: [
      coreSource("labour", "Employment and unemployment starting values"),
      housingSystemReport,
    ],
  },
  {
    id: "rent-response",
    title: "Starting rent and the supply-to-rent response",
    basis: ["derived", "illustrative"],
    context: "The national 2019–20 mean rent for private-landlord renters is updated to June 2025 using a capital-city rent price index.",
    inputs: `The weekly rent proxy starts at ${aud(stateCalibration.averageRent.value)}. Its annual level follows the earnings proxy and the change in the dwelling-to-household gap. The low, central and high settings test illustrative exponent coefficients of ${rentSettings}, respectively.`,
    timing: "Delivered homes can affect the market-rent proxy in the same annual step. Funding alone leaves rent unchanged.",
    limitation: "The survey and price index cover different populations and places. The starting rent is a derived proxy. Estimating the market rent response to additional homes would require evidence on the location and composition of supply and demand.",
    sources: [
      coreSource("rent", "Published starting survey mean"),
      coreSource("rentCpi", "Price index used to update the survey mean"),
    ],
  },
  {
    id: "household-outcomes",
    title: "Household cash flow and housing burden",
    basis: ["derived", "illustrative"],
    context: "Nine example households across lower, middle and higher incomes and three tenures. The earnings-growth anchor comes from the June 2025 Wage Price Index.",
    inputs: `Starting annual disposable incomes are ${assumptions.incomeProfiles.map(({ disposableIncome }) => aud(disposableIncome)).join(", ")}. They follow a ${assumptions.earningsGrowthPercent}% annual earnings-growth assumption and fall during the downturn according to assumed job-loss exposure, which is higher for the lower-income examples. Mortgage payments use a fixed ${assumptions.mortgageInterestPercent}% rate and a ${assumptions.mortgageTermYears}-year term. Housing burden divides out-of-pocket housing costs by disposable income before the pilot top-up.`,
    timing: "The household example is recalculated annually. The assumed employment effect falls within the shock years.",
    limitation: "Estimating how common hardship is would require representative household data. The ABS housing serviceability indicator uses gross income. The pilot uses disposable income and covers private renters, mortgage holders and outright owners.",
    sources: [
      coreSource("wages", "Historical fixed-job wage growth, used to index household income"),
      {
        label: "ABS · Measuring What Matters housing serviceability",
        url: "https://www.abs.gov.au/statistics/measuring-what-matters/measuring-what-matters-themes-and-indicators/secure/housing-serviceability",
        role: "Context for comparing housing costs and income by tenure",
      },
    ],
  },
  {
    id: "rental-support",
    title: "Targeted rental support",
    basis: ["illustrative"],
    context: "The package covers eligible, participating lower-income private renters. The household example is a participant, while spending uses an assumed share of projected households.",
    inputs: `A top-up of up to ${aud(assumptions.weeklyRentalSupport)} a week. Aggregate costs assume ${percent(assumptions.eligibleHouseholdShare)} of projected households are eligible. The low, central and high settings use take-up of ${takeUpSettings} among eligible households, respectively. The top-up is capped at the example household’s rent.`,
    timing: "Both the reduction in out-of-pocket rent and the public payment are counted in the same year.",
    limitation: "Eligibility, take-up and top-up are assumptions for the pilot. Commonwealth Rent Assistance uses different programme rules. The model omits changes to market rents or housing choices after the top-up.",
    sources: [
      {
        label: "Services Australia · How much Rent Assistance you can get",
        url: "https://www.servicesaustralia.gov.au/how-much-rent-assistance-you-can-get?context=22206",
        role: "Context on the distinct payment settings of the existing programme",
      },
    ],
  },
  {
    id: "incremental-spending",
    title: "Public spending by level of government",
    basis: ["accounting", "illustrative"],
    context: "Australian Commonwealth, state and territory, and local government outlays specified for the pilot packages in nominal dollars.",
    inputs: `State and territory and council capital outlays use ${aud(assumptions.stateCapitalPerDwelling)} and ${aud(assumptions.localCapitalPerDwelling)} per funded home respectively. Commonwealth operating costs multiply the number of participating households by the annual top-up.`,
    timing: "Capital spending occurs when enabling works are funded. Rental support is counted annually. Cumulative costs sum those annual outlays without discounting.",
    limitation: "The unit costs and funding split are illustrative. The comparison excludes existing programmes, private construction, administration, offsets and public debt servicing.",
    sources: [],
  },
];
