import type { Assumptions, PolicySettings, SimulationModule, SimulationState } from "./types";
import { defaultAssumptions } from "../data/defaultAssumptions";
import { defaultPolicies } from "../data/defaultPolicies";
import { defaultState } from "../data/defaultState";

const stateFields = Object.keys(defaultState) as Array<keyof SimulationState>;

function finiteRecord<T extends object>(value: T, template: T, label: string): void {
  if (!value || typeof value !== "object") throw new Error(`${label} must be an object.`);
  for (const key of Object.keys(template) as Array<keyof T>) {
    if (typeof value[key] !== "number" || !Number.isFinite(value[key])) {
      throw new Error(`${label}.${String(key)} must be a finite number.`);
    }
  }
  for (const key of Object.keys(value)) {
    if (!Object.prototype.hasOwnProperty.call(template, key)) throw new Error(`${label} contains unknown field ${key}.`);
  }
}

function range(value: number, min: number, max: number, label: string): void {
  if (value < min || value > max) throw new Error(`${label} must be between ${min} and ${max}.`);
}

export function validateState(state: SimulationState, label = "State"): void {
  finiteRecord(state, defaultState, label);
  if (!Number.isInteger(state.year)) throw new Error(`${label}.year must be an integer.`);
  range(state.year, 0, 9999, `${label}.year`);
  for (const field of ["population", "households", "housingSupply", "averageIncome"] as const) {
    if (state[field] <= 0) throw new Error(`${label}.${field} must be positive.`);
  }
  range(state.workforce, 0, state.population, `${label}.workforce`);
  for (const field of ["averageHousePrice", "averageRent", "taxRevenue", "governmentSpending", "governmentDebt"] as const) {
    if (state[field] < 0) throw new Error(`${label}.${field} cannot be negative.`);
  }
  for (const field of ["housingStress", "unemploymentRate", "inequalityScore", "environmentScore", "wellbeingScore"] as const) {
    range(state[field], 0, 100, `${label}.${field}`);
  }
  if (Math.abs(state.taxRevenue - state.governmentSpending - state.budgetBalance) > 0.011) {
    throw new Error(`${label}.budgetBalance must equal revenue minus spending.`);
  }
}

export function validatePolicies(policies: PolicySettings, label = "Policies"): void {
  finiteRecord(policies, defaultPolicies, label);
  range(policies.immigrationRate, 0, 5, `${label}.immigrationRate`);
  range(policies.housingConstructionRate, 0, 10, `${label}.housingConstructionRate`);
  range(policies.incomeTaxRate, 0, 60, `${label}.incomeTaxRate`);
  for (const field of ["welfareSpendingLevel", "infrastructureSpendingLevel", "environmentalProtectionLevel"] as const) {
    range(policies[field], 0, 3, `${label}.${field}`);
  }
  range(policies.simulationYears, 1, 25, `${label}.simulationYears`);
  if (!Number.isInteger(policies.simulationYears)) throw new Error(`${label}.simulationYears must be an integer.`);
}

export function validateAssumptions(assumptions: Assumptions): void {
  finiteRecord(assumptions, defaultAssumptions, "Assumptions");
  range(assumptions.naturalGrowthRate, -0.1, 0.1, "Natural population growth rate");
  range(assumptions.workforceParticipationRate, 0, 1, "Labour-force share");
  range(assumptions.averageHouseholdSize, 0.1, 20, "Average household size");
  range(assumptions.baseIncomeGrowthRate, -0.1, 0.2, "Base income growth rate");
  if (assumptions.referenceWithholdingReceipts < 0) {
    throw new Error("Reference withholding receipts cannot be negative.");
  }
  range(assumptions.debtInterestRate, 0, 0.3, "Debt interest rate");
  range(assumptions.housingStressRentToIncomeThreshold, 0.01, 1, "Rent-to-income threshold");
  let spendingShares = 0;
  for (const field of ["welfareSpendingShare", "infrastructureSpendingShare", "environmentalSpendingShare"] as const) {
    range(assumptions[field], 0, 1, field);
    spendingShares += assumptions[field];
  }
  if (spendingShares > 1) throw new Error("Non-interest spending shares cannot add to more than 1.");
}

export function validateModules(modules: SimulationModule[]): void {
  if (!modules.length) throw new Error("At least one simulation module is required.");
  const seen = new Set<string>();
  const outputOwners = new Map<keyof SimulationState, string>();
  for (const module of modules) {
    if (!module.id || !module.name || !module.version || typeof module.run !== "function") {
      throw new Error("Every module needs an id, name, version and run function.");
    }
    if (seen.has(module.id)) throw new Error(`Duplicate module id: ${module.id}.`);
    for (const dependency of module.dependsOn ?? []) {
      if (!seen.has(dependency)) throw new Error(`${module.name} must run after ${dependency}.`);
    }
    for (const output of module.outputs) {
      if (!stateFields.includes(output) || output === "year") {
        throw new Error(`${module.name} declares an invalid output: ${output}.`);
      }
      if (outputOwners.has(output)) throw new Error(`Output ${output} is owned by more than one module.`);
      outputOwners.set(output, module.id);
    }
    seen.add(module.id);
  }
}
