# Baseline-led redesign implementation report

Date: 2026-07-12

## 1. Existing interface problems identified

- The production default experience did not start with a national baseline question. It exposed internal cockpit categories and topic modules before helping a first-time user understand the current path.
- The production immigration page started with an immigration explainer, scenario presets and detailed model panels. It was useful for expert exploration, but it did not first ask what outcome the user was trying to improve.
- The existing immigration module contained strong working logic — yearly timeline, assumptions, entities, trade-offs, myth tests, scenario comparison and causal map — but the presentation placed many inputs/results/explanations in one long expert-oriented flow.
- Baseline comparison existed in parts of the simulator, but the baseline was not the dominant framing for the main user journey.
- Advanced assumptions were accessible as a large assumption ledger rather than progressively disclosed after policy cards and supporting choices.
- Event/timeline behaviour existed, but the redesigned journey needed a clearer one-year-at-a-time simulation screen with event explanations, winners/losers and a baseline comparison in the main result flow.

## 2. Proposed information architecture

Top-level navigation now uses ordinary-user language:

1. Australia today
2. Current path
3. Problems to solve
4. Policies
5. My scenarios
6. How the model works

The default route is baseline-led:

- **Where is Australia heading?**
- Five national outcome cards
- Projection controls for current year, +5, +10, +20 and annual stepping
- Current-policy baseline risks/opportunities/affected groups/assumptions/confidence
- Three starting paths: Explore current path (primary), Solve a problem, Test a policy

The immigration route now follows:

1. Ask what outcome the user is trying to improve
2. Show policy approach cards before detailed controls
3. Add supporting policy choices
4. Watch outcomes unfold against baseline
5. Expand advanced settings only when needed
6. Compare three scenarios and inspect model transparency

## 3. Components and files changed

Implemented/changed files:

- `src/components/pages/BaselineHomePage.tsx` — new baseline-led national home/current-path/problem-entry component.
- `src/App.tsx` — route/hash mapping and new IA integration while preserving `#dashboard`, `#immigration`, `#reports`, `#settings` aliases.
- `src/components/GameHeader.tsx` — simplified navigation labels and baseline-led product language.
- `src/components/immigration/ImmigrationScenarioLab.tsx` — redesigned guided immigration journey and simulation experience.
- `src/styles.css` — layout/styling for baseline home, policy cards, supporting policies, simulation results, score summary, event detail and responsive behaviour.

Pre-existing modified files observed but not part of this redesign pass:

- `README.md`
- `src/components/pages/DashboardPage.tsx`

## 4. Implemented code changes

- Added a new national baseline overview headed **Where is Australia heading?**
- Added five main national outcomes:
  - Living standards
  - Housing and essential services
  - Government finances
  - Wellbeing and social cohesion
  - Environment and resources
- Added projection year buttons and an annual range slider.
- Added baseline risks, opportunities, groups likely to benefit, groups likely to face pressure, assumptions and confidence notes.
- Added three starting paths with the requested weighting emphasis.
- Reworked immigration into a guided journey:
  - outcome objective selection;
  - policy cards before sliders;
  - supporting policy checkboxes;
  - advanced settings drawer;
  - one primary chart;
  - annual controls: previous year, next year, advance five years, play/pause, run to selected year, reset;
  - five compact outcome cards;
  - four-part commentary;
  - event markers and event detail explanation;
  - winners/losers panels;
  - baseline comparison;
  - scenario comparison with baseline, selected policy package and lower-immigration alternative;
  - model transparency area.
- Added an overall scenario score summary with baseline score, difference and category contributions.
- Added score weighting controls for living standards, housing, government finances, wellbeing, social cohesion, environment and fairness.

## 5. Simulation logic changes required

- Preserved the existing immigration scenario engine in `src/topics/immigration/*`.
- No replacement with static mock-ups.
- UI now composes existing scenarios with policy-card overrides and supporting-policy overrides before passing them into `runImmigrationScenario`.
- Added UI-level event marker derivation from calculated yearly outputs.
- Added UI-level illustrative score calculation for immigration yearly results, using existing output fields. This is explicitly presented as a summary rather than the main answer.

## 6. Screenshot/browser evidence

Browser evidence was captured with the Hermes browser tool for:

- Production immigration route before redesign: starts with `Immigration Scenario Lab`, explainer cards and scenario presets.
- Redesigned local default route: starts with `Where is Australia heading?`, current-policy baseline, five national outcomes and three starting paths.
- Redesigned local immigration route: shows objective selection, policy cards before sliders, supporting policies, simulation controls, chart, outcome cards, score summary, event markers, event detail, winners/losers, baseline comparison, scenario comparison and model transparency.

## 7. Fixed usability test results

### Production version: `https://australianpolicysimulator.vercel.app/#immigration`

| Task | Result | Actions | Wrong turns | Notes |
|---|---:|---:|---:|---|
| 1. Open simulator | Pass | 1 | 0 | Production loads. Console errors: 0. |
| 2. Understand current direction without changing assumptions | Partial | 1 | 0 | Immigration direction is visible, but there is no national baseline-led home. |
| 3. Identify one risk and one opportunity | Pass | 1 | 0 | Risks/opportunities exist in briefing/trade-off panels, but require scanning. |
| 4. Select housing affordability as outcome | Fail | — | — | No problem-first objective selector in production. |
| 5. Choose immigration policy response | Pass | 1 | 0 | Scenario presets are available. |
| 6. Change two assumptions | Pass | 2 | 0 | Assumption sliders are available but prominent/expert-heavy. |
| 7. Run one simulation year | Pass | 1 | 0 | Year controls exist. |
| 8. Move forward five years | Pass | 1 | 0 | Run/step controls exist. |
| 9. Identify main positive and negative outcomes | Pass | 1 | 0 | Winners/losers and tradeoffs available. |
| 10. Identify principal winners/losers | Pass | 1 | 0 | Entity cards available. |
| 11. Compare with baseline | Partial | 1 | 0 | Scenario comparison exists, but baseline not always the central framing. |
| 12. Change one supporting policy | Fail | — | — | Supporting policy packages are not first-class; user must infer via assumptions. |
| 13. Rerun scenario | Pass | 1 | 0 | Simulation can be rerun. |
| 14. Return to baseline | Pass | 1 | 0 | Current Path preset exists. |

Production conclusion: strong model exists, but it is not baseline-led/problem-led and exposes expert structure too early.

### Redesigned local preview: `http://127.0.0.1:5173/Australianpolicysimulator/`

| Task | Result | Actions | Wrong turns | Notes |
|---|---:|---:|---:|---|
| 1. Open simulator | Pass | 1 | 0 | Default `#dashboard` alias opens new baseline home. Console errors: 0. |
| 2. Understand current direction without changing assumptions | Pass | 1 | 0 | `Where is Australia heading?` and five outcome cards are visible immediately. |
| 3. Identify one risk and one opportunity | Pass | 1 | 0 | Baseline risks/opportunities are visible before policy selection. |
| 4. Select housing affordability as outcome | Pass | 2 | 0 | Problem-led path exposes primary objective selection. |
| 5. Choose immigration policy response | Pass | 1 | 0 | Immigration policy cards are available under Policies/`#immigration`. |
| 6. Change two assumptions | Pass | 3 | 0 | Advanced settings drawer opens and sliders can be changed. |
| 7. Run one simulation year | Pass | 1 | 0 | `Next year` control is present and clickable. |
| 8. Move forward five years | Pass | 1 | 0 | `Advance five years` control is present and clickable. |
| 9. Identify main positive and negative outcomes | Pass | 1 | 0 | Outcome cards, commentary and score summary are visible. |
| 10. Identify principal winners/losers | Pass | 1 | 0 | Likely-to-benefit and likely-to-face-pressure panels are visible. |
| 11. Compare with current-policy baseline | Pass | 1 | 0 | Baseline graph bars, compact baseline values and baseline-difference panel are visible. |
| 12. Change one supporting policy | Pass | 1 | 0 | Supporting policy checkboxes are visible before advanced settings. |
| 13. Rerun scenario | Pass | 1 | 0 | Results recalculate immediately from state changes; reset/run controls remain visible. |
| 14. Return to baseline | Pass | 1 | 0 | Australia today/current path nav returns to baseline; Current settings card remains available. |

Redesigned conclusion: the core baseline-led and guided immigration flow is usable locally.

## 8. Remaining limitations and recommended next improvements

- This pass implements the baseline and immigration journey using the existing immigration engine as the first robust baseline source. A broader national multi-domain baseline should later combine housing, budget, productivity, environment, health/education and demographics beyond immigration-driven assumptions.
- The new score summary is UI-level and illustrative. It should eventually be reconciled with the existing `SuccessScore` model or moved into shared simulation logic.
- The new event markers are calculated from thresholds in the UI. These should eventually be moved into the simulation engine and tested directly.
- The problem-led path currently selects objectives and routes to policy responses; the next step should map each objective to recommended policy packages across topics, not only immigration.
- Saved-scenario functionality remains in the existing reports/general simulator flow; the new guided journey should later save named immigration packages from the new state shape.
- Tablet responsiveness was addressed in CSS, but a full manual tablet-width/browser pass remains recommended.
- No Vercel preview deployment was created in this session because commit/push/deploy were not requested. The local production build succeeds and is deployable from committed source.

## 9. Verification

- `npm test`: PASS — 14 tests passed.
- `npm run build`: PASS — TypeScript build and Vite production build succeeded.
- Browser console, production `#immigration`: 0 JavaScript errors observed.
- Browser console, redesigned local routes: 0 JavaScript errors observed.
- Route aliases checked locally: `#dashboard`, `#current-path`, `#problems-to-solve`, `#immigration`, `#reports`, `#settings` all render content.
- `npm run lint`: FAIL due an existing Fast Refresh rule in `src/components/pages/cockpitShared.tsx:91`; this file was not changed by the redesign pass.

## 10. Deployability confirmation

- Production build succeeds.
- Vite/GitHub Pages base path was preserved.
- Existing Vercel route structure is supported by hash aliases, including `#immigration`.
- Vercel preview is deployable from this working tree once the changes are committed/pushed, subject to the same build command that already passes locally.
