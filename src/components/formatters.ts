export function formatNumber(value: number) {
  return new Intl.NumberFormat('en-AU').format(Math.round(value));
}

export function formatMoney(value: number) {
  return `$${value.toFixed(0)}b`;
}

export function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}
