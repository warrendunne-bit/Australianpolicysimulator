# Phase 1C model change log

Baseline version: `australian-baseline-v1.0`  
Review date: 2026-07-12

| Variable | Previous value | New value | Reason | Source | Affected outcomes |
|---|---:|---:|---|---|---|
| Total population | 26,900,000 immigration / 27,000,000 general | 27,801,023 | Replace placeholder with ABS ERP | ABS National, state and territory population, Dec 2025 | population, housing demand, services, environment |
| Annual population growth | not recorded | 412,500 | Add reconciliation check for population components | ABS National, state and territory population, Dec 2025 | baseline validation, population pathway |
| NOM | 260,000 | 301,000 | Replace placeholder current-path setting with latest annual ABS component | ABS National, state and territory population, Dec 2025 | migration, labour, housing, fiscal pressure |
| Natural increase | 110,000 | 111,500 | Replace placeholder with ABS annual component | ABS National, state and territory population, Dec 2025 | population, ageing |
| Housing build rate | 180,000 immigration / 175,000 general | 175,264 | Annualise latest ABS completions | ABS Building Activity, Mar qtr 2026 | housing supply, housing stress |
| Labour market | not present in baseline layer | unemployment 4.4%, employment-population 63.8% | Add observed labour context | ABS Labour Force, May 2026 | employment, labour supply, wellbeing context |
| GDP growth context | base growth 2 abstract units only | GDP quarterly growth 0.3% added | Add observed national-accounts context without replacing abstract growth formula | ABS National Accounts, Mar qtr 2026 | growth context, back-test |
| CPI context | event-only inflation | CPI annual inflation 4.0% added | Add observed price context without freezing temporary inflation | ABS CPI, May 2026 | inflation context, household consumption gap |
| Fiscal context | 600/620 abstract units only | Commonwealth revenue $815,328m; expenses $833,262m added | Add Budget estimates while retaining abstract model units | Budget Paper No. 1 2026-27 | fiscal context, back-test |
| Average tax per worker range | 28,000 only | 22,000 / 28,000 / 36,000 | Avoid false precision for unresolved fiscal relationship | Phase 1A audit plus fiscal context | fiscal sensitivity, winners/losers |
| Government spending per person range | 23,000 only | 18,000 / 23,000 / 32,000 | Avoid false precision for unresolved service-cost relationship | Phase 1A audit plus fiscal context | service cost, fiscal pressure |
| Social cohesion sensitivity range | 45 only | 25 / 45 / 70 | Keep politically sensitive causal relationship exploratory and range-based | Phase 1A risk register | social cohesion, commentary, winners/losers |
| Environmental pressure per person range | 1 only | 0.6 / 1 / 1.5 | Keep environmental pathway exploratory until emissions/resource submodel exists | DCCEEW source identified; model coefficient unresolved | environmental pressure |

No unexplained balancing factor was introduced. No coefficient was tuned solely to improve historical fit.
