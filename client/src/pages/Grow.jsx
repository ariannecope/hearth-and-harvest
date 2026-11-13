import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { useFarm } from '../context/FarmContext.jsx';
import { api } from '../lib/api.js';
import { useApi, useDebounced } from '../lib/useApi.js';
import { PLANT_CATEGORIES, SEASONS } from '../lib/options.js';
import { SUPPORTED_ZONES } from '../lib/planting.js';
import { PlantCard } from '../components/Cards.jsx';
import { CategoryIcon } from '../components/Illustration.jsx';
import { Loading, ErrorState, EmptyState } from '../components/States.jsx';

export default function Grow() {
  const { zone: farmZone } = useFarm();
  const [params, setParams] = useSearchParams();
  const urlSearch = params.get('q') ?? '';
  // Local state keeps typing responsive; the URL catches up after a short pause.
  const [search, setSearch] = useState(urlSearch);
  const category = params.get('category') ?? '';
  const season = params.get('season') ?? '';
  // Default to the farm's zone; "all" shows every zone.
  const zoneParam = params.get('zone');
  const zone = zoneParam === 'all' ? '' : zoneParam ?? (farmZone ? String(farmZone) : '');

  const update = (key, value) => {
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value === '' || value == null) next.delete(key);
      else next.set(key, value);
      return next;
    }, { replace: true });
  };

  const q = useDebounced(search);
  useEffect(() => {
    if (q !== urlSearch) update('q', q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);
  useEffect(() => {
    if (urlSearch !== search && urlSearch !== q) setSearch(urlSearch); // back/forward or reset
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlSearch]);
  const query = { search: q, category, season, zone };
  const { data, error, loading, retry } = useApi(() => api.plants(query), JSON.stringify(query));
  const filtersOn = search || category || season || (zoneParam && zoneParam !== String(farmZone));
  // "All plants" and "Reset" clear every filter (zone goes back to the farm's zone).
  const resetFilters = () => {
    setSearch('');
    setParams({}, { replace: true });
  };

  return (
    <div className="container page">
      <header className="page-header">
        <p className="eyebrow">Grow</p>
        <h1>The garden library</h1>
        <p className="lede">Vegetables, herbs, and fruit with growing details and planting windows for your zone.</p>
      </header>

      <div className="category-strip" role="group" aria-label="Plant category">
        <button className={`category-btn ${!category ? 'is-on' : ''}`} onClick={resetFilters} aria-pressed={!category}>
          <span className="category-all">All</span>
          <span>All plants</span>
        </button>
        {PLANT_CATEGORIES.map((c) => (
          <button key={c.id} className={`category-btn ${category === c.id ? 'is-on' : ''}`} onClick={() => update('category', c.id)} aria-pressed={category === c.id}>
            <CategoryIcon kind={c.id} />
            <span>{c.label}</span>
          </button>
        ))}
      </div>

      <div className="filters" role="search">
        <div className="search-field">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></svg>
          <input className="input" type="search" placeholder="Search plants, e.g. tomato or Allium" aria-label="Search plants" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="input select-sm" aria-label="Planting season" value={season} onChange={(e) => update('season', e.target.value)}>
          <option value="">Any season</option>
          {SEASONS.map((s) => <option key={s.id} value={s.id}>{s.label} planting</option>)}
        </select>
        <select className="input select-sm" aria-label="Growing zone" value={zone || 'all'} onChange={(e) => update('zone', e.target.value)}>
          <option value="all">All zones</option>
          {SUPPORTED_ZONES.map((z) => <option key={z} value={z}>Zone {z}{z === farmZone ? ' (my farm)' : ''}</option>)}
        </select>
        {filtersOn && <button className="btn btn-ghost btn-sm" onClick={resetFilters}>Reset</button>}
      </div>

      {error ? (
        <ErrorState message={error} onRetry={retry} />
      ) : loading && !data ? (
        <Loading label="Gathering seeds…" />
      ) : !data?.length ? (
        <EmptyState title="No plants match those filters">Try a different search, or widen the season or zone.</EmptyState>
      ) : (
        <>
          <p className="result-count" aria-live="polite">{data.length} {data.length === 1 ? 'plant' : 'plants'}{zone ? ` suited to zone ${zone}` : ''}</p>
          <div className={`card-grid ${loading ? 'is-stale' : ''}`}>
            {data.map((p) => <PlantCard key={p.id} plant={p} />)}
          </div>
        </>
      )}
    </div>
  );
}
