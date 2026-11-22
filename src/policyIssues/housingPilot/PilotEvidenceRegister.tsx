import { pilotEvidenceEntries, type PilotEvidenceBasis } from "./pilotEvidence";
import "./pilotEvidence.css";

const basisLabels: Record<PilotEvidenceBasis, string> = {
  official: "Published estimate",
  projection: "Published projection",
  derived: "Derived proxy",
  illustrative: "Illustrative assumption",
  accounting: "Accounting rule",
};

export function PilotEvidenceRegister({ id = "housing-evidence-register" }: { id?: string }) {
  const headingId = `${id}-title`;

  return (
    <section className="panel evidence-library pilot-evidence-register" id={id} aria-labelledby={headingId}>
      <div className="section-heading evidence-header">
        <h2 id={headingId}>Housing evidence register</h2>
        <p>Trace housing pilot results to published inputs, illustrative assumptions and accounting rules. Open a mechanism to see who it covers, when it applies and where the evidence is limited.</p>
      </div>

      <ul className="evidence-list">
        {pilotEvidenceEntries.map((entry) => (
          <li className="evidence-entry" key={entry.id}>
            <details>
              <summary>
                <span className="evidence-card-title">{entry.title}</span>
                <span className="evidence-badges">
                  {entry.basis.map((basis) => (
                    <span className={`evidence-badge ${basis}`} key={basis}>{basisLabels[basis]}</span>
                  ))}
                </span>
              </summary>
              <div className="evidence-body">
                <dl className="evidence-outcomes">
                  <div><dt>Population and reference period</dt><dd>{entry.context}</dd></div>
                  <div><dt>Model inputs</dt><dd>{entry.inputs}</dd></div>
                  <div><dt>When effects appear</dt><dd>{entry.timing}</dd></div>
                  <div><dt>Evidence limits</dt><dd>{entry.limitation}</dd></div>
                </dl>
                {entry.sources.length > 0 && (
                  <ul className="evidence-sources" aria-label={`Sources for ${entry.title}`}>
                    {entry.sources.map(({ label, url, role }) => (
                      <li key={url}>
                        <a href={url} target="_blank" rel="noreferrer">{label}</a>
                        <p className="evidence-source-note">{role}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </details>
          </li>
        ))}
      </ul>
    </section>
  );
}
