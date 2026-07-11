import { useMemo, useState } from 'react';
import type { OutcomeScores, PolicySettings, SimulationHorizon } from '../simulation/model';
import { AustraliaSilhouette } from './AustraliaSilhouette';
import { formatNumber, formatPercent } from './formatters';

type PopulationGrowthScreenProps = {
  outcomes: OutcomeScores;
  policies: PolicySettings;
  horizon: SimulationHorizon;
  selectedYear: number;
  hasPendingChanges: boolean;
  showTurnReveal: boolean;
  onImmigrationChange: (value: number) => void;
  onHousingInvestmentChange: (value: number) => void;
  onInfrastructureInvestmentChange: (value: number) => void;
  onDismissTurnReveal: () => void;
  onEndYear: () => void;
};

type MetricCardProps = {
  label: string;
  value: string;
  detail: string;
  tone?: 'good' | 'warning' | 'pressure';
};

type FactorTrendCardProps = {
  label: string;
  value: string;
  trend: string;
  strength: number;
};

type ImpactCardProps = {
  icon: string;
  label: string;
  value: string;
  explanation: string;
  tone?: 'good' | 'warning' | 'pressure';
};

type MapMode = 'people' | 'flows' | 'heatmap' | 'cities';

const BASE_POPULATION = 27_000_000;
const DEFAULT_FERTILITY_RATE = 1.6;
const DEFAULT_LIFE_EXPECTANCY = 83;

export function PopulationGrowthScreen({
  outcomes,
  policies,
  horizon,
  selectedYear,
  hasPendingChanges,
  showTurnReveal,
  onImmigrationChange,
  onHousingInvestmentChange,
  onInfrastructureInvestmentChange,
  onDismissTurnReveal,
  onEndYear,
}: PopulationGrowthScreenProps) {
  const [fertilityRate, setFertilityRate] = useState(DEFAULT_FERTILITY_RATE);
  const [lifeExpectancy, setLifeExpectancy] = useState(DEFAULT_LIFE_EXPECTANCY);
  const [isAnimating, setIsAnimating] = useState(true);
  const [mapMode, setMapMode] = useState<MapMode>('people');

  const visualEstimate = useMemo(() => {
    const estimatedImmigration = policies.immigrationRate * 100_000;
    const estimatedBirths = BASE_POPULATION * (fertilityRate / 100);
    const estimatedDeaths = BASE_POPULATION / lifeExpectancy;
    const annualPopulationChange = estimatedImmigration + estimatedBirths - estimatedDeaths;
    const housingDemand = Math.max(0, annualPopulationChange / 2.5);
    const infrastructurePressure = Math.max(
      0,
      annualPopulationChange / 10_000 - policies.infrastructureReadiness * 0.25,
    );
    const density = Math.max(8, Math.min(48, annualPopulationChange / 15_000));

    return {
      estimatedImmigration,
      estimatedBirths,
      estimatedDeaths,
      annualPopulationChange,
      housingDemand,
      infrastructurePressure,
      density,
    };
  }, [fertilityRate, lifeExpectancy, policies.immigrationRate, policies.infrastructureReadiness]);

  return (
    <section className="population-game-screen section-block">
      <div className="population-screen-header">
        <p className="eyebrow">Living Dashboard Prototype</p>
        <h2>Population Growth Simulation</h2>
        <p>
          A first game-like screen for governing population change. The animations illustrate the
          existing model and visible assumptions; national outcomes still update only when you press
          <strong> End Year</strong>.
        </p>
      </div>

      {showTurnReveal ? (
        <TurnRevealPanel outcomes={outcomes} selectedYear={selectedYear} onDismiss={onDismissTurnReveal} />
      ) : null}

      <div className="population-dashboard-layout">
        <PolicyControlPanel
          fertilityRate={fertilityRate}
          lifeExpectancy={lifeExpectancy}
          policies={policies}
          onFertilityRateChange={setFertilityRate}
          onHousingInvestmentChange={onHousingInvestmentChange}
          onImmigrationChange={onImmigrationChange}
          onInfrastructureInvestmentChange={onInfrastructureInvestmentChange}
          onLifeExpectancyChange={setLifeExpectancy}
        />

        <PopulationMapVisual
          annualPopulationChange={visualEstimate.annualPopulationChange}
          density={visualEstimate.density}
          estimatedBirths={visualEstimate.estimatedBirths}
          estimatedDeaths={visualEstimate.estimatedDeaths}
          estimatedImmigration={visualEstimate.estimatedImmigration}
          hasPendingChanges={hasPendingChanges}
          isAnimating={isAnimating}
          mapMode={mapMode}
          outcomes={outcomes}
          onEndYear={onEndYear}
          onMapModeChange={setMapMode}
          onPlayPause={() => setIsAnimating((current) => !current)}
        />

        <section className="population-side-panel">
          <h3>Key population drivers</h3>
          <FactorTrendCard
            label="Immigration flow"
            strength={policies.immigrationRate * 20}
            trend={policies.immigrationRate >= 2.5 ? 'High intake pressure' : 'Moderate intake'}
            value={formatNumber(visualEstimate.estimatedImmigration)}
          />
          <FactorTrendCard
            label="Fertility"
            strength={fertilityRate * 35}
            trend={fertilityRate >= 1.8 ? 'Higher natural increase' : 'Below replacement'}
            value={fertilityRate.toFixed(1)}
          />
          <FactorTrendCard
            label="Life expectancy"
            strength={lifeExpectancy}
            trend={lifeExpectancy >= 84 ? 'Longer lives, ageing pressure' : 'Stable ageing profile'}
            value={`${lifeExpectancy.toFixed(0)} years`}
          />
          <FactorTrendCard
            label="Natural increase"
            strength={Math.max(0, Math.min(100, visualEstimate.annualPopulationChange / 8_000))}
            trend="Births minus deaths plus migration"
            value={formatNumber(visualEstimate.annualPopulationChange)}
          />
          <div className="population-explainer-card">
            <strong>What changed and why</strong>
            <p>
              Pending population change is driven by net immigration, illustrative births and
              illustrative deaths. Housing and infrastructure settings affect whether growth feels
              manageable after the year is enacted.
            </p>
          </div>
        </section>
      </div>

      <div className="population-bottom-panel">
        <YearTimeline
          annualPopulationChange={visualEstimate.annualPopulationChange}
          horizon={horizon}
          selectedYear={selectedYear}
        />
        <div className="impact-card-grid">
          <ImpactCard
            icon="👥"
            label="Labour force"
            value={visualEstimate.annualPopulationChange >= 0 ? 'Expanding' : 'Contracting'}
            explanation="More working-age migration can support labour supply, if skills and services keep pace."
            tone="good"
          />
          <ImpactCard
            icon="↗"
            label="GDP"
            value={formatPercent(outcomes.economicGrowth)}
            explanation="Growth still comes from the existing simulator model after End Year."
          />
          <ImpactCard
            icon="⌂"
            label="Housing demand"
            value={`${formatNumber(visualEstimate.housingDemand)} homes`}
            explanation="Illustrative demand uses 2.5 people per household, matching the current assumptions panel."
            tone={outcomes.housingStress > 65 ? 'pressure' : 'warning'}
          />
          <ImpactCard
            icon="▥"
            label="Infrastructure"
            value={outcomes.absorptiveCapacityStatus}
            explanation="Capacity combines housing, integration, skills and infrastructure readiness."
          />
          <ImpactCard
            icon="☘"
            label="Environment"
            value={outcomes.environmentalPressure.toFixed(1)}
            explanation="Environmental pressure still uses the existing enacted outcome calculation."
            tone={outcomes.environmentalPressure > 65 ? 'pressure' : 'good'}
          />
          <ImpactCard
            icon="●●"
            label="Social cohesion"
            value={outcomes.socialCohesion.toFixed(1)}
            explanation="Cohesion reflects integration, services, trust and housing pressure."
          />
        </div>
        <div className="story-panel-grid">
          <EventNewsPanel outcomes={outcomes} />
          <CitizenVoice outcomes={outcomes} />
        </div>
        <DashboardAssumptionsCard />
        <AdvisorPanel outcomes={outcomes} />
      </div>
    </section>
  );
}

function TurnRevealPanel({
  outcomes,
  selectedYear,
  onDismiss,
}: {
  outcomes: OutcomeScores;
  selectedYear: number;
  onDismiss: () => void;
}) {
  const headline =
    outcomes.housingStress > 68
      ? 'Housing pressure rose after the annual agenda.'
      : outcomes.economicGrowth >= 2.5
        ? 'Growth strengthened after the annual agenda.'
        : outcomes.environmentalPressure > 65
          ? 'Environmental pressure increased this year.'
          : 'The year ended with mixed but manageable trade-offs.';

  return (
    <aside className="turn-reveal-panel">
      <div>
        <span>End Year Reveal</span>
        <strong>Year {selectedYear} consequences processed</strong>
        <p>{headline}</p>
      </div>
      <ul>
        <li>GDP: {formatPercent(outcomes.economicGrowth)}</li>
        <li>Housing stress: {outcomes.housingStress.toFixed(1)}</li>
        <li>Environment pressure: {outcomes.environmentalPressure.toFixed(1)}</li>
        <li>Social cohesion: {outcomes.socialCohesion.toFixed(1)}</li>
      </ul>
      <button type="button" onClick={onDismiss}>Dismiss</button>
    </aside>
  );
}

function PolicyControlPanel({
  policies,
  fertilityRate,
  lifeExpectancy,
  onImmigrationChange,
  onFertilityRateChange,
  onLifeExpectancyChange,
  onHousingInvestmentChange,
  onInfrastructureInvestmentChange,
}: {
  policies: PolicySettings;
  fertilityRate: number;
  lifeExpectancy: number;
  onImmigrationChange: (value: number) => void;
  onFertilityRateChange: (value: number) => void;
  onLifeExpectancyChange: (value: number) => void;
  onHousingInvestmentChange: (value: number) => void;
  onInfrastructureInvestmentChange: (value: number) => void;
}) {
  return (
    <section className="population-policy-panel">
      <h3>Government policy controls</h3>
      <GamePolicyControl
        detail="Existing model input: immigration rate"
        icon="👥"
        label="Net immigration"
        max={5}
        min={0}
        step={0.1}
        unit="%"
        value={policies.immigrationRate}
        onChange={onImmigrationChange}
      />
      <GamePolicyControl
        detail="Illustrative visual assumption only"
        icon="👶"
        label="Fertility rate"
        max={2.4}
        min={1.1}
        step={0.1}
        unit="births per woman"
        value={fertilityRate}
        onChange={onFertilityRateChange}
      />
      <GamePolicyControl
        detail="Illustrative visual assumption only"
        icon="❤"
        label="Life expectancy"
        max={90}
        min={76}
        step={1}
        unit="years"
        value={lifeExpectancy}
        onChange={onLifeExpectancyChange}
      />
      <GamePolicyControl
        detail="Existing model input: housing build rate"
        icon="⌂"
        label="Housing investment"
        max={350_000}
        min={50_000}
        step={5_000}
        unit="homes/year"
        value={policies.housingBuildRate}
        onChange={onHousingInvestmentChange}
      />
      <GamePolicyControl
        detail="Existing model input: infrastructure readiness"
        icon="▥"
        label="Infrastructure investment"
        max={100}
        min={0}
        step={1}
        unit="readiness score"
        value={policies.infrastructureReadiness}
        onChange={onInfrastructureInvestmentChange}
      />
      <div className="policy-notes-card">
        <strong>Policy notes</strong>
        <p>
          Higher migration can support growth, but only if housing and infrastructure capacity keep
          pace. Fertility and life expectancy are visual assumptions in this prototype.
        </p>
        <div>
          <span>Political cost</span>
          <em><i style={{ width: `${Math.min(88, policies.immigrationRate * 15 + 18)}%` }} /></em>
        </div>
        <div>
          <span>Budget impact</span>
          <b>{policies.housingBuildRate > 220_000 || policies.infrastructureReadiness > 70 ? 'Higher' : 'Moderate'}</b>
        </div>
      </div>
    </section>
  );
}

function GamePolicyControl({
  label,
  icon,
  value,
  min,
  max,
  step,
  unit,
  detail,
  onChange,
}: {
  label: string;
  icon: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  detail: string;
  onChange: (value: number) => void;
}) {
  const formattedValue = unit.includes('homes') ? formatNumber(value) : value.toFixed(step < 1 ? 1 : 0);
  const midpoint = min + (max - min) / 2;

  return (
    <label className="game-policy-control">
      <span className="policy-control-heading">
        <i aria-hidden="true">{icon}</i>
        <span>
          <strong>{label}</strong>
          <em>{detail}</em>
        </span>
      </span>
      <input
        max={max}
        min={min}
        step={step}
        type="range"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <small>
        {formattedValue} {unit}
      </small>
      <span className="slider-scale">
        <b>{formatControlValue(min, step, unit)}</b>
        <b>{formatControlValue(midpoint, step, unit)}</b>
        <b>{formatControlValue(max, step, unit)}</b>
      </span>
    </label>
  );
}

function formatControlValue(value: number, step: number, unit: string) {
  if (unit.includes('homes')) return formatNumber(value);
  return value.toFixed(step < 1 ? 1 : 0);
}

function PopulationMapVisual({
  outcomes,
  estimatedImmigration,
  estimatedBirths,
  estimatedDeaths,
  annualPopulationChange,
  density,
  isAnimating,
  mapMode,
  hasPendingChanges,
  onMapModeChange,
  onPlayPause,
  onEndYear,
}: {
  outcomes: OutcomeScores;
  estimatedImmigration: number;
  estimatedBirths: number;
  estimatedDeaths: number;
  annualPopulationChange: number;
  density: number;
  isAnimating: boolean;
  mapMode: MapMode;
  hasPendingChanges: boolean;
  onMapModeChange: (mode: MapMode) => void;
  onPlayPause: () => void;
  onEndYear: () => void;
}) {
  const populationTotal = BASE_POPULATION + outcomes.populationIncrease;
  const dots = Array.from({ length: Math.round(density) }, (_, index) => index);
  const zoneTones = buildZoneTones(outcomes);
  const modes: Array<{ id: MapMode; label: string; icon: string }> = [
    { id: 'people', label: 'People', icon: '♟' },
    { id: 'flows', label: 'Flows', icon: '⇄' },
    { id: 'heatmap', label: 'Heatmap', icon: '▥' },
    { id: 'cities', label: 'Cities', icon: '⌂' },
  ];

  return (
    <section className="population-map-panel">
      <div className="map-topline">
        <MetricCard
          detail="Illustrative national total used for the visual scene"
          label="Population"
          value={formatNumber(populationTotal)}
        />
        <MetricCard
          detail="Pending annual visual estimate"
          label="Annual change"
          tone={annualPopulationChange >= 0 ? 'good' : 'pressure'}
          value={`${annualPopulationChange >= 0 ? '+' : ''}${formatNumber(annualPopulationChange)}`}
        />
      </div>

      <div className={`australia-scene map-mode-${mapMode}${isAnimating ? ' is-animating' : ''}`}>
        <div className="scene-skyline" aria-hidden="true" />
        <div className="migration-flow flow-one" />
        <div className="migration-flow flow-two" />
        <AustraliaSilhouette zoneTones={zoneTones}>
          {dots.map((dot) => (
            <span
              className="population-dot"
              key={dot}
              style={{
                left: `${18 + ((dot * 17) % 64)}%`,
                top: `${18 + ((dot * 29) % 58)}%`,
                animationDelay: `${(dot % 8) * 0.18}s`,
              }}
            />
          ))}
          <span className="city-marker city-sydney">Sydney</span>
          <span className="city-marker city-melbourne">Melbourne</span>
          <span className="city-marker city-brisbane">Brisbane</span>
          <span className="city-marker city-perth">Perth</span>
        </AustraliaSilhouette>
        <SceneStatCard className="scene-stat-immigration" icon="👥" label="Immigrants" value={`+${formatNumber(estimatedImmigration)}`} />
        <SceneStatCard className="scene-stat-births" icon="👶" label="Births" value={`+${formatNumber(estimatedBirths)}`} />
        <SceneStatCard className="scene-stat-deaths" icon="✚" label="Deaths" value={`-${formatNumber(estimatedDeaths)}`} />
      </div>

      <div className="map-mode-tabs" aria-label="Map visual mode">
        {modes.map((mode) => (
          <button
            className={mode.id === mapMode ? 'is-active' : ''}
            key={mode.id}
            type="button"
            onClick={() => onMapModeChange(mode.id)}
          >
            <span aria-hidden="true">{mode.icon}</span>
            {mode.label}
          </button>
        ))}
      </div>
      <p className="map-mode-caption">{mapModeCaption(mapMode)}</p>

      <MapLegend />

      <div className="population-flow-strip">
        <MetricCard detail="Arrivals from net migration input" label="Immigrants" value={formatNumber(estimatedImmigration)} />
        <MetricCard detail="Visual assumption from fertility rate" label="Births" value={formatNumber(estimatedBirths)} />
        <MetricCard detail="Visual assumption from life expectancy" label="Deaths" value={formatNumber(estimatedDeaths)} />
      </div>

      <div className="map-action-row">
        <button type="button" onClick={onPlayPause}>
          {isAnimating ? 'Pause animation' : 'Play animation'}
        </button>
        <button className="primary-action" type="button" onClick={onEndYear}>
          End Year
        </button>
        <span>{hasPendingChanges ? 'Pending decisions ready for approval' : 'No pending policy changes'}</span>
      </div>
    </section>
  );
}

function mapModeCaption(mode: MapMode) {
  const captions: Record<MapMode, string> = {
    people: 'People mode emphasises illustrative population density dots across the national scene.',
    flows: 'Flows mode highlights migration movement and pressure entering the system.',
    heatmap: 'Heatmap mode colours regions using existing housing, environment, cohesion and capacity pressures.',
    cities: 'Cities mode marks major population centres for future state and city-level storytelling.',
  };

  return captions[mode];
}

function SceneStatCard({
  className,
  icon,
  label,
  value,
}: {
  className: string;
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <article className={`scene-stat-card ${className}`}>
      <i aria-hidden="true">{icon}</i>
      <div>
        <strong>{value}</strong>
        <span>{label}</span>
      </div>
    </article>
  );
}

function MapLegend() {
  return (
    <div className="map-legend" aria-label="Heatmap legend">
      <strong>Heatmap legend</strong>
      <span><i className="legend-low" /> Lower pressure</span>
      <span><i className="legend-medium" /> Moderate pressure</span>
      <span><i className="legend-high" /> Higher pressure</span>
      <small>Derived from existing housing, environment, cohesion and capacity outcomes.</small>
    </div>
  );
}

function buildZoneTones(outcomes: OutcomeScores) {
  const housingTone = toneFromPressure(outcomes.housingStress);
  const environmentTone = toneFromPressure(outcomes.environmentalPressure);
  const cohesionTone = toneFromPressure(100 - outcomes.socialCohesion);
  const capacityTone = toneFromPressure(100 - outcomes.absorptiveCapacityScore);

  return {
    wa: environmentTone,
    nt: capacityTone,
    sa: cohesionTone,
    qld: environmentTone,
    nsw: housingTone,
    vic: housingTone,
    tas: cohesionTone,
  };
}

function toneFromPressure(value: number): 'low' | 'medium' | 'high' {
  if (value >= 66) return 'high';
  if (value >= 42) return 'medium';
  return 'low';
}

function MetricCard({ label, value, detail, tone = 'good' }: MetricCardProps) {
  return (
    <article className={`living-metric-card tone-${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}

function FactorTrendCard({ label, value, trend, strength }: FactorTrendCardProps) {
  const safeStrength = Math.max(8, Math.min(100, strength));
  const points = buildSparklinePoints(safeStrength);

  return (
    <article className="factor-trend-card">
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
      <svg className="mini-sparkline" viewBox="0 0 120 42" aria-hidden="true">
        <polyline points={points} />
        <circle cx="112" cy={String(42 - safeStrength * 0.32)} r="3" />
      </svg>
      <p>{trend}</p>
      <em>
        <i style={{ width: `${safeStrength}%` }} />
      </em>
    </article>
  );
}

function buildSparklinePoints(strength: number) {
  return Array.from({ length: 8 }, (_, index) => {
    const x = 8 + index * 15;
    const wave = Math.sin(index * 1.4) * 5;
    const y = 34 - strength * 0.22 + wave - index * 0.9;
    return `${x},${Math.max(7, Math.min(36, y))}`;
  }).join(' ');
}

function ImpactCard({ icon, label, value, explanation, tone = 'warning' }: ImpactCardProps) {
  return (
    <article className={`impact-card tone-${tone}`}>
      <div className="impact-icon" aria-hidden="true">{icon}</div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <p>{explanation}</p>
      </div>
    </article>
  );
}

function YearTimeline({
  horizon,
  selectedYear,
  annualPopulationChange,
}: {
  horizon: SimulationHorizon;
  selectedYear: number;
  annualPopulationChange: number;
}) {
  return (
    <div className="year-timeline">
      {Array.from({ length: horizon }, (_, index) => index + 1).map((year) => (
        <article className={year === selectedYear ? 'is-active' : ''} key={year}>
          <span>{2020 + year - 1}</span>
          <strong>{formatNumber(BASE_POPULATION + annualPopulationChange * year)}</strong>
          <small>{annualPopulationChange >= 0 ? '+' : ''}{formatPercent((annualPopulationChange / BASE_POPULATION) * 100)}</small>
          <em aria-hidden="true">◆</em>
        </article>
      ))}
    </div>
  );
}

function DashboardAssumptionsCard() {
  return (
    <section className="dashboard-assumptions-card">
      <span>Visible assumptions</span>
      <ul>
        <li>Fertility and life expectancy are local visual controls for this dashboard prototype.</li>
        <li>Births, deaths and forward population cards are illustrative estimates, not official forecasts.</li>
        <li>Enacted national outcomes still come from the existing simulator after End Year.</li>
      </ul>
    </section>
  );
}

function AdvisorPanel({ outcomes }: { outcomes: OutcomeScores }) {
  const advisors = [
    {
      role: 'Treasurer',
      icon: '$',
      advice:
        outcomes.governmentBalance < 0
          ? 'Protect the budget position before adding permanent commitments.'
          : 'Use the stronger budget position to build buffers for future shocks.',
    },
    {
      role: 'Housing Minister',
      icon: '⌂',
      advice:
        outcomes.housingStress > 62
          ? 'Housing supply is the main pressure. Pair population growth with dwelling capacity.'
          : 'Housing pressure is manageable, but keep supply moving with demand.',
    },
    {
      role: 'Environment Minister',
      icon: '☘',
      advice:
        outcomes.environmentalPressure > 62
          ? 'Growth needs environmental safeguards and resilience investment.'
          : 'Environmental pressure is contained enough to plan ahead rather than react.',
    },
    {
      role: 'Community Minister',
      icon: '●●',
      advice:
        outcomes.socialCohesion < 58
          ? 'Trust and service access need attention before pressure becomes social tension.'
          : 'Cohesion is supporting change, but communities still need visible services.',
    },
  ];

  return (
    <section className="advisor-panel">
      <div className="advisor-panel-header">
        <span>Advisor briefing</span>
        <strong>Illustrative recommendations from existing outcomes</strong>
      </div>
      <div className="advisor-grid">
        {advisors.map((advisor) => (
          <article key={advisor.role}>
            <i aria-hidden="true">{advisor.icon}</i>
            <div>
              <strong>{advisor.role}</strong>
              <p>{advisor.advice}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function EventNewsPanel({ outcomes }: { outcomes: OutcomeScores }) {
  const headline = buildNewsHeadline(outcomes);

  return (
    <article className="story-panel news-panel">
      <span>Yearly news</span>
      <strong>{headline}</strong>
      <p>
        Reporters are watching housing, infrastructure, growth, environment and cohesion as the
        government prepares its next annual agenda.
      </p>
    </article>
  );
}

function buildNewsHeadline(outcomes: OutcomeScores) {
  if (outcomes.housingStress > 70 && outcomes.socialCohesion < 58) {
    return 'Housing squeeze tests community confidence';
  }
  if (outcomes.environmentalPressure > 70) {
    return 'Environmental pressure climbs after busy growth year';
  }
  if (outcomes.governmentBalance < -80) {
    return 'Budget pressure narrows options for next year';
  }
  if (outcomes.economicGrowth >= 2.5 && outcomes.housingStress < 55) {
    return 'Growth outlook strengthens while housing remains manageable';
  }
  if (outcomes.absorptiveCapacityScore < 45) {
    return 'Services and infrastructure struggle to absorb growth';
  }
  return 'Government weighs steady progress against future risks';
}

function CitizenVoice({ outcomes }: { outcomes: OutcomeScores }) {
  const comment = buildCitizenComment(outcomes);

  return (
    <article className="story-panel citizen-panel">
      <div className="citizen-avatar" aria-hidden="true">AU</div>
      <div>
        <span>Citizen voice</span>
        <strong>Everyday impact</strong>
        <p>{comment}</p>
      </div>
    </article>
  );
}

function buildCitizenComment(outcomes: OutcomeScores) {
  if (outcomes.housingStress > 65) {
    return '“I found more work, but rent is still taking too much of my pay.” — construction worker, Western Sydney';
  }
  if (outcomes.environmentalPressure > 68) {
    return '“The economy is moving, but our town is worried about heat, water and land pressure.” — farmer, regional Queensland';
  }
  if (outcomes.socialCohesion < 55) {
    return '“People need to see services keeping up with change.” — community nurse, outer Melbourne';
  }
  if (outcomes.governmentBalance < -70) {
    return '“I support better services, but I want to know how the government will pay for them.” — small business owner, Adelaide';
  }
  return '“Things feel manageable this year, but we still worry about housing and services.” — teacher, regional Queensland';
}
