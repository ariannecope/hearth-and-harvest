import { Router } from 'express';
import { query } from '../db.js';
import { httpError } from '../errors.js';
import { requireFarmId } from './farmId.js';

const router = Router();
router.use(requireFarmId);

const TYPES = {
  plant: { table: 'farm_plants', fk: 'plant_id', ref: 'plants' },
  breed: { table: 'farm_breeds', fk: 'breed_id', ref: 'livestock_breeds' },
};

function typeOf(value) {
  const t = TYPES[value];
  if (!t) throw httpError(400, 'type must be "plant" or "breed"');
  return t;
}

function parseDate(value) {
  if (value == null || value === '') return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(value))) {
    throw httpError(400, 'planting_date must be YYYY-MM-DD');
  }
  return value;
}

const cleanNotes = (n) => (n == null ? null : String(n).slice(0, 2000));

async function assertFarm(farmId) {
  const { rowCount } = await query('SELECT 1 FROM farms WHERE id = $1', [farmId]);
  if (!rowCount) throw httpError(404, 'Farm not found. Create a farm profile first.');
}

// GET /api/farm-plans -> { plants: [...], breeds: [...] } with full reference data joined in.
router.get('/', async (req, res) => {
  const [plants, breeds] = await Promise.all([
    query(
      `SELECT fp.id AS plan_id, fp.planting_date, fp.notes, fp.created_at AS added_at, p.*
       FROM farm_plants fp JOIN plants p ON p.id = fp.plant_id
       WHERE fp.farm_id = $1 ORDER BY p.common_name`,
      [req.farmId],
    ),
    query(
      `SELECT fb.id AS plan_id, fb.notes, fb.created_at AS added_at, b.*
       FROM farm_breeds fb JOIN livestock_breeds b ON b.id = fb.breed_id
       WHERE fb.farm_id = $1 ORDER BY b.category, b.breed_name`,
      [req.farmId],
    ),
  ]);
  res.json({ plants: plants.rows, breeds: breeds.rows });
});

// POST /api/farm-plans { type: 'plant'|'breed', item_id, planting_date?, notes? }
router.post('/', async (req, res) => {
  const { type, item_id, planting_date, notes } = req.body ?? {};
  const t = typeOf(type);
  const itemId = Number(item_id);
  if (!Number.isInteger(itemId)) throw httpError(400, 'item_id is required');
  await assertFarm(req.farmId);

  const exists = await query(`SELECT 1 FROM ${t.ref} WHERE id = $1`, [itemId]);
  if (!exists.rowCount) throw httpError(404, `That ${type} does not exist`);

  const { rows } =
    type === 'plant'
      ? await query(
          `INSERT INTO farm_plants (farm_id, plant_id, planting_date, notes) VALUES ($1, $2, $3, $4)
           ON CONFLICT (farm_id, plant_id) DO UPDATE SET planting_date = COALESCE(EXCLUDED.planting_date, farm_plants.planting_date)
           RETURNING *`,
          [req.farmId, itemId, parseDate(planting_date), cleanNotes(notes)],
        )
      : await query(
          `INSERT INTO farm_breeds (farm_id, breed_id, notes) VALUES ($1, $2, $3)
           ON CONFLICT (farm_id, breed_id) DO UPDATE SET notes = COALESCE(EXCLUDED.notes, farm_breeds.notes)
           RETURNING *`,
          [req.farmId, itemId, cleanNotes(notes)],
        );
  res.status(201).json(rows[0]);
});

// PATCH /api/farm-plans/:type/:id { planting_date?, notes? }
router.patch('/:type/:id', async (req, res) => {
  const t = typeOf(req.params.type);
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) throw httpError(400, 'Invalid id');
  const body = req.body ?? {};

  const sets = [];
  const params = [id, req.farmId];
  if ('notes' in body) {
    params.push(cleanNotes(body.notes));
    sets.push(`notes = $${params.length}`);
  }
  if (req.params.type === 'plant' && 'planting_date' in body) {
    params.push(parseDate(body.planting_date));
    sets.push(`planting_date = $${params.length}`);
  }
  if (!sets.length) throw httpError(400, 'Nothing to update');

  const { rows } = await query(
    `UPDATE ${t.table} SET ${sets.join(', ')} WHERE id = $1 AND farm_id = $2 RETURNING *`,
    params,
  );
  if (!rows.length) throw httpError(404, 'Plan item not found');
  res.json(rows[0]);
});

// DELETE /api/farm-plans/:type/:id
router.delete('/:type/:id', async (req, res) => {
  const t = typeOf(req.params.type);
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) throw httpError(400, 'Invalid id');
  const { rowCount } = await query(`DELETE FROM ${t.table} WHERE id = $1 AND farm_id = $2`, [id, req.farmId]);
  if (!rowCount) throw httpError(404, 'Plan item not found');
  res.status(204).end();
});

export default router;
