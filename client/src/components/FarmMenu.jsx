import { useEffect, useId, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { useFarm } from '../context/FarmContext.jsx';
import { farmLink } from '../lib/api.js';

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

// The farm-name pill in the header: farm code, edit profile, and sign out.
export default function FarmMenu() {
  const { farm, signOut, notify } = useFarm();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const rootRef = useRef();
  const buttonRef = useRef();
  const panelRef = useRef();
  const panelId = useId();

  const close = (refocus = false) => {
    setOpen(false);
    setConfirming(false);
    if (refocus) buttonRef.current?.focus();
  };

  // Close on navigation, outside click, and Escape.
  useEffect(() => close(), [pathname]);
  useEffect(() => {
    if (!open) return undefined;
    panelRef.current?.querySelector('button, a')?.focus();
    const onDown = (e) => !rootRef.current?.contains(e.target) && close();
    const onKey = (e) => e.key === 'Escape' && close(true);
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!farm) return null;

  const link = farmLink(farm.id);
  const copy = async (text, what) => {
    if (await copyText(text)) notify(`${what} copied`);
    else notify(`Couldn't copy automatically. Select the code and copy it by hand.`, 'info');
  };
  const mailto = `mailto:?subject=${encodeURIComponent(`My Hearth & Harvest farm: ${farm.farm_name}`)}&body=${encodeURIComponent(
    `Open ${farm.farm_name} on any device with this link:\n${link}\n\nOr enter this farm code at ${window.location.origin}/open\n${farm.id}\n\nKeep it private: anyone with the code can view and edit the farm.`,
  )}`;

  function onSignOut() {
    const name = farm.farm_name;
    signOut();
    close();
    navigate('/');
    notify(`Signed out of ${name}. Use your farm code to open it again.`, 'info');
  }

  return (
    <div className="farm-menu" ref={rootRef}>
      <button
        ref={buttonRef}
        type="button"
        className="farm-pill"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => (open ? close() : setOpen(true))}
      >
        <span className="farm-pill-dot" aria-hidden="true" />
        <span className="farm-pill-name">{farm.farm_name}</span>
        <svg width="12" height="8" viewBox="0 0 12 8" aria-hidden="true" className="farm-pill-caret">
          <path d="M1 1l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <div id={panelId} ref={panelRef} className="farm-menu-panel" role="region" aria-label="Farm account">
          {confirming ? (
            <div className="farm-menu-section">
              <p className="farm-menu-title">Sign out of {farm.farm_name}?</p>
              <p className="small muted">
                Your farm and plans stay saved, but this browser will forget them. You'll need your farm code to get back in.
              </p>
              <div className="farm-code">
                <code>{farm.id}</code>
                <button type="button" className="link-btn" onClick={() => copy(farm.id, 'Farm code')}>Copy</button>
              </div>
              <div className="farm-menu-actions">
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setConfirming(false)}>Cancel</button>
                <button type="button" className="btn btn-danger btn-sm" onClick={onSignOut}>Sign out</button>
              </div>
            </div>
          ) : (
            <>
              <div className="farm-menu-section">
                <p className="eyebrow">Your farm code</p>
                <div className="farm-code">
                  <code>{farm.id}</code>
                  <button type="button" className="link-btn" onClick={() => copy(farm.id, 'Farm code')}>Copy</button>
                </div>
                <p className="small muted">
                  Use it to open your farm on another device or after signing out. Keep it private: anyone with it can edit your farm.
                </p>
                <div className="farm-menu-links">
                  <button type="button" className="link-btn" onClick={() => copy(link, 'Sign-in link')}>Copy sign-in link</button>
                  <a href={mailto} className="link-btn">Email it to myself</a>
                </div>
              </div>
              <div className="farm-menu-section farm-menu-nav">
                <Link to="/farm" className="farm-menu-item">Edit farm profile</Link>
                <Link to="/open" className="farm-menu-item">Open a different farm</Link>
                <button type="button" className="farm-menu-item farm-menu-signout" onClick={() => setConfirming(true)}>
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
