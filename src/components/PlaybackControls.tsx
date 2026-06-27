export function PlaybackControls({
  hasStarted,
  isPlaying,
  maxYear,
  selectedYear,
  onStart,
  onPlayPause,
  onStepBack,
  onStepForward,
  onYearChange,
}: {
  hasStarted: boolean;
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
      <h2>2. Run And Review</h2>
      <div className="playback-panel">
        <div className="playback-actions">
          <button className="primary-action" type="button" onClick={onStart}>
            Start Simulation
          </button>
          <button type="button" onClick={onPlayPause} disabled={!hasStarted}>
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
              {hasStarted
                ? 'Started simulation: reviewing stored yearly results'
                : 'Preview only: sliders and events are not locked until Start Simulation'}
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
