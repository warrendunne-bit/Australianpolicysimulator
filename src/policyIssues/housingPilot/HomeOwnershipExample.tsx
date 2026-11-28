import { useState } from 'react';
import { housingOwnershipSection } from '../programmes/routes';
import { compareFirstHome, defaultFirstHomeSettings, firstHomeAssumptions as assumptions } from './homeOwnership';

const money = new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', maximumFractionDigits: 0 });
const years = new Intl.NumberFormat('en-AU', { maximumFractionDigits: 1 });

function formatSavingTime(months: number) {
  if (months === 0) return 'Already saved';
  return months < 12 ? `${months} mo` : `${years.format(months / 12)} yr`;
}

export function HomeOwnershipExample() {
  const [settings, setSettings] = useState(defaultFirstHomeSettings);
  const { nearer, farther, renting, monthlyDepositSavings } = compareFirstHome(settings);
  const housingOptions = [renting, nearer, farther];

  return (
    <section className="panel pilot-results pilot-ownership" id={housingOwnershipSection} aria-labelledby="home-ownership-title">
      <header className="pilot-result-heading">
        <div>
          <h3 id="home-ownership-title" tabIndex={-1}>Could this household buy close to work?</h3>
          <p>Compare staying in a rental with buying nearer to work or farther away. Try a lower price near work, a smaller deposit or a higher mortgage rate.</p>
        </div>
      </header>
      <div className="pilot-settings ownership-settings" role="group" aria-label="First-home assumptions">
        <div className="year-select">
          <label htmlFor="near-home-price">Purchase price near work</label>
          <select id="near-home-price" value={settings.nearPrice} onChange={(event) => setSettings({ ...settings, nearPrice: Number(event.target.value) })}>
            {[520_000, 560_000, 600_000, 640_000, 680_000].map((price) => <option key={price} value={price}>{money.format(price)}</option>)}
          </select>
        </div>
        <div className="year-select">
          <label htmlFor="first-home-deposit">Deposit (% of price)</label>
          <select id="first-home-deposit" value={settings.depositPercent} onChange={(event) => setSettings({ ...settings, depositPercent: Number(event.target.value) })}>
            {[10, 15, 20].map((deposit) => <option key={deposit} value={deposit}>{deposit}%</option>)}
          </select>
        </div>
        <div className="year-select">
          <label htmlFor="first-home-rate">Mortgage interest rate</label>
          <select id="first-home-rate" value={settings.ratePercent} onChange={(event) => setSettings({ ...settings, ratePercent: Number(event.target.value) })}>
            {[5, 6, 7, 8].map((rate) => <option key={rate} value={rate}>{rate}%</option>)}
          </select>
        </div>
      </div>
      <div className="table-wrap pilot-table" role="region" aria-label="First-home budget comparison" tabIndex={0}>
        <table>
          <caption>One household on {money.format(assumptions.monthlyTakeHomePay)} a month after tax</caption>
          <thead>
            <tr><th scope="col">Measure</th><th scope="col">Keep renting</th><th scope="col">Buy nearer</th><th scope="col">Buy farther</th></tr>
          </thead>
          <tbody>
            <tr><th scope="row">Purchase price</th><td>—</td><td>{money.format(nearer.price)}</td><td>{money.format(farther.price)}</td></tr>
            <tr><th scope="row">Deposit and buying costs</th><td>—</td><td>{money.format(nearer.upfrontCash)}</td><td>{money.format(farther.upfrontCash)}</td></tr>
            <tr><th scope="row">Time to save while renting</th><td>—</td><td>{formatSavingTime(nearer.monthsToSave)}</td><td>{formatSavingTime(farther.monthsToSave)}</td></tr>
            <tr>
              <th scope="row">One-way commute</th>
              {housingOptions.map(({ commute }, index) => <td key={index}>{commute.minutes} min</td>)}
            </tr>
            <tr>
              <th scope="row">Monthly travel to work</th>
              {housingOptions.map(({ commute }, index) => <td key={index}>{money.format(commute.monthlyCost)}</td>)}
            </tr>
            <tr>
              <th scope="row">Monthly housing costs</th>
              {housingOptions.map(({ monthlyHousing }, index) => <td key={index}>{money.format(monthlyHousing)}</td>)}
            </tr>
            <tr className="pilot-total">
              <th scope="row">Monthly cash left after essentials</th>
              {housingOptions.map(({ monthlyCash }, index) => (
                <td key={index}>
                  {money.format(monthlyCash)}
                  <small className="pilot-difference">{monthlyCash >= assumptions.monthlyCashBuffer ? 'Buffer met' : 'Below buffer'}</small>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <p className="table-note">
        The household spends {money.format(assumptions.monthlyOtherEssentials)} a month on other essentials and aims to keep a {money.format(assumptions.monthlyCashBuffer)} monthly buffer for savings and setbacks.
        While renting it starts with {money.format(assumptions.savingsAvailable)} available to buy and saves {money.format(monthlyDepositSavings)} a month towards the purchase.
      </p>
      <details className="ownership-method">
        <summary>Assumptions and scope</summary>
        <p className="table-note">
          Buying costs are assumed to be {assumptions.buyingCostsPercent}% of the price. Monthly housing costs for buyers include a {assumptions.mortgageTermYears}-year principal-and-interest loan and {money.format(assumptions.monthlyOwnerCosts)} for rates, insurance and upkeep.
          The savings timeline holds prices, rent and income steady. The example uses hypothetical locations and leaves out lender eligibility, mortgage insurance and the effect of policies on market prices or ownership rates.
        </p>
      </details>
    </section>
  );
}
