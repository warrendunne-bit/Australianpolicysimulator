import type { ModuleWarning, SimulationModule } from "../core/types";
import { clamp, round } from "../core/modelMath";
import { responseParameters as response } from "../data/calibration";

export function housingSupplyGap(households: number, dwellings: number) {
  return (households - dwellings) / households;
}

export function weeklyRentProxy(startingRent: number, incomeScale: number, gapChange: number, rentGapEffect: number) {
  return round(startingRent * incomeScale * Math.exp(gapChange * rentGapEffect));
}

export const housingModule: SimulationModule = {
  id: "housing",
  name: "Housing",
  version: "0.3.0",
  dependsOn: ["population", "budget"],
  inputs: [
    "households", "housingSupply", "averageHousePrice", "averageRent", "averageIncome", "housingStress",
    "housingConstructionRate", "incomeTaxRate", "housingStressRentToIncomeThreshold",
  ],
  outputs: ["housingSupply", "averageHousePrice", "averageRent", "housingStress"],
  assumptions: [
    "The supply control represents net residential dwelling-stock growth, anchored to the ABS June 2024–June 2025 change. It is not gross construction completions.",
    "Starting dwelling stock and mean value are ABS estimates; households are an ABS projection. Total dwellings are not all immediately available, so this aggregate gap is not observed vacancy or a measured national shortage.",
    "Starting rent is a 2019–20 private-rent mean updated with capital-city CPI rents. It is a derived proxy with geographic and tenure mismatches, not an observed 2025 mean.",
    "Prices and weekly rents are levels anchored to starting values, gross income growth and the change in the household-to-housing gap. Response coefficients are illustrative.",
    "Housing stress is a 0–100 pressure index, not a percentage of households. Affordability uses weekly rent times 52 divided by one average earner's after-tax income.",
    "Stress responds to current affordability and supply conditions relative to the starting state; unchanged conditions do not accumulate extra stress each year.",
  ],
  run: ({ state, policies, assumptions, initialState, referencePolicies }) => {
    const housingSupply = Math.round(state.housingSupply * (1 + policies.housingConstructionRate / 100));
    const gap = housingSupplyGap(state.households, housingSupply);
    const referenceGap = housingSupplyGap(initialState.households, initialState.housingSupply);
    const gapChange = gap - referenceGap;
    const incomeScale = state.averageIncome / initialState.averageIncome;
    // Level responses avoid persistent drift when supply, demand and income are fixed.
    const averageHousePrice = round(initialState.averageHousePrice * incomeScale * Math.exp(gapChange * response.housePriceGapEffect));
    const averageRent = weeklyRentProxy(initialState.averageRent, incomeScale, gapChange, response.rentGapEffect);
    const disposableIncome = state.averageIncome * (1 - policies.incomeTaxRate / 100);
    const referenceDisposableIncome = initialState.averageIncome * (1 - referencePolicies.incomeTaxRate / 100);
    const rentBurden = averageRent * 52 / disposableIncome;
    const referenceRentBurden = initialState.averageRent * 52 / referenceDisposableIncome;
    const affordabilityChange = (rentBurden - referenceRentBurden) / assumptions.housingStressRentToIncomeThreshold;
    const housingStress = round(clamp(initialState.housingStress + affordabilityChange * response.stressAffordabilityEffect + gapChange * response.stressGapEffect), 1);
    const warnings: ModuleWarning[] = [];

    if (gap > response.shortageWarning) {
      warnings.push({
        moduleId: "housing", moduleName: "Housing", year: state.year, severity: "critical",
        message: "Modelled households exceed aggregate dwelling stock by more than the illustrative 4% gap threshold. This is not an official shortage or vacancy measure.",
      });
    }
    if (rentBurden > assumptions.housingStressRentToIncomeThreshold) {
      warnings.push({
        moduleId: "housing", moduleName: "Housing", year: state.year, severity: "warning",
        message: "Annual rent exceeds the assumed share of one average earner's after-tax income. This is an affordability proxy, not a count of stressed households.",
      });
    }

    return {
      stateChanges: { housingSupply, averageHousePrice, averageRent, housingStress },
      warnings,
      evidence: "ABS dwelling estimates, an official household projection and a CPI-updated private-rent proxy anchor the baseline. Price responses and housing-pressure weights remain illustrative; no causal elasticity or household distribution has been fitted.",
      explanation: "Dwelling stock grows at the net stock-growth setting. Mean values and the rent proxy respond to income and changes in the aggregate stock/household gap. Housing pressure uses a one-earner after-tax affordability proxy and an illustrative index.",
    };
  },
};
