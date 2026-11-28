import { energyIssueId, regionalElectricityId } from './routes';
import type { PolicyExercise } from './types';

const peakHours = 4;

export const regionalElectricity: PolicyExercise = {
  id: regionalElectricityId,
  issueId: energyIssueId,
  title: 'Keeping a region powered through an evening peak',
  description: 'A buyer supplies electricity to local homes, shops and factories. In the reference case it buys available grid power at the going price. Try booking extra power, fixing the price of some grid purchases, or doing both.',
  inputs: [
    { id: 'reserveMW', label: 'Reserve power booked for the peak', unit: 'MW', reference: 0, initial: 15, min: 0, max: 200, step: 1,
      description: 'Extra capacity that can deliver for the full four hours, such as a charged battery or a generator with fuel.' },
    { id: 'fixedShare', label: 'Grid purchases at a fixed price', unit: '%', reference: 0, initial: 50, min: 0, max: 100, step: 5 },
    { id: 'demandMW', label: 'Electricity demand during the peak', unit: 'MW', initial: 100, min: 0, max: 500, step: 1 },
    { id: 'availableMW', label: 'Grid supply available before reserves', unit: 'MW', initial: 80, min: 0, max: 500, step: 1 },
    { id: 'spotPrice', label: 'Spot price during the peak', unit: 'A$ per MWh', initial: 250, min: -100, max: 2_000, step: 5 },
    { id: 'fixedPrice', label: 'Contract price for fixed-price purchases', unit: 'A$ per MWh', initial: 120, min: 0, max: 1_000, step: 5 },
    { id: 'bookingFee', label: 'Fee to book reserve capacity', unit: 'A$ per MW for the peak', initial: 300, min: 0, max: 5_000, step: 10 },
    { id: 'reservePrice', label: 'Price of electricity drawn from reserve', unit: 'A$ per MWh', initial: 180, min: 0, max: 2_000, step: 5 },
  ],
  calculate: ({ reserveMW, fixedShare, demandMW, availableMW, spotPrice, fixedPrice, bookingFee, reservePrice }) => {
    const demand = demandMW * peakHours;
    const fromGrid = Math.min(demandMW, availableMW) * peakHours;
    const fromReserve = Math.min(demand - fromGrid, reserveMW * peakHours);
    const fixedPurchases = fromGrid * fixedShare / 100;
    const spotPurchases = fromGrid - fixedPurchases;
    const gridCost = fixedPurchases * fixedPrice + spotPurchases * spotPrice;
    const reserveCost = reserveMW * bookingFee + fromReserve * reservePrice;

    return [
      { id: 'unserved', label: 'Electricity demand left unmet', value: demand - fromGrid - fromReserve, unit: 'MWh' },
      { id: 'procurement-cost', label: 'Total cost to the buyer for the peak', value: gridCost + reserveCost, unit: 'A$' },
      { id: 'delivered', label: 'Electricity delivered to customers', value: fromGrid + fromReserve, unit: 'MWh' },
      { id: 'reserve-energy', label: 'Electricity drawn from reserve', value: fromReserve, unit: 'MWh' },
      { id: 'spot-exposure', label: 'Grid electricity exposed to the spot price', value: spotPurchases, unit: 'MWh', decimals: 1 },
      { id: 'grid-cost', label: 'Cost of grid electricity purchases', value: gridCost, unit: 'A$' },
      { id: 'reserve-cost', label: 'Cost of booking and using reserves', value: reserveCost, unit: 'A$' },
    ];
  },
  assumptions: [
    'Demand, available supply and prices are constant over one illustrative four-hour peak. One megawatt (MW) delivered for four hours supplies four megawatt-hours (MWh). The buyer uses available grid power first and calls on reserves for the remaining demand.',
    'The buyer pays a booking fee on every MW reserved and a running charge on each MWh drawn. Booked reserves have enough stored energy or fuel and network capacity to reach customers throughout the peak.',
    'The fixed price applies to the selected share of grid electricity actually delivered. A contract can cost more when the spot price is low. The price agreement changes the amount paid for existing supply.',
    'Results cover electricity purchases and reserve fees for this peak. Retail bills also depend on network charges, retailer costs, taxes and rebates. Estimating annual costs or lost production would require data on how often shortages occur and which customers lose power.',
  ],
};
