import { getActiveBaselineVersion } from '../model';

type GameHeaderProps = {
  selectedYear: number;
  maxYear: number;
  hasPendingChanges: boolean;
  activeSection: string;
  showGeneralActions: boolean;
  onSectionChange: (section: string) => void;
  onEndYear: () => void;
};

const NAV_ITEMS = [
  'Problems to solve',
  'Australia today',
  'Current path',
  'Policies',
  'My scenarios',
  'How the model works',
];

export function GameHeader({
  selectedYear,
  maxYear,
  hasPendingChanges,
  activeSection,
  showGeneralActions,
  onSectionChange,
  onEndYear,
}: GameHeaderProps) {
  const baselineVersion = getActiveBaselineVersion();
  const calendarYear = baselineVersion.referenceYear + selectedYear - 1;

  return (
    <header className={showGeneralActions ? 'game-header' : 'game-header game-header--navigation'}>
      <div className="game-brand">
        <div className="game-flag" aria-hidden="true">
          <span>🇦🇺</span>
          <strong>◆</strong>
        </div>
        <div>
          <h1>Australia Policy Simulator</h1>
        </div>
      </div>

      <nav className="game-nav" aria-label="Simulation sections">
        {NAV_ITEMS.map((item) => (
          <button
            className={activeSection === item ? 'is-active' : ''}
            aria-current={activeSection === item ? 'page' : undefined}
            key={item}
            type="button"
            onClick={() => onSectionChange(item)}
          >
            <span aria-hidden="true">{navIcon(item)}</span>
            {item === 'Policies' ? 'Immigration lab' : item}
          </button>
        ))}
      </nav>

      {showGeneralActions && (
        <div className="game-turn-actions">
          <div className="game-year-card">
            <strong>Australian baseline v1.0 · {calendarYear}</strong>
            <span>General model turn {selectedYear} of {maxYear}</span>
          </div>
          <button className="game-end-year-button" type="button" onClick={onEndYear}>
            Apply policy <span aria-hidden="true">›</span>
          </button>
          <small className={hasPendingChanges ? 'is-pending' : ''}>
            {hasPendingChanges ? 'Pending agenda' : 'Enacted results'}
          </small>
        </div>
      )}
    </header>
  );
}

function navIcon(item: string) {
  const icons: Record<string, string> = {
    'Australia today': '⌂',
    'Current path': '↗',
    'Problems to solve': '◇',
    Policies: '⇄',
    'My scenarios': '◫',
    'How the model works': '⚙',
  };

  return icons[item] ?? '•';
}
