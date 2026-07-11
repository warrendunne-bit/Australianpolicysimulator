import { useState } from 'react';
import {
  buildScenarioSummary,
  type OutcomeScores,
  type PolicySettings,
  type SimulationHorizon,
} from '../simulation/model';

export function ScenarioSummary({
  policies,
  horizon,
  selectedEventIds,
  outcomes,
}: {
  policies: PolicySettings;
  horizon: SimulationHorizon;
  selectedEventIds: string[];
  outcomes: OutcomeScores;
}) {
  const summary = buildScenarioSummary(policies, horizon, selectedEventIds, outcomes);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'failed'>('idle');

  async function copySummary() {
    try {
      await navigator.clipboard.writeText(summary);
      setCopyStatus('copied');
    } catch {
      setCopyStatus('failed');
    }
  }

  return (
    <section className="section-block scenario-summary-panel">
      <div>
        <h2>Copyable Scenario Summary</h2>
        <p>
          Use this plain-English summary for discussion. It includes the disclaimer so shared results
          are not mistaken for a forecast.
        </p>
      </div>
      <textarea readOnly value={summary} />
      <button type="button" onClick={() => void copySummary()}>
        {copyStatus === 'copied' ? 'Copied summary' : 'Copy summary'}
      </button>
      {copyStatus === 'failed' ? (
        <p className="copy-status" role="status">
          Copy did not work in this browser. You can still select the text manually.
        </p>
      ) : null}
    </section>
  );
}
