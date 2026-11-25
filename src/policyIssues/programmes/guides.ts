export interface ProgrammeGuide {
  controlId: string;
  action: string;
  population: string;
  timeframe: string;
  outcomeId: string;
  costId: string;
  interpretation: string;
  evaluation: string;
}

export const programmeGuides: Readonly<Record<string, ProgrammeGuide>> = {
  'energy-and-adaptation': {
    controlId: 'upgradeTarget',
    action: 'Increase the number of buildings planned for upgrades. Compare the electricity bought over a full year and check how much essential service time the package preserves in the example outage.',
    population: 'Public buildings in the selected portfolio, with one essential service in each building.',
    timeframe: 'A full year after upgrades for electricity use and bills, one outage for continuity and an upfront capital cost.',
    outcomeId: 'electricity',
    costId: 'capital-cost',
    interpretation: 'Upgrading more buildings can reduce purchased power and protect more service hours. The number of buildings limits coverage, and longer outages can exceed backup capacity.',
    evaluation: 'Use meter and maintenance records to check savings over several years. Record which essential services kept running when power failed.',
  },
  'critical-systems': {
    controlId: 'activationHours',
    action: 'Shorten the time until fallback access starts. Compare customer-hours preserved during the same outage and look at the annual cost of keeping the service ready.',
    population: 'Customers whose usual payment service is affected in the example disruption.',
    timeframe: 'One outage for payment access and one year for readiness costs.',
    outcomeId: 'protected-hours',
    costId: 'readiness-cost',
    interpretation: 'Earlier activation can preserve more time for customers eligible for fallback. Readiness spending is a separate input, so enter any additional cost of responding faster.',
    evaluation: 'Use provider outage records to track activation time, who could still pay and whether usual and fallback services failed together.',
  },
  'government-evaluation': {
    controlId: 'reviewPercent',
    action: 'Increase the share of completed cases selected for review. Compare cases reviewed, the year-end backlog and delivery cost with the same incoming caseload.',
    population: 'Cases within one service, including new cases and those already waiting.',
    timeframe: 'One operating year.',
    outcomeId: 'yearEndBacklog',
    costId: 'annualCost',
    interpretation: 'Processing and review draw from the same staff hours. More review can enlarge the sample and may leave more cases waiting when capacity is tight.',
    evaluation: 'Track actual wait times and the results of case reviews to see whether decisions improve and how long people wait.',
  },
  'early-years-and-skills': {
    controlId: 'openingDelay',
    action: 'Shorten the time to open services. Compare first-year early-learning places and how many more adult trainees finish within the year.',
    population: 'Children using local early-years services and adults entering funded training.',
    timeframe: 'The first year, including any delay before services open.',
    outcomeId: 'training-completions',
    costId: 'spending',
    interpretation: 'Opening earlier extends access for children and gives more adults time to finish training. Spending includes first-year early-learning delivery and commitments for all adults who start courses.',
    evaluation: 'Track who gains access, children’s later development and adult trainees’ employment and earnings after completion.',
  },
  'income-security': {
    controlId: 'replacementRate',
    action: 'Increase the share of the pay gap covered. Compare the weekly gap that remains and check how many workers get a top-up and what the cohort costs.',
    population: 'A cohort of displaced workers. The top-up applies to eligible participants who take lower-paid jobs.',
    timeframe: 'The selected weeks of wage support, with placement and training costs counted once per participant.',
    outcomeId: 'remaining-gap',
    costId: 'spending',
    interpretation: 'Covering more of the pay gap can increase weekly support until it reaches the cap. The same share finds lower-paid work in each case.',
    evaluation: 'Compare wages, job retention and time to re-employment after support ends for eligible workers who did and did not receive the top-up.',
  },
  'preventive-health': {
    controlId: 'staff',
    action: 'Add delivery staff and compare the number of participants and the expected new cases. Check whether funded places or willingness to enrol limits any further expansion.',
    population: 'A hypothetical intake of adults at higher risk of type 2 diabetes.',
    timeframe: 'One intake for enrolment and costs, with expected new cases counted over three years.',
    outcomeId: 'expected-cases',
    costId: 'spending',
    interpretation: 'Extra staff can increase reach when staff capacity is the limit. The change in expected cases depends on the selected starting risk and the assumed effect for participants.',
    evaluation: 'Compare observed three-year incidence for comparable eligible adults offered and not offered the programme. Record participation and differences in starting risk.',
  },
  'economic-diversification': {
    controlId: 'annualPlaces',
    action: 'Increase the number of programme places. Compare how many firms complete adoption, how many applicants miss out and what the change costs.',
    population: 'Eligible businesses that can apply for shared facilities and implementation advice.',
    timeframe: 'One operating year.',
    outcomeId: 'completed',
    costId: 'annual-cost',
    interpretation: 'Adding places can support more firms when applications exceed capacity. Adoption also depends on the assumed completion rate.',
    evaluation: 'Follow participating and comparable non-participating firms to track technology use, productivity and entry into new markets.',
  },
  belonging: {
    controlId: 'sites',
    action: 'Increase the number of activity sites. Compare how many local residents are still participating after three months and what it costs to provide those places.',
    population: 'Eligible local residents offered activities in community venues.',
    timeframe: 'One year of delivery, with continued participation measured at three months.',
    outcomeId: 'retained',
    costId: 'annualCost',
    interpretation: 'More sites can provide more places while there is unmet demand. Interest, attendance and retention shape how many residents continue to take part.',
    evaluation: 'Measure loneliness or belonging at enrolment and follow-up and compare changes with a similar group without the same offer.',
  },
  'attention-and-gambling': {
    controlId: 'gamblingCoverage',
    action: 'Expand the offer of gambling safeguards. Compare the change in gambling safeguard activations and check what happens to digital controls and combined costs.',
    population: 'Eligible users of digital services and people eligible for gambling safeguards. These groups may overlap.',
    timeframe: 'One year of offers, activations and delivery costs.',
    outcomeId: 'gamblingActivations',
    costId: 'annualCost',
    interpretation: 'Wider offers can increase activations at the selected opt-in rate. Each programme counts its own activations, including when the same person uses both.',
    evaluation: 'Track sustained use, attention and gambling losses separately. Check for switching to other services after activation.',
  },
};
