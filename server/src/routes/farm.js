import { Router } from 'express';
import { query } from '../db.js';
import { httpError } from '../errors.js';
import { requireFarmId } from './farmId.js';

const router = Router();

const STATES = new Set('AL AK AZ AR CA CO CT DE DC FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY'.split(' '));

function cleanList(value) {
  if (value == null) return [];
  if (!Array.isArray(value)) throw httpError(400, 'Interests and goals must be lists');
  return value.map((v) => String(v).trim()).filter(Boolean).slice(0, 20);
}

function parseFarm(body = {}) {
  const farm_name = String(body.farm_name ?? '').trim();
  if (!farm_name) throw httpError(400, 'Please give your farm or homestead a name.');
  if (farm_name.length > 120) throw httpError(400, 'Farm name is too long.');

  let acreage = null;
  if (body.acreage !== '' && body.acreage != null) {
    acreage = Number(body.acreage);
    if (!Number.isFinite(acreage) || acreage < 0 || acreage > 1_000_000) {
      throw httpError(400, 'Acreage must be a positive number.');
    }
  }

  const growing_zone = body.growing_zone ? String(body.growing_zone).trim().toLowerCase() : null;
  if (growing_zone && !/^\d{1,2}[ab]?$/.test(growing_zone)) {
    throw httpError(400, 'Growing zone should look like 6 or 6b.');
  }

  const state = body.state ? String(body.state).trim().toUpperCase() : null;
  if (state && !STATES.has(state)) throw httpError(400, 'State should be a two-letter U.S. state code.');

  return {
    farm_name,
    state,
    location: body.location ? String(body.location).trim().slice(0, 120) : null,
    growing_zone,
    acreage,
    farming_interests: cleanList(body.farming_interests),
    farming_goals: cleanList(body.farming_goals),
  };
}

router.post('/', async (req, res) => {
  const f = parseFarm(req.body);
  const { rows } = await query(
    `INSERT INTO farms (farm_name, location, state, growing_zone, acreage, farming_interests, farming_goals)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [f.farm_name, f.location, f.state, f.growing_zone, f.acreage, f.farming_interests, f.farming_goals],
  );
  res.status(201).json(rows[0]);
});

router.get('/', requireFarmId, async (req, res) => {
  const { rows } = await query('SELECT * FROM farms WHERE id = $1', [req.farmId]);
  if (!rows.length) throw httpError(404, 'Farm not found');
  res.json(rows[0]);
});

router.put('/', requireFarmId, async (req, res) => {
  const f = parseFarm(req.body);
  const { rows } = await query(
    `UPDATE farms SET farm_name = $2, location = $3, state = $4, growing_zone = $5, acreage = $6,
       farming_interests = $7, farming_goals = $8, updated_at = now()
     WHERE id = $1 RETURNING *`,
    [req.farmId, f.farm_name, f.location, f.state, f.growing_zone, f.acreage, f.farming_interests, f.farming_goals],
  );
  if (!rows.length) throw httpError(404, 'Farm not found');
  res.json(rows[0]);
});

export default router;
