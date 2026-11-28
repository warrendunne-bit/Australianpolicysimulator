import { round } from '../core/modelMath';
import { electricityMixId, energyIssueId } from './routes';
import type { PolicyExercise } from './types';

const thermalAvailability = 0.9;

const stressPeriods = [
  { id: 'calm-evening', label: 'Calm evening', hours: 4, solar: 0, wind: 0.1, fuelDisrupted: false, plantOutage: false },
  { id: 'fuel-disruption', label: 'Daytime fuel disruption', hours: 4, solar: 0.5, wind: 0.45, fuelDisrupted: true, plantOutage: false },
  { id: 'combined-shortfall', label: 'Calm night with disrupted fuel', hours: 12, solar: 0, wind: 0.1, fuelDisrupted: true, plantOutage: false },
  { id: 'plant-outage', label: 'Calm evening with a large plant offline', hours: 4, solar: 0, wind: 0.1, fuelDisrupted: false, plantOutage: true },
];

export const electricityMix: PolicyExercise = {
  id: electricityMixId,
  issueId: energyIssueId,
  title: 'How different energy mixes hold up under stress',
  description: 'Compare what solar, wind, nuclear, gas and coal can deliver at the same level of electricity demand. Test storage and independent fossil fuel suppliers as well. Australian federal law currently bars approval of civilian nuclear power plants, so nuclear is a hypothetical longer-term option.',
  inputs: [
    { id: 'solarMW', label: 'Solar capacity', unit: 'MW', reference: 60, initial: 60, min: 0, max: 500, step: 5 },
    { id: 'windMW', label: 'Wind capacity', unit: 'MW', reference: 70, initial: 90, min: 0, max: 500, step: 5 },
    { id: 'nuclearMW', label: 'Hypothetical nuclear capacity', unit: 'MW', reference: 0, initial: 0, min: 0, max: 500, step: 5 },
    { id: 'gasMW', label: 'Gas-fired capacity', unit: 'MW', reference: 50, initial: 50, min: 0, max: 500, step: 5 },
    { id: 'coalMW', label: 'Coal-fired capacity', unit: 'MW', reference: 60, initial: 40, min: 0, max: 500, step: 5 },
    { id: 'storageMW', label: 'Storage discharge capacity', unit: 'MW', reference: 25, initial: 25, min: 0, max: 500, step: 5 },
    {
      id: 'storageHours', label: 'Storage duration at full discharge', unit: 'hours', reference: 4, initial: 4, min: 1, max: 48, step: 1,
      description: '25 MW for 4 hours stores 100 MWh of usable energy.',
    },
    {
      id: 'independentGas', label: 'Gas fuel needs covered by independent suppliers', unit: '%', reference: 20, initial: 60, min: 0, max: 100, step: 5,
      description: 'Share that can still reach gas plants if the other suppliers or their delivery routes are disrupted.',
    },
    {
      id: 'independentCoal', label: 'Coal fuel needs covered by independent suppliers', unit: '%', reference: 40, initial: 60, min: 0, max: 100, step: 5,
      description: 'Share that can still reach coal plants if the other suppliers or their delivery routes are disrupted.',
    },
    { id: 'demandMW', label: 'Electricity demand', unit: 'MW', initial: 105, min: 0, max: 1_000, step: 5 },
    { id: 'fuelLoss', label: 'Loss of fuel from exposed suppliers', unit: '%', initial: 75, min: 0, max: 100, step: 5 },
    { id: 'outageMW', label: 'Available capacity lost in a plant outage', unit: 'MW', initial: 40, min: 0, max: 500, step: 5 },
    {
      id: 'contractCost', label: 'Annual cost of alternative fuel contracts', unit: 'A$ thousand per MW covered', initial: 35, min: 0, max: 500, step: 5,
      description: 'An assumed fee for each MW of gas and coal capacity whose fuel needs are covered by independent suppliers.',
    },
  ],
  calculate: ({
    solarMW, windMW, nuclearMW, gasMW, coalMW, storageMW, storageHours, independentGas, independentCoal,
    demandMW, fuelLoss, outageMW, contractCost,
  }) => {
    const independentGasMW = gasMW * independentGas / 100;
    const independentCoalMW = coalMW * independentCoal / 100;
    const storageMWh = storageMW * storageHours;
    const stressOutcomes = stressPeriods.map((period) => {
      const fuelShortfall = period.fuelDisrupted ? fuelLoss / 100 : 0;
      const availableGas = (gasMW - (gasMW - independentGasMW) * fuelShortfall) * thermalAvailability;
      const availableCoal = (coalMW - (coalMW - independentCoalMW) * fuelShortfall) * thermalAvailability;
      const availableNuclear = nuclearMW * thermalAvailability;
      const lostOutput = period.plantOutage
        ? Math.min(outageMW, Math.max(availableGas, availableCoal, availableNuclear))
        : 0;
      const generation = solarMW * period.solar + windMW * period.wind
        + availableGas + availableCoal + availableNuclear - lostOutput;
      const energyGap = Math.max(0, demandMW - generation) * period.hours;
      const energyFromStorage = Math.min(energyGap, storageMW * period.hours, storageMWh);
      return {
        id: period.id,
        label: period.label,
        description: `${period.hours} hours of demand tested`,
        value: round(energyGap - energyFromStorage),
        unit: 'MWh unmet',
        decimals: 1,
      };
    });
    return [
      ...stressOutcomes,
      { id: 'alternative-fuel-cost', label: 'Annual cost of alternative fuel contracts', value: (independentGasMW + independentCoalMW) * contractCost / 1_000, unit: 'A$ million per year', decimals: 2 },
      { id: 'installed-generation', label: 'Total installed generation capacity', value: solarMW + windMW + nuclearMW + gasMW + coalMW, unit: 'MW' },
      { id: 'exposed-fossil-capacity', label: 'Gas and coal capacity reliant on exposed suppliers', value: gasMW + coalMW - independentGasMW - independentCoalMW, unit: 'MW', decimals: 1 },
      { id: 'usable-storage', label: 'Usable energy in storage at the start of each test', value: storageMWh, unit: 'MWh' },
    ];
  },
  assumptions: [
    'Each test starts separately with the same demand and a full store. Solar supplies 50% of its installed capacity by day in the example and zero at night. Wind supplies 45% by day and 10% during calm periods. These are assumed conditions.',
    'Gas, coal and nuclear can supply 90% of installed capacity before disruptions. In a fuel shock, the chosen loss applies only to the exposed shares of gas and coal fuel. Independent supplies must have fuel and a working route for the whole period. Nuclear fuel is assumed to be on hand.',
    'In the plant outage test, the lost power is capped by the available output of the largest gas, coal or nuclear fleet. Storage covers the remaining gap within its discharge limit and the energy it held at the start of the test.',
    'The cost shown covers the assumed annual fee for alternative gas and coal supply contracts. A whole-system comparison also needs plant, operating and fuel costs, network investment, build times, emissions and the likelihood of events.',
  ],
};
