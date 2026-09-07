import { useEffect, useRef, useState } from 'react';
import './LoadingScreen.css';

// Smoothly animates the *displayed* number toward the real target each
// frame, so it reads as a fluid count even when real progress arrives in
// big, uneven jumps (e.g. only 8 images total). The pace is still entirely
// driven by real load speed — this only smooths how the numbers land,
// it never runs ahead of or independent from what's actually loaded.
function useSmoothed(target) {
  const [value, setValue] = useState(target);
  const raf = useRef(null);

  useEffect(() => {
    const step = () => {
      setValue(v => {
        const next = v + (target - v) * 0.15;
        return Math.abs(target - next) < 0.002 ? target : next;
      });
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [target]);

  return value;
}

// A full-bleed panel that sits on top of the real content (already mounted
// underneath) showing a live percentage as it loads, then swipes itself up
// and out of the way once done — the panel drives its own lifecycle and
// simply stops rendering once the reveal finishes, so a parent only needs
// to keep supplying real `progress` and can otherwise ignore it.
export default function LoadingScreen({ progress, label = 'loading' }) {
  const smoothed = useSmoothed(progress);
  const percent = Math.round(Math.min(1, Math.max(0, smoothed)) * 100);

  const [swiping, setSwiping] = useState(false);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (progress < 1 || swiping) return undefined;
    const t = setTimeout(() => setSwiping(true), 350);
    return () => clearTimeout(t);
  }, [progress, swiping]);

  useEffect(() => {
    if (!swiping) return undefined;
    const t = setTimeout(() => setFinished(true), 750);
    return () => clearTimeout(t);
  }, [swiping]);

  if (finished) return null;

  return (
    <div className={`loading-screen ${swiping ? 'is-swiping' : ''}`} role="status" aria-live="polite" aria-busy={!swiping}>
      <div className="loading-screen-content">
        <span className="loading-count">
          {percent}
          <span className="loading-percent">%</span>
        </span>
        <span className="loading-label">{label}</span>
      </div>
    </div>
  );
}
