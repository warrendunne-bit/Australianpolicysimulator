import { useEffect, useState } from 'react';
import { EvidenceLibrary } from './housingPilot/EvidenceLibrary';
import { HousingPilot } from './housingPilot/HousingPilot';
import { defaultHousingPilotSettings, housingPilotAssumptions } from './housingPilot/model';
import { PilotEvidenceRegister } from './housingPilot/PilotEvidenceRegister';
import { PolicyProposals, type ProgrammeScenarios } from './programmes/PolicyProposals';
import { housingOwnershipSection, housingPilotSettingsSection, preventionFollowupSection, programmeSettingsPrefix, proposalEvidencePrefix, proposalPath } from './programmes/routes';
import { TradeExposure } from './trade';
import { CountryVision, useCountryVision } from './vision';
import './tools.css';

export default function IssueStudies({ fragment }: { fragment: string }) {
  const { vision, setVision } = useCountryVision();
  const [settings, setSettings] = useState(defaultHousingPilotSettings);
  const [year, setYear] = useState(housingPilotAssumptions.downturnEndYear);
  const [scenarios, setScenarios] = useState<ProgrammeScenarios>({});
  const selectedPrefix = [proposalPath, programmeSettingsPrefix].find((prefix) => fragment.startsWith(prefix));
  const selectedProposal = fragment === preventionFollowupSection ? 'preventive-health' : selectedPrefix && fragment.slice(selectedPrefix.length);
  const showHousing = fragment === 'housing-pilot' || fragment === housingOwnershipSection || fragment === housingPilotSettingsSection;
  const selectedEvidence = fragment.startsWith(proposalEvidencePrefix) ? fragment.slice(proposalEvidencePrefix.length) : undefined;
  const showEvidence = fragment === 'evidence-library' || fragment === 'housing-evidence-register' || selectedEvidence !== undefined;

  useEffect(() => {
    if (!fragment || fragment === 'dashboard' || fragment === 'australia-today') return;
    const target = document.getElementById(fragment) ?? document.getElementById('issue-studies');
    target?.scrollIntoView({ block: 'start' });
    target?.querySelector<HTMLElement>(':is(h2, h3)[tabindex="-1"]')?.focus({ preventScroll: true });
  }, [fragment]);

  return (
    <div className="policy-issues-content" id="issue-studies">
      <nav className="issue-study-nav" aria-label="Issue tools">
        <a href="#problems-to-solve">Ten major issues</a>
        <a href="#evidence-library">Evidence library</a>
        <a href="#trade-exposure">Trade exposure</a>
        <a href="#country-vision">Country vision</a>
      </nav>
      {showEvidence ? <><EvidenceLibrary vision={vision} selectedProposal={selectedEvidence} /><PilotEvidenceRegister /></>
        : fragment === 'trade-exposure' ? <TradeExposure />
        : fragment === 'country-vision' ? <CountryVision vision={vision} onChange={setVision} />
        : showHousing ? <HousingPilot vision={vision} settings={settings} year={year} onSettingsChange={setSettings} onYearChange={setYear} />
        : <PolicyProposals selected={selectedProposal} scenarios={scenarios} onCompare={(id, values) => setScenarios((previous) => ({ ...previous, [id]: values }))} />}
    </div>
  );
}
