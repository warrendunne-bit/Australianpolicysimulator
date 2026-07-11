export type ConfidenceRating = 'low' | 'medium' | 'high';
export type NetImpact = 'positive' | 'negative' | 'mixed' | 'uncertain';

export type ImmigrationEntityCategory =
  | 'people'
  | 'households'
  | 'companies'
  | 'government'
  | 'environment'
  | 'regions';

export type ImmigrationEntity = {
  id: string;
  label: string;
  category: ImmigrationEntityCategory;
  description: string;
};

export const IMMIGRATION_ENTITIES: ImmigrationEntity[] = [
  { id: 'age-groups', label: 'Age groups', category: 'people', description: 'Children, students, working-age adults and older Australians experience migration differently.' },
  { id: 'working-age-population', label: 'Working-age population', category: 'people', description: 'People aged roughly 15-64 who can expand the labour force and tax base.' },
  { id: 'retirees', label: 'Retirees', category: 'people', description: 'Older Australians affected by aged care capacity, pension funding and service queues.' },
  { id: 'students', label: 'Students', category: 'people', description: 'Domestic and international students using education, housing and transport systems.' },
  { id: 'children', label: 'Children', category: 'people', description: 'Future school demand and future workforce pipeline.' },
  { id: 'migrants-already-in-australia', label: 'Migrants already in Australia', category: 'people', description: 'People whose settlement outcomes depend on jobs, recognition, housing and cohesion.' },
  { id: 'future-arrivals', label: 'Future arrivals', category: 'people', description: 'New temporary and permanent arrivals under a scenario.' },
  { id: 'future-departures', label: 'Future departures', category: 'people', description: 'People leaving Australia, including temporary residents and returning Australians.' },

  { id: 'single-renters', label: 'Single renters', category: 'households', description: 'Highly exposed to rent increases and vacancy pressure.' },
  { id: 'couple-renters', label: 'Couple renters', category: 'households', description: 'Affected by rents, wages and job options.' },
  { id: 'families-with-children', label: 'Families with children', category: 'households', description: 'Affected by housing, schools, health care and cost of living.' },
  { id: 'first-home-buyers', label: 'First-home buyers', category: 'households', description: 'Sensitive to dwelling prices, rents, wages and interest-rate pressure.' },
  { id: 'mortgage-holders', label: 'Mortgage holders', category: 'households', description: 'Can benefit from asset values but lose from service pressure and interest rates.' },
  { id: 'homeowners-without-mortgage', label: 'Homeowners without mortgage', category: 'households', description: 'Less exposed to rent but still affected by services, tax and environment.' },
  { id: 'retiree-households', label: 'Retiree households', category: 'households', description: 'Affected by aged care labour supply, pension sustainability and health services.' },
  { id: 'investor-owned-rentals', label: 'Investor-owned rental households', category: 'households', description: 'Owners of rental properties affected by demand, rents and asset values.' },

  { id: 'small-businesses', label: 'Small businesses', category: 'companies', description: 'Need workers and customers but can be squeezed by rents and infrastructure constraints.' },
  { id: 'large-businesses', label: 'Large businesses', category: 'companies', description: 'Often benefit from deeper labour markets and higher aggregate demand.' },
  { id: 'construction-sector', label: 'Construction sector', category: 'companies', description: 'Builds housing and infrastructure, but itself needs labour and materials.' },
  { id: 'health-aged-care-sector', label: 'Health and aged care sector', category: 'companies', description: 'Faces rising demand and workforce shortages as the population ages.' },
  { id: 'education-universities', label: 'Education / university sector', category: 'companies', description: 'International students affect revenue, housing demand and local economies.' },
  { id: 'agriculture-regional-employers', label: 'Agriculture and regional employers', category: 'companies', description: 'Often rely on seasonal, temporary and regional migration pathways.' },
  { id: 'technology-professional-services', label: 'Technology / professional services', category: 'companies', description: 'Sensitive to skilled migration and productivity growth.' },
  { id: 'consumer-facing-businesses', label: 'Consumer-facing businesses', category: 'companies', description: 'Benefit from more customers, but face labour and rent constraints.' },

  { id: 'federal-government', label: 'Federal government', category: 'government', description: 'Receives income tax and funds migration, welfare, health, aged care and national infrastructure.' },
  { id: 'state-governments', label: 'State governments', category: 'government', description: 'Carry much of the hospital, school, transport and housing delivery pressure.' },
  { id: 'local-councils', label: 'Local councils', category: 'government', description: 'Experience local infrastructure, planning and amenity pressure.' },
  { id: 'tax-revenue', label: 'Tax revenue', category: 'government', description: 'Changes with workers, wages, company activity and consumption.' },
  { id: 'health-spending', label: 'Health spending', category: 'government', description: 'Affected by population size, age structure and health workforce.' },
  { id: 'aged-care-spending', label: 'Aged care spending', category: 'government', description: 'Rises with ageing and depends on worker availability.' },
  { id: 'education-spending', label: 'Education spending', category: 'government', description: 'Depends on children, students and university settings.' },
  { id: 'infrastructure-spending', label: 'Infrastructure spending', category: 'government', description: 'Roads, transport, utilities and community infrastructure need to keep pace.' },
  { id: 'welfare-pension-spending', label: 'Welfare and pension spending', category: 'government', description: 'Affected by ageing, employment and fiscal capacity.' },

  { id: 'land-use', label: 'Land use', category: 'environment', description: 'Housing and infrastructure expansion can increase land-use pressure.' },
  { id: 'water-demand', label: 'Water demand', category: 'environment', description: 'Population and agriculture affect demand for water.' },
  { id: 'energy-demand', label: 'Energy demand', category: 'environment', description: 'More households and businesses use more energy unless efficiency improves.' },
  { id: 'emissions', label: 'Emissions', category: 'environment', description: 'Economic activity, transport and energy mix influence emissions.' },
  { id: 'waste', label: 'Waste', category: 'environment', description: 'Waste streams grow with population and consumption.' },
  { id: 'biodiversity-pressure', label: 'Biodiversity pressure', category: 'environment', description: 'Urban expansion and resource use can affect ecosystems.' },

  { id: 'capital-cities', label: 'Capital cities', category: 'regions', description: 'Receive most arrivals in the base placeholder assumption.' },
  { id: 'outer-suburbs', label: 'Outer suburbs', category: 'regions', description: 'Often absorb housing growth and transport pressure.' },
  { id: 'regional-towns', label: 'Regional towns', category: 'regions', description: 'Can benefit from settlement when jobs, housing and services align.' },
  { id: 'rural-areas', label: 'Rural areas', category: 'regions', description: 'Affected by seasonal labour, services and infrastructure distance.' },
];

export const TRADE_OFF_GROUPS = [
  'Young renters',
  'First-home buyers',
  'Homeowners',
  'Property investors',
  'Existing workers',
  'Job seekers',
  'Small businesses',
  'Large businesses',
  'Retirees',
  'Future generations',
  'Federal government',
  'State governments',
  'Regional towns',
  'Capital cities',
  'Universities',
  'Health and aged care providers',
  'Migrants and migrant families',
  'Environment',
] as const;

export type TradeOffGroup = (typeof TRADE_OFF_GROUPS)[number];
