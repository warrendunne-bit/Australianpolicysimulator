import { useEffect, useMemo, useState } from 'react';
import { AssumptionsPanel } from './components/AssumptionsPanel';
import { BaselineComparisonPanel } from './components/BaselineComparison';
import { CurrentYearFactorPanel } from './components/CurrentYearFactorPanel';
import { EntityPanels } from './components/EntityPanels';
import { FeedbackPanel } from './components/FeedbackPanel';
import { PlaybackControls } from './components/PlaybackControls';
import { ScenarioSetup } from './components/ScenarioSetup';
import { ScenarioSummary } from './components/ScenarioSummary';
import { SuccessScorePanel } from './components/SuccessScorePanel';
import {
  CollapsibleSection,
  ExplanationList,
  InfoBox,
  MetricStrip,
  Panel,
  PolicyCard,
  PolicySlider,
} from './components/shared';
import { formatMoney, formatNumber, formatPercent } from './components/formatters';
import {
  compareToBaseline,
  buildTransparentCalculationNotes,
  runSimulation,
  type PolicySettings,
  type SimulationHorizon,
  type SimulationResult,
} from './simulation/model';
import { DEFAULT_POLICY_SETTINGS, SCENARIO_PRESETS } from './simulation/presets';
import {
  DEFAULT_SUCCESS_WEIGHTS,
  buildYearlySuccessNarrative,
  calculateSuccessScore,
  type SuccessWeights,
} from './simulation/SuccessScore';

export default function App() {
  const [immigrationRate, setImmigrationRateState] = useState(DEFAULT_POLICY_SETTINGS.immigrationRate);
  const [housingBuildRate, setHousingBuildRateState] = useState(
    DEFAULT_POLICY_SETTINGS.housingBuildRate,
  );
  const [integrationEffectiveness, setIntegrationEffectivenessState] = useState(
    DEFAULT_POLICY_SETTINGS.integrationEffectiveness,
  );
  const [skillsAlignment, setSkillsAlignmentState] = useState(DEFAULT_POLICY_SETTINGS.skillsAlignment);
  const [infrastructureReadiness, setInfrastructureReadinessState] = useState(
    DEFAULT_POLICY_SETTINGS.infrastructureReadiness,
  );
  const [taxRate, setTaxRateState] = useState(DEFAULT_POLICY_SETTINGS.taxRate);
  const [stimulusRate, setStimulusRateState] = useState(DEFAULT_POLICY_SETTINGS.stimulusRate);
  const [selectedPresetId, setSelectedPresetId] = useState('balanced');
  const [horizon, setHorizon] = useState<SimulationHorizon>(5);
  const [selectedEventIds, setSelectedEventIds] = useState<string[]>([]);
  const [simulation, setSimulation] = useState<SimulationResult | null>(null);
  const [selectedYear, setSelectedYear] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [successWeights, setSuccessWeights] = useState<SuccessWeights>(DEFAULT_SUCCESS_WEIGHTS);

  const policies = useMemo<PolicySettings>(
    () => ({
      immigrationRate,
      housingBuildRate,
      integrationEffectiveness,
      skillsAlignment,
      infrastructureReadiness,
      taxRate,
      stimulusRate,
    }),
    [
      housingBuildRate,
      immigrationRate,
      infrastructureReadiness,
      integrationEffectiveness,
      skillsAlignment,
      stimulusRate,
      taxRate,
    ],
  );

  const scenarioPreview = useMemo(
    () => runSimulation(policies, horizon, selectedEventIds),
    [horizon, policies, selectedEventIds],
  );
  const baselineComparison = useMemo(
    () => compareToBaseline(policies, horizon, selectedEventIds),
    [horizon, policies, selectedEventIds],
  );
  const results = simulation ?? scenarioPreview;
  const selectedAnnualOutcome =
    results.history.find((item) => item.year === selectedYear) ?? results.history[0];
  const selectedEntities = selectedAnnualOutcome?.entityDashboard ?? results.entityDashboard;
  const selectedPositiveDrivers = selectedAnnualOutcome?.positiveDrivers ?? results.positiveDrivers;
  const selectedNegativeDrivers = selectedAnnualOutcome?.negativeDrivers ?? results.negativeDrivers;
  const selectedFeedback = selectedAnnualOutcome?.feedback ?? results.feedback;
  const selectedFeedbackExplanations =
    selectedAnnualOutcome?.feedbackExplanations ?? results.feedbackExplanations;
  const selectedNarrative =
    selectedAnnualOutcome?.yearSummary.narrative ??
    selectedAnnualOutcome?.narrativeSummary ??
    'Start the simulation to review the scenario year by year.';

  const outcomes = selectedAnnualOutcome ?? results.outcomes;
  const successScore = useMemo(
    () => calculateSuccessScore(outcomes, successWeights),
    [outcomes, successWeights],
  );
  const previousAnnualOutcome = results.history.find((item) => item.year === selectedYear - 1);
  const previousSuccessScore = previousAnnualOutcome
    ? calculateSuccessScore(previousAnnualOutcome, successWeights)
    : null;
  const successScoreChange = previousSuccessScore
    ? successScore.score - previousSuccessScore.score
    : 0;
  const selectedYearSuccessNarrative = buildYearlySuccessNarrative({
    year: selectedYear,
    currentScore: successScore.score,
    previousScore: previousSuccessScore?.score,
    topContributor: successScore.topContributor,
    weakestFactor: successScore.weakestFactor,
    feedbackExplanations: selectedFeedbackExplanations,
  });
  const metrics = results.metrics;
  const financeBreakdown = outcomes.financeBreakdown;
  const transparentCalculationNotes = buildTransparentCalculationNotes({ outcomes, metrics });
  const capacityEnough =
    outcomes.absorptiveCapacityScore >= 70
      ? 'current absorptive capacity is strong enough to support the setting.'
      : outcomes.absorptiveCapacityScore >= 40
        ? 'absorptive capacity is mixed, so benefits depend on housing and services keeping pace.'
        : 'absorptive capacity is low, so migration benefits are harder to realise.';

  function markManualChange() {
    setSelectedPresetId('custom');
    setSimulation(null);
    setIsPlaying(false);
  }

  function setImmigrationRate(value: number) {
    markManualChange();
    setImmigrationRateState(value);
  }

  function setHousingBuildRate(value: number) {
    markManualChange();
    setHousingBuildRateState(value);
  }

  function setIntegrationEffectiveness(value: number) {
    markManualChange();
    setIntegrationEffectivenessState(value);
  }

  function setSkillsAlignment(value: number) {
    markManualChange();
    setSkillsAlignmentState(value);
  }

  function setInfrastructureReadiness(value: number) {
    markManualChange();
    setInfrastructureReadinessState(value);
  }

  function setTaxRate(value: number) {
    markManualChange();
    setTaxRateState(value);
  }

  function setStimulusRate(value: number) {
    markManualChange();
    setStimulusRateState(value);
  }

  function applyPreset(presetId: string) {
    const preset = SCENARIO_PRESETS.find((item) => item.id === presetId);
    if (!preset) return;

    setSelectedPresetId(preset.id);
    setImmigrationRateState(preset.policies.immigrationRate);
    setHousingBuildRateState(preset.policies.housingBuildRate);
    setIntegrationEffectivenessState(preset.policies.integrationEffectiveness);
    setSkillsAlignmentState(preset.policies.skillsAlignment);
    setInfrastructureReadinessState(preset.policies.infrastructureReadiness);
    setTaxRateState(preset.policies.taxRate);
    setStimulusRateState(preset.policies.stimulusRate);
    setSelectedYear(1);
    setSimulation(null);
    setIsPlaying(false);
  }

  function toggleEvent(eventId: string) {
    setSelectedEventIds((current) =>
      current.includes(eventId) ? current.filter((id) => id !== eventId) : [...current, eventId],
    );
    setSimulation(null);
    setIsPlaying(false);
  }

  function changeHorizon(nextHorizon: SimulationHorizon) {
    setHorizon(nextHorizon);
    setSelectedYear((current) => Math.min(current, nextHorizon));
    setSimulation(null);
    setIsPlaying(false);
  }

  function startSimulation() {
    const nextSimulation = runSimulation(policies, horizon, selectedEventIds);
    setSimulation(nextSimulation);
    setSelectedYear(1);
    setIsPlaying(false);
  }

  function stepYear(delta: number) {
    setIsPlaying(false);
    setSelectedYear((current) => Math.min(results.history.length, Math.max(1, current + delta)));
  }

  useEffect(() => {
    if (!isPlaying) return undefined;

    const timer = window.setInterval(() => {
      setSelectedYear((current) => {
        if (current >= results.history.length) {
          setIsPlaying(false);
          return current;
        }

        return current + 1;
      });
    }, 900);

    return () => window.clearInterval(timer);
  }, [isPlaying, results.history.length]);

  return (
    <main className="app-shell">
      <header className="page-header">
        <p className="eyebrow">Version 0.4</p>
        <h1>Australia Policy Simulator</h1>
        <p>
          A simple prototype for exploring policy trade-offs, representative entities and
          unintended consequences over time.
        </p>
        <span>Illustrative only - not a forecast.</span>
      </header>

      <AssumptionsPanel />

      <ScenarioSetup
        horizon={horizon}
        presets={SCENARIO_PRESETS}
        selectedEventIds={selectedEventIds}
        selectedPresetId={selectedPresetId}
        onEventToggle={toggleEvent}
        onHorizonChange={changeHorizon}
        onPresetSelect={applyPreset}
      />

      <PlaybackControls
        hasStarted={simulation !== null}
        isPlaying={isPlaying}
        maxYear={results.history.length}
        selectedYear={selectedYear}
        onStart={startSimulation}
        onPlayPause={() => setIsPlaying((current) => !current)}
        onStepBack={() => stepYear(-1)}
        onStepForward={() => stepYear(1)}
        onYearChange={(year) => {
          setIsPlaying(false);
          setSelectedYear(year);
        }}
      />

      <SuccessScorePanel
        score={successScore}
        weights={successWeights}
        change={successScoreChange}
        hasStarted={simulation !== null}
        onChange={(key, value) => setSuccessWeights((current) => ({ ...current, [key]: value }))}
      />

      <BaselineComparisonPanel comparison={baselineComparison} />

      <CollapsibleSection title="Policy Settings" defaultOpen>
        <div className="policy-grid">
          <PolicyCard title="Population & Migration">
            <PolicySlider
              label="Immigration Rate"
              value={immigrationRate}
              min={0}
              max={5}
              step={0.1}
              unit="population rate"
              valueFormatter={formatPercent}
              onChange={setImmigrationRate}
            />
            <InfoBox>
              At {formatPercent(immigrationRate)}, immigration adds about{' '}
              {formatNumber(outcomes.populationIncrease)} people each year and creates demand for{' '}
              {formatNumber(outcomes.housingDemand)} homes. It contributes{' '}
              {formatPercent(metrics.immigrationGrowthBoost)} to growth after entity capacity is
              considered, and {capacityEnough}
            </InfoBox>
            <PolicySlider
              label="Integration Effectiveness"
              value={integrationEffectiveness}
              min={0}
              max={100}
              step={1}
              unit="employment, language, community, and civic participation"
              onChange={setIntegrationEffectiveness}
            />
            <PolicySlider
              label="Skills Alignment"
              value={skillsAlignment}
              min={0}
              max={100}
              step={1}
              unit="match to labour shortages"
              onChange={setSkillsAlignment}
            />
            <PolicySlider
              label="Infrastructure Readiness"
              value={infrastructureReadiness}
              min={0}
              max={100}
              step={1}
              unit="schools, hospitals, roads, transport and services"
              onChange={setInfrastructureReadiness}
            />
            <MetricStrip
              items={[
                ['Absorptive Capacity Score', outcomes.absorptiveCapacityScore.toFixed(1)],
                ['Absorptive Capacity Status', outcomes.absorptiveCapacityStatus],
              ]}
            />
          </PolicyCard>

          <PolicyCard title="Housing & Fairness">
            <PolicySlider
              label="Housing Build Rate"
              value={housingBuildRate}
              min={50_000}
              max={350_000}
              step={5_000}
              unit="homes per year"
              onChange={setHousingBuildRate}
            />
            <InfoBox>
              Housing supply is compared with demand of {formatNumber(outcomes.housingDemand)}{' '}
              homes. Representative renters and young workers are most sensitive to the resulting
              stress.
            </InfoBox>
            <MetricStrip
              items={[
                ['Housing Stress', outcomes.housingStress.toFixed(1)],
                ['Fairness Score', outcomes.fairness.toFixed(1)],
              ]}
            />
            <InfoBox>{outcomes.fairnessExplanation}</InfoBox>
          </PolicyCard>

          <PolicyCard title="Government & Taxation">
            <PolicySlider
              label="Tax Rate"
              value={taxRate}
              min={0}
              max={50}
              step={1}
              unit="of income"
              valueFormatter={formatPercent}
              onChange={setTaxRate}
            />
            <PolicySlider
              label="Government Stimulus"
              value={stimulusRate}
              min={0}
              max={10}
              step={0.5}
              unit="extra spending"
              valueFormatter={formatPercent}
              onChange={setStimulusRate}
            />
            <InfoBox>
              Tax adds about {formatMoney(financeBreakdown.taxRevenueBoost)} to revenue. Stimulus
              adds {formatMoney(financeBreakdown.stimulusSpendingBoost)} to spending.
            </InfoBox>
          </PolicyCard>
        </div>
      </CollapsibleSection>

      <CurrentYearFactorPanel
        outcomes={outcomes}
        previousOutcomes={previousAnnualOutcome}
        selectedYear={selectedYear}
        successScore={successScore}
        previousSuccessScore={previousSuccessScore}
      />

      <section className="section-block">
        <h2>Annual Narrative Explanation</h2>
        <article className="year-narrative standalone-narrative">
          <strong>Year {selectedYear}</strong>
          <p>{selectedYearSuccessNarrative}</p>
          <p>{selectedNarrative}</p>
        </article>
      </section>

      <EntityPanels entities={selectedEntities} eventResponses={results.eventResponses} />

      <CollapsibleSection title="Active Feedback Loops">
        <FeedbackPanel
          feedback={selectedFeedback}
          explanations={selectedFeedbackExplanations}
          history={results.history}
        />
      </CollapsibleSection>

      <CollapsibleSection title="Key Drivers">
        <div className="explanation-grid">
          <ExplanationList
            title={`Year ${selectedYear} positive drivers`}
            items={selectedPositiveDrivers}
          />
          <ExplanationList
            title={`Year ${selectedYear} negative drivers`}
            items={selectedNegativeDrivers}
          />
          <ExplanationList title="Key trade-offs" items={results.tradeOffs} />
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Transparent Calculations">
        <div className="details-grid">
          <Panel title="Transparent Calculations">
            <ul>
              {transparentCalculationNotes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </Panel>

          <Panel title="Government Finance Breakdown">
            <ul>
              <li>Base revenue: {formatMoney(financeBreakdown.baseRevenue)}.</li>
              <li>Tax revenue boost: {formatMoney(financeBreakdown.taxRevenueBoost)}.</li>
              <li>Growth revenue boost: {formatMoney(financeBreakdown.growthRevenueBoost)}.</li>
              <li>
                Integration and skills revenue:{' '}
                {formatMoney(financeBreakdown.integrationSkillsRevenueBoost)}.
              </li>
              <li>Base spending: {formatMoney(financeBreakdown.baseSpending)}.</li>
              <li>Stimulus spending: {formatMoney(financeBreakdown.stimulusSpendingBoost)}.</li>
              <li>
                Infrastructure pressure: {formatMoney(financeBreakdown.infrastructureSpendingPressure)}.
              </li>
              <li>Event spending: {formatMoney(financeBreakdown.eventSpending)}.</li>
              <li>
                Revenue {formatMoney(results.world.government.revenue)} - spending{' '}
                {formatMoney(results.world.government.spending)} = budget balance{' '}
                {formatMoney(outcomes.governmentBalance)}.
              </li>
            </ul>
          </Panel>

          <Panel title="Entity Model">
            <ul>
              <li>
                Person entities sit inside representative Household entities and carry income,
                skills, wellbeing and social connection state.
              </li>
              <li>
                Household entities update consumption, housing security, cohesion, fairness pressure
                and wellbeing.
              </li>
              <li>
                Company entities update productivity, hiring demand, profitability and investment.
              </li>
              <li>
                Government and Environment entities update after households and companies respond.
              </li>
              <li>The World object applies policies, events and annual updates, then records history.</li>
            </ul>
          </Panel>
        </div>
      </CollapsibleSection>

      <ScenarioSummary
        horizon={horizon}
        outcomes={outcomes}
        policies={policies}
        selectedEventIds={selectedEventIds}
      />
    </main>
  );
}
