import type { ReactNode } from 'react';
import { issueBriefs } from './issueBriefs';
import { proposalEvidencePrefix } from './programmes/routes';

export function IssueBrief({ id, simulationId, simulationLabel = 'Try the comparison', interventionHeading = 'How the intervention works', children }: {
  id: string;
  simulationId: string;
  simulationLabel?: string;
  interventionHeading?: string;
  children?: ReactNode;
}) {
  const brief = issueBriefs[id];

  return (
    <header className="panel issue-brief">
      <a className="issue-brief-return" href="#problems-to-solve">All ten issues</a>
      <h2 id="issue-brief-title" tabIndex={-1}>{brief.title}</h2>
      <p className="issue-question">{brief.question}</p>
      <div className="issue-brief-grid">
        <div>
          <h3>Why it matters</h3>
          <p>{brief.whyItMatters}</p>
          {brief.indicators.map(({ observation, source, url }) => (
            <p className="issue-indicator" key={url}>{observation} <a href={url}>{source}</a></p>
          ))}
        </div>
        <div>
          <h3>{interventionHeading}</h3>
          {typeof brief.intervention === 'string' ? <p>{brief.intervention}</p> : (
            <ul className="issue-interventions">
              {brief.intervention.map((option) => <li key={option}>{option}</li>)}
            </ul>
          )}
          <h3>What progress would look like</h3>
          <p>{brief.progress}</p>
        </div>
      </div>
      <div className="issue-brief-actions">
        <a className="primary-button" href={`#${simulationId}`}>{simulationLabel}</a>
        {children}
        <a href={`#${proposalEvidencePrefix}${id}`}>Research and evidence limits</a>
      </div>
    </header>
  );
}
