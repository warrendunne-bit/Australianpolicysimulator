import { useRef, useState, type FormEvent } from "react";
import { evidenceProposals } from "../housingPilot/evidence";
import { IssueBrief } from "../IssueBrief";
import { issueBriefs } from "../issueBriefs";
import { communityExercises } from "./community";
import { compareProgramme, initialProgrammeInputs, type ProgrammeInputs } from "./comparison";
import { economicExercises } from "./economic";
import { programmeGuides } from "./guides";
import { householdExercises } from "./households";
import { PreventionSensitivity } from "./PreventionSensitivity";
import { preventionFollowupSection, programmeSettingsPrefix, proposalHref, proposalsSection } from "./routes";
import type { PolicyExercise, PolicyInput } from "./types";
import "./programmes.css";

const exercises = new Map([
  ...economicExercises,
  ...householdExercises,
  ...communityExercises,
].map((exercise) => [exercise.id, exercise]));

export type ProgrammeScenarios = Readonly<Partial<Record<string, ProgrammeInputs>>>;

function format(value: number, decimals = 0, showSign = false) {
  return new Intl.NumberFormat("en-AU", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    signDisplay: showSign ? "exceptZero" : "auto",
  }).format(value);
}

function InputGroup({ title, inputs, draft, onChange }: {
  title: string;
  inputs: readonly PolicyInput[];
  draft: Readonly<Record<string, string>>;
  onChange: (id: string, value: string) => void;
}) {
  if (inputs.length === 0) return null;
  return (
    <fieldset className="programme-fields">
      <legend>{title}</legend>
      {inputs.map((input) => {
        const id = `programme-input-${input.id}`;
        return (
          <div className="programme-field" key={id}>
            <label htmlFor={id}>{input.label}</label>
            <div className="programme-value-field">
              <input type="number" id={id} required min={input.min} max={input.max} step={input.step}
                value={draft[input.id]} onChange={(event) => onChange(input.id, event.currentTarget.value)}
                aria-describedby={`${input.unit ? `${id}-unit ` : ""}${id}-note`} />
              {input.unit && <span id={`${id}-unit`}>{input.unit}</span>}
            </div>
            <p id={`${id}-note`} className="programme-field-note">
              {input.description}{input.description && " "}
              {input.reference === undefined ? "Applies to both cases." : `Reference setting ${input.reference.toLocaleString("en-AU")} ${input.unit}.`}
            </p>
          </div>
        );
      })}
    </fieldset>
  );
}

function ProgrammeComparison({ exercise, savedInputs, onCompare }: {
  exercise: PolicyExercise;
  savedInputs?: ProgrammeInputs;
  onCompare: (id: string, values: ProgrammeInputs) => void;
}) {
  const applied = savedInputs ?? initialProgrammeInputs(exercise.inputs);
  const [draft, setDraft] = useState(() => Object.fromEntries(exercise.inputs.map(({ id }) => [id, String(applied[id])])));
  const [announcement, setAnnouncement] = useState("");
  const results = useRef<HTMLElement>(null);
  const outcomes = compareProgramme(exercise, applied);
  const pending = exercise.inputs.some(({ id }) => draft[id].trim() === "" || Number(draft[id]) !== applied[id]);
  const simulationId = `${programmeSettingsPrefix}${exercise.id}`;
  const guide = programmeGuides[exercise.id];
  const firstInputs = exercise.inputs.filter(({ id }) => id === guide.controlId);
  const otherPolicyInputs = exercise.inputs.filter(({ id, reference }) => id !== guide.controlId && reference !== undefined);
  const sharedInputs = exercise.inputs.filter(({ id, reference }) => id !== guide.controlId && reference === undefined);
  const keyOutcomes = [guide.outcomeId, guide.costId];
  const orderedOutcomes = [
    ...keyOutcomes.flatMap((id) => outcomes.filter((outcome) => outcome.id === id)),
    ...outcomes.filter(({ id }) => !keyOutcomes.includes(id)),
  ];

  function changeDraft(id: string, value: string) {
    setDraft((previous) => ({ ...previous, [id]: value }));
    setAnnouncement("");
  }

  function compare(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!event.currentTarget.reportValidity()) return;
    onCompare(exercise.id, Object.fromEntries(exercise.inputs.map(({ id }) => [id, Number(draft[id])])));
    setAnnouncement("Comparison updated.");
    results.current?.focus({ preventScroll: true });
    results.current?.scrollIntoView?.({ block: "nearest" });
  }

  function reset() {
    const defaults = initialProgrammeInputs(exercise.inputs);
    setDraft(Object.fromEntries(exercise.inputs.map(({ id }) => [id, String(defaults[id])])));
    onCompare(exercise.id, defaults);
    setAnnouncement("Illustrative defaults restored.");
  }

  return (
    <>
      <IssueBrief id={exercise.id} simulationId={simulationId} />
      <header className="panel programme-intro" id={simulationId}>
        <h2 tabIndex={-1}>{exercise.title}</h2>
        <p>{exercise.description}</p>
        <dl className="programme-scope">
          <div><dt>Who or what is included</dt><dd>{guide.population}</dd></div>
          <div><dt>Time covered</dt><dd>{guide.timeframe}</dd></div>
        </dl>
      </header>
      <div className="programme-layout">
        <form className="panel programme-controls" onSubmit={compare} aria-labelledby="programme-settings-heading"
          onInvalidCapture={(event) => {
            if (event.target instanceof HTMLInputElement) {
              const details = event.target.closest('details');
              if (details) details.open = true;
            }
          }}>
          <h3 id="programme-settings-heading">Try one change</h3>
          <p className="programme-summary">{guide.action}</p>
          <InputGroup title="Suggested setting" inputs={firstInputs} draft={draft} onChange={changeDraft} />
          <details className="programme-other-settings">
            <summary>All other settings</summary>
            <InputGroup title="Other policy settings" inputs={otherPolicyInputs} draft={draft} onChange={changeDraft} />
            <InputGroup title="Shared assumptions" inputs={sharedInputs} draft={draft} onChange={changeDraft} />
          </details>
          <div className="programme-actions">
            <button className="primary-button" type="submit">Compare scenarios</button>
            <button className="secondary-button" type="button" onClick={reset}>Reset defaults</button>
          </div>
          <p className="sr-only" role="status">{announcement}</p>
        </form>
        <div className="programme-results">
          <section className="panel programme-results-panel" aria-labelledby="programme-results-heading" ref={results} tabIndex={-1}>
            <h3 id="programme-results-heading">Comparison results</h3>
            <p className="programme-summary">{guide.interpretation} Both cases use the same shared assumptions.</p>
            {pending && <p className="programme-pending" role="status">Settings changed. Compare scenarios to update the results.</p>}
            <div className="table-wrap programme-table" role="region" aria-label="Programme outcomes" tabIndex={0}>
              <table>
                <caption className="sr-only">Reference and proposed programme results with the change from reference.</caption>
                <thead><tr><th scope="col">Outcome</th><th scope="col">Reference</th><th scope="col">Your scenario</th><th scope="col">Change</th></tr></thead>
                <tbody>
                  {orderedOutcomes.map((outcome) => (
                    <tr key={outcome.id} className={keyOutcomes.includes(outcome.id) ? 'programme-key-outcome' : undefined}>
                      <th scope="row">{outcome.label}<small>{outcome.unit}</small>{outcome.description && <small>{outcome.description}</small>}</th>
                      <td>{outcome.reference === null ? "—" : format(outcome.reference, outcome.decimals)}</td>
                      <td>{format(outcome.value, outcome.decimals)}</td>
                      <td>{outcome.reference === null ? "—" : `${format(outcome.value - outcome.reference, outcome.decimals, true)}${outcome.unit === "%" ? " pp" : ""}`}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="programme-evaluation">
              <h4>What to measure next</h4>
              <p>{guide.evaluation}</p>
              {exercise.id === 'preventive-health' && <p><a href={`#${preventionFollowupSection}`}>Explore the ten-year sensitivity analysis</a></p>}
            </div>
          </section>
          <details className="panel programme-method">
            <summary>Assumptions and scope</summary>
            <ul>{exercise.assumptions.map((assumption) => <li key={assumption}>{assumption}</li>)}</ul>
          </details>
        </div>
      </div>
      {exercise.id === 'preventive-health' && <PreventionSensitivity exercise={exercise} inputs={applied} />}
    </>
  );
}

export function PolicyProposals({ selected, scenarios, onCompare }: {
  selected?: string;
  scenarios: ProgrammeScenarios;
  onCompare: (id: string, values: ProgrammeInputs) => void;
}) {
  const exercise = selected ? exercises.get(selected) : undefined;
  return (
    <section id={exercise ? proposalHref(exercise.id).slice(1) : proposalsSection} className="programmes" aria-labelledby={exercise ? 'issue-brief-title' : 'policy-proposals-title'}>
      {exercise ? (
        <ProgrammeComparison key={exercise.id} exercise={exercise} savedInputs={scenarios[exercise.id]} onCompare={onCompare} />
      ) : (
        <>
          <header className="panel programme-intro programme-catalogue-intro">
            <h2 id="policy-proposals-title" tabIndex={-1}>Ten major issues facing Australia</h2>
            <p>Explore the long-term challenges identified in <em>Australian prosperity, wellbeing and resilience</em>. Choose a question to see what’s driving the issue, then test a policy response.</p>
          </header>
          <ul className="programme-catalogue">
            {evidenceProposals.map(({ id }) => (
              <li className="panel programme-card" key={id}>
                <h3><a href={proposalHref(id)}>{issueBriefs[id].title}</a></h3>
                <p>{issueBriefs[id].question}</p>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
