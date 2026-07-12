# Phase 1C back-testing report

Baseline version: `australian-baseline-v1.0`  
Run date: 2026-07-12

## Method

This is a first-pass reproducible historical cross-check, not a full statistical calibration.

The model was started from the reviewed v1.0 baseline values and compared against recent observed or forecast indicators where the current engine has a comparable concept.

The back-test deliberately records missing variables and definition mismatches rather than tuning coefficients to force historical fit.

## Results summary

| Outcome | Observed / source value | Model comparison | Finding |
|---|---:|---:|---|
| Population | 27,801,023 at 31 Dec 2025 | First model year starts from this and adds annual change | Starts from observed stock; annual-step timing differs from reference date |
| Net overseas migration | 301,000 year ending Dec 2025 | Current-path NOM = 301,000 | Comparable for v1.0 first year |
| Employment | Employment-to-population ratio 63.8%, May 2026 | No direct employment stock | Missing variable |
| Unemployment | 4.4%, May 2026 | No unemployment output | Missing variable |
| GDP | 0.3% quarterly growth, Mar qtr 2026 | Abstract growth/business capacity only | Inappropriate formula for direct GDP back-test |
| GDP per person | Not yet integrated | No GDP/person output | Missing variable |
| Inflation | CPI +4.0% annual, May 2026 | Inflation only appears as optional event shock | Missing baseline inflation pathway |
| Housing construction | 43,816 completions in Mar qtr 2026; annualised 175,264 | Model applies build-rate with construction constraint | Approximate only; construction constraint needs evidence |
| Housing affordability/rents | Not yet integrated | Housing stress index only | Proxy mismatch |
| Government revenue | Treasury 2026-27 revenue estimate $815,328m | Abstract fiscal units / pressure indices | Incompatible definitions |
| Government expenditure | Treasury 2026-27 expenses estimate $833,262m | Abstract fiscal units / pressure indices | Incompatible definitions |
| Emissions/resource use | DCCEEW source identified | Environmental pressure index only | Numeric pathway unresolved |

## Major differences and causes

- Missing variables: unemployment, GDP per person, wages, rents/vacancies, explicit emissions.
- Weak assumptions: social cohesion, environmental pressure, construction constraint, fiscal coefficients.
- Inappropriate formulas: fiscal budget-dollar comparison and GDP comparison are not yet supported by model units.
- Exceptional external events: not force-fit; inflation and shocks remain event/scenario inputs.
- Poor calibration: likely in housing stress and fiscal pressure coefficients, but not adjusted in Phase 1C without deeper evidence.

## Calibration decision

No formula coefficients were tuned solely for historical fit. Phase 1D should add explicit GDP, labour, housing affordability, fiscal and environmental pathways before stronger back-testing.
