# Farnaz

A minimal, glassmorphic gallery: pick one of ten master artists, then scroll
through eight images rendered in their style.

## Structure

```
src/
  components/
    MoltenMetal.jsx / .css     — background (used exactly as provided)
    CircularGallery.jsx / .css — 10-artist picker (used exactly as provided,
                                  plus two small additive props — see below)
    MorphSlider.jsx / .css     — 8-image per-artist viewer (used exactly as provided)
    BackButton.jsx / .css      — glass back button
  data/artists.js              — the 10 master artists + image path helpers
  pages/
    ArtistSelect.jsx / .css    — the picker screen
    ArtistGallery.jsx / .css   — the 8-image screen
  App.jsx / .css               — shared background + view routing + back-button handling
public/assets/1 … 10/1.png … 8.png — your artwork goes here (placeholders included)
```

## What was added on top of your components

Your three components (`MoltenMetal`, `CircularGallery`, `MorphSlider`) are
included byte-for-byte, with one exception: `CircularGallery` had **no way to
know which item is selected or clicked** — it only scrolls. Since the brief
requires tapping an artist to open their gallery, I added two optional,
non-breaking props to it (everything else behaves identically to the
Usage block you sent):

- `onSelect(index)` — fires when a tap/click doesn't turn into a drag; it
  reports whichever item is currently nearest to the center.
- `onActiveIndexChange(index)` — fires continuously while scrolling, so the
  description panel under the gallery can stay in sync live.

Nothing about the visual rendering, shaders, or scroll physics was touched.

## Images

Each artist owns a folder of 8 square (1:1) images:

```
public/assets/1/1.png … 1/8.png   → artist id 1 (Van Gogh)
public/assets/2/1.png … 2/8.png   → artist id 2 (Monet)
...
public/assets/10/1.png … 10/8.png → artist id 10 (O'Keeffe)
```

The artist order/ids live in `src/data/artists.js`. Image `1.png` of each
folder doubles as that artist's banner in the picker screen.

**Placeholder images are already in `public/assets`** so the site is
viewable immediately — swap them for your real renders (same filenames).

## Run locally

```
npm install
npm run dev
```

## Build & deploy to GitHub Pages

```
npm run build
```

This outputs a static site to `dist/`. `vite.config.js` uses `base: './'`
(relative paths), so the build works whether you deploy it at the root of
`username.github.io` or under `username.github.io/repo-name/` — no config
changes needed. Push the contents of `dist/` to your `gh-pages` branch (or
use the `gh-pages` npm package / GitHub Actions) and make sure
`public/assets/**` is included (Vite copies everything in `public/` into
`dist/` automatically).

## Mobile back button

Opening an artist's gallery pushes a history entry. The in-app back button
and the phone's hardware/gesture back button both just call
`history.back()`, so the first back press returns to the picker screen —
the site is only left on a second press, exactly like a normal multi-page
site would behave.
