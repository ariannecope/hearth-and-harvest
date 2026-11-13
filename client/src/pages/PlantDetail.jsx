import { Link, useParams } from 'react-router';
import { useState } from 'react';
import { useFarm } from '../context/FarmContext.jsx';
import { api } from '../lib/api.js';
import { useApi } from '../lib/useApi.js';
import { plantingWindows, formatRange, suggestedPlantingDate, frostDates, formatDate } from '../lib/planting.js';
import { capitalize } from '../lib/options.js';
import { ArtTile, PhotoCredit } from '../components/Illustration.jsx';
import SeasonCalendar from '../components/SeasonCalendar.jsx';
import { AddPlantButton } from '../components/Cards.jsx';
import { Loading, ErrorState } from '../components/States.jsx';
import Sources from '../components/Sources.jsx';
import { GARDEN_RESOURCES, localHelpLinks, orderGuides } from '../lib/resources.js';

function PlantingPlanner({ plant }) {
  const { zone, farm, plantPlanIds } = useFarm();
  const [date, setDate] = useState(() => (zone ? suggestedPlantingDate(plant, zone) ?? '' : ''));

  if (!zone) {
    return (
      <div className="panel planner">
        <h2 className="panel-title">Your planting calendar</h2>
        <p className="muted">
          {farm ? <><Link to="/farm">Add your growing zone</Link> to</> : <><Link to="/farm">Create a farm profile</Link> with your zone to</>} see
          planting dates estimated for your area.
        </p>
        <AddPlantButton plant={plant} />
      </div>
    );
  }

  const inZone = zone >= plant.zone_min && zone <= plant.zone_max;
  const windows = plantingWindows(plant, zone);
  const fd = frostDates(zone, new Date().getFullYear());

  return (
    <div className="panel planner">
      <h2 className="panel-title">Your planting calendar · Zone {zone}</h2>
      {!inZone && (
        <p className="notice">
          {plant.common_name} is usually grown in zones {plant.zone_min}–{plant.zone_max}. You may need special varieties, containers, or protection.
        </p>
      )}
      <ul className="windows">
        {windows.map((w) => (
          <li key={w.kind} className={`window w-${w.kind}`}>
            <span className="window-label">{w.label}</span>
            <span className="window-dates">{formatRange(w.start, w.end)}</span>
            {w.harvest && (
              <span className="window-harvest">
                {w.harvest.start
                  ? <>Harvest ≈ {formatRange(w.harvest.start, w.harvest.end)}{w.harvest.note ? ` (${w.harvest.note})` : ''}</>
                  : w.harvest.note}
              </span>
            )}
            {w.harvest?.warning && <span className="window-warn">{w.harvest.warning}</span>}
          </li>
        ))}
      </ul>
      <p className="fine-print">
        Based on an average last spring frost around {formatDate(fd.lastFrost)} and first fall frost around {formatDate(fd.firstFrost)} for zone {zone}.
        Local frost dates vary, so treat these as a starting point.
      </p>
      {!plantPlanIds.has(plant.id) && farm && (
        <div className="planner-add">
          <label className="field-label" htmlFor="plant-date">Planned outdoor planting date</label>
          <div className="inline-form">
            <input id="plant-date" type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} />
            <AddPlantButton plant={plant} date={date || null} />
          </div>
        </div>
      )}
      {(plantPlanIds.has(plant.id) || !farm) && <AddPlantButton plant={plant} />}
    </div>
  );
}

export default function PlantDetail() {
  const { id } = useParams();
  const { zone, farm } = useFarm();
  const { data: plant, error, loading, retry } = useApi(() => api.plant(id), id);

  if (loading) return <div className="container page"><Loading /></div>;
  if (error) return <div className="container page"><ErrorState message={error} onRetry={retry} /></div>;

  const facts = [
    ['Sunlight', plant.sunlight],
    ['Soil', plant.soil_type],
    ['Water', plant.water_requirements],
    ['Days to maturity', plant.days_to_maturity],
    ['Spacing', plant.spacing],
    ['Growing zones', `${plant.zone_min}–${plant.zone_max}`],
    ['Life cycle', capitalize(plant.lifecycle)],
    ['Frost tolerance', { hardy: 'Hardy: tolerates frost', 'half-hardy': 'Half-hardy: tolerates light frost', tender: 'Tender: killed by frost' }[plant.frost_tolerance]],
  ];

  return (
    <div className="container page">
      <Link to="/grow" className="back-link">← Garden library</Link>
      <header className="detail-hero">
        <figure className="hero-figure">
          <ArtTile kind={plant.category} size="lg" image={plant.image_url} credit={plant.image_credit} label={plant.common_name} />
          <PhotoCredit credit={plant.image_url ? plant.image_credit : null} />
        </figure>
        <div>
          <p className="eyebrow">{capitalize(plant.category)} · {plant.seasons.map(capitalize).join(', ')} planting</p>
          <h1>{plant.common_name}</h1>
          <p className="botanical lg">{plant.botanical_name}</p>
          <p className="lede">{plant.description}</p>
        </div>
      </header>

      <div className="detail-grid">
        <div className="detail-main">
          <section className="panel">
            <h2 className="panel-title">Growing at a glance</h2>
            <dl className="facts">{facts.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
          </section>
          <section className="panel prose">
            <h2 className="panel-title">Planting</h2>
            <p>{plant.planting_information}</p>
            <h2 className="panel-title">Harvest</h2>
            <p>{plant.harvest_information}</p>
          </section>
          {zone && (
            <section className="panel">
              <h2 className="panel-title">Through the year</h2>
              <SeasonCalendar plants={[plant]} zone={zone} link={false} />
            </section>
          )}
          <Sources
            groups={[
              { title: `Growing guides for ${plant.common_name.toLowerCase()}`, links: orderGuides(plant.guides, zone), wide: true },
              { title: 'Garden planning', links: GARDEN_RESOURCES },
              { title: 'Find local help', links: localHelpLinks(farm) },
              { title: 'General references', links: plant.sources },
            ]}
            note="Summarized from general extension guidance. Your local cooperative extension office can advise on varieties and timing for your exact area."
          />
        </div>
        <aside className="detail-side">
          <PlantingPlanner plant={plant} />
        </aside>
      </div>
    </div>
  );
}
