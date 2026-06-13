import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';

const BASE_POPULATION = 27_000_000;
const DEFAULT_IMMIGRATION_RATE = 2;
const DEFAULT_HOUSING_BUILD_RATE = 175_000;
const DEFAULT_INTEGRATION_EFFECTIVENESS = 65;
const DEFAULT_SKILLS_ALIGNMENT = 70;
const DEFAULT_INFRASTRUCTURE_READINESS = 60;
const DEFAULT_TAX_RATE = 25;
const DEFAULT_STIMULUS_RATE = 2;
const PEOPLE_PER_IMMIGRATION_PERCENT = 100_000;
const AVERAGE_HOUSEHOLD_SIZE = 2.5;
const BASE_HOUSING_STRESS = 30;
const BASE_ECONOMIC_GROWTH = 2;
const IMMIGRATION_GROWTH_PER_PERCENT = 0.5;
const TAX_GROWTH_DRAG_PER_PERCENT = 0.05;
const STIMULUS_GROWTH_PER_PERCENT = 0.2;
const BASE_GOVERNMENT_REVENUE = 600;
const BASE_GOVERNMENT_SPENDING = 620;
const TAX_REVENUE_PER_PERCENT = 6;
const GROWTH_REVENUE_PER_PERCENT = 20;
const STIMULUS_SPENDING_PER_PERCENT = 15;

type DebtPressure = 'Low' | 'Medium' | 'High';
type FinanceRating = 'Strong' | 'Improving' | 'Stable' | 'Weak' | 'Stressed';

type WellbeingFactor = {
  name: string;
  score: number;
  explanation: string;
};

type SliderProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  valueFormatter?: (value: number) => string;
  onChange: (value: number) => void;
};

type PanelProps = {
  title: string;
  children: ReactNode;
};

type OutcomeCardProps = {
  label: string;
  value: string;
  status?: string;
  explanation: string;
};

function formatNumber(value: number) {
  return new Intl.NumberFormat('en-AU').format(Math.round(value));
}

function formatMoney(value: number) {
  return `$${value.toFixed(0)}b`;
}

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function getCapacityStatus(score: number) {
  if (score < 40) return 'Low';
  if (score <= 70) return 'Medium';
  return 'High';
}

function getDebtPressure(balance: number): DebtPressure {
  if (balance >= 0) return 'Low';
  if (balance > -80) return 'Medium';
  return 'High';
}

function getFinanceRating(balance: number, debtPressure: DebtPressure): FinanceRating {
  if (balance < -80 || debtPressure === 'High') return 'Stressed';
  if (balance > 20 && debtPressure === 'Low') return 'Strong';
  if (balance > 20 && debtPressure === 'Medium') return 'Improving';
  if (balance >= -20 && balance <= 20) return 'Stable';
  if (balance >= -80 && balance < -20) return 'Weak';
  return 'Stressed';
}

function getFinanceExplanation(rating: FinanceRating, balance: number, debtPressure: DebtPressure) {
  if (rating === 'Strong') {
    return 'Government finances are rated Strong because the budget is in surplus and debt pressure is low.';
  }
  if (rating === 'Improving') {
    return 'Government finances are rated Improving because the budget is in surplus, although debt pressure is still medium.';
  }
  if (rating === 'Stable') {
    return 'Government finances are rated Stable because the budget is near break-even.';
  }
  if (rating === 'Weak') {
    return 'Government finances are rated Weak because the budget remains in deficit.';
  }
  if (balance < -80) {
    return 'Government finances are rated Stressed because the budget deficit is strongly negative.';
  }
  return `Government finances are rated Stressed because debt pressure is ${debtPressure.toLowerCase()}.`;
}

function getTone(score: number) {
  if (score >= 70) return 'Positive';
  if (score >= 45) return 'Neutral';
  return 'Negative';
}

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

  const results = useMemo(() => {
    // Population module: future versions may move population growth logic into a Population module.
    const immigrationPopulationIncrease = immigrationRate * PEOPLE_PER_IMMIGRATION_PERCENT;
    const projectedPopulation = BASE_POPULATION + immigrationPopulationIncrease;

    // Housing module: future versions may move housing demand and stress logic into a Housing module.
    const housingBuildCapacityRate = clamp((housingBuildRate / 350_000) * 5, 0, 5);
    const housingBuildCapacityScore = clamp((housingBuildCapacityRate / 5) * 100, 0, 100);
    const housingDemand = immigrationPopulationIncrease / AVERAGE_HOUSEHOLD_SIZE;
    const housingGap = housingDemand - housingBuildRate;
    const immigrationHousingRateGap = immigrationRate - housingBuildCapacityRate;

    // Migration module: future versions may move integration, skills, infrastructure and capacity into a Migration module.
    const absorptiveCapacityScore =
      (housingBuildCapacityScore +
        integrationEffectiveness +
        skillsAlignment +
        infrastructureReadiness) /
      4;
    const absorptiveCapacityStatus = getCapacityStatus(absorptiveCapacityScore);

    const housingStress = clamp(
      BASE_HOUSING_STRESS +
        Math.max(0, immigrationHousingRateGap) * 10 +
        Math.max(0, -immigrationHousingRateGap) * -4 +
        (100 - infrastructureReadiness) * 0.18,
      0,
      100,
    );

    const integrationMultiplier = (integrationEffectiveness + skillsAlignment) / 200;
    const immigrationGrowthBoost =
      immigrationRate * IMMIGRATION_GROWTH_PER_PERCENT * integrationMultiplier;
    const stimulusGrowthBoost = stimulusRate * STIMULUS_GROWTH_PER_PERCENT;
    const taxGrowthDrag = taxRate * TAX_GROWTH_DRAG_PER_PERCENT;
    const housingGrowthDrag = housingStress * 0.01;
    const economicGrowth = clamp(
      BASE_ECONOMIC_GROWTH +
        immigrationGrowthBoost +
        stimulusGrowthBoost -
        taxGrowthDrag -
        housingGrowthDrag,
      -5,
      8,
    );

    // Government finance module: future versions may move revenue, spending and rating logic into a Government finance module.
    const taxRevenueBoost = taxRate * TAX_REVENUE_PER_PERCENT;
    const growthRevenueBoost = Math.max(0, economicGrowth) * GROWTH_REVENUE_PER_PERCENT;
    const integrationSkillsRevenueBoost =
      ((integrationEffectiveness + skillsAlignment) / 2 - 50) * 2;
    const governmentRevenue =
      BASE_GOVERNMENT_REVENUE +
      taxRevenueBoost +
      growthRevenueBoost +
      integrationSkillsRevenueBoost;
    const stimulusSpendingBoost = stimulusRate * STIMULUS_SPENDING_PER_PERCENT;
    const integrationSupportCosts = Math.max(0, 70 - integrationEffectiveness) * 2;
    const infrastructureSpendingPressure = Math.max(0, 70 - infrastructureReadiness) * 2;
    const governmentSpending =
      BASE_GOVERNMENT_SPENDING +
      stimulusSpendingBoost +
      integrationSupportCosts +
      infrastructureSpendingPressure;
    const budgetBalance = governmentRevenue - governmentSpending;
    const debtPressure = getDebtPressure(budgetBalance);
    const financeRating = getFinanceRating(budgetBalance, debtPressure);
    const financeExplanation = getFinanceExplanation(financeRating, budgetBalance, debtPressure);
    const financeStabilityScore =
      financeRating === 'Strong'
        ? 88
        : financeRating === 'Improving'
          ? 76
          : financeRating === 'Stable'
            ? 68
            : financeRating === 'Weak'
              ? 52
              : 34;

    const socialCohesionScore = clamp(
      integrationEffectiveness * 0.25 +
        infrastructureReadiness * 0.2 +
        absorptiveCapacityScore * 0.2 +
        (100 - housingStress) * 0.2 +
        financeStabilityScore * 0.15,
      0,
      100,
    );

    // Wellbeing module: future versions may expand, reweight or replace these factors.
    const wellbeingFactors: WellbeingFactor[] = [
      {
        name: 'Housing Affordability',
        score: clamp(100 - housingStress * 0.9, 0, 100),
        explanation:
          housingGap > 0
            ? 'Affordability falls because estimated housing demand is above construction.'
            : 'Affordability improves because construction is meeting estimated housing demand.',
      },
      {
        name: 'Economic Confidence',
        score: clamp(50 + economicGrowth * 10, 0, 100),
        explanation: `Confidence rises when growth is higher. Current growth is ${formatPercent(
          economicGrowth,
        )}.`,
      },
      {
        name: 'Government Stability',
        score: financeStabilityScore,
        explanation: financeExplanation,
      },
      {
        name: 'Environmental Quality',
        score: clamp(
          82 - stimulusRate * 1.2 - Math.max(0, economicGrowth - BASE_ECONOMIC_GROWTH) * 2,
          0,
          100,
        ),
        explanation:
          'Environmental quality falls slightly when stimulus and growth are high because activity pressure rises.',
      },
      {
        name: 'Tax Burden',
        score: clamp(100 - taxRate * 1.2, 0, 100),
        explanation: `Tax burden falls as tax rates rise. The current tax rate is ${formatPercent(
          taxRate,
        )}.`,
      },
      {
        name: 'Social Cohesion',
        score: socialCohesionScore,
        explanation:
          'Social cohesion reflects integration, infrastructure, housing stress, finance pressure and absorptive capacity.',
      },
      {
        name: 'Social Pressure',
        score: clamp(
          82 -
            housingStress * 0.3 -
            (100 - absorptiveCapacityScore) * 0.18 -
            (debtPressure === 'High' ? 14 : debtPressure === 'Medium' ? 7 : 0),
          0,
          100,
        ),
        explanation:
          housingStress > 45 || absorptiveCapacityStatus === 'Low' || debtPressure !== 'Low'
            ? 'Social pressure rises when housing, capacity or government finances are strained.'
            : 'Social pressure eases when housing, capacity and government finances are more stable.',
      },
    ];
    const wellbeingScore =
      wellbeingFactors.reduce((total, factor) => total + factor.score, 0) /
      wellbeingFactors.length;

    // Explanation engine: future versions may move driver and trade-off selection into an Explanation engine.
    const positiveDrivers = [
      economicGrowth > BASE_ECONOMIC_GROWTH
        ? 'Economic growth improved due to immigration, skills alignment and government stimulus.'
        : 'Economic growth is being held close to baseline by tax, housing stress or weak capacity.',
      absorptiveCapacityScore >= 70
        ? 'Absorptive capacity is high, so population growth is easier to absorb.'
        : 'Some capacity settings are limiting the benefits of migration.',
      financeRating === 'Strong' || financeRating === 'Improving'
        ? 'Government finances are improving because revenue is above spending.'
        : 'Government finances are not yet a strong positive driver.',
    ].filter((driver) => !driver.includes('not yet') && !driver.includes('held close'));

    const negativeDrivers = [
      housingGap > 0
        ? 'Housing stress increased because estimated housing demand is above the build rate.'
        : 'Housing supply is reducing pressure in this scenario.',
      debtPressure === 'High' || financeRating === 'Stressed'
        ? 'Government finances are under stress because the deficit is large.'
        : 'Debt pressure is not the main negative driver in this scenario.',
      absorptiveCapacityStatus === 'Low'
        ? 'Low absorptive capacity is weakening social cohesion and wellbeing.'
        : 'Absorptive capacity is not severely constraining the model.',
    ].filter((driver) => !driver.includes('not the main') && !driver.includes('not severely') && !driver.includes('reducing'));

    const tradeOffs = [
      'Higher tax improves government revenue but slightly reduces growth and the tax burden score.',
      'Government stimulus supports growth but increases spending and can worsen the budget balance.',
      'Higher immigration can lift growth, but it increases housing demand unless build capacity and services keep pace.',
    ];

    return {
      projectedPopulation,
      immigrationPopulationIncrease,
      housingBuildCapacityRate,
      housingBuildCapacityScore,
      housingDemand,
      housingGap,
      immigrationHousingRateGap,
      absorptiveCapacityScore,
      absorptiveCapacityStatus,
      housingStress,
      integrationMultiplier,
      immigrationGrowthBoost,
      stimulusGrowthBoost,
      taxGrowthDrag,
      housingGrowthDrag,
      economicGrowth,
      taxRevenueBoost,
      growthRevenueBoost,
      integrationSkillsRevenueBoost,
      stimulusSpendingBoost,
      integrationSupportCosts,
      infrastructureSpendingPressure,
      governmentRevenue,
      governmentSpending,
      budgetBalance,
      debtPressure,
      financeRating,
      financeExplanation,
      socialCohesionScore,
      wellbeingFactors,
      wellbeingScore,
      positiveDrivers: positiveDrivers.length
        ? positiveDrivers
        : ['No strong positive driver is dominant in this scenario.'],
      negativeDrivers: negativeDrivers.length
        ? negativeDrivers
        : ['No severe negative driver is dominant in this scenario.'],
      tradeOffs,
    };
  }, [
    housingBuildRate,
    immigrationRate,
    infrastructureReadiness,
    integrationEffectiveness,
    skillsAlignment,
    stimulusRate,
    taxRate,
  ]);

  const housingStressStatus =
    results.housingStress < 25 ? 'Low' : results.housingStress < 45 ? 'Medium' : 'High';
  const wellbeingStatus =
    results.wellbeingScore >= 70 ? 'Positive' : results.wellbeingScore >= 45 ? 'Mixed' : 'Negative';
  const capacityEnough =
    results.absorptiveCapacityScore >= 70
      ? 'current absorptive capacity is strong enough to support the setting.'
      : results.absorptiveCapacityScore >= 40
        ? 'absorptive capacity is mixed, so benefits depend on housing and services keeping pace.'
        : 'absorptive capacity is low, so migration benefits are harder to realise.';

  return (
    <main className="app-shell">
      <header className="page-header">
        <p className="eyebrow">Version 0.2</p>
        <h1>Australia Policy Simulator</h1>
        <p>A simple prototype for exploring policy trade-offs, assumptions and unintended consequences.</p>
        <span>Illustrative only - not a forecast.</span>
      </header>

      <section className="section-block">
        <h2>Policy Areas</h2>
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
              {formatNumber(results.immigrationPopulationIncrease)} people and creates demand for{' '}
              {formatNumber(results.housingDemand)} homes. It contributes{' '}
              {formatPercent(results.immigrationGrowthBoost)} to growth after capacity settings are
              considered, and {capacityEnough}
            </InfoBox>

            <details className="advanced-panel">
              <summary>Advanced migration assumptions</summary>
              <PolicySlider
                label="Integration Effectiveness"
                value={integrationEffectiveness}
                min={0}
                max={100}
                step={1}
                unit="employment, language, community, and civic participation"
                onChange={setIntegrationEffectiveness}
              />
              <InfoBox>
                Integration affects employment, tax revenue, social cohesion and support costs.
                Current support costs are about {formatMoney(results.integrationSupportCosts)}.
              </InfoBox>
              <PolicySlider
                label="Skills Alignment"
                value={skillsAlignment}
                min={0}
                max={100}
                step={1}
                unit="match to labour shortages"
                onChange={setSkillsAlignment}
              />
              <InfoBox>
                Skills alignment affects productivity, workforce shortages, wages and tax revenue.
                Skills and integration add about{' '}
                {formatMoney(results.integrationSkillsRevenueBoost)} to revenue.
              </InfoBox>
              <PolicySlider
                label="Infrastructure Readiness"
                value={infrastructureReadiness}
                min={0}
                max={100}
                step={1}
                unit="schools, hospitals, roads, transport and services"
                onChange={setInfrastructureReadiness}
              />
              <InfoBox>
                Infrastructure readiness affects congestion, public services, spending pressure and
                social cohesion. Current spending pressure is about{' '}
                {formatMoney(results.infrastructureSpendingPressure)}.
              </InfoBox>
              <MetricStrip
                items={[
                  ['Absorptive Capacity Score', results.absorptiveCapacityScore.toFixed(1)],
                  ['Absorptive Capacity Status', results.absorptiveCapacityStatus],
                ]}
              />
            </details>
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
              At {formatNumber(housingBuildRate)} homes per year, housing supply is compared with
              demand of {formatNumber(results.housingDemand)} homes. Housing stress is currently{' '}
              {formatPercent(results.housingStress)}.
            </InfoBox>
            <details className="advanced-panel">
              <summary>Advanced housing assumptions</summary>
              <p>
                More housing assumptions can be added later, such as zoning flexibility,
                construction workforce and land release.
              </p>
            </details>
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
            <InfoBox>
              At {formatPercent(taxRate)}, tax adds about {formatMoney(results.taxRevenueBoost)} to
              revenue but reduces growth by about {formatPercent(results.taxGrowthDrag)} points.
            </InfoBox>
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
              At {formatPercent(stimulusRate)}, stimulus adds{' '}
              {formatPercent(results.stimulusGrowthBoost)} to growth and{' '}
              {formatMoney(results.stimulusSpendingBoost)} to spending.
            </InfoBox>
            <details className="advanced-panel">
              <summary>Advanced government assumptions</summary>
              <ul>
                <li>Base government revenue: {formatMoney(BASE_GOVERNMENT_REVENUE)}</li>
                <li>Base government spending: {formatMoney(BASE_GOVERNMENT_SPENDING)}</li>
                <li>
                  Finance rating: surplus above $20b can be Strong or Improving, break-even is
                  Stable, deficits from $20b to $80b are Weak, and larger deficits or high debt
                  pressure are Stressed.
                </li>
              </ul>
            </details>
          </PolicyCard>
        </div>
      </section>

      <section className="section-block">
        <h2>National Outcomes</h2>
        <div className="outcome-grid">
          <OutcomeCard
            label="Population"
            value={formatNumber(results.projectedPopulation)}
            explanation={`Immigration adds ${formatNumber(results.immigrationPopulationIncrease)} people in this model.`}
          />
          <OutcomeCard
            label="Housing Stress"
            value={formatPercent(results.housingStress)}
            status={housingStressStatus}
            explanation={
              results.housingGap > 0
                ? 'Demand is above the build rate, so pressure rises.'
                : 'The build rate is keeping up with estimated demand.'
            }
          />
          <OutcomeCard
            label="Economic Growth"
            value={formatPercent(results.economicGrowth)}
            explanation="Growth reflects migration capacity, stimulus, tax and housing pressure."
          />
          <OutcomeCard
            label="Government Finances"
            value={results.financeRating}
            status={`Balance ${formatMoney(results.budgetBalance)}`}
            explanation={results.financeExplanation}
          />
          <OutcomeCard
            label="Social Cohesion"
            value={results.socialCohesionScore.toFixed(1)}
            explanation="Cohesion reflects integration, infrastructure, housing, finances and capacity."
          />
          <OutcomeCard
            label="Overall Wellbeing"
            value={results.wellbeingScore.toFixed(1)}
            status={wellbeingStatus}
            explanation="Overall wellbeing is the average of the factor scores below."
          />
        </div>
      </section>

      <section className="section-block">
        <h2>Wellbeing Breakdown</h2>
        <div className="factor-list">
          {results.wellbeingFactors.map((factor) => (
            <article className="factor-card" key={factor.name}>
              <div>
                <strong>{factor.name}</strong>
                <p>{factor.explanation}</p>
              </div>
              <div className="factor-score">
                <span>{factor.score.toFixed(1)}</span>
                <small>{getTone(factor.score)}</small>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section-block">
        <h2>Why did this happen?</h2>
        <div className="explanation-grid">
          <ExplanationList title="Top positive drivers" items={results.positiveDrivers} />
          <ExplanationList title="Top negative drivers" items={results.negativeDrivers} />
          <ExplanationList title="Key trade-offs" items={results.tradeOffs} />
        </div>
      </section>

      <section className="details-grid">
        <Panel title="Transparent Calculations">
          <ul>
            <li>
              Population = {formatNumber(BASE_POPULATION)} + ({formatPercent(immigrationRate)} x{' '}
              {formatNumber(PEOPLE_PER_IMMIGRATION_PERCENT)}) ={' '}
              {formatNumber(results.projectedPopulation)}.
            </li>
            <li>
              Absorptive capacity = average of housing capacity, integration, skills and
              infrastructure = {results.absorptiveCapacityScore.toFixed(1)}.
            </li>
            <li>
              Economic growth = base {formatPercent(BASE_ECONOMIC_GROWTH)} + migration{' '}
              {formatPercent(results.immigrationGrowthBoost)} + stimulus{' '}
              {formatPercent(results.stimulusGrowthBoost)} - tax{' '}
              {formatPercent(results.taxGrowthDrag)} - housing stress{' '}
              {formatPercent(results.housingGrowthDrag)} = {formatPercent(results.economicGrowth)}.
            </li>
            <li>
              Revenue {formatMoney(results.governmentRevenue)} - spending{' '}
              {formatMoney(results.governmentSpending)} = budget balance{' '}
              {formatMoney(results.budgetBalance)}.
            </li>
          </ul>
        </Panel>

        <Panel title="Assumptions">
          <ul>
            <li>Each 1% immigration adds {formatNumber(PEOPLE_PER_IMMIGRATION_PERCENT)} people.</li>
            <li>Housing build rate is converted into a 0 to 100 capacity score.</li>
            <li>High integration and skills alignment increase migration benefits and revenue.</li>
            <li>Low infrastructure readiness worsens housing stress and spending pressure.</li>
            <li>All results are illustrative only and are not forecasts.</li>
          </ul>
        </Panel>
      </section>
    </main>
  );
}

function PolicyCard({ title, children }: PanelProps) {
  return (
    <article className="policy-card">
      <h3>{title}</h3>
      {children}
    </article>
  );
}

function Panel({ title, children }: PanelProps) {
  return (
    <section className="assumptions">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

function InfoBox({ children }: { children: ReactNode }) {
  return (
    <aside className="info-box">
      <p>{children}</p>
    </aside>
  );
}

function MetricStrip({ items }: { items: [string, string][] }) {
  return (
    <div className="metric-strip">
      {items.map(([label, value]) => (
        <div key={label}>
          <span>{label}</span>
          <strong>{value}</strong>
        </div>
      ))}
    </div>
  );
}

function OutcomeCard({ label, value, status, explanation }: OutcomeCardProps) {
  return (
    <article className="output-card">
      <p>{label}</p>
      <strong>{value}</strong>
      {status ? <em>{status}</em> : null}
      <span>{explanation}</span>
    </article>
  );
}

function ExplanationList({ title, items }: { title: string; items: string[] }) {
  return (
    <article className="assumptions explanation-panel">
      <h2>{title}</h2>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </article>
  );
}

function PolicySlider({
  label,
  value,
  min,
  max,
  step,
  unit,
  valueFormatter = formatNumber,
  onChange,
}: SliderProps) {
  return (
    <label className="slider-block">
      <span className="slider-header">
        <span>{label}</span>
        <strong>{valueFormatter(value)}</strong>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <span className="slider-footer">
        <span>{valueFormatter(min)}</span>
        <span>{unit}</span>
        <span>{valueFormatter(max)}</span>
      </span>
    </label>
  );
}
