export type EvidenceStatus = "Housing pilot" | "Programme comparison";

interface EvidenceSource {
  title: string;
  url: string;
  interpretation: string;
}

interface EvidenceProposal {
  id: string;
  title: string;
  action: string;
  judgement: string;
  status: EvidenceStatus;
  simulatorUse: string;
  outcomes: string;
  sources: readonly EvidenceSource[];
}

export const evidenceProposals: readonly EvidenceProposal[] = [
  {
    id: "affordable-housing",
    title: "Build affordable homes near opportunity",
    action: "Enable more affordable homes near jobs and transport, connect new developments to services, expand social and community housing, and improve rental security. Test ways to help first-home buyers afford both the upfront costs and ongoing repayments.",
    judgement: "Strong core evidence",
    status: "Housing pilot",
    simulatorUse: "The first-home example compares the budget for staying in a rental or buying at two assumed prices and commute distances. The national pilot compares faster supply and targeted rental support using its own assumptions.",
    outcomes: "Track first-home purchases within reach of jobs, sustained ownership, forced moves and cash left after essentials, by income and location. The national pilot reports dwelling additions, housing costs relative to income, income after housing, and public expenditure.",
    sources: [
      {
        title: "Greenaway-McGrevy and Phillips, The Impact of Upzoning on Housing Construction in Auckland (2022)",
        url: "https://elischolar.library.yale.edu/cowles-discussion-paper-series/2689/",
        interpretation: "The study found that Auckland’s reform increased construction. Australian delivery and rent effects depend on local capacity, market conditions, and the design of the reform.",
      },
      {
        title: "National Housing Supply and Affordability Council, State of the Housing System 2026",
        url: "https://nhsac.gov.au/reports-and-submissions/state-housing-system-2026",
        interpretation: "Documents Australian affordability and supply conditions. It provides context for the pilot’s measures and delivery constraints.",
      },
      {
        title: "Australian Treasury, Increasing housing supply",
        url: "https://treasury.gov.au/policy-topics/housing/increasing-housing-supply",
        interpretation: "Describes planning and infrastructure measures to support more housing near employment and public transport.",
      },
      {
        title: "ASIC Moneysmart, Buying a house",
        url: "https://moneysmart.gov.au/home-loans/buying-a-house",
        interpretation: "Identifies upfront and ongoing buying costs. The household example uses assumed dollar amounts for those costs.",
      },
    ],
  },
  {
    id: "economic-diversification",
    title: "Broaden the economy through science and technology adoption",
    action: "Help firms test and adopt useful technologies through shared facilities, demonstration projects, first-customer procurement, and practical implementation support.",
    judgement: "Mixed by instrument",
    status: "Programme comparison",
    simulatorUse: "Compare annual business adoption, unserved demand and public cost for a technology diffusion programme. The trade view separately tests direct export exposure by product or buyer.",
    outcomes: "Productivity, wages, domestic value added, and export concentration by product and buyer.",
    sources: [
      {
        title: "Fraunhofer, Financing and contract research",
        url: "https://www.fraunhofer.de/en/about-fraunhofer/profile-structure/facts-and-figures/finances.html",
        interpretation: "Fraunhofer’s funding model links research to industry demand. Its financing arrangements illustrate a programme design whose Australian returns would need evaluation.",
      },
      {
        title: "Brynjolfsson, Li and Raymond, Generative AI at Work",
        url: "https://arxiv.org/abs/2304.11771",
        interpretation: "The study measured AI-assisted customer support. Productivity gains varied across workers and are specific to the task and setting.",
      },
    ],
  },
  {
    id: "energy-and-adaptation",
    title: "Keep energy reliable and affordable for households and industry",
    action: "Compare how different generation mixes hold up in a weather lull, a fuel interruption or a large plant outage. Check whether alternative suppliers can deliver independently of the disrupted route. For diesel, assess local inputs, alternative imports, reserve delivery and lower demand.",
    judgement: "Costs depend on local conditions",
    status: "Programme comparison",
    simulatorUse: "The energy mix comparison tests solar, wind, hypothetical nuclear, gas, coal and storage during four disruptions. The diesel comparison tests local refining, alternative imports, reserves and demand. Two other comparisons cover peak electricity costs and backup for public buildings.",
    outcomes: "Compare electricity left unmet under different shocks, exposure to common fuel supply routes, the cost and time to build, and emissions. Track diesel made with Australian inputs, reserves that can be delivered and fuel reaching essential users.",
    sources: [
      {
        title: "Reserve Bank of Australia, Impact of higher global energy prices on Australia, May 2026",
        url: "https://www.rba.gov.au/publications/smp/2026/may/in-depth-the-impact-of-higher-global-energy-prices-on-the-australian-economy.html",
        interpretation: "Traces how disruptions to crude supplies for overseas refiners affect Australian fuel availability, prices and production costs.",
      },
      {
        title: "Australian Government, Fuel supply and security, 2026–27 Budget",
        url: "https://budget.gov.au/content/01-fuel-supply-and-security.htm",
        interpretation: "Describes how Australia responded to the 2026 oil shock and announced investment in reserves and refining. The announced 50-day objective applies to diesel and jet fuel.",
      },
      {
        title: "Australian Energy Market Operator, 2026 Integrated System Plan",
        url: "https://www.aemo.com.au/energy-systems/major-publications/integrated-system-plan-isp/2026-integrated-system-plan-isp",
        interpretation: "Compares the cost and reliability of generation, storage and network investments as coal plants retire. The National Electricity Market plan uses detailed forecasts and operating conditions.",
      },
      {
        title: "Australian Energy Market Operator, 2026 Gas Statement of Opportunities",
        url: "https://www.aemo.com.au/energy-systems/gas/gas-forecasting-and-planning/gas-statement-of-opportunities-gsoo",
        interpretation: "Assesses how different gas supply, storage and pipeline investments could change peak-day shortfalls in eastern and central Australia.",
      },
      {
        title: "CSIRO and AEMO, GenCost 2025–26",
        url: "https://www.csiro.au/en/research/technology-space/energy/electricity-transition/gencost",
        interpretation: "Estimates new-build generation and storage costs and compares costs across whole-system mixes. The simulator uses assumed stress conditions and prices for alternative fuel contracts.",
      },
      {
        title: "Environment Protection and Biodiversity Conservation Act 1999, section 140A",
        url: "https://www.legislation.gov.au/C2004A00485/latest/text",
        interpretation: "Federal law bars environmental approval for civilian nuclear power plants. The nuclear capacity in the exercise is a hypothetical longer-term option.",
      },
      {
        title: "Australian Energy Regulator, Wholesale electricity market performance report 2024",
        url: "https://www.aer.gov.au/publications/reports/performance/wholesale-electricity-market-performance-report-2024",
        interpretation: "The contract markets chapter explains how buyers and sellers manage exposure to volatile spot prices. Actual contract terms and the timing of price changes reaching retail bills vary.",
      },
      {
        title: "Australian Government, Minimum Stockholding Obligation",
        url: "https://www.dcceew.gov.au/energy/security/australias-fuel-security/minimum-stockholding-obligation",
        interpretation: "Australia uses minimum holdings of transport fuels as a safeguard against supply disruptions. Evaluating local access also requires information about storage locations and delivery times.",
      },
    ],
  },
  {
    id: "critical-systems",
    title: "Protect critical systems and preserve shock absorbers",
    action: "Identify dependencies that could interrupt essential services. Test reserves, substitute suppliers, repair capacity and continuity plans against specific disruptions.",
    judgement: "Strong risk rationale",
    status: "Programme comparison",
    simulatorUse: "Compare payment access and readiness costs during an example outage. The exercise uses assumed customer exposure and fallback coverage. Shared failures across services require additional data.",
    outcomes: "Readiness cost, essential-service downtime, inventory coverage, and recovery time.",
    sources: [
      {
        title: "Productivity Commission, Vulnerable Supply Chains (2021)",
        url: "https://www.pc.gov.au/inquiries-and-research/supply-chains/report/",
        interpretation: "Provides an Australian framework for assessing criticality and substitution. Supplier concentration, transport routes and alternatives need current data for each scenario.",
      },
      {
        title: "Finnish National Emergency Supply Agency, Security of supply in Finland",
        url: "https://www.huoltovarmuuskeskus.fi/en/security-of-supply",
        interpretation: "Describes how Finland coordinates preparedness. The appropriate mix of reserves and agreements depends on Australian industries and geography.",
      },
      {
        title: "Reserve Bank of Australia, The Reliability of Retail Payment Services (2024)",
        url: "https://www.rba.gov.au/publications/bulletin/2024/oct/the-reliability-of-retail-payment-services.html",
        interpretation: "Table 1 reports significant outages and median duration by service from September 2021 to March 2024. Reported outage duration describes the service affected and its availability over that period. Local outages can fall outside the reporting thresholds.",
      },
    ],
  },
  {
    id: "early-years-and-skills",
    title: "Invest early and build skills throughout life",
    action: "Link early childhood health, developmental support and learning, and extend practical training pathways through schools, TAFE and employers.",
    judgement: "Strong core evidence",
    status: "Programme comparison",
    simulatorUse: "Compare staffed early-years places, adult training intake and first-year completions alongside delivery costs and commitments.",
    outcomes: "Development, learning progress, training completion, and later employment and earnings.",
    sources: [
      {
        title: "Carneiro and colleagues, Sure Start outcomes evaluation (2025)",
        url: "https://doi.org/10.1920/re.ifs.2025.0017",
        interpretation: "The evaluation covers England’s integrated early-years centres. Long-run benefits include projected earnings and depend on local participation, staffing and service quality.",
      },
    ],
  },
  {
    id: "income-security",
    title: "Share gains and make economic change safer",
    action: "Test income or wage insurance during job transitions, smoother benefit withdrawal, broader ownership, and shorter or more predictable working hours where services can be maintained.",
    judgement: "Mixed evidence by policy",
    status: "Programme comparison",
    simulatorUse: "Compare a time-limited wage top-up and placement support for a cohort of displaced workers. The exercise holds re-employment constant.",
    outcomes: "Income after housing costs, time out of work, earnings recovery, household buffers, and control over working time.",
    sources: [
      {
        title: "Denmark, The Danish labour market model",
        url: "https://denmark.dk/society-and-business/the-danish-labour-market",
        interpretation: "Denmark’s protections operate within its own labour-market institutions. Australian transition support would need local design and testing.",
      },
      {
        title: "Fan and colleagues, Four-day workweek study (2025)",
        url: "https://doi.org/10.1038/s41562-025-02259-6",
        interpretation: "The study observed improved wellbeing among participating organisations. Organisations chose to participate, so national effects remain uncertain.",
      },
    ],
  },
  {
    id: "preventive-health",
    title: "Prevent illness and make healthy living easier",
    action: "Improve access to preventive health and early mental-health support, and test healthier buildings and public spaces alongside clinical programmes.",
    judgement: "Strong targeted evidence",
    status: "Programme comparison",
    simulatorUse: "Compare delivery capacity and cost for a hypothetical diabetes prevention cohort. Users can vary the assumed three-year risk and effect for participants.",
    outcomes: "Healthy life years, distress, avoidable admissions, days unable to work or study, and programme costs.",
    sources: [
      {
        title: "Diabetes Prevention Program Research Group, Randomised prevention trial (2002)",
        url: "https://doi.org/10.1056/NEJMoa012512",
        interpretation: "The trial found that an intensive programme reduced diabetes incidence in adults at high risk. Population effects depend on eligibility, reach and continued participation.",
      },
    ],
  },
  {
    id: "belonging",
    title: "Make belonging part of everyday life",
    action: "Make regular community activity accessible through schools, libraries, sports and other local facilities. Test supported volunteering and community-led ways to involve people who are isolated.",
    judgement: "Promising programme evidence",
    status: "Programme comparison",
    simulatorUse: "Compare activity places, attendance, three-month retention and annual costs. Measuring changes in belonging requires participant follow-up.",
    outcomes: "Sustained participation, supportive relationships, loneliness, belonging, and access by group.",
    sources: [
      {
        title: "The Finnish model for leisure activities",
        url: "https://harrastamisensuomenmalli.fi/en/",
        interpretation: "Finland illustrates how free activities can fit the school day. An Australian evaluation would need to measure participation and effects on wellbeing.",
      },
      {
        title: "WHO Commission on Social Connection, Report (2025)",
        url: "https://www.who.int/groups/commission-on-social-connection/report",
        interpretation: "The Commission describes why isolation matters and calls for stronger evaluation of interventions.",
      },
    ],
  },
  {
    id: "attention-and-gambling",
    title: "Reduce harmful attention and gambling incentives",
    action: "Test controls over notifications and recommendations, practical gambling safeguards, and clear routes to support. Watch for people shifting to other platforms or operators.",
    judgement: "Emerging policy evidence",
    status: "Programme comparison",
    simulatorUse: "Compare reach, activation and delivery costs for opt-in digital controls and gambling safeguards. The two participant counts stay separate because people can be eligible for both.",
    outcomes: "Sleep, attention, perceived control, distress, useful digital activity, and gambling-related losses or harm.",
    sources: [
      {
        title: "Castelo and colleagues, Smartphone internet access trial (2025)",
        url: "https://pubmed.ncbi.nlm.nih.gov/39967678/",
        interpretation: "A short, voluntary trial observed benefits from blocking mobile internet. Limited adherence and the voluntary design constrain what it can tell us about national measures.",
      },
      {
        title: "Australian Institute of Health and Welfare, Gambling",
        url: "https://www.aihw.gov.au/reports/australias-welfare/gambling",
        interpretation: "Reports Australian gambling participation and harms. Each proposed safeguard needs evidence of its own effects.",
      },
    ],
  },
  {
    id: "government-evaluation",
    title: "Make government a trusted learning system",
    action: "Publish who owns a programme, what it costs, how it is evaluated, and what evidence would prompt a change. Give people meaningful input and clear ways to challenge service decisions.",
    judgement: "Mixed by instrument",
    status: "Programme comparison",
    simulatorUse: "Compare service capacity, the year-end backlog, cases selected for review and annual costs. Trust and user experience can be measured through evaluation.",
    outcomes: "Service reliability, resolution time, administrative burden, errors, appeals, participation, and trust.",
    sources: [
      {
        title: "Australian Centre for Evaluation, Commonwealth Evaluation Policy and toolkit",
        url: "https://evaluation.treasury.gov.au/",
        interpretation: "Provides methods for planning and measuring delivery and impact. A specific evaluation design is still needed to estimate a change in public trust.",
      },
      {
        title: "The Citizens’ Assembly, How Ireland’s assemblies work",
        url: "https://citizensassembly.ie/about/",
        interpretation: "Illustrates a process for representative deliberation. The outcome depends on the questions, participation and government response.",
      },
    ],
  },
];
