import type { ConfidenceRating } from '../types';
import { ACTIVE_BASELINE_VERSION_ID } from '../data/baseline/baselineVersions';

export type CommentaryTraceInput = {
  outcome: string;
  value: number;
  drivers: string[];
  confidence: ConfidenceRating;
};

export type CommentaryTrace = {
  baselineVersionId: string;
  calculatedOutcome: string;
  evidenceChain: string[];
  commentary: string;
  confidence: ConfidenceRating;
};

export function buildCommentaryTrace(input: CommentaryTraceInput): CommentaryTrace {
  const drivers = input.drivers.join(', ');
  return {
    baselineVersionId: ACTIVE_BASELINE_VERSION_ID,
    calculatedOutcome: input.outcome,
    confidence: input.confidence,
    evidenceChain: [
      'source data and reviewed baseline variables',
      `model drivers: ${drivers}`,
      `calculated outcome: ${input.outcome} = ${input.value}`,
      'commentary rule: describe measured direction, uncertainty and supporting-policy relevance',
    ],
    commentary: `This modelled scenario reports ${input.outcome} at ${input.value}. The result is driven by ${drivers}. Confidence is ${input.confidence}, so it is a scenario interpretation rather than a prediction or policy recommendation.`,
  };
}
