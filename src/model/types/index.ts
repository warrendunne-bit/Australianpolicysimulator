export type EvidenceClassification =
  | 'observed-baseline-data'
  | 'behavioural-relationship'
  | 'policy-setting'
  | 'accounting-identity'
  | 'scoring-or-weighting-assumption'
  | 'commentary-threshold'
  | 'exploratory-or-unsupported-assumption'
  | 'technical-constant';

export type ConfidenceRating = 'high' | 'moderate' | 'low' | 'exploratory';

export type MaterialityRating = 'high' | 'medium' | 'low';

export type BaselineStatus = 'draft' | 'under-review' | 'calibrated' | 'superseded';

export type BaselineVersion = {
  id: string;
  reviewDate: string;
  referenceYear: number;
  status: BaselineStatus;
  summaryOfChanges: string;
  knownGaps: string[];
  approvedState: 'draft' | 'approved';
};

export type BaselineVariable = {
  id: string;
  name: string;
  description: string;
  value: number;
  unit: string;
  referencePeriod: string;
  geography: string;
  sourceOrganisation: string;
  sourceTitle: string;
  sourceLocation: string;
  publicationDate: string;
  dateAccessed: string;
  updateFrequency: string;
  classification: EvidenceClassification;
  confidenceRating: ConfidenceRating;
  lowEstimate: number;
  centralEstimate: number;
  highEstimate: number;
  transformationNotes: string;
  affectedModelAreas: string[];
  baselineVersion: string;
};

export type BehaviouralAssumption = {
  id: string;
  description: string;
  centralValue: number;
  plausibleLow: number;
  plausibleHigh: number;
  unit: string;
  supportingEvidence: string;
  confidence: ConfidenceRating;
  affectedRelationships: string[];
  formulaLocation: string;
  materiality: MaterialityRating;
  calibrationStatus: 'uncalibrated' | 'partially-calibrated' | 'calibrated';
  reviewerNotes: string;
};

export type PolicySetting = {
  id: string;
  name: string;
  description: string;
  value: number;
  unit: string;
  classification: 'policy-setting';
  confidenceRating: ConfidenceRating;
  materiality: MaterialityRating;
  userControlled: boolean;
  baselineVersion: string;
  affectedModelAreas: string[];
  notes: string;
};

export type ScenarioConfig = {
  id: string;
  name: string;
  description: string;
  baselineVersionId: string;
  policySettingIds: string[];
  assumptionIds: string[];
  notes: string;
};

export type ScenarioPolicySnapshot = {
  scenarioId: string;
  baselineVersionId: string;
  policyValues: Record<string, number>;
};

export type ValidationRule =
  | 'missing-unit'
  | 'missing-source'
  | 'stale-review-date'
  | 'invalid-range'
  | 'duplicate-identifier'
  | 'missing-confidence-rating'
  | 'missing-reference-period'
  | 'population-component-reconciliation'
  | 'impossible-negative-value'
  | 'missing-baseline-version'
  | 'incompatible-unit';

export type ValidationIssue = {
  id: string;
  rule: ValidationRule;
  severity: 'error' | 'warning';
  message: string;
};

export type ValidationResult = {
  valid: boolean;
  issues: ValidationIssue[];
};

export type ModelConfiguration = {
  baselineVariables: BaselineVariable[];
  behaviouralAssumptions: BehaviouralAssumption[];
  policySettings: PolicySetting[];
  scenarios: ScenarioConfig[];
  baselineVersions: BaselineVersion[];
};

export type ProvenanceRow = {
  id: string;
  name: string;
  value: string;
  date: string;
  source: string;
  classification: EvidenceClassification;
  confidence: ConfidenceRating;
  range: string;
  affectedOutputs: string;
};
