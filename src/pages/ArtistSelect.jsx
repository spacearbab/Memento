import { useMemo, useState } from 'react';
import CircularGallery from '../components/CircularGallery.jsx';
import ThemeToggle from '../components/ThemeToggle.jsx';
import ReplayIntroButton from '../components/ReplayIntroButton.jsx';
import SurpriseButton from '../components/SurpriseButton.jsx';
import { DoodleHeart, DoodleSquiggle, DoodleStar } from '../components/Doodles.jsx';
import useIsMobile from '../hooks/useIsMobile.js';
import { artists } from '../data/artists.js';
import './ArtistSelect.css';

export default function ArtistSelect({
  onSelectArtist,
  initialArtistId,
  themeMode,
  onCycleTheme,
  lightness,
  onReplayIntro,
  onOpenSurprise
}) {
  const initialIndex = Math.max(
    0,
    artists.findIndex(a => a.id === initialArtistId)
  );
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const activeArtist = artists[activeIndex] ?? artists[0];
  const isMobile = useIsMobile();

  const galleryItems = useMemo(() => artists.map(a => ({ image: a.banner, text: a.name })), []);
  // The artist names are baked into a WebGL canvas texture by CircularGallery
  // itself (not styled DOM text), so they need an explicit color that
  // actually matches the current theme — a fixed white was invisible on the
  // light themes' pale background.
  const galleryTextColor = lightness === 'light' ? '#17130c' : '#f3f1f7';

  return (
    <div className="artist-select">
      <header className="artist-select-header">
        <div className="wordmark-wrap">
          <div className="wordmark">Farnaz Art</div>
          <DoodleSquiggle className="wordmark-squiggle" />
        </div>
        <div className="header-right">
          <div className="header-sub">
            <span>
              Made with <DoodleHeart className="heart" /> by Mojtaba
            </span>
          </div>
          {onReplayIntro && <ReplayIntroButton onClick={onReplayIntro} />}
          {onOpenSurprise && <SurpriseButton onClick={onOpenSurprise} />}
          <ThemeToggle themeMode={themeMode} onCycle={onCycleTheme} />
        </div>
      </header>

      <div className="gallery-frame">
        <CircularGallery
          items={galleryItems}
          bend={isMobile ? 0.6 : 2}
          textColor={galleryTextColor}
          borderRadius={0.14}
          scrollEase={0.075}
          scrollSpeed={isMobile ? 1.6 : 2.4}
          fontUrl="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@1,500&display=swap"
          font={isMobile ? 'italic 24px Fraunces' : 'italic 32px Fraunces'}
          startIndex={initialIndex}
          onActiveIndexChange={setActiveIndex}
          onSelect={index => onSelectArtist(artists[index].id)}
        />
      </div>

      <div className="artist-info" key={activeArtist.id}>
        <div className="artist-info-name">{activeArtist.name}</div>
        <div className="artist-info-eyebrow">
          <DoodleStar className="artist-info-star" size={22} />
          {activeArtist.movement} · {activeArtist.era}
        </div>
        <p className="artist-info-tagline">{activeArtist.tagline}</p>
      </div>

      <div className="artist-dots" role="tablist" aria-label="Artists">
        {artists.map((a, i) => (
          <button
            key={a.id}
            type="button"
            role="tab"
            aria-selected={i === activeIndex}
            aria-label={a.name}
            className={`artist-dot ${i === activeIndex ? 'is-active' : ''}`}
            onClick={() => onSelectArtist(a.id)}
          />
        ))}
      </div>
    </div>
  );
}
