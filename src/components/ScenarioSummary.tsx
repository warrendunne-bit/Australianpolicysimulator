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

  async function copySummary() {
    await navigator.clipboard.writeText(summary);
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
        Copy summary
      </button>
    </section>
  );
}
