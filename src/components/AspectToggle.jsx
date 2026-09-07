import './AspectToggle.css';

export default function AspectToggle({ aspectMode, onChangeAspectMode }) {
  return (
    <div className="aspect-toggle" role="group" aria-label="Photo frame shape">
      <button
        type="button"
        className={`aspect-toggle-btn ${aspectMode === 'rectangle' ? 'is-active' : ''}`}
        aria-pressed={aspectMode === 'rectangle'}
        aria-label="Wide frame"
        title="Wide frame"
        onClick={() => onChangeAspectMode('rectangle')}
      >
        <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
          <rect x="2" y="7" width="20" height="10" rx="2" fill="none" stroke="currentColor" strokeWidth="1.7" />
        </svg>
      </button>
      <button
        type="button"
        className={`aspect-toggle-btn ${aspectMode === 'square' ? 'is-active' : ''}`}
        aria-pressed={aspectMode === 'square'}
        aria-label="Square frame — matches the original images exactly, no cropping"
        title="Square frame (no cropping)"
        onClick={() => onChangeAspectMode('square')}
      >
        <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
          <rect x="4" y="4" width="16" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="1.7" />
        </svg>
      </button>
    </div>
  );
}
