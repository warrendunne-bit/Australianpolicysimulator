import { monthlyMortgagePayment } from './mortgage';

export const firstHomeAssumptions = {
  monthlyTakeHomePay: 7_000,
  monthlyOtherEssentials: 3_000,
  monthlyCashBuffer: 500,
  savingsAvailable: 45_000,
  monthlyRent: 2_400,
  monthlyOwnerCosts: 400,
  buyingCostsPercent: 3,
  mortgageTermYears: 30,
  fartherPrice: 520_000,
  nearCommute: { minutes: 25, monthlyCost: 200 },
  farCommute: { minutes: 60, monthlyCost: 500 },
};

export const defaultFirstHomeSettings = {
  nearPrice: 600_000,
  depositPercent: 20,
  ratePercent: 6,
};

export function compareFirstHome({ nearPrice, depositPercent, ratePercent }: typeof defaultFirstHomeSettings) {
  const assumptions = firstHomeAssumptions;
  const budgetBeforeHousingAndTravel = assumptions.monthlyTakeHomePay - assumptions.monthlyOtherEssentials;
  const renterCash = budgetBeforeHousingAndTravel - assumptions.monthlyRent - assumptions.nearCommute.monthlyCost;
  const monthlyDepositSavings = renterCash - assumptions.monthlyCashBuffer;

  function purchase(price: number, commute: typeof assumptions.nearCommute) {
    const deposit = price * depositPercent / 100;
    const upfrontCash = deposit + price * assumptions.buyingCostsPercent / 100;
    const mortgage = monthlyMortgagePayment(price - deposit, ratePercent, assumptions.mortgageTermYears);
    return {
      price,
      commute,
      upfrontCash,
      monthsToSave: Math.ceil(Math.max(0, upfrontCash - assumptions.savingsAvailable) / monthlyDepositSavings),
      monthlyHousing: mortgage + assumptions.monthlyOwnerCosts,
      monthlyCash: budgetBeforeHousingAndTravel - mortgage - assumptions.monthlyOwnerCosts - commute.monthlyCost,
    };
  }

  return {
    renting: { monthlyHousing: assumptions.monthlyRent, commute: assumptions.nearCommute, monthlyCash: renterCash },
    nearer: purchase(nearPrice, assumptions.nearCommute),
    farther: purchase(assumptions.fartherPrice, assumptions.farCommute),
    monthlyDepositSavings,
  };
}
