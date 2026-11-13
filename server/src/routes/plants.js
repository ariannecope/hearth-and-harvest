import { Router } from 'express';
import { query } from '../db.js';
import { httpError } from '../errors.js';

const router = Router();

// GET /api/plants?search=tom&category=vegetable&season=spring&zone=6
router.get('/', async (req, res) => {
  const { search, category, season, zone } = req.query;
  const where = [];
  const params = [];

  if (search) {
    params.push(`%${search}%`);
    where.push(`(common_name ILIKE $${params.length} OR botanical_name ILIKE $${params.length})`);
  }
  if (category) {
    params.push(category);
    where.push(`category = $${params.length}`);
  }
  if (season) {
    params.push(season);
    where.push(`$${params.length} = ANY(seasons)`);
  }
  if (zone) {
    const z = parseInt(zone, 10);
    if (Number.isNaN(z)) throw httpError(400, 'zone must be a number like 6 or 6b');
    params.push(z);
    where.push(`$${params.length} BETWEEN zone_min AND zone_max`);
  }

  const sql = `SELECT * FROM plants ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY common_name`;
  const { rows } = await query(sql, params);
  res.json(rows);
});

router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) throw httpError(400, 'Invalid plant id');
  const { rows } = await query('SELECT * FROM plants WHERE id = $1', [id]);
  if (!rows.length) throw httpError(404, 'Plant not found');
  res.json(rows[0]);
});

export default router;
