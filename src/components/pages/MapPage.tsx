import type { ComponentProps } from 'react';
import { PopulationGrowthScreen } from '../PopulationGrowthScreen';

export function MapPage(props: ComponentProps<typeof PopulationGrowthScreen>) {
  return <PopulationGrowthScreen {...props} />;
}
