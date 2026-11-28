import { round } from '../core/modelMath';
import { dieselResilienceId, energyIssueId } from './routes';
import type { PolicyExercise } from './types';

export const dieselResilience: PolicyExercise = {
  id: dieselResilienceId,
  issueId: energyIssueId,
  title: 'Keeping diesel available through an import disruption',
  description: 'In this example, a supply disruption cuts imports of finished diesel and the inputs used to make diesel in Australia. Compare local production, alternative suppliers, emergency stocks and ways to use less diesel.',
  inputs: [
    {
      id: 'reserveDays', label: 'Diesel held in emergency reserves', unit: 'days of usual use', reference: 8, initial: 12, min: 0, max: 90, step: 1,
      description: 'One day of stock is one full day of usual demand. If other supplies keep arriving, the reserve may last longer.',
    },
    { id: 'localProduction', label: 'Diesel usually made in Australia', unit: '% of usual demand', reference: 20, initial: 25, min: 0, max: 100, step: 1 },
    { id: 'localInputs', label: 'Australian-made diesel that uses Australian inputs', unit: '% of local production', reference: 30, initial: 50, min: 0, max: 100, step: 1 },
    {
      id: 'alternativeImports', label: 'Finished diesel imports from suppliers still delivering', unit: '% of usual imports', reference: 20, initial: 30, min: 0, max: 100, step: 1,
      description: 'These suppliers keep shipping at their usual rate throughout the disruption.',
    },
    {
      id: 'demandReduction', label: 'Reduction in diesel demand', unit: '% of usual demand', reference: 0, initial: 5, min: 0, max: 50, step: 1,
      description: 'Assume efficiency or switching fuels keeps the same work running with less diesel.',
    },
    { id: 'reserveDeliveryLimit', label: 'Maximum reserve deliveries', unit: 'ML per day', reference: 40, initial: 40, min: 0, max: 500, step: 1 },
    { id: 'usualDemand', label: 'Usual daily diesel demand', unit: 'ML per day', initial: 100, min: 10, max: 500, step: 5 },
    { id: 'disruptionDays', label: 'Duration of disruption', unit: 'days', initial: 45, min: 1, max: 180, step: 1 },
    { id: 'finishedDieselLoss', label: 'Drop in shipments from disrupted diesel suppliers', unit: '%', initial: 60, min: 0, max: 100, step: 1 },
    { id: 'feedstockLoss', label: 'Drop in imported inputs for Australian diesel production', unit: '%', initial: 60, min: 0, max: 100, step: 1 },
    { id: 'holdingCost', label: 'Annual cost to hold a litre in reserve', unit: 'A$ per litre', initial: 0.08, min: 0, max: 1, step: 0.01 },
  ],
  calculate: ({
    reserveDays, localProduction, localInputs, alternativeImports, demandReduction, reserveDeliveryLimit,
    usualDemand, disruptionDays, finishedDieselLoss, feedstockLoss, holdingCost,
  }) => {
    const dailyDemand = usualDemand * (100 - demandReduction) / 100;
    const normalLocalProduction = usualDemand * localProduction / 100;
    const dieselFromLocalInputs = normalLocalProduction * localInputs / 100;
    const dieselFromImportedInputs = (normalLocalProduction - dieselFromLocalInputs) * (100 - feedstockLoss) / 100;
    const continuedLocalProduction = dieselFromLocalInputs + dieselFromImportedInputs;

    const normalImports = usualDemand - normalLocalProduction;
    const unaffectedImports = normalImports * alternativeImports / 100;
    const continuedImports = unaffectedImports + (normalImports - unaffectedImports) * (100 - finishedDieselLoss) / 100;
    const dailyShortfall = Math.max(0, round(dailyDemand - continuedLocalProduction - continuedImports, 6));

    const reserveVolume = usualDemand * reserveDays;
    const reserveDrawPerDay = Math.min(dailyShortfall, reserveDeliveryLimit);
    const reservesUsed = Math.min(reserveVolume, reserveDrawPerDay * disruptionDays);
    const unmetDemand = round(dailyShortfall * disruptionDays - reservesUsed, 6);
    const daysFullyCovered = dailyShortfall === 0
      ? disruptionDays
      : dailyShortfall > reserveDeliveryLimit ? 0 : Math.min(disruptionDays, reserveVolume / dailyShortfall);

    return [
      { id: 'unmet-diesel', label: 'Diesel demand left unmet during the disruption', value: unmetDemand, unit: 'ML', decimals: 1 },
      { id: 'reserve-cost', label: 'Annual cost of holding the reserve', value: reserveVolume * holdingCost, unit: 'A$ million per year', decimals: 1 },
      { id: 'days-covered', label: 'Days of full supply from the start', value: daysFullyCovered, unit: 'days', decimals: 1 },
      { id: 'local-input-coverage', label: 'Daily demand that diesel from Australian inputs can cover', value: Math.min(100, dieselFromLocalInputs / dailyDemand * 100), unit: '%', decimals: 1 },
      { id: 'daily-demand', label: 'Daily diesel demand during the disruption', value: dailyDemand, unit: 'ML per day', decimals: 1 },
      { id: 'daily-local-output', label: 'Australian production during the disruption', value: continuedLocalProduction, unit: 'ML per day', decimals: 1 },
      { id: 'daily-finished-imports', label: 'Finished diesel imports during the disruption', value: continuedImports, unit: 'ML per day', decimals: 1 },
      { id: 'reserves-used', label: 'Diesel drawn from reserves', value: reservesUsed, unit: 'ML', decimals: 1 },
      { id: 'reserves-left', label: 'Diesel left in reserves at the end', value: reserveVolume - reservesUsed, unit: 'ML', decimals: 1 },
    ];
  },
  assumptions: [
    'All inputs are illustrative. ML means million litres. Usual supply equals usual demand and is split between Australian production and imports of finished diesel. The scenario applies the demand reduction and changes in production or suppliers before the disruption starts.',
    'Suppliers and refineries operating through the disruption deliver at constant rates. Australian inputs stay available. An imported input shortfall cuts the diesel output that depends on it by the same percentage.',
    'The model uses available production and imports first, then draws down stocks up to the daily delivery limit. Stocks start full and are drawn only to cover a shortfall. Days of full supply counts demand met in full from the start of the disruption.',
    'Annual reserve cost uses the starting stock volume and the assumed cost of holding a litre. A full economic comparison would also price additional production, import contracts, distribution and demand reductions, and estimate which users would face shortages.',
  ],
};
