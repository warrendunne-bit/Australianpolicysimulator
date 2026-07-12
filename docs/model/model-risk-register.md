# Model risk register

| id | risk | severity | evidence/location | likely consequence | recommended mitigation |
|---|---|---:|---|---|---|
| R-001 | Material constants are placeholders or abstract indices | High | `src/simulation/*`; `src/topics/immigration/assumptions.ts` | Users may over-trust results as current evidence | Add dated baseline data layer and reviewed metadata |
| R-002 | Apparent baseline year is inconsistent | High | General model has no data year; immigration starts 2026 | Confusion about what “current path” means | Define baseline version, source periods and review date |
| R-003 | General `immigrationRate` unit is ambiguous | High | `immigrationRate * 100_000` | Misinterpretation of population and policy effects | Replace with explicit NOM/person input or label as index |
| R-004 | Migrants are mostly treated as a single flow | High | Immigration module uses NOM and proxies | Visa-category effects are obscured | Segment where reliable Home Affairs/ABS data supports it |
| R-005 | Housing stress is not calibrated to rents/vacancy/affordability | High | `calculateHousingStress`; immigration housing-stress formula | Housing conclusions may be fragile | Back-test against ABS/NHSA/rental indicators |
| R-006 | Government finance units are abstract | High | `BASE_GOVERNMENT_REVENUE=600`; `BASE_GOVERNMENT_SPENDING=620` | Fiscal conclusions may appear official | Source fiscal baselines or relabel as illustrative index |
| R-007 | Social cohesion sensitivity is unsupported | High | `socialCohesionSensitivity`; cohesion formulas | Politically sensitive results may be under-evidenced | Keep exploratory; require expert review |
| R-008 | Feedback loops use arbitrary coefficients | Medium | `FeedbackSystem.ts` | Compounding effects may dominate without calibration | Sensitivity tests and documented coefficients |
| R-009 | Overall score weights are value judgements | Medium | `DEFAULT_SUCCESS_WEIGHTS` | False objectivity | Keep adjustable and explain value-dependence |
| R-010 | Commentary thresholds may overstate certainty | Medium | `buildPositiveDrivers`; `buildNegativeDrivers`; immigration briefing | Narrative may exceed evidence | Tie commentary rules to calculated values and confidence labels |
| R-011 | GDP/GDP per person are not explicit | High | Pathway audit | Living-standard claims rely on proxy growth | Add GDP stock/flow only after baseline data review |
| R-012 | Unemployment is not explicit | Medium | Pathway audit | Labour-market effects incomplete | Add employment/unemployment module or label omission |
| R-013 | Environmental pressure aggregates unlike systems | Medium | `updateEnvironment`; immigration environmental formula | Emissions, water, waste and land pressure conflated | Split into sourced subcomponents |
| R-014 | Current policy is not separated from temporary conditions | High | `current-path` scenario | Baseline may freeze unusual temporary settings | Define current legislated, announced, forecast, trend and dynamic assumptions |
| R-015 | Parallel models may diverge | Medium | general vs immigration population/household values | Inconsistent results across routes | Centralise data dictionary and assumptions |
| R-016 | Policy presets may imply feasibility without capacity checks | Medium | `SCENARIO_PRESETS`; immigration scenarios | Unrealistic scenarios may appear equally credible | Add feasibility/confidence labels |
| R-017 | Winner/loser classifications depend on heuristic weights | High | immigration trade-off group scoring | Politically salient conclusions may be coefficient-driven | Document weights; add sensitivity results |
| R-018 | No uncertainty ranges are used in core outputs | High | assumption definitions have min/max UI bounds but no uncertainty propagation | False precision | Add low/central/high assumption sets and sensitivity analysis |
| R-019 | Source metadata is incomplete | High | assumptions list has source strings but no access date/reference period | Not independently reviewable | Add source registry IDs to each material assumption |
| R-020 | Commentary can be generated from placeholder values | Medium | briefing/myth-test outputs | Output may sound evidentiary despite placeholders | Label model confidence and suppress strong claims when assumptions are low confidence |
