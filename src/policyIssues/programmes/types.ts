export interface PolicyInput {
  id: string;
  label: string;
  unit: string;
  initial: number;
  /** An omitted reference means both scenarios share the user's setting. */
  reference?: number;
  min: number;
  max: number;
  step: number;
  description?: string;
}

export interface PolicyOutcome {
  id: string;
  label: string;
  value: number;
  unit: string;
  decimals?: number;
  description?: string;
}

export interface PolicyExercise {
  id: string;
  /** The parent brief when an issue offers more than one comparison. */
  issueId?: string;
  title: string;
  description: string;
  inputs: readonly PolicyInput[];
  calculate: (values: Readonly<Record<string, number>>) => readonly PolicyOutcome[];
  assumptions: readonly string[];
}
