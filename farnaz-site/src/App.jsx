import { useCallback, useEffect, useState } from 'react';
import MoltenMetal from './components/MoltenMetal.jsx';
import LoadingScreen from './components/LoadingScreen.jsx';
import Intro from './pages/Intro.jsx';
import ArtistSelect from './pages/ArtistSelect.jsx';
import ArtistGallery from './pages/ArtistGallery.jsx';
import SorrySurprise from './pages/SorrySurprise.jsx';
import useImagePreload from './hooks/useImagePreload.js';
import { artists } from './data/artists.js';
import './App.css';

const INTRO_SESSION_KEY = 'farnaz-intro-seen';
const ASPECT_STORAGE_KEY = 'farnaz-frame-aspect';
const THEME_STORAGE_KEY = 'farnaz-bg-theme';

const BANNER_URLS = artists.map(a => a.banner);

// Four background moods, cycled through by the toggle: two dark (violet and
// the Farnaz green) and two light (white bases with a violet or green
// accent).
//
// Important: MoltenMetal's shader ties its alpha to intensity itself, so
// `color1` (the "resting"/low-intensity tone) renders almost fully
// transparent rather than as an opaque fill — the plain CSS background
// behind the canvas is what actually dominates the screen. So making a
// theme read as genuinely light isn't just a color1 change here; `lightness`
// below also switches the site's whole `--bg`/text/glass token set (see
// index.css) so the backdrop MoltenMetal reveals, and everything drawn on
// top of it, actually match.
//
// For the light themes specifically, `color2` is deliberately near-black
// rather than another pale tone — pale-on-white swirls have almost no
// visible contrast (that's the "the halos are barely there" problem). A
// dark swirl with a vivid accent hot-point reads clearly on white, like ink
// on paper, the same way the accent already reads clearly on black.
//
// `popColor` is the *opposite* brand color from the theme's own hue, used
// for secondary "eyebrow" labels (artist movement/era, etc.) so both of
// Farnaz's colors always show up somewhere regardless of which theme is
// active — picked per-theme (not just per-hue) so it also has real contrast
// against that theme's own background lightness. `popShadow` is the same
// color as a ready-to-use box-shadow rgba (for the Continue button's glow).
//
// `glow` is different: it's the theme's *own* hue (violet themes get a
// violet card halo, green themes a green one), used as a very soft
// box-shadow around glass panels so the cards themselves feel tied to
// whichever theme is active, in both the dark and light variant of that hue.
// `hueAccent` is the theme's own vivid hue (the bright violet/green already
// used as color2 on dark themes or color3 on light themes) — added here as
// its own field so anything that wants "this theme's own color, as a plain
// hex" (e.g. the wax-seal finale's Continue button) doesn't have to guess
// which of color2/color3 is the vivid one for a given lightness.
const THEMES = {
  blackViolet: {
    lightness: 'dark',
    color1: '#312859',
    color2: '#FF9FFC',
    color3: '#FFFFFF',
    hueAccent: '#FF9FFC',
    popColor: '#99C224',
    popShadow: 'rgba(153, 194, 36, 0.35)',
    glow: 'rgba(122, 86, 255, 0.22)'
  },
  blackGreen: {
    lightness: 'dark',
    color1: '#12231f',
    color2: '#99C224',
    color3: '#FFFFFF',
    hueAccent: '#99C224',
    popColor: '#B9A4FF',
    popShadow: 'rgba(185, 164, 255, 0.35)',
    glow: 'rgba(153, 194, 36, 0.2)'
  },
  whiteViolet: {
    lightness: 'light',
    color1: '#F5F2FF',
    color2: '#18101f',
    color3: '#7A56FF',
    hueAccent: '#7A56FF',
    popColor: '#5C7A1E',
    popShadow: 'rgba(92, 122, 30, 0.28)',
    glow: 'rgba(122, 86, 255, 0.18)'
  },
  whiteGreen: {
    lightness: 'light',
    color1: '#F6F9EF',
    color2: '#10160a',
    color3: '#7CA023',
    hueAccent: '#7CA023',
    popColor: '#5A34D6',
    popShadow: 'rgba(90, 52, 214, 0.24)',
    glow: 'rgba(124, 160, 35, 0.2)'
  }
};
const THEME_ORDER = ['blackViolet', 'blackGreen', 'whiteViolet', 'whiteGreen'];

// Both lightness modes now share the same richer detail/glow/core-size —
// the light themes originally got these turned up on their own (the same
// settings read as sparse on white), but the dark themes read exactly as
// sparse once you'd seen the light ones side by side, so the same density
// bump applies to both. `blackPoint` and `brightness` stay per-lightness:
// those are genuinely about contrast against a black vs. a white backdrop,
// not about how much pattern detail is showing.
const MOLTEN_TUNING = {
  dark: { detail: 5, glow: 2.3, coreSize: 0.17, blackPoint: 0.06, brightness: 1.15 },
  light: { detail: 5, glow: 2.3, coreSize: 0.17, blackPoint: 0.015, brightness: 1.4 }
};

export default function App() {
  // Preloads the 10 picker thumbnails before anything (intro included) is
  // shown, so the very first thing the person sees never has images popping
  // in mid-scroll.
  const { progress: homeProgress } = useImagePreload(BANNER_URLS);

  const [introDone, setIntroDone] = useState(() => {
    try {
      return sessionStorage.getItem(INTRO_SESSION_KEY) === '1';
    } catch {
      return false;
    }
  });
  const [view, setView] = useState('select'); // 'select' | 'gallery' | 'surprise'
  const [artistId, setArtistId] = useState(null);
  // Remembered even while on the select screen, so returning from a gallery
  // re-centers the picker on whichever artist was open, not the first one.
  const [lastArtistId, setLastArtistId] = useState(null);
  const [fullscreen, setFullscreen] = useState(false);
  // 'rectangle' (default, current wide framing) or 'square' (matches the
  // actual 1:1 source images with no cropping). Set from either page,
  // remembered across visits, applied live to the 8-image gallery.
  const [aspectMode, setAspectMode] = useState(() => {
    try {
      return localStorage.getItem(ASPECT_STORAGE_KEY) === 'square' ? 'square' : 'rectangle';
    } catch {
      return 'rectangle';
    }
  });

  const changeAspectMode = useCallback(mode => {
    setAspectMode(mode);
    try {
      localStorage.setItem(ASPECT_STORAGE_KEY, mode);
    } catch {
      // Storage may be unavailable — the choice just won't persist, which is fine.
    }
  }, []);

  // The background theme — persisted, and applied live (MoltenMetal reads
  // its color props on every render and pushes them straight into the
  // already-running WebGL uniforms, so this never needs a remount/reload).
  const [themeMode, setThemeMode] = useState(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      return THEME_ORDER.includes(saved) ? saved : 'blackViolet';
    } catch {
      return 'blackViolet';
    }
  });

  const cycleTheme = useCallback(() => {
    setThemeMode(prev => {
      const idx = THEME_ORDER.indexOf(prev);
      const next = THEME_ORDER[(idx + 1) % THEME_ORDER.length];
      try {
        localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch {
        // Storage may be unavailable — the choice just won't persist, which is fine.
      }
      return next;
    });
  }, []);

  const theme = THEMES[themeMode];
  const moltenTuning = MOLTEN_TUNING[theme.lightness];

  // Establish the base history entry once, so the very first back-press from
  // the gallery view lands here instead of leaving the app.
  useEffect(() => {
    window.history.replaceState({ view: 'select' }, '', window.location.pathname);

    const onPopState = event => {
      const state = event.state;
      if (state && state.view === 'gallery' && state.artistId) {
        setArtistId(state.artistId);
        setView('gallery');
        setFullscreen(Boolean(state.fullscreen));
      } else if (state && state.view === 'surprise') {
        setView('surprise');
        setArtistId(null);
        setFullscreen(false);
      } else {
        setView('select');
        setArtistId(null);
        setFullscreen(false);
      }
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const openArtist = useCallback(id => {
    setArtistId(id);
    setLastArtistId(id);
    setView('gallery');
    setFullscreen(false);
    window.history.pushState({ view: 'gallery', artistId: id, fullscreen: false }, '', `#artist-${id}`);
  }, []);

  // A little standalone surprise, reachable from the picker header — its own
  // history step so the hardware/in-app back control (goBack, below) simply
  // lands back on the picker, same as everything else here.
  const openSurprise = useCallback(() => {
    setView('surprise');
    window.history.pushState({ view: 'surprise' }, '', '#surprise');
  }, []);

  // Fullscreen is its own history step, so a back-press while fullscreen only
  // collapses the image back into the framed gallery instead of jumping all
  // the way out to the artist picker.
  const enterFullscreen = useCallback(() => {
    setFullscreen(true);
    window.history.pushState({ view: 'gallery', artistId, fullscreen: true }, '', `#artist-${artistId}-full`);
  }, [artistId]);

  // Goes through the real history stack (rather than just flipping state) so
  // a hardware/software back-button press and any in-app "back"/"collapse"
  // control behave identically — both simply move one step back.
  const goBack = useCallback(() => {
    window.history.back();
  }, []);

  const activeArtist = artists.find(a => a.id === artistId) || null;

  const completeIntro = useCallback(() => {
    try {
      sessionStorage.setItem(INTRO_SESSION_KEY, '1');
    } catch {
      // Storage may be unavailable (private mode, etc.) — just proceed in
      // memory; the intro will simply replay next visit, which is fine.
    }
    setIntroDone(true);
  }, []);

  // Lets the picker screen jump back to the presentation (the intro story +
  // wax-seal finale) on demand. Intro owns its own step/language/finale
  // state internally and starts fresh on every mount, so simply unmounting
  // it (by flipping this back to false) is enough — no extra state to reset
  // here beyond that.
  const replayIntro = useCallback(() => {
    setIntroDone(false);
  }, []);

  return (
    <div
      className="app-shell"
      data-lightness={theme.lightness}
      style={{ '--accent-pop': theme.popColor, '--accent-pop-shadow': theme.popShadow, '--theme-glow': theme.glow }}
    >
      <div className="app-bg" aria-hidden="true">
        <MoltenMetal
          color1={theme.color1}
          color2={theme.color2}
          color3={theme.color3}
          speed={0.5}
          scale={4}
          detail={moltenTuning.detail}
          glow={moltenTuning.glow}
          coreSize={moltenTuning.coreSize}
          swirl={1}
          fold={-0.21}
          blackPoint={moltenTuning.blackPoint}
          brightness={moltenTuning.brightness}
          colorMode="molten"
          grain
          grainIntensity={0.05}
          mouseInteraction
          mouseStrength={0.25}
          opacity={0.9}
        />
        <div className="app-bg-veil" />
      </div>

      {!introDone && (
        <Intro
          onComplete={completeIntro}
          themeMode={themeMode}
          onCycleTheme={cycleTheme}
          sealColor={theme.popColor}
          buttonColor={theme.hueAccent}
        />
      )}

      {introDone && view === 'select' && (
        <ArtistSelect
          onSelectArtist={openArtist}
          initialArtistId={lastArtistId}
          themeMode={themeMode}
          onCycleTheme={cycleTheme}
          lightness={theme.lightness}
          onReplayIntro={replayIntro}
          onOpenSurprise={openSurprise}
        />
      )}
      {introDone && view === 'surprise' && <SorrySurprise onBack={goBack} />}
      {introDone && view === 'gallery' && activeArtist && (
        <ArtistGallery
          artist={activeArtist}
          fullscreen={fullscreen}
          onBack={goBack}
          onEnterFullscreen={enterFullscreen}
          onExitFullscreen={goBack}
          aspectMode={aspectMode}
          onChangeAspectMode={changeAspectMode}
          themeMode={themeMode}
          onCycleTheme={cycleTheme}
        />
      )}

      {/* Overlays whatever mounted above and swipes away once the home
          picker's thumbnails are actually loaded — the real content is
          already there underneath the moment it's revealed. */}
      <LoadingScreen progress={homeProgress} label="preparing the gallery" />
    </div>
  );
}
