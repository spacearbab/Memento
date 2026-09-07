import './BackButton.css';

export default function BackButton({ onClick, label = 'Back' }) {
  return (
    <button type="button" className="back-button" onClick={onClick} aria-label={label}>
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <path
          d="M15 5l-7 7 7 7"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span>{label}</span>
    </button>
  );
}
