export const proposalsSection = "policy-proposals";
export const proposalPath = `${proposalsSection}/`;
export const proposalEvidencePrefix = "proposal-evidence-";
export const housingPilotSettingsSection = "housing-pilot-settings";
export const housingOwnershipSection = "housing-home-ownership";
export const programmeSettingsPrefix = "compare-programme/";
export const preventionFollowupSection = "prevention-follow-up";

export function proposalHref(id: string) {
  return id === "affordable-housing" ? "#housing-pilot" : `#${proposalPath}${id}`;
}
