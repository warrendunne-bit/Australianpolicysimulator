import type {
  EntityDashboardItem,
  EventResponseSummary,
} from '../simulation/model';
import { ENTITY_IMPACT_COLUMNS } from '../simulation/model';
import { CollapsibleSection, ImpactCell, Meter, MovementBadge } from './shared';

export function EntityPanels({
  entities,
  eventResponses,
}: {
  entities: EntityDashboardItem[];
  eventResponses: EventResponseSummary[];
}) {
  return (
    <>
      <section className="section-block entity-intro">
        <p>
          Entity panels use representative households, companies, government and environment actors
          to show who carries pressure in the scenario. They are not individual forecasts.
        </p>
      </section>

      <CollapsibleSection title="Household Entities">
        <EntityDisclosureGroup entities={entities.filter((entity) => entity.kind === 'Household')} />
      </CollapsibleSection>

      <CollapsibleSection title="Company Entities">
        <EntityDisclosureGroup entities={entities.filter((entity) => entity.kind === 'Company')} />
      </CollapsibleSection>

      <CollapsibleSection title="Government">
        <EntityDisclosureGroup entities={entities.filter((entity) => entity.kind === 'Government')} />
      </CollapsibleSection>

      <CollapsibleSection title="Environment">
        <EntityDisclosureGroup entities={entities.filter((entity) => entity.kind === 'Environment')} />
      </CollapsibleSection>

      <CollapsibleSection title="Entity Impact Matrix">
        <EntityImpactMatrix entities={entities} />
      </CollapsibleSection>

      <CollapsibleSection title="Event Response Panel">
        <EventResponsePanel eventResponses={eventResponses} />
      </CollapsibleSection>
    </>
  );
}

function EntityDisclosureGroup({ entities }: { entities: EntityDashboardItem[] }) {
  return (
    <div className="entity-disclosure-list">
      {entities.map((entity) => (
        <details className="entity-disclosure" key={entity.id}>
          <summary>
            <span>
              <strong>{entity.name}</strong>
              <small>
                {entity.condition} · {entity.score.toFixed(1)} · movement{' '}
                {entity.movement >= 0 ? '+' : ''}
                {entity.movement.toFixed(1)}
              </small>
            </span>
          </summary>
          <div className="entity-disclosure-content">
            <EntityCard entity={entity} />
            <details className="nested-disclosure">
              <summary>Details</summary>
              <div className="nested-detail-grid">
                {ENTITY_IMPACT_COLUMNS.map((column) => (
                  <div key={column.key}>
                    <span>{column.label}</span>
                    <ImpactCell value={entity.impacts[column.key]} />
                  </div>
                ))}
              </div>
            </details>
          </div>
        </details>
      ))}
    </div>
  );
}

function EntityCard({ entity }: { entity: EntityDashboardItem }) {
  return (
    <article className="entity-card">
      <div className="entity-card-header">
        <div>
          <span>{entity.kind}</span>
          <h4>{entity.name}</h4>
        </div>
        <strong>{entity.score.toFixed(1)}</strong>
      </div>
      <div className="movement-row">
        <span>Before {entity.previousScore.toFixed(1)}</span>
        <MovementBadge movement={entity.movement} />
      </div>
      <Meter value={entity.score} />
      <dl className="entity-facts">
        <div>
          <dt>Condition</dt>
          <dd>{entity.condition}</dd>
        </div>
        <div>
          <dt>Main pressure</dt>
          <dd>{entity.mainPressure}</dd>
        </div>
        <div>
          <dt>Policy sensitivity</dt>
          <dd>{entity.policySensitivity}</dd>
        </div>
      </dl>
      <p>{entity.explanation}</p>
    </article>
  );
}

function EntityImpactMatrix({ entities }: { entities: EntityDashboardItem[] }) {
  return (
    <div className="impact-matrix-wrap">
      <table className="impact-matrix">
        <thead>
          <tr>
            <th>Entity</th>
            {ENTITY_IMPACT_COLUMNS.map((column) => (
              <th key={column.key}>{column.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {entities.map((entity) => (
            <tr key={entity.id}>
              <td>
                <strong>{entity.name}</strong>
                <span>{entity.kind}</span>
              </td>
              {ENTITY_IMPACT_COLUMNS.map((column) => (
                <td key={column.key}>
                  <ImpactCell value={entity.impacts[column.key]} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EventResponsePanel({ eventResponses }: { eventResponses: EventResponseSummary[] }) {
  if (!eventResponses.length) {
    return (
      <article className="empty-panel">
        <strong>No triggered events</strong>
        <p>Select one or more external events to see which representative entities are most exposed.</p>
      </article>
    );
  }

  return (
    <div className="event-response-grid">
      {eventResponses.map((response) => (
        <article className="event-response-card" key={response.eventName}>
          <h3>{response.eventName}</h3>
          <EntityResponseList title="Most affected" items={response.mostAffected} />
          <EntityResponseList title="Least affected" items={response.leastAffected} />
        </article>
      ))}
    </div>
  );
}

function EntityResponseList({
  title,
  items,
}: {
  title: string;
  items: EventResponseSummary['mostAffected'];
}) {
  return (
    <div className="response-list">
      <h4>{title}</h4>
      {items.map((item) => (
        <div className="response-item" key={`${title}-${item.entityName}`}>
          <div>
            <strong>{item.entityName}</strong>
            <p>{item.reason}</p>
          </div>
          <span>{item.effectScore.toFixed(0)}</span>
        </div>
      ))}
    </div>
  );
}
