# Phase 1C final findings

Date completed: 2026-07-12  
Baseline version: `australian-baseline-v1.0`  
Review status: first evidence-based calibrated baseline package with explicit limitations. This is an evidence-based scenario model, not a prediction or official forecast.

## 1. Baseline review date and reference periods

- Baseline review date: 2026-07-12.
- Active baseline version: `australian-baseline-v1.0`.
- Baseline reference year: 2026.
- Material reference periods are intentionally mixed only where official release timing differs:
  - population, annual growth, natural increase and NOM: year ending 31 December 2025;
  - overseas migration arrival/departure/student composition: 2024-25 financial year;
  - labour force: May 2026;
  - national accounts GDP context: March quarter 2026;
  - CPI context: May 2026;
  - dwelling completions: March quarter 2026;
  - Commonwealth revenue/expenses: 2026-27 Budget estimates.

Each variable in `src/model/data/baseline/variables.ts` records its own reference period, source, publication date, access date, confidence rating and transformation notes.

## 2. Current-policy baseline definition

`src/model/scenarios/currentPolicyBaseline.ts` defines current policy as a baseline scenario, not a frozen set of latest figures. It separates:

- observed baseline data, such as population and labour-market values;
- current or scenario policy settings, such as the migration path and housing build-rate setting;
- government forecast assumptions, such as Budget revenue/expenses estimates;
- market conditions, such as annualised dwelling completions;
- temporary conditions, such as the latest CPI reading;
- dynamic relationships that respond inside the model.

## 3. High-materiality values updated or added

- Total population: 27,801,023 at 31 Dec 2025, ABS.
- Annual population growth: 412,500, ABS.
- Net overseas migration: 301,000, ABS.
- Natural increase: 111,500, ABS.
- Migrant arrivals/departures/student arrivals: 568,000 / 263,000 / 157,000 for FY2024-25, ABS.
- Employment-to-population ratio and unemployment: 63.8% / 4.4%, May 2026, ABS.
- GDP quarterly growth context: 0.3%, March quarter 2026, ABS.
- CPI annual inflation context: 4.0%, May 2026, ABS.
- Dwelling completions: 43,816 in March quarter 2026, annualised to 175,264 dwellings/year, ABS.
- Commonwealth revenue/expenses context: $815,328m / $833,262m 2026-27 estimates, Treasury Budget Paper No. 1.

## 4. Machine-readable deliverables

- Source register: `docs/model/phase-1c-source-register.csv`.
- Updated assumption register: `docs/model/phase-1c-assumption-register.csv`.
- Baseline variables: `src/model/data/baseline/variables.ts`.
- Baseline version metadata: `src/model/data/baseline/baselineVersions.ts`.
- Current-policy definition: `src/model/scenarios/currentPolicyBaseline.ts`.
- Back-test module: `src/model/validation/backTest.ts`.
- Sensitivity module: `src/model/validation/sensitivity.ts`.
- Commentary trace module: `src/model/commentary/commentaryTrace.ts`.

## 5. Historical back-test summary

The back-test is a first reproducible cross-check, not a full statistical calibration. It confirms where the model has comparable concepts and where it does not.

Comparable / partially comparable:

- population starts from the reviewed ABS stock;
- current-path NOM equals the reviewed ABS annual NOM component;
- housing construction is approximately comparable after annualising ABS completions, but the model applies a construction constraint.

Not yet directly comparable:

- unemployment;
- GDP and GDP per person;
- wages;
- rents/vacancy/affordability;
- Commonwealth revenue/expenditure in dollars;
- emissions/resource use.

No formula coefficient was tuned solely to improve historical fit.

## 6. Sensitivity results

Initial automated sensitivity testing covers low, central and high net overseas migration for the immigration current-path scenario, reporting 2036 housing stress, labour supply, federal budget pressure, social cohesion risk and most affected groups.

Additional Phase 1C ranges were added for selected uncertain/high-materiality assumptions so later sensitivity expansion does not treat them as precise facts:

- average tax per worker;
- government spending per person;
- social cohesion sensitivity;
- environmental pressure per person.

Scenario conclusions involving social cohesion or environmental pressure should be treated as exploratory.

## 7. Application-visible baseline status

The app now visibly identifies the baseline in the header and baseline home page:

- `Australian baseline v1.0`;
- reviewed `2026-07-12`;
- scenario model, not a forecast.

The settings/model area exposes the advanced provenance table showing value, source/status, classification, confidence range and affected outputs.

## 8. Remaining limitations

- Dwelling stock remains a retained model estimate pending a directly comparable official stock definition.
- Household size remains retained pending ABS household-data review.
- Migrant stock remains retained pending definition choice: country of birth, citizenship, visa stock, years since arrival or another measure.
- Visa-category segmentation is incomplete.
- Employment, earnings, tax and service use are not yet segmented by migrant status/duration/category.
- GDP, GDP per person, unemployment, wages, rents/vacancy and emissions are not directly calculated outputs.
- Fiscal formulas still use abstract units or pressure indices.
- Social cohesion remains exploratory and should not be presented as a precise causal estimate.

## 9. Validation results

Commands run after implementation:

- `npm test` — passed; 22 tests passed.
- `npm run build` — passed; TypeScript and Vite production build succeeded.
- `VERCEL=1 npm run build` — passed; Vercel/root build succeeded.
- Final `npm run build` — passed; default GitHub Pages build restored in `dist/`.
- Local browser route checks: `#dashboard`, `#settings`, `#immigration` loaded.
- Browser console: no JavaScript errors observed in route checks.

## 10. Phase boundary

Phase 1C is complete as a first evidence-based baseline/calibration package. Do not begin the broad baseline-led interface redesign or further recalibration until explicitly requested.
