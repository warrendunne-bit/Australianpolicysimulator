import { BEHAVIOURAL_ASSUMPTIONS } from '../assumptions/behaviouralAssumptions';
import { BASELINE_VARIABLES } from '../data/baseline/variables';
import { POLICY_SETTINGS } from '../policies/policySettings';
import type { ProvenanceRow } from '../types';

const formatter = new Intl.NumberFormat('en-AU');

export function buildDataProvenanceRows(): ProvenanceRow[] {
  const baselineRows: ProvenanceRow[] = BASELINE_VARIABLES.map((variable) => ({
    id: variable.id,
    name: variable.name,
    value: `${formatter.format(variable.value)} ${variable.unit}`,
    date: variable.referencePeriod,
    source: `${variable.sourceOrganisation} — ${variable.sourceTitle}`,
    classification: variable.classification,
    confidence: variable.confidenceRating,
    range: `${formatter.format(variable.lowEstimate)}–${formatter.format(variable.highEstimate)} ${variable.unit}`,
    affectedOutputs: variable.affectedModelAreas.join(', '),
  }));

  const policyRows: ProvenanceRow[] = POLICY_SETTINGS.map((setting) => ({
    id: setting.id,
    name: setting.name,
    value: `${formatter.format(setting.value)} ${setting.unit}`,
    date: setting.baselineVersion,
    source: setting.notes,
    classification: setting.classification,
    confidence: setting.confidenceRating,
    range: `${formatter.format(setting.value)} ${setting.unit}`,
    affectedOutputs: setting.affectedModelAreas.join(', '),
  }));

  const assumptionRows: ProvenanceRow[] = BEHAVIOURAL_ASSUMPTIONS.map((assumption) => ({
    id: assumption.id,
    name: assumption.description,
    value: `${formatter.format(assumption.centralValue)} ${assumption.unit}`,
    date: assumption.calibrationStatus,
    source: assumption.supportingEvidence,
    classification: 'behavioural-relationship',
    confidence: assumption.confidence,
    range: `${formatter.format(assumption.plausibleLow)}–${formatter.format(assumption.plausibleHigh)} ${assumption.unit}`,
    affectedOutputs: assumption.affectedRelationships.join(', '),
  }));

  return [...baselineRows, ...policyRows, ...assumptionRows];
}
