export function AssumptionsPanel() {
  return (
    <section className="assumption-banner section-block">
      <div>
        <p className="eyebrow">Model scope</p>
        <h2>Illustrative simulator, not a forecast</h2>
        <p>
          Results come from simplified representative households, companies, government and
          environment entities. The formulas are hand-authored to make trade-offs visible; they are
          not calibrated official forecasts, budget estimates or policy advice.
        </p>
      </div>
      <ul>
        <li>Scores are directional and intended for comparison.</li>
        <li>Fairness is an illustrative distribution score, not a measured inequality statistic.</li>
        <li>Use the model to ask better questions, not to claim precise predictions.</li>
      </ul>
    </section>
  );
}
