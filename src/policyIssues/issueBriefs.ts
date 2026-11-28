interface AustralianIndicator {
  observation: string;
  source: string;
  url: string;
}

export interface IssueBriefDetails {
  title: string;
  question: string;
  indicators: readonly AustralianIndicator[];
  whyItMatters: string;
  intervention: string | readonly string[];
  progress: string;
}

export const issueBriefs: Readonly<Record<string, IssueBriefDetails>> = {
  'affordable-housing': {
    title: 'Housing affordability and security',
    question: 'How can more people afford a secure home and, if they want to buy, find one within a reasonable commute of work?',
    indicators: [{
      observation: 'In 2023, Australian private renters spent 19.8% of their gross household income on rent. Households with a mortgage put 16.1% of their gross income towards mortgage payments.',
      source: 'ABS housing serviceability, based on HILDA',
      url: 'https://www.abs.gov.au/statistics/measuring-what-matters/measuring-what-matters-themes-and-indicators/secure/housing-serviceability',
    }, {
      observation: 'Among households with a key member aged 25–39, about 55% lived in an owned home in 2021, down from 62% in 2006 and 66% in 1991.',
      source: 'ABS comparison of home ownership across generations',
      url: 'https://www.abs.gov.au/articles/back-my-day-comparing-millennials-earlier-generations#housing',
    }],
    whyItMatters: 'A safe, stable home is a basic need. Knowing you can stay helps you feel secure and plan around work, school and care. After paying for housing, food, bills and travel to work, households need enough money left to save and handle setbacks such as reduced hours or an unexpected bill.',
    intervention: 'Use planning and infrastructure to make room for more affordable homes near jobs and reliable public transport. Improve security for renters through stable tenancies and targeted rent relief. Test whether first-home deposit support helps people buy while leaving enough money for repayments and everyday expenses.',
    progress: 'Track how many first-home buyers purchase within a reasonable commute and keep up with repayments over time. Check whether renters face fewer forced moves and whether renters and owners have more money left after essentials. Compare results by income and location.',
  },
  'economic-diversification': {
    title: 'Economic diversification',
    question: 'How could more Australian businesses adopt new technology and build a broader economic base?',
    indicators: [{
      observation: 'Iron ore and concentrates accounted for 18.1% of the value of Australian goods and services exports in calendar year 2025.',
      source: 'DFAT Australian goods and services trade tables',
      url: 'https://www.dfat.gov.au/sites/default/files/australias-goods-services-exports-import.pdf',
    }],
    whyItMatters: 'When a large share of exports comes from one product, businesses, suppliers and workers in exporting regions are exposed to shifts in overseas demand and prices.',
    intervention: 'Expand access to shared facilities and implementation advisers. The number of programme places limits how many applicants can participate, and the completion rate determines how many demonstrate adoption.',
    progress: 'Compare adoption, applicants left without a place and public cost over one year. Longer-term evaluation would track whether adoption lasts and firms enter new markets or expand what they produce.',
  },
  'energy-and-adaptation': {
    title: 'Energy security and cost',
    question: 'What mix of power sources and fuel suppliers would keep Australia running through bad weather, outages and import shocks at a cost people and businesses can afford?',
    indicators: [{
      observation: 'In November 2026, the RBA reported a partial recovery in crude oil shipments through the Strait of Hormuz. Refining constraints continued to limit diesel supply, and Australian pump prices were still above their pre-conflict levels.',
      source: 'Reserve Bank of Australia, November 2026 Statement on Monetary Policy',
      url: 'https://www.rba.gov.au/publications/smp/2026/nov/economic-conditions.html',
    }, {
      observation: 'Imports met 80.8% of Australian consumption of refined petroleum products in 2024–25. Australian refineries also imported about two-thirds of their feedstock that year.',
      source: 'Australian Energy Statistics, energy trade',
      url: 'https://www.energy.gov.au/energy-data/australian-energy-statistics/energy-trade',
    }, {
      observation: 'In the ACCC sample across NSW, Victoria, South Australia and south-east Queensland, the median small-business electricity bill after rebates rose 20% from the September quarter of 2024 to the same quarter of 2025. Before rebates the increase was 7%.',
      source: 'ACCC electricity market inquiry, June 2026 report',
      url: 'https://www.accc.gov.au/system/files/inquiry-national-electricity-market-report-june-2026.pdf',
    }],
    whyItMatters: 'Farms, freight operators and emergency services need a steady supply of diesel. When fuel is scarce or expensive, harvesting and delivering food costs more, and so does getting to work. Businesses also need dependable electricity to run production lines and keep stock cold. Reliable energy at predictable prices helps households manage bills and Australian firms compete for orders and invest.',
    intervention: [
      'Compare mixes of solar, wind, gas and coal with storage and grid connections. Test what each mix delivers through a calm night, a fuel shortage and the loss of a large plant. Include nuclear as a longer-term scenario that assumes a change to Australian law and time for licensing and construction.',
      'Secure fuel through independent suppliers and routes. Compare access to alternative gas fields and pipelines, coal deliveries and oil imports. Check whether suppliers share a pipeline, port or source of crude.',
      'Keep reserves of finished fuel in Australia and plan how to get them to farms, freight and essential services during a shortage.',
      'Assess how much diesel Australia could make from suitable local crude and other Australian inputs, including renewable diesel where viable. Compare the cost and lead time of expanding local production with the fuel it could deliver in a disruption.',
      'Use less oil for the same work through more efficient vehicles, electrification where charging is practical, and rail for suitable freight.',
      'Bring new generation and grid connections online before older plants retire. Compare the full cost of each option, including the storage or on-demand generation needed to cover peak hours.',
      'Upgrade equipment where energy savings justify the cost, such as refrigeration in food supply chains. Pay willing users to move flexible work away from expensive peak hours.',
      'Buy some electricity at a fixed price to make costs more predictable. This cushions a price spike and can cost more when spot prices fall.',
    ],
    progress: 'Compare how much electricity demand each mix can meet across different shocks, what it costs to build and run, and when it can be ready. Track how much diesel can be made with Australian inputs, how long reserves cover a shortfall and whether fuel still reaches farms, freight and emergency services. Check which protections bring down the risk without making energy unaffordable.',
  },
  'critical-systems': {
    title: 'Critical service continuity',
    question: 'How could households and businesses keep making payments when their usual service fails?',
    indicators: [{
      observation: 'Australian providers in the RBA reporting scheme recorded 415 significant fast-transfer service outages from the September quarter of 2021 to the March quarter of 2024.',
      source: 'Reserve Bank of Australia retail payment reliability, Table 1',
      url: 'https://www.rba.gov.au/publications/bulletin/2024/oct/the-reliability-of-retail-payment-services.html',
    }],
    whyItMatters: 'Access to electronic payments matters for everyday purchases and business cash flow. A lengthy outage is harder to manage when customers and merchants have few alternatives.',
    intervention: 'Extend access to a backup payment service and shorten its activation time. More eligible customers and earlier activation can preserve more access during a disruption.',
    progress: 'Compare customer-hours of access preserved during one hypothetical outage and the annual readiness cost. Use actual outage and recovery records to judge whether access improves in practice.',
  },
  'early-years-and-skills': {
    title: 'Early childhood and skills',
    question: 'How can Australia expand early learning and help more adults complete training?',
    indicators: [{
      observation: 'In 2024, 23.5% of Australian children assessed in their first year of full-time school were developmentally vulnerable in at least one of five areas, up from 22.0% in 2021.',
      source: 'Australian Early Development Census',
      url: 'https://www.education.gov.au/early-childhood/about/data-and-reports/australian-early-development-census',
    }],
    whyItMatters: 'Children need timely access to early learning, and adults need time and places to retrain as work changes. Both depend on enough staff and services opening when people need them.',
    intervention: 'Fund early-learning places and adult training starts. Staff limit usable places. Opening dates and course length determine how much can be delivered in the first year.',
    progress: 'Compare staffed early-learning places over the year, expected adult training completions and first-year costs. Follow up child development and adult employment separately to assess lasting gains.',
  },
  'income-security': {
    title: 'Income and job security',
    question: 'How much could temporary support cushion the income loss when a displaced worker takes a lower-paid job?',
    indicators: [{
      observation: 'In Australia, 257,900 people were retrenched in the year to February 2026, up from 183,200 in the year to February 2023. The measure includes owner-managers whose businesses closed for economic reasons.',
      source: 'ABS Job mobility, February 2026',
      url: 'https://www.abs.gov.au/statistics/labour/jobs/job-mobility/feb-2026',
    }],
    whyItMatters: 'Workers can face a lingering pay gap after losing a job, especially if suitable work is scarce or retraining takes time. That can strain household budgets even after someone is back at work.',
    intervention: 'Compare a temporary wage top-up and transition support for a displaced-worker cohort. The top-up closes part of the pay gap for eligible workers. The comparison holds re-employment rates fixed.',
    progress: 'Compare the remaining weekly pay gap during support and the public cost for the cohort. Follow up earnings and employment after payments end to assess lasting income security.',
  },
  'preventive-health': {
    title: 'Preventive health',
    question: 'How many adults at higher risk could a targeted diabetes prevention programme reach?',
    indicators: [{
      observation: 'In 2021, almost 1.2 million people in Australia, or 4.6% of the population, were registered as living with type 2 diabetes.',
      source: 'AIHW Diabetes in Australia, type 2 diabetes',
      url: 'https://www.aihw.gov.au/reports/diabetes/diabetes/contents/how-common-is-diabetes/type-2-diabetes',
    }],
    whyItMatters: 'Type 2 diabetes can require ongoing care. Registered prevalence is higher in more disadvantaged areas, so which adults prevention can reach matters alongside how many receive a place.',
    intervention: 'Fund places and staff a prevention programme for a hypothetical higher-risk cohort. Take-up and capacity govern reach. An assumed reduction in risk determines the change in expected cases.',
    progress: 'Compare intake costs and expected new cases over three years under the selected assumptions. Measure observed incidence in eligible adults with a comparison group to assess the effect.',
  },
  belonging: {
    title: 'Community connection',
    question: 'Can accessible local activities help more people take part and keep attending?',
    indicators: [{
      observation: 'An estimated 15% of Australians aged 15 and over experienced social isolation in 2024, compared with 13% in 2019. The survey measure captures access to social support.',
      source: 'AIHW Social isolation and loneliness, based on HILDA',
      url: 'https://www.aihw.gov.au/mental-health/topic-areas/health-wellbeing/social-isolation-and-loneliness',
    }],
    whyItMatters: 'People with limited access to social support can face persistent barriers to connection. Transport, accessibility and the number of places can shape who takes part in local activities.',
    intervention: 'Fund more sites and help participants get there. Places limit enrolment, then assumed attendance and retention rates determine how many people keep taking part.',
    progress: 'Compare attendance, three-month participation and annual cost. Follow up participants and a comparison group to establish whether loneliness or belonging improves.',
  },
  'attention-and-gambling': {
    title: 'Digital attention and gambling',
    question: 'How many people could digital controls and gambling safeguards reach, and what would delivery cost?',
    indicators: [{
      observation: 'In a March–April 2026 survey, Australian social media users aged 10–15 who used it on school days reported an average of 2 hours and 9 minutes of use per school day.',
      source: 'eSafety evaluation of social media age restrictions',
      url: 'https://www.esafety.gov.au/research/social-media-age-restrictions-evaluation/early-days-early-insights-three-months-report',
    }, {
      observation: 'In the 2022 HILDA survey, 1.8% of Australian adults were classified as high-risk on the Problem Gambling Severity Index, up from 1.1% in 2018.',
      source: 'AIHW Gambling in Australia, based on HILDA',
      url: 'https://www.aihw.gov.au/reports/australias-welfare/gambling',
    }],
    whyItMatters: 'Online services can command sustained attention. Gambling can also strain household finances. Young social media users and adults eligible for gambling safeguards face different risks and may need different responses.',
    intervention: 'Offer opt-in digital controls and gambling safeguards. Coverage and opt-in rates govern activation in each eligible population. People can be eligible for both offers.',
    progress: 'Compare annual activations for each offer and total delivery cost. Follow up sustained use, attention and gambling losses to evaluate each intervention’s effect.',
  },
  'government-evaluation': {
    title: 'Government delivery and evaluation',
    question: 'How can public services process claims promptly while checking the quality of decisions?',
    indicators: [{
      observation: 'Services Australia processed 85.2% of in-scope social security claims within their agreed time limits in 2025–26, compared with 85.9% in 2024–25.',
      source: 'Services Australia annual report 2025–26, Table 11',
      url: 'https://www.servicesaustralia.gov.au/sites/default/files/2026-10/annual-report-2025-26.pdf#page=48',
    }],
    whyItMatters: 'Delays can leave people waiting for support. Staff need enough capacity to process new cases and enough time to review decisions and learn from service users.',
    intervention: 'Change staffing, processing time and the share of cases selected for review. Reviews draw on the same staff hours as processing, so more review time can leave more cases waiting.',
    progress: 'Compare cases processed, year-end backlog, cases reviewed and annual staffing and review costs. Track actual waiting times, decision quality and user experience to assess improvement.',
  },
};
