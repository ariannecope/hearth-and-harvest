import { Link } from 'react-router';
import { useState } from 'react';
import { ArtTile } from './Illustration.jsx';
import { useFarm } from '../context/FarmContext.jsx';
import { plantingWindows, formatRange, suggestedPlantingDate } from '../lib/planting.js';
import { capitalize, categoryLabel, SPACE_LABELS } from '../lib/options.js';
import ConservationBadge from './ConservationBadge.jsx';

function useAsyncAction() {
  const [busy, setBusy] = useState(false);
  const { notify } = useFarm();
  const run = async (fn) => {
    setBusy(true);
    try {
      await fn();
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setBusy(false);
    }
  };
  return [busy, run];
}

export function AddPlantButton({ plant, date, className = '' }) {
  const { farm, zone, plantPlanIds, addPlant } = useFarm();
  const [busy, run] = useAsyncAction();
  if (!farm) return <Link to="/farm" className={`btn btn-secondary btn-sm ${className}`}>Set up farm to add</Link>;
  if (plantPlanIds.has(plant.id)) {
    return <Link to="/plans" className={`btn btn-added btn-sm ${className}`}>✓ In your garden</Link>;
  }
  return (
    <button
      className={`btn btn-primary btn-sm ${className}`}
      disabled={busy}
      onClick={() => run(() => addPlant(plant, date ?? suggestedPlantingDate(plant, zone)))}
    >
      {busy ? 'Adding…' : '+ Add to garden'}
    </button>
  );
}

export function AddBreedButton({ breed, className = '' }) {
  const { farm, breedPlanIds, addBreed } = useFarm();
  const [busy, run] = useAsyncAction();
  if (!farm) return <Link to="/farm" className={`btn btn-secondary btn-sm ${className}`}>Set up farm to add</Link>;
  if (breedPlanIds.has(breed.id)) {
    return <Link to="/plans" className={`btn btn-added btn-sm ${className}`}>✓ In your plan</Link>;
  }
  return (
    <button className={`btn btn-primary btn-sm ${className}`} disabled={busy} onClick={() => run(() => addBreed(breed))}>
      {busy ? 'Adding…' : '+ Add to farm'}
    </button>
  );
}

export function PlantCard({ plant, reasons }) {
  const { zone } = useFarm();
  const inZone = !zone || (zone >= plant.zone_min && zone <= plant.zone_max);
  const next = zone && inZone ? plantingWindows(plant, zone).find((w) => w.kind !== 'indoor') : null;

  return (
    <article className="card plant-card">
      <Link to={`/grow/${plant.id}`} className="card-link" aria-label={`${plant.common_name} details`}>
        <ArtTile kind={plant.category} image={plant.image_url} credit={plant.image_credit} />
        <div className="card-body">
          <p className="eyebrow">{capitalize(plant.category)}</p>
          <h3 className="card-title">{plant.common_name}</h3>
          <p className="botanical">{plant.botanical_name}</p>
        </div>
      </Link>
      <div className="card-meta">
        {reasons ? (
          <ul className="reasons">{reasons.slice(0, 2).map((r) => <li key={r}>{r}</li>)}</ul>
        ) : next ? (
          <p className="window-line"><span>{next.label}</span> {formatRange(next.start, next.end)}</p>
        ) : zone && !inZone ? (
          <p className="window-line muted">Not typically suited to zone {zone}</p>
        ) : (
          <p className="window-line muted">{plant.days_to_maturity}</p>
        )}
        <div className="chip-row">
          {plant.seasons.map((s) => <span key={s} className="chip chip-soft">{capitalize(s)}</span>)}
          {plant.beginner_friendly && <span className="chip chip-soft">Easy</span>}
        </div>
      </div>
      <div className="card-actions"><AddPlantButton plant={plant} /></div>
    </article>
  );
}

export function BreedCard({ breed, reasons, cautions, showCompare = true }) {
  const { compare, toggleCompare } = useFarm();
  const selected = compare.includes(breed.id);
  return (
    <article className={`card breed-card ${selected ? 'is-selected' : ''}`}>
      <Link to={`/raise/${breed.id}`} className="card-link" aria-label={`${breed.breed_name} details`}>
        <ArtTile kind={breed.category} image={breed.image_url} credit={breed.image_credit} />
        <div className="card-body">
          <p className="eyebrow">{categoryLabel(breed.category)}</p>
          <h3 className="card-title">{breed.breed_name}</h3>
          {breed.conservation_status && <ConservationBadge status={breed.conservation_status} />}
          <p className="card-sub">{breed.primary_purpose}</p>
        </div>
      </Link>
      <div className="card-meta">
        {reasons ? (
          <ul className="reasons">
            {reasons.slice(0, 2).map((r) => <li key={r}>{r}</li>)}
            {cautions?.slice(0, 1).map((c) => <li key={c} className="caution">{c}</li>)}
          </ul>
        ) : (
          <div className="chip-row">
            <span className="chip chip-soft">{SPACE_LABELS[breed.space_needs]}</span>
            {breed.climate_tags.slice(0, 2).map((t) => <span key={t} className="chip chip-soft">{capitalize(t)}</span>)}
          </div>
        )}
      </div>
      <div className="card-actions">
        {showCompare && (
          <label className="compare-check">
            <input type="checkbox" checked={selected} onChange={() => toggleCompare(breed.id)} />
            Compare
          </label>
        )}
        <AddBreedButton breed={breed} />
      </div>
    </article>
  );
}
