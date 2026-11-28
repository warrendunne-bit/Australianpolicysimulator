export function monthlyMortgagePayment(principal: number, annualRatePercent: number, termYears: number) {
  const monthlyRate = annualRatePercent / 100 / 12;
  const months = termYears * 12;
  return monthlyRate === 0 ? principal / months : principal * monthlyRate / (1 - (1 + monthlyRate) ** -months);
}
