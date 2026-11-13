import { Link, useParams } from 'react-router';
import { useFarm } from '../context/FarmContext.jsx';
import { api } from '../lib/api.js';
import { useApi } from '../lib/useApi.js';
import { capitalize, categoryLabel, SPACE_LABELS, labelFor, PURPOSES } from '../lib/options.js';
import { ArtTile, PhotoCredit } from '../components/Illustration.jsx';
import { AddBreedButton } from '../components/Cards.jsx';
import { Loading, ErrorState } from '../components/States.jsx';
import Sources from '../components/Sources.jsx';
import { HERITAGE_CONSERVATION, CATEGORY_RESOURCES, localHelpLinks } from '../lib/resources.js';
import ConservationBadge from '../components/ConservationBadge.jsx';
import { STATUS_INFO, NOT_LISTED, CPL_URL } from '../lib/conservation.js';
import { formatDate, fromISO } from '../lib/planting.js';

function ConservationPanel({ breed }) {
  const info = STATUS_INFO[breed.conservation_status];
  const checked = breed.conservation_checked ? formatDate(fromISO(breed.conservation_checked)) : null;
  return (
    <section className={`panel conservation ${info ? `cons-panel-${info.tone}` : ''}`} aria-labelledby="cons-h">
      <h2 id="cons-h" className="panel-title">Conservation status</h2>
      {info ? (
        <>
          <p className="cons-status"><ConservationBadge status={breed.conservation_status} size="md" /></p>
          <p>{info.summary}</p>
          {breed.conservation_note && <p className="cons-note">{breed.conservation_note}</p>}
          <p>
            Raising a listed breed, and registering offspring, directly helps keep it from disappearing.{' '}
            <a href={breed.conservation_url} target="_blank" rel="noreferrer">See this breed on The Livestock Conservancy<span className="sr-only"> (opens in a new tab)</span></a>
          </p>
        </>
      ) : (
        <p>{NOT_LISTED}</p>
      )}
      <p className="fine-print">
        Source: <a href={CPL_URL} target="_blank" rel="noreferrer">The Livestock Conservancy Conservation Priority List</a>
        {checked && <>, checked {checked}</>}. Statuses are reviewed every year.
      </p>
    </section>
  );
}

export default function BreedDetail() {
  const { id } = useParams();
  const { compare, toggleCompare, farm } = useFarm();
  const { data: breed, error, loading, retry } = useApi(() => api.breed(id), id);

  if (loading) return <div className="container page"><Loading /></div>;
  if (error) return <div className="container page"><ErrorState message={error} onRetry={retry} /></div>;

  const comparing = compare.includes(breed.id);
  const facts = [
    ['Origin', breed.origin],
    ['Primary purpose', breed.primary_purpose],
    ['Size', breed.size],
    ['Temperament', breed.temperament],
    ['Climate', breed.climate_adaptability],
    ['Space', SPACE_LABELS[breed.space_needs]],
    ['Experience', `${capitalize(breed.experience_level)} friendly`],
  ];

  return (
    <div className="container page with-tray">
      <Link to={`/raise?category=${breed.category}`} className="back-link">← {categoryLabel(breed.category)}</Link>
      <header className="detail-hero">
        <figure className="hero-figure">
          <ArtTile kind={breed.category} size="lg" image={breed.image_url} credit={breed.image_credit} label={`${breed.breed_name} ${categoryLabel(breed.category).toLowerCase()}`} />
          <PhotoCredit credit={breed.image_url ? breed.image_credit : null} />
        </figure>
        <div>
          <p className="eyebrow">{categoryLabel(breed.category)}</p>
          <h1>{breed.breed_name}</h1>
          {breed.conservation_status && (
            <p className="hero-status"><ConservationBadge status={breed.conservation_status} size="md" /> on The Livestock Conservancy's priority list</p>
          )}
          <div className="chip-row">
            {breed.purposes.map((p) => <span key={p} className="chip chip-accent">{labelFor(PURPOSES, p)}</span>)}
            {breed.climate_tags.map((t) => <span key={t} className="chip chip-soft">{capitalize(t)}</span>)}
          </div>
          <p className="lede">{breed.description}</p>
          <div className="hero-actions">
            <AddBreedButton breed={breed} />
            <button className={`btn btn-sm ${comparing ? 'btn-added' : 'btn-secondary'}`} onClick={() => toggleCompare(breed.id)} aria-pressed={comparing}>
              {comparing ? '✓ Comparing' : 'Add to compare'}
            </button>
          </div>
        </div>
      </header>

      <div className="detail-grid">
        <div className="detail-main">
          <section className="panel">
            <h2 className="panel-title">Breed profile</h2>
            <dl className="facts">{facts.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
          </section>
          <section className="panel prose">
            <h2 className="panel-title">Distinguishing characteristics</h2>
            <p>{breed.characteristics}</p>
          </section>
          <Sources
            groups={[
              {
                title: 'Breed registry & associations',
                links: breed.registries,
                empty: breed.category === 'chickens' && breed.breed_name === 'Cornish Cross'
                  ? 'Cornish Cross is a commercial hybrid, so there is no breed registry. Buy chicks from an NPIP-certified hatchery.'
                  : 'We haven\'t verified a registry link for this breed yet. The Livestock Conservancy\'s breeder directory is a good place to start.',
              },
              { title: 'Heritage breed conservation', links: HERITAGE_CONSERVATION },
              { title: `Raising ${categoryLabel(breed.category).toLowerCase()}`, links: CATEGORY_RESOURCES[breed.category] },
              { title: 'References for this profile', links: breed.sources },
              { title: 'Find local help', links: localHelpLinks(farm) },
            ]}
            note="Summarized from breed associations and livestock references. Talk with local breeders, your extension office, and a large-animal veterinarian before buying stock."
          />
        </div>
        <aside className="detail-side">
          <ConservationPanel breed={breed} />
          <section className="panel management">
            <h2 className="panel-title">Space &amp; management</h2>
            <p>{breed.space_management}</p>
            <p className="fine-print">
              How many animals your land supports depends on climate, pasture quality, soil, and management.
              Your county extension agent can help you estimate stocking rates for your property.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
