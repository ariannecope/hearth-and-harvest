import { httpError } from '../errors.js';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// No accounts in the MVP: the browser keeps its farm's UUID and sends it as X-Farm-Id.
export function requireFarmId(req, _res, next) {
  const id = req.get('X-Farm-Id');
  if (!id || !UUID.test(id)) return next(httpError(400, 'Missing or invalid X-Farm-Id header'));
  req.farmId = id;
  next();
}
