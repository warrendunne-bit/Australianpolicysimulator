import { proposalEvidencePrefix, proposalPath, proposalsSection } from './programmes/routes';

export function isIssueStudy(fragment: string) {
  return fragment === proposalsSection
    || fragment === 'housing-pilot'
    || fragment === 'trade-exposure'
    || fragment === 'country-vision'
    || fragment === 'evidence-library'
    || fragment === 'housing-evidence-register'
    || fragment.startsWith(proposalPath)
    || fragment.startsWith(proposalEvidencePrefix);
}
