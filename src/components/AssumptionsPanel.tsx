import { MODEL_ASSUMPTION_LIST, MODEL_ASSUMPTIONS } from '../simulation/model';

export function AssumptionsPanel() {
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
      </div>
      <ul>
        {MODEL_ASSUMPTION_LIST.slice(1).map((assumption) => (
          <li key={assumption.label}>
            <strong>{assumption.label}:</strong> {assumption.value}. {assumption.explanation}
          </li>
        ))}
      </ul>
    </section>
  );
}
