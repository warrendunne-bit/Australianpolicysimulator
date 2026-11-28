import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { createServer } from 'vite';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const server = await createServer({
  root,
  appType: 'custom',
  logLevel: 'error',
  server: { middlewareMode: true },
});

const tests = [];

function test(name, fn) {
  tests.push({ name, fn });
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertClose(actual, expected, tolerance, message) {
  if (Math.abs(actual - expected) > tolerance) {
    throw new Error(`${message}: expected ${expected}, received ${actual}`);
  }
}

try {
  const success = await server.ssrLoadModule('/simulation/SuccessScore.ts');
  const feedback = await server.ssrLoadModule('/simulation/FeedbackSystem.ts');
  const model = await server.ssrLoadModule('/simulation/model.ts');
  const presets = await server.ssrLoadModule('/simulation/presets.ts');
  const immigration = await server.ssrLoadModule('/topics/immigration/index.ts');
  const modelConfig = await server.ssrLoadModule('/model/index.ts');
  const { evidenceProposals } = await server.ssrLoadModule('/policyIssues/housingPilot/evidence.ts');
  const { issueBriefs } = await server.ssrLoadModule('/policyIssues/issueBriefs.ts');
  const { dieselResilience } = await server.ssrLoadModule('/policyIssues/programmes/dieselResilience.ts');
  const { economicExercises } = await server.ssrLoadModule('/policyIssues/programmes/economic.ts');
  const { electricityMix } = await server.ssrLoadModule('/policyIssues/programmes/electricityMix.ts');
  const { regionalElectricity } = await server.ssrLoadModule('/policyIssues/programmes/regionalElectricity.ts');
  const { householdExercises } = await server.ssrLoadModule('/policyIssues/programmes/households.ts');
  const { comparePreventionFollowup } = await server.ssrLoadModule('/policyIssues/programmes/preventionFollowup.ts');
  const { communityExercises } = await server.ssrLoadModule('/policyIssues/programmes/community.ts');
  const { initialProgrammeInputs, compareProgramme } = await server.ssrLoadModule('/policyIssues/programmes/comparison.ts');
  const { programmeGuides } = await server.ssrLoadModule('/policyIssues/programmes/guides.ts');
  const { proposalHref, housingOwnershipSection, programmeSettingsPrefix } = await server.ssrLoadModule('/policyIssues/programmes/routes.ts');
  const { isIssueStudy } = await server.ssrLoadModule('/policyIssues/issueRouting.ts');
  const { runHousingPilot } = await server.ssrLoadModule('/policyIssues/housingPilot/model.ts');
  const { compareFirstHome, defaultFirstHomeSettings, firstHomeAssumptions } = await server.ssrLoadModule('/policyIssues/housingPilot/homeOwnership.ts');

  test('all ten issues have a brief and a sourced Australian indicator', () => {
    assert(Object.keys(issueBriefs).length === evidenceProposals.length, 'issue briefs and evidence proposals must cover the same issues');
    for (const { id } of evidenceProposals) {
      const brief = issueBriefs[id];
      assert(brief?.title && brief.question && brief.whyItMatters && brief.intervention && brief.progress, `incomplete issue brief for ${id}`);
      assert(brief.indicators.length > 0, `missing Australian indicator for ${id}`);
      for (const { observation, source, url } of brief.indicators) {
        assert(observation.trim() && source.trim() && new URL(url).protocol === 'https:', `incomplete indicator source for ${id}`);
      }
    }
  });

  test('all ten issues resolve to the housing pilot or a finite programme comparison', () => {
    const exercises = new Map([...economicExercises, ...householdExercises, ...communityExercises].map((item) => [item.id, item]));
    assert(evidenceProposals.length === 10 && exercises.size === 9, 'expected ten issues and nine programme comparisons');
    for (const proposal of evidenceProposals) {
      const route = proposalHref(proposal.id);
      assert(isIssueStudy(route.slice(1)), `unrecognised route ${route}`);
      if (route === '#housing-pilot') continue;
      const exercise = exercises.get(proposal.id);
      assert(exercise, `missing exercise for ${proposal.id}`);
      const outcomes = compareProgramme(exercise, initialProgrammeInputs(exercise.inputs));
      assert(outcomes.length && outcomes.every((item) => Number.isFinite(item.value) && Number.isFinite(item.reference)), `invalid default results for ${proposal.id}`);

      const referenceInputs = Object.fromEntries(exercise.inputs.map(({ id, reference, initial }) => [id, reference ?? initial]));
      const unchanged = compareProgramme(exercise, referenceInputs);
      assert(unchanged.every(({ value, reference }) => value === reference), `identical packages changed results for ${proposal.id}`);
    }
    assert(!isIssueStudy('immigration'), 'immigration is a separate simulator route');
  });

  test('each programme guide points to policy settings and distinct outcome and cost rows', () => {
    const exercises = [dieselResilience, electricityMix, regionalElectricity, ...economicExercises, ...householdExercises, ...communityExercises];
    assert(Object.keys(programmeGuides).length === exercises.length, 'programme guides must cover exactly the programme comparisons');
    for (const exercise of exercises) {
      const guide = programmeGuides[exercise.id];
      assert(guide, `missing guide for ${exercise.id}`);
      const suggestedIds = typeof guide.controlId === 'string' ? [guide.controlId] : guide.controlId;
      assert(suggestedIds.length > 0, `expected a suggested setting for ${exercise.id}`);
      for (const controlId of suggestedIds) {
        const control = exercise.inputs.find(({ id }) => id === controlId);
        assert(control?.reference !== undefined, `suggested input must be a policy setting for ${exercise.id}`);
      }
      const outcomes = compareProgramme(exercise, initialProgrammeInputs(exercise.inputs));
      assert(guide.outcomeId !== guide.costId, `primary result and cost must differ for ${exercise.id}`);
      assert(outcomes.filter(({ id }) => id === guide.outcomeId).length === 1, `invalid primary result for ${exercise.id}`);
      assert(outcomes.filter(({ id, unit }) => id === guide.costId && unit.startsWith('A$')).length === 1, `invalid cost result for ${exercise.id}`);
    }
  });

  test('regional reserve power covers only a shortfall and incurs a booking fee even when unused', () => {
    const inputs = initialProgrammeInputs(regionalElectricity.inputs);
    const compare = (overrides) => Object.fromEntries(compareProgramme(regionalElectricity, { ...inputs, ...overrides }).map(row => [row.id, row]));
    const peak = compare({});
    assert(peak.unserved.reference === 80 && peak.unserved.value === 20, '15 MW of reserve should cover 60 MWh of an 80 MWh shortfall');
    assert(peak.delivered.value + peak.unserved.value === 400, 'delivered and unmet energy must reconcile with demand');
    assert(peak['procurement-cost'].reference === 80_000 && peak['procurement-cost'].value === 74_500, 'expected grid, booking and running costs for one peak');

    const surplusReserve = compare({ reserveMW: 30 });
    assert(surplusReserve.unserved.value === 0 && surplusReserve['reserve-energy'].value === 80, 'reserve dispatch should stop at demand');
    const ampleGrid = compare({ availableMW: 120 });
    assert(ampleGrid['reserve-energy'].value === 0 && ampleGrid['reserve-cost'].value === 4_500, 'unused reserve should incur only its booking fee');
    const noDemand = compare({ demandMW: 0 });
    assert(noDemand.unserved.value === 0 && noDemand.delivered.value === 0 && noDemand['procurement-cost'].value === 4_500, 'zero demand should still incur the agreed booking fee');
  });

  test('price cover changes procurement cost and spot exposure independently of physical supply', () => {
    const inputs = initialProgrammeInputs(regionalElectricity.inputs);
    const calculate = (overrides) => Object.fromEntries(regionalElectricity.calculate({ ...inputs, ...overrides }).map(({ id, value }) => [id, value]));
    const spot = calculate({ fixedShare: 0 });
    const fixed = calculate({ fixedShare: 100 });
    assert(spot.unserved === fixed.unserved && spot.delivered === fixed.delivered, 'changing contract coverage should leave physical deliveries unchanged');
    assert(spot['spot-exposure'] === 320 && fixed['spot-exposure'] === 0, 'the contract applies to delivered grid energy');
    assert(fixed['procurement-cost'] < spot['procurement-cost'], 'price cover should reduce purchase costs when spot prices exceed the contract rate');
    const cheapSpot = calculate({ spotPrice: 80, fixedShare: 0 });
    const cheapFixed = calculate({ spotPrice: 80, fixedShare: 100 });
    assert(cheapFixed['procurement-cost'] === fixed['procurement-cost'] && cheapSpot['procurement-cost'] < cheapFixed['procurement-cost'], 'full cover should remove spot exposure and can cost more');
    const noSupply = calculate({ availableMW: 0, reserveMW: 0, fixedShare: 100 });
    assert(noSupply.delivered === 0 && noSupply.unserved === 400 && noSupply['procurement-cost'] === 0, 'a price agreement alone cannot supply power');
  });

  test('energy mixes with the same installed capacity have different shortfalls across disruptions', () => {
    assert(isIssueStudy(`${programmeSettingsPrefix}${electricityMix.id}`), 'the energy mix comparison should open directly');
    const inputs = initialProgrammeInputs(electricityMix.inputs);
    const compare = (overrides) => Object.fromEntries(
      compareProgramme(electricityMix, { ...inputs, ...overrides }).map(row => [row.id, row]),
    );
    const defaults = compare({});
    assert(defaults['installed-generation'].reference === 240 && defaults['installed-generation'].value === 240, 'the default cases should have equal installed generating capacity');
    assert(defaults['combined-shortfall'].reference === 503.6 && defaults['combined-shortfall'].value === 371.6, 'the proposed mix should cover more of the calm night with constrained fuel');
    assert(defaults['plant-outage'].reference === 56 && defaults['plant-outage'].value === 120, 'the benefit in one test should not imply a benefit in the other');

    const moreEnergyInStorage = compare({ storageHours: 12 });
    assert(moreEnergyInStorage['combined-shortfall'].value === 171.6, 'longer storage should still be capped by its discharge rate');
    assert(moreEnergyInStorage['plant-outage'].value === 120, 'extra storage duration should not increase power over a four-hour outage');

    const noOtherSupply = { solarMW: 0, windMW: 0, nuclearMW: 0, gasMW: 0, coalMW: 0, storageMW: 0 };
    const solar = compare({ ...noOtherSupply, solarMW: 100 });
    const wind = compare({ ...noOtherSupply, windMW: 100 });
    const nuclear = compare({ ...noOtherSupply, nuclearMW: 100 });
    assert(solar['fuel-disruption'].value === 220 && solar['calm-evening'].value === 420, 'solar should follow daylight');
    assert(wind['calm-evening'].value === 380, 'some wind output should remain during the selected calm spell');
    assert(nuclear['calm-evening'].value === 60 && nuclear['plant-outage'].value === 220, 'nuclear should supply through the calm evening and be exposed to a plant outage');
  });

  test('independent gas and coal supply reduces exposure to a fuel disruption', () => {
    const inputs = initialProgrammeInputs(electricityMix.inputs);
    const calculate = (overrides) => Object.fromEntries(
      electricityMix.calculate({ ...inputs, ...overrides }).map(({ id, value }) => [id, value]),
    );
    const none = calculate({ independentGas: 0, independentCoal: 0 });
    const gas = calculate({ independentGas: 100, independentCoal: 0 });
    const coal = calculate({ independentGas: 0, independentCoal: 100 });
    const both = calculate({ independentGas: 100, independentCoal: 100 });
    assert(none['exposed-fossil-capacity'] === 90 && both['exposed-fossil-capacity'] === 0, 'independent contracts should cover the exposed capacity');
    assert(gas['combined-shortfall'] < none['combined-shortfall'] && coal['combined-shortfall'] < none['combined-shortfall'], 'either kind of independent fuel should help');
    assert(both['combined-shortfall'] === 80 && both['calm-evening'] === none['calm-evening'], 'full fuel cover helps in the combined shock while leaving the calm evening unchanged');
    assertClose(both['alternative-fuel-cost'], 3.15, 1e-9, '90 covered megawatts should incur the annual contract fee');
    const uninterrupted = calculate({ independentGas: 0, independentCoal: 0, fuelLoss: 0 });
    assert(uninterrupted['combined-shortfall'] === both['combined-shortfall'], 'complete cover should offset the fuel loss');
  });

  test('diesel reserves cover shortfalls until either stock volume or daily deliveries fall short', () => {
    assert(isIssueStudy(`${programmeSettingsPrefix}${dieselResilience.id}`), 'the diesel comparison should open directly');
    const inputs = initialProgrammeInputs(dieselResilience.inputs);
    const compare = (overrides) => Object.fromEntries(
      compareProgramme(dieselResilience, { ...inputs, ...overrides }).map(row => [row.id, row]),
    );
    const defaults = compare({});
    assert(defaults['unmet-diesel'].reference === 1306 && defaults['unmet-diesel'].value === 330, 'expected diesel shortfalls in the illustrative shock');
    assertClose(defaults['days-covered'].value, 1200 / 34, 1e-9, 'default reserves should cover the daily gap until exhausted');

    const biggerReserve = compare({ reserveDays: 16 });
    assert(biggerReserve['unmet-diesel'].value === 0 && biggerReserve['reserves-left'].value === 70, 'extra reserves should cover the entire 45-day gap');
    assert(biggerReserve['reserve-cost'].value === 128 && defaults['reserve-cost'].value === 96, 'a larger reserve should raise annual holding cost');

    const deliveryLimit = compare({ reserveDays: 16, reserveDeliveryLimit: 30 });
    assert(deliveryLimit['days-covered'].value === 0, 'a delivery bottleneck should leave a gap from day one');
    assert(deliveryLimit['unmet-diesel'].value === 180 && deliveryLimit['reserves-left'].value === 250, 'shortages can coincide with stock still in storage');
    const longDisruption = compare({ reserveDays: 16, disruptionDays: 60 });
    assert(longDisruption['unmet-diesel'].value === 440 && longDisruption['reserves-left'].value === 0, 'a longer disruption should exhaust the reserve');
  });

  test('locally sourced inputs, alternative suppliers and lower diesel demand maintain supply under an import shock', () => {
    const inputs = {
      ...initialProgrammeInputs(dieselResilience.inputs),
      reserveDays: 0, demandReduction: 0, alternativeImports: 0, localInputs: 0, finishedDieselLoss: 100, feedstockLoss: 100,
    };
    const calculate = (overrides) => Object.fromEntries(
      dieselResilience.calculate({ ...inputs, ...overrides }).map(({ id, value }) => [id, value]),
    );
    const interrupted = calculate({ localProduction: 50 });
    assert(interrupted['daily-local-output'] === 0 && interrupted['unmet-diesel'] === 4500, 'local capacity should stop when all its inputs are cut off');
    const local = calculate({ localProduction: 50, localInputs: 50 });
    assert(local['local-input-coverage'] === 25 && local['unmet-diesel'] === 3375, 'local inputs should keep some production available');
    const diversified = calculate({ alternativeImports: 20 });
    assert(diversified['daily-finished-imports'] === 15 && diversified['unmet-diesel'] === 3825, 'imports from unaffected suppliers should keep arriving');
    const efficient = calculate({ demandReduction: 10 });
    assert(efficient['daily-demand'] === 90 && efficient['unmet-diesel'] === 4050, 'lower demand should cut the shortfall by 10 ML per day');
    const noDisruption = calculate({ finishedDieselLoss: 0, feedstockLoss: 0 });
    assert(noDisruption['unmet-diesel'] === 0 && noDisruption['days-covered'] === 45 && noDisruption['reserves-used'] === 0, 'uninterrupted supplies should cover demand without stocks');
  });

  test('the housing pilot shares downturn conditions across three packages', () => {
    const { scenarios } = runHousingPilot();
    assert(scenarios.length === 3, 'expected three housing packages');
    for (const scenario of scenarios) {
      const year = scenario.years.find((item) => item.year === 2029);
      assert(year?.downturn.constructionCapacityFactor === 0.65, 'expected central downturn across all packages');
      assert(year.cohorts.length === 9 && Number.isFinite(year.publicCosts.total), 'missing tenure and income outcomes or public costs');
    }
  });

  test('buying near work trades off upfront costs, the commute and cash after essentials', () => {
    assert(isIssueStudy(housingOwnershipSection), 'the ownership comparison should open directly');
    const baseline = compareFirstHome(defaultFirstHomeSettings);
    assert(baseline.renting.monthlyCash === 1_400 && baseline.monthlyDepositSavings === 900, 'renting should leave enough for the buffer and deposit savings');
    assert(baseline.nearer.upfrontCash === 138_000 && baseline.nearer.monthsToSave === 104, 'the near-work purchase should include buying costs and existing savings');
    assert(baseline.nearer.commute.minutes < baseline.farther.commute.minutes, 'the near-work purchase should have a shorter commute');
    assert(baseline.nearer.monthlyCash >= firstHomeAssumptions.monthlyCashBuffer, 'the default near-work purchase should keep the cash buffer');

    const lowerPrice = compareFirstHome({ ...defaultFirstHomeSettings, nearPrice: 520_000 });
    assert(lowerPrice.nearer.monthsToSave < baseline.nearer.monthsToSave, 'a lower price should shorten the wait to buy');
    assert(lowerPrice.nearer.monthlyCash > lowerPrice.farther.monthlyCash, 'at the same price, lower travel costs should leave more cash');
    assert(lowerPrice.farther.monthlyCash === baseline.farther.monthlyCash, 'changing the near-work price should leave the farther option unchanged');

    const smallerDeposit = compareFirstHome({ ...defaultFirstHomeSettings, depositPercent: 10 });
    assert(smallerDeposit.nearer.monthsToSave < baseline.nearer.monthsToSave, 'a smaller deposit should shorten the wait to buy');
    assert(smallerDeposit.nearer.monthlyCash < baseline.nearer.monthlyCash, 'a smaller deposit should leave less cash after repayments');

    const higherRate = compareFirstHome({ ...defaultFirstHomeSettings, ratePercent: 8 });
    assert(higherRate.nearer.monthlyCash < 0, 'a higher rate should expose a near-work budget shortfall');
    assert(higherRate.renting.monthlyCash === baseline.renting.monthlyCash, 'mortgage rates should only affect buyers in this example');
  });

  test('preventive health follow-up counts only adults remaining at risk', () => {
    const exercise = householdExercises.find(({ id }) => id === 'preventive-health');
    const inputs = initialProgrammeInputs(exercise.inputs);
    const { rows, cost } = comparePreventionFollowup(exercise, inputs, 20, 50);
    const [zero, , central] = rows;
    assertClose(central.casesTenYears.reference, 623.36, 1e-9, 'default reference count by year ten');
    assertClose(central.casesTenYears.scenario, 602.56, 1e-9, 'default scenario count by year ten');
    assert(zero.casesTenYears.reference === zero.casesTenYears.scenario, 'coverage should not affect diagnoses at zero effect');
    assert(cost.scenario > cost.reference, 'serving more people should increase intake costs');
    assert(rows.every(({ casesThreeYears, casesTenYears }) =>
      casesTenYears.scenario >= casesThreeYears.scenario && casesTenYears.scenario <= inputs.eligibleAdults),
    'cumulative diagnoses must stay within the cohort and include the first three years');

    const noLaterCases = comparePreventionFollowup(exercise, inputs, 0, 50).rows[2];
    assert(noLaterCases.casesTenYears.scenario === noLaterCases.casesThreeYears.scenario, 'zero later risk should add no new cases');
    const fullLaterRisk = comparePreventionFollowup(exercise, inputs, 100, 0).rows[2];
    assert(fullLaterRisk.casesTenYears.reference === inputs.eligibleAdults && fullLaterRisk.casesTenYears.scenario === inputs.eligibleAdults,
      'every remaining adult develops diabetes at full later risk without a retained effect');
  });

  test('the housing pilot delivers targeted support before new homes and reconciles public costs', () => {
    const { assumptions, scenarios } = runHousingPilot();
    const [baseline, supply, supplyWithSupport] = scenarios;
    const [firstSupportYear] = supplyWithSupport.years;
    assert(firstSupportYear.rentSupportRecipients > 0, 'rental support should begin in the first year');
    assert(supply.years[0].publicCosts.stateCapital > 0 && supply.years[0].publicCosts.localCapital > 0, 'capital costs should begin when homes are funded');

    for (const scenario of [supply, supplyWithSupport]) {
      const firstDeliveryIndex = scenario.years.findIndex(({ additionalDwellingsDelivered }) => additionalDwellingsDelivered > 0);
      assert(firstDeliveryIndex === assumptions.deliveryLagYears, `first homes delivered outside the assumed lag for ${scenario.id}`);
      assert(scenario.years[0].dwellings === baseline.years[0].dwellings, `first-year stock changed before new homes arrived for ${scenario.id}`);
    }

    for (const scenario of scenarios) {
      let totalToDate = 0;
      for (const year of scenario.years) {
        const receivesSupport = scenario.id === 'supply-rental-support';
        for (const cohort of year.cohorts) {
          const eligible = receivesSupport && cohort.income === 'Lower' && cohort.tenure === 'Private renter';
          assert(eligible ? cohort.annualRentalSupport > 0 : cohort.annualRentalSupport === 0, `incorrect support for ${cohort.id} in ${scenario.id}`);
        }

        const { commonwealthOperating, stateCapital, localCapital, total } = year.publicCosts;
        assert(receivesSupport ? commonwealthOperating > 0 : commonwealthOperating === 0, `incorrect Commonwealth cost for ${scenario.id}`);
        assertClose(total, commonwealthOperating + stateCapital + localCapital, 2e-9, `annual payer split for ${scenario.id}`);
        const cumulative = year.cumulativePublicCosts;
        assertClose(cumulative.total, cumulative.commonwealthOperating + cumulative.stateCapital + cumulative.localCapital, 2e-9, `cumulative payer split for ${scenario.id}`);
        totalToDate += total;
        assertClose(cumulative.total, totalToDate, 2e-9, `sum of annual costs for ${scenario.id}`);
      }
    }
  });

  test('success score inverts environmental pressure and applies default weights', () => {
    const outcomes = {
      economicGrowth: 2.5,
      wellbeing: 70,
      fairness: 65,
      socialCohesion: 60,
      governmentBalance: 0,
      environmentalPressure: 30,
    };
    const result = success.calculateSuccessScore(outcomes, success.DEFAULT_SUCCESS_WEIGHTS);

    assertClose(result.componentScores.economicGrowth, 70, 0.001, 'economic growth component');
    assertClose(result.componentScores.environment, 70, 0.001, 'environment component');
    assertClose(result.totalWeight, 100, 0.001, 'weight total');
    assert(result.isValidWeightTotal, 'default weights should be valid');
  });

  test('feedback effects increase pressure after weak wellbeing and fiscal stress', () => {
    const result = feedback.calculateFeedbackPressures({
      previousState: feedback.DEFAULT_FEEDBACK_STATE,
      policies: {
        immigrationRate: 3,
        housingBuildRate: 130000,
        integrationEffectiveness: 50,
        skillsAlignment: 55,
        infrastructureReadiness: 45,
        taxRate: 24,
        stimulusRate: 7,
      },
      activeEvents: [{ id: 'test-climate', name: 'Test climate event', year: 1, kind: 'climate event', intensity: 70, explanation: 'Test event.' }],
      outcomes: {
        economicGrowth: -0.5,
        wellbeing: 25,
        fairness: 40,
        socialCohesion: 48,
        governmentBalance: -200,
        environmentalPressure: 72,
        populationIncrease: 300000,
        housingStress: 90,
      },
    });

    assert(result.state.publicPressure > feedback.DEFAULT_FEEDBACK_STATE.publicPressure, 'public pressure should rise');
    assert(result.nextEffects.spendingPressure > 0, 'public pressure should create spending pressure');
    assert(result.nextEffects.climateDisasterCost > 0, 'environment pressure should create disaster costs');
    assert(
      result.explanations.some((item) => item.includes('public pressure')),
      'feedback explanations should mention public pressure',
    );
  });

  test('simulation history supports year-to-year playback state', () => {
    const simulation = model.runSimulation(
      {
        immigrationRate: 2,
        housingBuildRate: 175000,
        integrationEffectiveness: 65,
        skillsAlignment: 70,
        infrastructureReadiness: 60,
        taxRate: 25,
        stimulusRate: 2,
      },
      5,
      ['inflation'],
    );

    assert(simulation.history.length === 5, 'five year horizon should store five annual outcomes');
    assert(simulation.history[0].year === 1, 'first playback year should be year 1');
    assert(simulation.history[4].year === 5, 'last playback year should be year 5');
    assert(Boolean(simulation.history[1].feedback), 'annual outcomes should store feedback state');
    assertClose(
      simulation.history[1].entityDashboard[0].previousScore,
      simulation.history[0].entityDashboard[0].score,
      0.001,
      'entity movement should compare with the preceding year',
    );
    assert(
      simulation.history[1].yearSummary?.narrative?.startsWith('Year 2:'),
      'annual outcomes should expose a year summary narrative',
    );
  });

  test('fairness worsens when housing stress hits vulnerable households', () => {
    const lowStress = model.runSimulation(
      {
        immigrationRate: 2,
        housingBuildRate: 350000,
        integrationEffectiveness: 70,
        skillsAlignment: 70,
        infrastructureReadiness: 75,
        taxRate: 25,
        stimulusRate: 2,
      },
      1,
      [],
    );
    const highStress = model.runSimulation(
      {
        immigrationRate: 4.5,
        housingBuildRate: 50000,
        integrationEffectiveness: 45,
        skillsAlignment: 55,
        infrastructureReadiness: 35,
        taxRate: 25,
        stimulusRate: 2,
      },
      1,
      [],
    );

    assert(
      lowStress.outcomes.fairness > highStress.outcomes.fairness,
      'fairness should be lower when renters and young workers face severe housing stress',
    );
    assert(
      typeof highStress.outcomes.fairnessExplanation === 'string' &&
        highStress.outcomes.fairnessExplanation.includes('representative households'),
      'fairness explanation should describe representative household distribution',
    );
  });

  test('success score includes fairness with valid default weights', () => {
    const outcomes = {
      economicGrowth: 2.5,
      wellbeing: 70,
      fairness: 64,
      socialCohesion: 60,
      governmentBalance: 0,
      environmentalPressure: 30,
    };
    const result = success.calculateSuccessScore(outcomes, success.DEFAULT_SUCCESS_WEIGHTS);

    assertClose(result.componentScores.fairness, 64, 0.001, 'fairness component');
    assertClose(result.totalWeight, 100, 0.001, 'weight total with fairness');
    assert(result.isValidWeightTotal, 'default weights including fairness should be valid');
    assert(
      result.explanation.includes('illustrative score'),
      'success explanation should remind users the score is illustrative',
    );
  });

  test('baseline comparison reports deltas from default policies', () => {
    const comparison = model.compareToBaseline(
      {
        immigrationRate: 4,
        housingBuildRate: 90000,
        integrationEffectiveness: 45,
        skillsAlignment: 55,
        infrastructureReadiness: 35,
        taxRate: 25,
        stimulusRate: 6,
      },
      5,
      [],
    );

    assert(comparison.baseline.history.length === 5, 'baseline should use selected horizon');
    assert(
      comparison.deltas.housingStress > 0,
      'stressful scenario should have higher housing stress than baseline',
    );
    assert(
      typeof comparison.summary === 'string' && comparison.summary.includes('baseline'),
      'comparison should include plain-English baseline summary',
    );
  });

  test('scenario presets expose named policy settings', () => {
    const housingFirst = presets.SCENARIO_PRESETS.find((preset) => preset.id === 'housing-first');
    const fiscalRepair = presets.SCENARIO_PRESETS.find((preset) => preset.id === 'fiscal-repair');

    assert(housingFirst, 'housing-first preset should exist');
    assert(fiscalRepair, 'fiscal-repair preset should exist');
    assert(
      housingFirst.policies.housingBuildRate > presets.DEFAULT_POLICY_SETTINGS.housingBuildRate,
      'housing-first preset should increase housing construction',
    );
    assert(
      fiscalRepair.policies.stimulusRate < presets.DEFAULT_POLICY_SETTINGS.stimulusRate,
      'fiscal-repair preset should reduce stimulus spending',
    );
  });

  test('scenario summary uses plain-English event names', () => {
    const simulation = model.runSimulation(presets.DEFAULT_POLICY_SETTINGS, 1, ['housing-supply']);
    const summary = model.buildScenarioSummary(
      presets.DEFAULT_POLICY_SETTINGS,
      1,
      ['housing-supply', 'unexpected-event'],
      simulation.outcomes,
    );

    assert(
      summary.includes('Housing supply shock in year 1'),
      'summary should show the event name and timing rather than the raw event id',
    );
    assert(summary.includes('housing stress'), 'summary should include housing stress in headline outcomes');
    assert(
      !summary.includes('Events selected: housing-supply'),
      'summary should not expose raw event ids as the primary shared wording',
    );
    assert(
      summary.includes('Unknown event (unexpected-event)'),
      'summary should degrade gracefully if an unknown event id is supplied',
    );
  });

  test('model exposes government finance breakdown drivers', () => {
    const simulation = model.runSimulation(
      {
        immigrationRate: 2,
        housingBuildRate: 175000,
        integrationEffectiveness: 45,
        skillsAlignment: 70,
        infrastructureReadiness: 40,
        taxRate: 30,
        stimulusRate: 7,
      },
      3,
      ['climate'],
    );
    const breakdown = simulation.outcomes.financeBreakdown;

    assert(breakdown.taxRevenueBoost > 0, 'finance breakdown should include tax revenue');
    assert(breakdown.stimulusSpendingBoost > 0, 'finance breakdown should include stimulus spending');
    assert(
      breakdown.infrastructureSpendingPressure > 0,
      'finance breakdown should include infrastructure pressure',
    );
    assert(breakdown.eventSpending > 0, 'finance breakdown should include event spending');
  });

  test('policy trade-offs keep expected directional behavior', () => {
    const baseline = model.runSimulation(presets.DEFAULT_POLICY_SETTINGS, 1, []);
    const lowHousing = model.runSimulation(
      {
        ...presets.DEFAULT_POLICY_SETTINGS,
        housingBuildRate: 50000,
      },
      1,
      [],
    );
    const highHousing = model.runSimulation(
      {
        ...presets.DEFAULT_POLICY_SETTINGS,
        housingBuildRate: 350000,
      },
      1,
      [],
    );
    const lowInfrastructure = model.runSimulation(
      {
        ...presets.DEFAULT_POLICY_SETTINGS,
        infrastructureReadiness: 20,
      },
      1,
      [],
    );
    const highStimulus = model.runSimulation(
      {
        ...presets.DEFAULT_POLICY_SETTINGS,
        stimulusRate: 9,
      },
      1,
      [],
    );

    assert(
      highHousing.outcomes.housingStress < lowHousing.outcomes.housingStress,
      'more housing supply should reduce housing stress',
    );
    assert(
      lowInfrastructure.outcomes.absorptiveCapacityScore < baseline.outcomes.absorptiveCapacityScore,
      'lower infrastructure readiness should reduce absorptive capacity',
    );
    assert(
      highStimulus.outcomes.economicGrowth > baseline.outcomes.economicGrowth,
      'higher stimulus should lift short-term growth in the simple model',
    );
    assert(
      highStimulus.outcomes.governmentBalance < baseline.outcomes.governmentBalance,
      'higher stimulus should worsen the budget balance',
    );
    assert(
      highStimulus.outcomes.environmentalPressure > baseline.outcomes.environmentalPressure,
      'higher stimulus should raise environmental pressure',
    );
  });

  test('model definitions expose assumptions inputs outcomes and explanations', () => {
    const simulation = model.runSimulation(presets.DEFAULT_POLICY_SETTINGS, 1, []);
    const outcomeKeys = model.OUTCOME_DEFINITIONS.map((definition) => definition.key);
    const policyKeys = model.POLICY_INPUT_DEFINITIONS.map((definition) => definition.key);

    assert(model.MODEL_ASSUMPTION_LIST.length >= 5, 'model assumptions should be grouped');
    assert(policyKeys.includes('immigrationRate'), 'policy input definitions should include migration');
    assert(policyKeys.includes('housingBuildRate'), 'policy input definitions should include housing');
    assert(outcomeKeys.includes('economicGrowth'), 'outcome definitions should include growth');
    assert(outcomeKeys.includes('fairness'), 'outcome definitions should include fairness');
    assert(outcomeKeys.includes('environmentalPressure'), 'outcome definitions should include environment');

    for (const definition of model.OUTCOME_DEFINITIONS) {
      const score = definition.score(simulation.outcomes);
      const explanation = definition.explanation(simulation.outcomes);
      assert(Number.isFinite(score), `${definition.label} should produce a numeric score`);
      assert(score >= 0 && score <= 100, `${definition.label} score should stay in 0-100 range`);
      assert(
        typeof explanation === 'string' && explanation.length > 20,
        `${definition.label} should have a clear explanation`,
      );
    }
  });

  test('immigration topic runs and stores every year from 2026 to 2066', () => {
    const scenario = immigration.IMMIGRATION_SCENARIO_PRESETS.find(
      (item) => item.id === 'current-path',
    );
    const run = immigration.runImmigrationScenario(scenario);

    assert(run.timeline.length === 41, 'immigration timeline should store 41 annual records');
    assert(run.timeline[0].year === 2026, 'immigration timeline should start in 2026');
    assert(run.timeline[40].year === 2066, 'immigration timeline should run to 2066');
    assert(
      run.timeline.every((year) => year.briefing && year.tradeOffs.length >= 18),
      'every immigration year should include a national briefing and trade-off assessment',
    );
  });

  test('immigration scenarios expose required structure and scenario presets', () => {
    const scenarioIds = immigration.IMMIGRATION_SCENARIO_PRESETS.map((scenario) => scenario.id);
    const requiredIds = [
      'current-path',
      'zero-net-overseas-migration',
      'no-new-immigration',
      'low-immigration',
      'skilled-migration-focus',
      'regional-settlement-focus',
      'high-migration',
    ];

    for (const id of requiredIds) {
      assert(scenarioIds.includes(id), `immigration scenario preset ${id} should exist`);
    }
    assert(
      immigration.IMMIGRATION_ENTITIES.length >= 40,
      'entity foundation should include people, households, companies, government, environment and regions',
    );
    assert(
      immigration.IMMIGRATION_EXPLAINER.length >= 10,
      'explainer should cover migration concepts before simulation',
    );
    assert(
      immigration.IMMIGRATION_ASSUMPTION_DEFINITIONS.length >= 15,
      'assumption ledger should expose editable assumptions',
    );
    assert(
      immigration.IMMIGRATION_CAUSE_EFFECT_MAP.length >= 12,
      'cause-and-effect map should trace system pathways',
    );
  });

  test('immigration myth tester is output-driven and shows trade-offs', () => {
    const noNew = immigration.IMMIGRATION_SCENARIO_PRESETS.find(
      (item) => item.id === 'no-new-immigration',
    );
    const high = immigration.IMMIGRATION_SCENARIO_PRESETS.find((item) => item.id === 'high-migration');
    const noNewRun = immigration.runImmigrationScenario(noNew);
    const highRun = immigration.runImmigrationScenario(high);
    const noNew2036 = noNewRun.timeline.find((year) => year.year === 2036);
    const high2036 = highRun.timeline.find((year) => year.year === 2036);

    assert(
      noNew2036.housingStressIndex < high2036.housingStressIndex,
      'lower migration should reduce housing stress in the placeholder model',
    );
    assert(
      noNew2036.labourSupplyIndex < high2036.labourSupplyIndex,
      'lower migration should also reduce labour supply in the placeholder model',
    );
    assert(
      high2036.mythTests.some((myth) => myth.claim === 'Immigration is either all good or all bad'),
      'myth tester should evaluate common claims from model outputs',
    );
  });

  test('phase 1B model configuration separates baseline assumptions policies and scenarios', () => {
    const activeBaseline = modelConfig.getActiveBaselineVersion();
    const population = modelConfig.getBaselineVariable('baseline.population.total');
    const defaultPolicy = modelConfig.getPolicySetting('policy.general.default.immigrationRate');
    const migrationResponse = modelConfig.getBehaviouralAssumption('assumption.general.peoplePerImmigrationPercent');
    const currentScenario = modelConfig.getScenarioConfig('scenario.immigration.currentPath');

    assert(activeBaseline.id === 'australian-baseline-v1.0', 'active baseline should have a version id');
    assert(population.value === 27801023, 'baseline population should use reviewed ABS evidence');
    assert(population.classification === 'observed-baseline-data', 'population should be classified as observed baseline data');
    assert(defaultPolicy.classification === 'policy-setting', 'policy default should be stored separately from baseline facts');
    assert(defaultPolicy.value === 2, 'general default immigration policy value should be migrated without changing it');
    assert(migrationResponse.centralValue === 100000, 'behavioural migration conversion should be independently identifiable');
    assert(currentScenario.baselineVersionId === activeBaseline.id, 'scenario should record the baseline version it uses');
    assert(currentScenario.policySettingIds.includes('policy.immigration.currentPath.netOverseasMigration'), 'scenario should reference policy settings');
  });

  test('phase 1B validation flags invalid and stale baseline data', () => {
    const result = modelConfig.validateModelConfiguration({
      baselineVariables: [
        {
          ...modelConfig.getBaselineVariable('baseline.population.total'),
          id: 'test.invalid.range',
          unit: '',
          sourceLocation: '',
          lowEstimate: 5,
          centralEstimate: 4,
          highEstimate: 3,
        },
      ],
      behaviouralAssumptions: modelConfig.BEHAVIOURAL_ASSUMPTIONS,
      policySettings: modelConfig.POLICY_SETTINGS,
      scenarios: modelConfig.SCENARIO_CONFIGS,
      baselineVersions: modelConfig.BASELINE_VERSIONS,
    });

    assert(!result.valid, 'invalid baseline data should fail validation');
    assert(result.issues.some((issue) => issue.rule === 'missing-unit'), 'validation should flag missing units');
    assert(result.issues.some((issue) => issue.rule === 'missing-source'), 'validation should flag missing sources');
    assert(result.issues.some((issue) => issue.rule === 'invalid-range'), 'validation should flag invalid ranges');
  });

  test('phase 1B policy overrides do not mutate stored baseline values', () => {
    const before = modelConfig.getBaselineVariable('baseline.population.total');
    const overridden = modelConfig.createScenarioPolicySnapshot('scenario.immigration.currentPath', {
      'policy.immigration.currentPath.netOverseasMigration': 100000,
    });
    const after = modelConfig.getBaselineVariable('baseline.population.total');

    assert(before.value === after.value, 'baseline value should not change when policy settings are overridden');
    assert(overridden.baselineVersionId === 'australian-baseline-v1.0', 'policy snapshot should retain baseline version');
    assert(
      overridden.policyValues['policy.immigration.currentPath.netOverseasMigration'] === 100000,
      'policy override should appear only in scenario policy values',
    );
  });

  test('phase 1B provenance rows expose source confidence range and affected outputs', () => {
    const rows = modelConfig.buildDataProvenanceRows();
    const population = rows.find((row) => row.id === 'baseline.population.total');
    const nom = rows.find((row) => row.id === 'policy.immigration.currentPath.netOverseasMigration');

    assert(rows.length >= 20, 'provenance should expose a useful inspection table');
    assert(population, 'population should be visible in provenance rows');
    assert(population.source.includes('Australian Bureau of Statistics'), 'reviewed ABS source should be visible');
    assert(population.range.includes('27,801,023'), 'provenance row should display baseline range');
    assert(population.affectedOutputs.includes('population'), 'provenance should list affected outputs');
    assert(nom.classification === 'policy-setting', 'current-path NOM should remain a policy setting, not observed fact');
  });

  test('phase 1C evidence baseline exposes reviewed Australian baseline v1.0 metadata', () => {
    const version = modelConfig.getActiveBaselineVersion();
    const population = modelConfig.getBaselineVariable('baseline.population.total');
    const nom = modelConfig.getBaselineVariable('baseline.migration.netOverseasMigration');
    const unemployment = modelConfig.getBaselineVariable('baseline.labour.unemploymentRate');
    const housingCompletions = modelConfig.getBaselineVariable('baseline.housing.completionsAnnualised');

    assert(version.id === 'australian-baseline-v1.0', 'Phase 1C should expose Australian baseline v1.0');
    assert(version.reviewDate === '2026-07-12', 'baseline review date should be explicit');
    assert(population.value === 27801023, 'population should use verified ABS Dec 2025 ERP');
    assert(population.sourceOrganisation === 'Australian Bureau of Statistics', 'population source should be ABS');
    assert(population.referencePeriod.includes('31 December 2025'), 'population reference period should be visible');
    assert(nom.value === 301000, 'baseline NOM should use ABS annual growth component for year ending Dec 2025');
    assert(unemployment.value === 4.4, 'unemployment should use ABS Labour Force May 2026');
    assert(housingCompletions.value === 175264, 'housing completions should annualise ABS Mar quarter 2026 completions');
  });

  test('phase 1C current-policy baseline distinguishes facts forecasts and dynamic settings', () => {
    const definition = modelConfig.CURRENT_POLICY_BASELINE_DEFINITION;
    assert(definition.baselineVersionId === 'australian-baseline-v1.0', 'current-policy definition should use v1.0');
    assert(definition.rules.some((rule) => rule.category === 'observed-data'), 'current policy should separate observed data');
    assert(definition.rules.some((rule) => rule.category === 'government-forecast'), 'current policy should separate forecasts');
    assert(definition.rules.some((rule) => rule.trajectory === 'dynamic'), 'current policy should document dynamic variables');
    assert(definition.rules.some((rule) => rule.trajectory === 'return-to-long-run'), 'temporary conditions should not be frozen forever');
  });

  test('phase 1C back-test and sensitivity reports are reproducible and bounded', () => {
    const backTest = modelConfig.runBaselineBackTest();
    const sensitivity = modelConfig.runMigrationSensitivity();

    assert(backTest.baselineVersionId === 'australian-baseline-v1.0', 'back-test should record baseline version');
    assert(backTest.results.length >= 6, 'back-test should compare several observed outcomes');
    assert(backTest.results.some((result) => result.differenceReason.includes('missing variables')), 'back-test should explain gaps rather than force fit');
    assert(sensitivity.baselineVersionId === 'australian-baseline-v1.0', 'sensitivity should record baseline version');
    assert(sensitivity.cases.length === 3, 'sensitivity should test low central and high cases');
    assert(sensitivity.cases[0].netOverseasMigration < sensitivity.cases[1].netOverseasMigration, 'low case should be below central');
    assert(sensitivity.cases[2].netOverseasMigration > sensitivity.cases[1].netOverseasMigration, 'high case should be above central');
    assert(Number.isFinite(sensitivity.cases[1].housingStressIndex), 'sensitivity outputs should be numeric');
  });

  test('phase 1C commentary traceability flags uncertainty without political conclusions', () => {
    const trace = modelConfig.buildCommentaryTrace({
      outcome: 'housingStressIndex',
      value: 62,
      drivers: ['net overseas migration', 'housing completions'],
      confidence: 'moderate',
    });

    assert(trace.calculatedOutcome === 'housingStressIndex', 'trace should identify calculated outcome');
    assert(trace.commentary.includes('modelled scenario'), 'commentary should avoid forecast language');
    assert(trace.evidenceChain.length >= 3, 'commentary should include source-to-result chain');
    assert(!trace.commentary.toLowerCase().includes('should'), 'commentary should avoid moral/political prescriptions');
  });

  test('phase 1D immigration model exposes direct GDP labour housing fiscal and migration-segment pathways', () => {
    const run = immigration.runImmigrationScenario(immigration.getImmigrationScenario('current-path'));
    const firstYear = run.timeline[0];
    const year2036 = run.timeline.find((year) => year.year === 2036);

    assert(Number.isFinite(firstYear.gdpIndex), 'GDP index should be a direct numeric output');
    assert(Number.isFinite(firstYear.gdpPerPersonIndex), 'GDP per person index should be a direct numeric output');
    assert(firstYear.employedPeople > 0, 'employment stock should be directly calculated');
    assert(firstYear.unemployedPeople > 0, 'unemployment stock should be directly calculated');
    assert(firstYear.unemploymentRate >= 0, 'unemployment rate should be directly calculated');
    assert(firstYear.rentalVacancyRate > 0, 'rental vacancy should be a direct housing input/output');
    assert(firstYear.rentPressureIndex >= 0, 'rent pressure should be direct');
    assert(firstYear.affordabilityIndex >= 0, 'affordability should be direct');
    assert(firstYear.studentArrivals >= 0, 'student arrivals should be segmented');
    assert(firstYear.otherTemporaryArrivals >= 0, 'other temporary arrivals should be segmented');
    assert(firstYear.permanentOrLongTermArrivals >= 0, 'permanent/long-term arrivals should be segmented');
    assert(firstYear.commonwealthRevenueDollars > 0, 'Commonwealth revenue dollars should be traced');
    assert(firstYear.commonwealthSpendingDollars > 0, 'Commonwealth spending dollars should be traced');
    assert(Number.isFinite(firstYear.commonwealthBalanceDollars), 'Commonwealth balance dollars should be traced');
    assert(year2036.gdpIndex !== firstYear.gdpIndex, 'GDP pathway should evolve over time');
  });

  test('phase 1D expanded sensitivity covers housing fiscal and social cohesion assumptions', () => {
    const expanded = modelConfig.runExpandedSensitivity();
    const ids = expanded.dimensions.map((dimension) => dimension.id);

    assert(ids.includes('netOverseasMigration'), 'expanded sensitivity should retain NOM');
    assert(ids.includes('housingBuildRate'), 'expanded sensitivity should include housing supply');
    assert(ids.includes('averageTaxPerWorker'), 'expanded sensitivity should include tax contribution');
    assert(ids.includes('governmentSpendingPerPerson'), 'expanded sensitivity should include service cost');
    assert(ids.includes('socialCohesionSensitivity'), 'expanded sensitivity should include social cohesion');
    assert(expanded.dimensions.every((dimension) => dimension.low < dimension.high), 'each sensitivity range should be ordered');
    assert(expanded.dimensions.every((dimension) => dimension.conclusionRisk.includes('scenario') || dimension.conclusionRisk.includes('outcomes')), 'each sensitivity dimension should explain conclusion risk');
  });

  let failures = 0;

  for (const { name, fn } of tests) {
    try {
      fn();
      console.log(`PASS ${name}`);
    } catch (error) {
      failures += 1;
      console.error(`FAIL ${name}`);
      console.error(error.message);
    }
  }

  if (failures > 0) {
    process.exitCode = 1;
  }
} finally {
  await server.close();
}
