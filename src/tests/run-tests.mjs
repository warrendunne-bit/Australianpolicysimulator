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

  test('success score inverts environmental pressure and applies default weights', () => {
    const outcomes = {
      economicGrowth: 2.5,
      wellbeing: 70,
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
      ['inflation-shock'],
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
