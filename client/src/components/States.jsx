import { Link } from 'react-router';

export function Loading({ label = 'Loading…' }) {
  return (
    <div className="state state-loading" role="status">
      <span className="spinner" aria-hidden="true" />
      {label}
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="state state-error" role="alert">
      <p>{message}</p>
      {onRetry && <button className="btn btn-secondary btn-sm" onClick={onRetry}>Try again</button>}
    </div>
  );
}

export function EmptyState({ title, children, action, to }) {
  return (
    <div className="state state-empty">
      <p className="state-title">{title}</p>
      {children && <p>{children}</p>}
      {action && to && <Link to={to} className="btn btn-secondary btn-sm">{action}</Link>}
    </div>
  );
}

export function NeedFarm({ what = 'save selections' }) {
  return (
    <div className="need-farm">
      <p>Create a farm profile to {what}. It takes about a minute, no account needed.</p>
      <Link to="/farm" className="btn btn-primary btn-sm">Create farm profile</Link>
    </div>
  );
}
