// Integration tests: run against the database in DATABASE_URL (run `npm run db:setup` first).
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';
import { pool } from '../src/db.js';

let server;
let base;
let farmId;

before(async () => {
  server = createApp().listen(0);
  await new Promise((r) => server.once('listening', r));
  base = `http://localhost:${server.address().port}/api`;
});

after(async () => {
  if (farmId) await pool.query('DELETE FROM farms WHERE id = $1', [farmId]);
  server.close();
  await pool.end();
});

const api = async (path, { method = 'GET', body, farm = farmId } = {}) => {
  const res = await fetch(base + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(farm ? { 'X-Farm-Id': farm } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, body: res.status === 204 ? null : await res.json() };
};

test('health check reaches the database', async () => {
  assert.deepEqual((await api('/health')).body, { ok: true });
});

test('plants: search, filter, and detail', async () => {
  const all = await api('/plants');
  assert.ok(all.body.length >= 30);

  const tomato = await api('/plants?search=tomato');
  assert.equal(tomato.body[0].common_name, 'Tomato');

  const herbs = await api('/plants?category=herb');
  assert.ok(herbs.body.every((p) => p.category === 'herb'));

  const zone3fall = await api('/plants?zone=3&season=fall');
  assert.ok(zone3fall.body.every((p) => p.zone_min <= 3 && p.seasons.includes('fall')));
  assert.ok(!zone3fall.body.some((p) => p.common_name === 'Rosemary'));

  const detail = await api(`/plants/${tomato.body[0].id}`);
  assert.equal(detail.body.botanical_name, 'Solanum lycopersicum');
  assert.ok(detail.body.guides.length >= 2 && detail.body.guides.every((g) => g.url && g.org && g.region));
  assert.equal((await api('/plants/999999')).status, 404);
});

test('breeds: filter by category, purpose, ids', async () => {
  const sheep = await api('/breeds/category/sheep');
  assert.ok(sheep.body.length >= 4);
  const fiber = await api('/breeds?category=sheep&purpose=fiber');
  assert.ok(fiber.body.every((b) => b.purposes.includes('fiber')));
  const listed = await api('/breeds?conservation=listed');
  assert.ok(listed.body.length >= 10 && listed.body.every((b) => b.conservation_status));
  const gulf = listed.body.find((b) => b.breed_name === 'Gulf Coast Native');
  assert.equal(gulf.conservation_status, 'Critical');
  const ids = sheep.body.slice(0, 2).map((b) => b.id);
  const compare = await api(`/breeds?ids=${ids.join(',')}`);
  assert.equal(compare.body.length, 2);
});

test('farm profile: validation, create, read, update', async () => {
  assert.equal((await api('/farm', { method: 'POST', body: { farm_name: '' }, farm: null })).status, 400);

  const created = await api('/farm', {
    method: 'POST',
    farm: null,
    body: { farm_name: 'Test Acres', location: 'Asheville, NC', state: 'nc', growing_zone: '7a', acreage: '5', farming_goals: ['eggs', 'fiber'] },
  });
  assert.equal(created.status, 201);
  farmId = created.body.id;
  assert.equal(created.body.acreage, 5);
  assert.equal(created.body.state, 'NC');
  assert.equal((await api('/farm', { method: 'POST', farm: null, body: { farm_name: 'X', state: 'ZZ' } })).status, 400);

  assert.equal((await api('/farm')).body.farm_name, 'Test Acres');
  const updated = await api('/farm', { method: 'PUT', body: { ...created.body, farm_name: 'Test Acres Farm' } });
  assert.equal(updated.body.farm_name, 'Test Acres Farm');
  assert.equal((await api('/farm', { farm: null })).status, 400);
});

test('farm plans: add, update, list, delete', async () => {
  const [plant] = (await api('/plants?search=garlic')).body;
  const [breed] = (await api('/breeds?search=katahdin')).body;

  const addPlant = await api('/farm-plans', { method: 'POST', body: { type: 'plant', item_id: plant.id, planting_date: '2026-10-20' } });
  assert.equal(addPlant.status, 201);
  assert.equal(addPlant.body.planting_date, '2026-10-20');
  await api('/farm-plans', { method: 'POST', body: { type: 'breed', item_id: breed.id } });

  const patched = await api(`/farm-plans/plant/${addPlant.body.id}`, { method: 'PATCH', body: { notes: 'Hardneck' } });
  assert.equal(patched.body.notes, 'Hardneck');

  const plans = await api('/farm-plans');
  assert.equal(plans.body.plants[0].common_name, 'Garlic');
  assert.equal(plans.body.breeds[0].breed_name, 'Katahdin');

  assert.equal((await api(`/farm-plans/plant/${addPlant.body.id}`, { method: 'DELETE' })).status, 204);
  assert.equal((await api('/farm-plans')).body.plants.length, 0);
  assert.equal((await api('/farm-plans', { method: 'POST', body: { type: 'tractor', item_id: 1 } })).status, 400);
});
