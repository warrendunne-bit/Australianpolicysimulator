import type { PolicyExercise, PolicyInput } from "./types";

export type ProgrammeInputs = Readonly<Record<string, number>>;

export function initialProgrammeInputs(inputs: readonly PolicyInput[]): ProgrammeInputs {
  return Object.fromEntries(inputs.map(({ id, initial }) => [id, initial]));
}

export function compareProgramme(exercise: PolicyExercise, values: ProgrammeInputs) {
  const referenceValues = Object.fromEntries(exercise.inputs.map(({ id, reference }) => [id, reference ?? values[id]]));
  const referenceOutcomes = new Map(exercise.calculate(referenceValues).map((outcome) => [outcome.id, outcome]));
  return exercise.calculate(values).map((outcome) => ({
    ...outcome,
    reference: referenceOutcomes.get(outcome.id)?.value ?? null,
  }));
}
