export type EventKind =
  | 'inflation shock'
  | 'war / geopolitical shock'
  | 'housing supply shock'
  | 'productivity shock'
  | 'climate event'
  | 'policy change';

export type SimulationEvent = {
  id: string;
  name: string;
  kind: EventKind;
  year: number;
  intensity: number;
  explanation: string;
};

export type EventEffects = {
  growth: number;
  inflation: number;
  housingSupply: number;
  productivity: number;
  cohesion: number;
  environment: number;
  spending: number;
};

export const DEFAULT_EVENTS: SimulationEvent[] = [
  {
    id: 'inflation',
    name: 'Inflation shock',
    kind: 'inflation shock',
    year: 1,
    intensity: 0.7,
    explanation: 'Higher prices reduce household purchasing power and raise business costs.',
  },
  {
    id: 'geopolitical',
    name: 'War / geopolitical shock',
    kind: 'war / geopolitical shock',
    year: 2,
    intensity: 0.6,
    explanation: 'Trade disruption lowers exporter confidence and raises public spending pressure.',
  },
  {
    id: 'housing-supply',
    name: 'Housing supply shock',
    kind: 'housing supply shock',
    year: 1,
    intensity: 0.8,
    explanation: 'Construction delays reduce effective housing supply and raise housing stress.',
  },
  {
    id: 'productivity',
    name: 'Productivity shock',
    kind: 'productivity shock',
    year: 1,
    intensity: 0.6,
    explanation: 'Higher productivity lifts company output, wages and government revenue.',
  },
  {
    id: 'climate',
    name: 'Climate event',
    kind: 'climate event',
    year: 3,
    intensity: 0.7,
    explanation: 'Climate disruption damages wellbeing, infrastructure and environmental quality.',
  },
  {
    id: 'policy-change',
    name: 'Policy change',
    kind: 'policy change',
    year: 2,
    intensity: 0.5,
    explanation: 'A mid-simulation policy shift improves integration delivery but adds public cost.',
  },
];

export function getEventEffects(events: SimulationEvent[]): EventEffects {
  return events.reduce<EventEffects>(
    (effects, event) => {
      const amount = event.intensity;
      if (event.kind === 'inflation shock') {
        effects.growth -= amount * 0.5;
        effects.inflation += amount;
      }
      if (event.kind === 'war / geopolitical shock') {
        effects.growth -= amount * 0.35;
        effects.cohesion -= amount * 5;
        effects.spending += amount * 10;
      }
      if (event.kind === 'housing supply shock') {
        effects.housingSupply -= amount * 0.18;
      }
      if (event.kind === 'productivity shock') {
        effects.productivity += amount * 8;
        effects.growth += amount * 0.45;
      }
      if (event.kind === 'climate event') {
        effects.environment += amount * 10;
        effects.growth -= amount * 0.25;
        effects.spending += amount * 8;
      }
      if (event.kind === 'policy change') {
        effects.cohesion += amount * 6;
        effects.spending += amount * 6;
      }
      return effects;
    },
    {
      growth: 0,
      inflation: 0,
      housingSupply: 1,
      productivity: 0,
      cohesion: 0,
      environment: 0,
      spending: 0,
    },
  );
}
