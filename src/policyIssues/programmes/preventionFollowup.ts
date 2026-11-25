import { compareProgramme, type ProgrammeInputs } from './comparison';
import type { PolicyExercise } from './types';

const earlyEffects = [
  { label: 'Zero', percent: 0 },
  { label: 'Low', percent: 10 },
  { label: 'Central', percent: 20 },
  { label: 'High', percent: 40 },
];

function readComparison(results: ReturnType<typeof compareProgramme>, id: string) {
  const outcome = results.find((item) => item.id === id);
  if (!outcome || outcome.reference === null) {
    throw new Error(`Missing prevention comparison for ${id}`);
  }
  return { reference: outcome.reference, scenario: outcome.value };
}

function casesThroughYearTen(
  threeYearCases: number,
  casesAvoided: number,
  participants: number,
  eligibleAdults: number,
  earlyBaselineRisk: number,
  laterBaselineRisk: number,
  laterEffect: number,
) {
  const participantsStillAtRisk = participants * (1 - earlyBaselineRisk) + casesAvoided;
  const othersStillAtRisk = (eligibleAdults - participants) * (1 - earlyBaselineRisk);
  const newCases = laterBaselineRisk * (othersStillAtRisk + participantsStillAtRisk * (1 - laterEffect));
  return threeYearCases + newCases;
}

export function comparePreventionFollowup(
  exercise: PolicyExercise,
  inputs: ProgrammeInputs,
  laterRiskPercent: number,
  retainedEffectPercent: number,
) {
  const earlyBaselineRisk = inputs.baselineRisk / 100;
  const laterBaselineRisk = laterRiskPercent / 100;
  const comparisons = earlyEffects.map((effect) => ({
    effect,
    results: compareProgramme(exercise, { ...inputs, effect: effect.percent }),
  }));
  const sharedResults = comparisons[0].results;
  const participants = readComparison(sharedResults, 'participants');
  const cost = readComparison(sharedResults, 'spending');
  const rows = comparisons.map(({ effect, results }) => {
    const casesThreeYears = readComparison(results, 'expected-cases');
    const casesAvoided = readComparison(results, 'expected-avoided');
    const laterEffect = effect.percent * retainedEffectPercent / 10_000;
    const casesTenYears = {
      reference: casesThroughYearTen(casesThreeYears.reference, casesAvoided.reference, participants.reference,
        inputs.eligibleAdults, earlyBaselineRisk, laterBaselineRisk, laterEffect),
      scenario: casesThroughYearTen(casesThreeYears.scenario, casesAvoided.scenario, participants.scenario,
        inputs.eligibleAdults, earlyBaselineRisk, laterBaselineRisk, laterEffect),
    };
    return { effect, casesThreeYears, casesTenYears };
  });
  return { rows, participants, cost };
}
