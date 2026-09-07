// Each artist owns a folder of 8 square images at assets/{id}/1.png … 8.png
// (see the repo's /assets directory). `banner` is simply the first image in
// that folder, reused as the artist's thumbnail everywhere in the UI.
const ARTISTS = [
  {
    id: 1,
    name: 'Vincent van Gogh',
    movement: 'Post-Impressionism',
    era: '1880s',
    tagline: 'Swirling, emotional brushstrokes with thick impasto texture'
  },
  {
    id: 2,
    name: 'Claude Monet',
    movement: 'Impressionism',
    era: '1870s',
    tagline: 'Soft luminous light with gentle dissolving forms'
  },
  {
    id: 3,
    name: 'Pablo Picasso',
    movement: 'Cubism',
    era: '1910s',
    tagline: 'Geometric fragmentation, multiple viewpoints at once'
  },
  {
    id: 4,
    name: 'Salvador Dalí',
    movement: 'Surrealism',
    era: '1930s',
    tagline: 'Dreamlike impossible landscapes with hyper-real detail'
  },
  {
    id: 5,
    name: 'Jackson Pollock',
    movement: 'Abstract Expressionism',
    era: '1940s',
    tagline: 'Dynamic drip and splatter on canvas — pure energy'
  },
  {
    id: 6,
    name: 'Wassily Kandinsky',
    movement: 'Abstract',
    era: '1910s',
    tagline: 'Musical geometry — shapes and colors that sing together'
  },
  {
    id: 7,
    name: 'Frida Kahlo',
    movement: 'Folk Art',
    era: '1930s',
    tagline: 'Vivid symbolic imagery with Mexican folk art warmth'
  },
  {
    id: 8,
    name: 'Jean-Michel Basquiat',
    movement: 'Neo-Expressionism',
    era: '1980s',
    tagline: 'Raw urban energy with bold symbolic power'
  },
  {
    id: 9,
    name: 'Katsushika Hokusai',
    movement: 'Ukiyo-e',
    era: '1830s',
    tagline: 'Japanese woodblock print — elegant power and stillness'
  },
  {
    id: 10,
    name: "Georgia O'Keeffe",
    movement: 'American Modernism',
    era: '1920s',
    tagline: 'Large organic forms, clean edges, southwestern light'
  }
];

const BASE = import.meta.env.BASE_URL; // resolves correctly under GitHub Pages sub-paths

export function artistImage(artistId, imageNumber) {
  return `${BASE}assets/${artistId}/${imageNumber}.png`;
}

export function artistImages(artistId) {
  return Array.from({ length: 8 }, (_, i) => artistImage(artistId, i + 1));
}

export const artists = ARTISTS.map(artist => ({
  ...artist,
  banner: artistImage(artist.id, 1)
}));

export default artists;
