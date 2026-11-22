import type { ModuleWarning, SimulationModule } from "../core/types";
import { clamp, round } from "../core/modelMath";
import { responseParameters as response } from "../data/calibration";

export const budgetModule: SimulationModule = {
  id: "budget",
  name: "Budget",
  version: "0.3.0",
  dependsOn: ["population"],
  inputs: [
    "population", "workforce", "averageIncome", "unemploymentRate", "governmentDebt",
    "taxRevenue", "governmentSpending", "incomeTaxRate", "welfareSpendingLevel",
    "infrastructureSpendingLevel", "environmentalProtectionLevel", "baseIncomeGrowthRate",
    "referenceWithholdingReceipts", "debtInterestRate", "welfareSpendingShare",
    "infrastructureSpendingShare", "environmentalSpendingShare",
  ],
  outputs: ["taxRevenue", "governmentSpending", "budgetBalance", "governmentDebt", "unemploymentRate", "averageIncome"],
  assumptions: [
    "Starting fiscal values use Commonwealth GGS cash outcomes for FY 2024–25, in nominal AUD billions; state and local government budgets are not consolidated.",
    "Gross income-tax withholding is anchored to observed receipts and scaled by employed earnings and the scenario/reference tax-setting ratio. Withholding includes some non-wage payments and is before refunds, so the tax setting and response are illustrative, not measured average tax rates.",
    "Non-interest spending is split into illustrative core, welfare, infrastructure and environment shares. Level controls are relative to the reference policies represented by the starting state.",
    "Other net receipts and non-interest cash payments scale with population and gross income. Cash interest uses a fixed derived cash-interest-to-closing-debt proxy, not a market yield.",
    "Starting debt is AGS face value. The future rule adds underlying deficits to debt and repays debt from surpluses; financial-asset transactions, cash buffers and other financing are omitted, so it does not fully reconcile official gross debt.",
    "Infrastructure has illustrative income and employment effects; tax behaviour, debt constraints, assets and other macroeconomic feedbacks are omitted.",
  ],
  run: ({ state, policies, assumptions, initialState, referencePolicies }) => {
    const infrastructureChange = policies.infrastructureSpendingLevel - referencePolicies.infrastructureSpendingLevel;
    // These response coefficients are illustrative, not empirical estimates.
    const averageIncome = round(state.averageIncome * (1 + assumptions.baseIncomeGrowthRate + infrastructureChange * response.infrastructureIncomeEffect));
    const unemploymentTarget = clamp(initialState.unemploymentRate - infrastructureChange * response.infrastructureUnemploymentEffect);
    // Retain the exact baseline unemployment ratio so observed employment is
    // preserved; presentation rounds percentages, not the tax-base calculation.
    const unemploymentRate = clamp(state.unemploymentRate + (unemploymentTarget - state.unemploymentRate) * response.unemploymentAdjustment);
    const employed = state.workforce * (1 - unemploymentRate / 100);
    const referenceEmployed = initialState.workforce * (1 - initialState.unemploymentRate / 100);
    if (referenceEmployed <= 0 || referencePolicies.incomeTaxRate <= 0) {
      throw new Error("Withholding calibration requires positive reference employment and a positive reference tax setting.");
    }
    const referenceWithholding = assumptions.referenceWithholdingReceipts;
    if (referenceWithholding > initialState.taxRevenue) {
      throw new Error("Starting total receipts must cover reference withholding receipts; review the baseline's fiscal scope.");
    }
    // An observed receipt anchor, not a fitted average or statutory tax rate.
    // The employment/income/setting responses remain illustrative.
    const withholding = referenceWithholding
      * (employed / referenceEmployed)
      * (averageIncome / initialState.averageIncome)
      * (policies.incomeTaxRate / referencePolicies.incomeTaxRate);
    const economicScale = (state.population / initialState.population) * (averageIncome / initialState.averageIncome);
    const otherRevenue = (initialState.taxRevenue - referenceWithholding) * economicScale;
    // Keep official AUD-million precision in AUD-billion fields.
    const taxRevenue = round(withholding + otherRevenue, 3);

    const referenceInterest = initialState.governmentDebt * assumptions.debtInterestRate;
    const referencePrimarySpending = initialState.governmentSpending - referenceInterest;
    if (referencePrimarySpending < 0) {
      throw new Error("Starting spending must cover debt interest; review the baseline's fiscal scope.");
    }
    const coreShare = 1 - assumptions.welfareSpendingShare - assumptions.infrastructureSpendingShare - assumptions.environmentalSpendingShare;
    const spendingMultiplier = coreShare
      + assumptions.welfareSpendingShare * policies.welfareSpendingLevel / referencePolicies.welfareSpendingLevel
      + assumptions.infrastructureSpendingShare * policies.infrastructureSpendingLevel / referencePolicies.infrastructureSpendingLevel
      + assumptions.environmentalSpendingShare * policies.environmentalProtectionLevel / referencePolicies.environmentalProtectionLevel;
    const governmentSpending = round(referencePrimarySpending * economicScale * spendingMultiplier + state.governmentDebt * assumptions.debtInterestRate, 3);
    const budgetBalance = round(taxRevenue - governmentSpending, 3);
    const governmentDebt = round(Math.max(0, state.governmentDebt - budgetBalance), 3);
    const warnings: ModuleWarning[] = [];

    if (budgetBalance < -response.deficitWarning) {
      warnings.push({
        moduleId: "budget", moduleName: "Budget", year: state.year, severity: "warning",
        message: "The annual deficit exceeds the illustrative AUD 80 billion warning threshold and adds to debt.",
      });
    }
    if (budgetBalance > state.governmentDebt) {
      warnings.push({
        moduleId: "budget", moduleName: "Budget", year: state.year, severity: "info",
        message: "The surplus clears modelled debt. Any remaining surplus is not tracked as a government asset.",
      });
    }

    return {
      stateChanges: { averageIncome, unemploymentRate, taxRevenue, governmentSpending, budgetBalance, governmentDebt },
      warnings,
      evidence: "Cash receipts, payments, gross debt and withholding are anchored to the 2024–25 Final Budget Outcome, released 29 September 2025. Spending allocations, tax and employment responses, fixed interest scaling and future debt financing remain illustrative.",
      explanation: "Gross withholding starts from observed receipts and responds to the employed-earnings proxy and tax-setting ratio. Other net receipts preserve the starting cash-budget scope. Welfare, infrastructure and environment change illustrative spending allocations; the simplified debt rule omits other financing flows.",
    };
  },
};
