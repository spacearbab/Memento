import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'motion/react';
import { DoodleArrow, DoodleHandPuzzle, DoodleHandIdea, DoodleHandWand, DoodleHandSnap } from '../components/Doodles.jsx';
import ThemeToggle from '../components/ThemeToggle.jsx';
import SealFinale from './SealFinale.jsx';
import './Intro.css';

// A-Z -> 1-26. This is the actual rule the two colors below were derived
// from, computed live (not hardcoded) so it's always correct.
function letterValue(ch) {
  return ch.toUpperCase().charCodeAt(0) - 64;
}

function nameBreakdown(name) {
  const letters = name
    .toUpperCase()
    .split('')
    .map(ch => ({ ch, value: letterValue(ch) }));
  const sum = letters.reduce((total, l) => total + l.value, 0);
  return { letters, sum };
}

const FIRST_NAME = 'Farnaz';
const FIRST_COLOR = '#99C224';
const LAST_NAME = 'Afazel';
const LAST_COLOR = '#15C1AD';

const first = nameBreakdown(FIRST_NAME);
const last = nameBreakdown(LAST_NAME);

// Only the surrounding prose is translated — the letters/numbers/hex codes
// are the same math either way, so they always stay left-to-right.
const T = {
  en: {
    eyebrow0: 'why I built this',
    text0a:
      "It all started because I noticed something, more than once — when you wanted to tell me you were thinking of me, you'd write the first letter of my name\u2026",
    text0b:
      'Like that one time you arranged a few pills into it, or another time you told me you\u2019d written "M" on your blanket. I realized that was your language for showing you cared.',
    text0c: 'So I tried to do the same thing\u2026',

    eyebrow1: 'So I tried to speak the same language.',
    text1:
      'That night on Telegram, when I spelled your whole name out of dots, the thought hit me \u2014 what would your name look like as a number? Then I thought, oh \u2014 turning it into a color would be even cooler. So that\u2019s what I did \u2014 I turned your name into a color\u2026',

    eyebrow2: 'Farnaz, in numbers',
    text2:
      'At first it was simple \u2014 just turn your name into one number and send it to you. Like this: A=1, B=2, all the way to Z=26. I did this for the letters in FARNAZ, and for your last name too \u2014 but then I decided to turn that same number into a color, and basically build a color out of your name\u2026',

    eyebrow3: 'but then I built something bigger',
    reveal3: "I decided that instead of just sending you a color, I'd make you this site.",
    body3: "So, using your two colors and the styles of ten of the world's most famous artists, I made eighty images.",
    labelFirst: 'first',
    labelLast: 'last',
    closing: "Now your name has become a painting \u2014 so wherever you go from here, you're still looking at your own name\u2026",

    skip: 'Skip',
    back: 'Back',
    continueBtn: 'Continue',
    enter: 'Enter the gallery',
    translateLabel: 'Read in Persian'
  },
  fa: {
    eyebrow0: 'چرا این سایتو ساختم',
    text0a:
      'داستان از اینجا شروع شد که چند باری دیدم، وقتی می‌خواستی بهم بگی حواست بهم هست یا برات مهمم، حرف اول اسممو می‌نوشتی…',
    text0b:
      'مثلاً یه دفعه با کنار هم گذاشتن چند تا قرص این کارو کردی، یا یه بار دیگه بهم گفتی که روی پتوت نوشتی M. فهمیدم که این یه جور زبان ابراز محبت برای توعه.',
    text0c: 'برای همین منم سعی کردم همون کارو بکنم……',

    eyebrow1: 'پس منم سعی کردم به همین زبون حرف بزنم.',
    text1:
      'اون شبی که توی تلگرام کل اسمتو با نقطه درست کردم، همون‌جا این فکر اومد توی سرم که اگه اسمتو تبدیل کنم به عدد چی میشه؛ بعد دیدم اِ، اگه به جای عدد تبدیلش کنم به رنگ باحال‌تر میشه، پس این شد که همین کارو کردم و اسمتو تبدیل کردم به رنگ …',

    eyebrow2: 'فرناز به عدد',
    text2:
      'اولش قرار بود ساده باشه؛ فقط اسمت رو تبدیل کنم به یه عددو همون رو برات بفرستم. اینطوری که A میشه ۱، B میشه ۲، همین‌طور تا Z که میشه ۲۶. این کارو هم برای حروف FARNAZ کردم هم حروف فامیلت، ولی بعدش تصمیم گرفتم تا همین عدد رو تبدیل کنم به رنگ و درواقع از اسمت رنگ بسازم …',

    eyebrow3: 'ولی بعدش یه چیز بزرگ‌تر ساختم',
    reveal3: 'تصمیم گرفتم به جای این که فقط یه رنگ برات بفرستم، برات این سایتو آماده کنم.',
    body3: 'اینطوری که با استفاده از دو رنگ اسمت و سبک طراحی ده تا از معروف‌ترین آرتیست‌های دنیا، ۸۰ تا تصویر ساختم.',
    labelFirst: 'اسم کوچیک',
    labelLast: 'فامیلی',
    closing: 'حالا اسمت تبدیل شده به نقاشی، پس هرچی میری جلو، بازم داری اسم خودتو می‌بینی…',

    skip: 'رد کردن',
    back: 'برگشت',
    continueBtn: 'ادامه',
    enter: 'ورود به گالری',
    translateLabel: 'Read in English'
  }
};

function TranslateIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      <path
        d="M4 5h7M7.5 4v2c0 4-1.5 7-5 9M5 9c1 2.2 2.6 3.7 5 5M13 20l4-9 4 9M14.7 17h4.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function NameMath({ label, breakdown, color }) {
  return (
    <div className="name-math" dir="ltr">
      <div className="name-math-letters">
        {breakdown.letters.map((l, i) => (
          <div className="name-math-letter" key={i} style={{ animationDelay: `${0.3 + i * 0.08}s` }}>
            <span className="name-math-char">{l.ch}</span>
            <span className="name-math-value">{l.value}</span>
          </div>
        ))}
      </div>
      <div className="name-math-sum" style={{ animationDelay: `${0.3 + breakdown.letters.length * 0.08 + 0.1}s` }}>
        <span className="name-math-sum-label">{label}</span>
        <span className="name-math-sum-value">{breakdown.sum}</span>
      </div>
      <div className="name-math-swatch" style={{ animationDelay: `${0.3 + breakdown.letters.length * 0.08 + 0.3}s` }}>
        <span className="name-math-swatch-color" style={{ background: color }} />
        <span className="name-math-swatch-hex">{color}</span>
      </div>
    </div>
  );
}

function buildSteps(t) {
  return [
    {
      eyebrow: t.eyebrow0,
      body: (
        <>
          <p className="intro-text">{t.text0a}</p>
          <p className="intro-text">{t.text0b}</p>
          <p className="intro-text intro-text-tight">{t.text0c}</p>
        </>
      )
    },
    {
      eyebrow: t.eyebrow1,
      body: <p className="intro-text">{t.text1}</p>
    },
    {
      eyebrow: t.eyebrow2,
      body: (
        <>
          <p className="intro-text intro-text-tight">{t.text2}</p>
          <div className="name-math-pair">
            <NameMath label={FIRST_NAME} breakdown={first} color={FIRST_COLOR} />
            <NameMath label={LAST_NAME} breakdown={last} color={LAST_COLOR} />
          </div>
        </>
      )
    },
    {
      eyebrow: t.eyebrow3,
      body: (
        <>
          <p className="intro-text intro-reveal">{t.reveal3}</p>
          <p className="intro-text">{t.body3}</p>
          <div className="intro-duo" dir="ltr">
            <div className="intro-duo-block" style={{ background: FIRST_COLOR }}>
              <span className="intro-duo-label">{t.labelFirst}</span>
              <span className="intro-duo-name">{FIRST_NAME}</span>
            </div>
            <div className="intro-duo-block" style={{ background: LAST_COLOR }}>
              <span className="intro-duo-label">{t.labelLast}</span>
              <span className="intro-duo-name">{LAST_NAME}</span>
            </div>
          </div>
          <div className="intro-duo-hexes" dir="ltr">
            <span>{FIRST_COLOR}</span>
            <span>{LAST_COLOR}</span>
          </div>
          <p className="intro-text intro-closing">{t.closing}</p>
        </>
      )
    }
  ];
}

const STORY_STEPS = buildSteps(T.en).length;

// One hand-drawn illustration per story step, shown next to that step's
// eyebrow title — in the same order as the steps themselves.
const STEP_ICONS = [DoodleHandPuzzle, DoodleHandIdea, DoodleHandWand, DoodleHandSnap];

function CardFace({
  lang,
  step,
  setStep,
  onSkipToFinale,
  toggleLang,
  isActive,
  onNaturalHeight,
  themeMode,
  onCycleTheme
}) {
  const t = T[lang];
  const STEPS = buildSteps(t);
  const isFa = lang === 'fa';
  const bodyRef = useRef(null);
  const StepIcon = STEP_ICONS[step];

  // Reports this face's own natural (unconstrained) content height so the
  // parent can size the whole flip card to whatever the active step/language
  // actually needs — this is what fixes the card being taller than its
  // content and leaving dead space under short slides.
  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return undefined;
    const report = () => onNaturalHeight(lang, Math.ceil(el.getBoundingClientRect().height) + 3);
    report();
    const ro = new ResizeObserver(report);
    ro.observe(el);
    return () => ro.disconnect();
  }, [lang, step, onNaturalHeight]);

  const goNext = () => {
    if (step === STORY_STEPS - 1) onSkipToFinale();
    else setStep(s => s + 1);
  };

  return (
    <div
      className={`intro-card ${isFa ? 'lang-fa' : ''}`}
      dir={isFa ? 'rtl' : 'ltr'}
      aria-hidden={!isActive}
      style={{ pointerEvents: isActive ? 'auto' : 'none' }}
    >
      <div className="intro-corner-controls">
        <button
          type="button"
          className="intro-translate"
          onClick={toggleLang}
          aria-label={t.translateLabel}
          title={t.translateLabel}
          tabIndex={isActive ? 0 : -1}
        >
          <TranslateIcon />
        </button>
        <ThemeToggle themeMode={themeMode} onCycle={onCycleTheme} />
      </div>

      <button type="button" className="intro-skip" onClick={onSkipToFinale} tabIndex={isActive ? 0 : -1}>
        {t.skip}
      </button>

      <div className="intro-card-body" ref={bodyRef}>
        <div className="intro-dots" role="tablist" aria-label="Intro steps">
          {Array.from({ length: STORY_STEPS }).map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === step}
              aria-label={`Step ${i + 1}`}
              className={`intro-dot ${i === step ? 'is-active' : ''} ${i < step ? 'is-done' : ''}`}
              onClick={() => setStep(i)}
              tabIndex={isActive ? 0 : -1}
            />
          ))}
        </div>

        <div className="intro-content" key={step}>
          <div className="intro-eyebrow-row">
            {StepIcon && <StepIcon className="intro-eyebrow-icon" />}
            <div className="intro-eyebrow">{STEPS[step].eyebrow}</div>
          </div>
          {STEPS[step].body}
        </div>

        <div className="intro-footer">
          {step > 0 ? (
            <button
              type="button"
              className="intro-back"
              onClick={() => setStep(s => s - 1)}
              tabIndex={isActive ? 0 : -1}
            >
              {t.back}
            </button>
          ) : (
            <span />
          )}
          <span className="intro-next-wrap">
            {step === 0 && <DoodleArrow className="intro-next-arrow" />}
            <button type="button" className="intro-next" onClick={goNext} tabIndex={isActive ? 0 : -1}>
              {t.continueBtn}
            </button>
          </span>
        </div>
      </div>
    </div>
  );
}

export default function Intro({ onComplete, themeMode, onCycleTheme, sealColor, buttonColor }) {
  const [step, setStep] = useState(0);
  const [showFinale, setShowFinale] = useState(false);
  const [lang, setLang] = useState('en');

  const toggleLang = useCallback(() => setLang(l => (l === 'en' ? 'fa' : 'en')), []);
  const goToFinale = useCallback(() => setShowFinale(true), []);
  const backFromFinale = useCallback(() => setShowFinale(false), []);

  // Natural content height per language, reported live by each CardFace —
  // the card's actual on-screen height always tracks whichever face is
  // currently active, animating smoothly between steps via CSS transition.
  const [heights, setHeights] = useState({ en: null, fa: null });
  const onNaturalHeight = useCallback((faceLang, height) => {
    setHeights(prev => (prev[faceLang] === height ? prev : { ...prev, [faceLang]: height }));
  }, []);
  const activeHeight = heights[lang];

  // --- hover tilt + click-to-flip, combined on one rotating element ---
  const cardRef = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const tiltRotateX = useTransform(y, [-0.5, 0.5], [8, -8]);
  const tiltRotateY = useTransform(x, [-0.5, 0.5], [-8, 8]);
  const smoothTiltX = useSpring(tiltRotateX, { stiffness: 300, damping: 30 });
  const smoothTiltY = useSpring(tiltRotateY, { stiffness: 300, damping: 30 });
  const flipTarget = useMotionValue(0);
  const smoothFlip = useSpring(flipTarget, { stiffness: 190, damping: 24 });
  const combinedRotateY = useTransform([smoothTiltY, smoothFlip], ([tilt, flip]) => tilt + flip);

  const handleMouseMove = e => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const handleToggleLang = useCallback(() => {
    toggleLang();
    flipTarget.set(lang === 'en' ? 180 : 0);
  }, [toggleLang, flipTarget, lang]);

  // The finale is a completely separate full-screen page, not another face
  // of the card — it deliberately breaks away from the glass-card look.
  // It is always English, regardless of which language the card steps were
  // read in, so it doesn't need t/isFa/onToggleLang the way BrandFinale did.
  if (showFinale) {
    return (
      <SealFinale
        onBack={backFromFinale}
        onComplete={onComplete}
        sealColor={sealColor}
        buttonColor={buttonColor}
      />
    );
  }

  return (
    <div className="intro">
      <div
        className="intro-flip-viewport"
        style={activeHeight ? { height: `${activeHeight}px` } : undefined}
      >
        <motion.div
          ref={cardRef}
          className="intro-flip-outer"
          style={{ rotateX: smoothTiltX, rotateY: combinedRotateY }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <div className="intro-flip-face intro-flip-front">
            <CardFace
              lang="en"
              isActive={lang === 'en'}
              step={step}
              setStep={setStep}
              onSkipToFinale={goToFinale}
              toggleLang={handleToggleLang}
              onNaturalHeight={onNaturalHeight}
              themeMode={themeMode}
              onCycleTheme={onCycleTheme}
            />
          </div>
          <div className="intro-flip-face intro-flip-back">
            <CardFace
              lang="fa"
              isActive={lang === 'fa'}
              step={step}
              setStep={setStep}
              onSkipToFinale={goToFinale}
              toggleLang={handleToggleLang}
              onNaturalHeight={onNaturalHeight}
              themeMode={themeMode}
              onCycleTheme={onCycleTheme}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
