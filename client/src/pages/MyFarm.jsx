import { Link } from 'react-router';
import { useMemo } from 'react';
import { useFarm } from '../context/FarmContext.jsx';
import { api } from '../lib/api.js';
import { useApi } from '../lib/useApi.js';
import { upcomingActivities, formatDate, formatRange, currentSeason, daysFromNow } from '../lib/planting.js';
import { recommendPlants, recommendBreeds } from '../lib/recommend.js';
import { labelFor, GOALS, categoryLabel } from '../lib/options.js';
import { ArtTile } from '../components/Illustration.jsx';
import SeasonCalendar from '../components/SeasonCalendar.jsx';
import { PlantCard, BreedCard } from '../components/Cards.jsx';
import { Loading, ErrorState, EmptyState } from '../components/States.jsx';
import { extensionFor } from '../lib/extension.js';
import { GARDEN_SKETCH, CATEGORY_SKETCHES } from '../lib/sketches.js';

const SEASON_NOTES = {
  winter: 'A season for planning: order seeds, start onions and slow herbs indoors, and repair fences and coops.',
  spring: 'Cool-season crops go in early; tender crops wait until after your last frost. Spring is also prime hatching and lambing season.',
  summer: 'Harvest, succession sow beans and greens, and plan fall crops. Watch livestock for heat stress—shade and water are essential.',
  fall: 'Plant garlic, harvest storage crops, and prepare animals and shelters for winter.',
};

// Shown on /my-farm before a farm profile exists.
function SetUpFarm() {
  return (
    <div className="container narrow page">
      <header className="page-header">
        <p className="eyebrow">My Farm</p>
        <h1>Your farm dashboard</h1>
      </header>
      <section className="panel setup-panel">
        <img className="setup-sketch" src={GARDEN_SKETCH} alt="" aria-hidden="true" />
        <h2 className="panel-title">Set up your farm to see your dashboard</h2>
        <p className="muted">
          Your dashboard shows what to plant in the next eight weeks, a calendar for the year ahead, your livestock,
          and suggestions matched to your zone and goals. It takes about two minutes and needs no account.
        </p>
        <div className="hero-actions">
          <Link to="/farm" className="btn btn-primary">Start your farm profile</Link>
          <Link to="/open" className="btn btn-ghost">Open with a farm code</Link>
        </div>
        <p className="small muted">New here? <Link to="/">See how Hearth &amp; Harvest works</Link>.</p>
      </section>
    </div>
  );
}

function ExtensionLink({ farm }) {
  const ext = extensionFor(farm.state);
  if (!ext) {
    return (
      <p className="ext-link muted small">
        <Link to="/farm">Add your state</Link> to connect with your local Cooperative Extension office.
      </p>
    );
  }
  return (
    <a className="ext-link ext-card" href={ext.url} target="_blank" rel="noreferrer">
      <span className="eyebrow">Your local experts</span>
      <strong>{ext.name}</strong>
      <small>County offices, soil testing, Master Gardeners, and livestock agents in {ext.state}</small>
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

function Dashboard() {
  const { farm, plans, zone } = useFarm();
  const today = useMemo(() => new Date(), []);
  const season = currentSeason(today);
  const plantsQ = useApi(() => api.plants(), 'all-plants');
  const breedsQ = useApi(() => api.breeds(), 'all-breeds');

  const activities = useMemo(() => (zone ? upcomingActivities(plans.plants, zone, today, 56) : []), [plans.plants, zone, today]);
  const plantRecs = useMemo(
    () => (plantsQ.data ? recommendPlants(plantsQ.data, farm, { today, exclude: new Set(plans.plants.map((p) => p.id)) }) : []),
    [plantsQ.data, farm, plans.plants, today],
  );
  const breedRecs = useMemo(
    () => (breedsQ.data ? recommendBreeds(breedsQ.data, farm, { exclude: new Set(plans.breeds.map((b) => b.id)) }) : []),
    [breedsQ.data, farm, plans.breeds],
  );

  const hour = today.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="container page dashboard">
      <header className="dash-header">
        <div className="dash-greeting">
          <img className="dash-sketch" src={CATEGORY_SKETCHES.vegetable} alt="" aria-hidden="true" />
          <div>
            <p className="eyebrow">{new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(today)}</p>
            <h1>{greeting}, {farm.farm_name}</h1>
          </div>
        </div>
        <Link to="/farm" className="btn btn-ghost btn-sm">Edit profile</Link>
      </header>

      <div className="dash-grid">
        <section className="panel profile-panel" aria-labelledby="profile-h">
          <h2 id="profile-h" className="panel-title">Farm at a glance</h2>
          <dl className="facts facts-compact">
            <div><dt>Location</dt><dd>{farm.location || extensionFor(farm.state)?.state || '—'}</dd></div>
            <div><dt>Growing zone</dt><dd>{farm.growing_zone ? `Zone ${farm.growing_zone}` : <Link to="/farm">Add your zone</Link>}</dd></div>
            <div><dt>Acreage</dt><dd>{farm.acreage != null ? `${farm.acreage} acres` : '—'}</dd></div>
            <div><dt>In the plan</dt><dd>{plans.plants.length} plants · {plans.breeds.length} breeds</dd></div>
          </dl>
          {farm.farming_goals.length > 0 && (
            <div className="chip-row">
              {farm.farming_goals.map((g) => <span key={g} className="chip chip-soft">{labelFor(GOALS, g)}</span>)}
            </div>
          )}
          <ExtensionLink farm={farm} />
          <div className={`season-note season-${season}`}>
            <p className="eyebrow">This {season}</p>
            <p>{SEASON_NOTES[season]}</p>
          </div>
        </section>

        <section className="panel garden-panel" aria-labelledby="upcoming-h">
          <img className="garden-sketch" src={GARDEN_SKETCH} alt="" aria-hidden="true" />
          <div className="panel-head">
            <h2 id="upcoming-h" className="panel-title">Coming up in the garden</h2>
            <span className="muted small">Next 8 weeks</span>
          </div>
          {!zone ? (
            <EmptyState title="Add your growing zone" action="Edit profile" to="/farm">We use it to estimate planting dates.</EmptyState>
          ) : !plans.plants.length ? (
            <EmptyState title="Your garden plan is empty" action="Find plants" to="/grow">Add a few crops and your planting tasks will appear here.</EmptyState>
          ) : !activities.length ? (
            <EmptyState title="A quiet stretch">Nothing in your plan needs planting in the next 8 weeks. A good time to plan, order seeds, and prep beds.</EmptyState>
          ) : (
            <ol className="timeline">
              {activities.slice(0, 8).map((a, i) => {
                const d = daysFromNow(a.date, today);
                return (
                  <li key={i} className={`timeline-item t-${a.type}`}>
                    <span className="timeline-date">
                      {a.ongoing ? 'Now' : formatDate(a.date, today)}
                      <small>{a.ongoing ? `until ${formatDate(a.end, today)}` : d === 0 ? 'today' : `in ${d} days`}</small>
                    </span>
                    <span className="timeline-text">
                      <strong>{a.label}</strong> <Link to={`/grow/${a.plant.id}`}>{a.plant.common_name}</Link>
                      {!a.ongoing && a.end > a.start && <small className="muted"> · window {formatRange(a.start, a.end, today)}</small>}
                    </span>
                  </li>
                );
              })}
            </ol>
          )}
        </section>
      </div>

      <section className="panel" aria-labelledby="season-h">
        <div className="panel-head">
          <h2 id="season-h" className="panel-title title-with-sketch">
            <img className="title-sketch is-mirrored" src={CATEGORY_SKETCHES.herb} alt="" aria-hidden="true" />
            The year ahead
            <img className="title-sketch" src={CATEGORY_SKETCHES.herb} alt="" aria-hidden="true" />
          </h2>
          <Link to="/plans" className="text-link">Manage garden →</Link>
        </div>
        {zone && plans.plants.length ? (
          <SeasonCalendar plants={plans.plants} zone={zone} />
        ) : (
          <p className="muted">Add plants{zone ? '' : ' and your growing zone'} to see your year at a glance.</p>
        )}
      </section>

      <section className="panel" aria-labelledby="livestock-h">
        <div className="panel-head">
          <h2 id="livestock-h" className="panel-title title-with-sketch">
            <img className="title-sketch is-mirrored" src={CATEGORY_SKETCHES.chickens} alt="" aria-hidden="true" />
            My livestock
            <img className="title-sketch" src={CATEGORY_SKETCHES.chickens} alt="" aria-hidden="true" />
          </h2>
          <Link to="/raise" className="text-link">Explore breeds →</Link>
        </div>
        {plans.breeds.length ? (
          <ul className="mini-list">
            {plans.breeds.map((b) => (
              <li key={b.plan_id}>
                <Link to={`/raise/${b.id}`} className="mini-item">
                  <ArtTile kind={b.category} size="sm" image={b.image_url} credit={b.image_credit} />
                  <span>
                    <strong>{b.breed_name}</strong>
                    <small>{categoryLabel(b.category)} · {b.primary_purpose}</small>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">No breeds yet. Explore the breed library to find animals that fit your land and goals.</p>
        )}
      </section>

      <section className="recs" aria-labelledby="recs-h">
        <h2 id="recs-h" className="section-title">Suggested for {farm.farm_name}</h2>
        <p className="muted section-sub">Based on your zone, goals, interests, and acreage, with the reasons shown so you can decide.</p>
        {plantsQ.error || breedsQ.error ? (
          <ErrorState message={plantsQ.error || breedsQ.error} onRetry={() => { plantsQ.retry(); breedsQ.retry(); }} />
        ) : plantsQ.loading || breedsQ.loading ? (
          <Loading label="Finding good fits…" />
        ) : (
          <>
            {plantRecs.length > 0 && (
              <>
                <h3 className="subsection-title">To grow</h3>
                <div className="card-grid">{plantRecs.map((r) => <PlantCard key={r.item.id} plant={r.item} reasons={r.reasons} />)}</div>
              </>
            )}
            {breedRecs.length > 0 ? (
              <>
                <h3 className="subsection-title">To raise</h3>
                <div className="card-grid">{breedRecs.map((r) => <BreedCard key={r.item.id} breed={r.item} reasons={r.reasons} cautions={r.cautions} showCompare={false} />)}</div>
              </>
            ) : (
              <p className="muted">Add livestock interests or goals to your <Link to="/farm">profile</Link> for breed suggestions.</p>
            )}
          </>
        )}
      </section>
    </div>
  );
}

export default function MyFarm() {
  const { farm, status, loadError, retry } = useFarm();
  if (status === 'loading') return <div className="container page"><Loading label="Opening your farm journal…" /></div>;
  if (loadError) return <div className="container page"><ErrorState message={loadError} onRetry={retry} /></div>;
  return farm ? <Dashboard /> : <SetUpFarm />;
}
