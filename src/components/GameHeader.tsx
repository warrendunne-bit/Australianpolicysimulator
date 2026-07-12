type GameHeaderProps = {
  selectedYear: number;
  maxYear: number;
  hasPendingChanges: boolean;
  activeSection: string;
  onSectionChange: (section: string) => void;
  onEndYear: () => void;
};

const NAV_ITEMS = [
  'Australia today',
  'Current path',
  'Problems to solve',
  'Policies',
  'My scenarios',
  'How the model works',
];

export function GameHeader({
  selectedYear,
  maxYear,
  hasPendingChanges,
  activeSection,
  onSectionChange,
  onEndYear,
}: GameHeaderProps) {
  const calendarYear = 2020 + selectedYear - 1;

  return (
    <header className="game-header">
      <div className="game-brand">
        <div className="game-flag" aria-hidden="true">
          <span>🇦🇺</span>
          <strong>◆</strong>
        </div>
        <div>
          <h1>Australia Policy Simulator</h1>
          <p>Understand the path. Test choices. Watch outcomes.</p>
        </div>
      </div>

      <nav className="game-nav" aria-label="Simulation sections">
        {NAV_ITEMS.map((item) => (
          <button
            className={activeSection === item ? 'is-active' : ''}
            key={item}
            type="button"
            onClick={() => onSectionChange(item)}
          >
            <span aria-hidden="true">{navIcon(item)}</span>
            {item}
          </button>
        ))}
      </nav>

      <div className="game-turn-actions">
        <div className="game-year-card">
          <strong>Baseline year {calendarYear}</strong>
          <span>General model turn {selectedYear} of {maxYear}</span>
        </div>
        <button className="game-end-year-button" type="button" onClick={onEndYear}>
          Apply policy <span aria-hidden="true">›</span>
        </button>
        <small className={hasPendingChanges ? 'is-pending' : ''}>
          {hasPendingChanges ? 'Pending agenda' : 'Enacted results'}
        </small>
      </div>
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
