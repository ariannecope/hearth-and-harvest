import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { useFarm } from '../context/FarmContext.jsx';
import { Loading } from '../components/States.jsx';

// Open an existing farm with its farm code, typed in or from a sign-in link (/open?code=...).
export default function OpenFarm() {
  const { farm, status, openFarm, notify } = useFarm();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const linkCode = (params.get('code') || '').trim().toLowerCase();
  const [code, setCode] = useState(linkCode);
  const [error, setError] = useState(null);
  const [opening, setOpening] = useState(false);
  const autoTried = useRef(false);

  const switching = farm && code.trim().toLowerCase() !== farm.id;

  async function open(value) {
    setError(null);
    setOpening(true);
    try {
      const f = await openFarm(value);
      notify(`Welcome back to ${f.farm_name}`);
      navigate('/my-farm');
    } catch (err) {
      setError(err.message);
      setOpening(false);
    }
  }

  // A sign-in link opens the farm straight away, unless that would replace a different open farm.
  useEffect(() => {
    if (status !== 'ready' || !linkCode || autoTried.current) return;
    autoTried.current = true;
    if (farm?.id === linkCode) navigate('/my-farm', { replace: true });
    else if (!farm) open(linkCode);
  }, [status, linkCode, farm]); // eslint-disable-line react-hooks/exhaustive-deps

  if (status === 'loading' || (opening && linkCode && !farm)) {
    return <div className="container page"><Loading label="Opening your farm…" /></div>;
  }

  return (
    <div className="container narrow page">
      <header className="page-header">
        <p className="eyebrow">Welcome back</p>
        <h1>Open your farm</h1>
        <p className="lede">
          Enter the farm code from your farm menu or from the sign-in link you saved. It works on any device.
        </p>
      </header>

      <form className="panel form" onSubmit={(e) => { e.preventDefault(); open(code); }} noValidate>
        <div className="field">
          <label className="field-label" htmlFor="farm_code">Farm code</label>
          <input
            id="farm_code" className="input input-code" value={code} onChange={(e) => setCode(e.target.value)}
            placeholder="e.g. 1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d" autoComplete="off" autoCapitalize="off" spellCheck="false" required
          />
        </div>

        {switching && (
          <p className="form-note" role="note">
            This browser has <strong>{farm.farm_name}</strong> open. Opening another farm will sign you out of it, so copy its
            code from the farm menu first if you haven't saved it.
          </p>
        )}

        {error && <p className="form-error" role="alert">{error}</p>}

        <div className="form-actions">
          <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={opening || !code.trim()}>
            {opening ? 'Opening…' : 'Open farm'}
          </button>
        </div>
      </form>

      {!farm && (
        <p className="muted small center-text">
          New here? <Link to="/farm">Start a farm profile</Link> instead.
        </p>
      )}
    </div>
  );
}
