# Phase 1D pathway calibration

Date: 2026-07-12  
Baseline: `australian-baseline-v1.0`  
Scope: add direct scenario pathways while keeping UI changes minimal and preserving the evidence-based scenario-model caveat.

## Implemented pathways

### GDP and GDP per person

The immigration scenario model now reports:

- `gdpIndex`
- `gdpPerPersonIndex`

These are indexed scenario outputs anchored to the reviewed baseline, not official GDP forecasts. The pathway responds to productivity growth, employment-to-population movement, business capacity and population growth.

### Labour-market stock

The model now reports:

- `employedPeople`
- `unemployedPeople`
- `unemploymentRate`

The first version is calibrated from the ABS May 2026 employment-to-population ratio and unemployment rate, then responds to business capacity, participation and housing pressure. It is still a simplified pathway and does not yet segment unemployment by age, region or migrant status.

### Housing affordability and rent/vacancy pressure

The model now separates the old housing-stress proxy into more traceable intermediate outputs:

- `rentalVacancyRate`
- `rentPressureIndex`
- `affordabilityIndex`
- `housingStressIndex`

The vacancy/rent/affordability values are still index-based and require Phase 1E evidence work against rents, vacancies, prices and serviceability data. They replace a single opaque housing-stress calculation with a clearer pathway.

### Migration segmentation

The immigration model now reports segmented arrivals:

- `studentArrivals`
- `otherTemporaryArrivals`
- `permanentOrLongTermArrivals`

Student arrivals are anchored to the reviewed ABS Overseas Migration student-arrivals marker. Other categories remain approximate because direct visa/status segmentation has not yet been fully integrated from Home Affairs and ABS sources.

### Fiscal-dollar pathway

The immigration model now reports Commonwealth-dollar outputs:

- `commonwealthRevenueDollars`
- `commonwealthSpendingDollars`
- `commonwealthBalanceDollars`

These are traceable indexed-dollar scenario estimates anchored to Budget Paper No. 1 revenue and expense estimates. They do not replace detailed Commonwealth/state/local fiscal modelling.

### Expanded sensitivity testing

`runExpandedSensitivity()` now tests ranges for:

- net overseas migration;
- housing build rate;
- average tax per worker;
- government spending per person;
- social cohesion sensitivity.

For each dimension it identifies the dominant affected outcome and whether scenario conclusions should show uncertainty.

## Files changed

- `src/topics/immigration/model.ts`
- `src/model/validation/sensitivity.ts`
- `src/model/index.ts`
- `src/tests/run-tests.mjs`
- `docs/model/phase-1d-pathway-calibration.md`

## Tests

Added regression coverage for:

- direct GDP and GDP-per-person outputs;
- employment and unemployment stock outputs;
- vacancy, rent pressure and affordability outputs;
- segmented migration outputs;
- Commonwealth revenue/spending/balance dollar outputs;
- expanded sensitivity dimensions.

## Remaining limitations

- GDP remains an index pathway, not a national-accounts dollar forecast.
- Housing affordability requires authoritative rent, vacancy, price and serviceability data.
- Migration segmentation needs Home Affairs/ABS visa/status/duration integration.
- Fiscal modelling is Commonwealth-level and does not yet reconcile state/local impacts in dollars.
- Social cohesion remains exploratory and should be shown with uncertainty warnings.
