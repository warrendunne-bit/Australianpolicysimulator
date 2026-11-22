import type {
  RunSimulationInput,
  SimulationState,
  SimulationYearResult,
} from "./types";
import { defaultPolicies } from "../data/defaultPolicies";
import { validateAssumptions, validateModules, validatePolicies, validateState } from "./validation";

export function runSimulation({
  initialState,
  policies,
  assumptions,
  modules,
  referencePolicies = defaultPolicies,
}: RunSimulationInput): SimulationYearResult[] {
  validateState(initialState, "Initial state");
  validatePolicies(policies);
  validatePolicies(referencePolicies, "Reference policies");
  validateAssumptions(assumptions);
  validateModules(modules);
  if (referencePolicies.incomeTaxRate <= 0) {
    throw new Error("Reference policies.incomeTaxRate must be positive for withholding calibration.");
  }
  if (assumptions.referenceWithholdingReceipts > initialState.taxRevenue) {
    throw new Error("Starting total receipts must cover reference withholding receipts.");
  }
  for (const field of ["welfareSpendingLevel", "infrastructureSpendingLevel", "environmentalProtectionLevel"] as const) {
    if (referencePolicies[field] <= 0) throw new Error(`Reference policies.${field} must be positive.`);
  }
  // This state currently contains only primitives; shallow frozen copies protect
  // caller data and prevent modules changing one another's inputs accidentally.
  const frozenInitial = Object.freeze({ ...initialState });
  const frozenPolicies = Object.freeze({ ...policies });
  const frozenReference = Object.freeze({ ...referencePolicies });
  const frozenAssumptions = Object.freeze({ ...assumptions });
  let current: SimulationState = { ...initialState };
  const history: SimulationYearResult[] = [];

  for (let step = 1; step <= frozenPolicies.simulationYears; step += 1) {
    current = {
      ...current,
      year: frozenInitial.year + step,
    };

    const yearWarnings: SimulationYearResult["warnings"] = [];
    const moduleResults: SimulationYearResult["moduleResults"] = [];

    for (const module of modules) {
      const result = module.run({
        state: Object.freeze({ ...current }),
        policies: frozenPolicies,
        assumptions: frozenAssumptions,
        initialState: frozenInitial,
        referencePolicies: frozenReference,
      });

      for (const field of Object.keys(result.stateChanges)) {
        if (field === "year" || !module.outputs.includes(field as keyof SimulationState)) {
          throw new Error(`${module.name} returned undeclared output ${field}.`);
        }
      }
      if (!result.evidence?.trim() || !result.explanation?.trim()) {
        throw new Error(`${module.name} must describe its evidence and calculation.`);
      }
      if (!Array.isArray(result.warnings)) throw new Error(`${module.name} warnings must be an array.`);
      for (const warning of result.warnings) {
        if (warning.moduleId !== module.id || warning.moduleName !== module.name || warning.year !== current.year
          || !["info", "warning", "critical"].includes(warning.severity) || !warning.message?.trim()) {
          throw new Error(`${module.name} returned an invalid warning.`);
        }
      }

      current = {
        ...current,
        ...result.stateChanges,
      };
      validateState(current, `${module.name} result`);

      yearWarnings.push(...result.warnings.map((warning) => ({ ...warning })));
      moduleResults.push({
        moduleId: module.id,
        moduleName: module.name,
        moduleVersion: module.version,
        evidence: result.evidence,
        explanation: result.explanation,
      });
    }

    history.push({
      year: current.year,
      state: { ...current },
      moduleResults,
      warnings: yearWarnings,
    });
  }

  return history;
}
