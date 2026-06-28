import type { OutcomeScores, PolicySettings, SimulationHorizon } from '../simulation/model';
import { formatMoney, formatNumber, formatPercent } from './formatters';

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

function buildScenarioSummary(
  policies: PolicySettings,
  horizon: SimulationHorizon,
  selectedEventIds: string[],
  outcomes: OutcomeScores,
) {
  const eventText = selectedEventIds.length ? selectedEventIds.join(', ') : 'none';

  return [
    `Australia Social Simulator scenario (${horizon} year${horizon === 1 ? '' : 's'})`,
    `Settings: immigration ${formatPercent(policies.immigrationRate)}, housing ${formatNumber(policies.housingBuildRate)} homes/year, integration ${policies.integrationEffectiveness}, skills ${policies.skillsAlignment}, infrastructure ${policies.infrastructureReadiness}, tax ${formatPercent(policies.taxRate)}, stimulus ${formatPercent(policies.stimulusRate)}.`,
    `Events selected: ${eventText}.`,
    `Headline illustrative outcomes: growth ${formatPercent(outcomes.economicGrowth)}, wellbeing ${outcomes.wellbeing.toFixed(1)}, fairness ${outcomes.fairness.toFixed(1)}, social cohesion ${outcomes.socialCohesion.toFixed(1)}, budget balance ${formatMoney(outcomes.governmentBalance)}, environmental pressure ${outcomes.environmentalPressure.toFixed(1)}.`,
    'Disclaimer: this is an illustrative simplified simulator, not an official forecast, cost estimate or policy recommendation.',
  ].join('\n');
}
