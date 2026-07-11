import { useEffect, useMemo, useState } from 'react';
import {
  IMMIGRATION_ASSUMPTION_DEFINITIONS,
  IMMIGRATION_CAUSE_EFFECT_MAP,
  IMMIGRATION_ENTITIES,
  IMMIGRATION_EXPLAINER,
  IMMIGRATION_SCENARIO_PRESETS,
  IMMIGRATION_START_YEAR,
  TOPIC_INTRODUCTION,
  formatAssumptionValue,
  runImmigrationScenario,
  type ImmigrationAssumptions,
  type ImmigrationScenarioId,
} from '../../topics/immigration';

function formatNumber(value: number) {
  return Math.round(value).toLocaleString('en-AU');
}

function formatIndex(value: number) {
  return value.toFixed(0);
}

function netImpactClass(value: string) {
  return `impact-${value}`;
}

export function ImmigrationScenarioLab() {
  const [selectedScenarioId, setSelectedScenarioId] = useState<ImmigrationScenarioId>('current-path');
  const [selectedYear, setSelectedYear] = useState(IMMIGRATION_START_YEAR);
  const [isPlaying, setIsPlaying] = useState(false);
  const [runToYear, setRunToYear] = useState(2036);
  const [compareScenarioIds, setCompareScenarioIds] = useState<ImmigrationScenarioId[]>([
    'current-path',
    'zero-net-overseas-migration',
    'skilled-migration-focus',
  ]);
  const [assumptionOverrides, setAssumptionOverrides] = useState<Partial<ImmigrationAssumptions>>({});

  const selectedScenario =
    IMMIGRATION_SCENARIO_PRESETS.find((scenario) => scenario.id === selectedScenarioId) ??
    IMMIGRATION_SCENARIO_PRESETS[0];

  const selectedRun = useMemo(
    () => runImmigrationScenario(selectedScenario, assumptionOverrides),
    [assumptionOverrides, selectedScenario],
  );
  const selectedYearResult =
    selectedRun.timeline.find((item) => item.year === selectedYear) ?? selectedRun.timeline[0];
  const compareRuns = useMemo(
    () =>
      compareScenarioIds.map((id) => {
        const scenario = IMMIGRATION_SCENARIO_PRESETS.find((item) => item.id === id) ?? IMMIGRATION_SCENARIO_PRESETS[0];
        const run = runImmigrationScenario(scenario, id === selectedScenarioId ? assumptionOverrides : {});
        return {
          scenario,
          year: run.timeline.find((item) => item.year === selectedYear) ?? run.timeline[0],
        };
      }),
    [assumptionOverrides, compareScenarioIds, selectedScenarioId, selectedYear],
  );

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
  }

  function toggleCompareScenario(id: ImmigrationScenarioId) {
    setCompareScenarioIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  return (
    <section className="immigration-lab section-block">
      <header className="immigration-hero">
        <div>
          <p className="eyebrow">Topic module · Immigration</p>
          <h2>{TOPIC_INTRODUCTION.title}</h2>
          <p>{TOPIC_INTRODUCTION.summary}</p>
          <p className="scenario-disclaimer">{TOPIC_INTRODUCTION.disclaimer}</p>
        </div>
        <div className="immigration-hero-stat">
          <span>Active year</span>
          <strong>{selectedYear}</strong>
          <em>{selectedScenario.name}</em>
        </div>
      </header>

      <section className="immigration-panel immigration-explainer">
        <div className="panel-heading-row">
          <div>
            <p className="eyebrow">Explainer before simulation</p>
            <h3>How immigration works in the model</h3>
          </div>
          <span>Plain-English glossary</span>
        </div>
        <div className="explainer-grid">
          {IMMIGRATION_EXPLAINER.map((item) => (
            <article key={item.term}>
              <h4>{item.term}</h4>
              <p>{item.plainEnglish}</p>
              <small>{item.whyItMatters}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="immigration-panel">
        <div className="panel-heading-row">
          <div>
            <p className="eyebrow">Scenario presets</p>
            <h3>Choose a future to run year by year</h3>
          </div>
          <span>2026–2066</span>
        </div>
        <div className="immigration-scenario-grid">
          {IMMIGRATION_SCENARIO_PRESETS.map((scenario) => (
            <button
              className={scenario.id === selectedScenarioId ? 'is-active' : ''}
              key={scenario.id}
              type="button"
              onClick={() => {
                setSelectedScenarioId(scenario.id);
                setSelectedYear(IMMIGRATION_START_YEAR);
                setIsPlaying(false);
              }}
            >
              <strong>{scenario.name}</strong>
              <span>{scenario.description}</span>
              <small>{scenario.framing}</small>
            </button>
          ))}
        </div>
      </section>

      <section className="immigration-panel simulation-controls-panel">
        <div>
          <p className="eyebrow">Year-by-year controls</p>
          <h3>Move through the future at your own pace</h3>
        </div>
        <div className="year-control-grid">
          <button type="button" onClick={() => { setIsPlaying(false); setSelectedYear((year) => Math.max(IMMIGRATION_START_YEAR, year - 1)); }}>‹ Step back</button>
          <button type="button" onClick={() => { setIsPlaying(false); setSelectedYear((year) => Math.min(2066, year + 1)); }}>Step forward ›</button>
          <button type="button" onClick={() => setIsPlaying((current) => !current)}>{isPlaying ? 'Pause' : 'Play'}</button>
          <button type="button" onClick={() => { setSelectedYear(runToYear); setIsPlaying(false); }}>Run to {runToYear}</button>
          <button type="button" onClick={resetScenario}>Reset scenario</button>
        </div>
        <label className="year-slider">
          Jump to selected year
          <input
            max={2066}
            min={IMMIGRATION_START_YEAR}
            type="range"
            value={selectedYear}
            onChange={(event) => {
              setIsPlaying(false);
              setSelectedYear(Number(event.target.value));
            }}
          />
          <strong>{selectedYear}</strong>
        </label>
        <label className="year-slider compact">
          Play / run target
          <input
            max={2066}
            min={selectedYear}
            type="range"
            value={runToYear}
            onChange={(event) => setRunToYear(Number(event.target.value))}
          />
          <strong>{runToYear}</strong>
        </label>
      </section>

      <section className="immigration-dashboard-grid">
        <article className="immigration-metric-card">
          <span>Population</span>
          <strong>{formatNumber(selectedYearResult.population)}</strong>
          <p>{formatNumber(selectedYearResult.annualPopulationChange)} people changed this year.</p>
        </article>
        <article className="immigration-metric-card">
          <span>Housing stress</span>
          <strong>{formatIndex(selectedYearResult.housingStressIndex)}</strong>
          <p>{formatNumber(selectedYearResult.housingShortfall)} dwelling shortfall in the placeholder model.</p>
        </article>
        <article className="immigration-metric-card">
          <span>Labour supply</span>
          <strong>{formatIndex(selectedYearResult.labourSupplyIndex)}</strong>
          <p>{formatNumber(selectedYearResult.workingAgePopulation)} working-age people.</p>
        </article>
        <article className="immigration-metric-card">
          <span>Services pressure</span>
          <strong>{formatIndex(selectedYearResult.stateBudgetPressure)}</strong>
          <p>State delivery pressure from hospitals, schools, transport and housing.</p>
        </article>
        <article className="immigration-metric-card">
          <span>Environment</span>
          <strong>{formatIndex(selectedYearResult.environmentalPressure)}</strong>
          <p>Lower is better; includes land, water, energy, waste and emissions pressure.</p>
        </article>
      </section>

      <section className="immigration-panel national-briefing-panel">
        <div className="panel-heading-row">
          <div>
            <p className="eyebrow">National Briefing</p>
            <h3>{selectedScenario.name} · {selectedYear}</h3>
          </div>
          <span>Annual result</span>
        </div>
        <p className="briefing-lead">{selectedYearResult.briefing.whatChanged}</p>
        <div className="briefing-grid">
          <BriefingList title="Most affected entities" items={selectedYearResult.briefing.mostAffectedEntities} />
          <BriefingList title="Assumptions driving result" items={selectedYearResult.briefing.assumptionsDrivingResult} />
          <BriefingList title="Immediate effects" items={selectedYearResult.briefing.immediateEffects} />
          <BriefingList title="Delayed effects" items={selectedYearResult.briefing.delayedEffects} />
          <BriefingList title="Risks building over time" items={selectedYearResult.briefing.buildingRisks} />
          <BriefingList title="Who benefited" items={selectedYearResult.briefing.beneficiaries} />
          <BriefingList title="Who bore costs" items={selectedYearResult.briefing.costBearers} />
          <BriefingList title="Unintended consequences" items={selectedYearResult.briefing.unintendedConsequences} />
        </div>
      </section>

      <section className="immigration-panel">
        <div className="panel-heading-row">
          <div>
            <p className="eyebrow">Winners, losers and trade-offs</p>
            <h3>A group can gain in one way and lose in another</h3>
          </div>
          <span>Current + cumulative impacts</span>
        </div>
        <div className="tradeoff-grid">
          {selectedYearResult.tradeOffs.map((item) => (
            <article className="tradeoff-card" key={item.group}>
              <div>
                <h4>{item.group}</h4>
                <em className={netImpactClass(item.netImpact)}>{item.netImpact}</em>
              </div>
              <dl>
                <dt>Current year</dt>
                <dd>{item.currentYearImpact.toFixed(1)}</dd>
                <dt>Cumulative</dt>
                <dd>{item.cumulativeImpact.toFixed(1)}</dd>
                <dt>Confidence</dt>
                <dd>{item.confidence}</dd>
              </dl>
              <p><strong>Benefit:</strong> {item.mainBenefit}</p>
              <p><strong>Cost:</strong> {item.mainCost}</p>
              <p>{item.explanation}</p>
              <small>{item.entityPathway}</small>
              <ul>
                {item.offsettingPolicies.map((policy) => <li key={policy}>{policy}</li>)}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="immigration-panel myth-panel">
        <div className="panel-heading-row">
          <div>
            <p className="eyebrow">Myth tester</p>
            <h3>Common claims tested against model outputs</h3>
          </div>
          <span>No pre-set political conclusion</span>
        </div>
        <div className="myth-grid">
          {selectedYearResult.mythTests.map((myth) => (
            <article key={myth.claim}>
              <h4>“{myth.claim}”</h4>
              <em className={netImpactClass(myth.status)}>{myth.status}</em>
              <p>{myth.modelCheck}</p>
              <ul>
                {myth.evidence.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="immigration-panel cause-map-panel">
        <div className="panel-heading-row">
          <div>
            <p className="eyebrow">Cause-and-effect map</p>
            <h3>How an immigration change flows through the system</h3>
          </div>
          <span>Immediate · lagged · feedback · uncertain</span>
        </div>
        <div className="cause-map-grid">
          {IMMIGRATION_CAUSE_EFFECT_MAP.map((node, index) => (
            <article className={`cause-node timing-${node.timing}`} key={node.id}>
              <span>{index + 1}</span>
              <h4>{node.label}</h4>
              <em>{node.timing.replace('-', ' ')}</em>
              <p>{node.explanation}</p>
              {node.downstream.length ? <small>Flows to: {node.downstream.join(', ')}</small> : null}
            </article>
          ))}
        </div>
      </section>

      <section className="immigration-panel assumption-ledger-panel">
        <div className="panel-heading-row">
          <div>
            <p className="eyebrow">Assumption ledger</p>
            <h3>Inspect and change placeholder assumptions</h3>
          </div>
          <button type="button" onClick={() => setAssumptionOverrides({})}>Reset assumptions</button>
        </div>
        <div className="assumption-grid">
          {IMMIGRATION_ASSUMPTION_DEFINITIONS.map((definition) => {
            const value = selectedRun.assumptions[definition.key];
            return (
              <label className="assumption-card" key={definition.key}>
                <span>{definition.label}</span>
                <strong>{formatAssumptionValue(value, definition.unit)} <small>{definition.unit}</small></strong>
                <input
                  max={definition.max}
                  min={definition.min}
                  step={definition.step}
                  type="range"
                  value={value}
                  onChange={(event) => updateAssumption(definition.key, Number(event.target.value))}
                />
                <em>{definition.source} · confidence: {definition.confidence}</em>
                <p>{definition.explanation}</p>
              </label>
            );
          })}
        </div>
      </section>

      <section className="immigration-panel scenario-comparison-panel">
        <div className="panel-heading-row">
          <div>
            <p className="eyebrow">Scenario comparison</p>
            <h3>Compare different futures at {selectedYear}</h3>
          </div>
          <span>{compareRuns.length} selected</span>
        </div>
        <div className="compare-toggle-row">
          {IMMIGRATION_SCENARIO_PRESETS.map((scenario) => (
            <label key={scenario.id}>
              <input
                checked={compareScenarioIds.includes(scenario.id)}
                type="checkbox"
                onChange={() => toggleCompareScenario(scenario.id)}
              />
              {scenario.shortName}
            </label>
          ))}
        </div>
        <div className="comparison-table-wrap">
          <table className="comparison-table">
            <thead>
              <tr>
                <th>Scenario</th>
                <th>Population</th>
                <th>Net migration</th>
                <th>Housing stress</th>
                <th>Labour supply</th>
                <th>State pressure</th>
                <th>Environment</th>
              </tr>
            </thead>
            <tbody>
              {compareRuns.map(({ scenario, year }) => (
                <tr key={scenario.id}>
                  <td>{scenario.name}</td>
                  <td>{formatNumber(year.population)}</td>
                  <td>{formatNumber(year.netOverseasMigration)}</td>
                  <td>{formatIndex(year.housingStressIndex)}</td>
                  <td>{formatIndex(year.labourSupplyIndex)}</td>
                  <td>{formatIndex(year.stateBudgetPressure)}</td>
                  <td>{formatIndex(year.environmentalPressure)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="immigration-panel timeline-panel">
        <div className="panel-heading-row">
          <div>
            <p className="eyebrow">Full timeline history</p>
            <h3>Every year is calculated and stored</h3>
          </div>
          <span>{selectedRun.timeline.length} annual records</span>
        </div>
        <div className="timeline-strip">
          {selectedRun.timeline.map((year) => (
            <button
              className={year.year === selectedYear ? 'is-active' : ''}
              key={year.year}
              type="button"
              onClick={() => {
                setSelectedYear(year.year);
                setIsPlaying(false);
              }}
            >
              <strong>{year.year}</strong>
              <span>Pop {formatNumber(year.population)}</span>
              <small>Housing {formatIndex(year.housingStressIndex)}</small>
            </button>
          ))}
        </div>
      </section>

      <section className="immigration-panel entity-foundation-panel">
        <div className="panel-heading-row">
          <div>
            <p className="eyebrow">Entity model foundation</p>
            <h3>People, households, employers, governments, regions and environment</h3>
          </div>
          <span>{IMMIGRATION_ENTITIES.length} entities</span>
        </div>
        <div className="entity-foundation-grid">
          {IMMIGRATION_ENTITIES.map((entity) => (
            <article key={entity.id}>
              <em>{entity.category}</em>
              <h4>{entity.label}</h4>
              <p>{entity.description}</p>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}

function BriefingList({ title, items }: { title: string; items: string[] }) {
  return (
    <article>
      <h4>{title}</h4>
      <ul>
        {items.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </article>
  );
}
