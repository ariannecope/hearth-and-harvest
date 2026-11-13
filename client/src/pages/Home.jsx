import { Link } from 'react-router';
import { useFarm } from '../context/FarmContext.jsx';
import { CATEGORY_SKETCHES, GARDEN_SKETCH } from '../lib/sketches.js';
import Stitched from '../components/Stitched.jsx';

const FEATURES = [
  {
    title: 'Grow',
    to: '/grow',
    sketch: CATEGORY_SKETCHES.vegetable,
    text: 'A garden library of vegetables, herbs, and fruit. Each plant shows when to start seeds and plant out in your USDA zone, plus sun, soil, spacing, harvest tips, and a growing guide from a university extension service.',
  },
  {
    title: 'Raise',
    to: '/raise',
    sketch: CATEGORY_SKETCHES.sheep,
    text: 'A breed explorer covering sheep, goats, chickens, ducks, cattle, pigs, and rabbits. Filter by purpose, find heritage breeds that need keepers, and compare up to four breeds side by side.',
  },
  {
    title: 'My Farm',
    to: '/my-farm',
    sketch: CATEGORY_SKETCHES.herb,
    text: 'Your dashboard: planting tasks for the next eight weeks, a calendar for the year ahead, your livestock, suggestions matched to your land and goals, and a link to your local extension office.',
  },
  {
    title: 'My Plans',
    to: '/plans',
    sketch: CATEGORY_SKETCHES.goats,
    text: 'Everything you have saved in one place. Adjust planting dates, keep notes as you research, and print the plan to take outside.',
  },
];

const STEPS = [
  {
    title: 'Create your farm profile',
    text: 'Add your farm’s name, state, USDA growing zone, acreage, and what you hope to grow or raise. It takes about two minutes and needs no account.',
    link: { to: '/farm', label: 'Start your profile' },
  },
  {
    title: 'Explore and add',
    text: 'Browse Grow and Raise. Planting dates adjust to your zone. Tap “Add to garden” or “Add to farm” on anything that fits.',
  },
  {
    title: 'Check My Farm',
    text: 'Your dashboard turns those picks into what to plant next and a month-by-month view of the year, with suggestions for what else might suit your land.',
  },
  {
    title: 'Keep your plan up to date',
    text: 'In My Plans, set your own planting dates and jot down notes. Changes save automatically.',
  },
  {
    title: 'Save your farm code',
    text: 'Your farm lives behind a private farm code instead of a password. Find it in the menu under your farm’s name, and use it to open your farm on another device.',
  },
];

export default function Home() {
  const { farm } = useFarm();

  return (
    <div className="home">
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-copy">
            <p className="eyebrow">A planning companion for family farms</p>
            <h1><Stitched>Turn the dream of a homestead into a plan.</Stitched></h1>
            <p className="lede">
              Hearth &amp; Harvest helps beginning homesteaders and small family farms decide what to grow, which animals
              to raise, and when to do it, all in one farm journal.
            </p>
            <div className="hero-actions">
              {farm ? (
                <Link to="/my-farm" className="btn btn-primary btn-lg">Go to {farm.farm_name}</Link>
              ) : (
                <Link to="/farm" className="btn btn-primary btn-lg">Start your farm profile</Link>
              )}
              <Link to="/grow" className="btn btn-ghost btn-lg">Browse the garden</Link>
            </div>
            {!farm && (
              <p className="hero-signin">
                Already have a farm? <Link to="/open">Open it with your farm code</Link>
              </p>
            )}
          </div>
          <div className="home-hero-art" aria-hidden="true">
            <img src={GARDEN_SKETCH} alt="" />
          </div>
        </div>
      </section>

      <section className="container home-section" aria-labelledby="about-h">
        <div className="home-about">
          <h2 id="about-h" className="section-title">What it is</h2>
          <p>
            Starting a homestead raises plenty of questions. When can I plant tomatoes here? Which sheep suit a few wet
            acres? Hearth &amp; Harvest gathers answers from land-grant university extension services, breed
            associations, and The Livestock Conservancy. It then tailors them to your growing zone, state, land, and goals.
          </p>
          <p className="muted">
            It’s free, there’s no account to create, and your farm is saved privately behind a farm code.
          </p>
        </div>
      </section>

      <section className="container home-section" aria-labelledby="features-h">
        <h2 id="features-h" className="section-title">What you can do</h2>
        <div className="home-features">
          {FEATURES.map((f) => (
            <Link key={f.title} to={f.to} className="feature home-feature">
              <img className="home-feature-sketch" src={f.sketch} alt="" aria-hidden="true" />
              <div>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="container home-section" aria-labelledby="how-h">
        <h2 id="how-h" className="section-title">How to use it</h2>
        <ol className="home-steps">
          {STEPS.map((s) => (
            <li key={s.title}>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
              {s.link && !farm && <Link to={s.link.to} className="text-link">{s.link.label} →</Link>}
            </li>
          ))}
        </ol>
      </section>

      <section className="container home-section home-cta">
        <div className="panel home-cta-panel">
          <img src={CATEGORY_SKETCHES.chickens} alt="" aria-hidden="true" className="home-cta-sketch" />
          <div>
            <h2 className="section-title">{farm ? `Welcome back to ${farm.farm_name}` : 'Ready to start planning?'}</h2>
            <p className="muted">
              {farm
                ? 'Pick up where you left off on your dashboard.'
                : 'Set up your farm profile and see planting dates and breed suggestions made for your land.'}
            </p>
          </div>
          <Link to={farm ? '/my-farm' : '/farm'} className="btn btn-primary">{farm ? 'Go to My Farm' : 'Start your farm profile'}</Link>
        </div>
      </section>
    </div>
  );
}
