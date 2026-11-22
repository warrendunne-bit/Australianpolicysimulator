import { proposalEvidencePrefix, proposalHref } from "../programmes/routes";
import { visionPriorities, type CountryVisionValue, type VisionPriority } from "../vision";
import { evidenceProposals } from "./evidence";

const proposalPriorities: Record<string, readonly VisionPriority[]> = {
  "affordable-housing": ["security", "fairness"],
  "economic-diversification": ["prosperity"],
  "energy-and-adaptation": ["sustainability", "security", "prosperity"],
  "critical-systems": ["security"],
  "early-years-and-skills": ["prosperity", "fairness", "wellbeing"],
  "income-security": ["fairness", "prosperity", "agency"],
  "preventive-health": ["wellbeing"],
  belonging: ["wellbeing", "fairness"],
  "attention-and-gambling": ["agency", "wellbeing"],
  "government-evaluation": ["agency", "fairness"],
};

export function EvidenceLibrary({ vision, selectedProposal }: { vision: CountryVisionValue; selectedProposal?: string }) {
  const { primary, secondary } = vision;
  function priorityRank(id: string) {
    const matches = proposalPriorities[id] ?? [];
    if (primary && matches.includes(primary)) return 0;
    if (secondary && matches.includes(secondary)) return 1;
    return 2;
  }
  const proposals = primary ? [...evidenceProposals].sort((first, second) => priorityRank(first.id) - priorityRank(second.id)) : evidenceProposals;

  return (
    <section className="panel evidence-library" id="evidence-library" aria-labelledby="evidence-library-title">
      <div className="section-heading evidence-header">
        <h2 id="evidence-library-title">Evidence library</h2>
        <p>Ten proposals from <cite>Australian prosperity, wellbeing and resilience</cite>. Open each proposal to see what to measure, how it fits the simulator and where the evidence applies.</p>
        {primary && <p className="evidence-vision-note">Proposals related to {visionPriorities[primary].label.toLowerCase()}{secondary && ` and ${visionPriorities[secondary].label.toLowerCase()}`} appear first. <a href="#country-vision">Change priorities</a></p>}
        <p className="evidence-vision-note"><a href="#housing-evidence-register">Go to the housing evidence register</a></p>
      </div>
      <ul className="evidence-list">
        {proposals.map((proposal) => (
          <li className="evidence-entry" key={proposal.id}>
            <details id={`${proposalEvidencePrefix}${proposal.id}`} open={proposal.id === selectedProposal ? true : undefined}>
              <summary>
                <span className="evidence-card-title">{proposal.title}</span>
                <span className="evidence-badges">
                  <span className="evidence-badge evidence-stage">{proposal.status}</span>
                  <span className="evidence-badge evidence-judgement">{proposal.judgement}</span>
                </span>
              </summary>
              <div className="evidence-body">
                <p>{proposal.action}</p>
                <dl className="evidence-outcomes">
                  <div><dt>Use in the simulator</dt><dd>{proposal.simulatorUse}</dd></div>
                  <div><dt>Outcomes to track</dt><dd>{proposal.outcomes}</dd></div>
                </dl>
                <p><a href={proposalHref(proposal.id)}>{proposal.id === "affordable-housing" ? "Open the housing comparison" : "Open the programme comparison"}</a></p>
                {proposal.id === "economic-diversification" && <p><a href="#trade-exposure">Open trade exposure and export stress tests</a></p>}
                <ul className="evidence-sources" aria-label={`Sources for ${proposal.title}`}>
                  {proposal.sources.map((source) => (
                    <li key={source.url}>
                      <a href={source.url} target="_blank" rel="noreferrer">{source.title}</a>
                      <p className="evidence-source-note">{source.interpretation}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </details>
          </li>
        ))}
      </ul>
    </section>
  );
}
