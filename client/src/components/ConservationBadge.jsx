import { STATUS_INFO } from '../lib/conservation.js';

// A small status pill, e.g. "Critical · heritage". Renders nothing for unlisted breeds.
export default function ConservationBadge({ status, size = 'sm' }) {
  const info = STATUS_INFO[status];
  if (!info) return null;
  return (
    <span className={`cons-badge cons-${info.tone} cons-${size}`} title={`Livestock Conservancy priority: ${status}. ${info.summary}`}>
      <svg width="12" height="12" viewBox="0 0 16 16" aria-hidden="true">
        <path d="M8 14c-3.5-2-6-4.6-6-7.6C2 4.4 3.5 3 5.2 3 6.4 3 7.4 3.7 8 4.6 8.6 3.7 9.6 3 10.8 3 12.5 3 14 4.4 14 6.4c0 3-2.5 5.6-6 7.6z" fill="currentColor" />
      </svg>
      <span className="sr-only">Conservation priority: </span>
      {status}
    </span>
  );
}
