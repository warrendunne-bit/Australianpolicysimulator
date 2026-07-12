# Phase 1B architecture report

Date: 2026-07-12  
Phase: Baseline evidence and configuration architecture  
Status: Implemented as draft architecture; no broad recalibration performed.

## 1. Architecture summary

Phase 1B introduced a distinct `src/model/` layer so evidence, assumptions, policy settings and scenarios can be updated without editing React components or rewriting the simulation engine.

The new architecture separates:

1. Observed baseline data — `src/model/data/baseline/`
2. Behavioural assumptions — `src/model/assumptions/`
3. Policy settings — `src/model/policies/`
4. Scenario configuration — `src/model/scenarios/`
5. Simulation calculations — existing `src/simulation/` and `src/topics/immigration/`
6. Scoring and weightings — existing scoring code plus typed configuration support
7. Commentary/provenance — `src/model/commentary/`
8. Presentation — React components, with a limited provenance view added to the assumptions/settings area

This phase migrates current values into configuration without asserting that they are now calibrated or evidence-perfect.

## 2. File structure

New files:

```text
src/model/
  index.ts
  types/index.ts
  data/baseline/baselineVersions.ts
  data/baseline/variables.ts
  assumptions/behaviouralAssumptions.ts
  policies/policySettings.ts
  scenarios/scenarioConfigs.ts
  commentary/provenance.ts
  validation/validateModelConfiguration.ts
```

Existing files updated:

```text
src/simulation/World.ts
src/simulation/presets.ts
src/simulation/entities.ts
src/simulation/outcomeModel.ts
src/topics/immigration/assumptions.ts
src/topics/immigration/model.ts
src/components/AssumptionsPanel.tsx
src/styles.css
src/tests/run-tests.mjs
```

## 3. Schemas and TypeScript types

`src/model/types/index.ts` defines:

- `BaselineVariable`
- `BehaviouralAssumption`
- `PolicySetting`
- `ScenarioConfig`
- `BaselineVersion`
- `ScenarioPolicySnapshot`
- `ValidationIssue`
- `ValidationResult`
- `ModelConfiguration`
- `ProvenanceRow`

Baseline variables include the required metadata fields: id, name, description, value, unit, reference period, geography, source organisation, source title, source location, publication date, date accessed, update frequency, classification, confidence rating, low/central/high estimates, transformation notes, affected model areas and baseline version.

Behavioural assumptions include central/low/high values, evidence notes, confidence, affected relationships, formula location, materiality, calibration status and reviewer notes.

Policy settings are explicitly classified as `policy-setting` and stored separately from observed baseline data.

## 4. Migrated baseline configuration

Migrated into `BASELINE_VARIABLES`:

- Immigration model population: 26,900,000
- General simulator population: 27,000,000
- Immigration dwelling stock: 10,950,000
- Migrants already in Australia: 8,200,000
- Natural increase: 110,000 people/year
- Fertility rate: 1.65 births/woman
- Death rate: 7.1 deaths per 1,000 people
- General household size: 2.5 people/household
- Immigration household size: 2.52 people/household
- General simulator base revenue: 600 abstract fiscal units
- General simulator base spending: 620 abstract fiscal units

All migrated values are marked low confidence or draft because Phase 1B preserves current values rather than recalibrating them.

## 5. Migrated behavioural assumptions

Migrated into `BEHAVIOURAL_ASSUMPTIONS`:

- General people per immigration input point: 100,000
- General base economic growth: 2
- Migrant working-age share: 78%
- Workforce participation: 67%
- Productivity growth: 1.2%/year
- Average tax per worker: $28,000/year
- Government spending per person: $23,000/year
- Infrastructure cost per additional person: $13,000/person
- Social cohesion sensitivity: 45/100
- Environmental pressure per person: 1.0 index

Remaining migrated-but-still-needing-deeper treatment:

- construction labour constraint: currently still an immigration assumption value, flagged for Phase 1C source review
- health/aged-care worker demand: currently still an immigration assumption value, flagged for Phase 1C source review
- numerous scoring/commentary coefficients: retained in calculation/commentary code for output stability and documented in Phase 1A risk register

## 6. Migrated policy settings

Migrated into `POLICY_SETTINGS`:

General default policy settings:

- immigration rate: 2
- housing build rate: 175,000 homes/year
- integration effectiveness: 65
- skills alignment: 70
- infrastructure readiness: 60
- tax rate: 25
- stimulus rate: 2

Immigration current-path policy/scenario settings:

- net overseas migration: 260,000 people/year
- housing build rate: 180,000 dwellings/year
- regional settlement share: 18%

These are intentionally stored as policy/scenario settings, not observed facts.

## 7. Baseline versioning

Active baseline version:

```text
baseline-2026-draft-v1
```

Metadata:

- review date: 2026-07-12
- reference year: 2026
- status: draft
- approved state: draft
- known gaps: current values migrated from code; current-policy baseline not calibrated; migration categories not fully segmented

Scenario configs now record the baseline version they use.

## 8. Validation rules

`validateModelConfiguration` checks for:

- missing units
- missing sources
- stale review dates
- invalid ranges
- duplicate identifiers
- missing confidence ratings
- missing reference periods
- impossible negative values for non-negative units
- missing/unknown baseline versions

The test suite includes invalid-data checks for missing units, missing sources and invalid ranges.

## 9. Data provenance view

A limited transparency view was added to `AssumptionsPanel` on the settings/how-the-model-works route.

It shows:

- baseline version and review date
- variable name
- value
- source/status
- classification
- confidence
- range
- affected outputs

This is an advanced/developer transparency view, not final UI polish.

## 10. Tests added

`src/tests/run-tests.mjs` now tests that:

- model config separates baseline variables, behavioural assumptions, policy settings and scenarios
- defaults are read from configuration
- scenarios retain baseline version
- invalid data is flagged
- policy overrides do not mutate stored baseline data
- provenance rows expose source/confidence/range/affected outputs

Existing model tests also continue to pass.

## 11. Assumptions still requiring evidence

Highest priority for Phase 1C:

1. Population baseline and reference period
2. NOM and visa category segmentation
3. Dwelling stock, completions and household size
4. Labour force participation/employment by migrant group
5. Productivity growth and skills matching
6. Average tax per worker and government spending per person
7. Infrastructure cost/capacity lags
8. Social cohesion sensitivity
9. Environmental pressure components
10. Scoring/commentary thresholds and trade-off coefficients

## 12. Output differences

No intentional output differences were created. Current numeric values were migrated into configuration and then imported back into existing model formulas.

Existing test coverage passed after migration, which supports output preservation at the tested behavioural level. Exact snapshot equality was not added in this phase.

## 13. Validation results

- `npm test` passed: 18 tests passed.
- `npm run build` passed: TypeScript and Vite production build succeeded.
- Local route smoke check passed for `#dashboard`, `#settings` and `#immigration`.
- Local console check showed no JavaScript errors; only normal Vite/React development messages.

## 14. Phase boundary

Stop after Phase 1B. Do not begin recalibration, source-value replacement, broad model expansion or main interface redesign until Phase 1C is explicitly requested.
