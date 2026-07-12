import type {
  BaselineVariable,
  ModelConfiguration,
  PolicySetting,
  ValidationIssue,
  ValidationResult,
} from '../types';

const NON_NEGATIVE_UNITS = ['people', 'dwellings', 'people/year', 'homes/year', 'AUD/worker/year', 'AUD/person/year'];

export function validateModelConfiguration(config: ModelConfiguration): ValidationResult {
  const issues: ValidationIssue[] = [];
  const ids = [
    ...config.baselineVariables.map((item) => item.id),
    ...config.behaviouralAssumptions.map((item) => item.id),
    ...config.policySettings.map((item) => item.id),
    ...config.scenarios.map((item) => item.id),
    ...config.baselineVersions.map((item) => item.id),
  ];
  const seen = new Set<string>();

  for (const id of ids) {
    if (seen.has(id)) {
      issues.push({ id, rule: 'duplicate-identifier', severity: 'error', message: `Duplicate identifier: ${id}` });
    }
    seen.add(id);
  }

  for (const variable of config.baselineVariables) {
    validateBaselineVariable(variable, issues);
  }
  validatePopulationComponents(config.baselineVariables, issues);

  for (const setting of config.policySettings) {
    validatePolicySetting(setting, issues);
  }

  for (const scenario of config.scenarios) {
    if (!scenario.baselineVersionId) {
      issues.push({ id: scenario.id, rule: 'missing-baseline-version', severity: 'error', message: 'Scenario is missing a baseline version.' });
    }
    if (!config.baselineVersions.some((version) => version.id === scenario.baselineVersionId)) {
      issues.push({ id: scenario.id, rule: 'missing-baseline-version', severity: 'error', message: `Scenario references unknown baseline version ${scenario.baselineVersionId}.` });
    }
  }

  return { valid: !issues.some((issue) => issue.severity === 'error'), issues };
}

function validatePopulationComponents(variables: BaselineVariable[], issues: ValidationIssue[]) {
  const annualGrowth = variables.find((item) => item.id === 'baseline.population.annualGrowth');
  const naturalIncrease = variables.find((item) => item.id === 'baseline.demography.naturalIncrease');
  const netOverseasMigration = variables.find((item) => item.id === 'baseline.migration.netOverseasMigration');

  if (!annualGrowth || !naturalIncrease || !netOverseasMigration) return;

  const reconciledGrowth = naturalIncrease.value + netOverseasMigration.value;
  if (Math.abs(reconciledGrowth - annualGrowth.value) > 1_000) {
    issues.push({
      id: annualGrowth.id,
      rule: 'population-component-reconciliation',
      severity: 'warning',
      message: `Population annual growth (${annualGrowth.value}) does not reconcile with natural increase plus NOM (${reconciledGrowth}).`,
    });
  }
}

function validateBaselineVariable(variable: BaselineVariable, issues: ValidationIssue[]) {
  if (!variable.unit.trim()) {
    issues.push({ id: variable.id, rule: 'missing-unit', severity: 'error', message: 'Baseline variable is missing a unit.' });
  }
  if (!variable.sourceLocation.trim() || !variable.sourceOrganisation.trim() || !variable.sourceTitle.trim()) {
    issues.push({ id: variable.id, rule: 'missing-source', severity: 'error', message: 'Baseline variable is missing source metadata.' });
  }
  if (!variable.referencePeriod.trim()) {
    issues.push({ id: variable.id, rule: 'missing-reference-period', severity: 'error', message: 'Baseline variable is missing a reference period.' });
  }
  if (!variable.confidenceRating) {
    issues.push({ id: variable.id, rule: 'missing-confidence-rating', severity: 'error', message: 'Baseline variable is missing a confidence rating.' });
  }
  if (variable.lowEstimate > variable.centralEstimate || variable.centralEstimate > variable.highEstimate) {
    issues.push({ id: variable.id, rule: 'invalid-range', severity: 'error', message: 'Baseline variable range must be low <= central <= high.' });
  }
  if (NON_NEGATIVE_UNITS.includes(variable.unit) && variable.value < 0) {
    issues.push({ id: variable.id, rule: 'impossible-negative-value', severity: 'error', message: 'Baseline variable cannot be negative for this unit.' });
  }
  if (isStale(variable.dateAccessed, variable.updateFrequency)) {
    issues.push({ id: variable.id, rule: 'stale-review-date', severity: 'warning', message: 'Baseline variable may be stale under its update frequency.' });
  }
}

function validatePolicySetting(setting: PolicySetting, issues: ValidationIssue[]) {
  if (!setting.unit.trim()) {
    issues.push({ id: setting.id, rule: 'missing-unit', severity: 'error', message: 'Policy setting is missing a unit.' });
  }
  if (!setting.confidenceRating) {
    issues.push({ id: setting.id, rule: 'missing-confidence-rating', severity: 'error', message: 'Policy setting is missing confidence rating.' });
  }
  if (!setting.baselineVersion) {
    issues.push({ id: setting.id, rule: 'missing-baseline-version', severity: 'error', message: 'Policy setting is missing baseline version.' });
  }
}

function isStale(dateAccessed: string, updateFrequency: string) {
  if (!dateAccessed || updateFrequency.toLowerCase().includes('pending')) return false;
  const accessed = Date.parse(dateAccessed);
  if (Number.isNaN(accessed)) return false;
  const ageDays = (Date.now() - accessed) / (1000 * 60 * 60 * 24);
  if (updateFrequency.toLowerCase().includes('quarter')) return ageDays > 120;
  if (updateFrequency.toLowerCase().includes('month')) return ageDays > 45;
  if (updateFrequency.toLowerCase().includes('annual') || updateFrequency.toLowerCase().includes('year')) return ageDays > 450;
  return false;
}
