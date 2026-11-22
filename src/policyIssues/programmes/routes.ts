export const proposalsSection = "policy-proposals";
export const proposalPath = `${proposalsSection}/`;
export const proposalEvidencePrefix = "proposal-evidence-";

export function proposalHref(id: string) {
  return id === "affordable-housing" ? "#housing-pilot" : `#${proposalPath}${id}`;
}
