# Iteration Log

## 2026-07-04 - Plain-English event names in shared summaries

### Review

- **User clarity:** The app clearly labels itself as illustrative and provides assumptions, but the copyable scenario summary exposed raw event IDs when events were selected.
- **Policy realism:** Existing assumptions and outcome explanations avoid claiming official forecasts; no model formula change was needed this iteration.
- **Explainability:** Sharing a scenario should preserve the plain-English event context visible in the UI.
- **Visual design:** No visual layout change was needed for this highest-value improvement.
- **Code stability:** The change was isolated to summary text generation and covered by a model regression test.

### Highest-value improvement chosen

Make copied/shared scenario summaries render selected events as user-facing names with timing, for example `Housing supply shock in year 1`, instead of raw IDs like `housing-supply`.

### Why it matters

A non-technical Australian user may copy the scenario summary into an email, document or discussion. Plain-English event names make the result easier to understand and reduce the chance that implementation details are mistaken for policy language.

### What changed

- `src/simulation/outcomeModel.ts`
  - `buildScenarioSummary` now maps selected event IDs to names and years from `DEFAULT_EVENTS`.
  - Unknown event IDs fall back to `Unknown event (<id>)` rather than failing silently.
- `src/tests/run-tests.mjs`
  - Added a regression test that confirms copied summaries use plain-English event names and handle unknown IDs.

### What was learned

The simulator already has strong in-app explanations, assumptions and disclaimers. The most immediate clarity gap was in exported/shared text rather than on-screen layout.

### Verification

- `npm test` passed.
- `npm run build` should be run before publishing or completing this iteration.

### Next suggested improvement

Add a small “how to read the results” note near the success score or current-year factors so first-time users understand that scores are directional comparisons, not official performance measures.

## 2026-07-04 - Iteration 1 of 10: Success score interpretation note

### Review

- **User clarity:** The success score was prominent but could be mistaken for an official national rating.
- **Policy realism:** No formula change was needed; the main risk was over-interpretation.
- **Explainability:** Users needed a plain-English instruction on how to read the weighted score.
- **Visual design:** A short intro line fit the existing section style.
- **Code stability:** Small UI-only text addition.

### Highest-value improvement chosen

Add a note explaining that Overall Success is a directional comparison across user-selected priorities, not an official performance measure or policy recommendation.

### Why it matters

Non-technical users need to know the score helps compare scenarios; it should not imply official endorsement or predictive precision.

### What changed

- `src/components/SuccessScorePanel.tsx`
  - Added a section intro and an extra explanatory sentence inside the summary card.

### What was learned

The score panel is a high-trust area of the interface, so it needs the strongest anti-false-precision wording.

### Verification

- Relevant test: UI/build verification.
- `npm run build` passed in the batch verification.

### Next suggested improvement

Clarify the selected-year factor rows, especially that Housing Stress is a lower-is-better measure.

## 2026-07-04 - Iteration 2 of 10: Selected-year factor reading guide

### Review

- **User clarity:** Outcome factor rows showed scores and movement but did not explain the scale up front.
- **Policy realism:** The factors remained directional rather than official indicators.
- **Explainability:** Users needed to know why Housing Stress behaves differently.
- **Visual design:** A compact intro line preserved the existing layout.
- **Code stability:** UI-only text addition.

### Highest-value improvement chosen

Add a short guide above Selected Year Outcome Factors explaining the 0-100 direction and that lower Housing Stress is better.

### Why it matters

Without this note, users may read a higher Housing Stress number as good because most other scores are higher-is-better.

### What changed

- `src/components/CurrentYearFactorPanel.tsx`
  - Added the factor interpretation note.

### What was learned

Mixed-direction metrics need explicit labelling near the point of use, not only in assumptions or formulas.

### Verification

- Relevant test: UI/build verification.
- `npm run build` passed in the batch verification.

### Next suggested improvement

Clarify what the baseline comparison is holding constant.

## 2026-07-04 - Iteration 3 of 10: Baseline comparison context note

### Review

- **User clarity:** Baseline Comparison showed deltas but did not say whether events and horizon were also changed.
- **Policy realism:** Good comparisons should isolate policy settings from scenario context.
- **Explainability:** Users needed to know the baseline uses the same selected horizon and event shocks.
- **Visual design:** A second short paragraph fit the existing baseline panel.
- **Code stability:** UI-only text addition.

### Highest-value improvement chosen

Add a note that baseline uses default Balanced settings with the same time horizon and selected event shocks.

### Why it matters

This makes comparisons fairer and easier to trust because users can see what changed and what stayed constant.

### What changed

- `src/components/BaselineComparison.tsx`
  - Added a baseline context paragraph.

### What was learned

Comparison panels should explain their counterfactual, not just display deltas.

### Verification

- Relevant test: UI/build verification.
- `npm run build` passed in the batch verification.

### Next suggested improvement

Make event shocks harder to misread as forecasts.

## 2026-07-04 - Iteration 4 of 10: Event queue realism note

### Review

- **User clarity:** Event cards listed timing and impacts, but the queue title alone could sound predictive.
- **Policy realism:** Events should be framed as stress tests, not forecasts.
- **Explainability:** Users needed to know events activate in listed years.
- **Visual design:** A compact note in the event panel was enough.
- **Code stability:** UI-only text addition.

### Highest-value improvement chosen

Add an Event Queue note explaining events are optional illustrative shocks that activate in the listed year.

### Why it matters

The simulator can be used for resilience testing without implying that shocks are expected to occur.

### What changed

- `src/components/ScenarioSetup.tsx`
  - Added the event realism note.

### What was learned

Scenario controls benefit from warning labels before users select high-impact inputs.

### Verification

- Relevant test: UI/build verification.
- `npm run build` passed in the batch verification.

### Next suggested improvement

Make the copy action feel reliable and recover gracefully if browser clipboard permissions fail.

## 2026-07-04 - Iteration 5 of 10: Copy summary feedback and fallback

### Review

- **User clarity:** The Copy summary button gave no confirmation.
- **Policy realism:** Shared results already include disclaimers; the issue was interaction reliability.
- **Explainability:** Users needed a fallback if clipboard permissions failed.
- **Visual design:** A short status message avoids clutter.
- **Code stability:** Added local component state and simple error handling.

### Highest-value improvement chosen

Show “Copied summary” after a successful copy and display a manual-copy fallback message if clipboard access fails.

### Why it matters

Copyable summaries are meant for discussion. Users should know whether the app completed the action.

### What changed

- `src/components/ScenarioSummary.tsx`
  - Added copy status state and clipboard failure handling.
- `src/styles.css`
  - Added styling for the copy fallback status.

### What was learned

Small interaction feedback can make the simulator feel more trustworthy without changing model behaviour.

### Verification

- Relevant test: TypeScript/build verification.
- `npm run build` passed in the batch verification.

### Next suggested improvement

Expose housing stress more clearly in transparent calculations.

## 2026-07-04 - Iteration 6 of 10: Housing stress calculation note

### Review

- **User clarity:** Housing stress is important but the transparent calculation list skipped its plain-English formula.
- **Policy realism:** The model remains simplified; the wording makes that simplification visible.
- **Explainability:** Users can now connect migration, housing build rate and stress more directly.
- **Visual design:** Existing Transparent Calculations list was the right location.
- **Code stability:** Added one explanatory string only.

### Highest-value improvement chosen

Add a transparent calculation note explaining that Housing Stress compares estimated new household demand with effective housing supply, and that lower is better.

### Why it matters

Housing is central to Australian policy discussions. Users need to see why the housing slider affects wellbeing and fairness.

### What changed

- `src/simulation/outcomeModel.ts`
  - Added a housing-stress explanation to `buildTransparentCalculationNotes`.

### What was learned

The simulator’s best explanations are close to the numbers they explain.

### Verification

- Relevant test: model regression/build verification.
- `npm test` passed.
- `npm run build` passed.

### Next suggested improvement

Make the success-score explanation itself carry the “illustrative” qualifier.

## 2026-07-04 - Iteration 7 of 10: Success-score explanation wording

### Review

- **User clarity:** The generated score explanation did not itself say the score was illustrative.
- **Policy realism:** This was wording, not a scoring formula change.
- **Explainability:** The explanation now references current weighting choices.
- **Visual design:** No layout change needed.
- **Code stability:** Covered by a regression assertion.

### Highest-value improvement chosen

Update the generated success explanation to say “This illustrative score...” and tie interpretation to current weights.

### Why it matters

If the explanation is copied or read without the surrounding panel, it still avoids false precision.

### What changed

- `src/simulation/SuccessScore.ts`
  - Revised `buildSuccessExplanation` wording.
- `src/tests/run-tests.mjs`
  - Added an assertion that the success explanation includes the illustrative-score reminder.

### What was learned

Safety wording should live in generated model text as well as visible UI text.

### Verification

- Relevant test: `npm test`.
- `npm test` passed.
- `npm run build` passed.

### Next suggested improvement

Include housing stress in copied headline outcomes so shared summaries do not omit a key trade-off.

## 2026-07-04 - Iteration 8 of 10: Housing stress in copied scenario headline

### Review

- **User clarity:** Shared summaries included growth, wellbeing, fairness, cohesion, budget and environment, but omitted housing stress.
- **Policy realism:** Housing stress is a core trade-off and should travel with shared results.
- **Explainability:** This makes the migration/housing/fairness relationship more visible outside the app.
- **Visual design:** Text-only summary change.
- **Code stability:** Covered by the scenario summary regression test.

### Highest-value improvement chosen

Add Housing Stress to the headline illustrative outcomes in copied scenario summaries.

### Why it matters

A scenario may look good on growth while still creating housing pressure. Shared results should preserve that trade-off.

### What changed

- `src/simulation/outcomeModel.ts`
  - Added housing stress to `buildScenarioSummary` headline outcomes.
- `src/tests/run-tests.mjs`
  - Added an assertion that copied summaries include housing stress.

### What was learned

Shared outputs need the same policy trade-off completeness as the on-screen UI.

### Verification

- Relevant test: `npm test`.
- `npm test` passed.
- `npm run build` passed.

### Next suggested improvement

Explain the representative entity panels before users open them.

## 2026-07-04 - Iteration 9 of 10: Entity panel orientation note

### Review

- **User clarity:** Entity sections appeared after many outcome panels without a reminder of what “entities” mean.
- **Policy realism:** Representative entities must not be mistaken for real people, firms or agencies.
- **Explainability:** A short note links entities to “who carries pressure”.
- **Visual design:** A small green intro card matches existing explanatory styling.
- **Code stability:** UI-only addition.

### Highest-value improvement chosen

Add a representative-entity orientation note before the entity sections.

### Why it matters

This keeps the simulator understandable to non-technical users and protects against over-interpreting entity scores.

### What changed

- `src/components/EntityPanels.tsx`
  - Added an entity intro note.
- `src/styles.css`
  - Added styling for the intro card.

### What was learned

Advanced explanation panels need a brief “what am I looking at?” cue before detail.

### Verification

- Relevant test: UI/build verification.
- `npm run build` passed in the batch verification.

### Next suggested improvement

Make feedback loops easier to understand before users inspect the detailed cards.

## 2026-07-04 - Iteration 10 of 10: Feedback loop orientation note

### Review

- **User clarity:** Active Feedback Loops showed many state variables without first explaining the idea of carry-over pressure.
- **Policy realism:** Feedback loops are a simplified behavioural mechanism, not calibrated dynamics.
- **Explainability:** Users now see that weak years can make later policy delivery harder.
- **Visual design:** Reused the same section-intro style.
- **Code stability:** UI-only addition.

### Highest-value improvement chosen

Add a feedback-loop orientation note explaining that pressure carries from one year into the next.

### Why it matters

This helps users understand why simulation outcomes can change over time even when slider settings stay fixed.

### What changed

- `src/components/FeedbackPanel.tsx`
  - Added the feedback loop explanation note.

### What was learned

Time-based simulators need clear explanations of state carry-over, not only point-in-time outcomes.

### Verification

- Relevant test: final UI/build verification.
- `npm test` passed.
- `npm run build` passed.
- Built `dist/index.html` still references `/Australianpolicysimulator/assets/...`, preserving GitHub Pages/Vercel-compatible production output.

### Next suggested improvement

Consider a small glossary for terms like “absorptive capacity”, “feedback loops”, “housing stress” and “representative entities”.

## 2026-07-04 - Strategic simulation UX foundation: End Year loop

### Review

- **User clarity:** The app was still primarily a slider dashboard. Users could move controls and immediately see outcome changes, which felt like tuning a calculator rather than governing a country.
- **Policy realism:** Existing calculations were useful enough to keep, but the interaction pattern needed to represent policy decisions and delayed consequences.
- **Explainability:** The page needed a clear Prime Minister briefing and a visible governing phase so users understand when decisions are pending versus enacted.
- **Visual design:** A small strategic-game framing layer could be added without redesigning all panels at once.
- **Code stability:** The safest foundation was to stop live preview updates while preserving existing `runSimulation` formulas.

### Highest-value improvement chosen

Create the first turn-based UX foundation: policy changes are now pending decisions, national reports stay based on the last enacted simulation, and the annual action is now `End Year`.

### Why it matters

This is the core shift from “slider sandbox” to “government strategy simulator”. A player should experience delayed consequences after making annual decisions, not instantly watch every number move while dragging controls.

### What changed

- `src/App.tsx`
  - Added enacted policy/event state separate from pending policy controls.
  - Removed live scenario preview as the source of displayed reports.
  - Initialised the dashboard from the default enacted simulation.
  - Added a Prime Minister Briefing section explaining the annual governing loop.
  - Renamed the policy section to `Government Policy Decisions`.
- `src/components/PlaybackControls.tsx`
  - Reframed playback as `Annual Turn Controls`.
  - Replaced `Start Simulation` with `End Year`.
  - Added a current governing phase card showing whether decisions are pending approval or reports are showing enacted results.
- `src/components/ScenarioSetup.tsx`
  - Renamed setup framing to `Cabinet Agenda`.
- `src/styles.css`
  - Added styling for the Prime Minister briefing and governing phase card.

### What was learned

The existing model can support a strategy-game loop if the UI separates pending decisions from enacted national results. This gives delayed consequences without changing formulas yet.

### Verification

- `npm run build` passed.
- `npm test` passed.
- Built `dist/index.html` still references `/Australianpolicysimulator/assets/...`, preserving GitHub Pages publish compatibility.

### Next suggested improvement

Add the first dedicated `National Reports` screen/section with Treasury, Housing, Environment and Employment report cards generated from the existing outcome data, before adding new model mechanics.

## 2026-07-04 - National Reports: first cabinet briefing cards

### Review

- **User clarity:** The turn-based foundation introduced a Prime Minister briefing, but users still needed departmental reports before making policy decisions.
- **Policy realism:** Reports should feel like cabinet briefing papers while still using the existing simplified model outputs.
- **Explainability:** Treasury, Housing, Environment and Employment each needed summary, concerns, improvements, trend and recommendations.
- **Visual design:** A four-card report grid gives strategic-game structure without overwhelming the page.
- **Code stability:** No model mechanics changed; reports are derived from existing enacted outcome data.

### Highest-value improvement chosen

Add a dedicated National Reports section with Treasury, Housing, Environment and Employment report cards generated from current `OutcomeScores`.

### Why it matters

The player should feel like they are governing Australia through institutions, not reading raw metrics. Departmental reports turn existing numbers into a yearly cabinet briefing.

### What changed

- `src/components/NationalReports.tsx`
  - Added a new report component.
  - Generates four reports from existing outcome data: Treasury, Housing, Environment and Employment.
  - Each report includes summary, major concerns, major improvements, trend and recommendations.
  - Employment uses a clearly labelled proxy derived from existing growth, wellbeing and cohesion outputs rather than adding a new model variable.
- `src/App.tsx`
  - Renders National Reports after the Prime Minister Briefing and before Cabinet Agenda decisions.
- `src/styles.css`
  - Added report-card layout, trend badges and responsive styling.

### What was learned

The existing model already has enough outcome data to support a more strategic presentation layer. The next UX value is in sequencing and storytelling, not model complexity.

### Verification

- `npm run build` passed.
- `npm test` passed.
- `git diff --check` passed with only normal line-ending warnings.
- Built `dist/index.html` still references `/Australianpolicysimulator/assets/...`, preserving GitHub Pages publish compatibility.

### Next suggested improvement

Add an Advisor Panel that turns the same existing outcomes into conflicting recommendations from Treasurer, Environment Minister, Opposition and Union Representative before the user ends the year.

## 2026-07-04 - Population Growth Simulation living dashboard

### Review

- **User clarity:** The turn-based shell now existed, but the app still needed a visibly game-like dashboard that changed as population policy inputs moved.
- **Policy realism:** The new screen needed to illustrate population, immigration, births, deaths, housing and infrastructure pressure without replacing the existing model.
- **Explainability:** Any placeholder assumptions had to be labelled clearly so users understand what is model-backed and what is illustrative.
- **Visual design:** The first milestone called for a dark, modern strategy-game style with left controls, central animated national scene, right drivers and bottom timeline/story panels.
- **Code stability:** The safest approach was a new reusable component wired to existing App state rather than rewriting the app shell.

### Highest-value improvement chosen

Add a working Population Growth Simulation screen that demonstrates the living-dashboard concept while keeping the existing calculation engine intact.

### Why it matters

This creates the first clear step from a policy dashboard toward a strategy simulation experience. Users can now see population-related policy choices expressed as flows, density, indicators, yearly impacts, news and citizen voice before ending the year.

### What changed

- `src/components/PopulationGrowthScreen.tsx`
  - Added reusable subcomponents: `PolicyControlPanel`, `PopulationMapVisual`, `MetricCard`, `FactorTrendCard`, `ImpactCard`, `YearTimeline`, `CitizenVoice` and `EventNewsPanel`.
  - Added left-side policy controls for net immigration, fertility rate, life expectancy, housing investment and infrastructure investment.
  - Connected existing model-backed controls where possible:
    - net immigration → existing `immigrationRate`
    - housing investment → existing `housingBuildRate`
    - infrastructure investment → existing `infrastructureReadiness`
  - Used clearly labelled illustrative visual assumptions for fertility and life expectancy.
  - Added a central animated stylised Australia scene with population dots and migration flows.
  - Added bottom impact cards for labour force, GDP, housing demand, infrastructure, environment and social cohesion.
  - Added yearly news and citizen voice panels.
- `src/App.tsx`
  - Inserted the Population Growth Simulation screen after the Prime Minister Briefing and before National Reports.
  - Wired the screen's `End Year` action to the existing simulation turn runner.
- `src/styles.css`
  - Added dark modern dashboard styling, animated population dots, migration flow animation and responsive layout.

### What was learned

The visual layer can make the simulator feel much more game-like without changing the core formulas. The key is to label visual estimates as illustrative and keep enacted outcomes tied to the existing simulation state.

### Verification

- `npm run build` initially caught an unused import in `PopulationGrowthScreen.tsx`; removed it.
- `npm run build` passed after the fix.
- `npm test` passed.
- `git diff --check` passed with only normal line-ending warnings.
- Built `dist/index.html` still references `/Australianpolicysimulator/assets/...`, preserving GitHub Pages publish compatibility.

### Next suggested improvement

Add a lightweight post-End-Year reveal panel that briefly shows animated consequence summaries, news headlines and citizen comments after the simulation turn is run.

## 2026-07-05 - Fix Vercel asset base path

### Review

- **User clarity:** The Vercel site showed browser 404 errors and failed to load assets, while GitHub Pages worked.
- **Policy realism:** No simulator model behaviour was involved.
- **Explainability:** The root cause was deployment configuration: GitHub Pages needs `/Australianpolicysimulator/`, but Vercel serves the app from `/`.
- **Visual design:** No UI design change.
- **Code stability:** A small Vite config change can support both deployment targets.

### Highest-value improvement chosen

Make the Vite `base` path deployment-aware: keep `/Australianpolicysimulator/` by default for GitHub Pages, but use `/` when Vercel sets `VERCEL=1` during its build.

### Why it matters

The same app can now build correctly for both GitHub Pages and Vercel without manually editing config between deployments.

### What changed

- `vite.config.ts`
  - Added `const base = process.env.VERCEL ? '/' : '/Australianpolicysimulator/'`.
  - Replaced the hardcoded base value with `base`.

### What was learned

GitHub Pages and Vercel have different asset-root expectations. A hardcoded GitHub Pages base path makes a root-hosted Vercel deployment request missing paths like `/Australianpolicysimulator/assets/...`.

### Verification

- `npm run build` passed with the default GitHub Pages base and produced `/Australianpolicysimulator/assets/...` paths.
- `VERCEL=1 npm run build` passed and produced root `/assets/...` paths for Vercel.
- `npm test` passed.
- Ran a final `npm run build` to leave the local `dist/` in the GitHub Pages-compatible default state.

### Next suggested improvement

Redeploy Vercel so it rebuilds with the new root base path, then check the browser console for missing asset errors.

## 2026-07-05 - Strategy-game dashboard visual pass

### Review

- **User clarity:** The reference image made the desired direction clearer: a playable command dashboard rather than a scrolling analytical report.
- **Policy realism:** The UI needed cabinet/strategy framing, but the existing model still needed to remain the source of enacted outcomes.
- **Explainability:** Visual estimates had to remain labelled as illustrative, especially fertility, life expectancy, births/deaths and visual population projections.
- **Visual design:** The biggest gaps were the top command bar, visual map modes, richer timeline cards, icon-driven impact cards and more reference-like policy inputs.
- **Code stability:** The safest approach was to add and extend reusable UI components without changing `runSimulation` or outcome formulas.

### Highest-value improvement chosen

Step through several small visual-only improvements that move the current prototype closer to the loaded strategy-game dashboard reference.

### Why it matters

A non-technical Australian user should immediately understand that they are running annual government turns, reviewing population pressure, and weighing visible trade-offs rather than operating a spreadsheet.

### What changed

- `src/components/GameHeader.tsx`
  - Added a top command bar with Australia branding, navigation items, current year/turn card and a prominent `End Year` action.
- `src/App.tsx`
  - Replaced the old page header with `GameHeader`.
  - Wired header `End Year` to the existing simulation turn runner.
- `src/components/PopulationGrowthScreen.tsx`
  - Added map visual modes: People, Flows, Heatmap and Cities.
  - Added city labels for Sydney, Melbourne, Brisbane and Perth in Cities mode.
  - Upgraded the timeline into year cards with year, estimated population, annual growth rate and map marker.
  - Added icons to impact cards.
  - Added an avatar-style citizen voice card.
  - Added icons, slider scale labels, policy notes, political cost and budget impact to the left policy controls.
- `src/styles.css`
  - Applied a dark command-centre background and wider dashboard shell.
  - Added header, map mode, skyline, city marker, timeline card, impact icon, citizen avatar and policy-control styling.

### What was learned

The current component structure can support the reference image direction without a rewrite. The strongest next visual improvement is a more realistic centre map scene, but it should still be built as an illustrative layer over transparent model outputs.

### Verification

- After Iteration 1, `npm run build` passed and `npm test` passed.
- After Iteration 2, `npm run build` passed and `npm test` passed.
- After Iteration 3, `npm run build` passed and `npm test` passed.
- After Iteration 4, `npm run build` passed and `npm test` passed.

### Next suggested improvement

Replace the abstract clipped Australia shape with a dedicated SVG Australia silhouette component that can later support state-by-state colouring for housing, environment, employment, approval and health.

## 2026-07-05 - Dedicated SVG Australia silhouette

### Review

- **User clarity:** The centre scene was more game-like, but the map was still a generic clipped shape rather than a recognisable Australia silhouette.
- **Policy realism:** The visual needed to remain illustrative while making it easier to later add state-by-state pressures.
- **Explainability:** The map should support visual zones without implying precise geographic modelling yet.
- **Visual design:** A reusable SVG silhouette gives the central scene a stronger national focus and brings it closer to the reference image.
- **Code stability:** The safest change was a new presentational component that preserves existing dots, flows, city labels and map modes.

### Highest-value improvement chosen

Replace the abstract CSS-clipped map shape with a reusable SVG Australia silhouette component that includes illustrative state/territory-style zones.

### Why it matters

The simulator should feel like the player is governing Australia. A recognisable map silhouette makes the population dashboard more intuitive and prepares the UI for future heatmaps by state or region.

### What changed

- `src/components/AustraliaSilhouette.tsx`
  - Added a reusable SVG Australia silhouette.
  - Added illustrative regional zones for WA, NT, SA, QLD, NSW, VIC and TAS.
  - Added coast/glow styling hooks for the existing dark strategy-dashboard scene.
- `src/components/PopulationGrowthScreen.tsx`
  - Replaced the old clipped map wrapper with `AustraliaSilhouette`.
  - Preserved animated population dots, city labels and map modes.
- `src/styles.css`
  - Added SVG map styling, coast glow, zone fills and heatmap-mode colouring.

### What was learned

A proper SVG layer is a better foundation than CSS clip-path for future map work. It can remain illustrative now while later supporting state-by-state colouring and clickable regions.

### Verification

- `npm run build` passed.
- `npm test` passed.
- `VERCEL=1 npm run build` passed.
- `git diff --check` passed with only normal line-ending warnings.
- Final `npm run build` passed, leaving `dist/` in GitHub Pages-compatible default state.

### Next suggested improvement

Make the SVG map modes more data-driven by deriving heatmap colours from existing outcome pressure: housing stress, environmental pressure, social cohesion and absorptive capacity.

## 2026-07-05 - Ten iterative living-dashboard refinements

### Review

- **User clarity:** The dashboard had a stronger game shell, but needed clearer links between visual modes, outcomes, advisors, assumptions and yearly consequences.
- **Policy realism:** Improvements had to use existing outcomes and avoid introducing hidden state-level or demographic modelling.
- **Explainability:** Heatmap colours, charts, reveal panels and assumptions needed clear labels so users understand they are illustrative.
- **Visual design:** The next best improvements were small polish passes that make the screen closer to the reference strategy-game dashboard.
- **Code stability:** Each change was kept presentational and verified before moving to the next.

### Highest-value improvements completed

1. Made SVG heatmap colours data-driven from existing housing, environmental, cohesion and capacity pressures.
2. Added a heatmap legend explaining lower/moderate/higher pressure.
3. Added mini sparkline charts to right-side population driver cards.
4. Added a post-End-Year reveal panel with enacted consequence summaries.
5. Added advisor recommendations from existing outcomes.
6. Added centre scene overlay cards for immigrants, births and deaths.
7. Added explanatory captions for People, Flows, Heatmap and Cities map modes.
8. Added a compact visible-assumptions card inside the living dashboard.
9. Expanded news and citizen voice variety using existing pressures.
10. Added responsive polish for the game header, advisor grid, reveal panel and scene overlays.

### Why it matters

These iterations make the simulator feel more like a playable strategy interface while keeping the model transparent. A non-technical Australian user can now see what the map is showing, why colours changed, what advisors are warning about, and which figures are illustrative versus enacted model outcomes.

### What changed

- `src/components/AustraliaSilhouette.tsx`
  - Added data-driven zone tone classes for heatmap colouring.
- `src/components/PopulationGrowthScreen.tsx`
  - Added heatmap tone derivation from existing outcomes.
  - Added map legend, map mode captions, centre scene stat overlays, turn reveal panel, advisor panel, assumptions card, richer news headlines and richer citizen comments.
  - Added mini sparkline SVGs for right-side factor cards.
- `src/App.tsx`
  - Added turn-reveal state and wired it to the existing `End Year` flow.
- `src/styles.css`
  - Added styling for heatmap tones, legend, sparklines, reveal panel, advisor cards, scene stat overlays, assumptions card and responsive dashboard behaviour.

### What was learned

The UI can become significantly more game-like without changing formulas. The best pattern is to keep visual layers declarative and derived from existing `OutcomeScores`, then clearly label any visual estimate that is not yet a real model variable.

### Verification

Each of the 10 iterations was followed by:

- `npm run build` passed.
- `npm test` passed.

Final deployment checks were run after the batch and are recorded in the assistant summary.

### Next suggested improvement

Add lightweight region selection to the SVG map: clicking a region should open an explanatory card showing which existing national pressures are being visualised there, without adding true state-level modelling yet.

## 2026-07-05 - Command-centre navigation rehome

### Review

- The top header had become the strongest visual direction, but the rest of the app still rendered as a long stacked report page.
- The user wanted the app to feel like a Prime Minister command dashboard while preserving the existing simulator model and advanced tools.
- The safest approach was a UI-only rehome: keep all calculations and components, but show them under functional navigation tabs.

### What changed

- `src/components/GameHeader.tsx`
  - Converted the top nav from static links to functional section buttons.
  - Added `activeSection` and `onSectionChange` props.
- `src/App.tsx`
  - Added `activeSection` state.
  - Created a cleaner Dashboard section with national score, six indicators, Prime Minister briefing, compact policy levers, and latest annual result.
  - Moved the detailed policy controls behind `Policies`.
  - Added a focused `Budget` tab for fiscal levers and finance breakdown.
  - Moved National Reports, score, baseline, factor panels, annual narrative, entity panels and feedback into `Reports`.
  - Moved the living population map into `Map`.
  - Added an `Events` tab with strategy-game event cards.
  - Moved assumptions, presets, horizon, transparent calculations and scenario summary into `Settings`.
- `src/styles.css`
  - Added command-centre dashboard cards, status badges, compact policy lever cards, budget grid and strategy event card styling.
  - Updated nav styles for button-based tabs.

### What stayed the same

- No model formulas changed.
- `runSimulation`, `OutcomeScores`, annual history, events, success score and existing tests stayed intact.
- Advanced functionality remains accessible through navigation tabs instead of being removed.

### Verification

- `npm run build` passed.
- `npm test` passed.

### Next suggested improvement

Split the tab content into dedicated components such as `DashboardPage`, `PoliciesPage`, `BudgetPage`, `ReportsPage`, `EventsPage` and `SettingsPage` so `App.tsx` stays easier to maintain as the cockpit grows.

## 2026-07-05 - Extract command-centre pages from App.tsx

### Review

- The functional command-centre tabs were working, but `App.tsx` had grown too large because it owned both model orchestration and all tab UI markup.
- The user asked to split each tab into dedicated components while preserving model safety.
- The safest improvement was to keep state, effects and simulation calls in `App.tsx`, and move only presentational tab bodies into page components.

### What changed

- Created `src/components/CockpitPages.tsx` with:
  - `DashboardPage`
  - `PoliciesPage`
  - `BudgetPage`
  - `ReportsPage`
  - `MapPage`
  - `EventsPage`
  - `SettingsPage`
- Simplified `src/App.tsx` so it now focuses on:
  - policy state
  - enacted-vs-pending turn state
  - simulation execution
  - selected year playback
  - success score derivation
  - passing props into tab pages
- Kept existing child components and model functions intact.

### What stayed the same

- No model formulas changed.
- No event effects changed.
- No success-score formulas changed.
- No tests or simulation mechanics changed.
- The UI/navigation structure remains the same as the previous command-centre rehome.

### Verification

- `npm run build` passed.
- `npm test` passed.

### Next suggested improvement

Create small shared types/helpers for cockpit page props and policy stance/status mapping so `CockpitPages.tsx` can be split into individual files later without duplicating type definitions.

## 2026-07-05 - Split cockpit pages into individual files

### Review

- `App.tsx` had already been cleaned up, but `CockpitPages.tsx` still contained every tab page plus shared helpers in one large file.
- The next maintainability step was to split each page into its own file while keeping the public import stable.
- This remains a UI-only refactor: page composition changed, not simulation behaviour.

### What changed

- Added `src/components/pages/cockpitShared.tsx` for shared page types/helpers:
  - `Outcome`
  - `YearOutcome`
  - `SetNumber`
  - `FinanceBreakdownList`
  - `DashboardIndicator`
  - `CompactPolicyLever`
  - `StatusBadge`
  - `policyStance`
- Added individual page files:
  - `src/components/pages/DashboardPage.tsx`
  - `src/components/pages/PoliciesPage.tsx`
  - `src/components/pages/BudgetPage.tsx`
  - `src/components/pages/ReportsPage.tsx`
  - `src/components/pages/MapPage.tsx`
  - `src/components/pages/EventsPage.tsx`
  - `src/components/pages/SettingsPage.tsx`
- Reduced `src/components/CockpitPages.tsx` to a small barrel export so `App.tsx` imports stay stable.

### What stayed the same

- `App.tsx` still owns state, playback, pending/enacted policy state, and `runSimulation`.
- No model formulas changed.
- No event effects changed.
- No tests or simulation mechanics changed.

### Verification

- `npm run build` passed.
- `npm test` passed.

### Next suggested improvement

Add a small route/state persistence enhancement so the selected command-centre tab can be reflected in the URL hash or remembered on reload, while preserving the current single-page Vite/GitHub Pages deployment.

## 2026-07-05 - URL hash persistence for command-centre tabs

### Review

- The command-centre navigation was functional, but selected tabs were not shareable or reload-safe.
- A small URL-hash enhancement fits the current single-page Vite/GitHub Pages deployment and avoids introducing a router dependency.

### What changed

- `src/App.tsx`
  - Added a list of valid command-centre sections.
  - Added hash helpers for normalising section names and converting sections to hashes.
  - Initial active tab now reads from `window.location.hash` when available.
  - Clicking a tab updates the hash, e.g. `#dashboard`, `#policies`, `#budget`, `#reports`, `#map`, `#events`, `#settings`.
  - Browser hash changes update the active tab, so back/forward navigation works.
  - Unknown hashes fall back safely to Dashboard.

### What stayed the same

- No routing library was added.
- No model formulas changed.
- No simulation state mechanics changed.
- The app remains a single-page Vite app compatible with GitHub Pages and Vercel.

### Verification

- `npm run build` passed.
- `npm test` passed.

### Next suggested improvement

Add a small visual cue or share button showing that the current cockpit tab can be linked directly, especially for Reports and Map views.

## 2026-07-08 - Immigration Scenario Lab foundation

### Review

- **User clarity:** Immigration needed to become a topic-based lab rather than a single policy slider.
- **Policy realism:** The first version needed visible placeholder assumptions, entity pathways, year-by-year history and no forced political verdict.
- **Explainability:** Users should see how claims are tested through model outputs, not answered only with text.
- **Visual design:** The lab needed a self-contained command-centre style page that fits the existing dashboard.
- **Code stability:** The safest implementation was a new topic module and page while preserving existing simulator logic.

### Highest-value improvement chosen

Create the first Immigration Scenario Lab structure with separate explainer, scenarios, entity definitions, assumptions, yearly model calculations, trade-off engine and UI panels.

### Why it matters

A user can now step through immigration scenarios from 2026 to 2066, inspect who benefits or bears costs, compare futures, and edit assumptions without the app pretending there is one politically correct answer.

### What changed

- Added `src/topics/immigration/` with:
  - explainer content
  - scenario presets
  - entity definitions
  - assumption ledger definitions
  - year-by-year simulation model
  - winners/losers/trade-offs engine
  - myth tester
  - cause-and-effect map
- Added `src/components/immigration/ImmigrationScenarioLab.tsx`.
- Added an `Immigration` command-centre tab in `src/App.tsx` and `src/components/GameHeader.tsx`.
- Added Immigration Lab styling to `src/styles.css`.
- Added validation tests to `src/tests/run-tests.mjs`.

### What was learned

The existing entity-based foundation can support topic modules if each topic owns its own assumptions, scenario presets and explanatory panels. The placeholder immigration model is intentionally simple, but it now has the right structure for later calibration.

### Verification

- `npm test` passed.
- `npm run build` passed.
- `VERCEL=1 npm run build` passed and produced root asset paths (`/assets/...`, `/favicon.svg`).
- Final `npm run build` passed and restored GitHub Pages asset paths (`/Australianpolicysimulator/assets/...`).

### Next suggested improvement

Replace placeholder immigration assumptions with sourced ABS/Home Affairs series and add a data-source note beside each assumption value.
