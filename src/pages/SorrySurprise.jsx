import { useEffect, useMemo, useRef, useState } from 'react';
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

// A random speck: its own position, radius, drift velocity, and its own
// fade-in/hold/fade-out timer (`life`/`age`). Nothing here is shared or
// synced between specks — that's the whole point. A CSS background pattern
// (even one animated with several offset layers) is still fundamentally a
// repeating tile translating along a path, which reads as "a pattern
// sliding" the moment you look closely. Actual TV-static/dust has no tile:
// every speck is independently alive, flickering and drifting on its own
// clock, which is only really achievable by simulating each one and
// redrawing every frame — hence canvas + rAF rather than CSS here.
function spawnParticle(width, height) {
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    r: 0.55 + Math.random() * 1.15,
    // Slow, gentle drift — Telegram's own specks barely travel; it's the
    // flicker (age/life below) that reads as "alive", not fast movement.
    vx: (Math.random() - 0.5) * 9,
    vy: (Math.random() - 0.5) * 9,
    age: Math.random(),
    life: 0.5 + Math.random() * 1.1
  };
}

// The animated dust layer itself, sized to exactly cover whatever it's
// absolutely-positioned inside of (see .spoiler-noise-canvas in
// SorrySurprise.css). Reads its dot color live from the --text-dim custom
// property already set on the page, rather than a color baked in here, so
// it still matches whichever of the site's 4 themes is currently active.
function SpoilerNoise({ active }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !active) return undefined;

    const ctx = canvas.getContext('2d');
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width = 0;
    let height = 0;
    let particles = [];
    let raf = 0;
    let lastTime = performance.now();

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Density tuned for a single line of text-sized text — enough specks
      // to read as a full field of static, not so many it looks solid.
      const count = Math.max(16, Math.round(width * height * 0.02));
      particles = Array.from({ length: count }, () => spawnParticle(width, height));
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const draw = () => {
      const dotColor = getComputedStyle(canvas).getPropertyValue('--text-dim').trim() || 'currentColor';
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = dotColor;

      for (const p of particles) {
        // Fade in over the first quarter of its life, hold, fade out over
        // the last 30% — an uneven flicker curve rather than a hard blink.
        let alpha;
        if (p.age < 0.25) alpha = p.age / 0.25;
        else if (p.age > 0.7) alpha = Math.max(0, (1 - p.age) / 0.3);
        else alpha = 1;

        ctx.globalAlpha = alpha * 0.85;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    const tick = now => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      for (let i = 0; i < particles.length; i += 1) {
        const p = particles[i];
        p.age += dt / p.life;
        p.x += p.vx * dt;
        p.y += p.vy * dt;

        // Wrap rather than clamp/bounce, so drift never visibly "hits a
        // wall" and reverses in an obviously mechanical way.
        if (p.x < -2) p.x = width + 2;
        else if (p.x > width + 2) p.x = -2;
        if (p.y < -2) p.y = height + 2;
        else if (p.y > height + 2) p.y = -2;

        if (p.age >= 1) particles[i] = spawnParticle(width, height);
      }

      draw();
      if (!prefersReducedMotion) raf = requestAnimationFrame(tick);
    };

    // Even with reduced motion, one static frame of dust still renders —
    // it just doesn't animate — rather than showing nothing at all.
    draw();
    if (!prefersReducedMotion) raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [active]);

  return <canvas ref={canvasRef} className="spoiler-noise-canvas" aria-hidden="true" />;
}

// A tap-to-reveal spoiler, styled after Telegram's message spoilers: the
// text sits underneath an animated dust of static (see SpoilerNoise above)
// and is fully hidden (color: transparent, not just blurred) until tapped,
// at which point the dust fades out and the real text fades in. One-way
// reveal, same as Telegram — tapping again doesn't re-hide it.
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
      <SpoilerNoise active={!revealed} />
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
