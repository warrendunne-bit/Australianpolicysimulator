import { useState } from "react";
import { emptyCountryVision, isVisionPriority, visionPriorities, type CountryVisionValue, type VisionPriority } from "./vision";
import "./countryVision.css";

interface CountryVisionProps {
  vision: CountryVisionValue;
  /** Applies the choices and returns whether they were saved to browser storage. */
  onChange: (next: CountryVisionValue) => boolean;
}

const options = Object.keys(visionPriorities) as VisionPriority[];

export function CountryVision({ vision, onChange }: CountryVisionProps) {
  const [draft, setDraft] = useState(vision);
  const [status, setStatus] = useState("");
  const hasChanges = draft.primary !== vision.primary || draft.secondary !== vision.secondary;

  function selectPrimary(primary: VisionPriority) {
    setDraft({ primary, secondary: draft.secondary === primary ? null : draft.secondary });
    setStatus("");
  }

  function submit(next: CountryVisionValue) {
    const stored = onChange(next);
    if (next.primary) {
      setStatus(stored ? "Priorities saved in this browser." : "Priorities applied for this visit. Browser storage is unavailable.");
    } else {
      setStatus(stored ? "Priorities cleared." : "Priorities cleared for this visit. Browser storage is unavailable.");
    }
  }

  return (
    <section id="country-vision" className="panel country-vision" aria-labelledby="country-vision-title">
      <div className="section-heading">
        <h2 id="country-vision-title">Country vision</h2>
        <p>Choose a main priority and an optional second. The evidence library puts related proposals first. The housing pilot starts with a related household measure when it covers that priority.</p>
      </div>

      <form onSubmit={(event) => { event.preventDefault(); if (draft.primary && hasChanges) submit(draft); }}>
        <fieldset className="vision-primary">
          <legend>Main priority</legend>
          <div className="vision-options">
            {options.map((priority) => (
              <label key={priority} className="vision-option">
                <input
                  type="radio"
                  name="vision-primary"
                  value={priority}
                  checked={draft.primary === priority}
                  aria-labelledby={`vision-${priority}-title`}
                  aria-describedby={`vision-${priority}-description`}
                  onChange={() => selectPrimary(priority)}
                />
                <span>
                  <span id={`vision-${priority}-title`} className="vision-option-title">{visionPriorities[priority].label}</span>
                  <span id={`vision-${priority}-description`} className="vision-option-description">{visionPriorities[priority].description}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="year-select vision-secondary">
          <label htmlFor="vision-secondary">Second priority (optional)</label>
          <select
            id="vision-secondary"
            value={draft.secondary ?? ""}
            disabled={!draft.primary}
            onChange={(event) => {
              const value = event.target.value;
              setDraft({ ...draft, secondary: isVisionPriority(value) ? value : null });
              setStatus("");
            }}
          >
            <option value="">No second priority</option>
            {options.filter((option) => option !== draft.primary).map((option) => (
              <option key={option} value={option}>{visionPriorities[option].label}</option>
            ))}
          </select>
        </div>

        <div className="vision-actions">
          <button className="primary-button" type="submit" disabled={!draft.primary || !hasChanges}>Save priorities</button>
          <button
            className="secondary-button"
            type="button"
            disabled={!draft.primary && !vision.primary}
            onClick={() => {
              setDraft(emptyCountryVision);
              submit(emptyCountryVision);
            }}
          >Clear priorities</button>
        </div>
        <p className="vision-status" role="status">{status}</p>
      </form>
    </section>
  );
}
