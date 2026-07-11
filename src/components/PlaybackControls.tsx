export function PlaybackControls({
  hasPendingChanges,
  isPlaying,
  maxYear,
  selectedYear,
  onStart,
  onPlayPause,
  onStepBack,
  onStepForward,
  onYearChange,
}: {
  hasPendingChanges: boolean;
  isPlaying: boolean;
  maxYear: number;
  selectedYear: number;
  onStart: () => void;
  onPlayPause: () => void;
  onStepBack: () => void;
  onStepForward: () => void;
  onYearChange: (year: number) => void;
}) {
  return (
    <section className="section-block">
      <h2>Annual Turn Controls</h2>
      <div className="playback-panel">
        <div className="turn-status-card">
          <span>Current governing phase</span>
          <strong>{hasPendingChanges ? 'Decisions pending approval' : 'Reviewing enacted year'}</strong>
          <p>
            {hasPendingChanges
              ? 'Policy changes are drafted but have not affected national outcomes yet.'
              : 'Reports are showing the most recently enacted national results.'}
          </p>
        </div>
        <div className="playback-actions">
          <button className="primary-action" type="button" onClick={onStart}>
            End Year
          </button>
          <button type="button" onClick={onPlayPause}>
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          <button type="button" onClick={onStepBack} disabled={selectedYear <= 1}>
            Step Back
          </button>
          <button type="button" onClick={onStepForward} disabled={selectedYear >= maxYear}>
            Step Forward
          </button>
        </div>
        <label className="year-slider">
          <span>
            <strong>Year {selectedYear}</strong>
            <small>
              {hasPendingChanges
                ? 'Pending decisions will apply after End Year'
                : 'Reviewing stored yearly results'}
            </small>
          </span>
          <input
            type="range"
            min={1}
            max={maxYear}
            step={1}
            value={selectedYear}
            onChange={(event) => onYearChange(Number(event.target.value))}
          />
        </label>
      </div>
    </section>
  );
}
