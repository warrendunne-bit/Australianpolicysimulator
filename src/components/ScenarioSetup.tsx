import { DEFAULT_EVENTS, type SimulationHorizon } from '../simulation/model';
import type { ScenarioPreset } from '../simulation/presets';
import { Panel } from './shared';

export function ScenarioSetup({
  horizon,
  selectedEventIds,
  presets,
  selectedPresetId,
  onHorizonChange,
  onEventToggle,
  onPresetSelect,
}: {
  horizon: SimulationHorizon;
  selectedEventIds: string[];
  presets: ScenarioPreset[];
  selectedPresetId: string;
  onHorizonChange: (horizon: SimulationHorizon) => void;
  onEventToggle: (eventId: string) => void;
  onPresetSelect: (presetId: string) => void;
}) {
  return (
    <section className="section-block">
      <h2>Cabinet Agenda</h2>
      <div className="control-grid">
        <Panel title="Simulation Horizon">
          <div className="segmented-control" aria-label="Simulation horizon">
            {([1, 5, 10] as SimulationHorizon[]).map((option) => (
              <button
                className={horizon === option ? 'is-active' : ''}
                key={option}
                type="button"
                onClick={() => onHorizonChange(option)}
              >
                {option} {option === 1 ? 'year' : 'years'}
              </button>
            ))}
          </div>
          <p className="panel-note">
            The World object runs one annual step at a time and stores each outcome in history.
          </p>
        </Panel>

        <Panel title="Scenario Presets">
          <div className="preset-grid">
            {presets.map((preset) => (
              <button
                className={selectedPresetId === preset.id ? 'preset-card is-active' : 'preset-card'}
                key={preset.id}
                type="button"
                onClick={() => onPresetSelect(preset.id)}
              >
                <strong>{preset.name}</strong>
                <span>{preset.description}</span>
              </button>
            ))}
          </div>
          <p className="panel-note">
            Presets are starting points only. You can still adjust every slider manually.
          </p>
        </Panel>

        <Panel title="Event Queue">
          <p className="panel-note compact-note">
            Events are optional illustrative shocks, not predictions. They activate in the listed
            year so you can test resilience under stress.
          </p>
          <div className="event-list">
            {DEFAULT_EVENTS.map((event) => (
              <label className="event-option" key={event.id}>
                <input
                  checked={selectedEventIds.includes(event.id)}
                  type="checkbox"
                  onChange={() => onEventToggle(event.id)}
                />
                <span>
                  <strong>{event.name}</strong>
                  <small>
                    Year {event.year} • {event.kind} • intensity {(event.intensity * 100).toFixed(0)}%
                  </small>
                  <small>{event.explanation}</small>
                  <small>Expected pressure: {event.impactSummary}</small>
                </span>
              </label>
            ))}
          </div>
        </Panel>
      </div>
    </section>
  );
}
