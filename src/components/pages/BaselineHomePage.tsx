import { useMemo, useState } from 'react';
import {
  DEFAULT_IMMIGRATION_ASSUMPTIONS,
  IMMIGRATION_START_YEAR,
  getImmigrationScenario,
  runImmigrationScenario,
  type ImmigrationSimulationYear,
} from '../../topics/immigration';

const PROJECTION_YEARS = [IMMIGRATION_START_YEAR, IMMIGRATION_START_YEAR + 5, IMMIGRATION_START_YEAR + 10, IMMIGRATION_START_YEAR + 20];

type BaselineHomePageProps = {
  mode?: 'today' | 'currentPath' | 'problems';
  onSectionChange: (section: string) => void;
};

type OutcomeView = {
  label: string;
  value: string;
  direction: 'Improving' | 'Stable' | 'Pressure rising' | 'Watch closely';
  explanation: string;
};

const PROBLEM_AREAS = [
  'Housing affordability',
  'Living standards and real income per person',
  'Productivity',
  'Government finances',
  'Health and education capacity',
  'Social cohesion',
  'Environmental sustainability',
  'Intergenerational fairness',
];

export function BaselineHomePage({ mode = 'today', onSectionChange }: BaselineHomePageProps) {
  const [selectedYear, setSelectedYear] = useState(IMMIGRATION_START_YEAR + 5);
  const [primaryObjective, setPrimaryObjective] = useState('Housing affordability');
  const [secondaryObjectives, setSecondaryObjectives] = useState<string[]>(['Productivity']);

  const baselineRun = useMemo(() => runImmigrationScenario(getImmigrationScenario('current-path')), []);
  const selectedResult =
    baselineRun.timeline.find((year) => year.year === selectedYear) ?? baselineRun.timeline[0];
  const currentResult = baselineRun.timeline[0];
  const twentyYearResult =
    baselineRun.timeline.find((year) => year.year === IMMIGRATION_START_YEAR + 20) ?? baselineRun.timeline[20];
  const risks = buildRisks(twentyYearResult);
  const opportunities = buildOpportunities(twentyYearResult);
  const outcomes = buildOutcomeViews(currentResult, selectedResult);

  function toggleSecondary(objective: string) {
    setSecondaryObjectives((current) => {
      if (current.includes(objective)) return current.filter((item) => item !== objective);
      if (current.length >= 2) return current;
      return [...current, objective];
    });
  }

  return (
    <section className="baseline-home section-block">
      <header className="baseline-hero">
        <div>
          <p className="eyebrow">Current-policy baseline · modelled scenario, not a forecast</p>
          <h2>Where is Australia heading?</h2>
          <p>
            Start with the current path before choosing a policy. This baseline uses the existing
            immigration scenario engine to show how population, housing, services, government capacity,
            cohesion and environmental pressure may unfold if settings broadly continue.
          </p>
          <div className="baseline-journey-strip" aria-label="Simulator journey">
            <span>Understand the current path</span>
            <span>Identify a problem</span>
            <span>Test solutions</span>
            <span>Watch outcomes unfold</span>
            <span>Revise the policy</span>
          </div>
        </div>
        <div className="baseline-hero-card">
          <span>Projection year</span>
          <strong>{selectedYear}</strong>
          <small>Current-policy baseline compared with {IMMIGRATION_START_YEAR}</small>
        </div>
      </header>

      <section className="baseline-panel-dark">
        <div className="panel-heading-row">
          <div>
            <p className="eyebrow">Five national outcomes</p>
            <h3>Current position and projected direction</h3>
          </div>
          <span>Choose a year or step annually</span>
        </div>
        <div className="projection-controls" aria-label="Projection year controls">
          {PROJECTION_YEARS.map((year) => (
            <button
              className={year === selectedYear ? 'is-active' : ''}
              key={year}
              type="button"
              onClick={() => setSelectedYear(year)}
            >
              {year === IMMIGRATION_START_YEAR ? 'Current year' : `${year - IMMIGRATION_START_YEAR} years ahead`}
              <strong>{year}</strong>
            </button>
          ))}
          <label>
            Step through individual years
            <input
              max={IMMIGRATION_START_YEAR + 20}
              min={IMMIGRATION_START_YEAR}
              type="range"
              value={selectedYear}
              onChange={(event) => setSelectedYear(Number(event.target.value))}
            />
          </label>
        </div>
        <div className="baseline-outcome-grid">
          {outcomes.map((outcome) => (
            <article key={outcome.label}>
              <span>{outcome.label}</span>
              <strong>{outcome.value}</strong>
              <em className={`direction-${slug(outcome.direction)}`}>{outcome.direction}</em>
              <p>{outcome.explanation}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="baseline-panel-dark baseline-two-column">
        <div>
          <p className="eyebrow">Current-policy baseline</p>
          <h3>What the model says is developing</h3>
          <p>
            Baseline does not mean “best” or “certain”. It is the control scenario used to judge
            whether alternatives improve, worsen or simply move pressure to different people, places or
            years.
          </p>
          <div className="baseline-list-grid">
            <ListBlock title="Three emerging risks" items={risks} />
            <ListBlock title="Three opportunities" items={opportunities} />
            <ListBlock title="Groups likely to benefit" items={selectedResult.briefing.beneficiaries.slice(0, 3)} />
            <ListBlock title="Groups likely to face pressure" items={selectedResult.briefing.costBearers.slice(0, 3)} />
          </div>
        </div>
        <aside className="model-confidence-card">
          <h4>Assumptions and confidence</h4>
          <ul>
            <li>Net overseas migration: {DEFAULT_IMMIGRATION_ASSUMPTIONS.netOverseasMigration.toLocaleString('en-AU')} people/year · confidence medium</li>
            <li>Housing build rate: {DEFAULT_IMMIGRATION_ASSUMPTIONS.housingBuildRate.toLocaleString('en-AU')} dwellings/year · confidence medium</li>
            <li>Productivity growth: {DEFAULT_IMMIGRATION_ASSUMPTIONS.productivityGrowth}%/year · confidence low</li>
            <li>Environmental pressure per person: index {DEFAULT_IMMIGRATION_ASSUMPTIONS.environmentalPressurePerPerson} · confidence low</li>
          </ul>
          <p>
            Outputs are directly calculated from transparent placeholder assumptions where available;
            commentary and confidence notes are interpretive summaries of those calculated values.
          </p>
        </aside>
      </section>

      <section className="starting-paths" aria-label="Starting paths">
        <article className="starting-path-card primary-path">
          <span>Primary path · 60%</span>
          <h3>Explore the current path</h3>
          <p>See what may happen if existing policy settings continue.</p>
          <button type="button" onClick={() => onSectionChange('Current path')}>Explore current path</button>
        </article>
        <article className="starting-path-card">
          <span>Problem-led path · 30%</span>
          <h3>Solve a problem</h3>
          <p>Choose an Australian outcome you want to improve and explore possible responses.</p>
          <button type="button" onClick={() => onSectionChange('Problems to solve')}>Choose a problem</button>
        </article>
        <article className="starting-path-card secondary-path">
          <span>Expert path · 10%</span>
          <h3>Test a policy</h3>
          <p>Go straight to policy topics such as immigration, housing, taxation or infrastructure.</p>
          <button type="button" onClick={() => onSectionChange('Policies')}>Test immigration policy</button>
        </article>
      </section>

      {mode === 'problems' ? (
        <section className="baseline-panel-dark problem-selector-panel">
          <div className="panel-heading-row">
            <div>
              <p className="eyebrow">Problem-led setup</p>
              <h3>Choose the outcome you want to improve</h3>
            </div>
            <span>1 primary · up to 2 secondary</span>
          </div>
          <div className="problem-choice-grid">
            {PROBLEM_AREAS.map((problem) => (
              <article className={problem === primaryObjective ? 'is-primary' : ''} key={problem}>
                <h4>{problem}</h4>
                <div>
                  <button type="button" onClick={() => setPrimaryObjective(problem)}>Primary objective</button>
                  <label>
                    <input
                      checked={secondaryObjectives.includes(problem)}
                      disabled={!secondaryObjectives.includes(problem) && secondaryObjectives.length >= 2}
                      type="checkbox"
                      onChange={() => toggleSecondary(problem)}
                    />
                    Secondary
                  </label>
                </div>
              </article>
            ))}
          </div>
          <div className="problem-next-step">
            <p>
              Selected: improve <strong>{primaryObjective}</strong>
              {secondaryObjectives.length ? ` while also considering ${secondaryObjectives.join(' and ')}.` : '.'}
            </p>
            <button type="button" onClick={() => onSectionChange('Policies')}>Explore policy responses</button>
          </div>
        </section>
      ) : null}
    </section>
  );
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <article>
      <h4>{title}</h4>
      <ul>
        {items.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </article>
  );
}

function buildOutcomeViews(current: ImmigrationSimulationYear, selected: ImmigrationSimulationYear): OutcomeView[] {
  const populationGrowth = selected.population - current.population;
  const housingDirection = selected.housingStressIndex > current.housingStressIndex + 5 ? 'Pressure rising' : 'Stable';
  const serviceDirection = selected.stateBudgetPressure > current.stateBudgetPressure + 5 ? 'Pressure rising' : 'Watch closely';
  const cohesionDirection = selected.socialCohesionRisk > current.socialCohesionRisk + 5 ? 'Pressure rising' : 'Stable';
  const environmentDirection = selected.environmentalPressure > current.environmentalPressure + 5 ? 'Pressure rising' : 'Watch closely';

  return [
    {
      label: 'Living standards',
      value: `Labour index ${selected.labourSupplyIndex.toFixed(0)}`,
      direction: selected.labourSupplyIndex >= current.labourSupplyIndex ? 'Improving' : 'Watch closely',
      explanation: `${Math.round(populationGrowth).toLocaleString('en-AU')} more people than the starting year; workforce capacity depends on skills and participation.`,
    },
    {
      label: 'Housing and essential services',
      value: `Housing stress ${selected.housingStressIndex.toFixed(0)}`,
      direction: housingDirection,
      explanation: `Service pressure is ${selected.stateBudgetPressure.toFixed(0)} as housing, hospitals, schools and transport absorb growth.`,
    },
    {
      label: 'Government finances',
      value: `Federal pressure ${selected.federalBudgetPressure.toFixed(0)}`,
      direction: serviceDirection,
      explanation: `Revenue grows with workers, but infrastructure and service spending can arrive sooner than fiscal benefits.`,
    },
    {
      label: 'Wellbeing and social cohesion',
      value: `Cohesion risk ${selected.socialCohesionRisk.toFixed(0)}`,
      direction: cohesionDirection,
      explanation: `Cohesion depends on settlement success, service capacity, housing pressure and local trust.`,
    },
    {
      label: 'Environment and resources',
      value: `Pressure ${selected.environmentalPressure.toFixed(0)}`,
      direction: environmentDirection,
      explanation: 'Lower pressure is better; land, water, energy, waste and emissions pressure accumulate over time.',
    },
  ];
}

function buildRisks(result: ImmigrationSimulationYear) {
  const risks = [
    `Services pressure reaches ${result.stateBudgetPressure.toFixed(0)}, testing state delivery capacity.`,
    `Environmental pressure reaches ${result.environmentalPressure.toFixed(0)} under current resource assumptions.`,
    `Capital-city pressure reaches ${result.capitalCityPressure.toFixed(0)} if settlement remains concentrated.`,
  ];
  return risks;
}

function buildOpportunities(result: ImmigrationSimulationYear) {
  return [
    `Working-age population reaches ${Math.round(result.workingAgePopulation).toLocaleString('en-AU')}, supporting labour supply.`,
    `Business capacity index reaches ${result.businessCapacityIndex.toFixed(0)} if skills and housing keep pace.`,
    `Regional share reaches ${result.regionalPopulationShare.toFixed(0)}%, creating scope for regional development if services are ready.`,
  ];
}

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}
