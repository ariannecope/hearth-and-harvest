import express from 'express';
import cors from 'cors';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { query } from './db.js';
import plantsRouter from './routes/plants.js';
import breedsRouter from './routes/breeds.js';
import farmRouter from './routes/farm.js';
import farmPlansRouter from './routes/farmPlans.js';

export function createApp() {
  const app = express();

  const origins = (process.env.CLIENT_ORIGIN || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  app.use(cors({ origin: origins.length ? origins : true }));
  app.use(express.json({ limit: '100kb' }));

  app.get('/api/health', async (_req, res) => {
    await query('SELECT 1');
    res.json({ ok: true });
  });

  app.use('/api/plants', plantsRouter);
  app.use('/api/breeds', breedsRouter);
  app.use('/api/farm', farmRouter);
  app.use('/api/farm-plans', farmPlansRouter);

  app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found' }));

  // On Render, one service serves the built React app (client/dist) as well as the API.
  // Locally Vite serves the front end, so this only kicks in once `npm run build` has run in client/.
  const dist = fileURLToPath(new URL('../../client/dist/', import.meta.url));
  if (existsSync(dist)) {
    app.use(express.static(dist, { index: false }));
    // React Router fallback: any other page loads index.html and the app picks the route.
    app.get('/{*page}', (_req, res) => res.sendFile('index.html', { root: dist }));
  }

  // Express 5 forwards rejected promises from async handlers here.
  app.use((err, _req, res, _next) => {
    const status = err.status || 500;
    if (status >= 500) console.error(err);
    res.status(status).json({ error: status >= 500 ? 'Something went wrong on our end.' : err.message });
  });

  return app;
}

