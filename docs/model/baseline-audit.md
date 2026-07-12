# Phase 1A baseline audit

Audit date: 2026-07-12  
Repository: `C:/Users/User/AustraliaPolicySimulator`  
Scope: documentation-only audit. No simulation values were intentionally changed.

## Current model architecture summary

The repository currently contains two overlapping simulation layers.

### 1. General cockpit simulator

Location: `src/simulation/*`, with UI in `src/components/*` and page shells in `src/components/pages/*`.

Key structure:

- `World.ts` owns the yearly stepping process.
- `presets.ts` defines default policy settings and scenario presets.
- `entities.ts` creates representative households, companies, government and environment and updates them each step.
- `outcomes.ts` calculates outcome scores, drivers and commentary.
- `FeedbackSystem.ts` creates feedback loops between wellbeing, fiscal capacity, public pressure, infrastructure pressure and policy effectiveness.
- `SuccessScore.ts` converts outcomes into a weighted illustrative score.
- `events.ts` adds optional event shocks.

The general model is entity-based and deterministic, but its units are mostly illustrative indices rather than observed Australian statistical series.

### 2. Immigration topic simulator

Location: `src/topics/immigration/*`, with UI in `src/components/immigration/ImmigrationScenarioLab.tsx`.

Key structure:

- `assumptions.ts` defines user-exposed immigration assumptions and placeholder source/confidence labels.
- `scenarios.ts` defines immigration scenario presets, including `current-path`.
- `model.ts` runs annual immigration projections from the start year and generates trade-offs, national briefing, myth tests and cause-effect maps.
- `entities.ts` defines affected groups and qualitative entity metadata.

The immigration model is more detailed than the general model, but it is still mostly a placeholder/index model. It does not yet use a reviewed dated baseline dataset.

## Apparent baseline year

- General cockpit simulator: no evidence-based baseline year. The app historically used turn/year labels, but the model constants do not identify a statistical reference year.
- Immigration simulator: starts at 2026, but the starting population, dwellings, NOM and related assumptions are not traceably tied to reviewed datasets.
- Result: the model should not currently be described as representing current Australia except as an illustrative placeholder.

## Baseline status assessment

The current baseline is **illustrative, not calibrated**.

Evidence:

- Many material assumptions have no source in code.
- Several assumptions are explicitly labelled placeholder.
- Observed data, policy settings, behavioural relationships, commentary thresholds and scoring weights are mixed in code.
- Current-policy baseline is defined as a scenario preset rather than a documented mix of current legislation, announced policy, forecasts, demographic trends and dynamic responses.
- General and immigration layers duplicate concepts with different values, such as starting population and household size.

## Inventory summary

See `assumption-register.csv` for the structured register.

This Phase 1A pass identifies 74 curated material assumptions. It prioritises material model pathways rather than claiming to classify every UI-only number as a real-world assumption. The most material unsupported values are population, NOM, housing stock/completions, household size, fiscal proxies, social cohesion sensitivity, feedback coefficients and score weights.

## Classification categories used

1. Observed baseline data
2. Behavioural relationship
3. Policy setting
4. Accounting identity
5. Scoring or weighting assumption
6. Commentary threshold
7. Exploratory or unsupported assumption
8. Technical constant that does not represent reality

## Main conclusion

The model is transparent enough to audit, but not yet credible enough to describe as current or calibrated. Phase 1B should create a dated evidence-backed baseline before recalibration or further UI expansion.
