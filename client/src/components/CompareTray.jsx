import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { useFarm } from '../context/FarmContext.jsx';
import { api } from '../lib/api.js';

export default function CompareTray() {
  const { compare, toggleCompare, clearCompare } = useFarm();
  const { pathname } = useLocation();
  const [names, setNames] = useState({});

  useEffect(() => {
    const missing = compare.filter((id) => !names[id]);
    if (!missing.length) return;
    api.breeds({ ids: missing.join(',') })
      .then((rows) => setNames((n) => ({ ...n, ...Object.fromEntries(rows.map((r) => [r.id, r.breed_name])) })))
      .catch(() => {});
  }, [compare, names]);

  if (!compare.length || pathname.startsWith('/raise/compare') || !pathname.startsWith('/raise')) return null;

  return (
    <aside className="compare-tray" aria-label="Breeds selected for comparison">
      <div className="container compare-tray-inner">
        <div className="compare-tray-items">
          <span className="compare-tray-label">Compare</span>
          {compare.map((id) => (
            <button key={id} className="chip chip-removable" onClick={() => toggleCompare(id)} aria-label={`Remove ${names[id] ?? 'breed'} from comparison`}>
              {names[id] ?? '…'} <span aria-hidden="true">×</span>
            </button>
          ))}
        </div>
        <div className="compare-tray-actions">
          <button className="btn btn-ghost btn-sm" onClick={clearCompare}>Clear</button>
          {compare.length >= 2 ? (
            <Link to={`/raise/compare?ids=${compare.join(',')}`} className="btn btn-primary btn-sm">
              Compare {compare.length} breeds
            </Link>
          ) : (
            <span className="compare-hint">Pick one more breed</span>
          )}
        </div>
      </div>
    </aside>
  );
}
