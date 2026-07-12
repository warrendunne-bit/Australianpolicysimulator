import { useEffect, useMemo, useState } from 'react';
import {
  IMMIGRATION_ASSUMPTION_DEFINITIONS,
  IMMIGRATION_CAUSE_EFFECT_MAP,
  IMMIGRATION_ENTITIES,
  IMMIGRATION_START_YEAR,
  formatAssumptionValue,
  getImmigrationScenario,
  runImmigrationScenario,
  type ImmigrationAssumptionKey,
  type ImmigrationAssumptions,
  type ImmigrationScenarioId,
  type ImmigrationSimulationYear,
} from '../../topics/immigration';

const OBJECTIVES = [
  'Reduce housing pressure',
  'Increase access to skilled workers',
  'Improve GDP per person',
  'Support an ageing population',
  'Improve social cohesion',
  'Reduce environmental pressure',
  'Understand immigration more generally',
];

const MAJOR_ASSUMPTIONS: ImmigrationAssumptionKey[] = [
  'netOverseasMigration',
  'migrantWorkingAgeShare',
  'housingBuildRate',
  'infrastructureCostPerAdditionalPerson',
  'socialCohesionSensitivity',
];

const CHART_OPTIONS = [
  { key: 'population', label: 'Population', format: formatNumber },
  { key: 'housingStressIndex', label: 'Housing demand and supply', format: formatIndex },
  { key: 'labourSupplyIndex', label: 'Workforce and skills', format: formatIndex },
  { key: 'stateBudgetPressure', label: 'Health and education capacity', format: formatIndex },
  { key: 'environmentalPressure', label: 'Environment and resources', format: formatIndex },
] as const;

type ChartKey = (typeof CHART_OPTIONS)[number]['key'];

const DEFAULT_SCORE_WEIGHTS = {
  livingStandards: 18,
  housing: 18,
  governmentFinances: 14,
  wellbeing: 14,
  socialCohesion: 14,
  environment: 12,
  fairness: 10,
};

type ScoreWeightKey = keyof typeof DEFAULT_SCORE_WEIGHTS;

const SCORE_WEIGHT_LABELS: Record<ScoreWeightKey, string> = {
  livingStandards: 'Living standards',
  housing: 'Housing',
  governmentFinances: 'Government finances',
  wellbeing: 'Wellbeing',
  socialCohesion: 'Social cohesion',
  environment: 'Environment',
  fairness: 'Fairness',
};

type SupportingPolicy = {
  id: string;
  label: string;
  description: string;
  overrides: Partial<ImmigrationAssumptions>;
};

const SUPPORTING_POLICIES: SupportingPolicy[] = [
  {
    id: 'housing-boost',
    label: 'Increase housing construction',
    description: 'Lift annual dwelling delivery so population growth is less likely to become rental pressure.',
    overrides: { housingBuildRate: 240_000, constructionLabourConstraint: 28 },
  },
  {
    id: 'infrastructure-boost',
    label: 'Infrastructure investment',
    description: 'Reduce bottlenecks in transport, utilities, schools and hospitals as population changes.',
    overrides: { infrastructureCostPerAdditionalPerson: 10_000 },
  },
  {
    id: 'training-boost',
    label: 'Education and vocational training',
    description: 'Improve skill matching and workforce participation rather than relying only on arrivals.',
    overrides: { workforceParticipation: 70, productivityGrowth: 1.45 },
  },
  {
    id: 'integration-boost',
    label: 'Settlement and integration support',
    description: 'Lower social-cohesion risk and help migrants connect to housing, jobs and services sooner.',
    overrides: { socialCohesionSensitivity: 32 },
  },
  {
    id: 'regional-boost',
    label: 'Regional development',
    description: 'Pair settlement with regional jobs and services so pressure is not simply moved elsewhere.',
    overrides: { regionalSettlementShare: 32, infrastructureCostPerAdditionalPerson: 11_500 },
  },
  {
    id: 'services-boost',
    label: 'Health and education service expansion',
    description: 'Increase service capacity for hospitals, aged care, schools and tertiary education.',
    overrides: { healthAgedCareWorkerDemand: 1.4, governmentSpendingPerPerson: 25_000 },
  },
];

type PolicyApproach = {
  id: ImmigrationScenarioId | 'capacity-linked' | 'integration-support' | 'custom';
  scenarioId: ImmigrationScenarioId;
  title: string;
  summary: string;
  intendedToImprove: string;
  benefits: string[];
  risks: string[];
  beneficiaries: string[];
  pressureGroups: string[];
  overrides?: Partial<ImmigrationAssumptions>;
};

const POLICY_APPROACHES: PolicyApproach[] = [
  {
    id: 'current-path',
    scenarioId: 'current-path',
    title: 'Continue current settings',
    summary: 'Keep moderate net overseas migration and current-style settlement patterns.',
    intendedToImprove: 'Understand what the baseline already implies before changing policy.',
    benefits: ['Provides the control scenario', 'Maintains labour supply and aggregate demand'],
    risks: ['Housing and services must keep pace', 'Pressure accumulates if capacity lags'],
    beneficiaries: ['Employers', 'Universities', 'Some renters if supply catches up'],
    pressureGroups: ['State governments', 'Capital cities', 'Homeowners facing congestion and service pressure'],
  },
  {
    id: 'low-immigration',
    scenarioId: 'low-immigration',
    title: 'Reduce overall migration',
    summary: 'Lower net inflows while keeping some channels open.',
    intendedToImprove: 'Reduce immediate housing and service pressure.',
    benefits: ['Lower short-run rental pressure', 'Slower infrastructure demand'],
    risks: ['Less labour-market expansion', 'Ageing and tax-base trade-offs remain'],
    beneficiaries: ['Young renters', 'First-home buyers'],
    pressureGroups: ['Employers', 'Future generations if workforce growth weakens'],
  },
  {
    id: 'zero-net-overseas-migration',
    scenarioId: 'zero-net-overseas-migration',
    title: 'No net migration',
    summary: 'Balance arrivals and departures so overseas migration adds no net population growth.',
    intendedToImprove: 'Separate migration effects from natural increase and ageing.',
    benefits: ['Tests population-pressure claims', 'Can reduce some housing demand'],
    risks: ['Lower worker growth', 'May not solve supply bottlenecks by itself'],
    beneficiaries: ['Renters under pressure', 'Local services in high-demand areas'],
    pressureGroups: ['Employers', 'Universities', 'Budget systems exposed to ageing'],
  },
  {
    id: 'skilled-migration-focus',
    scenarioId: 'skilled-migration-focus',
    title: 'Increase skilled migration',
    summary: 'Prioritise working-age skilled arrivals and critical-sector labour supply.',
    intendedToImprove: 'Lift workforce capacity, productivity and tax contribution.',
    benefits: ['More skilled workers', 'Higher business capacity', 'Improved tax capacity'],
    risks: ['Still adds housing demand', 'Can worsen local pressure if settlement support lags'],
    beneficiaries: ['Employers', 'Job seekers in growing sectors', 'Federal government'],
    pressureGroups: ['Renters', 'State governments', 'Capital cities'],
  },
  {
    id: 'regional-settlement-focus',
    scenarioId: 'regional-settlement-focus',
    title: 'Prioritise regional migration',
    summary: 'Direct more arrivals to regional towns and rural labour markets.',
    intendedToImprove: 'Support regional employers and reduce capital-city concentration.',
    benefits: ['Regional labour supply', 'Potential support for towns'],
    risks: ['Can transfer pressure to smaller service systems', 'Needs jobs, housing and services together'],
    beneficiaries: ['Regional towns', 'Agriculture and regional employers'],
    pressureGroups: ['Local councils', 'Regional renters if services lag'],
  },
  {
    id: 'capacity-linked',
    scenarioId: 'current-path',
    title: 'Link migration to housing and infrastructure capacity',
    summary: 'Keep migration close to current levels but pair it with higher housing and infrastructure response.',
    intendedToImprove: 'Show how outcomes depend on accompanying decisions.',
    benefits: ['Reduces housing bottlenecks', 'Makes growth easier to absorb'],
    risks: ['Requires delivery capacity and funding', 'Benefits can lag if construction constraints bind'],
    beneficiaries: ['Renters', 'Employers', 'State governments if capacity arrives'],
    pressureGroups: ['Construction sector', 'Budget systems during the investment phase'],
    overrides: { housingBuildRate: 250_000, constructionLabourConstraint: 24, infrastructureCostPerAdditionalPerson: 9_500 },
  },
  {
    id: 'integration-support',
    scenarioId: 'current-path',
    title: 'Increase settlement and integration support',
    summary: 'Keep migration broadly current but invest in language, local services and job matching.',
    intendedToImprove: 'Improve social cohesion and make labour-market benefits easier to realise.',
    benefits: ['Lower cohesion risk', 'Better skill matching', 'Faster settlement benefits'],
    risks: ['Requires ongoing service spending', 'Does not directly build housing'],
    beneficiaries: ['Migrants and migrant families', 'Employers', 'Local communities'],
    pressureGroups: ['Government budgets', 'Service providers during rollout'],
    overrides: { socialCohesionSensitivity: 28, workforceParticipation: 70, productivityGrowth: 1.4 },
  },
  {
    id: 'custom',
    scenarioId: 'current-path',
    title: 'Build a custom scenario',
    summary: 'Start from the current path and adjust the five major choices before opening advanced settings.',
    intendedToImprove: 'Give expert users a sandbox without making sliders the default entry point.',
    benefits: ['Flexible policy packages', 'Advanced assumptions remain available'],
    risks: ['More complex for first-time users', 'Requires careful interpretation'],
    beneficiaries: ['Analysts', 'Policy-literate users'],
    pressureGroups: ['Users who want a guided path'],
  },
];

export function ImmigrationScenarioLab() {
  const [selectedObjective, setSelectedObjective] = useState(OBJECTIVES[0]);
  const [selectedApproachId, setSelectedApproachId] = useState<PolicyApproach['id']>('capacity-linked');
  const [selectedYear, setSelectedYear] = useState(IMMIGRATION_START_YEAR);
  const [isPlaying, setIsPlaying] = useState(false);
  const [runToYear, setRunToYear] = useState(IMMIGRATION_START_YEAR + 5);
  const [chartKey, setChartKey] = useState<ChartKey>('housingStressIndex');
  const [scoreWeights, setScoreWeights] = useState(DEFAULT_SCORE_WEIGHTS);
  const [supportingPolicyIds, setSupportingPolicyIds] = useState<string[]>(['housing-boost', 'infrastructure-boost']);
  const [assumptionOverrides, setAssumptionOverrides] = useState<Partial<ImmigrationAssumptions>>({});

  const selectedApproach = POLICY_APPROACHES.find((item) => item.id === selectedApproachId) ?? POLICY_APPROACHES[0];
  const selectedScenario = getImmigrationScenario(selectedApproach.scenarioId);
  const supportingOverrides = useMemo(
    () => mergeOverrides(SUPPORTING_POLICIES.filter((policy) => supportingPolicyIds.includes(policy.id)).map((policy) => policy.overrides)),
    [supportingPolicyIds],
  );
  const effectiveOverrides = useMemo(
    () => ({ ...selectedApproach.overrides, ...supportingOverrides, ...assumptionOverrides }),
    [assumptionOverrides, selectedApproach.overrides, supportingOverrides],
  );
  const selectedRun = useMemo(
    () => runImmigrationScenario(selectedScenario, effectiveOverrides),
    [effectiveOverrides, selectedScenario],
  );
  const baselineRun = useMemo(() => runImmigrationScenario(getImmigrationScenario('current-path')), []);
  const selectedYearResult = getYear(selectedRun.timeline, selectedYear);
  const baselineYearResult = getYear(baselineRun.timeline, selectedYear);
  const eventMarkers = buildEventMarkers(selectedRun.timeline);
  const selectedEventMarker = eventMarkers.find((event) => event.year === selectedYear);
  const selectedChartOption = CHART_OPTIONS.find((option) => option.key === chartKey) ?? CHART_OPTIONS[0];
  const topBenefits = selectedYearResult.tradeOffs.filter((item) => item.netImpact === 'positive').slice(0, 3);
  const topPressures = selectedYearResult.tradeOffs.filter((item) => item.netImpact === 'negative').slice(0, 3);
  const scenarioScore = calculateScenarioScore(selectedYearResult, scoreWeights);
  const baselineScore = calculateScenarioScore(baselineYearResult, scoreWeights);

  useEffect(() => {
    if (!isPlaying) return undefined;
    const timer = window.setInterval(() => {
      setSelectedYear((current) => {
        if (current >= runToYear) {
          setIsPlaying(false);
          return current;
        }
        return Math.min(current + 1, selectedRun.timeline[selectedRun.timeline.length - 1].year);
      });
    }, 900);
    return () => window.clearInterval(timer);
  }, [isPlaying, runToYear, selectedRun.timeline]);

  function updateAssumption(key: keyof ImmigrationAssumptions, value: number) {
    setAssumptionOverrides((current) => ({ ...current, [key]: value }));
  }

  function resetScenario() {
    setSelectedYear(IMMIGRATION_START_YEAR);
    setIsPlaying(false);
    setAssumptionOverrides({});
    setSupportingPolicyIds(['housing-boost', 'infrastructure-boost']);
  }

  function chooseApproach(approach: PolicyApproach) {
    setSelectedApproachId(approach.id);
    setSelectedYear(IMMIGRATION_START_YEAR);
    setIsPlaying(false);
    setAssumptionOverrides({});
  }

  function toggleSupportingPolicy(id: string) {
    setSupportingPolicyIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
    setIsPlaying(false);
  }

  return (
    <section className="immigration-guided section-block">
      <header className="guided-hero">
        <div>
          <p className="eyebrow">Policy journey · Immigration</p>
          <h2>Test immigration as a policy package, not an isolated slider</h2>
          <p>
            Start with the outcome you care about, choose an understandable policy approach, add the
            supporting housing, infrastructure and integration decisions, then watch outcomes unfold
            against the current-policy baseline.
          </p>
        </div>
        <div className="guided-state-card">
          <span>Selected scenario year</span>
          <strong>{selectedYear}</strong>
          <small>{selectedApproach.title}</small>
        </div>
      </header>

      <section className="guided-step-panel">
        <div className="step-heading">
          <span>Step 1</span>
          <div>
            <h3>What outcome are you trying to improve?</h3>
            <p>Choose the problem first. The policy controls stay secondary until the objective is clear.</p>
          </div>
        </div>
        <div className="objective-grid">
          {OBJECTIVES.map((objective) => (
            <button
              className={objective === selectedObjective ? 'is-active' : ''}
              key={objective}
              type="button"
              onClick={() => setSelectedObjective(objective)}
            >
              {objective}
            </button>
          ))}
        </div>
      </section>

      <section className="guided-step-panel">
        <div className="step-heading">
          <span>Step 2</span>
          <div>
            <h3>Choose a policy approach</h3>
            <p>Cards explain what changes, what it is intended to improve, benefits, risks and affected groups before any sliders appear.</p>
          </div>
        </div>
        <div className="policy-card-grid">
          {POLICY_APPROACHES.map((approach) => (
            <button
              className={approach.id === selectedApproachId ? 'policy-card is-active' : 'policy-card'}
              key={approach.id}
              type="button"
              onClick={() => chooseApproach(approach)}
            >
              <span>{approach.title}</span>
              <strong>{approach.summary}</strong>
              <p><b>Intended to improve:</b> {approach.intendedToImprove}</p>
              <div>
                <small><b>Benefits:</b> {approach.benefits.join('; ')}</small>
                <small><b>Risks:</b> {approach.risks.join('; ')}</small>
                <small><b>Likely to benefit:</b> {approach.beneficiaries.join(', ')}</small>
                <small><b>May face pressure:</b> {approach.pressureGroups.join(', ')}</small>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="guided-step-panel">
        <div className="step-heading">
          <span>Step 3</span>
          <div>
            <h3>Add supporting policies</h3>
            <p>Immigration outcomes depend on whether housing, infrastructure, training and settlement systems move with the policy.</p>
          </div>
        </div>
        <div className="support-policy-grid">
          {SUPPORTING_POLICIES.map((policy) => (
            <label className={supportingPolicyIds.includes(policy.id) ? 'is-active' : ''} key={policy.id}>
              <input
                checked={supportingPolicyIds.includes(policy.id)}
                type="checkbox"
                onChange={() => toggleSupportingPolicy(policy.id)}
              />
              <span>{policy.label}</span>
              <small>{policy.description}</small>
            </label>
          ))}
        </div>
      </section>

      <section className="simulation-stage" aria-label="Simulation results">
        <div className="simulation-stage-header">
          <div>
            <p className="eyebrow">Step 4 · Watch outcomes unfold</p>
            <h3>{selectedApproach.title} compared with the current-policy baseline</h3>
            <p>
              Objective: <strong>{selectedObjective}</strong>. The baseline remains visible so the question is not “did a number change?” but “did this package outperform the current path, for whom, and with what trade-offs?”
            </p>
          </div>
          <div className="year-control-grid compact-controls">
            <button type="button" onClick={() => { setIsPlaying(false); setSelectedYear((year) => Math.max(IMMIGRATION_START_YEAR, year - 1)); }}>Previous year</button>
            <button type="button" onClick={() => { setIsPlaying(false); setSelectedYear((year) => Math.min(2066, year + 1)); }}>Next year</button>
            <button type="button" onClick={() => { setIsPlaying(false); setSelectedYear((year) => Math.min(2066, year + 5)); }}>Advance five years</button>
            <button type="button" onClick={() => setIsPlaying((current) => !current)}>{isPlaying ? 'Pause' : 'Play'}</button>
            <button type="button" onClick={() => { setSelectedYear(runToYear); setIsPlaying(false); }}>Run to selected year</button>
            <button type="button" onClick={resetScenario}>Reset</button>
          </div>
        </div>

        <div className="run-to-row">
          <label>
            Selected year
            <input min={IMMIGRATION_START_YEAR} max={2066} type="range" value={selectedYear} onChange={(event) => { setIsPlaying(false); setSelectedYear(Number(event.target.value)); }} />
            <strong>{selectedYear}</strong>
          </label>
          <label>
            Run target
            <input min={selectedYear} max={2066} type="range" value={runToYear} onChange={(event) => setRunToYear(Number(event.target.value))} />
            <strong>{runToYear}</strong>
          </label>
        </div>

        <div className="main-results-layout">
          <article className="main-chart-card">
            <div className="panel-heading-row">
              <div>
                <p className="eyebrow">Selectable chart</p>
                <h4>{selectedChartOption.label}</h4>
              </div>
              <select value={chartKey} onChange={(event) => setChartKey(event.target.value as ChartKey)}>
                {CHART_OPTIONS.map((option) => <option key={option.key} value={option.key}>{option.label}</option>)}
              </select>
            </div>
            <div className="baseline-chart" role="img" aria-label={`${selectedChartOption.label} baseline and selected scenario comparison`}>
              {selectedRun.timeline.slice(0, 21).map((year, index) => {
                const baseline = baselineRun.timeline[index];
                const selectedValue = Number(year[chartKey]);
                const baselineValue = Number(baseline[chartKey]);
                const max = Math.max(...selectedRun.timeline.slice(0, 21).map((item) => Number(item[chartKey])), ...baselineRun.timeline.slice(0, 21).map((item) => Number(item[chartKey])));
                return (
                  <button
                    className={year.year === selectedYear ? 'is-active' : ''}
                    key={year.year}
                    type="button"
                    onClick={() => setSelectedYear(year.year)}
                    title={`${year.year}: selected ${selectedChartOption.format(selectedValue)}, baseline ${selectedChartOption.format(baselineValue)}`}
                  >
                    <span className="baseline-bar" style={{ height: `${Math.max(8, (baselineValue / max) * 100)}%` }} />
                    <span className="scenario-bar" style={{ height: `${Math.max(8, (selectedValue / max) * 100)}%` }} />
                    <small>{year.year}</small>
                  </button>
                );
              })}
            </div>
            <div className="chart-legend"><span>Current-policy baseline</span><span>Selected scenario</span></div>
          </article>

          <aside className="commentary-panel">
            <p className="eyebrow">Plain-language briefing · {selectedYear}</p>
            <BriefingSection title="What changed?" body={selectedYearResult.briefing.whatChanged} />
            <BriefingSection title="Why did it change?" body={selectedYearResult.briefing.assumptionsDrivingResult.join(' ')} />
            <BriefingSection title="Who was affected?" body={[...selectedYearResult.briefing.beneficiaries, ...selectedYearResult.briefing.costBearers].slice(0, 5).join('; ')} />
            <BriefingSection title="What may happen next?" body={selectedYearResult.briefing.buildingRisks.join(' ')} />
          </aside>
        </div>

        <div className="outcome-card-row">
          <MetricCard label="Population" value={formatNumber(selectedYearResult.population)} baseline={formatNumber(baselineYearResult.population)} />
          <MetricCard label="Housing pressure" value={formatIndex(selectedYearResult.housingStressIndex)} baseline={formatIndex(baselineYearResult.housingStressIndex)} />
          <MetricCard label="Workforce and skills" value={formatIndex(selectedYearResult.labourSupplyIndex)} baseline={formatIndex(baselineYearResult.labourSupplyIndex)} />
          <MetricCard label="Government/service pressure" value={formatIndex(selectedYearResult.stateBudgetPressure)} baseline={formatIndex(baselineYearResult.stateBudgetPressure)} />
          <MetricCard label="Environment/resources" value={formatIndex(selectedYearResult.environmentalPressure)} baseline={formatIndex(baselineYearResult.environmentalPressure)} />
        </div>

        <section className="score-summary-panel">
          <div className="scenario-score-card">
            <span>Overall scenario score</span>
            <strong>{scenarioScore.score.toFixed(0)}</strong>
            <small>Baseline {baselineScore.score.toFixed(0)} · difference {formatSigned(scenarioScore.score - baselineScore.score)}</small>
          </div>
          <div className="score-contribution-grid">
            {Object.entries(scenarioScore.contributions).map(([key, value]) => (
              <article key={key}>
                <span>{SCORE_WEIGHT_LABELS[key as ScoreWeightKey]}</span>
                <strong>{value.toFixed(1)}</strong>
              </article>
            ))}
          </div>
          <details className="score-weight-drawer">
            <summary>Change score weightings</summary>
            <p>
              The score is a summary, not the answer. Different values can make reasonable users prefer different futures.
              Changing weights updates the result immediately.
            </p>
            <div className="score-weight-grid">
              {(Object.keys(scoreWeights) as ScoreWeightKey[]).map((key) => (
                <label key={key}>
                  <span>{SCORE_WEIGHT_LABELS[key]}</span>
                  <input
                    max="30"
                    min="0"
                    type="range"
                    value={scoreWeights[key]}
                    onChange={(event) => setScoreWeights((current) => ({ ...current, [key]: Number(event.target.value) }))}
                  />
                  <strong>{scoreWeights[key]}</strong>
                </label>
              ))}
            </div>
          </details>
        </section>

        <div className="timeline-event-strip">
          {selectedRun.timeline.slice(0, 21).map((year) => {
            const marker = eventMarkers.find((event) => event.year === year.year);
            return (
              <button className={year.year === selectedYear ? 'is-active' : ''} key={year.year} type="button" onClick={() => setSelectedYear(year.year)}>
                <strong>{year.year}</strong>
                {marker ? <span title={marker.explanation}>{marker.label}</span> : <small>No marker</small>}
              </button>
            );
          })}
        </div>

        <article className="event-detail-card">
          <h4>Selected event marker</h4>
          {selectedEventMarker ? (
            <>
              <strong>{selectedEventMarker.label}</strong>
              <p><b>What occurred:</b> {selectedEventMarker.explanation}</p>
              <p><b>What caused it:</b> {selectedEventMarker.cause}</p>
              <p><b>Entities affected:</b> {selectedEventMarker.entities}</p>
              <p><b>Temporary or structural:</b> {selectedEventMarker.persistence}</p>
              <p><b>Possible responses:</b> {selectedEventMarker.responses}</p>
            </>
          ) : (
            <p>No major threshold marker is triggered in this selected year.</p>
          )}
        </article>

        <div className="distribution-comparison-grid">
          <section className="benefit-pressure-panel">
            <h4>Likely to benefit</h4>
            {topBenefits.map((item) => <EntityImpactCard key={item.group} item={item} />)}
          </section>
          <section className="benefit-pressure-panel">
            <h4>Likely to face pressure</h4>
            {topPressures.map((item) => <EntityImpactCard key={item.group} item={item} />)}
          </section>
          <section className="baseline-difference-panel">
            <h4>Baseline comparison</h4>
            <p>Population difference: <strong>{formatSigned(selectedYearResult.population - baselineYearResult.population)}</strong></p>
            <p>Housing pressure difference: <strong>{formatSigned(selectedYearResult.housingStressIndex - baselineYearResult.housingStressIndex)}</strong></p>
            <p>Service pressure difference: <strong>{formatSigned(selectedYearResult.stateBudgetPressure - baselineYearResult.stateBudgetPressure)}</strong></p>
            <p>Environment pressure difference: <strong>{formatSigned(selectedYearResult.environmentalPressure - baselineYearResult.environmentalPressure)}</strong></p>
            <small>Positive/negative is contextual: lower pressure is better for housing, services and environment.</small>
          </section>
        </div>
      </section>

      <details className="advanced-policy-drawer">
        <summary>Advanced settings: inspect and change detailed assumptions</summary>
        <section className="guided-step-panel">
          <div className="step-heading">
            <span>Major choices</span>
            <div>
              <h3>Five major levers</h3>
              <p>These are the first-layer controls. More technical assumptions remain below.</p>
            </div>
          </div>
          <div className="assumption-grid compact-assumption-grid">
            {IMMIGRATION_ASSUMPTION_DEFINITIONS.filter((definition) => MAJOR_ASSUMPTIONS.includes(definition.key)).map((definition) => (
              <AssumptionControl key={definition.key} definition={definition} value={selectedRun.assumptions[definition.key]} onChange={updateAssumption} />
            ))}
          </div>
        </section>
        <section className="guided-step-panel">
          <div className="step-heading">
            <span>Technical assumptions</span>
            <div>
              <h3>Advanced model assumptions</h3>
              <p>Age profile, labour-force participation, services, fiscal and environmental assumptions are available without dominating the default journey.</p>
            </div>
          </div>
          <div className="assumption-grid">
            {IMMIGRATION_ASSUMPTION_DEFINITIONS.filter((definition) => !MAJOR_ASSUMPTIONS.includes(definition.key)).map((definition) => (
              <AssumptionControl key={definition.key} definition={definition} value={selectedRun.assumptions[definition.key]} onChange={updateAssumption} />
            ))}
          </div>
        </section>
      </details>

      <section className="guided-step-panel scenario-comparison-panel">
        <div className="panel-heading-row">
          <div>
            <p className="eyebrow">Scenario comparison</p>
            <h3>Compare at least three futures at {selectedYear}</h3>
          </div>
          <span>Baseline · selected · alternative</span>
        </div>
        <div className="comparison-table-wrap">
          <table className="comparison-table">
            <thead>
              <tr>
                <th>Scenario</th>
                <th>Population</th>
                <th>Housing</th>
                <th>Labour</th>
                <th>Services</th>
                <th>Environment</th>
                <th>Risk/opportunity</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'Current-policy baseline', year: baselineYearResult },
                { name: selectedApproach.title, year: selectedYearResult },
                { name: 'Lower immigration only', year: getYear(runImmigrationScenario(getImmigrationScenario('low-immigration')).timeline, selectedYear) },
              ].map((row) => (
                <tr key={row.name}>
                  <td>{row.name}</td>
                  <td>{formatNumber(row.year.population)}</td>
                  <td>{formatIndex(row.year.housingStressIndex)}</td>
                  <td>{formatIndex(row.year.labourSupplyIndex)}</td>
                  <td>{formatIndex(row.year.stateBudgetPressure)}</td>
                  <td>{formatIndex(row.year.environmentalPressure)}</td>
                  <td>{row.year.briefing.buildingRisks[0] ?? 'No major threshold marker.'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="guided-step-panel model-transparency-panel">
        <div className="panel-heading-row">
          <div>
            <p className="eyebrow">How the model works</p>
            <h3>Transparent assumptions, causal links and limitations</h3>
          </div>
          <span>{IMMIGRATION_ENTITIES.length} entities · {IMMIGRATION_CAUSE_EFFECT_MAP.length} causal nodes</span>
        </div>
        <div className="baseline-list-grid">
          <BriefingList title="Key causal relationships" items={IMMIGRATION_CAUSE_EFFECT_MAP.slice(0, 5).map((node) => `${node.label}: ${node.explanation}`)} />
          <BriefingList title="Model limitations" items={[
            'Illustrative civic-learning prototype, not an official forecast or budget estimate.',
            'Placeholder assumptions should be replaced with ABS, Home Affairs, budget and sector data over time.',
            'Some commentary is narratively inferred from calculated scenario values and confidence metadata.',
          ]} />
          <BriefingList title="Entity foundation" items={IMMIGRATION_ENTITIES.slice(0, 6).map((entity) => `${entity.label}: ${entity.description}`)} />
          <BriefingList title="Confidence signals" items={IMMIGRATION_ASSUMPTION_DEFINITIONS.slice(0, 6).map((definition) => `${definition.label}: ${definition.confidence} confidence · ${definition.source}`)} />
        </div>
      </section>
    </section>
  );
}

function AssumptionControl({
  definition,
  value,
  onChange,
}: {
  definition: (typeof IMMIGRATION_ASSUMPTION_DEFINITIONS)[number];
  value: number;
  onChange: (key: keyof ImmigrationAssumptions, value: number) => void;
}) {
  return (
    <label className="assumption-card">
      <span>{definition.label}</span>
      <strong>{formatAssumptionValue(value, definition.unit)} <small>{definition.unit}</small></strong>
      <input max={definition.max} min={definition.min} step={definition.step} type="range" value={value} onChange={(event) => onChange(definition.key, Number(event.target.value))} />
      <em>{definition.source} · confidence: {definition.confidence}</em>
      <p>{definition.explanation}</p>
    </label>
  );
}

function BriefingSection({ title, body }: { title: string; body: string }) {
  return (
    <article>
      <h4>{title}</h4>
      <p>{body}</p>
    </article>
  );
}

function BriefingList({ title, items }: { title: string; items: string[] }) {
  return (
    <article>
      <h4>{title}</h4>
      <ul>{items.map((item) => <li key={item}>{item}</li>)}</ul>
    </article>
  );
}

function MetricCard({ label, value, baseline }: { label: string; value: string; baseline: string }) {
  return (
    <article>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>Baseline: {baseline}</small>
    </article>
  );
}

function EntityImpactCard({ item }: { item: ImmigrationSimulationYear['tradeOffs'][number] }) {
  return (
    <article>
      <div>
        <h5>{item.group}</h5>
        <em className={`impact-${item.netImpact}`}>{item.netImpact}</em>
      </div>
      <p><strong>Short term:</strong> {item.currentYearImpact.toFixed(1)} · <strong>Longer term:</strong> {item.cumulativeImpact.toFixed(1)}</p>
      <p><strong>Direct/indirect:</strong> {item.entityPathway}</p>
      <p><strong>Certainty:</strong> {item.confidence} confidence</p>
      <p>{item.mainBenefit}</p>
      <p>{item.mainCost}</p>
    </article>
  );
}

function mergeOverrides(overrides: Partial<ImmigrationAssumptions>[]) {
  return overrides.reduce<Partial<ImmigrationAssumptions>>((merged, item) => ({ ...merged, ...item }), {});
}

function getYear(timeline: ImmigrationSimulationYear[], year: number) {
  return timeline.find((item) => item.year === year) ?? timeline[0];
}

function buildEventMarkers(timeline: ImmigrationSimulationYear[]) {
  const emitted = new Set<string>();
  return timeline.flatMap((year) => {
    const candidates = [
      {
        id: 'housing',
        triggered: year.housingStressIndex >= 60,
        year: year.year,
        label: 'Housing pressure threshold',
        explanation: 'Rental and dwelling pressure is materially elevated relative to the baseline model.',
        cause: 'Population-driven housing demand is running ahead of new dwelling delivery and household formation assumptions.',
        entities: 'Renters, first-home buyers, construction workers, state governments and capital-city communities.',
        persistence: 'Structural unless housing supply, occupancy, regional settlement or migration settings change.',
        responses: 'Increase dwelling delivery, unlock infrastructure, reduce bottlenecks, or link migration settings to demonstrated capacity.',
      },
      {
        id: 'services',
        triggered: year.stateBudgetPressure >= 85,
        year: year.year,
        label: 'Service capacity threshold',
        explanation: 'State delivery pressure from hospitals, schools, transport and housing is very high.',
        cause: 'Health, education, infrastructure and settlement demand arrives faster than service capacity expands.',
        entities: 'State governments, local communities, students, older Australians, patients and new arrivals.',
        persistence: 'Mostly structural, though temporary relief can come from targeted service expansion.',
        responses: 'Fund health and education capacity, sequence infrastructure earlier, improve settlement support and workforce training.',
      },
      {
        id: 'environment',
        triggered: year.environmentalPressure >= 65,
        year: year.year,
        label: 'Environmental pressure threshold',
        explanation: 'Resource and environmental pressure is approaching the model warning range.',
        cause: 'Population, housing, energy, water, waste and land-use assumptions accumulate over time.',
        entities: 'Environmental resources, local communities, future generations, infrastructure providers and governments.',
        persistence: 'Structural unless resource intensity, urban design, energy systems or population pressure changes.',
        responses: 'Reduce resource intensity, invest in clean infrastructure, protect land and water, or redesign settlement patterns.',
      },
      {
        id: 'workforce',
        triggered: year.labourSupplyIndex <= 45,
        year: year.year,
        label: 'Workforce shortage risk',
        explanation: 'Labour supply is weak enough to constrain business and services.',
        cause: 'Migration settings, participation, age profile and skills matching are not meeting workforce demand.',
        entities: 'Businesses, health and education providers, skilled workers, consumers and governments.',
        persistence: 'Can become structural if training pipelines and skilled migration remain misaligned.',
        responses: 'Increase skilled migration, improve training, raise participation and strengthen skills matching.',
      },
    ];
    const marker = candidates.find((candidate) => candidate.triggered && !emitted.has(candidate.id));
    if (!marker) return [];
    emitted.add(marker.id);
    return [marker];
  });
}

function calculateScenarioScore(year: ImmigrationSimulationYear, weights: typeof DEFAULT_SCORE_WEIGHTS) {
  const components: Record<ScoreWeightKey, number> = {
    livingStandards: clampScore(year.labourSupplyIndex),
    housing: clampScore(100 - year.housingStressIndex),
    governmentFinances: clampScore(100 - (year.federalBudgetPressure + year.stateBudgetPressure) / 2),
    wellbeing: clampScore(100 - (year.housingStressIndex * 0.45 + year.stateBudgetPressure * 0.35 + year.socialCohesionRisk * 0.2)),
    socialCohesion: clampScore(100 - year.socialCohesionRisk),
    environment: clampScore(100 - year.environmentalPressure),
    fairness: clampScore(100 - Math.max(year.housingStressIndex, year.capitalCityPressure) * 0.75),
  };
  const totalWeight = Object.values(weights).reduce((sum, value) => sum + value, 0) || 1;
  const contributions = Object.fromEntries(
    (Object.keys(weights) as ScoreWeightKey[]).map((key) => [key, (components[key] * weights[key]) / totalWeight]),
  ) as Record<ScoreWeightKey, number>;
  const score = Object.values(contributions).reduce((sum, value) => sum + value, 0);
  return { components, contributions, score };
}

function clampScore(value: number) {
  return Math.max(0, Math.min(100, value));
}

function formatNumber(value: number) {
  return Math.round(value).toLocaleString('en-AU');
}

function formatIndex(value: number) {
  return value.toFixed(0);
}

function formatSigned(value: number) {
  const rounded = Math.abs(value) > 1000 ? Math.round(value).toLocaleString('en-AU') : value.toFixed(1);
  return value > 0 ? `+${rounded}` : `${rounded}`;
}
