import type { ModuleWarning, SimulationModule } from "../core/types";
import { responseParameters as response } from "../data/calibration";

export const populationModule: SimulationModule = {
  id: "population",
  name: "Population and Workforce",
  version: "0.3.0",
  inputs: ["population", "immigrationRate", "naturalGrowthRate", "workforceParticipationRate", "averageHouseholdSize"],
  outputs: ["population", "workforce", "households"],
  assumptions: [
    "Net overseas migration is an annual percentage of the preceding population. The default is a rounded historical rate from the year to June 2025, not a migration-program intake or an official forecast.",
    "Workforce means labour force, including unemployed people. Its share of total population is fixed by assumption.",
    "Household formation follows a fixed ratio of June 2025 population to the ABS 2025 household projection. This is not observed private-household size or the full ABS projection method.",
  ],
  run: ({ state, policies, assumptions }) => {
    const migrationIncrease = state.population * (policies.immigrationRate / 100);
    const naturalIncrease = state.population * assumptions.naturalGrowthRate;
    const population = Math.round(state.population + naturalIncrease + migrationIncrease);
    const workforce = Math.round(population * assumptions.workforceParticipationRate);
    const households = Math.round(population / assumptions.averageHouseholdSize);
    const warnings: ModuleWarning[] = [];

    if (policies.immigrationRate > response.migrationWarning) {
      warnings.push({
        moduleId: "population",
        moduleName: "Population and Workforce",
        year: state.year,
        severity: "warning" as const,
        message: "Immigration exceeds the illustrative 1.8% warning threshold. More people expand the labour force and increase household demand.",
      });
    }

    return {
      stateChanges: {
        population,
        workforce,
        households,
      },
      warnings,
      evidence: "ABS June 2025 population and labour-force estimates, historical population flows and a household projection anchor inputs. Constant ratios and future continuation remain assumptions, not ABS/Treasury forecasts.",
      explanation: "Annual immigration is a percentage of the previous population. Natural growth is added separately; labour force and households follow fixed population ratios.",
    };
  },
};
