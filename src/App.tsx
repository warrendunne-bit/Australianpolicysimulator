import { useEffect, useMemo, useState } from 'react';
import { CurrentYearFactorPanel } from './components/CurrentYearFactorPanel';
import { EntityPanels } from './components/EntityPanels';
import { FeedbackPanel } from './components/FeedbackPanel';
import { PlaybackControls } from './components/PlaybackControls';
import { ScenarioSetup } from './components/ScenarioSetup';
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
  runSimulation,
  type SimulationHorizon,
  type SimulationResult,
} from './simulation/model';
import {
  DEFAULT_SUCCESS_WEIGHTS,
  buildYearlySuccessNarrative,
  calculateSuccessScore,
  type SuccessWeights,
} from './simulation/SuccessScore';

const BASE_POPULATION = 27_000_000;
const DEFAULT_IMMIGRATION_RATE = 2;
const DEFAULT_HOUSING_BUILD_RATE = 175_000;
const DEFAULT_INTEGRATION_EFFECTIVENESS = 65;
const DEFAULT_SKILLS_ALIGNMENT = 70;
const DEFAULT_INFRASTRUCTURE_READINESS = 60;
const DEFAULT_TAX_RATE = 25;
const DEFAULT_STIMULUS_RATE = 2;
const PEOPLE_PER_IMMIGRATION_PERCENT = 100_000;

export default function App() {
  const [immigrationRate, setImmigrationRate] = useState(DEFAULT_IMMIGRATION_RATE);
  const [housingBuildRate, setHousingBuildRate] = useState(DEFAULT_HOUSING_BUILD_RATE);
  const [integrationEffectiveness, setIntegrationEffectiveness] = useState(
    DEFAULT_INTEGRATION_EFFECTIVENESS,
  );
  const [skillsAlignment, setSkillsAlignment] = useState(DEFAULT_SKILLS_ALIGNMENT);
  const [infrastructureReadiness, setInfrastructureReadiness] = useState(
    DEFAULT_INFRASTRUCTURE_READINESS,
  );
  const [taxRate, setTaxRate] = useState(DEFAULT_TAX_RATE);
  const [stimulusRate, setStimulusRate] = useState(DEFAULT_STIMULUS_RATE);
  const [horizon, setHorizon] = useState<SimulationHorizon>(5);
  const [selectedEventIds, setSelectedEventIds] = useState<string[]>([]);
  const [simulation, setSimulation] = useState<SimulationResult | null>(null);
  const [selectedYear, setSelectedYear] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [successWeights, setSuccessWeights] = useState<SuccessWeights>(DEFAULT_SUCCESS_WEIGHTS);

  const policies = useMemo(
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
  const capacityEnough =
    outcomes.absorptiveCapacityScore >= 70
      ? 'current absorptive capacity is strong enough to support the setting.'
      : outcomes.absorptiveCapacityScore >= 40
        ? 'absorptive capacity is mixed, so benefits depend on housing and services keeping pace.'
        : 'absorptive capacity is low, so migration benefits are harder to realise.';

  function toggleEvent(eventId: string) {
    setSelectedEventIds((current) =>
      current.includes(eventId) ? current.filter((id) => id !== eventId) : [...current, eventId],
    );
    setIsPlaying(false);
  }

  function changeHorizon(nextHorizon: SimulationHorizon) {
    setHorizon(nextHorizon);
    setSelectedYear((current) => Math.min(current, nextHorizon));
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
        <p className="eyebrow">Version 0.3</p>
        <h1>Australia Policy Simulator</h1>
        <p>
          A simple prototype for exploring policy trade-offs, representative entities and
          unintended consequences over time.
        </p>
        <span>Illustrative only - not a forecast.</span>
      </header>

      <ScenarioSetup
        horizon={horizon}
        selectedEventIds={selectedEventIds}
        onEventToggle={toggleEvent}
        onHorizonChange={changeHorizon}
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

          <PolicyCard title="Housing">
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
              Tax adds about {formatMoney(metrics.taxRevenueBoost)} to revenue. Stimulus adds{' '}
              {formatMoney(metrics.stimulusSpendingBoost)} to spending.
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
              <li>
                Population begins at {formatNumber(BASE_POPULATION)} and adds{' '}
                {formatNumber(PEOPLE_PER_IMMIGRATION_PERCENT)} people per immigration percentage
                point in each annual step.
              </li>
              <li>
                Absorptive capacity averages housing capacity, integration, skills and
                infrastructure = {outcomes.absorptiveCapacityScore.toFixed(1)}.
              </li>
              <li>
                Economic growth combines company productivity, migration boost{' '}
                {formatPercent(metrics.immigrationGrowthBoost)}, stimulus{' '}
                {formatPercent(metrics.stimulusGrowthBoost)}, tax drag{' '}
                {formatPercent(metrics.taxGrowthDrag)}, housing drag{' '}
                {formatPercent(metrics.housingGrowthDrag)} and active event effects.
              </li>
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
                Household entities update consumption, housing security, cohesion and wellbeing.
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
    </main>
  );
}
