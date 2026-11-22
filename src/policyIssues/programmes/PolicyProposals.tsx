import { useRef, useState, type FormEvent } from "react";
import { evidenceProposals } from "../housingPilot/evidence";
import { communityExercises } from "./community";
import { compareProgramme, initialProgrammeInputs, type ProgrammeInputs } from "./comparison";
import { economicExercises } from "./economic";
import { householdExercises } from "./households";
import { proposalEvidencePrefix, proposalHref, proposalsSection } from "./routes";
import type { PolicyExercise, PolicyInput } from "./types";
import "./programmes.css";

const exercises = new Map([
  ...economicExercises,
  ...householdExercises,
  ...communityExercises,
].map((exercise) => [exercise.id, exercise]));

const issueNames: Readonly<Record<string, string>> = {
  "affordable-housing": "Housing affordability",
  "economic-diversification": "Economic diversification",
  "energy-and-adaptation": "Clean and reliable energy",
  "critical-systems": "Critical service continuity",
  "early-years-and-skills": "Early childhood and skills",
  "income-security": "Income and job security",
  "preventive-health": "Preventive health",
  belonging: "Community connection",
  "attention-and-gambling": "Digital attention and gambling",
  "government-evaluation": "Government delivery and evaluation",
};

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
      <header className="panel programme-intro">
        <a className="programme-return" href={`#${proposalsSection}`}>All ten issues</a>
        <h2 id="policy-proposals-title">{exercise.title}</h2>
        <p>{exercise.description}</p>
        <a href={`#${proposalEvidencePrefix}${exercise.id}`}>Research and evidence limits</a>
      </header>
      <div className="programme-layout">
        <form className="panel programme-controls" onSubmit={compare} aria-labelledby="programme-settings-heading">
          <h3 id="programme-settings-heading">Scenario settings</h3>
          <InputGroup title="Policy settings" inputs={exercise.inputs.filter(({ reference }) => reference !== undefined)} draft={draft} onChange={changeDraft} />
          <InputGroup title="Shared assumptions" inputs={exercise.inputs.filter(({ reference }) => reference === undefined)} draft={draft} onChange={changeDraft} />
          <div className="programme-actions">
            <button className="primary-button" type="submit">Compare scenarios</button>
            <button className="secondary-button" type="button" onClick={reset}>Reset defaults</button>
          </div>
          <p className="sr-only" role="status">{announcement}</p>
        </form>
        <div className="programme-results">
          <section className="panel" aria-labelledby="programme-results-heading" ref={results} tabIndex={-1}>
            <h3 id="programme-results-heading">Comparison results</h3>
            <p className="programme-summary">The cases use illustrative settings and the same shared assumptions.</p>
            {pending && <p className="programme-pending" role="status">Settings changed. Compare scenarios to update the results.</p>}
            <div className="table-wrap programme-table" role="region" aria-label="Programme outcomes" tabIndex={0}>
              <table>
                <caption className="sr-only">Reference and proposed programme results with the change from reference.</caption>
                <thead><tr><th scope="col">Outcome</th><th scope="col">Reference</th><th scope="col">Your scenario</th><th scope="col">Change</th></tr></thead>
                <tbody>
                  {outcomes.map((outcome) => (
                    <tr key={outcome.id}>
                      <th scope="row">{outcome.label}<small>{outcome.unit}</small>{outcome.description && <small>{outcome.description}</small>}</th>
                      <td>{outcome.reference === null ? "—" : format(outcome.reference, outcome.decimals)}</td>
                      <td>{format(outcome.value, outcome.decimals)}</td>
                      <td>{outcome.reference === null ? "—" : `${format(outcome.value - outcome.reference, outcome.decimals, true)}${outcome.unit === "%" ? " pp" : ""}`}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          <details className="panel programme-method">
            <summary>Assumptions and scope</summary>
            <ul>{exercise.assumptions.map((assumption) => <li key={assumption}>{assumption}</li>)}</ul>
          </details>
        </div>
      </div>
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
    <section id={proposalsSection} className="programmes" aria-labelledby="policy-proposals-title">
      {exercise ? (
        <ProgrammeComparison key={exercise.id} exercise={exercise} savedInputs={scenarios[exercise.id]} onCompare={onCompare} />
      ) : (
        <>
          <header className="panel programme-intro programme-catalogue-intro">
            <h2 id="policy-proposals-title">Ten major issues</h2>
            <p>Choose an issue to explore its policy options, compare results, and inspect the assumptions behind them.</p>
          </header>
          <ul className="programme-catalogue">
            {evidenceProposals.map((proposal) => (
              <li className="panel programme-card" key={proposal.id}>
                <h3><a href={proposalHref(proposal.id)}>{issueNames[proposal.id] ?? proposal.title}</a></h3>
                <p>{proposal.id === "affordable-housing" ? "Compare dwelling supply and rental support under shared economic conditions." : exercises.get(proposal.id)?.description}</p>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
