// Netlify Function that serves the whole Express API (server/src/app.js).
// netlify.toml rewrites /api/* to /.netlify/functions/api/:splat, so this one
// function handles every route. Local development still uses `npm run dev`.
import serverless from 'serverless-http';

let handle;

async function init() {
  // One connection per function instance: each instance serves one request at a time,
  // and Neon's pooler (the -pooler host in DATABASE_URL) shares connections across instances.
  process.env.PG_POOL_MAX ??= '1';
  process.env.HH_SERVERLESS = '1';
  const { createApp } = await import('../../src/app.js');
  const app = createApp();

  // Depending on how the request arrives, the path may be /.netlify/functions/api/plants
  // or /api/plants. The Express routes expect /api/..., so normalize it.
  return serverless((req, res) => {
    req.url = req.url.replace(/^\/\.netlify\/functions\/api(?=\/|\?|$)/, '/api');
    return app(req, res);
  });
}

export async function handler(event, context) {
  // Answer as soon as the response is sent, instead of waiting for idle pool connections to close.
  context.callbackWaitsForEmptyEventLoop = false;
  handle ??= init().catch((err) => { handle = undefined; throw err; });
  return (await handle)(event, context);
}
