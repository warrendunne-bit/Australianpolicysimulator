type GameHeaderProps = {
  selectedYear: number;
  maxYear: number;
  hasPendingChanges: boolean;
  activeSection: string;
  onSectionChange: (section: string) => void;
  onEndYear: () => void;
};

const NAV_ITEMS = ['Dashboard', 'Immigration', 'Policies', 'Budget', 'Reports', 'Map', 'Events', 'Settings'];

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
          <p>Make better decisions. Shape our future.</p>
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
          <strong>Year {calendarYear}</strong>
          <span>Turn {selectedYear} of {maxYear}</span>
        </div>
        <button className="game-end-year-button" type="button" onClick={onEndYear}>
          End Year <span aria-hidden="true">›</span>
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
    Dashboard: '⌂',
    Immigration: '⇄',
    Policies: '▣',
    Budget: '$',
    Reports: '◫',
    Map: '⌖',
    Events: '◷',
    Settings: '⚙',
  };

  return icons[item] ?? '•';
}
