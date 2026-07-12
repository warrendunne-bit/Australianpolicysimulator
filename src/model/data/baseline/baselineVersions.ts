import type { BaselineVersion } from '../../types';

export const ACTIVE_BASELINE_VERSION_ID = 'australian-baseline-v1.0';

export const BASELINE_VERSIONS: BaselineVersion[] = [
  {
    id: ACTIVE_BASELINE_VERSION_ID,
    reviewDate: '2026-07-12',
    referenceYear: 2026,
    status: 'calibrated',
    summaryOfChanges:
      'Phase 1C replaced the highest-materiality migrated placeholders with reviewed authoritative Australian baseline evidence where available, while keeping unsupported relationships flagged for expert review.',
    knownGaps: [
      'This is an evidence-based scenario baseline, not a forecast or official model.',
      'GDP per person, wages, rents, vacancy rates, detailed visa-category fiscal effects and social cohesion causal estimates remain incomplete.',
      'Some behavioural coefficients remain exploratory and require expert review before stronger policy claims.',
    ],
    approvedState: 'approved',
  },
];

export function getActiveBaselineVersion() {
  const version = BASELINE_VERSIONS.find((item) => item.id === ACTIVE_BASELINE_VERSION_ID);
  if (!version) throw new Error(`Active baseline version ${ACTIVE_BASELINE_VERSION_ID} is not configured.`);
  return version;
}
