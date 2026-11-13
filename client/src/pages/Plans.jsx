import { Link } from 'react-router';
import { useState } from 'react';
import { useFarm } from '../context/FarmContext.jsx';
import { plantingWindows, harvestFor, fromISO, formatRange, outdoorLabel } from '../lib/planting.js';
import { categoryLabel, capitalize } from '../lib/options.js';
import { ArtTile } from '../components/Illustration.jsx';
import { Loading, EmptyState, NeedFarm } from '../components/States.jsx';
import { CATEGORY_SKETCHES } from '../lib/sketches.js';
import Stitched from '../components/Stitched.jsx';

function NotesField({ value, onSave, label }) {
  const [text, setText] = useState(value ?? '');
  const [saved, setSaved] = useState(false);
  const commit = async () => {
    if ((value ?? '') === text) return;
    await onSave(text);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };
  return (
    <div className="notes-field">
      <textarea className="input" rows={2} value={text} onChange={(e) => setText(e.target.value)} onBlur={commit} placeholder="Notes: variety, bed, supplier…" aria-label={label} maxLength={2000} />
      {saved && <span className="saved-flag">Saved</span>}
    </div>
  );
}

function GardenRow({ plant }) {
  const { zone, updatePlan, removePlan, notify } = useFarm();
  const [busy, setBusy] = useState(false);
  const save = (patch) => updatePlan('plant', plant.plan_id, patch).catch((e) => notify(e.message, 'error'));

  const windows = zone ? plantingWindows(plant, zone).filter((w) => w.kind !== 'indoor') : [];
  const date = plant.planting_date ? fromISO(plant.planting_date) : null;
  const harvest = date ? harvestFor(plant, date, date, zone) : null;

  return (
    <article className="plan-row">
      <Link to={`/grow/${plant.id}`} className="plan-row-head">
        <ArtTile kind={plant.category} size="sm" image={plant.image_url} credit={plant.image_credit} />
        <span>
          <strong>{plant.common_name}</strong>
          <small className="botanical">{plant.botanical_name}</small>
        </span>
      </Link>
      <div className="plan-row-body">
        <div className="plan-cell">
          <label className="field-label" htmlFor={`d-${plant.plan_id}`}>{outdoorLabel(plant)}</label>
          <input id={`d-${plant.plan_id}`} type="date" className="input" defaultValue={plant.planting_date ?? ''} onChange={(e) => save({ planting_date: e.target.value || null })} />
          {windows.length > 0 && (
            <small className="muted">Suggested: {windows.map((w) => formatRange(w.start, w.end)).join(' or ')}</small>
          )}
        </div>
        <div className="plan-cell">
          <span className="field-label">Expected harvest</span>
          <span className="plan-value">
            {harvest?.start ? formatRange(harvest.start, harvest.end) : harvest?.note ?? (plant.dtm_min == null ? plant.days_to_maturity : 'Set a planting date')}
          </span>
          {harvest?.warning && <small className="window-warn">{harvest.warning}</small>}
          <small className="muted">{plant.seasons.map(capitalize).join(' / ')} · {plant.spacing.split(';')[0]}</small>
        </div>
        <div className="plan-cell plan-notes">
          <NotesField value={plant.notes} label={`Notes for ${plant.common_name}`} onSave={(notes) => save({ notes })} />
        </div>
      </div>
      <button className="link-btn danger" disabled={busy} onClick={async () => { setBusy(true); await removePlan('plant', plant.plan_id, plant.common_name).catch((e) => { notify(e.message, 'error'); setBusy(false); }); }}>
        Remove
      </button>
    </article>
  );
}

function BreedRow({ breed }) {
  const { updatePlan, removePlan, notify } = useFarm();
  const [busy, setBusy] = useState(false);
  return (
    <article className="plan-row">
      <Link to={`/raise/${breed.id}`} className="plan-row-head">
        <ArtTile kind={breed.category} size="sm" image={breed.image_url} credit={breed.image_credit} />
        <span>
          <strong>{breed.breed_name}</strong>
          <small>{categoryLabel(breed.category)} · {breed.primary_purpose}</small>
        </span>
      </Link>
      <div className="plan-row-body">
        <div className="plan-cell plan-wide">
          <span className="field-label">Management to plan for</span>
          <p className="plan-text">{breed.space_management}</p>
        </div>
        <div className="plan-cell plan-notes">
          <NotesField value={breed.notes} label={`Notes for ${breed.breed_name}`} onSave={(notes) => updatePlan('breed', breed.plan_id, { notes }).catch((e) => notify(e.message, 'error'))} />
        </div>
      </div>
      <button className="link-btn danger" disabled={busy} onClick={async () => { setBusy(true); await removePlan('breed', breed.plan_id, breed.breed_name).catch((e) => { notify(e.message, 'error'); setBusy(false); }); }}>
        Remove
      </button>
    </article>
  );
}

export default function Plans() {
  const { farm, plans, status } = useFarm();
  if (status === 'loading') return <div className="container page"><Loading /></div>;
  if (!farm) {
    return (
      <div className="container narrow page">
        <header className="page-header"><p className="eyebrow">My Plans</p><h1>Your farm plan</h1></header>
        <NeedFarm what="start saving plants and breeds to your plan" />
      </div>
    );
  }

  return (
    <div className="container page">
      <header className="page-header row-between">
        <div>
          <p className="eyebrow">My Plans</p>
          <h1 className="title-with-sketch">
            <img className="title-sketch title-sketch-lg" src={CATEGORY_SKETCHES.sheep} alt="" aria-hidden="true" />
            <Stitched>{farm.farm_name} plan</Stitched>
            <img className="title-sketch title-sketch-lg title-sketch-goat" src={CATEGORY_SKETCHES.goats} alt="" aria-hidden="true" />
          </h1>
          <p className="lede">Adjust planting dates and keep notes. Changes save automatically.</p>
        </div>
        {(plans.plants.length > 0 || plans.breeds.length > 0) && (
          <button className="btn btn-ghost btn-sm no-print" onClick={() => window.print()}>Print plan</button>
        )}
      </header>

      <section className="plan-section" aria-labelledby="garden-h">
        <div className="panel-head">
          <h2 id="garden-h" className="section-title">Garden <span className="count">{plans.plants.length}</span></h2>
          <Link to="/grow" className="text-link no-print">+ Add plants</Link>
        </div>
        {plans.plants.length ? plans.plants.map((p) => <GardenRow key={p.plan_id} plant={p} />) : (
          <EmptyState title="No plants yet" action="Browse the garden library" to="/grow">Add crops to get planting dates and harvest estimates.</EmptyState>
        )}
      </section>

      <section className="plan-section" aria-labelledby="livestock-plan-h">
        <div className="panel-head">
          <h2 id="livestock-plan-h" className="section-title">Livestock <span className="count">{plans.breeds.length}</span></h2>
          <Link to="/raise" className="text-link no-print">+ Add breeds</Link>
        </div>
        {plans.breeds.length ? plans.breeds.map((b) => <BreedRow key={b.plan_id} breed={b} />) : (
          <EmptyState title="No breeds yet" action="Explore breeds" to="/raise">Save breeds you're considering and keep notes as you research.</EmptyState>
        )}
      </section>
    </div>
  );
}
