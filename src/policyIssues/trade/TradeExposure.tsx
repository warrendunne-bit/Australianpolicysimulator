import { useState } from "react";
import {
  calculateTradeStress,
  commodityExposureMillions,
  shareOfExports,
  tradeReference,
  type TradeStressKind,
} from "./model";
import "./trade.css";

const stressCases = {
  "commodity-prices": {
    name: "Commodity prices",
    controlLabel: "Price decline across the three commodities",
    explanation: "The same price decline applies to iron ore, coal and natural gas exports to all destinations. Volumes, exchange rates and other exports are held fixed.",
  },
  "buyer-demand": {
    name: "Demand from China",
    controlLabel: "Decline in demand from China",
    explanation: "China buys less from Australia at unchanged prices and exchange rates. Sales to other markets stay at their 2025 levels.",
  },
} satisfies Record<TradeStressKind, { name: string; controlLabel: string; explanation: string }>;

const billions = new Intl.NumberFormat("en-AU", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const formatBillions = (millions: number) => `A$${billions.format(millions / 1_000)}bn`;
const formatPercent = (value: number) => `${value.toFixed(1)}%`;

export function TradeExposure() {
  const [kind, setKind] = useState<TradeStressKind>("commodity-prices");
  const [declines, setDeclines] = useState<Record<TradeStressKind, number>>({ "commodity-prices": 30, "buyer-demand": 20 });
  const activeCase = stressCases[kind];
  const decline = declines[kind];
  const result = calculateTradeStress(kind, decline);

  return (
    <section id="trade-exposure" className="panel trade-exposure" aria-labelledby="trade-exposure-title">
      <header className="section-heading">
        <h2 id="trade-exposure-title">Trade exposure</h2>
        <p>Test how a change in commodity prices or demand from China would affect gross Australian export receipts using the calendar {tradeReference.calendarYear} baseline.</p>
      </header>

      <div className="trade-scenario">
        <div className="trade-controls">
          <div className="year-select">
            <label htmlFor="trade-stress-kind">Trade stress</label>
            <select id="trade-stress-kind" value={kind} onChange={(event) => setKind(event.currentTarget.value as TradeStressKind)}>
              <option value="commodity-prices">{stressCases["commodity-prices"].name}</option>
              <option value="buyer-demand">{stressCases["buyer-demand"].name}</option>
            </select>
          </div>
          <div className="control-row">
            <div className="control-heading">
              <label htmlFor="trade-decline">{activeCase.controlLabel}</label>
              <output htmlFor="trade-decline" aria-hidden="true">{decline}%</output>
            </div>
            <input id="trade-decline" type="range" min={0} max={100} step={1} value={decline} aria-valuetext={`${decline}% decline`}
              onChange={(event) => {
                const value = Number(event.currentTarget.value);
                setDeclines((values) => ({ ...values, [kind]: value }));
              }} />
          </div>
        </div>
        <p className="trade-case-note">{activeCase.explanation} Each stress runs separately because Australian exports to China include some of the same commodities.</p>
      </div>

      <dl className="trade-results" aria-label="Gross export receipts under the selected stress">
        <div><dt>Gross exports in {tradeReference.calendarYear}</dt><dd>{formatBillions(tradeReference.totalExportsMillions)}</dd></div>
        <div><dt>Direct loss in gross receipts</dt><dd>{formatBillions(result.lossMillions)}</dd><dd className="trade-percent">{formatPercent(result.lossSharePercent)} of all exports</dd></div>
        <div><dt>Gross receipts after the shock</dt><dd>{formatBillions(result.remainingExportsMillions)}</dd></div>
      </dl>

      <div className="trade-tables">
        <div className="table-wrap trade-table" role="region" aria-label="Commodity exposure" tabIndex={0}>
          <table>
            <caption>Commodity exposure</caption>
            <thead><tr><th scope="col">Product</th><th scope="col">Gross exports</th><th scope="col">Share of all exports</th></tr></thead>
            <tbody>
              {tradeReference.products.map((product) => (
                <tr key={product.name}>
                  <th scope="row">{product.name}</th><td>{formatBillions(product.exportsMillions)}</td><td>{formatPercent(shareOfExports(product.exportsMillions))}</td>
                </tr>
              ))}
              <tr className="trade-table-total"><th scope="row">Combined</th><td>{formatBillions(commodityExposureMillions)}</td><td>{formatPercent(shareOfExports(commodityExposureMillions))}</td></tr>
            </tbody>
          </table>
        </div>
        <div className="table-wrap trade-table" role="region" aria-label="Largest export market" tabIndex={0}>
          <table>
            <caption>Largest export market</caption>
            <thead><tr><th scope="col">Destination</th><th scope="col">Gross exports</th><th scope="col">Share of all exports</th></tr></thead>
            <tbody><tr><th scope="row">{tradeReference.buyer.name}</th><td>{formatBillions(tradeReference.buyer.exportsMillions)}</td><td>{formatPercent(shareOfExports(tradeReference.buyer.exportsMillions))}</td></tr></tbody>
          </table>
        </div>
      </div>

      <p className="table-note trade-source">Nominal Australian dollars. DFAT’s {tradeReference.release} release uses recorded trade for goods and balance-of-payments figures for services and the national total. Partner figures may omit some confidential goods. The scenarios estimate the direct effect on gross receipts. GDP, employment and public revenue are outside their scope.</p>
      <p className="trade-source-link"><a href={tradeReference.sourceUrl}>DFAT’s calendar {tradeReference.calendarYear} trade factsheet (PDF)</a></p>
    </section>
  );
}
