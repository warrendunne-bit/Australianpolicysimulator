export type Severity = "info" | "warning" | "critical";

export interface SimulationState {
  year: number;
  population: number;
  workforce: number;
  households: number;
  housingSupply: number;
  averageHousePrice: number;
  averageRent: number;
  housingStress: number;
  averageIncome: number;
  unemploymentRate: number;
  /** Commonwealth GGS total cash receipts, AUD billions (legacy field name). */
  taxRevenue: number;
  /** Commonwealth GGS cash payments, AUD billions. */
  governmentSpending: number;
  /** Underlying cash balance proxy, AUD billions. */
  budgetBalance: number;
  /** AGS face-value baseline; future changes use a simplified financing rule. */
  governmentDebt: number;
  inequalityScore: number;
  environmentScore: number;
  wellbeingScore: number;
}

export interface PolicySettings {
  immigrationRate: number;
  housingConstructionRate: number;
  incomeTaxRate: number;
  welfareSpendingLevel: number;
  infrastructureSpendingLevel: number;
  environmentalProtectionLevel: number;
  simulationYears: number;
}

export interface Assumptions {
  naturalGrowthRate: number;
  workforceParticipationRate: number;
  averageHouseholdSize: number;
  baseIncomeGrowthRate: number;
  /** Observed baseline gross income-tax withholding receipts, AUD billions. */
  referenceWithholdingReceipts: number;
  welfareSpendingShare: number;
  infrastructureSpendingShare: number;
  environmentalSpendingShare: number;
  debtInterestRate: number;
  housingStressRentToIncomeThreshold: number;
}

export interface ModuleWarning {
  moduleId: string;
  moduleName: string;
  year: number;
  severity: Severity;
  message: string;
}

export interface ModuleRunContext {
  state: Readonly<SimulationState>;
  policies: Readonly<PolicySettings>;
  assumptions: Readonly<Assumptions>;
  initialState: Readonly<SimulationState>;
  referencePolicies: Readonly<PolicySettings>;
}

export interface ModuleRunResult {
  stateChanges: Partial<SimulationState>;
  warnings: ModuleWarning[];
  evidence: string;
  explanation: string;
}

export interface SimulationModule {
  id: string;
  name: string;
  version: string;
  inputs: Array<keyof SimulationState | keyof PolicySettings | keyof Assumptions>;
  outputs: Array<keyof SimulationState>;
  dependsOn?: string[];
  assumptions: string[];
  run: (context: ModuleRunContext) => ModuleRunResult;
}

export interface SimulationYearResult {
  year: number;
  state: SimulationState;
  moduleResults: Array<{
    moduleId: string;
    moduleName: string;
    moduleVersion: string;
    evidence: string;
    explanation: string;
  }>;
  warnings: ModuleWarning[];
}

export interface RunSimulationInput {
  initialState: SimulationState;
  policies: PolicySettings;
  assumptions: Assumptions;
  modules: SimulationModule[];
  /** Policy settings represented by the starting state, not the scenario. */
  referencePolicies?: PolicySettings;
}
