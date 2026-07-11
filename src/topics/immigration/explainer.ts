export type ExplainerItem = {
  term: string;
  plainEnglish: string;
  whyItMatters: string;
};

export const IMMIGRATION_EXPLAINER: ExplainerItem[] = [
  {
    term: 'Net overseas migration',
    plainEnglish: 'Arrivals minus departures over a period. It can be positive, zero or negative.',
    whyItMatters: 'It changes population growth, but the same net number can hide very different arrivals and departures.',
  },
  {
    term: 'Permanent migration',
    plainEnglish: 'People granted permanent residency through skilled, family, humanitarian or other pathways.',
    whyItMatters: 'Permanent migration affects long-term settlement, tax, services and ageing differently from temporary migration.',
  },
  {
    term: 'Temporary migration',
    plainEnglish: 'People in Australia temporarily, such as students, working holiday makers and temporary skilled workers.',
    whyItMatters: 'Temporary residents can strongly affect housing, jobs, universities and departures even if they never become permanent residents.',
  },
  {
    term: 'Skilled migration',
    plainEnglish: 'Migration pathways that prioritise workers with skills Australia says it needs.',
    whyItMatters: 'Skill fit changes whether arrivals ease shortages, raise productivity and improve tax capacity.',
  },
  {
    term: 'Family migration',
    plainEnglish: 'Migration that allows family reunion, including partners and some dependent relatives.',
    whyItMatters: 'Family migration affects settlement, cohesion, caring relationships and household formation.',
  },
  {
    term: 'Humanitarian migration',
    plainEnglish: 'Protection and resettlement pathways for refugees and people in humanitarian need.',
    whyItMatters: 'The policy goal is protection; short-run settlement support can be high while long-run contribution depends on opportunity and integration.',
  },
  {
    term: 'International students',
    plainEnglish: 'Temporary migrants studying in Australia, often concentrated around universities and rental markets.',
    whyItMatters: 'They affect education revenue, housing demand, part-time labour and future skilled pathways.',
  },
  {
    term: 'Departures',
    plainEnglish: 'People leaving Australia, including temporary migrants, permanent residents and Australians moving overseas.',
    whyItMatters: 'Departures are why migration must be modelled as flows, not just arrivals.',
  },
  {
    term: 'Returning Australians',
    plainEnglish: 'Australian citizens or residents coming back after time overseas.',
    whyItMatters: 'They can add population and housing demand without being counted as new migrants in political shorthand.',
  },
  {
    term: 'Migrant age profile',
    plainEnglish: 'The age mix of arrivals, especially how many are working-age adults, children or older people.',
    whyItMatters: 'A younger age profile can improve workers-per-retiree and tax capacity, while also adding housing and service demand.',
  },
  {
    term: 'Different timelines',
    plainEnglish: 'Housing pressure can appear immediately, while tax, ageing, infrastructure and cohesion effects can unfold over many years.',
    whyItMatters: 'This is why the lab runs year by year instead of only showing short, medium and long summaries.',
  },
];

export const TOPIC_INTRODUCTION = {
  title: 'Immigration Scenario Lab',
  summary:
    'A topic-based, entity-driven simulator for exploring how immigration settings flow through population, housing, labour, government, regions, environment and social outcomes from 2026 onward.',
  disclaimer:
    'This is an illustrative civic-learning prototype. Values are placeholder assumptions unless labelled otherwise. It is not an official forecast, policy cost estimate or recommendation.',
};
