import './ReplayIntroButton.css';

// A small, self-contained way back into the presentation (the intro story +
// wax-seal finale) from the artist picker — deliberately sized and styled
// like ThemeToggle right next to it, so it reads as one more control in the
// same cluster rather than a new element that unbalances the header.
export default function ReplayIntroButton({ onClick }) {
  return (
    <button
      type="button"
      className="replay-intro-button"
      onClick={onClick}
      aria-label="Watch the intro again"
      title="Watch the intro again"
    >
      <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
        <path
          d="M4 4v5h5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M4.6 15a8 8 0 1 0 1.7-8.5L4 9"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
