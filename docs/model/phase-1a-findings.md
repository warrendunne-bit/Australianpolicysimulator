# Phase 1A findings

Audit date: 2026-07-12  
Phase: Baseline assumption audit only  
Simulation changes made: none intentionally

## 1. Current model architecture summary

The simulator currently has two model layers:

1. A general entity-based simulator in `src/simulation/*` that models representative households, companies, government, environment, policy settings, event shocks, feedback loops, outcomes and success scores.
2. A topic-specific immigration simulator in `src/topics/immigration/*` that runs a yearly projection from 2026 and produces immigration-specific metrics, trade-offs, cause-effect explanations, myth tests and group impacts.

The architecture is transparent and deterministic, but not yet evidence-calibrated.

## 2. Apparent baseline year

- General simulator: no reliable baseline year. It uses illustrative constants and abstract indices.
- Immigration simulator: apparent start year is 2026, but values are not yet tied to reviewed source data.

Conclusion: the model should currently be described as illustrative, not current or calibrated.

## 3. Number of assumptions identified

`assumption-register.csv` contains 74 curated material assumptions across:

- observed baseline data;
- behavioural relationships;
- policy settings;
- scoring/weighting assumptions;
- commentary thresholds;
- exploratory unsupported assumptions;
- technical constants.

This register prioritises material model pathways rather than every UI-only number.

## 4. Number with credible sources

Current credible in-code source metadata for material assumptions: effectively 0.

Several assumptions include placeholder source text or general source hints, but they do not include enough metadata to be considered credible baseline evidence: reference period, source ID, access date, update frequency, transformation and uncertainty range are missing.

## 5. Number lacking credible sources

74 curated material assumptions currently lack complete credible source metadata.

## 6. Top 20 high-materiality assumptions

1. General starting population — 27,000,000.
2. Immigration-rate-to-people conversion — 100,000 people per point.
3. Average household size — 2.5 people.
4. Base economic growth — 2 growth units.
5. Default immigration rate — 2 abstract units.
6. Default housing build rate — 175,000 homes/year.
7. Integration effectiveness — 65/100.
8. Skills alignment — 70/100.
9. Infrastructure readiness — 60/100.
10. Default tax rate — 25.
11. Government base revenue/spending — 600/620 abstract units.
12. Representative household weights and incomes.
13. Representative company weights and productivity/profitability indices.
14. Environmental pressure/resource-use starting values.
15. Household wellbeing formula and weights.
16. Fiscal revenue/spending coefficients.
17. Feedback initial state and feedback coefficients.
18. Success score weights.
19. Immigration base population — 26,900,000.
20. Immigration NOM/housing/fiscal/social cohesion assumptions.

## 7. Top model credibility risks

- Current path is not yet an evidence-backed current-policy baseline.
- Important values are placeholders or abstract indices.
- General and immigration models use different values for similar concepts.
- GDP, GDP per person, unemployment, rents and vacancies are not directly modelled.
- Fiscal values are abstract rather than budget data.
- Social cohesion, environmental and winner/loser impacts rely on unsupported heuristic coefficients.
- Migrants are insufficiently segmented for a credible immigration policy model.
- Commentary can sound more certain than the supporting evidence allows.

## 8. Immigration-specific gaps

The immigration model currently lacks explicit segmentation for permanent, temporary, student, skilled, family and humanitarian migration. It uses NOM and broad proxy assumptions. It also lacks direct modelling of unemployment, income distribution by migrant group, return migration, visa duration, household composition, citizenship/integration duration, regional retention and service use by category.

## 9. Recommended authoritative sources

See `source-register.csv`. Highest priority sources are ABS ERP/NOM, Home Affairs visa statistics, ABS Labour Force, ABS National Accounts, ABS Building Activity, NHSA, Treasury/Budget papers, Department of Finance, PBO, AIHW, Productivity Commission, Infrastructure Australia, DCCEEW and AEMO.

## 10. Recommended sequence for updating the model

1. Freeze this audit as the traceability baseline.
2. Create a versioned data dictionary and source registry with source IDs in code/data.
3. Replace observed baseline facts first: population, NOM, labour force, housing completions/stock, fiscal aggregates and emissions/resource indicators.
4. Define what “current-policy baseline” means separately from latest observed values.
5. Add uncertainty ranges for high-materiality assumptions.
6. Back-test population, housing, labour, fiscal and environmental pathways.
7. Segment immigration where reliable data supports it.
8. Move commentary thresholds into documented confidence-aware rules.
9. Only then recalibrate or expand the UI.

## 11. Files created or changed

Created documentation files under `docs/model/`:

- `baseline-audit.md`
- `assumption-register.csv`
- `source-register.csv`
- `model-pathways.md`
- `model-risk-register.md`
- `immigration-audit.md`
- `phase-1a-findings.md`

No application source files were intentionally changed during Phase 1A.

## 12. Build and test results

Validation completed after creating documentation-only Phase 1A outputs:

- `npm test` passed: 14 tests passed.
- `npm run build` passed: TypeScript and Vite production build succeeded.

Because this phase created documentation only and did not intentionally alter app source or model formulas, no simulation result change is expected from Phase 1A.

## Phase boundary

Stop after Phase 1A. Do not proceed to recalibration, assumption updates or UI redesign without a separate instruction.
