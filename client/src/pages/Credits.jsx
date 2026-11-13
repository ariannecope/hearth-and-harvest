import { Link } from 'react-router';
import { api } from '../lib/api.js';
import { useApi } from '../lib/useApi.js';
import { categoryLabel } from '../lib/options.js';
import { ArtTile, PhotoCredit } from '../components/Illustration.jsx';
import { Loading, ErrorState } from '../components/States.jsx';

function CreditList({ title, items }) {
  const withPhotos = items.filter((i) => i.image_url && i.image_credit);
  if (!withPhotos.length) return null;
  return (
    <section className="panel" aria-label={title}>
      <h2 className="panel-title">{title}</h2>
      <ul className="credit-list">
        {withPhotos.map((i) => (
          <li key={i.id}>
            <ArtTile kind={i.category} size="sm" image={i.image_url} credit={i.image_credit} />
            <div>
              <Link to={i.to}><strong>{i.name}</strong></Link>
              <PhotoCredit credit={i.image_credit} />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function Credits() {
  const plantsQ = useApi(() => api.plants(), 'all-plants');
  const breedsQ = useApi(() => api.breeds(), 'all-breeds');

  return (
    <div className="container narrow page">
      <header className="page-header">
        <p className="eyebrow">Thank you</p>
        <h1>Photo credits</h1>
        <p className="lede">
          Plant and breed photos come from Wikimedia Commons and iNaturalist contributors, used under the licenses listed.
          Sketches and illustrations are original to Hearth &amp; Harvest.
        </p>
      </header>
      {plantsQ.error || breedsQ.error ? (
        <ErrorState message={plantsQ.error || breedsQ.error} onRetry={() => { plantsQ.retry(); breedsQ.retry(); }} />
      ) : plantsQ.loading || breedsQ.loading ? (
        <Loading />
      ) : (
        <>
          <CreditList
            title="Garden"
            items={plantsQ.data.map((p) => ({ ...p, name: p.common_name, to: `/grow/${p.id}` }))}
          />
          <CreditList
            title="Livestock"
            items={breedsQ.data.map((b) => ({ ...b, name: `${b.breed_name} (${categoryLabel(b.category)})`, to: `/raise/${b.id}` }))}
          />
        </>
      )}
    </div>
  );
}
