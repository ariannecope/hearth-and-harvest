import { NavLink, Link, Outlet, useLocation } from 'react-router';
import { useEffect } from 'react';
import { useFarm } from '../context/FarmContext.jsx';
import CompareTray from './CompareTray.jsx';
import FarmMenu from './FarmMenu.jsx';
import { CATEGORY_SKETCHES } from '../lib/sketches.js';

const NAV = [
  { to: '/my-farm', label: 'My Farm', icon: 'M4 11l8-7 8 7v9a1 1 0 01-1 1h-4v-6H9v6H5a1 1 0 01-1-1z' },
  { to: '/grow', label: 'Grow', icon: 'M12 21V10M12 10c0-4 3-7 8-7 0 5-3 7-8 7zM12 14c0-3-2-6-7-6 0 4 3 6 7 6z' },
  { to: '/raise', label: 'Raise', icon: 'M5 15c0-4 3-7 7-7s7 3 7 7-3 5-7 5-7-1-7-5zM8 9L6 4M16 9l2-5M10 15h.01M14 15h.01' },
  { to: '/plans', label: 'My Plans', icon: 'M7 3h10a1 1 0 011 1v17l-6-3-6 3V4a1 1 0 011-1zM9 8h6M9 12h4' },
];

function NavIcon({ d }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

export function Logo() {
  return (
    <Link to="/" className="logo" aria-label="Hearth & Harvest home">
      <img className="logo-sketch" src={CATEGORY_SKETCHES.fruit} alt="" aria-hidden="true" />
      <span>Hearth <em>&amp;</em> Harvest</span>
    </Link>
  );
}

// Strawberry at the foot of every page that scrolls back to the top.
function BackToTop() {
  const toTop = () => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    document.querySelector('.site-header a')?.focus({ preventScroll: true });
  };
  return (
    <button type="button" className="back-to-top" onClick={toTop} aria-label="Back to top" title="Back to top">
      <img src={CATEGORY_SKETCHES.fruit} alt="" aria-hidden="true" />
    </button>
  );
}

export default function Layout() {
  const { toast, dismissToast } = useFarm();
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="app">
      <a href="#main" className="skip-link">Skip to content</a>
      <header className="site-header">
        <div className="container header-inner">
          <Logo />
          <nav className="top-nav" aria-label="Primary">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} end={n.end} className="top-nav-link">
                {n.label}
              </NavLink>
            ))}
          </nav>
          <FarmMenu />
        </div>
      </header>

      <main id="main" className="main">
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="container">
          <BackToTop />
          <p>
            Hearth &amp; Harvest offers general educational guidance, not professional agricultural or veterinary advice.
            Planting dates are estimates based on average frost dates for your USDA zone—always confirm with your local
            cooperative extension office.
          </p>
          <p><Link to="/credits">Photo credits</Link></p>
        </div>
      </footer>

      <CompareTray />

      <nav className="bottom-nav" aria-label="Primary">
        {NAV.map((n) => (
          <NavLink key={n.to} to={n.to} end={n.end} className="bottom-nav-link">
            <NavIcon d={n.icon} />
            <span>{n.label}</span>
          </NavLink>
        ))}
      </nav>

      {toast && (
        <div key={toast.key} className={`toast toast-${toast.tone}`} role="status">
          {toast.link ? (
            <Link to={toast.link.to} className="toast-link" onClick={dismissToast}>
              {toast.message} <span className="toast-cta">{toast.link.label} →</span>
            </Link>
          ) : toast.message}
        </div>
      )}
    </div>
  );
}
