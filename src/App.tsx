import { useEffect, useMemo, useState } from 'react';
import {
  BudgetPage,
  DashboardPage,
  EventsPage,
  MapPage,
  PoliciesPage,
  ReportsPage,
  SettingsPage,
} from './components/CockpitPages';
import { GameHeader } from './components/GameHeader';
import { ImmigrationScenarioLab } from './components/immigration/ImmigrationScenarioLab';
import { BaselineHomePage } from './components/pages/BaselineHomePage';
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

const COMMAND_SECTIONS = [
  'Australia today',
  'Current path',
  'Problems to solve',
  'Policies',
  'My scenarios',
  'How the model works',
  'Dashboard',
  'Immigration',
  'Budget',
  'Reports',
  'Map',
  'Events',
  'Settings',
];

const SECTION_ALIASES: Record<string, string> = {
  dashboard: 'Australia today',
  immigration: 'Policies',
  policies: 'Policies',
  budget: 'How the model works',
  reports: 'My scenarios',
  map: 'Current path',
  events: 'How the model works',
  settings: 'How the model works',
  'australia-today': 'Australia today',
  'current-path': 'Current path',
  'problems-to-solve': 'Problems to solve',
  'my-scenarios': 'My scenarios',
  'how-the-model-works': 'How the model works',
};

function normaliseSection(section: string) {
  const cleaned = section.trim().toLowerCase().replace(/\s+/g, '-');
  const aliased = SECTION_ALIASES[cleaned];
  if (aliased) return aliased;
  return COMMAND_SECTIONS.find((item) => item.toLowerCase() === section.toLowerCase()) ?? 'Australia today';
}

function sectionFromHash() {
  if (typeof window === 'undefined') return 'Australia today';
  return normaliseSection(window.location.hash.replace(/^#/, '') || 'Australia today');
}

function sectionHash(section: string) {
  const hashes: Record<string, string> = {
    'Australia today': '#dashboard',
    'Current path': '#current-path',
    'Problems to solve': '#problems-to-solve',
    Policies: '#immigration',
    'My scenarios': '#reports',
    'How the model works': '#settings',
  };
  return hashes[section] ?? `#${section.toLowerCase().replace(/\s+/g, '-')}`;
}

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
  const [enactedPolicies, setEnactedPolicies] = useState<PolicySettings>(DEFAULT_POLICY_SETTINGS);
  const [enactedEventIds, setEnactedEventIds] = useState<string[]>([]);
  const [simulation, setSimulation] = useState<SimulationResult>(() =>
    runSimulation(DEFAULT_POLICY_SETTINGS, 5, []),
  );
  const [selectedYear, setSelectedYear] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTurnReveal, setShowTurnReveal] = useState(false);
  const [activeSection, setActiveSection] = useState(sectionFromHash);
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

  const baselineComparison = useMemo(
    () => compareToBaseline(enactedPolicies, simulation.history.length as SimulationHorizon, enactedEventIds),
    [enactedEventIds, enactedPolicies, simulation.history.length],
  );
  const results = simulation;
  const hasPendingDecisionChanges =
    horizon !== results.history.length ||
    selectedEventIds.join('|') !== enactedEventIds.join('|') ||
    Object.entries(policies).some(
      ([key, value]) => enactedPolicies[key as keyof PolicySettings] !== value,
    );
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
    setShowTurnReveal(false);
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
    setIsPlaying(false);
  }

  function toggleEvent(eventId: string) {
    setSelectedEventIds((current) =>
      current.includes(eventId) ? current.filter((id) => id !== eventId) : [...current, eventId],
    );
    setIsPlaying(false);
  }

  function changeHorizon(nextHorizon: SimulationHorizon) {
    setHorizon(nextHorizon);
    setSelectedYear((current) => Math.min(current, results.history.length));
    setIsPlaying(false);
  }

  function startSimulation() {
    const nextSimulation = runSimulation(policies, horizon, selectedEventIds);
    setSimulation(nextSimulation);
    setEnactedPolicies(policies);
    setEnactedEventIds(selectedEventIds);
    setSelectedYear(1);
    setShowTurnReveal(true);
    setIsPlaying(false);
  }

  function stepYear(delta: number) {
    setIsPlaying(false);
    setSelectedYear((current) => Math.min(results.history.length, Math.max(1, current + delta)));
  }

  function changeActiveSection(section: string) {
    const nextSection = normaliseSection(section);
    setActiveSection(nextSection);
    if (typeof window !== 'undefined' && window.location.hash !== sectionHash(nextSection)) {
      window.location.hash = sectionHash(nextSection);
    }
  }

  useEffect(() => {
    function syncSectionFromHash() {
      setActiveSection(sectionFromHash());
    }

    syncSectionFromHash();
    window.addEventListener('hashchange', syncSectionFromHash);
    return () => window.removeEventListener('hashchange', syncSectionFromHash);
  }, []);

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
      <GameHeader
        activeSection={activeSection}
        hasPendingChanges={hasPendingDecisionChanges}
        maxYear={results.history.length}
        selectedYear={selectedYear}
        onEndYear={startSimulation}
        onSectionChange={changeActiveSection}
      />

      {activeSection === 'Australia today' ? (
        <BaselineHomePage mode="today" onSectionChange={changeActiveSection} />
      ) : null}

      {activeSection === 'Current path' ? (
        <BaselineHomePage mode="currentPath" onSectionChange={changeActiveSection} />
      ) : null}

      {activeSection === 'Problems to solve' ? (
        <BaselineHomePage mode="problems" onSectionChange={changeActiveSection} />
      ) : null}

      {activeSection === 'Dashboard' ? (
        <DashboardPage
          hasPendingDecisionChanges={hasPendingDecisionChanges}
          housingBuildRate={housingBuildRate}
          immigrationRate={immigrationRate}
          infrastructureReadiness={infrastructureReadiness}
          integrationEffectiveness={integrationEffectiveness}
          outcomes={outcomes}
          selectedNarrative={selectedNarrative}
          selectedYearSuccessNarrative={selectedYearSuccessNarrative}
          showTurnReveal={showTurnReveal}
          skillsAlignment={skillsAlignment}
          stimulusRate={stimulusRate}
          successScore={successScore}
          successScoreChange={successScoreChange}
          taxRate={taxRate}
          onEndYear={startSimulation}
          onSectionChange={changeActiveSection}
        />
      ) : null}

      {activeSection === 'Legacy policy sandbox' ? (
        <PoliciesPage
          capacityEnough={capacityEnough}
          financeBreakdown={financeBreakdown}
          housingBuildRate={housingBuildRate}
          immigrationRate={immigrationRate}
          infrastructureReadiness={infrastructureReadiness}
          integrationEffectiveness={integrationEffectiveness}
          metrics={metrics}
          outcomes={outcomes}
          skillsAlignment={skillsAlignment}
          stimulusRate={stimulusRate}
          taxRate={taxRate}
          onHousingBuildChange={setHousingBuildRate}
          onImmigrationChange={setImmigrationRate}
          onInfrastructureChange={setInfrastructureReadiness}
          onIntegrationChange={setIntegrationEffectiveness}
          onSkillsChange={setSkillsAlignment}
          onStimulusChange={setStimulusRate}
          onTaxChange={setTaxRate}
        />
      ) : null}

      {activeSection === 'Policies' || activeSection === 'Immigration' ? <ImmigrationScenarioLab /> : null}

      {activeSection === 'Budget' ? (
        <BudgetPage
          financeBreakdown={financeBreakdown}
          outcomes={outcomes}
          results={results}
          stimulusRate={stimulusRate}
          taxRate={taxRate}
          onStimulusChange={setStimulusRate}
          onTaxChange={setTaxRate}
        />
      ) : null}

      {activeSection === 'My scenarios' || activeSection === 'Reports' ? (
        <ReportsPage
          baselineComparison={baselineComparison}
          eventResponses={results.eventResponses}
          hasPendingDecisionChanges={hasPendingDecisionChanges}
          history={results.history}
          isPlaying={isPlaying}
          maxYear={results.history.length}
          outcomes={outcomes}
          previousAnnualOutcome={previousAnnualOutcome}
          previousSuccessScore={previousSuccessScore}
          selectedEntities={selectedEntities}
          selectedFeedback={selectedFeedback}
          selectedFeedbackExplanations={selectedFeedbackExplanations}
          selectedNarrative={selectedNarrative}
          selectedNegativeDrivers={selectedNegativeDrivers}
          selectedPositiveDrivers={selectedPositiveDrivers}
          selectedYear={selectedYear}
          selectedYearSuccessNarrative={selectedYearSuccessNarrative}
          successScore={successScore}
          successScoreChange={successScoreChange}
          successWeights={successWeights}
          tradeOffs={results.tradeOffs}
          onPlayPause={() => setIsPlaying((current) => !current)}
          onStart={startSimulation}
          onStepBack={() => stepYear(-1)}
          onStepForward={() => stepYear(1)}
          onSuccessWeightChange={(key, value) =>
            setSuccessWeights((current) => ({ ...current, [key]: value }))
          }
          onYearChange={(year) => {
            setIsPlaying(false);
            setSelectedYear(year);
          }}
        />
      ) : null}

      {activeSection === 'Map' ? (
        <MapPage
          hasPendingChanges={hasPendingDecisionChanges}
          horizon={horizon}
          outcomes={outcomes}
          policies={policies}
          selectedYear={selectedYear}
          showTurnReveal={showTurnReveal}
          onDismissTurnReveal={() => setShowTurnReveal(false)}
          onEndYear={startSimulation}
          onHousingInvestmentChange={setHousingBuildRate}
          onImmigrationChange={setImmigrationRate}
          onInfrastructureInvestmentChange={setInfrastructureReadiness}
        />
      ) : null}

      {activeSection === 'Events' ? (
        <EventsPage selectedEventIds={selectedEventIds} onEventToggle={toggleEvent} />
      ) : null}

      {activeSection === 'How the model works' || activeSection === 'Settings' ? (
        <SettingsPage
          financeBreakdown={financeBreakdown}
          horizon={horizon}
          outcomes={outcomes}
          policies={policies}
          presets={SCENARIO_PRESETS}
          results={results}
          selectedEventIds={selectedEventIds}
          selectedPresetId={selectedPresetId}
          transparentCalculationNotes={transparentCalculationNotes}
          onEventToggle={toggleEvent}
          onHorizonChange={changeHorizon}
          onPresetSelect={applyPreset}
        />
      ) : null}
    </main>
  );
}
