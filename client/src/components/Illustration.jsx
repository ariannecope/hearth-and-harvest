import { useState } from 'react';
import { CATEGORY_SKETCHES } from '../lib/sketches.js';
// Field-journal style line illustrations, one per plant and livestock category.
const PATHS = {
  vegetable: (
    <>
      <path d="M26 25c4-2 8-2 12 0l-4.6 28.5c-.4 2.2-2.4 2.2-2.8 0z" />
      <path d="M28.5 33l3 1M30 41l3.5 1M27.5 29l2 .5" />
      <path d="M32 23c-2-6-6-9-11-10M32 23c0-7 2-11 6-14M32 23c3-5 7-7 12-7" />
    </>
  ),
  herb: (
    <>
      <path d="M32 56V12" />
      <path d="M32 46c-8 0-12-4-13-10 7 0 12 3 13 10zM32 38c8 0 12-4 13-10-7 0-12 3-13 10zM32 28c-6 0-9-3-10-8 5 0 9 2 10 8zM32 21c5 0 8-3 9-7-4 0-8 2-9 7z" />
    </>
  ),
  fruit: (
    <>
      <path d="M32 21c10 0 16 6 15 14-1 10-9 19-15 21-6-2-14-11-15-21-1-8 5-14 15-14z" />
      <path d="M23 22c3-1 6-4 9-9 3 5 6 8 9 9M32 13v-4" />
      <path d="M27 30h.01M37 30h.01M32 35h.01M26 39h.01M38 39h.01M32 44h.01M29 49h.01M35 49h.01" strokeWidth="3" />
    </>
  ),
  sheep: (
    <>
      <path d="M22 44c-5 0-8-3-8-7 0-3 2-5 4-6 0-4 3-7 7-7 2-3 5-4 8-4 4 0 6 2 8 4 4 0 7 3 7 7 2 1 3 3 3 6 0 4-3 7-7 7z" />
      <path d="M44 27c2-3 5-4 8-3 3 1 4 4 3 7l-2 4c-1 2-3 2-5 1" />
      <path d="M53 25l4-2M51.5 29.5h.01" strokeWidth="2.6" />
      <path d="M22 44v10M28 44v10M38 44v10M44 44v10" />
    </>
  ),
  goats: (
    <>
      <path d="M16 31c0-2 2-3 4-3h22l5 6v8c0 2-1 3-3 3H20c-2 0-4-1-4-3z" />
      <path d="M42 28l3-9 7 1 3 7-5 2" />
      <path d="M46 19c0-5 3-8 8-9M49 20c1-3 3-5 6-6" />
      <path d="M52 29l-1 6M14 29l-3-4" />
      <path d="M21 45v10M27 45v10M38 45v10M44 45v10" />
    </>
  ),
  chickens: (
    <>
      <path d="M20 31c0-8 6-14 14-14 4 0 7 2 8 5l6 1-5 3c1 9-4 19-15 19-6 0-10-4-11-9l-7-9 10 4z" />
      <path d="M35 17c0-3 2-5 4-4 1-3 3-4 5-2 1-1 3 0 3 2" />
      <path d="M38 22h.01" strokeWidth="2.6" />
      <path d="M30 45v8M36 44v9M27 53h6M33 53h6" />
      <path d="M24 33c3 4 8 5 12 3" />
    </>
  ),
  ducks: (
    <>
      <path d="M17 38c0 7 7 12 18 12 10 0 17-5 17-12l-3-5-13 3c-2-3-2-9-6-12-4-2-9 1-9 6 0 3 2 5 4 6-5 0-8 1-8 2z" />
      <path d="M17 26l-6 2 6 2" />
      <path d="M23 25h.01" strokeWidth="2.6" />
      <path d="M30 42c5 2 11 1 15-3" />
    </>
  ),
  cattle: (
    <>
      <rect x="13" y="26" width="31" height="17" rx="7" />
      <path d="M44 29h8l2 9c0 3-2 5-5 5h-3" />
      <path d="M45 29c-3-4-2-7 1-8M52 29c3-4 2-7-1-8" />
      <path d="M49 34h.01" strokeWidth="2.6" />
      <path d="M18 43v11M24 43v11M35 43v11M40 43v11M13 31c-3 2-4 7-3 11" />
    </>
  ),
  pigs: (
    <>
      <ellipse cx="31" cy="37" rx="18" ry="11" />
      <rect x="47" y="33" width="7" height="8" rx="3" />
      <path d="M41 27l3-7 4 8" />
      <path d="M44 33h.01" strokeWidth="2.6" />
      <path d="M21 46v8M27 47v7M36 47v7M42 46v8" />
      <path d="M13 35c-3-1-4-4-2-5s3 2 1 3" />
    </>
  ),
  rabbits: (
    <>
      <path d="M16 46c0-9 7-16 16-16 6 0 10 3 12 7l4-1c4 0 6 3 6 6s-3 5-6 5H18c-1 0-2-.5-2-1z" />
      <path d="M44 36c-2-8-1-15 2-20 2 4 2 13 0 20M48 36c1-7 4-13 8-15 1 5-2 11-6 15" />
      <circle cx="15" cy="40" r="3" />
      <path d="M49 41h.01" strokeWidth="2.6" />
    </>
  ),
};

export default function Illustration({ kind, size = 64, className = '', title }) {
  return (
    <svg
      className={`illustration ${className}`}
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {PATHS[kind] ?? PATHS.herb}
    </svg>
  );
}

// A soft tinted disc behind the illustration, with tone picked by category.
const TONES = {
  vegetable: 'sage', herb: 'moss', fruit: 'clay',
  sheep: 'cream', goats: 'wheat', chickens: 'clay', ducks: 'sky',
  cattle: 'bark', pigs: 'rose', rabbits: 'wheat',
};

// Plain-text credit, e.g. "Photo: Jane Doe, CC BY-SA 4.0, via Wikimedia Commons".
export function creditText(credit) {
  return credit ? `Photo: ${credit.author}, ${credit.license}, via ${credit.provider}` : '';
}

// Small tiles don't need the full 960px photo: ask the image host for a smaller copy.
function sizedUrl(url, size) {
  if (size === 'lg') return url;
  if (/(upload|thumb)\.wikimedia\.org/.test(url)) return url.replace(/\/\d+px-/, '/250px-');
  if (url.includes('inaturalist')) return url.replace('/large.', '/small.');
  return url;
}

// A photo when the item has one, else the category sketch (or line illustration) on a
// tinted disc. Also falls back if the photo fails to load.
export function ArtTile({ kind, size = 'md', label, image, credit }) {
  const [failed, setFailed] = useState(false);
  if (image && !failed) {
    return (
      <div className={`art-tile art-${size} art-photo tone-${TONES[kind] ?? 'sage'}`} title={creditText(credit)}>
        <img src={sizedUrl(image, size)} alt={label ?? ''} loading="lazy" decoding="async" onError={() => setFailed(true)} />
      </div>
    );
  }
  const sketch = CATEGORY_SKETCHES[kind];
  return (
    <div className={`art-tile art-${size} tone-${TONES[kind] ?? 'sage'}`}>
      {sketch ? (
        <img className="art-sketch" src={sketch} alt={label ?? ''} aria-hidden={label ? undefined : true} />
      ) : (
        <Illustration kind={kind} size={size === 'lg' ? 120 : size === 'sm' ? 40 : 72} title={label} />
      )}
    </div>
  );
}

// Attribution line shown under a photo; the licenses require crediting the photographer.
export function PhotoCredit({ credit, className = '' }) {
  if (!credit) return null;
  return (
    <p className={`photo-credit ${className}`}>
      Photo: {credit.author},{' '}
      {credit.license_url ? <a href={credit.license_url} target="_blank" rel="noreferrer">{credit.license}</a> : credit.license},{' '}
      via <a href={credit.source_url} target="_blank" rel="noreferrer">{credit.provider}</a>
    </p>
  );
}

// Category button artwork: the hand-drawn sketch where there is one, else the line illustration.
export function CategoryIcon({ kind }) {
  const sketch = CATEGORY_SKETCHES[kind];
  if (sketch) return <img className="category-sketch" src={sketch} alt="" aria-hidden="true" />;
  return <span className="category-icon"><Illustration kind={kind} size={40} /></span>;
}
