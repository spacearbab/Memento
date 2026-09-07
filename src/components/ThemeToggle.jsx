import './ThemeToggle.css';

// Cycles through 4 background themes. The button's own fill is entirely the
// preview swatch — it always shows the theme you'd get by clicking, not the
// one you're currently on.
const ORDER = ['blackViolet', 'blackGreen', 'whiteViolet', 'whiteGreen'];

const PREVIEWS = {
  blackViolet: ['#312859', '#FF9FFC'],
  blackGreen: ['#12231f', '#99C224'],
  whiteViolet: ['#F5F2FF', '#7A56FF'],
  whiteGreen: ['#F6F9EF', '#99C224']
};

const LABELS = {
  blackViolet: 'black & violet',
  blackGreen: 'black & green',
  whiteViolet: 'white & violet',
  whiteGreen: 'white & green'
};

export default function ThemeToggle({ themeMode, onCycle }) {
  const currentIndex = Math.max(0, ORDER.indexOf(themeMode));
  const nextMode = ORDER[(currentIndex + 1) % ORDER.length];
  const [a, b] = PREVIEWS[nextMode];

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={onCycle}
      aria-label={`Switch background to the ${LABELS[nextMode]} theme`}
      title={`Switch to ${LABELS[nextMode]}`}
      style={{ background: `linear-gradient(135deg, ${a} 0%, ${b} 100%)` }}
    />
  );
}
