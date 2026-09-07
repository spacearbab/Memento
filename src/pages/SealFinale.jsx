import WaxSeal from '../components/WaxSeal.tsx';
import IsometricButton from '../components/IsometricButton.tsx';
import './SealFinale.css';

// Served from /public/assets/logo — see data/artists.js for why BASE_URL is
// used instead of a hardcoded leading slash (keeps this correct under a
// GitHub Pages project sub-path, same as every other asset in the site).
const SEAL_LOGO = `${import.meta.env.BASE_URL}assets/logo/farnaz-f.png`;

function BackIcon() {
  return (
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
  );
}

// This screen is always English, regardless of which language the rest of
// the intro was read in — there is no translate toggle here on purpose.
//
// `sealColor` / `buttonColor` come from the active background theme (see
// App.jsx's THEMES) — one is the theme's own hue, the other the opposite
// brand color picked for contrast against that theme's background — so the
// wax seal and the Continue button always read clearly against whichever of
// the 4 themes is active, instead of being pinned to one fixed palette.
export default function SealFinale({ onBack, onComplete, sealColor = '#C3E26D', buttonColor = '#A05CFF' }) {
  return (
    <div className="seal-finale" dir="ltr">
      <button type="button" className="seal-back" onClick={onBack} aria-label="Back">
        <BackIcon />
      </button>

      <div className="seal-finale-body">
        <div className="seal-stage">
          <WaxSeal
            waxColor={sealColor}
            logo={SEAL_LOGO}
            logoStyle={{ size: 108, weight: 7 }}
            rings
            ring={{ count: 1, size: 55 }}
            shape={{ wellDepth: 10, rimWidth: 20, edgeWarp: 5, lobes: 7 }}
            replay
            transition={{ type: 'tween', duration: 3, ease: 'easeInOut' }}
          />
        </div>

        {/* The keycap itself is already a fully-styled, self-contained
            control (its own floor glow, prism walls, etc.) — it doesn't need
            (and previously was wrongly given) a second glass card wrapped
            around it. It's the real button here: a native <button> handling
            its own click/keyboard activation, nothing else in between.
            Text/prism color deliberately matches `sealColor` (the wax seal
            above it) rather than `buttonColor`, so the button reads as the
            same color as the "F" seal it sits under. */}
        <IsometricButton
          label="CONTINUE"
          onClick={onComplete}
          padding="14px 64px"
          font={{
            variant: 'Extra Bold',
            fontSize: '26px',
            textAlign: 'left',
            fontFamily: 'Anton',
            fontWeight: 800,
            lineHeight: '1.4em',
            letterSpacing: '0.02em'
          }}
          colors={{ fill: '#16121D', textColor: sealColor, hoverTextColor: '#FFFFFF' }}
          prism={{ color: sealColor, float: 6, intensity: 100, thickness: 11, hoverFloat: 5 }}
        />
      </div>
    </div>
  );
}
