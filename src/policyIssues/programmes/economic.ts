import type { PolicyExercise } from "./types";

const dollarsPerMillion = 1_000_000;
const thousandsPerMillion = 1_000;

export const economicExercises: readonly PolicyExercise[] = [
  {
    id: "economic-diversification",
    title: "Business technology adoption",
    description: "Compare how many firms a programme of shared facilities and implementation advisers could support in one year.",
    inputs: [
      { id: "eligibleFirms", label: "Eligible businesses", unit: "businesses", initial: 5_000, min: 0, max: 20_000, step: 100 },
      { id: "interestPercent", label: "Eligible businesses applying", unit: "%", initial: 40, min: 0, max: 100, step: 5 },
      { id: "annualPlaces", label: "Annual programme places", unit: "places", reference: 350, initial: 900, min: 0, max: 5_000, step: 50 },
      { id: "completionPercent", label: "Participants completing adoption", unit: "%", initial: 70, min: 0, max: 100, step: 5, description: "Assumed share of participating businesses that demonstrate adoption before year-end." },
      { id: "costPerParticipant", label: "Delivery cost per participant", unit: "A$", initial: 12_000, min: 0, max: 50_000, step: 500 },
      { id: "fixedOperatingCost", label: "Fixed annual public cost", unit: "A$ million", reference: 0.6, initial: 1.5, min: 0, max: 10, step: 0.1, description: "Operating costs of equipment and shared facilities." },
    ],
    calculate: ({ eligibleFirms, interestPercent, annualPlaces, completionPercent, costPerParticipant, fixedOperatingCost }) => {
      const applicants = Math.floor(eligibleFirms * interestPercent / 100);
      const participants = Math.min(annualPlaces, applicants);
      const completions = Math.floor(participants * completionPercent / 100);
      const annualCost = fixedOperatingCost + participants * costPerParticipant / dollarsPerMillion;

      return [
        { id: "participation", label: "Businesses receiving support", value: participants, unit: "businesses" },
        { id: "completed", label: "Businesses completing adoption", value: completions, unit: "businesses" },
        { id: "unserved", label: "Applicants without a place", value: applicants - participants, unit: "businesses" },
        { id: "annual-cost", label: "Annual public cost", value: annualCost, unit: "A$ million", decimals: 2 },
      ];
    },
    assumptions: [
      "Demand is the eligible business count multiplied by the application rate. Starts are limited by demand and programme places. Counts are rounded down to whole businesses.",
      "Public cost counts every business that receives support and includes fixed operating costs. Completion is an assumed programme result. Productivity, commercial returns and the share that would adopt independently require follow-up evaluation.",
    ],
  },
  {
    id: "energy-and-adaptation",
    title: "Public building efficiency and backup power",
    description: "Compare electricity use, variable bills, emissions from purchased electricity and essential service hours during an example outage.",
    inputs: [
      { id: "buildings", label: "Buildings in the portfolio", unit: "buildings", initial: 120, min: 0, max: 500, step: 5 },
      { id: "upgradeTarget", label: "Buildings planned for upgrades", unit: "buildings", reference: 15, initial: 60, min: 0, max: 500, step: 5 },
      { id: "electricityPerBuilding", label: "Usual electricity use per building", unit: "MWh per year", initial: 180, min: 0, max: 2_000, step: 10 },
      { id: "savingPercent", label: "Electricity saved per upgraded building", unit: "%", initial: 20, min: 0, max: 100, step: 5 },
      { id: "unitPrice", label: "Variable electricity price", unit: "A$ per MWh", initial: 220, min: 0, max: 1_000, step: 10 },
      { id: "emissionsFactor", label: "Purchased electricity emissions factor", unit: "t CO₂-e per MWh", initial: 0.6, min: 0, max: 2, step: 0.05, description: "An illustrative emissions factor for the electricity used by this portfolio." },
      { id: "capitalPerBuilding", label: "Capital cost per upgraded building", unit: "A$ thousand", reference: 115, initial: 145, min: 0, max: 2_000, step: 5, description: "Combined upfront cost of the efficiency upgrade and chosen backup provision." },
      { id: "outageHours", label: "Example outage duration", unit: "hours", initial: 12, min: 0, max: 72, step: 1 },
      { id: "backupHours", label: "Backup for the essential service per upgraded building", unit: "hours", reference: 2, initial: 8, min: 0, max: 48, step: 1 },
    ],
    calculate: ({ buildings, upgradeTarget, electricityPerBuilding, savingPercent, unitPrice, emissionsFactor, capitalPerBuilding, outageHours, backupHours }) => {
      const upgrades = Math.min(buildings, upgradeTarget);
      const annualElectricity = (buildings - upgrades * savingPercent / 100) * electricityPerBuilding;
      const backedUpHours = upgrades * Math.min(outageHours, backupHours);

      return [
        { id: "upgrades", label: "Buildings upgraded", value: upgrades, unit: "buildings" },
        { id: "electricity", label: "Annual purchased electricity", value: annualElectricity, unit: "MWh" },
        { id: "electricity-cost", label: "Annual variable electricity charges", value: annualElectricity * unitPrice / dollarsPerMillion, unit: "A$ million", decimals: 2 },
        { id: "emissions", label: "Annual emissions from purchased electricity", value: annualElectricity * emissionsFactor, unit: "t CO₂-e" },
        { id: "unavailable", label: "Essential service time lost in the example outage", value: buildings * outageHours - backedUpHours, unit: "building-hours" },
        { id: "capital-cost", label: "Upfront public capital cost", value: upgrades * capitalPerBuilding / thousandsPerMillion, unit: "A$ million", decimals: 2 },
      ];
    },
    assumptions: [
      "The portfolio counts only buildings in scope. Each upgraded building achieves the same assumed electricity saving, reflected in a full year after completion. Charges include variable electricity use. Fixed network charges, maintenance costs and changes in operating patterns are outside the calculation.",
      "The example outage affects all buildings together. Each building has one essential service, and backup preserves it from the start of the outage for up to the shorter of its rated hours or the outage duration.",
      "Emissions cover purchased electricity using the selected factor. Backup fuel, equipment manufacture and lifetime costs require a separate estimate.",
    ],
  },
  {
    id: "critical-systems",
    title: "Continuity of retail payments",
    description: "Compare how a contingency service could preserve payment access during one outage, along with the annual cost of keeping it ready.",
    inputs: [
      { id: "affectedCustomers", label: "Customers whose usual payment service is affected", unit: "customers", initial: 50_000, min: 0, max: 500_000, step: 1_000 },
      { id: "outageHours", label: "Usual payment service outage", unit: "hours", initial: 12, min: 0, max: 72, step: 1 },
      { id: "fallbackPercent", label: "Affected customers eligible for fallback access", unit: "%", reference: 20, initial: 60, min: 0, max: 100, step: 5 },
      { id: "activationHours", label: "Time until fallback is available", unit: "hours", reference: 4, initial: 1, min: 0, max: 72, step: 1 },
      { id: "readinessCost", label: "Annual contingency cost", unit: "A$ million", reference: 0.4, initial: 1.2, min: 0, max: 10, step: 0.1, description: "Fixed public readiness spending for the illustrative arrangement." },
    ],
    calculate: ({ affectedCustomers, outageHours, fallbackPercent, activationHours, readinessCost }) => {
      const fallbackHours = Math.max(0, outageHours - activationHours);
      const fallbackCustomers = fallbackHours > 0 ? Math.floor(affectedCustomers * fallbackPercent / 100) : 0;
      const protectedHours = fallbackCustomers * fallbackHours;

      return [
        { id: "fallback-customers", label: "Customers with fallback access during the outage", value: fallbackCustomers, unit: "customers" },
        { id: "protected-hours", label: "Payment access preserved by fallback", value: protectedHours, unit: "customer-hours" },
        { id: "unavailable-hours", label: "Payment access unavailable", value: affectedCustomers * outageHours - protectedHours, unit: "customer-hours" },
        { id: "readiness-cost", label: "Annual public readiness cost", value: readinessCost, unit: "A$ million", decimals: 2 },
      ];
    },
    assumptions: [
      "One service disruption affects the selected customers. Backup access covers an assumed share from activation until the usual service returns. Payment access is counted over time rather than as the value or number of actual transactions.",
      "The outage and fallback performance are illustrative. Common disruptions affecting both services, transaction backlogs and wider losses require provider data and further modelling. The readiness cost is annual and independent of this example outage.",
    ],
  },
];
