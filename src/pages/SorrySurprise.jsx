import { useEffect, useMemo, useState } from 'react';
import BackButton from '../components/BackButton.jsx';
import { DoodleHeart } from '../components/Doodles.jsx';
import { SORRY_TRANSLATIONS } from '../data/sorryTranslations.js';
import './SorrySurprise.css';

// Local midnight on her birthday, read against whatever clock/timezone the
// visitor's own device reports (new Date()/Date.now() are always local) —
// there's deliberately no UTC conversion here, so the countdown always
// matches the day as it appears on the device it's viewed from.
const BIRTHDAY = new Date(2026, 8, 11, 0, 0, 0);

function getRemaining() {
  const diffMs = BIRTHDAY.getTime() - Date.now();
  const clamped = Math.max(0, diffMs);
  const totalSeconds = Math.floor(clamped / 1000);
  return {
    hours: Math.floor(totalSeconds / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    arrived: diffMs <= 0
  };
}

function pad(n) {
  return String(n).padStart(2, '0');
}

// A tap-to-reveal spoiler, styled after Telegram's message spoilers: the
// text sits underneath a shimmering dot pattern and is fully hidden
// (color: transparent, not just blurred) until tapped, at which point the
// pattern fades out and the real text fades in. One-way reveal, same as
// Telegram — tapping again doesn't re-hide it.
function Spoiler({ children }) {
  const [revealed, setRevealed] = useState(false);
  const reveal = () => setRevealed(true);
  return (
    <span
      className={`spoiler ${revealed ? 'is-revealed' : ''}`}
      role="button"
      tabIndex={0}
      aria-pressed={revealed}
      aria-label={revealed ? undefined : 'Tap to reveal'}
      onClick={reveal}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          reveal();
        }
      }}
    >
      <span className="spoiler-text">{children}</span>
    </span>
  );
}

// The tiled backdrop: "sorry" in as many languages as we have, repeated
// enough times to fill the screen. Built once (useMemo, no dependency on the
// ticking countdown) so the per-second re-render of the timer never
// reshuffles or re-measures this — it's pure decoration.
function SorryWall() {
  const tiles = useMemo(() => {
    const repeated = [];
    // Repeat the whole list several times, in a different shuffled order
    // each pass, so the wall reads as dense and organic rather than an
    // obviously looping sequence.
    for (let pass = 0; pass < 5; pass += 1) {
      const shuffled = [...SORRY_TRANSLATIONS];
      // Deterministic shuffle (no Math.random) so this component is stable
      // across re-renders/strict-mode double-invokes.
      for (let i = shuffled.length - 1; i > 0; i -= 1) {
        const j = (i * 7 + pass * 13) % (i + 1);
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      repeated.push(...shuffled);
    }
    return repeated.map((entry, i) => {
      // A gentle pseudo-random wobble derived from the index alone, so
      // sizes/rotations/opacities vary but never change between renders.
      const wobble = Math.sin(i * 12.9898) * 43758.5453;
      const frac = wobble - Math.floor(wobble);
      const rotate = (frac - 0.5) * 14;
      const scale = 0.78 + frac * 0.5;
      const opacity = 0.16 + frac * 0.22;
      return (
        <span
          key={`${entry.lang}-${i}`}
          className="sorry-wall-word"
          style={{
            transform: `rotate(${rotate.toFixed(2)}deg) scale(${scale.toFixed(2)})`,
            opacity: opacity.toFixed(2)
          }}
        >
          {entry.word}
        </span>
      );
    });
  }, []);

  return (
    <div className="sorry-wall" aria-hidden="true">
      {tiles}
    </div>
  );
}

export default function SorrySurprise({ onBack }) {
  const [remaining, setRemaining] = useState(getRemaining);

  useEffect(() => {
    const id = setInterval(() => setRemaining(getRemaining()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="sorry-surprise">
      <SorryWall />
      <div className="sorry-surprise-veil" aria-hidden="true" />

      <div className="sorry-surprise-topbar">
        <BackButton onClick={onBack} label="Back" />
      </div>

      <div className="sorry-surprise-body">
        <div className="sorry-card" dir="rtl">
          <h1 className="sorry-card-title">
            ببخشید <span className="sorry-smiley">:)</span>
          </h1>

          <p className="sorry-card-text">متاسفم برای رفتارای این چند روزم.</p>
          <p className="sorry-card-text sorry-card-text-strong">
            روز تولدت اینجا برات کادو تولدت رو می‌ذارم <span className="sorry-smiley">:)</span>{' '}
            <Spoiler>
              دوستت دارم <DoodleHeart className="sorry-love-heart" size={16} />
            </Spoiler>
          </p>

          <div className="sorry-countdown" dir="ltr">
            <div className="sorry-countdown-label" dir="rtl">
              {remaining.arrived ? 'تولدت مبارک!' : 'شمارش معکوس تا تولدت'}
            </div>
            <div className="sorry-countdown-units">
              <div className="sorry-countdown-unit">
                <span className="sorry-countdown-value">{pad(remaining.hours)}</span>
                <span className="sorry-countdown-tag">hours</span>
              </div>
              <span className="sorry-countdown-colon">:</span>
              <div className="sorry-countdown-unit">
                <span className="sorry-countdown-value">{pad(remaining.minutes)}</span>
                <span className="sorry-countdown-tag">min</span>
              </div>
              <span className="sorry-countdown-colon">:</span>
              <div className="sorry-countdown-unit">
                <span className="sorry-countdown-value">{pad(remaining.seconds)}</span>
                <span className="sorry-countdown-tag">sec</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
