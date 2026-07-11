import { DEFAULT_EVENTS } from '../../simulation/model';

export function EventsPage({
  selectedEventIds,
  onEventToggle,
}: {
  selectedEventIds: string[];
  onEventToggle: (eventId: string) => void;
}) {
  return (
    <section className="section-block events-console-section">
      <p className="eyebrow">Events</p>
      <h2>Strategy-game event queue</h2>
      <p className="section-intro">
        Events are optional illustrative shocks. They are stress tests, not predictions.
      </p>
      <div className="event-card-grid">
        {DEFAULT_EVENTS.map((event) => (
          <button
            className={selectedEventIds.includes(event.id) ? 'strategy-event-card is-active' : 'strategy-event-card'}
            key={event.id}
            type="button"
            onClick={() => onEventToggle(event.id)}
          >
            <span>{selectedEventIds.includes(event.id) ? 'Active' : 'Inactive'}</span>
            <strong>{event.name}</strong>
            <small>Year {event.year} • {event.kind} • intensity {(event.intensity * 100).toFixed(0)}%</small>
            <p>{event.explanation}</p>
            <em>Expected pressure: {event.impactSummary}</em>
          </button>
        ))}
      </div>
    </section>
  );
}
