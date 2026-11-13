import pg from 'pg';

// Return DATE columns as plain 'YYYY-MM-DD' strings so they don't shift across time zones.
pg.types.setTypeParser(1082, (value) => value);
// Return NUMERIC (acreage) as a JS number.
pg.types.setTypeParser(1700, (value) => (value === null ? null : Number(value)));

const connectionString = process.env.DATABASE_URL;
const serverless = process.env.HH_SERVERLESS === '1';
if (!connectionString) {
  // In a Netlify Function, throw so the error shows in the function log instead of killing the runtime.
  if (serverless) throw new Error('DATABASE_URL is not set. Add it in Netlify: Site configuration → Environment variables.');
  console.error('DATABASE_URL is not set. Copy server/.env.example to server/.env.');
  process.exit(1);
}
if (serverless && /neon\.tech/.test(connectionString) && !/-pooler\./.test(connectionString)) {
  console.warn('DATABASE_URL is a direct Neon connection. Use the pooled string (host contains "-pooler") for Netlify Functions.');
}

// Neon (and most hosted Postgres) require SSL. Local Postgres usually does not.
const isLocal = /@?(localhost|127\.0\.0\.1)(:\d+)?\//.test(connectionString);
const ssl = isLocal || process.env.PGSSL === 'false' ? false : { rejectUnauthorized: false };

// The local server keeps up to 10 connections. Netlify Functions set PG_POOL_MAX=1 and close
// idle connections quickly so frozen instances don't hold Neon connections open.
export const pool = new pg.Pool({
  connectionString,
  ssl,
  max: Number(process.env.PG_POOL_MAX) || 10,
  idleTimeoutMillis: serverless ? 10_000 : 30_000,
  connectionTimeoutMillis: 10_000,
});

export const query = (text, params) => pool.query(text, params);
