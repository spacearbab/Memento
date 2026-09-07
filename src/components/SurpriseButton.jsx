import './SurpriseButton.css';

// Sits right next to ReplayIntroButton in the header cluster — same size and
// glass styling as its neighbors so it reads as one more control in the row,
// with just a soft pulse to hint there's something worth clicking here.
export default function SurpriseButton({ onClick }) {
  return (
    <button
      type="button"
      className="surprise-button"
      onClick={onClick}
      aria-label="Surprise"
      title="Surprise"
    >
      <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
        <line x1="12" y1="5.5" x2="12" y2="13.5" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
        <circle cx="12" cy="18" r="1.35" fill="currentColor" />
      </svg>
    </button>
  );
}
