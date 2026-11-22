export const tradeReference = {
  calendarYear: 2025,
  release: "October 2026",
  sourceUrl: "https://www.dfat.gov.au/sites/default/files/australias-goods-services-exports-import.pdf",
  totalExportsMillions: 665_743,
  products: [
    { name: "Iron ore and concentrates", exportsMillions: 120_830 },
    { name: "Coal", exportsMillions: 64_172 },
    { name: "Natural gas", exportsMillions: 60_173 },
  ],
  buyer: { name: "China", exportsMillions: 196_054 },
} as const;

export type TradeStressKind = "commodity-prices" | "buyer-demand";

export const commodityExposureMillions = tradeReference.products.reduce(
  (sum, product) => sum + product.exportsMillions,
  0,
);

export function shareOfExports(valueMillions: number): number {
  return valueMillions / tradeReference.totalExportsMillions * 100;
}

export function calculateTradeStress(kind: TradeStressKind, declinePercent: number) {
  if (!Number.isFinite(declinePercent) || declinePercent < 0 || declinePercent > 100) {
    throw new RangeError("The trade shock must be between 0% and 100%.");
  }

  const exposedExportsMillions = kind === "commodity-prices"
    ? commodityExposureMillions
    : tradeReference.buyer.exportsMillions;
  const lossMillions = exposedExportsMillions * (declinePercent / 100);

  return {
    lossMillions,
    lossSharePercent: shareOfExports(lossMillions),
    remainingExportsMillions: tradeReference.totalExportsMillions - lossMillions,
  };
}
