import type { AnnualOutcome, FeedbackState } from '../simulation/model';
import { Meter } from './shared';

type FeedbackPanelProps = {
  feedback: FeedbackState;
  explanations: string[];
  history: AnnualOutcome[];
};

export function FeedbackPanel({ feedback, explanations, history }: FeedbackPanelProps) {
  const feedbackItems: { label: string; value: number; explanation: string }[] = [
    {
      label: 'Public Pressure',
      value: feedback.publicPressure,
      explanation:
        'Rises when wellbeing falls, housing stress increases or deficits create service pressure.',
    },
    {
      label: 'Trust In Government',
      value: feedback.trustInGovernment,
      explanation: 'Reflects cohesion, fiscal capacity and whether public pressure feels manageable.',
    },
    {
      label: 'Business Confidence',
      value: feedback.businessConfidence,
      explanation: 'Affects future investment, hiring, household income and spending.',
    },
    {
      label: 'Household Stress',
      value: feedback.householdStress,
      explanation: 'Combines housing stress, wellbeing and weak growth pressure.',
    },
    {
      label: 'Fiscal Capacity',
      value: feedback.fiscalCapacity,
      explanation: 'Falls when deficits and stimulus reduce room for future spending.',
    },
    {
      label: 'Infrastructure Pressure',
      value: feedback.infrastructurePressure,
      explanation: 'Rises when population growth and housing stress outpace capacity.',
    },
    {
      label: 'Policy Effectiveness',
      value: feedback.policyEffectiveness,
      explanation: 'Falls when cohesion and trust are low, weakening future policy delivery.',
    },
  ];

  return (
    <div className="feedback-panel">
      <p className="section-intro">
        Feedback loops carry pressure from one year into the next, so a weak year can make later
        policy delivery harder even if the slider settings stay the same.
      </p>
      <div className="feedback-grid">
        {feedbackItems.map((item) => (
          <article className="feedback-card" key={item.label}>
            <div>
              <span>{item.label}</span>
              <strong>{item.value.toFixed(1)}</strong>
            </div>
            <Meter value={item.value} />
            <p>{item.explanation}</p>
          </article>
        ))}
      </div>
      <div className="feedback-explanations">
        <h3>Latest feedback effects</h3>
        <ul>
          {explanations.map((explanation) => (
            <li key={explanation}>{explanation}</li>
          ))}
        </ul>
      </div>
      <div className="feedback-timeline">
        <h3>Annual loop trace</h3>
        {history.map((item) => (
          <details key={item.year}>
            <summary>
              Year {item.year}: public pressure {item.feedback.publicPressure.toFixed(1)}, fiscal
              capacity {item.feedback.fiscalCapacity.toFixed(1)}, policy effectiveness{' '}
              {item.feedback.policyEffectiveness.toFixed(1)}
            </summary>
            <ul>
              {item.feedbackExplanations.map((explanation) => (
                <li key={`${item.year}-${explanation}`}>{explanation}</li>
              ))}
            </ul>
          </details>
        ))}
      </div>
    </div>
  );
}
