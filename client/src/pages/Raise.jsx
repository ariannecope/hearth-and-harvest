import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { api } from '../lib/api.js';
import { useApi, useDebounced } from '../lib/useApi.js';
import { LIVESTOCK_CATEGORIES, PURPOSES } from '../lib/options.js';
import { CategoryIcon } from '../components/Illustration.jsx';
import { BreedCard } from '../components/Cards.jsx';
import { Loading, ErrorState, EmptyState } from '../components/States.jsx';

export default function Raise() {
  const [params, setParams] = useSearchParams();
  const urlSearch = params.get('q') ?? '';
  // Local state keeps typing responsive; the URL catches up after a short pause.
  const [search, setSearch] = useState(urlSearch);
  const category = params.get('category') ?? '';
  const purpose = params.get('purpose') ?? '';
  const conservation = params.get('conservation') ?? '';

  const update = (key, value) => {
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      if (!value) next.delete(key);
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
  const query = { search: q, category, purpose, conservation };
  const filtersOn = Boolean(search || category || purpose || conservation);
  // "All breeds" and "Reset" clear every filter, not just the category.
  const resetFilters = () => {
    setSearch('');
    setParams({}, { replace: true });
  };
  const { data, error, loading, retry } = useApi(() => api.breeds(query), JSON.stringify(query));

  return (
    <div className="container page with-tray">
      <header className="page-header">
        <p className="eyebrow">Raise</p>
        <h1>The breed explorer</h1>
        <p className="lede">Heritage and modern breeds chosen for useful diversity. Tick "Compare" on two or more to weigh the tradeoffs side by side.</p>
      </header>

      <div className="category-strip" role="group" aria-label="Livestock category">
        <button className={`category-btn ${!category ? 'is-on' : ''}`} onClick={resetFilters} aria-pressed={!category}>
          <span className="category-all">All</span>
          <span>All breeds</span>
        </button>
        {LIVESTOCK_CATEGORIES.map((c) => (
          <button key={c.id} className={`category-btn ${category === c.id ? 'is-on' : ''}`} onClick={() => update('category', c.id)} aria-pressed={category === c.id}>
            <CategoryIcon kind={c.id} />
            <span>{c.label}</span>
          </button>
        ))}
      </div>

      <div className="filters" role="search">
        <div className="search-field">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></svg>
          <input className="input" type="search" placeholder="Search breeds, e.g. Katahdin" aria-label="Search breeds" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="segmented" role="group" aria-label="Primary purpose">
          <button className={!purpose ? 'is-on' : ''} onClick={() => update('purpose', '')}>Any purpose</button>
          {PURPOSES.map((p) => (
            <button key={p.id} className={purpose === p.id ? 'is-on' : ''} onClick={() => update('purpose', p.id)}>{p.label}</button>
          ))}
        </div>
        <label className={`chip chip-toggle filter-toggle ${conservation ? 'is-on' : ''}`}>
          <input type="checkbox" checked={!!conservation} onChange={(e) => update('conservation', e.target.checked ? 'listed' : '')} />
          Heritage breeds that need keepers
        </label>
        {filtersOn && <button className="btn btn-ghost btn-sm" onClick={resetFilters}>Reset</button>}
      </div>

      {error ? (
        <ErrorState message={error} onRetry={retry} />
      ) : loading && !data ? (
        <Loading label="Rounding up the herd…" />
      ) : !data?.length ? (
        <EmptyState title="No breeds match those filters">Try another category or purpose{conservation ? ', or turn off the heritage filter' : ''}.</EmptyState>
      ) : (
        <>
          <p className="result-count" aria-live="polite">{data.length} {data.length === 1 ? 'breed' : 'breeds'}</p>
          <div className={`card-grid ${loading ? 'is-stale' : ''}`}>
            {data.map((b) => <BreedCard key={b.id} breed={b} />)}
          </div>
        </>
      )}
    </div>
  );
}
