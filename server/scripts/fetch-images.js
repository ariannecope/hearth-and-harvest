// One-time (re-runnable) script that finds a freely licensed photo for every plant
// and breed, records who took it and under which license, and writes:
//   db/data/images.json          image URL + credit per item, read by db/setup.js
//   scripts/image-review.html    contact sheet to review before seeding
//
// Sources, in order:
//   1. OVERRIDES below (a specific Commons file, or 'inaturalist' to skip Wikipedia)
//   2. The lead image of the item's English Wikipedia article. Wikipedia only marks
//      freely licensed images as the "free page image", so non-free files are skipped.
//   3. Plants only: the iNaturalist taxon photo, if it carries a Creative Commons license.
//
// Usage: npm run images            (all items)
//        npm run images -- Tomato  (only items whose name contains "Tomato")
// Items already in images.json with `locked: true` are kept as they are.

import { readFile, writeFile } from 'node:fs/promises';
import plants from '../db/data/plants.js';
import breeds from '../db/data/breeds.js';

const OUT = new URL('../db/data/images.json', import.meta.url);
const REVIEW = new URL('./image-review.html', import.meta.url);
const UA = 'farm-planner-image-fetch/1.0 (non-commercial educational project; one-off script)';
const WIDTH = 960; // a standard Wikimedia thumbnail step, so thumbnails are served from cache

// Wikipedia article for each item, where the name alone doesn't land on the right page.
const TITLES = {
  // plants
  'Bell Pepper': 'Bell pepper',
  'Summer Squash & Zucchini': 'Zucchini',
  'Winter Squash (Butternut)': 'Butternut squash',
  'Bush Bean': 'Green bean',
  'Sweet Corn': 'Sweet corn',
  'Garden Pea': 'Pea',
  'Beet': 'Beetroot',
  'Highbush Blueberry': 'Vaccinium corymbosum',
  'Red Raspberry': 'Rubus idaeus',
  'Strawberry': 'Garden strawberry',
  'Rhubarb': 'Rhubarb',
  'Thyme': 'Thymus vulgaris',
  // breeds
  'sheep:Katahdin': 'Katahdin sheep',
  'sheep:Romney': 'Romney sheep',
  'sheep:Icelandic': 'Icelandic sheep',
  'sheep:Shetland': 'Shetland sheep',
  'sheep:Dorper': 'Dorper',
  'sheep:Gulf Coast Native': 'Gulf Coast Native sheep',
  'goats:Nubian': 'Anglo-Nubian goat',
  'goats:Nigerian Dwarf': 'Nigerian Dwarf goat',
  'goats:LaMancha': 'LaMancha (goat)',
  'goats:Boer': 'Boer goat',
  'goats:Angora': 'Angora goat',
  'chickens:Rhode Island Red': 'Rhode Island Red',
  'chickens:Buff Orpington': 'Buff Orpington',
  'chickens:Barred Plymouth Rock': 'Plymouth Rock chicken',
  'chickens:Black Australorp': 'Australorp',
  'chickens:White Leghorn': 'Leghorn chicken',
  'chickens:Silver Laced Wyandotte': 'Wyandotte chicken',
  'chickens:Cornish Cross': 'Broiler',
  'ducks:Khaki Campbell': 'Khaki Campbell',
  'ducks:Pekin': 'American Pekin',
  'ducks:Muscovy': 'Muscovy duck',
  'ducks:Indian Runner': 'Indian Runner duck',
  'ducks:Cayuga': 'Cayuga duck',
  'cattle:Dexter': 'Dexter cattle',
  'cattle:Jersey': 'Jersey cattle',
  'cattle:Highland': 'Highland cattle',
  'cattle:Angus': 'Aberdeen Angus',
  'cattle:Pineywoods': 'Pineywoods cattle',
  'pigs:Kunekune': 'Kunekune',
  'pigs:Berkshire': 'Berkshire pig',
  'pigs:Large Black': 'Large Black pig',
  'pigs:Tamworth': 'Tamworth pig',
  'pigs:Gloucestershire Old Spots': 'Gloucestershire Old Spots',
  'rabbits:New Zealand': 'New Zealand rabbit',
  'rabbits:Californian': 'Californian rabbit',
  'rabbits:Silver Fox': 'Silver Fox rabbit',
  'rabbits:English Angora': 'English Angora',
  'rabbits:American Chinchilla': 'Chinchilla rabbit',
};

// After review: a specific Commons file ("File:..."), or 'inaturalist' to use the
// iNaturalist photo instead (plants only), when the article's lead image isn't a good fit.
const OVERRIDES = {
  Garlic: 'File:Garlic bulbs and cloves.jpg', // lead image was a botanical drawing; iNaturalist's is all rights reserved
  // Cilantro and Dill: lead images were botanical drawings, not photos
  Cilantro: 'inaturalist',
  Dill: 'inaturalist',
};
const isInat = (key) => OVERRIDES[key] === 'inaturalist';

const FREE = /^(cc[ -]|cc0|public domain|pd\b|gfdl|attribution|no restrictions)/i;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getJson(url) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(url, { headers: { 'User-Agent': UA, 'Api-User-Agent': UA } });
    if (res.ok) return res.json();
    if (res.status !== 429 && res.status < 500) throw new Error(`${res.status} from ${new URL(url).host}`);
    await sleep(Number(res.headers.get("retry-after")) * 1000 || 20000 * (attempt + 1));
  }
  throw new Error(`Gave up on ${new URL(url).host}`);
}

const stripHtml = (s = '') => s.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/\s+/g, ' ').trim();

function wiki(params) {
  const url = new URL('https://en.wikipedia.org/w/api.php');
  for (const [k, v] of Object.entries({ format: 'json', formatversion: 2, origin: '*', ...params })) url.searchParams.set(k, v);
  return getJson(url);
}

// Wikipedia allows unidentified scripts ~10 requests/minute, so look up to 50 titles per request.
const chunk = (arr, n) => Array.from({ length: Math.ceil(arr.length / n) }, (_, i) => arr.slice(i * n, i * n + n));

// Resolve "normalized" and "redirects" hops so each requested title maps to its final page.
function finalTitles(query) {
  const hop = new Map([...(query.normalized ?? []), ...(query.redirects ?? [])].map((r) => [r.from, r.to]));
  return (t) => {
    for (let i = 0; i < 5 && hop.has(t); i++) t = hop.get(t);
    return t;
  };
}

// The free lead image ("File:...") of each Wikipedia article. Returns Map(title -> { file, page }).
async function leadImages(titles) {
  const out = new Map();
  for (const batch of chunk([...new Set(titles)], 50)) {
    const data = await wiki({ action: 'query', prop: 'pageprops', ppprop: 'page_image_free', titles: batch.join('|'), redirects: 1 });
    const resolve = finalTitles(data.query);
    const pages = new Map(data.query.pages.map((p) => [p.title, p]));
    for (const t of batch) {
      const page = pages.get(resolve(t));
      const file = page && !page.missing ? page.pageprops?.page_image_free : null;
      out.set(t, { file: file ? `File:${file}` : null, page: page && !page.missing ? page.title : null });
    }
    await sleep(7000);
  }
  return out;
}

// URL, size, author, and license per file (Commons files resolve via enwiki). Map(file -> info|null).
async function fileInfos(files) {
  const out = new Map();
  for (const batch of chunk([...new Set(files)], 50)) {
    const data = await wiki({ action: 'query', prop: 'imageinfo', titles: batch.join('|'), iiprop: 'url|size|extmetadata|user', iiurlwidth: WIDTH });
    const resolve = finalTitles(data.query);
    const pages = new Map(data.query.pages.map((p) => [p.title, p]));
    for (const f of batch) {
      const info = pages.get(resolve(f))?.imageinfo?.[0];
      out.set(f, info ? toCredit(f, info) : null);
    }
    await sleep(7000);
  }
  return out;
}

// Commons "Artist" fields are free text; trim uploader boilerplate, emails, and camera notes.
function cleanAuthor(raw, uploader) {
  let a = stripHtml(raw)
    .replace(/^No machine-readable author provided\.\s*(.+?) assumed.*$/i, '$1')
    .replace(/^The original uploader was (.+?) at .+$/i, '$1')
    .replace(/\s*\((?:Wikipedia:)?User:[^)]*\)/gi, '')
    .replace(/\s+\S+\s*(?:\[at\]|@)\s*\S+.*$/i, '')
    .trim();
  if (!a || /^unknown/i.test(a)) a = uploader ? `${uploader} (Wikimedia Commons uploader)` : 'Unknown photographer';
  return a.length > 80 ? `${a.slice(0, 77)}…` : a;
}

const normalizeLicense = (l) => l.replace(/^CC-(BY[A-Z-]*?)-(\d\.\d)$/i, (_, t, v) => `CC ${t.toUpperCase()} ${v}`);

function toCredit(file, info) {
  const meta = info.extmetadata ?? {};
  const license = normalizeLicense(stripHtml(meta.LicenseShortName?.value));
  if (!FREE.test(license) || meta.NonFree?.value === 'true') return null;
  return {
    url: (info.thumburl ?? info.url).split('?')[0], // drop utm_* tracking parameters
    width: info.thumbwidth ?? info.width,
    height: info.thumbheight ?? info.height,
    author: cleanAuthor(meta.Artist?.value, info.user),
    license,
    license_url: meta.LicenseUrl?.value ?? null,
    source_url: info.descriptionurl,
    provider: 'Wikimedia Commons',
    file: file.replace(/^File:/, ''),
  };
}

// iNaturalist taxon photo for a botanical name, if Creative Commons licensed.
async function inatPhoto(botanical) {
  const name = botanical.split(/ \(| \/|,/)[0].replace(/ var\..*$| subsp\..*$/, '');
  const data = await getJson(`https://api.inaturalist.org/v1/taxa?q=${encodeURIComponent(name)}&per_page=1`);
  const taxon = data.results?.[0];
  const photo = taxon?.default_photo;
  if (!photo?.license_code) return null; // null license = all rights reserved
  const code = photo.license_code.toUpperCase();
  return {
    url: photo.medium_url.replace('/medium.', '/large.'),
    width: null,
    height: null,
    author: stripHtml(photo.attribution.replace(/^\(c\)\s*/i, '').replace(/,? some rights reserved.*$/i, '').replace(/,? no rights reserved.*$/i, '')),
    license: code === 'CC0' ? 'CC0' : `CC ${code.replace(/^CC-/, '')}`,
    license_url: code === 'CC0'
      ? 'https://creativecommons.org/publicdomain/zero/1.0/'
      : `https://creativecommons.org/licenses/${code.replace(/^CC-/, '').toLowerCase()}/4.0/`,
    source_url: `https://www.inaturalist.org/photos/${photo.id}`,
    provider: 'iNaturalist',
    taxon: taxon.name,
  };
}

const items = [
  ...plants.map((p) => ({ type: 'plants', key: p.common_name, name: p.common_name, title: TITLES[p.common_name] ?? p.common_name, botanical: p.botanical_name })),
  ...breeds.map((b) => {
    const key = `${b.category}:${b.breed_name}`;
    return { type: 'breeds', key, name: `${b.breed_name} (${b.category})`, title: TITLES[key] ?? b.breed_name };
  }),
];

const filter = process.argv[2]?.toLowerCase();
let existing = { plants: {}, breeds: {} };
try {
  existing = JSON.parse(await readFile(OUT, 'utf8'));
} catch {
  /* first run */
}
const result = { plants: { ...existing.plants }, breeds: { ...existing.breeds } };

const todo = items.filter((i) => (!filter || i.name.toLowerCase().includes(filter)) && !result[i.type][i.key]?.locked);

console.log(`Looking up ${todo.length} items on Wikipedia (batched; takes about a minute)…`);
const leads = await leadImages(todo.filter((i) => !OVERRIDES[i.key]).map((i) => i.title));
const fileFor = (i) => (isInat(i.key) ? null : OVERRIDES[i.key] ?? leads.get(i.title)?.file);
const infos = await fileInfos(todo.map(fileFor).filter(Boolean));

for (const item of todo) {
  const lead = leads.get(item.title);
  const file = fileFor(item);
  let found = file && infos.get(file) ? { ...infos.get(file), via: OVERRIDES[item.key] ? 'override' : `Wikipedia: ${lead.page}` } : null;
  let note = isInat(item.key) ? 'override: iNaturalist' : OVERRIDES[item.key] ? 'override file not usable' : lead?.page ? `Wikipedia: ${lead.page} (no free lead image)` : `No Wikipedia page "${item.title}"`;
  if (!found && item.botanical) {
    try {
      const photo = await inatPhoto(item.botanical);
      if (photo) found = { ...photo, via: `iNaturalist: ${photo.taxon}` };
      else note += '; no CC photo on iNaturalist';
    } catch (err) {
      note += `; iNaturalist error: ${err.message}`;
    }
    await sleep(1100);
  }
  result[item.type][item.key] = found;
  console.log(`${found ? '✓' : '✗'} ${item.name.padEnd(36)} ${found ? found.via : note}`);
}

// Drop entries for items no longer in the catalog.
for (const type of ['plants', 'breeds']) {
  const keys = new Set(items.filter((i) => i.type === type).map((i) => i.key));
  for (const k of Object.keys(result[type])) if (!keys.has(k)) delete result[type][k];
}

await writeFile(OUT, `${JSON.stringify(result, null, 2)}\n`);

const esc = (s = '') => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const cards = items.map((i) => {
  const img = result[i.type][i.key];
  return `<figure class="${img ? '' : 'missing'}">
  ${img ? `<img src="${esc(img.url)}" alt="" loading="lazy">` : '<div class="none">No photo (illustration will be used)</div>'}
  <figcaption><strong>${esc(i.name)}</strong>
  ${img ? `<span>${esc(img.author)} · ${esc(img.license)} · <a href="${esc(img.source_url)}" target="_blank" rel="noreferrer">${esc(img.provider)}</a></span><code>${esc(img.via)}</code>` : ''}</figcaption>
</figure>`;
}).join('\n');
await writeFile(REVIEW, `<!doctype html><meta charset="utf-8"><title>Image review</title>
<style>
body{font:14px system-ui,sans-serif;margin:24px;background:#f6f1e7;color:#2b2620}
h1{font-size:20px} p{color:#6c6257}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:16px}
figure{margin:0;background:#fff;border:1px solid #e3d9c7;border-radius:10px;overflow:hidden}
figure.missing{border-color:#c0674a}
img,.none{width:100%;aspect-ratio:4/3;object-fit:cover;display:block;background:#efe7d8}
.none{display:grid;place-items:center;color:#9e4f36}
figcaption{padding:10px;display:grid;gap:4px} figcaption span{color:#6c6257;font-size:12px}
code{font-size:11px;color:#7d8f69}
</style>
<h1>Image review (${items.filter((i) => result[i.type][i.key]).length} of ${items.length} found)</h1>
<p>Check each photo shows the right breed or plant and crops well. To replace one, add a Commons file (or 'inaturalist') to OVERRIDES in fetch-images.js and re-run.</p>
<div class="grid">${cards}</div>`);

console.log(`\nWrote ${new URL(OUT).pathname}\nReview sheet: ${new URL(REVIEW).pathname}`);
