# Immigration audit

Phase 1A gives the immigration module extra attention because it is the first intended redesigned policy journey.

## Files reviewed

- `src/topics/immigration/assumptions.ts`
- `src/topics/immigration/scenarios.ts`
- `src/topics/immigration/model.ts`
- `src/topics/immigration/entities.ts`
- `src/components/immigration/ImmigrationScenarioLab.tsx`

## Current representation

### Permanent migration

Not modelled as a separate stock or flow. Some scenario labels imply changes to migration settings, but calculations mainly use net overseas migration and proxy assumptions.

### Temporary migration

Not modelled as a separate stock or flow. Departures and arrivals are inferred from NOM with simple multipliers.

### Net overseas migration

Directly modelled as `netOverseasMigration` and used as the main population-flow driver. This is high materiality and currently placeholder-sourced.

### International students

Represented indirectly through a derived `studentShare`, but not through Home Affairs/ABS student visa data or separate service/housing behaviour.

### Skilled migration

Represented indirectly by migrant working-age share, workforce participation, productivity growth and average tax per worker. The `skilled-migration-focus` preset changes some of these values, but there is no explicit skilled visa cohort.

### Family migration

Not directly represented.

### Humanitarian migration

Not directly represented.

### Age and household composition

Age structure is approximated using working-age, children and retiree shares. Household demand uses a national household-size divisor. There is no cohort-component or migrant household-formation model.

### Labour-force participation and employment

Workforce participation is an assumption. Employment and unemployment rates are not separately modelled. Labour supply and business capacity are indices.

### Occupation and skills matching

No occupation-level model. Skills matching is proxied by productivity/business capacity assumptions.

### Income and tax contribution

Average tax per worker is a single assumption. No distribution by visa category, income, occupation, duration in Australia or employment status.

### Government service demand

Broad pressure indices exist for health/aged care, education, federal and state budgets. They are not tied to observed service capacity, waitlists, workforce or expenditure datasets.

### Housing demand

Population and household-size assumptions feed housing demand. Housing supply comes from a build-rate assumption and construction-labour constraint. No direct rent, vacancy, price, tenure or location distribution is modelled.

### Regional settlement

Regional settlement share is a user-visible assumption. Regional/capital-city pressure is formula-derived, but retention, employment matching and housing availability by region are not modelled.

### Return migration

Departures are formula-derived from NOM. Return migration and temporary departures are not explicit.

### Citizenship and integration

Integration is represented by social cohesion sensitivity, settlement-support narratives and trade-offs. There is no citizenship/settlement-duration stock.

### Population ageing

Ageing appears through dependency and retiree-share formulas. It is not a cohort-component demographic projection.

### Infrastructure demand

Infrastructure pressure uses per-person cost and pressure formulas. No asset-class, location, lag or state-specific infrastructure model exists.

### Education and health demand

Education pressure and health/aged-care pressure are indices derived from student/children/retiree shares and service pressure. They are not calibrated to observed service demand or capacity.

## Where migrants are treated as uniform

The model mostly treats migrants as a single NOM-driven population flow. It partially differentiates by working-age share, students and regional settlement, but does not separately model:

- visa category;
- age distribution by category;
- income;
- employment status;
- occupation and skills;
- household composition;
- duration in Australia;
- location and retention;
- service use;
- return/circular migration.

This materially affects conclusions about fiscal contribution, housing pressure, labour supply, services and winners/losers.

## Current-path definition gap

`current-path` currently means `DEFAULT_IMMIGRATION_ASSUMPTIONS`. It does not yet distinguish:

- current legislated policy;
- announced but not implemented policy;
- government forecasts;
- demographic trends;
- market trends;
- temporary economic conditions;
- long-run structural assumptions;
- dynamic model responses.

## Highest-priority immigration assumptions for Phase 1B

1. Net overseas migration central/low/high path.
2. Permanent/temporary/student/skilled/family/humanitarian segmentation.
3. Dwelling stock, completions and household formation.
4. Migrant age distribution and household composition.
5. Participation, employment, income and tax by group.
6. Government spending/service demand by age/status.
7. Infrastructure cost and delivery lag.
8. Regional distribution and retention.
9. Housing stress formula against observed rents/vacancy/affordability.
10. Social cohesion and integration assumptions.

## Preferred authoritative evidence

- ABS ERP and Overseas Migration for population/NOM.
- Home Affairs visa statistics for visa categories and stocks/flows.
- ABS Labour Force for participation/employment.
- ABS Census/income/housing datasets for household structure, tenure and distribution.
- ABS Building Activity and NHSA for housing supply/demand.
- ATO/Treasury/PBO/Finance for fiscal contribution and cost assumptions.
- AIHW and education agencies for health/education service demand.
- Infrastructure Australia and state infrastructure plans for capacity and cost.
- DCCEEW/AEMO for emissions/energy/resource channels.

## Recommendation

Do not update immigration values silently. Phase 1B should introduce a versioned immigration baseline with source IDs, reference periods, access dates, uncertainty ranges and explicit current-policy rules before recalibrating formulas.
