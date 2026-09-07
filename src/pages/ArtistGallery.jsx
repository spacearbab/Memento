import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import MorphSlider from '../components/MorphSlider.jsx';
import BackButton from '../components/BackButton.jsx';
import LoadingScreen from '../components/LoadingScreen.jsx';
import AspectToggle from '../components/AspectToggle.jsx';
import ThemeToggle from '../components/ThemeToggle.jsx';
import useIsMobile from '../hooks/useIsMobile.js';
import useSquareFit from '../hooks/useSquareFit.js';
import useImagePreload from '../hooks/useImagePreload.js';
import { artistImages } from '../data/artists.js';
import './ArtistGallery.css';

// Taps/clicks on interactive children (prev/next arrows, indicator dots, the
// fullscreen chrome chips) must never also toggle fullscreen or its chrome.
const IGNORE_SELECTOR = '.morph-slider-btn, .morph-slider-dot, .gallery-chrome';

const AUTO_HIDE_MS = 2600;
const AUTOPLAY_IDLE_MS = 3200; // how long to wait, untouched, before autoplay kicks in
const AUTOPLAY_INTERVAL_MS = 4200; // time between automatic slide changes once it's running

export default function ArtistGallery({
  artist,
  fullscreen,
  onBack,
  onEnterFullscreen,
  onExitFullscreen,
  aspectMode,
  onChangeAspectMode,
  themeMode,
  onCycleTheme
}) {
  const isMobile = useIsMobile();
  const isSquare = aspectMode === 'square';

  // Images only — no per-item caption. Framed mode shows a "n / 8" position
  // and fullscreen shows the artist's tagline, and those need to differ
  // without ever changing this array's reference (a new `items` reference
  // would tear down and rebuild the whole WebGL engine, losing the current
  // slide — see MorphSlider's own effect). So captions are rendered by us,
  // outside MorphSlider, driven by the index it reports back via
  // onIndexChange, while MorphSlider's own built-in caption stays off.
  const imageUrls = useMemo(() => artistImages(artist.id), [artist.id]);
  const items = useMemo(() => imageUrls.map(image => ({ image })), [imageUrls]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const sliderRef = useRef(null);

  // A short, real (not fake-timed) load gate for this artist's 8 images, so
  // the slider never appears mid-pop-in.
  const { progress: loadProgress } = useImagePreload(imageUrls);

  // In square mode, the frame becomes exactly as tall as it is wide — the
  // real source images are 1:1, so this shows them with no cropping at all.
  // Sized by measuring the available space live (a pure-CSS aspect-ratio
  // can't reliably fit "the largest square that fits" against two competing
  // constraints at once), so it works the same whether framed or fullscreen.
  const [viewportRef, squareSize] = useSquareFit(isSquare);

  // Fullscreen-only idle autoplay: manual drag/tap always takes priority —
  // any interaction stops it instantly — and it quietly resumes a few
  // seconds after the user stops touching the screen. MorphSlider's own
  // built-in `autoplay` prop pauses on hover, which in fullscreen would
  // never really release (the cursor sits over the whole viewport), so this
  // drives it externally via the imperative next() handle instead.
  const idleTimerRef = useRef(null);
  const autoplayIntervalRef = useRef(null);

  const stopAutoplay = useCallback(() => {
    if (autoplayIntervalRef.current) {
      clearInterval(autoplayIntervalRef.current);
      autoplayIntervalRef.current = null;
    }
  }, []);

  const startAutoplay = useCallback(() => {
    stopAutoplay();
    autoplayIntervalRef.current = setInterval(() => {
      sliderRef.current?.next();
    }, AUTOPLAY_INTERVAL_MS);
  }, [stopAutoplay]);

  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
    stopAutoplay();
    if (fullscreen) {
      idleTimerRef.current = setTimeout(startAutoplay, AUTOPLAY_IDLE_MS);
    }
  }, [fullscreen, stopAutoplay, startAutoplay]);

  useEffect(() => {
    resetIdleTimer();
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      stopAutoplay();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullscreen]);

  // Fullscreen chrome (back chip, artist chip, caption, arrows, dots) floats
  // directly on top of the artwork, so it auto-hides after a short idle
  // period and reappears on tap. The framed view's header sits in its own
  // row above the image instead, so it never needs to hide.
  const [chromeVisible, setChromeVisible] = useState(true);
  const hideTimerRef = useRef(null);

  const clearHideTimer = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  const showChrome = useCallback(() => {
    setChromeVisible(true);
    clearHideTimer();
    if (fullscreen) {
      hideTimerRef.current = setTimeout(() => setChromeVisible(false), AUTO_HIDE_MS);
    }
  }, [fullscreen, clearHideTimer]);

  useEffect(() => {
    showChrome();
    return clearHideTimer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullscreen]);

  useEffect(() => {
    const onKeyDown = e => {
      if (e.key === 'Escape') {
        if (fullscreen) onExitFullscreen();
        else onBack();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [fullscreen, onBack, onExitFullscreen]);

  // MorphSlider already tells drags apart from taps internally for its own
  // dragging logic, but doesn't expose that — so this wrapper does its own
  // light tap-vs-drag check before deciding what a tap should do.
  const pointerStart = useRef(null);

  const onPointerDown = useCallback(
    e => {
      pointerStart.current = { x: e.clientX, y: e.clientY, t: Date.now() };
      resetIdleTimer();
    },
    [resetIdleTimer]
  );

  const onPointerUp = useCallback(
    e => {
      const start = pointerStart.current;
      pointerStart.current = null;
      if (!start) return;
      if (e.target.closest && e.target.closest(IGNORE_SELECTOR)) return;
      const dx = Math.abs(e.clientX - start.x);
      const dy = Math.abs(e.clientY - start.y);
      const dt = Date.now() - start.t;
      if (dx >= 8 || dy >= 8 || dt >= 500) return; // was a swipe, not a tap

      if (!fullscreen) {
        onEnterFullscreen();
        return;
      }
      // In fullscreen, a tap first reveals hidden chrome; only once it's
      // already visible does tapping the image collapse back out.
      if (!chromeVisible) showChrome();
      else onExitFullscreen();
    },
    [fullscreen, chromeVisible, showChrome, onEnterFullscreen, onExitFullscreen]
  );

  const ambientUrl = fullscreen && isSquare ? items[currentIndex]?.image : null;

  return (
    <div className="artist-gallery">
      {!fullscreen && (
        <div className="gallery-header">
          <BackButton onClick={onBack} label="Back" />
          <div className="gallery-heading">
            <div className="gallery-heading-name">{artist.name}</div>
            <div className="gallery-heading-meta">
              {artist.movement} · {artist.era}
            </div>
          </div>
          <div className="gallery-header-controls">
            <ThemeToggle themeMode={themeMode} onCycle={onCycleTheme} />
            <AspectToggle aspectMode={aspectMode} onChangeAspectMode={onChangeAspectMode} />
          </div>
        </div>
      )}

      {/* .slider-viewport just lays out/centers things and (in fullscreen)
          breaks out to cover the whole screen — it never has its own visible
          border/rounding. .slider-frame is the actual visible artwork box;
          it's the thing that becomes a measured square, and the only thing
          the tap-to-fullscreen / tap-vs-drag logic listens on, so tapping
          empty letterboxed space around a centered square never toggles
          anything. The chrome chips live in the viewport (always pinned to
          the screen's corners); the caption lives in the frame (follows the
          artwork itself, whatever size it currently is). */}
      <div
        ref={viewportRef}
        className={`slider-viewport ${fullscreen ? 'is-fullscreen' : ''} ${chromeVisible ? '' : 'chrome-hidden'}`}
      >
        {/* Fullscreen + square only: instead of the site's normal background
            showing in the letterboxed margins around the (now smaller,
            centered) square, blur/darken/glass the current artwork itself
            to fill that space — an ambient backdrop that belongs to the
            piece being viewed, the way some photo/video players do it. */}
        {ambientUrl && (
          <div
            className="ambient-backdrop"
            aria-hidden="true"
            style={{ backgroundImage: `url(${ambientUrl})` }}
          />
        )}

        {fullscreen && (
          <div className="gallery-chrome">
            <BackButton onClick={onBack} label="Artists" />
            <div className="artist-chip">
              <div className="artist-chip-name">{artist.name}</div>
              <div className="artist-chip-meta">
                {artist.movement} · {artist.era}
              </div>
            </div>
          </div>
        )}

        <div
          className={`slider-frame ${isSquare ? 'is-square' : ''} ${
            fullscreen && !isSquare ? 'is-fullscreen-bleed' : ''
          }`}
          style={squareSize ? { width: `${squareSize}px`, height: `${squareSize}px` } : undefined}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
        >
          <div className={`custom-caption ${fullscreen ? 'is-tagline' : 'is-count'}`}>
            {fullscreen ? artist.tagline : `${currentIndex + 1} / ${items.length}`}
          </div>

          <MorphSlider
            ref={sliderRef}
            items={items}
            transition="melt"
            intensity={0.1}
            aberration={0.7}
            drift={1.5}
            autoplay={false}
            overlayColor="#05060a"
            duration={1.4}
            ease="power2.inOut"
            scale={isMobile ? 4.5 : 6}
            autoplayDelay={4}
            loop
            radius={fullscreen && !isSquare ? 0 : isMobile ? 20 : 30}
            showCaptions={false}
            showControls
            showIndicators
            onIndexChange={setCurrentIndex}
          />
        </div>
      </div>

      {/* Overlays the gallery above and swipes away once this artist's 8
          images are actually loaded. Keyed by artist id so opening a
          different artist gets its own fresh loading run instead of
          reusing an already-finished (and thus invisible) overlay. */}
      <LoadingScreen key={artist.id} progress={loadProgress} label={artist.name} />
    </div>
  );
}
