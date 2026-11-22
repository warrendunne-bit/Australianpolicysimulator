import type { PolicyExercise } from "./types";

const monthsInYear = 12;
const dollarsPerMillion = 1_000_000;
const fraction = (percent: number) => percent / 100;

const earlyYearsAndSkills: PolicyExercise = {
  id: "early-years-and-skills",
  title: "Early-years services and training",
  description: "Compare the first-year reach and spending of a local expansion in early-years services and adult training.",
  inputs: [
    { id: "earlyPlaces", label: "Funded early-years places", unit: "places", initial: 600, reference: 400, min: 0, max: 5_000, step: 10 },
    { id: "earlyStaff", label: "Early-years staff", unit: "FTE", initial: 48, reference: 30, min: 0, max: 500, step: 1 },
    { id: "placesPerStaff", label: "Early-years places per staff member", unit: "places per FTE", initial: 12, min: 1, max: 30, step: 1, description: "A planning assumption for annual delivery capacity across a service." },
    { id: "earlyCost", label: "Early-years delivery cost", unit: "A$ per place-year", initial: 14_500, min: 0, max: 50_000, step: 500 },
    { id: "trainingStarts", label: "Funded adult training starts", unit: "starts per operating year", initial: 300, reference: 180, min: 0, max: 5_000, step: 10 },
    { id: "trainingLength", label: "Training duration", unit: "months", initial: 6, min: 1, max: 12, step: 1 },
    { id: "completionRate", label: "Training completion assumption", unit: "%", initial: 80, min: 0, max: 100, step: 1 },
    { id: "trainingCost", label: "Adult training cost", unit: "A$ per start", initial: 6_000, min: 0, max: 30_000, step: 500 },
    { id: "openingDelay", label: "Time to open services", unit: "months", initial: 3, reference: 1, min: 0, max: 12, step: 1 },
  ],
  calculate: ({ earlyPlaces, earlyStaff, placesPerStaff, earlyCost, trainingStarts, trainingLength, completionRate, trainingCost, openingDelay }) => {
    const openMonths = monthsInYear - openingDelay;
    const staffedPlaces = Math.min(earlyPlaces, earlyStaff * placesPerStaff);
    const placeYears = staffedPlaces * openMonths / monthsInYear;
    const starts = Math.floor(trainingStarts * openMonths / monthsInYear);
    const intakeMonthsCompletingThisYear = Math.max(0, openMonths - trainingLength + 1);
    const startsWithTimeToFinish = Math.floor(trainingStarts * intakeMonthsCompletingThisYear / monthsInYear);
    const completions = startsWithTimeToFinish * fraction(completionRate);
    const earlySpending = placeYears * earlyCost;
    const committedTrainingSpending = starts * trainingCost;

    return [
      { id: "early-capacity", label: "Early-years capacity at opening", value: openMonths > 0 ? staffedPlaces : 0, unit: "places" },
      { id: "early-reach", label: "Early-years places delivered in year one", value: placeYears, unit: "place-years", decimals: 1, description: "One place available for six months counts as half a place-year." },
      { id: "training-starts", label: "Training starts in year one", value: starts, unit: "people" },
      { id: "training-completions", label: "Expected training completions in year one", value: completions, unit: "people", decimals: 1 },
      { id: "spending", label: "First-year service spending and commitments", value: (earlySpending + committedTrainingSpending) / dollarsPerMillion, unit: "A$ million", decimals: 2 },
    ];
  },
  assumptions: [
    "Staff and funded places limit early-years capacity. The model assumes enough demand to fill places when services open.",
    "Adult training intake is spread evenly over operating months. Learners count towards first-year completions only when their course can finish within the year.",
    "Spending combines the cost of delivering early-years places and the full course cost committed at enrolment. Start-up costs and long-term education or earnings benefits are outside this exercise.",
  ],
};

const incomeSecurity: PolicyExercise = {
  id: "income-security",
  title: "Wage insurance and transition support",
  description: "Compare support for a cohort of workers who lose their jobs, including a temporary top-up for those who find lower-paid work.",
  inputs: [
    { id: "displacedWorkers", label: "Workers in the displaced cohort", unit: "people", initial: 1_000, min: 0, max: 20_000, step: 50 },
    { id: "participation", label: "Programme participation", unit: "%", initial: 80, min: 0, max: 100, step: 1 },
    { id: "lowerPaidReemployment", label: "Participants who find lower-paid work", unit: "%", initial: 65, min: 0, max: 100, step: 1, description: "This share is held constant across both packages." },
    { id: "previousPay", label: "Typical previous gross pay", unit: "A$ per week", initial: 1_400, min: 0, max: 6_000, step: 50 },
    { id: "newPay", label: "Typical new gross pay", unit: "A$ per week", initial: 1_100, min: 0, max: 6_000, step: 50 },
    { id: "replacementRate", label: "Share of the pay gap covered", unit: "%", initial: 50, reference: 0, min: 0, max: 100, step: 1 },
    { id: "weeklyCap", label: "Maximum weekly top-up", unit: "A$ per week", initial: 250, min: 0, max: 1_500, step: 10 },
    { id: "supportWeeks", label: "Wage insurance duration", unit: "weeks", initial: 26, reference: 0, min: 0, max: 52, step: 1 },
    { id: "transitionCost", label: "Placement and training spend", unit: "A$ per participant", initial: 750, reference: 0, min: 0, max: 10_000, step: 50 },
  ],
  calculate: ({ displacedWorkers, participation, lowerPaidReemployment, previousPay, newPay, replacementRate, weeklyCap, supportWeeks, transitionCost }) => {
    const participants = Math.round(displacedWorkers * fraction(participation));
    const reemployed = Math.round(participants * fraction(lowerPaidReemployment));
    const payGap = Math.max(0, previousPay - newPay);
    const weeklySupport = supportWeeks > 0 ? Math.min(payGap * fraction(replacementRate), weeklyCap) : 0;
    const recipients = weeklySupport > 0 ? reemployed : 0;
    const wageSpending = recipients * weeklySupport * supportWeeks;
    const transitionSpending = participants * transitionCost;

    return [
      { id: "recipients", label: "Workers receiving a wage top-up", value: recipients, unit: "people" },
      { id: "weekly-top-up", label: "Weekly top-up for an eligible worker", value: weeklySupport, unit: "A$ per week", decimals: 2 },
      { id: "remaining-gap", label: "Weekly pay gap during support", value: payGap - weeklySupport, unit: "A$ per week", decimals: 2 },
      { id: "wage-spending", label: "Wage insurance spending", value: wageSpending / dollarsPerMillion, unit: "A$ million", decimals: 2 },
      { id: "transition-spending", label: "Placement and training spending", value: transitionSpending / dollarsPerMillion, unit: "A$ million", decimals: 2 },
      { id: "spending", label: "Combined public cost for this cohort", value: (wageSpending + transitionSpending) / dollarsPerMillion, unit: "A$ million", decimals: 2 },
    ];
  },
  assumptions: [
    "The reference package has zero additional wage insurance and placement or training spend. Existing benefits remain outside this comparison.",
    "A representative worker with lower pay receives the smaller of the covered share of their wage gap and the weekly cap. The package pays each recipient for the full selected period.",
    "The model holds re-employment and participation constant and applies a common pay gap to recipients. Taxes, benefit withdrawal and changes in employment behaviour are outside this exercise.",
  ],
};

const preventiveHealth: PolicyExercise = {
  id: "preventive-health",
  title: "Targeted prevention programme",
  description: "Compare programme reach, delivery cost and possible type 2 diabetes outcomes for a hypothetical cohort of adults at higher risk.",
  inputs: [
    { id: "eligibleAdults", label: "Eligible adults in the cohort", unit: "people", initial: 2_000, min: 0, max: 20_000, step: 50 },
    { id: "takeUp", label: "Eligible adults who would enrol", unit: "%", initial: 70, min: 0, max: 100, step: 1 },
    { id: "fundedPlaces", label: "Funded programme places", unit: "places", initial: 1_000, reference: 400, min: 0, max: 20_000, step: 50 },
    { id: "staff", label: "Delivery staff", unit: "FTE", initial: 10, reference: 6, min: 0, max: 100, step: 1 },
    { id: "staffCapacity", label: "Programme places per staff member", unit: "places per FTE", initial: 90, min: 1, max: 200, step: 1 },
    { id: "costPerParticipant", label: "Delivery cost", unit: "A$ per participant", initial: 950, min: 0, max: 10_000, step: 50 },
    { id: "baselineRisk", label: "Assumed three-year risk without the programme", unit: "%", initial: 15, min: 0, max: 100, step: 1 },
    { id: "effect", label: "Assumed relative risk reduction for participants", unit: "%", initial: 20, min: 0, max: 100, step: 1, description: "Illustrative. Set to zero to compare reach and spending alone." },
  ],
  calculate: ({ eligibleAdults, takeUp, fundedPlaces, staff, staffCapacity, costPerParticipant, baselineRisk, effect }) => {
    const willingAdults = Math.round(eligibleAdults * fraction(takeUp));
    const participants = Math.min(willingAdults, fundedPlaces, staff * staffCapacity);
    const expectedWithoutProgramme = eligibleAdults * fraction(baselineRisk);
    const expectedCasesAvoided = participants * fraction(baselineRisk) * fraction(effect);

    return [
      { id: "participants", label: "Adults receiving prevention services", value: participants, unit: "people" },
      { id: "waiting", label: "Willing adults without a place", value: willingAdults - participants, unit: "people" },
      { id: "spending", label: "Programme delivery cost", value: participants * costPerParticipant / dollarsPerMillion, unit: "A$ million", decimals: 2 },
      { id: "expected-cases", label: "Expected new cases over three years", value: Math.max(0, expectedWithoutProgramme - expectedCasesAvoided), unit: "cases", decimals: 1 },
      { id: "expected-avoided", label: "Expected cases avoided over three years", value: expectedCasesAvoided, unit: "cases", decimals: 1, description: "Compared with offering the programme to none of this cohort." },
    ];
  },
  assumptions: [
    "Funding, staffing and willingness to enrol cap enrolment. All participants are assumed to receive the selected programme.",
    "The three-year risk and programme effect are illustrative inputs for the whole cohort. The risk reduction applies only to participants and represents a relative reduction from their assumed starting risk.",
    "Spending is charged for one intake, and cases are counted across a three-year follow-up. Future medical spending, benefits to other health outcomes and national results are outside this exercise.",
  ],
};

export const householdExercises: readonly PolicyExercise[] = [earlyYearsAndSkills, incomeSecurity, preventiveHealth];
