# Vercel Production UX Review — Australia Policy Simulator

**Live URL reviewed:** https://australianpolicysimulator.vercel.app/#dashboard  
**Review mode:** first-time user, live deployment only. No source code inspection.  
**Methods used:** browser automation, browser snapshots, visual inspection, keyboard probing, console checks, desktop and narrower/mobile-like viewport inspection.  
**Console status:** no browser console messages or JavaScript errors were observed during the reviewed journeys.

## Executive assessment

**Overall UX score: 72 / 100**

The simulator has a strong foundation: it exposes model assumptions, gives plain-English explanations, and supports a richer policy workflow than a simple landing-page demo. The Immigration Scenario Lab is especially strong for transparency: it includes glossary terms, assumptions, myths tested against model outputs, winners/losers, causal maps, scenario comparison, and entity-level impacts.

The largest obstacle to adoption is that the main workflow is not yet self-explanatory enough for a first-time user. The dashboard says to adjust levers and press **End Year**, but after doing so the header still showed **Year 2020 / Turn 1 of 5** and **ENACTED RESULTS**; pressing **End Year** again did not visibly advance the year. A user only discovered year progression later inside Reports through **Step Forward**, where the header changed to **Year 2021 / Turn 2 of 5**. This creates a high-risk point where users may think the simulator did not run.

A first-time user is likely to complete *some* simulation successfully, especially if they explore Reports or the Immigration module, but may not understand the core annual-turn workflow without experimentation.

## Principal journeys tested

### 1. First visit and orientation

**Observed evidence**

- Initial dashboard heading: **“National situation dashboard.”**
- Instruction text: “Review the current situation, adjust the major levers, then press **End Year** to reveal consequences.”
- Visible top-level navigation: Dashboard, Immigration, Policies, Budget, Reports, Map, Events, Settings.
- National score visible: **66.6**.
- Initial status visible: **Year 2020 / Turn 1 of 5 / ENACTED RESULTS**.

**Assessment**

The dashboard communicates the broad theme and a main action, but the page does not clearly distinguish:

- current enacted results vs pending agenda;
- dashboard levers vs detailed policy controls;
- what happens after End Year;
- where to compare baseline or inspect winners/losers.

The title and score are visually strong, but a first-time user is asked to infer the actual workflow.

### 2. Adjust major levers

**Observed evidence**

- Clicking **MIGRATION 2.0% Balanced Adjust details** opened a **Government Policy Decisions** panel with sliders for Immigration Rate, Integration Effectiveness, Skills Alignment, Infrastructure Readiness, Housing Build Rate, Tax Rate and Government Stimulus.
- Sliders had accessible names in the snapshot, e.g. **“Immigration Rate 2.0% 0.0% population rate 5.0%.”**
- Keyboard interaction worked: after focusing the Immigration Rate slider and pressing ArrowRight, the value changed from **2.0%** to **2.6%** and the header changed from **ENACTED RESULTS** to **PENDING AGENDA**.
- Before pressing End Year, the Immigration explanation still said: “At **2.6%**, immigration adds about **200,000** people each year and creates demand for **80,000** homes.” After End Year it updated to **260,000** and **104,000**.

**Assessment**

The control panel is functional and reasonably labelled, but the delayed update of explanatory numbers creates a trust and comprehension problem. If a user changes a slider and reads the panel before pressing End Year, the headline value and explanatory calculations disagree.

### 3. Run one simulation turn / progress years

**Observed evidence**

- After changing Immigration Rate to **2.6%**, pressing the top **END YEAR** changed the status back to **ENACTED RESULTS** and updated the explanatory calculations to **260,000 people** and **104,000 homes**.
- However, the header remained **Year 2020 / Turn 1 of 5**.
- Pressing **END YEAR** again produced no visible change in the snapshot.
- In Reports, the **Annual Turn Controls** section included **End Year**, **Play**, **Step Back**, **Step Forward**, and a year slider.
- Pressing **Step Forward** in Reports changed the header to **Year 2021 / Turn 2 of 5** and the report title to **Year 2 cabinet briefing papers**.

**Assessment**

This is the most serious workflow issue. The dashboard’s primary action appears to enact pending changes but not clearly advance the year. Users may not realize that separate year-review controls exist lower in Reports, and may conclude the simulation is stuck.

### 4. Interpret scores and reports

**Observed evidence**

- Dashboard cards showed Population, Economy, Housing, Wellbeing, Fairness / Cohesion and Environment.
- Reports included department cards for Treasury, Housing, Environment and Employment.
- Reports included **Overall Success Score**, **Baseline Comparison**, **Selected Year Outcome Factors**, **Annual Narrative Explanation**, and expandable entity panels.
- Baseline comparison gave concrete deltas such as Economic Growth **+0.2**, Fairness **-0.6**, Government Finances **+2.4**, Environment Score **-0.7**, Housing Stress **-2.3**.
- The reports page explicitly said the score is directional and **“not as an official national performance measure.”**

**Assessment**

Results comprehension is above average once the user reaches Reports. The app makes a real effort to explain directionality, baseline deltas and caveats. The main weakness is information density: the reports page presents many panels, headings and expandable sections, so a first-time user may not know which result to read first.

### 5. Identify winners and losers

**Observed evidence**

- Immigration Scenario Lab included a **Winners, losers and trade-offs** section with many entity cards: young renters, first-home buyers, homeowners, property investors, existing workers, job seekers, businesses, retirees, future generations, governments, regional towns, capital cities, universities and others.
- Each card had positive/mixed status, current year, cumulative score, confidence, benefit and cost text.
- The lab also included **Who benefited**, **Who bore costs**, and **Unintended consequences** cards.

**Assessment**

This is one of the strongest parts of the product. It directly addresses the “who gains / who loses” question and avoids presenting a single political conclusion. The trade-off is density: the amount of material is substantial, especially for mobile or casual users.

### 6. Find explanations, assumptions and uncertainty

**Observed evidence**

- Immigration module stated: “This is an illustrative civic-learning prototype. Values are placeholder assumptions unless labelled otherwise. It is not an official forecast, policy cost estimate or recommendation.”
- It included an **Assumption Ledger** with sliders such as net overseas migration, natural increase, fertility rate, death rate, migrant working-age share, workforce participation, productivity growth, housing build rate and more.
- Assumption cards included confidence labels such as low or medium.
- The module included **Myth tester**, **Cause-and-effect map**, and **Entity model foundation** sections.

**Assessment**

Transparency is strong. The assumption ledger, confidence labels and myth tester are excellent trust-building features. The improvement opportunity is progressive disclosure: skeptical users can find detail, but casual users may be overwhelmed before they find the exact explanation they need.

### 7. Mobile / smaller viewport

**Observed evidence**

- In the narrower portrait viewport, the dashboard stacked cards into a single column.
- The top navigation remained visible as eight buttons across two compact rows/areas, followed by a large **Year 2020 / Turn 1 of 5** card and a full-width **END YEAR** button.
- The first screen required substantial vertical scrolling before reaching all dashboard cards and adjustment levers.
- Opening **Government Policy Decisions** on the narrower viewport produced readable full-width slider controls; values and descriptions were legible.
- The top header consumed significant vertical space on the narrow view.

**Assessment**

Mobile/narrow usability is acceptable for reading and changing sliders, but the top chrome is heavy. The navigation plus year status plus End Year button occupies a large amount of first-screen space, pushing the simulator content down.

### 8. Accessibility and keyboard

**Observed evidence**

- Snapshot exposed semantic buttons and labelled sliders.
- The Immigration Rate slider responded to keyboard ArrowRight.
- After pressing Tab twice, the visible focus state was not strongly obvious in the visual inspection.
- Some button accessible names are long because whole cards are buttons, e.g. **“Current Path A placeholder continuation path...”** and dashboard adjustment cards include value, state and “Adjust details.”

**Assessment**

The app has a promising baseline for keyboard and screen reader access, but focus visibility and long card-button labels should be reviewed. Sliders are keyboard-operable, which is important.

## Persona results

### Persona 1 — Interested general user

**Tasks completed**

- Understood that the app is about Australian policy trade-offs.
- Found national score and key outcome cards.
- Opened policy controls from a dashboard adjustment card.
- Changed immigration settings.
- Pressed End Year and saw some results update.

**Tasks failed or partially completed**

- Did not receive a clear sense that the simulation year had advanced from the dashboard.
- Could not easily tell where the main “compare against baseline” view lived until visiting Reports.

**Points of confusion**

- Header says **ENACTED RESULTS** on first load even before the user has done anything.
- End Year enacted changes but did not visibly advance from **Year 2020 / Turn 1 of 5** in the dashboard test.
- Result text can be long before the user understands the key trade-off.

**Likely abandonment point**

After pressing **End Year** on the dashboard and seeing the same year/turn still displayed.

### Persona 2 — Skeptical user

**Tasks completed**

- Found model caveats and placeholder assumption warnings in Immigration.
- Found an assumption ledger and confidence labels.
- Found myth-testing and cause-and-effect explanations.
- Found winners/losers and unintended consequences.

**Tasks failed or partially completed**

- Could not quickly see source provenance beyond placeholder/confidence language.
- Would need to scroll through a large amount of material to locate a specific assumption.

**Points of confusion**

- Some values in the dashboard explanation updated only after End Year, making pre-enactment explanations feel inconsistent.
- “Environment pressure is lower-is-better” appears on dashboard while Reports use “Environment Score,” which may invert user interpretation.

**Likely abandonment point**

If the first contradictory-feeling slider explanation undermines trust before the user reaches the assumption ledger.

### Persona 3 — Policy analyst

**Tasks completed**

- Changed related variables.
- Found baseline comparison and selected-year outcome factors.
- Stepped forward to Year 2 inside Reports.
- Found weights, factors, entity impacts and assumptions.

**Tasks failed or partially completed**

- Could not clearly understand dashboard vs Reports turn controls without experimenting.
- Dense reports require effort to identify the key causal chain.

**Points of confusion**

- Dashboard has End Year, Reports has End Year/Play/Step controls; the relationship is unclear.
- Some status labels say “Improving” even where text under “Major concerns” includes positive statements, reducing confidence in categorisation.

**Likely abandonment point**

When trying to compare scenarios or years and discovering controls are split across sections.

### Persona 4 — Mobile / casual user

**Tasks completed**

- Read the first dashboard content in a narrow stacked layout.
- Found the full-width End Year action.
- Opened policy controls and operated/inspected sliders.

**Tasks failed or partially completed**

- Could not see much simulator content above the fold due to heavy header/navigation/action area.
- Would face a long scroll through report and immigration content.

**Points of confusion**

- Navigation, year state and End Year dominate the first screen.
- Adjustment cards are readable but numerous; there is no compact “next recommended action” guide.

**Likely abandonment point**

Before reaching detailed levers or report interpretation, because the mobile flow requires long scrolling and offers many equally weighted options.

## Scorecard

| Criterion | Score / 5 | Explanation |
|---|---:|---|
| Purpose and orientation | 3.5 | Purpose is visible, but the first-time workflow and turn state need clearer guidance. |
| Navigation and workflow | 3.0 | Major sections are visible, but simulation, review and year progression controls are split and confusing. |
| Cognitive load | 3.0 | Rich content, but too much is exposed at once, especially in Reports and Immigration. |
| Input clarity | 3.8 | Sliders have labels, ranges and explanatory text; some units/assumptions need clearer immediate feedback. |
| Interaction feedback | 2.8 | Pending/enacted state exists, but End Year/year progression feedback is weak and delayed text updates can confuse. |
| Results comprehension | 3.8 | Reports, baseline comparison and narrative explanations are useful once found. |
| Model transparency and trust | 4.2 | Strong caveats, assumptions, confidence labels, myth tester and cause map. |
| Visual hierarchy | 3.4 | Dashboard score and cards are clear; detail pages are dense and some sticky/header behavior competes with content. |
| Accessibility | 3.2 | Buttons/sliders are exposed and slider keyboard input works; focus visibility and long accessible names need review. |
| Responsive design | 3.4 | Narrow layout stacks well and controls remain readable; header consumes too much vertical space. |
| Reliability | 3.6 | No console errors observed; primary reliability concern is unclear/possibly inconsistent End Year behavior. |

## Prioritised findings

Priority score = impact × frequency × confidence ÷ effort.

### F1. Primary End Year workflow does not clearly advance the simulation

- **Severity:** High
- **Affected personas:** General user, policy analyst, mobile user
- **Journey:** Run one simulation turn; progress through years
- **Evidence:** After changing Immigration Rate to 2.6% and pressing top **END YEAR**, the status changed to **ENACTED RESULTS** and calculations updated, but the header remained **Year 2020 / Turn 1 of 5**. Pressing **END YEAR** again produced no visible change. In Reports, **Step Forward** changed to **Year 2021 / Turn 2 of 5**.
- **Why it matters:** The primary dashboard CTA appears to be the central simulation action. If it does not visibly advance time or explain what happened, users may think the app is broken.
- **Recommended change:** After End Year, show an explicit completion state: “Year 2020 enacted — review results or advance to 2021.” Provide a single obvious next button such as **Advance to Year 2021** or combine enact/advance into one clear flow.
- **Expected improvement:** More users complete the core simulation loop and understand annual progression.
- **Impact:** 5
- **Frequency:** 5
- **Confidence:** 5
- **Effort:** 3
- **Priority score:** 41.7

### F2. Slider explanatory text can disagree with the changed value before enactment

- **Severity:** High
- **Affected personas:** General user, skeptical user, policy analyst
- **Journey:** Change immigration settings; interpret consequences
- **Evidence:** After changing Immigration Rate from **2.0%** to **2.6%**, the panel displayed **2.6%** but still said immigration adds **200,000** people and **80,000** homes until End Year. After End Year, the text updated to **260,000** and **104,000**.
- **Why it matters:** Users read explanatory text immediately after moving a slider. If values disagree, trust drops.
- **Recommended change:** Split “pending estimate” and “enacted result,” or update explanatory text immediately with a label such as “If enacted, this would add about 260,000 people...”
- **Expected improvement:** Stronger trust and clearer cause/effect feedback.
- **Impact:** 5
- **Frequency:** 4
- **Confidence:** 5
- **Effort:** 2
- **Priority score:** 50.0

### F3. First-time workflow lacks a guided path from setting levers to reading results

- **Severity:** High
- **Affected personas:** General user, mobile user
- **Journey:** First visit; adjust settings; run; interpret results
- **Evidence:** Dashboard exposes eight sections, six adjustment cards, two End Year buttons and multiple score cards. Baseline comparison and winners/losers are not introduced on the dashboard.
- **Why it matters:** A new user can see many controls but may not know the intended sequence.
- **Recommended change:** Add a compact “3-step simulation path” at the top: 1) choose/adjust policies, 2) enact year, 3) review baseline and winners/losers. After each step, highlight the next action.
- **Expected improvement:** Lower abandonment and faster first successful run.
- **Impact:** 5
- **Frequency:** 5
- **Confidence:** 4
- **Effort:** 3
- **Priority score:** 33.3

### F4. Reports and Immigration pages are powerful but overwhelming

- **Severity:** Medium
- **Affected personas:** General user, mobile user, skeptical user
- **Journey:** Interpret results; find assumptions; identify winners/losers
- **Evidence:** Reports includes department cards, turn controls, score, weights, baseline comparison, factors, narratives and many expandable panels. Immigration includes glossary, scenario presets, controls, annual result, winners/losers, myth tester, cause map, assumption ledger, comparison table, timeline and entity foundation.
- **Why it matters:** Rich transparency can become unusable if users cannot find the most relevant next insight.
- **Recommended change:** Add an “Executive summary / What changed most / Who gained and lost” section before deep detail, with jump links to assumptions, winners/losers and baseline.
- **Expected improvement:** Users get value before deciding whether to inspect detail.
- **Impact:** 4
- **Frequency:** 5
- **Confidence:** 4
- **Effort:** 3
- **Priority score:** 26.7

### F5. Mobile/narrow layout gives too much space to header chrome

- **Severity:** Medium
- **Affected personas:** Mobile user
- **Journey:** First visit; mobile operation
- **Evidence:** In the narrow view, navigation, year card and full-width End Year button occupied a large part of the first screen before the briefing and score. Content required substantial scrolling.
- **Why it matters:** Casual mobile users need the first screen to explain the task quickly.
- **Recommended change:** Collapse navigation into a menu or horizontal scroll, make year/turn status compact, and keep the primary CTA sticky only after the user has made a change.
- **Expected improvement:** More useful content appears above the fold and mobile users orient faster.
- **Impact:** 4
- **Frequency:** 4
- **Confidence:** 5
- **Effort:** 3
- **Priority score:** 26.7

### F6. Sticky/header behavior can obscure content during detailed policy editing

- **Severity:** Medium
- **Affected personas:** General user, policy analyst
- **Journey:** Adjust major levers
- **Evidence:** Visual inspection after opening Government Policy Decisions on desktop showed the sticky top header overlaying the policy panel area while the user was scrolled into controls.
- **Why it matters:** Obscured controls reduce confidence and make editing feel fragile.
- **Recommended change:** Reserve layout space for sticky headers or reduce their height in edit panels; ensure anchor targets scroll below the header.
- **Expected improvement:** Smoother detailed editing with less visual interference.
- **Impact:** 3
- **Frequency:** 4
- **Confidence:** 4
- **Effort:** 2
- **Priority score:** 24.0

### F7. Baseline comparison is valuable but under-signposted from the dashboard

- **Severity:** Medium
- **Affected personas:** General user, skeptical user, policy analyst
- **Journey:** Reset or compare against baseline; interpret results
- **Evidence:** Baseline Comparison appeared in Reports with useful deltas, but the dashboard did not clearly direct users there after End Year.
- **Why it matters:** Without baseline, users see scores but not whether their policy package improved or worsened the scenario.
- **Recommended change:** After End Year, show a small dashboard summary of top 3 changes vs baseline and a link/button to full baseline comparison.
- **Expected improvement:** Better comprehension of consequences and trade-offs.
- **Impact:** 4
- **Frequency:** 4
- **Confidence:** 4
- **Effort:** 3
- **Priority score:** 21.3

### F8. Environment metric naming risks interpretation errors

- **Severity:** Medium
- **Affected personas:** General user, skeptical user
- **Journey:** Interpret overall and individual outcome scores
- **Evidence:** Dashboard card says **Environment 58.8** and “Environmental pressure is lower-is-better.” Reports later refer to **Environment Score**, where higher appears better because it is calculated as 100 minus environmental pressure.
- **Why it matters:** Users may not know whether a higher number is good or bad.
- **Recommended change:** Use consistent naming: either “Environmental pressure” everywhere with lower-is-better, or “Environment score” everywhere with higher-is-better. Add a visible direction marker.
- **Expected improvement:** Fewer misread results.
- **Impact:** 4
- **Frequency:** 3
- **Confidence:** 4
- **Effort:** 2
- **Priority score:** 24.0

### F9. Keyboard focus visibility is not strong enough

- **Severity:** Low/Medium
- **Affected personas:** Keyboard and accessibility users
- **Journey:** Navigate and operate controls
- **Evidence:** Sliders responded to keyboard input, but after pressing Tab twice the visible focus state was not strongly obvious in visual inspection.
- **Why it matters:** Keyboard users need to know where they are before changing a policy lever.
- **Recommended change:** Add a high-contrast focus ring for buttons, cards, sliders and disclosure controls.
- **Expected improvement:** Better accessibility and lower accidental input risk.
- **Impact:** 3
- **Frequency:** 3
- **Confidence:** 3
- **Effort:** 1
- **Priority score:** 27.0

### F10. Some card buttons have long accessible names

- **Severity:** Low/Medium
- **Affected personas:** Screen reader users
- **Journey:** Select scenario; adjust policy cards
- **Evidence:** Snapshot exposed long button names such as “Current Path A placeholder continuation path...” and dashboard adjustment cards containing label, value, status and “Adjust details.”
- **Why it matters:** Long repeated labels slow screen reader navigation.
- **Recommended change:** Give card buttons concise aria-labels and keep longer explanatory text associated separately.
- **Expected improvement:** Faster screen reader scanning.
- **Impact:** 3
- **Frequency:** 3
- **Confidence:** 4
- **Effort:** 2
- **Priority score:** 18.0

## Top five improvements

1. **Fix or clarify the End Year / advance year workflow.** Make the result of pressing End Year unmistakable and provide a clear next step.
2. **Update slider consequence explanations immediately or label them as pending.** Avoid value/explanation mismatches.
3. **Add a first-time guided path on the dashboard.** Show the intended sequence and highlight the next action.
4. **Create an executive results summary before deep reports.** Put “what changed most,” “why,” and “who gained/lost” first.
5. **Reduce mobile header/navigation footprint.** Let users see meaningful simulator content sooner.

## Three quick wins

1. **Change the dashboard instruction text** to explain enacted vs pending results and what End Year does.
2. **Add a high-contrast focus style** for all buttons, slider thumbs and disclosure controls.
3. **Rename or direction-label environment metrics consistently** so users know whether higher or lower is better.

## Larger design changes

- Unify annual turn controls across Dashboard and Reports so users do not encounter two different mental models.
- Add a guided “simulation run” mode for first-time users while preserving expert access to detailed controls.
- Add progressive disclosure to Reports and Immigration: summary first, then assumptions, then detailed entity mechanics.
- Consider a mobile-specific header with collapsed navigation and a context-aware CTA.

## Technical observations

- **Console errors:** none observed during browser-console checks.
- **Console warnings/messages:** none observed.
- **Broken interactions:** no JavaScript crashes observed. The main reliability concern is UX/logic ambiguity around End Year and year progression.
- **Keyboard:** slider keyboard interaction worked; focus visibility needs improvement.
- **Responsive:** narrow view stacked the dashboard and policy controls in a readable way; header and navigation consume too much vertical space.
- **Performance:** no obvious load failure or severe lag observed during the tested flows.

## Suggested acceptance tests

1. **End Year workflow test**
   - Start on Dashboard.
   - Change Immigration Rate.
   - Press End Year.
   - Confirm the UI displays exactly what happened: pending agenda enacted, updated results shown, and an obvious next action to advance/review the next year.

2. **Pending explanation consistency test**
   - Change Immigration Rate from 2.0% to another value.
   - Before pressing End Year, verify every displayed consequence either updates to the new value or is clearly labelled as the previous enacted result.

3. **First-time path test**
   - Ask a new user to run one simulation and find who benefited and who bore costs.
   - Pass condition: user reaches baseline comparison and winners/losers without facilitator help.

4. **Mobile first-screen test**
   - Open the simulator in a phone/narrow viewport.
   - Pass condition: purpose, year/turn state and one clear next action are visible without excessive header domination.

5. **Accessibility focus test**
   - Navigate the dashboard and policy panel using only Tab, Shift+Tab, Enter/Space and arrow keys.
   - Pass condition: focus is always visible and sliders can be adjusted intentionally.

## Highest-risk abandonment point

The most likely abandonment point is immediately after a first-time user changes a lever and presses **End Year** on the dashboard. In the observed test, the app enacted updated calculations but still displayed **Year 2020 / Turn 1 of 5**, and a second End Year click produced no visible advance. This makes the central simulator action feel either incomplete or broken, even though richer results are available elsewhere.
