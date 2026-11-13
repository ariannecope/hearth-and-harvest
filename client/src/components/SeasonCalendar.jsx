import { Link } from 'react-router';
import { monthActivity } from '../lib/planting.js';

const MONTHS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const KIND_LABEL = { indoor: 'start indoors', plant: 'plant', harvest: 'harvest' };

// A compact 12-month planting/harvest calendar for one or more plants.
// Shows 12 months starting with the current month, so late-season planning looks ahead.
export default function SeasonCalendar({ plants, zone, link = true }) {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1);
  const order = Array.from({ length: 12 }, (_, i) => (from.getMonth() + i) % 12);
  const thisMonth = 0;
  return (
    <div className="season-cal">
      <div className="season-cal-row season-cal-head" aria-hidden="true">
        <span />
        {order.map((m, i) => (
          <span key={i} className={i === thisMonth ? 'is-now' : ''}>{MONTHS[m]}</span>
        ))}
      </div>
      {plants.map((p) => {
        const months = monthActivity(p, zone, from);
        return (
          <div className="season-cal-row" key={p.id}>
            <span className="season-cal-name">{link ? <Link to={`/grow/${p.id}`}>{p.common_name}</Link> : p.common_name}</span>
            {months.map((set, i) => {
              const kinds = ['indoor', 'plant', 'harvest'].filter((k) => set.has(k));
              const label = kinds.length ? `${MONTH_NAMES[order[i]]}: ${kinds.map((k) => KIND_LABEL[k]).join(', ')}` : `${MONTH_NAMES[order[i]]}: nothing scheduled`;
              return (
                <span key={i} className={`season-cell ${i === thisMonth ? 'is-now' : ''}`} title={label} aria-label={label}>
                  {kinds.map((k) => <i key={k} className={`dot dot-${k}`} />)}
                </span>
              );
            })}
          </div>
        );
      })}
      <div className="season-legend">
        <span><i className="dot dot-indoor" /> Start indoors</span>
        <span><i className="dot dot-plant" /> Plant outdoors</span>
        <span><i className="dot dot-harvest" /> Harvest</span>
      </div>
    </div>
  );
}
