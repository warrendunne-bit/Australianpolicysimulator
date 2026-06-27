import { DEFAULT_EVENTS, type SimulationHorizon } from '../simulation/model';
import { Panel } from './shared';

export function ScenarioSetup({
  horizon,
  selectedEventIds,
  onHorizonChange,
  onEventToggle,
}: {
  horizon: SimulationHorizon;
  selectedEventIds: string[];
  onHorizonChange: (horizon: SimulationHorizon) => void;
  onEventToggle: (eventId: string) => void;
}) {
  return (
    <section className="section-block">
      <h2>1. Set Up Scenario</h2>
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

        <Panel title="Event Queue">
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
                    Year {event.year}: {event.explanation}
                  </small>
                </span>
              </label>
            ))}
          </div>
        </Panel>
      </div>
    </section>
  );
}
