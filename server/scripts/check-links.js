// Re-checks every further-reading URL (seed data + client resource lists).
// Usage: npm run check-links
// "blocked" (401/403/406/429) usually means the site exists but rejects automated
// requests; open those in a browser. "FAILED" links need fixing.
import { readFile } from 'node:fs/promises';

const files = ['db/data/plants.js', 'db/data/guides.js', 'db/data/breeds.js', '../client/src/lib/resources.js', '../client/src/lib/extension.js', '../client/src/lib/conservation.js'];
const urls = new Set();
for (const f of files) {
  const text = await readFile(new URL(`../${f}`, import.meta.url), 'utf8');
  for (const m of text.matchAll(/https?:\/\/[^\s'"`)]+/g)) urls.add(m[0]);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function check(url, attempt = 1) {
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      signal: AbortSignal.timeout(20000),
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; HearthHarvestLinkCheck/1.0)' },
    });
    const host = (u) => new URL(u).hostname.replace(/^www\./, '');
    const moved = host(res.url) !== host(url) ? ` -> redirects to ${res.url} (check it's still the right site)` : '';
    if (res.ok) return { url, status: moved ? 'CHECK' : 'ok', detail: `${res.status}${moved}` };
    if ([401, 403, 406, 429].includes(res.status)) return { url, status: 'blocked', detail: String(res.status) };
    return { url, status: 'FAILED', detail: String(res.status) };
  } catch (err) {
    // Endless redirects are usually a cookie-based bot check; real browsers get through.
    if (/redirect/i.test(err.cause?.message ?? '')) return { url, status: 'blocked', detail: 'loop' };
    if (attempt < 3) {
      await sleep(1500 * attempt);
      return check(url, attempt + 1);
    }
    return { url, status: 'FAILED', detail: err.cause?.code || err.name };
  }
}

// Be polite: a few requests at a time overall, and one at a time per site
// (bursts to one host get connections reset, which looks like a broken link).
const byHost = new Map();
for (const u of urls) {
  const h = new URL(u).hostname;
  if (!byHost.has(h)) byHost.set(h, []);
  byHost.get(h).push(u);
}
const queues = [...byHost.values()];
const results = [];
async function worker() {
  for (let q = queues.shift(); q; q = queues.shift()) {
    for (const u of q) {
      results.push(await check(u));
      await sleep(250);
    }
  }
}
await Promise.all(Array.from({ length: 6 }, worker));
const order = { FAILED: 0, CHECK: 1, blocked: 2, ok: 3 };
results.sort((a, b) => order[a.status] - order[b.status]);
for (const r of results) console.log(`${r.status.padEnd(7)} ${r.detail.padEnd(5)} ${r.url}`);
const bad = results.filter((r) => r.status === 'FAILED' || r.status === 'CHECK').length;
console.log(`\n${results.length} links checked, ${bad} need attention.`);
process.exitCode = bad ? 1 : 0;
