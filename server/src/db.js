import pg from 'pg';

// Return DATE columns as plain 'YYYY-MM-DD' strings so they don't shift across time zones.
pg.types.setTypeParser(1082, (value) => value);
// Return NUMERIC (acreage) as a JS number.
pg.types.setTypeParser(1700, (value) => (value === null ? null : Number(value)));

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL is not set. Copy server/.env.example to server/.env.');
  process.exit(1);
}

// Neon (and most hosted Postgres) require SSL. Local Postgres usually does not.
const isLocal = /@?(localhost|127\.0\.0\.1)(:\d+)?\//.test(connectionString);
const ssl = isLocal || process.env.PGSSL === 'false' ? false : { rejectUnauthorized: false };

export const pool = new pg.Pool({ connectionString, ssl, max: 10 });

export const query = (text, params) => pool.query(text, params);
