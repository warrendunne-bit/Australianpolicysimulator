# Model pathways

This document traces the current calculation pathways as implemented during Phase 1A. It documents current behaviour; it does not endorse the values.

## Population

### General simulator

Input data → policy setting → behavioural relationship → entity impact → calculated output → score → commentary

`BASE_POPULATION = 27,000,000` → `immigrationRate` → `populationIncrease = immigrationRate * 100,000` → housing demand and infrastructure pressure → `population`, `housingDemand`, `housingGap` → growth/wellbeing/fairness/housing stress scores → yearly summary and positive/negative drivers.

Traceability gaps:

- `immigrationRate` is an abstract input, not a documented NOM/person measure.
- Population baseline has no source/reference date.

### Immigration simulator

`BASE_POPULATION = 26,900,000` → `netOverseasMigration`, `naturalIncrease`, fertility/death adjustments → `annualPopulationChange` → population, age shares, labour supply, housing demand, service demand and environmental pressure → national briefing, trade-offs and myth tests.

Traceability gaps:

- Starting population and demographic assumptions are not source-dated.
- NOM is not segmented into permanent, temporary, student, skilled, family and humanitarian flows.

## Migration

General simulator: one `immigrationRate` slider controls population growth. It does not distinguish permanent/temporary/NOM or visa category.

Immigration simulator: `netOverseasMigration` is the main flow. Arrivals/departures and students are inferred with formulas. Visa categories are represented mostly through scenario labels and proxy assumptions rather than separate stocks/flows.

## GDP and GDP per person

No explicit GDP stock, GDP level or GDP per person is currently modelled.

General simulator uses `economicGrowth` as a directional annual growth value:

`BASE_ECONOMIC_GROWTH` → company productivity → migration boost → stimulus boost → tax drag → housing drag → event and feedback effects → `economicGrowth` → economic score and fiscal revenue.

Immigration simulator uses business and labour-capacity indices. It does not calculate GDP or GDP per person.

Untraceable output: GDP per person cannot currently be traced because there is no GDP level and no per-person production calculation.

## Employment and unemployment

No direct unemployment rate exists.

General simulator: employment pressure is proxied by company `hiringDemand`, immigration rate, skills alignment and business confidence.

Immigration simulator: labour market is proxied by `workforceParticipation`, working-age share, labour supply index and business capacity index.

Untraceable output: unemployment cannot currently be reported as an observed or calibrated outcome.

## Productivity

General simulator: company productivity starts from representative company index values and changes with skills, events and housing stress.

Immigration simulator: productivity growth is a user-visible assumption that affects business capacity.

Traceability gap: neither pathway is tied to ABS productivity series or industry/occupation data.

## Housing demand, supply, rents and affordability

General simulator:

`populationIncrease` → `housingDemand = populationIncrease / 2.5` → `housingBuildRate` and event supply effect → `housingGap` → `housingStress` → household housing security → wellbeing/fairness/commentary.

Immigration simulator:

population and household-size proxy → household demand → dwelling stock plus effective build rate → cumulative shortfall → housing stress index → trade-off scores, beneficiaries/cost bearers and myth tests.

Traceability gaps:

- No rent, price, vacancy or mortgage-serviceability series.
- Housing stress is an index, not an observed affordability statistic.

## Government revenue, spending and balance

General simulator:

base revenue/spending → tax revenue boost + growth revenue boost + integration/skills revenue → stimulus + integration support + infrastructure + event + feedback costs → budget balance → debt pressure and finance rating → government-finances score/commentary.

Immigration simulator:

working-age population × participation × average tax per worker → tax revenue proxy; population × spending per person → service cost proxy; infrastructure cost per additional person → state pressure; pressure indices drive fiscal trade-offs.

Traceability gaps:

- General model uses abstract fiscal units.
- Immigration model uses pressure indices, not official budget balance.

## Health and education capacity

General simulator: represented indirectly through government service capacity and infrastructure readiness.

Immigration simulator: health/aged-care and education pressure indices are calculated from retiree share, children share, student share, labour supply and demand pressure.

Traceability gap: no explicit service-capacity stock, workforce supply, wait-time or expenditure baseline.

## Wellbeing

General simulator:

household consumption + housing security + cohesion → household wellbeing → weighted average wellbeing → success score and commentary.

Immigration simulator: no standalone wellbeing score; wellbeing-like impacts appear through housing stress, services, cohesion and trade-off narratives.

## Social cohesion

General simulator:

household cohesion + absorptive capacity + service capacity + inverse housing stress → `socialCohesion`.

Immigration simulator:

housing stress + infrastructure pressure + social cohesion sensitivity - labour supply contribution → `socialCohesionRisk`.

Traceability gap: both are exploratory index formulas, not calibrated social cohesion measures.

## Environmental outcomes

General simulator:

resource use + company emissions intensity + stimulus + event effects → environmental pressure → environment score.

Immigration simulator:

population growth factor + environmental pressure per person + infrastructure pressure → environmental pressure index.

Traceability gap: emissions, energy, water, waste and land use are combined into broad indices.

## Overall success score

`SuccessScore.ts` converts outcomes into a weighted score using default weights:

- economic growth 20
- wellbeing 20
- fairness 15
- social cohesion 15
- government finances 15
- environment 15

This is a scoring/value assumption, not a factual Australian statistic.

## Outputs whose full pathways cannot currently be traced to evidence

- GDP and GDP per person
- unemployment
- rents, vacancy rates and purchase affordability
- permanent/temporary migration split
- visa-category fiscal effects
- health and education service capacity
- environmental subcomponents
- social cohesion effects
