import { useMemo, useState } from "react";
import { IssueBrief } from "../IssueBrief";
import { housingOwnershipSection, housingPilotSettingsSection } from "../programmes/routes";
import { HomeOwnershipExample } from "./HomeOwnershipExample";
import { HousingWorkedExample } from "./HousingWorkedExample";
import { visionPriorities, type CountryVisionValue, type VisionPriority } from "../vision";
import {
  housingDownturns,
  housingRentResponses,
  housingSupportTakeUp,
  runHousingPilot,
  type HousingPilotSettings,
  type HousingPilotYear,
} from "./model";

const number = new Intl.NumberFormat("en-AU", { maximumFractionDigits: 0 });
const money = (amount: number) => `${amount < 0 ? "−" : ""}A$${number.format(Math.abs(amount))}`;
const publicCost = (billions: number) => number.format(billions * 1_000);

const cohortMetrics = [
  { key: "annualAfterHousingIncome", label: "Income after housing", unit: "A$ per household per year" },
  { key: "housingBurdenPercent", label: "Housing burden", unit: "% of disposable income" },
  { key: "annualHousingCosts", label: "Housing costs after support", unit: "A$ per household per year" },
  { key: "annualDisposableIncome", label: "Disposable income before support", unit: "A$ per household per year" },
  { key: "annualRentalSupport", label: "Additional rental support", unit: "A$ per household per year" },
] as const;

const costLines = [
  { key: "commonwealthOperating", label: "Commonwealth · rental support" },
  { key: "stateCapital", label: "States and territories · capital" },
  { key: "localCapital", label: "Councils · capital" },
  { key: "total", label: "Total additional public cost" },
] as const;

type CostPeriod = "annual" | "cumulative";
type HouseholdMetric = (typeof cohortMetrics)[number]["key"];
type HouseholdComparison = "baseline" | "no-downturn";

interface HousingPilotProps {
  vision: CountryVisionValue;
  settings: HousingPilotSettings;
  year: number;
  onSettingsChange: (settings: HousingPilotSettings) => void;
  onYearChange: (year: number) => void;
}

const priorityMetrics: Partial<Record<VisionPriority, HouseholdMetric>> = {
  prosperity: "annualAfterHousingIncome",
  security: "housingBurdenPercent",
  fairness: "annualHousingCosts",
};

function formatHouseholdValue(metric: HouseholdMetric, amount: number) {
  return metric === "housingBurdenPercent" ? `${amount.toFixed(1)}%` : money(amount);
}

function formatHouseholdDifference(metric: HouseholdMetric, amount: number) {
  const isPercent = metric === "housingBurdenPercent";
  const rounded = isPercent ? Math.round(Math.abs(amount) * 100) / 100 : Math.round(Math.abs(amount));
  const sign = rounded === 0 ? "" : amount > 0 ? "+" : "−";
  return `${sign}${isPercent ? `${rounded.toFixed(2)} pp` : money(rounded)}`;
}

function formatHomeDifference(change: number) {
  return change === 0 ? "Same as no downturn" : `${change > 0 ? "+" : "−"}${number.format(Math.abs(change))} vs no downturn`;
}

export function HousingPilot({ vision, settings, year, onSettingsChange, onYearChange }: HousingPilotProps) {
  const { rentResponse, supportTakeUp } = settings;
  const result = useMemo(() => runHousingPilot(settings), [settings]);
  const ordinary = useMemo(() => runHousingPilot({ downturn: "none", rentResponse, supportTakeUp }), [rentResponse, supportTakeUp]);
  const { assumptions, baselineYear, scenarios } = result;
  const priority = [vision.primary, vision.secondary].find((item) => item && priorityMetrics[item]);
  const priorityMetric = priority ? priorityMetrics[priority] : undefined;
  const [metric, setMetric] = useState<HouseholdMetric>(priorityMetric ?? "annualAfterHousingIncome");
  const [costPeriod, setCostPeriod] = useState<CostPeriod>("annual");
  const [comparison, setComparison] = useState<HouseholdComparison>("baseline");
  const yearOptions = scenarios[0].years;
  const yearIndex = yearOptions.findIndex((option) => option.year === year);
  const baseline = yearOptions[yearIndex];
  const hasDownturn = settings.downturn !== "none";
  const downturnActive = baseline.downturn.unemploymentIncreasePp > 0;
  const showOrdinaryDifference = hasDownturn && comparison === "no-downturn";
  const choice = cohortMetrics.find((option) => option.key === metric)!;

  function updateSetting<Key extends keyof HousingPilotSettings>(key: Key, value: HousingPilotSettings[Key]) {
    onSettingsChange({ ...settings, [key]: value });
  }

  function costFor(years: HousingPilotYear[], key: keyof HousingPilotYear["publicCosts"]) {
    const row = years[yearIndex];
    return (costPeriod === "annual" ? row.publicCosts : row.cumulativePublicCosts)[key];
  }

  return (
    <section id="housing-pilot" aria-labelledby="issue-brief-title" className="housing-pilot">
      <IssueBrief id="affordable-housing" simulationId={housingOwnershipSection} simulationLabel="Explore buying near work" interventionHeading="What could improve housing security">
        <a href={`#${housingPilotSettingsSection}`}>Compare supply and rent support</a>
      </IssueBrief>
      <HomeOwnershipExample />
      <header className="panel pilot-intro" id={housingPilotSettingsSection}>
        <div className="pilot-intro-heading">
          <div>
            <h2 tabIndex={-1}>Housing supply and rental support pilot</h2>
            <p>All three packages start from the June {baselineYear} reference and face the same economic conditions. The baseline keeps the model’s reference housing settings.</p>
          </div>
        </div>
        <div className="pilot-settings" aria-label="Housing scenario settings">
          <div className="year-select">
            <label htmlFor="pilot-downturn">Economic conditions</label>
            <select id="pilot-downturn" value={settings.downturn} onChange={(event) => updateSetting("downturn", event.target.value as HousingPilotSettings["downturn"])}>
              {Object.entries(housingDownturns).map(([key, value]) => <option key={key} value={key}>{value.label}</option>)}
            </select>
          </div>
          <div className="year-select">
            <label htmlFor="pilot-rent-response">Rent response to supply</label>
            <select id="pilot-rent-response" value={settings.rentResponse} onChange={(event) => updateSetting("rentResponse", event.target.value as HousingPilotSettings["rentResponse"])}>
              {Object.entries(housingRentResponses).map(([key, value]) => <option key={key} value={key}>{value.label} · {value.coefficient.toFixed(1)}</option>)}
            </select>
          </div>
          <div className="year-select">
            <label htmlFor="pilot-support-takeup">Rental support take-up</label>
            <select id="pilot-support-takeup" value={settings.supportTakeUp} onChange={(event) => updateSetting("supportTakeUp", event.target.value as HousingPilotSettings["supportTakeUp"])}>
              {Object.entries(housingSupportTakeUp).map(([key, value]) => <option key={key} value={key}>{value.label} · {Math.round(value.rate * 100)}%</option>)}
            </select>
          </div>
          <div className="year-select">
            <label htmlFor="pilot-year">Year for detailed results</label>
            <select id="pilot-year" aria-describedby="pilot-year-scope" value={year} onChange={(event) => onYearChange(Number(event.target.value))}>
              {yearOptions.map((option) => <option key={option.year} value={option.year}>Year {option.year - baselineYear} · {option.year}{option.downturn.unemploymentIncreasePp > 0 ? " · Downturn" : ""}</option>)}
            </select>
          </div>
        </div>
        <p id="pilot-year-scope" className="table-note">The selected year controls the economic snapshot and detailed results. The worked example always uses year 5.</p>
        <dl className="pilot-shock">
          <div><dt>Shared economic conditions in {year}</dt><dd>{!hasDownturn ? "Ordinary conditions" : downturnActive ? "Downturn" : year < assumptions.downturnStartYear ? "Before downturn" : "After downturn"}</dd></div>
          <div><dt>Unemployment rate</dt><dd>{baseline.unemploymentRate.toFixed(1)}%</dd></div>
          <div><dt>Available construction capacity</dt><dd>{Math.round(baseline.downturn.constructionCapacityFactor * 100)}% of usual capacity</dd></div>
        </dl>
      </header>

      <HousingWorkedExample result={result} />

      <div className="pilot-scenarios" aria-label={`Housing package results for ${year}`}>
        {scenarios.map((scenario, scenarioIndex) => {
          const row = scenario.years[yearIndex];
          const ordinaryYear = ordinary.scenarios[scenarioIndex].years[yearIndex];
          return (
            <article key={scenario.id} className={`panel pilot-scenario pilot-scenario--${scenario.id}`}>
              <h3>{scenario.label}</h3>
              <p>{scenario.description}</p>
              <dl>
                <div><dt>Net dwellings added</dt><dd>{number.format(row.netAdditions)}{hasDownturn && <small>{formatHomeDifference(row.netAdditions - ordinaryYear.netAdditions)}</small>}</dd></div>
                <div><dt>Weekly market rent proxy</dt><dd>{money(row.weeklyMarketRent)}</dd></div>
                <div><dt>Additional homes delivered by the package</dt><dd>{number.format(row.additionalDwellingsDelivered)}</dd></div>
                <div><dt>Funded homes awaiting delivery</dt><dd>{number.format(row.additionalDwellingsPending)}{hasDownturn && row.additionalDwellingsPending !== ordinaryYear.additionalDwellingsPending && <small>{formatHomeDifference(row.additionalDwellingsPending - ordinaryYear.additionalDwellingsPending)}</small>}</dd></div>
              </dl>
            </article>
          );
        })}
      </div>

      <section className="panel pilot-results" aria-labelledby="pilot-households-title">
        <div className="pilot-result-heading">
          <div>
            <h3 id="pilot-households-title">Household impacts in {year}</h3>
            <p>{showOrdinaryDifference ? "Differences compare each package with the same package and year under no downturn." : "Differences compare each package with the baseline package in the same year."}</p>
            {priority && <p className="pilot-priority">Starting measure based on your <a href="#country-vision">{visionPriorities[priority].label.toLowerCase()} priority</a>.</p>}
          </div>
          <div className="pilot-result-settings">
            <div className="year-select">
              <label htmlFor="pilot-household-metric">Household measure</label>
              <select id="pilot-household-metric" value={metric} onChange={(event) => setMetric(event.target.value as HouseholdMetric)}>
                {cohortMetrics.map((option) => <option key={option.key} value={option.key}>{option.label}</option>)}
              </select>
            </div>
            {hasDownturn && (
              <div className="year-select">
                <label htmlFor="pilot-household-comparison">Compare household changes with</label>
                <select id="pilot-household-comparison" value={comparison} onChange={(event) => setComparison(event.target.value as HouseholdComparison)}>
                  <option value="baseline">Baseline package</option>
                  <option value="no-downturn">Same package with no downturn</option>
                </select>
              </div>
            )}
          </div>
        </div>
        <div className="table-wrap pilot-table" role="region" aria-label="Household impacts table" tabIndex={0}>
          <table>
            <caption>{choice.label} · {choice.unit}</caption>
            <thead>
              <tr><th scope="col">Income and tenure</th>{scenarios.map((scenario) => <th scope="col" key={scenario.id}>{scenario.label}</th>)}</tr>
            </thead>
            <tbody>
              {baseline.cohorts.map((cohort, cohortIndex) => (
                <tr key={cohort.id}>
                  <th scope="row">{cohort.income} income<small className="pilot-tenure">{cohort.tenure}</small></th>
                  {scenarios.map((scenario, scenarioIndex) => {
                    const amount = scenario.years[yearIndex].cohorts[cohortIndex][metric];
                    const reference = showOrdinaryDifference ? ordinary.scenarios[scenarioIndex].years[yearIndex].cohorts[cohortIndex] : cohort;
                    const difference = amount - reference[metric];
                    return (
                      <td key={scenario.id}>
                        <span>{formatHouseholdValue(metric, amount)}</span>
                        {(showOrdinaryDifference || scenario.id !== "baseline") && (
                          <small className="pilot-difference">{formatHouseholdDifference(metric, difference)}<span className="sr-only">{showOrdinaryDifference ? " compared with no downturn" : " compared with baseline"}</span></small>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="table-note">The rows show example households, including an eligible lower-income private renter who receives the full top-up in the rental support package. Housing burden divides housing costs after support by disposable income before support. Dollar figures are nominal.</p>
      </section>

      <section className="panel pilot-results" aria-labelledby="pilot-costs-title">
        <div className="pilot-result-heading">
          <div>
            <h3 id="pilot-costs-title">Public costs</h3>
            <p>Additional programme spending by level of government, relative to the baseline package.</p>
          </div>
          <div className="year-select">
            <label htmlFor="pilot-cost-period">Cost period</label>
            <select id="pilot-cost-period" value={costPeriod} onChange={(event) => setCostPeriod(event.target.value as CostPeriod)}>
              <option value="annual">Year ending June {year}</option>
              <option value="cumulative">Total through June {year}</option>
            </select>
          </div>
        </div>
        <div className="table-wrap pilot-table pilot-cost-table" role="region" aria-label="Public costs table" tabIndex={0}>
          <table>
            <caption>{costPeriod === "annual" ? `Year ending June ${year}` : `Years ending June ${yearOptions[0].year} to ${year}`} · nominal A$ millions</caption>
            <thead><tr><th scope="col">Spending</th>{scenarios.map((scenario) => <th scope="col" key={scenario.id}>{scenario.label}</th>)}</tr></thead>
            <tbody>
              {costLines.map(({ key, label }) => (
                <tr key={key} className={key === "total" ? "pilot-total" : undefined}>
                  <th scope="row">{label}</th>
                  {scenarios.map((scenario) => <td key={scenario.id}>{publicCost(costFor(scenario.years, key))}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="table-note">Capital is paid when work is funded and stays fixed across downturn assumptions. Rental support take-up changes operating costs. These figures cover additional programme outlays and exclude existing spending, public debt servicing, offsets and private construction costs. Totals are rounded.</p>
      </section>

      <details className="panel pilot-method">
        <summary>Housing pilot assumptions</summary>
        <dl className="pilot-method-list">
          <div><dt>Common economic conditions</dt><dd>{hasDownturn ? `From ${assumptions.downturnStartYear} to ${assumptions.downturnEndYear}, unemployment is ${housingDownturns[settings.downturn].unemploymentIncreasePp} percentage points higher and tighter finance reduces construction capacity to ${Math.round(housingDownturns[settings.downturn].constructionCapacityFactor * 100)}% of usual. Afterward, recovery capacity is up to ${Math.round(assumptions.recoveryCapacityFactor * 100)}% of usual while deferred construction catches up.` : "The ordinary case uses the reference unemployment path and usual construction capacity throughout."}</dd></div>
          <div><dt>Supply and funding</dt><dd>The baseline uses {assumptions.baselineStockGrowthPercent.toFixed(2)}% annual net stock growth at normal capacity. Both supply packages fund enabling works for {number.format(assumptions.additionalDwellingsFundedPerYear)} extra homes per year, with at least {assumptions.deliveryLagYears} years before delivery. The upfront amounts are {money(assumptions.stateCapitalPerDwelling)} from states and territories and {money(assumptions.localCapitalPerDwelling)} from councils per funded dwelling. That additional supply has its own delivery queue. Displacement of other construction is outside the model.</dd></div>
          <div><dt>Rental support</dt><dd>The Commonwealth funds {money(assumptions.weeklyRentalSupport)} per week for eligible, participating lower-income private renters. The aggregate cost assumes {Math.round(assumptions.eligibleHouseholdShare * 100)}% of households are eligible and {Math.round(housingSupportTakeUp[settings.supportTakeUp].rate * 100)}% of eligible households take it up.</dd></div>
          <div><dt>Household examples</dt><dd>Starting annual disposable incomes are {assumptions.incomeProfiles.map((profile) => money(profile.disposableIncome)).join(", ")} for the lower, middle and higher examples. Incomes follow the earnings proxy with a larger downturn loss at lower incomes. Mortgages use a fixed {assumptions.mortgageInterestPercent}% rate over {assumptions.mortgageTermYears} years. The pilot covers private renters, mortgage holders and outright owners. Public and social housing tenants are outside its cohort model.</dd></div>
          <div><dt>Rent response</dt><dd>Market rent follows the main simulator’s earnings proxy and the stock-to-household gap with the selected illustrative coefficient of {housingRentResponses[settings.rentResponse].coefficient.toFixed(1)}. Market-rent pass-through from rental support and changes in household formation are outside the pilot.</dd></div>
        </dl>
        <p><a href="#housing-evidence-register">Inspect sources, settings and evidence limits</a></p>
      </details>
    </section>
  );
}
