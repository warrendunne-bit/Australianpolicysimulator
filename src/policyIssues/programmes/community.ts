import type { PolicyExercise } from "./types";

const belonging: PolicyExercise = {
  id: "belonging",
  title: "Community activity access",
  description: "Compare the places, attendance and ongoing participation a local activity programme could support across libraries, schools and community venues.",
  inputs: [
    { id: "eligibleResidents", label: "Eligible residents", unit: "people", initial: 10_000, min: 0, max: 100_000, step: 100 },
    { id: "signupPercent", label: "Residents interested in joining", unit: "%", initial: 12, min: 0, max: 100, step: 1 },
    { id: "sites", label: "Funded activity sites", unit: "sites", initial: 12, reference: 6, min: 0, max: 100, step: 1 },
    { id: "placesPerSite", label: "Annual participant places per site", unit: "places", initial: 65, min: 0, max: 500, step: 5 },
    { id: "attendancePercent", label: "Enrolled participants who attend", unit: "%", initial: 90, min: 0, max: 100, step: 1 },
    { id: "retentionPercent", label: "Attendees still taking part at three months", unit: "%", initial: 65, min: 0, max: 100, step: 1 },
    { id: "annualSiteCost", label: "Annual cost per site", unit: "A$", initial: 28_000, min: 0, max: 100_000, step: 1_000 },
    { id: "accessSupportPerEnrollment", label: "Access support per enrolment", unit: "A$", initial: 120, reference: 60, min: 0, max: 1_000, step: 10, description: "Allowance for transport, accessibility and similar barriers." },
  ],
  calculate: ({ eligibleResidents, signupPercent, sites, placesPerSite, attendancePercent, retentionPercent, annualSiteCost, accessSupportPerEnrollment }) => {
    const places = sites * placesPerSite;
    const expectedInterest = Math.round(eligibleResidents * signupPercent / 100);
    const enrolments = Math.min(places, expectedInterest);
    const attendees = Math.round(enrolments * attendancePercent / 100);
    const retained = Math.round(attendees * retentionPercent / 100);
    const annualCost = sites * annualSiteCost + enrolments * accessSupportPerEnrollment;

    return [
      { id: "places", label: "Annual places offered", value: places, unit: "places" },
      { id: "attendees", label: "Attend at least once", value: attendees, unit: "people" },
      { id: "retained", label: "Still taking part at three months", value: retained, unit: "people" },
      { id: "unmetInterest", label: "Interested residents without a place", value: expectedInterest - enrolments, unit: "people" },
      { id: "annualCost", label: "Annual programme cost", value: annualCost, unit: "A$" },
    ];
  },
  assumptions: [
    "Each annual place serves one resident. Enrolments are limited by the number of places and the assumed interest. Attendance and three-month retention rates apply in sequence.",
    "Costs cover site operation and access support for each enrolment. Participation is a delivery measure. Testing changes in loneliness and belonging would need participant follow-up and a comparison group.",
  ],
};

const safeguards: PolicyExercise = {
  id: "attention-and-gambling",
  title: "Digital controls and gambling safeguards",
  description: "Compare the reach and delivery cost of separate opt-in offers for digital controls and gambling safeguards.",
  inputs: [
    { id: "eligibleDigital", label: "Eligible digital-service users", unit: "people", initial: 20_000, min: 0, max: 1_000_000, step: 100 },
    { id: "digitalCoverage", label: "Digital users offered controls", unit: "%", initial: 60, reference: 20, min: 0, max: 100, step: 1 },
    { id: "digitalOptIn", label: "Digital controls activated per offer", unit: "%", initial: 25, min: 0, max: 100, step: 1 },
    { id: "digitalCost", label: "Delivery cost per digital activation", unit: "A$", initial: 25, min: 0, max: 500, step: 1 },
    { id: "eligibleGambling", label: "People eligible for gambling safeguards", unit: "people", initial: 8_000, min: 0, max: 1_000_000, step: 100 },
    { id: "gamblingCoverage", label: "Eligible people offered a safeguard", unit: "%", initial: 60, reference: 15, min: 0, max: 100, step: 1 },
    { id: "gamblingOptIn", label: "Gambling safeguards activated per offer", unit: "%", initial: 30, min: 0, max: 100, step: 1 },
    { id: "gamblingCost", label: "Delivery cost per safeguard activation", unit: "A$", initial: 75, min: 0, max: 500, step: 1 },
  ],
  calculate: ({ eligibleDigital, digitalCoverage, digitalOptIn, digitalCost, eligibleGambling, gamblingCoverage, gamblingOptIn, gamblingCost }) => {
    const digitalOffers = Math.round(eligibleDigital * digitalCoverage / 100);
    const digitalActivations = Math.round(digitalOffers * digitalOptIn / 100);
    const gamblingOffers = Math.round(eligibleGambling * gamblingCoverage / 100);
    const gamblingActivations = Math.round(gamblingOffers * gamblingOptIn / 100);
    const annualCost = digitalActivations * digitalCost + gamblingActivations * gamblingCost;

    return [
      { id: "digitalOffers", label: "People offered digital controls", value: digitalOffers, unit: "people" },
      { id: "digitalActivations", label: "People activating digital controls", value: digitalActivations, unit: "people" },
      { id: "gamblingOffers", label: "People offered a gambling safeguard", value: gamblingOffers, unit: "people" },
      { id: "gamblingActivations", label: "People activating a gambling safeguard", value: gamblingActivations, unit: "people" },
      { id: "annualCost", label: "Combined annual delivery cost", value: annualCost, unit: "A$" },
    ];
  },
  assumptions: [
    "Offers and activations cover one year. Each participant can activate once within each programme. The two reach counts stay separate because the populations may overlap. Costs cover the specified work per activation.",
    "Using a feature once measures initial uptake. Sustained use, switching to other providers, financial losses and attention or wellbeing would need separate measurement.",
  ],
};

const publicService: PolicyExercise = {
  id: "government-evaluation",
  title: "Service delivery and evaluation",
  description: "Test how a public service can balance case processing with selecting cases for review and asking service users about their experience.",
  inputs: [
    { id: "newCases", label: "New cases per year", unit: "cases", initial: 15_000, min: 0, max: 250_000, step: 100 },
    { id: "openingBacklog", label: "Cases waiting at start of year", unit: "cases", initial: 1_500, min: 0, max: 250_000, step: 100 },
    { id: "staff", label: "Full-time equivalent staff", unit: "staff", initial: 12, reference: 9, min: 0, max: 100, step: 1 },
    { id: "caseworkHours", label: "Annual casework hours per staff member", unit: "hours", initial: 1_300, min: 0, max: 2_000, step: 10 },
    { id: "processingMinutes", label: "Average processing time per case", unit: "minutes", initial: 45, reference: 50, min: 5, max: 180, step: 1 },
    { id: "reviewPercent", label: "Share of completed cases selected for review", unit: "%", initial: 10, reference: 3, min: 0, max: 100, step: 1 },
    { id: "reviewMinutes", label: "Staff time per review", unit: "minutes", initial: 30, min: 0, max: 180, step: 5 },
    { id: "annualStaffCost", label: "Annual cost per staff member", unit: "A$", initial: 120_000, min: 0, max: 300_000, step: 1_000 },
    { id: "reviewParticipationCost", label: "Non-staff cost per review", unit: "A$", initial: 35, min: 0, max: 500, step: 1, description: "Costs such as support for service users to provide feedback." },
  ],
  calculate: ({ newCases, openingBacklog, staff, caseworkHours, processingMinutes, reviewPercent, reviewMinutes, annualStaffCost, reviewParticipationCost }) => {
    const caseDemand = newCases + openingBacklog;
    const staffMinutes = staff * caseworkHours * 60;
    const minutesPerCase = processingMinutes + reviewPercent / 100 * reviewMinutes;
    const caseCapacity = Math.floor(staffMinutes / minutesPerCase);
    const completedCases = Math.min(caseDemand, caseCapacity);
    const reviewedCases = Math.floor(completedCases * reviewPercent / 100);
    const annualCost = staff * annualStaffCost + reviewedCases * reviewParticipationCost;

    return [
      { id: "caseCapacity", label: "Annual case processing capacity", value: caseCapacity, unit: "cases" },
      { id: "completedCases", label: "Cases completed during the year", value: completedCases, unit: "cases" },
      { id: "yearEndBacklog", label: "Cases still waiting at year-end", value: caseDemand - completedCases, unit: "cases" },
      { id: "reviewedCases", label: "Completed cases selected for review", value: reviewedCases, unit: "cases" },
      { id: "annualCost", label: "Annual delivery and review cost", value: annualCost, unit: "A$" },
    ];
  },
  assumptions: [
    "Each case uses its processing time plus an allowance for reviewing the selected share of cases. Reviews draw on the same staff hours. Capacity and the review sample round down to whole cases.",
    "Year-end backlog is annual demand plus the opening queue, less completed cases. Case mix, arrival dates and actual customer experience would be needed to assess waiting times or trust.",
  ],
};

export const communityExercises: readonly PolicyExercise[] = [belonging, safeguards, publicService];
