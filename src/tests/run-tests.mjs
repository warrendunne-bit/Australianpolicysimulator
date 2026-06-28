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
