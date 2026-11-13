import { Router } from 'express';
import { query } from '../db.js';
import { httpError } from '../errors.js';

const router = Router();

// GET /api/breeds?search=&category=sheep&purpose=fiber&ids=1,4&conservation=listed
router.get('/', async (req, res) => {
  const { search, category, purpose, ids, conservation } = req.query;
  const where = [];
  const params = [];

  if (search) {
    params.push(`%${search}%`);
    where.push(`breed_name ILIKE $${params.length}`);
  }
  if (category) {
    params.push(category);
    where.push(`category = $${params.length}`);
  }
  if (purpose) {
    params.push(purpose);
    where.push(`$${params.length} = ANY(purposes)`);
  }
  if (conservation === 'listed') where.push('conservation_status IS NOT NULL');
  if (ids) {
    const list = String(ids).split(',').map(Number).filter(Number.isInteger);
    if (!list.length) throw httpError(400, 'ids must be a comma-separated list of numbers');
    params.push(list);
    where.push(`id = ANY($${params.length}::int[])`);
  }

  const sql = `SELECT * FROM livestock_breeds ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY category, breed_name`;
  const { rows } = await query(sql, params);
  res.json(rows);
});

router.get('/category/:category', async (req, res) => {
  const { rows } = await query(
    'SELECT * FROM livestock_breeds WHERE category = $1 ORDER BY breed_name',
    [req.params.category],
  );
  res.json(rows);
});

router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) throw httpError(400, 'Invalid breed id');
  const { rows } = await query('SELECT * FROM livestock_breeds WHERE id = $1', [id]);
  if (!rows.length) throw httpError(404, 'Breed not found');
  res.json(rows[0]);
});

export default router;
