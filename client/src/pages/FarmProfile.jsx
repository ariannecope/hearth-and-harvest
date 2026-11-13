import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useFarm } from '../context/FarmContext.jsx';
import { GOALS, INTERESTS } from '../lib/options.js';
import { SUPPORTED_ZONES } from '../lib/planting.js';
import { Loading } from '../components/States.jsx';
import { STATE_OPTIONS, guessState } from '../lib/extension.js';

const ZONE_OPTIONS = SUPPORTED_ZONES.flatMap((z) => [`${z}a`, `${z}b`]);

function ChipPicker({ legend, hint, options, value, onChange }) {
  const toggle = (id) => onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);
  return (
    <fieldset className="field">
      <legend className="field-label">{legend}</legend>
      {hint && <p className="field-hint">{hint}</p>}
      <div className="chip-picker">
        {options.map((o) => (
          <label key={o.id} className={`chip chip-toggle ${value.includes(o.id) ? 'is-on' : ''}`}>
            <input type="checkbox" checked={value.includes(o.id)} onChange={() => toggle(o.id)} />
            {o.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function FarmForm() {
  const { farm, saveFarm, notify } = useFarm();
  const navigate = useNavigate();
  const [form, setForm] = useState(() => ({
    farm_name: farm?.farm_name ?? '',
    location: farm?.location ?? '',
    state: farm?.state ?? '',
    growing_zone: farm?.growing_zone ?? '',
    acreage: farm?.acreage ?? '',
    farming_interests: farm?.farming_interests ?? [],
    farming_goals: farm?.farming_goals ?? [],
  }));
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e?.target ? e.target.value : e }));

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    if (!form.farm_name.trim()) return setError('Please give your farm or homestead a name.');
    setSaving(true);
    try {
      await saveFarm(form);
      notify(farm ? 'Farm profile updated' : `Welcome to ${form.farm_name.trim()}! Your farm code is in the menu up top.`);
      navigate('/my-farm');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="container narrow page">
      <header className="page-header">
        <p className="eyebrow">{farm ? 'Edit profile' : 'Step one'}</p>
        <h1>{farm ? 'Your farm profile' : 'Tell us about your homestead'}</h1>
        <p className="lede">
          Your zone, land, and goals shape the planting dates and breed suggestions you'll see. You can change any of this later.
        </p>
      </header>

      <form className="panel form" onSubmit={onSubmit} noValidate>
        <div className="field">
          <label className="field-label" htmlFor="farm_name">Farm or homestead name</label>
          <input id="farm_name" className="input" value={form.farm_name} onChange={set('farm_name')} placeholder="e.g. Willow Creek Homestead" maxLength={120} required />
        </div>

        <div className="field-grid">
          <div className="field">
            <label className="field-label" htmlFor="location">General location</label>
            <input
              id="location" className="input" value={form.location} onChange={set('location')} placeholder="City, state or ZIP" maxLength={120}
              onBlur={() => !form.state && guessState(form.location) && setForm((f) => ({ ...f, state: guessState(f.location) }))}
            />
          </div>
          <div className="field">
            <label className="field-label" htmlFor="state">State</label>
            <select id="state" className="input" value={form.state} onChange={set('state')}>
              <option value="">Select your state</option>
              {STATE_OPTIONS.map((s) => <option key={s.code} value={s.code}>{s.name}</option>)}
            </select>
            <p className="field-hint">Connects you with your state's Cooperative Extension service.</p>
          </div>
          <div className="field">
            <label className="field-label" htmlFor="zone">USDA growing zone</label>
            <select id="zone" className="input" value={form.growing_zone} onChange={set('growing_zone')}>
              <option value="">Select your zone</option>
              {ZONE_OPTIONS.map((z) => <option key={z} value={z}>Zone {z}</option>)}
            </select>
            <p className="field-hint">
              Not sure? Look up your ZIP on the{' '}
              <a href="https://planthardiness.ars.usda.gov/" target="_blank" rel="noreferrer">USDA Plant Hardiness Zone Map</a>.
            </p>
          </div>
          <div className="field">
            <label className="field-label" htmlFor="acreage">Approximate acreage</label>
            <input id="acreage" className="input" type="number" min="0" step="0.1" inputMode="decimal" value={form.acreage} onChange={set('acreage')} placeholder="e.g. 3.5" />
          </div>
        </div>

        <ChipPicker legend="What would you like to raise or grow?" hint="Choose any that interest you." options={INTERESTS} value={form.farming_interests} onChange={set('farming_interests')} />
        <ChipPicker legend="Your primary goals" options={GOALS} value={form.farming_goals} onChange={set('farming_goals')} />

        {error && <p className="form-error" role="alert">{error}</p>}

        <div className="form-actions">
          {farm && <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>Cancel</button>}
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving…' : farm ? 'Save changes' : 'Create my farm'}
          </button>
        </div>
      </form>
    </div>
  );
}

// Wait for a saved farm to load so the form starts with its values.
export default function FarmProfile() {
  const { farm, status } = useFarm();
  if (status === 'loading') return <div className="container page"><Loading /></div>;
  return <FarmForm key={farm?.id ?? 'new'} />;
}
