import type { HousingPilotResult, HousingPilotYear } from './model';

const exampleYear = 5;
const targetReduction = 3;
const decimal = new Intl.NumberFormat('en-AU', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const signedDecimal = new Intl.NumberFormat('en-AU', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
  signDisplay: 'exceptZero',
});
const wholeNumber = new Intl.NumberFormat('en-AU', { maximumFractionDigits: 0 });

function exampleRenter(year: HousingPilotYear | undefined) {
  return year?.cohorts.find(({ income, tenure }) => income === 'Lower' && tenure === 'Private renter');
}

export function HousingWorkedExample({ result }: { result: HousingPilotResult }) {
  const targetYear = result.baselineYear + exampleYear;
  const [baseline, fasterSupply, supplyWithSupport] = result.scenarios;
  const baselineRenter = exampleRenter(baseline.years.find(({ year }) => year === targetYear));
  if (!baselineRenter) return null;

  const firstSupport = supplyWithSupport.years.find((year) => (exampleRenter(year)?.annualRentalSupport ?? 0) > 0);
  const firstDelivery = fasterSupply.years.find(({ additionalDwellingsDelivered }) => additionalDwellingsDelivered > 0);
  const firstReliefYear = firstSupport && firstSupport.year - result.baselineYear;
  const firstDeliveryYear = firstDelivery && firstDelivery.year - result.baselineYear;
  const packages = result.scenarios.map(({ id, label, years }) => {
    const year = years.find((row) => row.year === targetYear);
    const renter = exampleRenter(year);
    if (!year || !renter) return { id, label, comparison: undefined };

    const change = renter.housingBurdenPercent - baselineRenter.housingBurdenPercent;
    return {
      id,
      label,
      comparison: {
        burden: renter.housingBurdenPercent,
        change,
        shortfall: Math.max(0, targetReduction + change),
        recipients: year.rentSupportRecipients,
        extraPublicCost: year.cumulativePublicCosts.total * 1_000,
      },
    };
  });

  return (
    <section className="panel pilot-results" aria-labelledby="housing-worked-example-title">
      <header className="pilot-result-heading">
        <div>
          <h3 id="housing-worked-example-title">Can the renter’s housing burden fall by year {exampleYear}?</h3>
          <p>
            Try changing rental support take-up above. See what changes for one renter, how many households receive help, and what extra spending is required.
          </p>
        </div>
      </header>
      <div className="table-wrap pilot-table" role="region" aria-label="Housing worked example table" tabIndex={0}>
        <table>
          <caption>Example lower-income private renter in year {exampleYear} (June {targetYear})</caption>
          <thead>
            <tr>
              <th scope="col">Measure</th>
              {packages.map(({ id, label }) => <th key={id} scope="col">{label}</th>)}
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">Housing costs as a share of disposable income</th>
              {packages.map(({ id, comparison }) => (
                <td key={id}>{comparison ? `${decimal.format(comparison.burden)}%` : 'Unavailable'}</td>
              ))}
            </tr>
            <tr>
              <th scope="row">Change from baseline (pp)</th>
              {packages.map(({ id, comparison }) => (
                <td key={id}>{comparison ? signedDecimal.format(comparison.change) : 'Unavailable'}</td>
              ))}
            </tr>
            <tr>
              <th scope="row">Progress towards a {targetReduction} pp reduction</th>
              {packages.map(({ id, comparison }) => {
                if (!comparison) return <td key={id}>Unavailable</td>;
                if (comparison.shortfall === 0) return <td key={id}>Goal met</td>;
                return <td key={id}>{decimal.format(comparison.shortfall)} pp short</td>;
              })}
            </tr>
            <tr>
              <th scope="row">Households receiving the pilot top-up in year {exampleYear}</th>
              {packages.map(({ id, comparison }) => (
                <td key={id}>{comparison ? wholeNumber.format(comparison.recipients) : 'Unavailable'}</td>
              ))}
            </tr>
            <tr>
              <th scope="row">Extra public cost through year {exampleYear} (nominal A$ million)</th>
              {packages.map(({ id, comparison }) => (
                <td key={id}>{comparison ? wholeNumber.format(comparison.extraPublicCost) : 'Unavailable'}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      {firstReliefYear && firstDeliveryYear && (
        <p className="table-note">
          The example renter receives the top-up from year {firstReliefYear} in the rental support package.
          The first additional homes arrive in year {firstDeliveryYear}, following the model’s {result.assumptions.deliveryLagYears}-year delivery lag.
        </p>
      )}
      <p className="table-note">
        The goal of a {targetReduction} percentage point reduction from baseline is illustrative. The example renter is eligible and takes up the full top-up.
        Take-up changes how many eligible households receive it and the public cost. The payment to each recipient stays the same.
      </p>
    </section>
  );
}
