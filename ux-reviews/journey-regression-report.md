# Policy Simulator Journey Regression Report

## Deployment details

- **Production URL:** https://australianpolicysimulator.vercel.app/#dashboard
- **Preview URL:** Not provided
- **Date and time tested:** 2026-07-11T11:18:19Z
- **Feature or change being assessed:** Baseline journey regression run only. No preview deployment was supplied, so production-vs-preview comparison was not possible.
- **Test environment:** Hermes browser automation against the live Vercel deployment; desktop viewport; browser snapshots, visual inspection and console checks. No application source code was inspected. No application source code was modified.

## Overall decision

**Unable to determine**

Only one URL was supplied, so this run establishes a production baseline rather than a regression comparison. The fixed journey was mostly completable on production, but several tasks had usability friction that should be used as baseline risks for future preview comparisons.

## Executive summary

- **Production tasks passed:** 7 of 8 fully passed; 1 partial pass
- **Preview tasks passed:** 0; preview not tested
- **Production total actions:** 10 counted task actions
- **Preview total actions:** 0; preview not tested
- **Production wrong turns:** 0
- **Preview wrong turns:** 0; preview not tested
- **Production console errors:** 0
- **Preview console errors:** 0; preview not tested
- **Largest improvement:** Not applicable without preview comparison
- **Most serious regression:** Not applicable without preview comparison
- **Recommended next action:** Use this baseline as the control run. When a preview URL is available, repeat exactly the same journey: Immigration section → No New Immigration scenario → change Net overseas migration and Migrant working-age share → Step Forward to 2031 → inspect outcomes/winners/losers → Reset scenario.

## Task comparison table

| Task | Task name | Production status | Preview status | Production actions | Preview actions | Action difference | Production wrong turns | Preview wrong turns | Unclear labels | Console errors | Comparison result | Evidence reference |
|---:|---|---|---|---:|---:|---:|---:|---:|---|---|---|---|
| 1 | Open the simulator | Pass | Not tested | 0 | 0 | N/A | 0 | 0 | “End Year” is visible before any task is explained; “Enacted results” may not be meaningful to a first-time user. | 0 | Not comparable | browser snapshot + visual evidence: production-task-01-open |
| 2 | Select an immigration scenario | Pass | Not tested | 2 | 0 | N/A | 0 | 0 | Scenario selection is clear in the Active year card after selection, but the selected preset card itself is not strongly highlighted. | 0 | Not comparable | browser snapshot + visual evidence: production-task-02-scenario-selected |
| 3 | Change two assumptions | Partial pass | Not tested | 2 | 0 | N/A | 0 | 0 | Assumption controls are far below the scenario selector and require substantial exploration; changing by keyboard caused large jumps. | 0 | Not comparable | browser snapshot + visual evidence: production-task-03-assumptions-changed |
| 4 | Run one simulation turn | Pass | Not tested | 1 | 0 | N/A | 0 | 0 | Global app header still says Year 2020 / Turn 1 of 5 while Immigration Lab active year changes to 2027. | 0 | Not comparable | browser snapshot + visual evidence: production-task-04-turn-completed |
| 5 | Move forward five years | Pass | Not tested | 4 | 0 | N/A | 0 | 0 | “Step Forward” works, but global header year remains disconnected from Immigration Lab year. | 0 | Not comparable | browser snapshot + visual evidence: production-task-05-five-year-result |
| 6 | Identify positive and negative outcomes | Pass | Not tested | 0 | 0 | N/A | 0 | 0 | Outcome importance is not explicitly ranked; user must infer significance from numbers and cards. | 0 | Not comparable | browser snapshot + visual evidence: production-task-06-outcomes |
| 7 | Find winners and losers | Pass | Not tested | 0 | 0 | N/A | 0 | 0 | Winners/losers are available but dense; many entity cards compete for attention. | 0 | Not comparable | browser snapshot + visual evidence: production-task-07-winners-losers |
| 8 | Return to the baseline | Pass | Not tested | 1 | 0 | N/A | 0 | 0 | “Reset scenario” means reset the selected scenario, not reset the entire app to Current Path; this may be ambiguous. | 0 | Not comparable | browser snapshot + visual evidence: production-task-08-reset |

## Production journey details

### Task 1: Open the simulator

- **Status:** Pass
- **Actions:** 0 application actions after opening URL
- **Required scrolling:** None
- **Wrong turns:** None
- **Unclear labels:** “End Year” and “Enacted results” appear immediately, before a first-time user has learned the turn model.
- **Console messages:** None observed after initial load.
- **Final state reached:** Dashboard loaded successfully. Header showed **Year 2020 / Turn 1 of 5 / ENACTED RESULTS**. Dashboard showed **National situation dashboard**, score **66.6**, and adjustment cards including Migration, Housing Build, Tax Level, Spending, Infrastructure, Integration / Skills.
- **Screenshot evidence:** `production-task-01-open` visual evidence captured via browser_vision; no blocking load error observed.
- **Notes:** The main starting point is identifiable, but the initial wording is still the older production copy: “Review the current situation, adjust the major levers, then press End Year to reveal consequences.”

### Task 2: Select an immigration scenario

- **Status:** Pass
- **Actions:** 2
  1. Clicked **Immigration** in the top navigation.
  2. Clicked **No New Immigration** scenario preset.
- **Required scrolling:** Scenario presets were visible in the Immigration Lab view after opening the section.
- **Wrong turns:** None
- **Unclear labels:** Selected state is clearest in the Active year card, not on the preset card itself.
- **Console messages:** None observed after selecting the immigration scenario.
- **Final state reached:** Immigration Scenario Lab loaded. Active year displayed **2026**. Selected scenario displayed **No New Immigration**.
- **Screenshot evidence:** `production-task-02-scenario-selected` visual evidence captured via browser_vision.
- **Notes:** The selected scenario is visible and the scenario meaning is described in plain English.

### Task 3: Change two assumptions

- **Status:** Partial pass
- **Actions:** 2 counted slider adjustments
  1. Changed **Net overseas migration** from **-80,000 people/year** to **310,000 people/year**.
  2. Changed **Migrant working-age share** from **55%** to **71%**.
- **Required scrolling:** Substantial task-relevant scrolling/exploration was required to reach the Assumption Ledger below the scenario controls, annual result, winners/losers, myth tester and cause-and-effect sections.
- **Wrong turns:** None
- **Unclear labels:** The Assumption Ledger is clear once found, but is far below the first scenario controls. Keyboard/slider adjustment produced large jumps, which may make precise changes hard for a first-time user.
- **Console messages:** None observed after changing assumptions.
- **Final state reached:** Selected scenario remained **No New Immigration**. Active year remained **2026**. Assumptions visible as **Net overseas migration: 310,000 people/year** and **Migrant working-age share: 71%**.
- **Screenshot evidence:** `production-task-03-assumptions-changed` visual evidence captured via browser_vision.
- **Notes:** The task was completed, but only after finding the assumption ledger deep in the page; therefore this is a partial pass.

### Task 4: Run one simulation turn

- **Status:** Pass
- **Actions:** 1
  1. Clicked **Step Forward** once.
- **Required scrolling:** None beyond current position.
- **Wrong turns:** None
- **Unclear labels:** The Immigration Lab active year changed, but the global app header still displayed **Year 2020 / Turn 1 of 5**, which conflicts with the lab’s active year.
- **Console messages:** None observed after running the turn.
- **Final state reached:** Immigration Lab active year changed from **2026** to **2027**. Scenario remained **No New Immigration**. Key visible cards showed Population **27,740,000**, Housing Stress **41**, Labour Supply **47**, Services Pressure **100**, Environment **47**. National briefing stated: “2027: No New Immigration changed population by about 420,000 people this year. Housing stress is 41 and labour supply is 47 on the placeholder index.”
- **Screenshot evidence:** `production-task-04-turn-completed` visual evidence captured via browser_vision.
- **Notes:** The application visibly responded and a new year/result state was displayed.

### Task 5: Move forward five years

- **Status:** Pass
- **Actions:** 4
  1. Clicked **Step Forward** from 2027 to 2028.
  2. Clicked **Step Forward** from 2028 to 2029.
  3. Clicked **Step Forward** from 2029 to 2030.
  4. Clicked **Step Forward** from 2030 to 2031.
- **Required scrolling:** None beyond current position.
- **Wrong turns:** None
- **Unclear labels:** Same year-context issue: Immigration Lab active year reached **2031**, but global header still showed **Year 2020 / Turn 1 of 5**.
- **Console messages:** None observed after moving forward five years.
- **Final state reached:** Active year displayed **2031**, exactly five years after starting year 2026. Scenario remained **No New Immigration**.
- **Screenshot evidence:** `production-task-05-five-year-result` visual evidence captured via browser_vision.
- **Notes:** Year progression is unambiguous inside the Immigration Lab.

### Task 6: Identify the main positive and negative outcomes

- **Status:** Pass
- **Actions:** 0 additional actions
- **Required scrolling:** None beyond current visible result area.
- **Wrong turns:** None
- **Unclear labels:** The interface does not explicitly rank “most significant” positive and negative outcomes, so importance must be inferred.
- **Console messages:** None observed at this stage.
- **Final state reached:** At **2031**, visible outcome cards showed:
  - Population: **29,420,000**, “420,000 people changed this year.”
  - Housing Stress: **41**, “0 dwelling shortfall in the placeholder model.”
  - Labour Supply: **51**, “14,121,600 working-age people.”
  - Services Pressure: **100**, “State delivery pressure from hospitals, schools, transport and housing.”
  - Environment: **59**, with note that lower is better.
- **Positive outcome identified:** **Labour Supply 51**, visible as 14,121,600 working-age people; direction improved from the one-turn state (**47**) and baseline reset state (**45**). Explanation was brief but understandable.
- **Negative outcome identified:** **Services Pressure 100**, explained as state delivery pressure from hospitals, schools, transport and housing. This appears severe and understandable. Environment **59** is also a negative pressure because lower is better.
- **Screenshot evidence:** `production-task-06-outcomes` visual evidence captured via browser_vision.
- **Notes:** A positive and negative outcome can be identified, but the app could better label highest-impact positives/negatives.

### Task 7: Find the winners and losers

- **Status:** Pass
- **Actions:** 0 additional actions
- **Required scrolling:** None beyond current visible winners/losers area.
- **Wrong turns:** None
- **Unclear labels:** Entity cards are dense and numerous, but the status labels are visible.
- **Console messages:** None observed at this stage.
- **Final state reached:** Winners/losers section was visible.
  - Winner example: **First-home buyers**, status **POSITIVE**, current year **8.4**, cumulative **20.1**, confidence **medium**. Benefit text: “More jobs and services may emerge if supply catches up.”
  - Loser example: **Homeowners**, status **NEGATIVE**, current year **-9.4**, cumulative **-22.4**, confidence **low**. Cost text explains the same scenario can create a benefit through one pathway and a cost through another.
  - Additional loser: **State governments**, status **NEGATIVE**, current year **-16.1**, cumulative **-38.5**.
- **Screenshot evidence:** `production-task-07-winners-losers` visual evidence captured via browser_vision.
- **Notes:** The task passes because at least one winner and one loser are directly visible.

### Task 8: Return to the baseline

- **Status:** Pass
- **Actions:** 1
  1. Clicked **Reset scenario**.
- **Required scrolling:** None beyond current position.
- **Wrong turns:** None
- **Unclear labels:** “Reset scenario” resets the selected scenario, not necessarily the entire app to Current Path; this may be ambiguous to a first-time user.
- **Console messages:** None observed after resetting.
- **Final state reached:** Active year returned to **2026**. Scenario remained **No New Immigration**. Changed assumptions returned to scenario defaults: **Net overseas migration -80,000 people/year** and **Migrant working-age share 55%**. The visible annual result returned to the 2026 No New Immigration result rather than the five-year 2031 result.
- **Screenshot evidence:** `production-task-08-reset` visual evidence captured via browser_vision.
- **Notes:** Reset succeeded for the selected scenario baseline without a browser refresh.

## Preview journey details

Preview was not tested because no Vercel preview URL was provided. This report is a production baseline only.

## Improvements

No production-vs-preview improvements can be identified because no preview URL was supplied.

## Regressions

No production-vs-preview regressions can be identified because no preview URL was supplied.

## Unclear or inconclusive findings

- No preview comparison was possible.
- Browser visual evidence was captured during the run, but this environment did not expose file paths for standalone screenshot PNGs. Evidence references in this report correspond to browser snapshots and visual inspection states.
- The global app header and Immigration Lab use different year systems: global header remained **Year 2020 / Turn 1 of 5** while the Immigration Lab moved from **2026** to **2031**. This is a baseline usability risk to compare against future previews.
- Changing assumptions via sliders was possible, but reaching the Assumption Ledger required substantial exploration and the slider jumps were large.

## Acceptance tests

1. **Scenario reset acceptance test**
   - Select **No New Immigration**.
   - Change Net overseas migration and Migrant working-age share.
   - Advance to 2031.
   - Click **Reset scenario**.
   - Pass if active year returns to 2026 and both changed assumptions return to their selected-scenario defaults without a page refresh.

2. **Year context acceptance test**
   - Open Immigration Lab and advance from 2026 to 2031.
   - Pass if all visible year indicators make it clear whether they refer to the whole app turn loop or the immigration topic model.

3. **Assumption discovery acceptance test**
   - Ask a first-time user to change two immigration assumptions.
   - Pass if they can find the assumption controls without opening unrelated sections or needing facilitator help.

4. **Outcome importance acceptance test**
   - At a five-year result, ask a first-time user to identify the largest positive and negative outcomes.
   - Pass if the interface clearly surfaces the most significant positive and negative effects without requiring the user to infer them from many cards.

## Final recommendation

Use this report as the production baseline. Do not make a merge/release decision from this run alone. When a preview URL is available, rerun this skill against production and preview using the same journey and compare task status, action counts, wrong turns, console errors and clarity of final states.
