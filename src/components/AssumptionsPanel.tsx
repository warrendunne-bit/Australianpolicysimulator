import { buildDataProvenanceRows, getActiveBaselineVersion } from '../model';
import { MODEL_ASSUMPTION_LIST, MODEL_ASSUMPTIONS } from '../simulation/model';

export function AssumptionsPanel() {
  const baselineVersion = getActiveBaselineVersion();
  const provenanceRows = buildDataProvenanceRows().slice(0, 12);

  return (
    <section className="assumption-banner section-block">
      <div>
        <p className="eyebrow">Model scope</p>
        <h2>Illustrative simulator, not a forecast</h2>
        <p>
          {MODEL_ASSUMPTIONS.scope} Results come from simplified representative households,
          companies, government and environment entities. The formulas are hand-authored to make
          trade-offs visible.
        </p>
        <p className="baseline-version-note">
          Australian baseline v1.0 — reviewed <strong>{baselineVersion.reviewDate}</strong> · status {baselineVersion.status} · id {baselineVersion.id}
        </p>
      </div>
      <ul>
        {MODEL_ASSUMPTION_LIST.slice(1).map((assumption) => (
          <li key={assumption.label}>
            <strong>{assumption.label}:</strong> {assumption.value}. {assumption.explanation}
          </li>
        ))}
      </ul>
      <details className="data-provenance-panel">
        <summary>Inspect Australian baseline v1.0 evidence</summary>
        <div className="provenance-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Variable</th>
                <th>Value</th>
                <th>Source / status</th>
                <th>Class</th>
                <th>Confidence</th>
                <th>Affected outputs</th>
              </tr>
            </thead>
            <tbody>
              {provenanceRows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <strong>{row.name}</strong>
                    <small>{row.id}</small>
                  </td>
                  <td>
                    {row.value}
                    <small>{row.range}</small>
                  </td>
                  <td>{row.source}</td>
                  <td>{row.classification}</td>
                  <td>{row.confidence}</td>
                  <td>{row.affectedOutputs}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          Australian baseline v1.0 separates observed data, policy settings and behavioural assumptions. Reviewed values show source and confidence metadata; unresolved or exploratory values remain labelled for further evidence review.
        </p>
      </details>
    </section>
  );
}
