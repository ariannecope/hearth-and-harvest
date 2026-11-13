import { Link, useSearchParams, useNavigate } from 'react-router';
import { useFarm } from '../context/FarmContext.jsx';
import { api } from '../lib/api.js';
import { useApi } from '../lib/useApi.js';
import { capitalize, categoryLabel, SPACE_LABELS, labelFor, PURPOSES } from '../lib/options.js';
import { ArtTile } from '../components/Illustration.jsx';
import { AddBreedButton } from '../components/Cards.jsx';
import { Loading, ErrorState, EmptyState } from '../components/States.jsx';

const ROWS = [
  ['Category', (b) => categoryLabel(b.category)],
  ['Purpose', (b) => b.purposes.map((p) => labelFor(PURPOSES, p)).join(', ')],
  ['Origin', (b) => b.origin],
  ['Size', (b) => b.size],
  ['Climate', (b) => b.climate_adaptability],
  ['Temperament', (b) => b.temperament],
  ['Space needs', (b) => SPACE_LABELS[b.space_needs]],
  ['Experience', (b) => `${capitalize(b.experience_level)} friendly`],
  ['Conservation status', (b) => b.conservation_status ? `${b.conservation_status} (Livestock Conservancy)` : 'Not on priority list'],
  ['Space & management', (b) => b.space_management],
  ['Characteristics', (b) => b.characteristics],
];

export default function Compare() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { compare, toggleCompare, clearCompare } = useFarm();
  const ids = (params.get('ids') ?? '').split(',').map(Number).filter(Number.isInteger).filter(Boolean);
  const key = ids.join(',');
  const { data, error, loading, retry } = useApi(() => (ids.length ? api.breeds({ ids: key }) : Promise.resolve([])), key);

  if (loading) return <div className="container page"><Loading /></div>;
  if (error) return <div className="container page"><ErrorState message={error} onRetry={retry} /></div>;

  const breeds = ids.map((id) => data.find((b) => b.id === id)).filter(Boolean);
  if (breeds.length < 2) {
    return (
      <div className="container page">
        <EmptyState title="Pick at least two breeds to compare" action="Explore breeds" to="/raise">
          Tick "Compare" on breed cards, then come back here.
        </EmptyState>
      </div>
    );
  }

  const remove = (id) => {
    if (compare.includes(id)) toggleCompare(id);
    const rest = ids.filter((x) => x !== id);
    navigate(rest.length ? `/raise/compare?ids=${rest.join(',')}` : '/raise', { replace: true });
  };

  return (
    <div className="container page">
      <Link to="/raise" className="back-link">← Breed explorer</Link>
      <header className="page-header">
        <p className="eyebrow">Side by side</p>
        <h1>Comparing {breeds.map((b) => b.breed_name).join(' & ')}</h1>
        <p className="lede">Use this to spot tradeoffs and narrow down which breeds to research further with local breeders.</p>
      </header>

      <div className="compare-scroll" role="region" aria-label="Breed comparison table" tabIndex={0}>
        <table className="compare-table" style={{ '--cols': breeds.length }}>
          <thead>
            <tr>
              <th scope="col"><span className="sr-only">Attribute</span></th>
              {breeds.map((b) => (
                <th key={b.id} scope="col">
                  <div className="compare-head">
                    <ArtTile kind={b.category} size="sm" image={b.image_url} credit={b.image_credit} />
                    <Link to={`/raise/${b.id}`} className="compare-name">{b.breed_name}</Link>
                    <button className="link-btn" onClick={() => remove(b.id)} aria-label={`Remove ${b.breed_name} from comparison`}>Remove</button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map(([label, get]) => {
              const values = breeds.map(get);
              const same = values.every((v) => v === values[0]);
              return (
                <tr key={label} className={same ? 'is-same' : ''}>
                  <th scope="row">{label}</th>
                  {values.map((v, i) => <td key={breeds[i].id}>{v}</td>)}
                </tr>
              );
            })}
            <tr className="compare-actions-row">
              <th scope="row"><span className="sr-only">Actions</span></th>
              {breeds.map((b) => <td key={b.id}><AddBreedButton breed={b} /></td>)}
            </tr>
          </tbody>
        </table>
      </div>

      <div className="compare-footer">
        <button className="btn btn-ghost btn-sm" onClick={() => { clearCompare(); navigate('/raise'); }}>Clear comparison</button>
      </div>
    </div>
  );
}
