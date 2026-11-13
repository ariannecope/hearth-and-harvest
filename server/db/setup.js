// Creates tables (if missing) and upserts the plant + breed reference data.
// Re-running is safe: farm profiles and saved plans are never touched.
import { readFile } from 'node:fs/promises';
import { pool } from '../src/db.js';
import plants from './data/plants.js';
import breeds from './data/breeds.js';

const JSON_COLUMNS = new Set(['sources', 'registries', 'guides', 'image_credit']);

// Photos found by scripts/fetch-images.js. Missing file or entry = keep the illustration.
let images = { plants: {}, breeds: {} };
try {
  images = JSON.parse(await readFile(new URL('./data/images.json', import.meta.url), 'utf8'));
} catch {
  console.warn('No db/data/images.json; seeding without photos.');
}

function withImage(row, img) {
  if (!img) return { ...row, image_url: null, image_credit: null };
  const { author, license, license_url, source_url, provider } = img;
  return { ...row, image_url: img.url, image_credit: { author, license, license_url, source_url, provider } };
}

async function upsert(client, table, rows, conflictCols) {
  for (const row of rows) {
    const cols = Object.keys(row);
    const values = cols.map((c) => (JSON_COLUMNS.has(c) ? JSON.stringify(row[c]) : row[c]));
    const placeholders = cols.map((_, i) => `$${i + 1}`);
    const updates = cols
      .filter((c) => !conflictCols.includes(c))
      .map((c) => `${c} = EXCLUDED.${c}`);
    await client.query(
      `INSERT INTO ${table} (${cols.join(', ')}) VALUES (${placeholders.join(', ')})
       ON CONFLICT (${conflictCols.join(', ')}) DO UPDATE SET ${updates.join(', ')}`,
      values,
    );
  }
}

const client = await pool.connect();
try {
  const schema = await readFile(new URL('./schema.sql', import.meta.url), 'utf8');
  await client.query('BEGIN');
  await client.query(schema);
  await upsert(client, 'plants', plants.map((p) => withImage(p, images.plants?.[p.common_name])), ['common_name']);
  await upsert(client, 'livestock_breeds', breeds.map((b) => withImage(b, images.breeds?.[`${b.category}:${b.breed_name}`])), ['breed_name', 'category']);
  await client.query('COMMIT');
  console.log(`Schema ready. Seeded ${plants.length} plants and ${breeds.length} breeds.`);
} catch (err) {
  await client.query('ROLLBACK');
  console.error('Database setup failed:', err.message);
  process.exitCode = 1;
} finally {
  client.release();
  await pool.end();
}
