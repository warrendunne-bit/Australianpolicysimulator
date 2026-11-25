import { useState } from 'react';
import type { ProgrammeInputs } from './comparison';
import { comparePreventionFollowup } from './preventionFollowup';
import type { PolicyExercise } from './types';

const count = new Intl.NumberFormat('en-AU');
const cases = new Intl.NumberFormat('en-AU', { maximumFractionDigits: 1 });
const difference = new Intl.NumberFormat('en-AU', { maximumFractionDigits: 1, signDisplay: 'exceptZero' });

export function PreventionSensitivity({ exercise, inputs }: { exercise: PolicyExercise; inputs: ProgrammeInputs }) {
  const [laterRisk, setLaterRisk] = useState(20);
  const [retainedEffect, setRetainedEffect] = useState(50);
  const { rows, participants, cost } = comparePreventionFollowup(exercise, inputs, laterRisk, retainedEffect);

  return (
    <section id="prevention-follow-up" className="panel programme-method" aria-labelledby="prevention-sensitivity-title">
      <h3 id="prevention-sensitivity-title" tabIndex={-1}>How much could prevention change ten-year outcomes?</h3>
      <p className="programme-summary">
        Compare four illustrative effects in place of the early effect setting above.
        Each comparison starts with {count.format(inputs.eligibleAdults)} adults in a hypothetical cohort.
        Cases in years 4–10 arise among adults without diabetes at the end of year 3.
      </p>
      <fieldset className="programme-fields">
        <legend>Shared follow-up assumptions</legend>
        <div className="programme-field">
          <label htmlFor="prevention-later-risk">Risk in years 4–10 without an ongoing programme effect</label>
          <div className="programme-value-field">
            <input
              id="prevention-later-risk" type="range" min={0} max={100} step={1}
              value={laterRisk} onChange={(event) => setLaterRisk(event.currentTarget.valueAsNumber)}
              aria-valuetext={`${laterRisk}% over years 4–10`}
            />
            <output htmlFor="prevention-later-risk">{laterRisk}%</output>
          </div>
          <p className="programme-field-note">A single seven-year risk for adults still at risk, applied to both packages.</p>
        </div>
        <div className="programme-field year-select">
          <label htmlFor="prevention-retained-effect">Share of the early effect retained in years 4–10</label>
          <select id="prevention-retained-effect" value={retainedEffect} onChange={(event) => setRetainedEffect(Number(event.currentTarget.value))}>
            <option value={0}>None</option>
            <option value={50}>Half</option>
            <option value={100}>Full effect</option>
          </select>
        </div>
      </fieldset>
      <div className="table-wrap programme-table" role="region" aria-label="Prevention sensitivity outcomes" tabIndex={0}>
        <table>
          <caption className="sr-only">Estimated new type 2 diabetes cases by year 3 and year 10</caption>
          <thead>
            <tr>
              <th scope="col">Early risk reduction</th>
              <th scope="col">Cases by year 3<small>Reference / your scenario</small></th>
              <th scope="col">Cases by year 10<small>Reference / your scenario</small></th>
              <th scope="col">Year 10 change<small>Your scenario vs reference</small></th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ effect, casesThreeYears, casesTenYears }) => (
              <tr key={effect.percent}>
                <th scope="row">{effect.label} · {effect.percent}%</th>
                <td>{cases.format(casesThreeYears.reference)} / {cases.format(casesThreeYears.scenario)}</td>
                <td>{cases.format(casesTenYears.reference)} / {cases.format(casesTenYears.scenario)}</td>
                <td>{difference.format(casesTenYears.scenario - casesTenYears.reference)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="table-note">
        The reference serves {count.format(participants.reference)} adults for A${count.format(cost.reference * 1_000_000)}.
        Your scenario serves {count.format(participants.scenario)} for A${count.format(cost.scenario * 1_000_000)}.
        Costs cover one intake. Follow-up delivery costs and health care savings are outside the comparison.
      </p>
      <p className="table-note">The model follows one intake through ten years and assumes no deaths, new enrolments or losses to follow-up.</p>
      <details className="programme-method">
        <summary>Evidence and evaluation</summary>
        <ul>
          <li>
            A US randomised trial reported a 58% lower diabetes incidence rate for the intensive lifestyle group than for placebo over 2.8 years.
            At ten years, incidence since randomisation was 34% lower for the original lifestyle group. All groups had been offered lifestyle support during follow-up.
            These rate comparisons concern the trial participants. This model uses hypothetical risks for a different cohort.
            {' '}<a href="https://pubmed.ncbi.nlm.nih.gov/11832527/">US Diabetes Prevention Program (2002)</a>
            {' · '}<a href="https://pmc.ncbi.nlm.nih.gov/articles/PMC3135022/">Ten-year follow-up (2009)</a>
          </li>
          <li>
            The Melbourne Diabetes Prevention Study followed changes in risk factors over 12 months. Its estimate of diabetes risk change came from weight changes.
            An Australian rollout evaluation could follow new diagnoses at years 3 and 10 in equivalent eligible adults offered the programme or receiving usual services,
            and measure take-up, retention and actual costs.
            {' '}<a href="https://pubmed.ncbi.nlm.nih.gov/26464804/">Melbourne Diabetes Prevention Study (2015)</a>
          </li>
        </ul>
      </details>
    </section>
  );
}
