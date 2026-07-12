# Phase 1C calibration report

Date reviewed: 2026-07-12  
Baseline version: `australian-baseline-v1.0`  
Reference period: latest authoritative values available at review date, mostly Dec 2025 to May/Mar 2026 depending on series.  
Model description: evidence-based scenario model under stated assumptions; not a forecast.

## Baseline definition

The v1.0 baseline starts from recent official Australian data where directly verified:

- ABS Estimated Resident Population at 31 December 2025.
- ABS annual natural increase and NOM contribution for the year ending 31 December 2025.
- ABS Overseas Migration 2024-25 arrivals, departures and temporary student arrivals.
- ABS Labour Force May 2026 unemployment and employment-to-population ratio.
- ABS National Accounts March quarter 2026 GDP quarterly growth.
- ABS monthly CPI indicator May 2026 annual inflation.
- ABS Building Activity March quarter 2026 dwelling completions, annualised.
- Treasury Budget Paper No. 1 2026-27 revenue and expenses estimates.
- DCCEEW National Greenhouse Gas Inventory source marker; numeric environmental pathway remains unresolved.

## Current-policy baseline rule

Current policy does not mean every variable remains numerically fixed forever.

- Observed stock/current values start from latest verified data.
- Budget values are treated as government forecast assumptions, not observed outcomes.
- NOM and housing completions are current-path settings for v1.0 and should later become projection paths.
- CPI is recorded as a temporary condition and should return toward a long-run assumption in later model versions.
- Housing supply and population respond dynamically inside the model.

See `src/model/scenarios/currentPolicyBaseline.ts`.

## Calibration changes made

- Replaced baseline population with ABS ERP: 27,801,023 people at 31 December 2025.
- Replaced baseline NOM with ABS annual NOM contribution: 301,000 for year ending 31 December 2025.
- Replaced natural increase with ABS value: 111,500.
- Added ABS Overseas Migration composition markers: arrivals 568,000, departures 263,000, temporary students 157,000 for 2024-25.
- Added ABS Labour Force values: unemployment 4.4%, employment-to-population ratio 63.8% in May 2026.
- Added ABS GDP quarterly growth: 0.3% in March quarter 2026.
- Added CPI context: 4.0% annual CPI in May 2026.
- Aligned housing build-rate current path to annualised ABS March quarter completions: 43,816 x 4 = 175,264 dwellings/year.
- Added Budget 2026-27 Commonwealth revenue and expense estimates.
- Kept abstract fiscal unit variables separate to avoid pretending the existing general model uses budget dollars.

## Calibration rules applied

- No unexplained balancing factor was introduced.
- No coefficient was tuned solely to fit history.
- Existing model formulas were mostly preserved.
- Where a metric cannot be compared directly, the back-test records a definition gap instead of forcing a match.

## Remaining unresolved calibration gaps

- GDP per person is not directly modelled.
- Unemployment is not directly modelled.
- Wages are not directly modelled.
- Rents/vacancy/affordability are proxied by housing stress.
- Government finance formulas use abstract units or pressure indices.
- Environmental pressure is still exploratory and not a numeric emissions model.
- Social cohesion remains exploratory and range/scenario-based.
- Immigration segmentation is partial; visa category stocks/flows need more work.

## Expert review required

Economics, demography, housing, fiscal policy, migration policy, infrastructure, environment and social-cohesion experts should review the remaining behavioural relationships before stronger conclusions are made.
