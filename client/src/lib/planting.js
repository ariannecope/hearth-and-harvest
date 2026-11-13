// Planting-window calculations.
//
// Extension planting calendars are built around a location's average last spring
// frost and first fall frost. We approximate those dates from the USDA zone using
// commonly published midpoints. Real frost dates vary within a zone (elevation,
// proximity to water, urban heat) and year to year, so the UI always presents
// these as estimates and encourages checking local frost data.

export const FROST_DATES = {
  2: { last: [5, 28], first: [9, 5] },
  3: { last: [5, 20], first: [9, 15] },
  4: { last: [5, 10], first: [9, 28] },
  5: { last: [4, 25], first: [10, 12] },
  6: { last: [4, 15], first: [10, 25] },
  7: { last: [4, 5], first: [11, 5] },
  8: { last: [3, 22], first: [11, 15] },
  9: { last: [2, 20], first: [12, 5] },
  10: { last: [1, 31], first: [12, 15] },
};

export const SUPPORTED_ZONES = [3, 4, 5, 6, 7, 8, 9, 10];

const DAY = 24 * 60 * 60 * 1000;

export function parseZone(zone) {
  const n = parseInt(zone, 10);
  return FROST_DATES[n] ? n : null;
}

export const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
export const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const addWeeks = (d, w) => addDays(d, Math.round(w * 7));
const minDate = (a, b) => (a < b ? a : b);

export function toISO(d) {
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

export function fromISO(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function frostDates(zone, year) {
  const z = FROST_DATES[parseZone(zone)];
  if (!z) return null;
  return {
    lastFrost: new Date(year, z.last[0] - 1, z.last[1]),
    firstFrost: new Date(year, z.first[0] - 1, z.first[1]),
  };
}

export function outdoorLabel(plant) {
  if (plant.lifecycle === 'perennial' && plant.sow_method === 'transplant') return 'Plant outdoors';
  if (plant.sow_method === 'direct') return 'Sow outdoors';
  if (plant.sow_method === 'transplant') return 'Transplant outdoors';
  return 'Sow or transplant outdoors';
}

// Harvest estimate from a planting window (or a single date: start === end).
export function harvestFor(plant, start, end, zone) {
  if (plant.dtm_min == null) return { note: plant.days_to_maturity };
  let hStart = addDays(start, plant.dtm_min);
  let hEnd = addDays(end, plant.dtm_max ?? plant.dtm_min);
  let note = null;
  let warning = null;

  // Frost-tender crops stop at the first fall frost.
  if (plant.frost_tolerance === 'tender') {
    const frost = frostDates(zone, hStart.getFullYear())?.firstFrost;
    if (frost && hStart > frost) {
      warning = 'May not mature before your average first frost. Choose a faster variety or plant earlier.';
    } else if (frost && hEnd > frost) {
      hEnd = frost;
      note = 'until first frost';
    }
  }
  return { start: hStart, end: hEnd, note, warning };
}

// Raw windows for a given calendar year (no "already passed" logic).
export function windowsForYear(plant, zone, year) {
  const fd = frostDates(zone, year);
  if (!fd) return [];
  const out = [];

  if (plant.indoor_weeks_max != null && plant.spring_start_week != null) {
    out.push({
      kind: 'indoor',
      label: 'Start seeds indoors',
      start: addWeeks(fd.lastFrost, -plant.indoor_weeks_max),
      end: addWeeks(fd.lastFrost, -(plant.indoor_weeks_min ?? plant.indoor_weeks_max)),
    });
  }
  if (plant.spring_start_week != null) {
    const start = addWeeks(fd.lastFrost, plant.spring_start_week);
    const end = addWeeks(fd.lastFrost, plant.spring_end_week ?? plant.spring_start_week);
    out.push({ kind: 'spring', label: outdoorLabel(plant), start, end, harvest: harvestFor(plant, start, end, zone) });
  }
  if (plant.fall_start_week != null) {
    const start = addWeeks(fd.firstFrost, -plant.fall_start_week);
    const end = addWeeks(fd.firstFrost, -(plant.fall_end_week ?? plant.fall_start_week));
    const label = plant.spring_start_week == null ? 'Plant in fall' : 'Fall planting';
    out.push({ kind: 'fall', label, start, end, harvest: harvestFor(plant, start, end, zone) });
  }
  return out;
}

// The next relevant occurrence of each window: windows that already ended this year
// roll forward to next year. Spring + indoor move together so they stay paired.
export function plantingWindows(plant, zone, today = new Date()) {
  const t = startOfDay(today);
  const year = t.getFullYear();
  const thisYear = windowsForYear(plant, zone, year);
  const nextYear = windowsForYear(plant, zone, year + 1);
  if (!thisYear.length) return [];

  const springPassed = (thisYear.find((w) => w.kind === 'spring')?.end ?? Infinity) < t;
  return thisYear
    .map((w, i) => {
      const passed = w.kind === 'fall' ? w.end < t : springPassed;
      return passed ? nextYear[i] : w;
    })
    .sort((a, b) => a.start - b.start);
}

// Best date to suggest when adding a plant to the garden: today if we're inside an
// outdoor window, otherwise the start of the next outdoor window.
export function suggestedPlantingDate(plant, zone, today = new Date()) {
  const t = startOfDay(today);
  const outdoor = plantingWindows(plant, zone, t).filter((w) => w.kind !== 'indoor');
  if (!outdoor.length) return null;
  const current = outdoor.find((w) => w.start <= t && t <= w.end);
  return toISO(current ? t : outdoor[0].start);
}

// Upcoming garden tasks across a plan, within `days` from today.
export function upcomingActivities(planPlants, zone, today = new Date(), days = 56) {
  const t = startOfDay(today);
  const horizon = addDays(t, days);
  const events = [];
  const push = (plant, type, label, start, end = start) => {
    if (end < t || start > horizon) return;
    events.push({ plant, type, label, date: start < t ? t : start, start, end, ongoing: start <= t && t <= end && start < end });
  };

  for (const plant of planPlants) {
    if (plant.planting_date) {
      const date = fromISO(plant.planting_date);
      if (plant.indoor_weeks_max != null && plant.sow_method !== 'direct') {
        push(plant, 'indoor', 'Start seeds indoors', addWeeks(date, -plant.indoor_weeks_max - (plant.spring_start_week ?? 0)), addWeeks(date, -(plant.indoor_weeks_min ?? plant.indoor_weeks_max) - (plant.spring_start_week ?? 0)));
      }
      push(plant, 'plant', outdoorLabel(plant), date);
      const h = harvestFor(plant, date, date, zone);
      if (h.start) push(plant, 'harvest', 'Harvest begins', h.start);
    } else {
      for (const w of plantingWindows(plant, zone, t)) {
        push(plant, w.kind === 'indoor' ? 'indoor' : 'plant', w.label, w.start, w.end);
        if (w.harvest?.start) push(plant, 'harvest', 'Harvest begins', w.harvest.start);
      }
    }
  }
  return events.sort((a, b) => a.date - b.date || a.plant.common_name.localeCompare(b.plant.common_name));
}

// For the seasonal overview: activity in each of the 12 months starting at `from`
// (a Date; defaults to the current month). Returns an array of Sets.
export function monthActivity(plant, zone, from = new Date()) {
  const y0 = from.getFullYear();
  const m0 = from.getMonth();
  const months = Array.from({ length: 12 }, () => new Set());
  const mark = (start, end, kind) => {
    if (!start || !end) return;
    for (let i = 0; i < 12; i++) {
      const mStart = new Date(y0, m0 + i, 1);
      const mEnd = new Date(y0, m0 + i + 1, 0);
      if (start <= mEnd && end >= mStart) months[i].add(kind);
    }
  };

  let windows = [y0 - 1, y0, y0 + 1].flatMap((y) => windowsForYear(plant, zone, y));
  // A saved planting date replaces the typical outdoor window it falls nearest to.
  if (plant.planting_date) {
    const d = fromISO(plant.planting_date);
    const nearest = windows
      .filter((w) => w.kind !== 'indoor')
      .sort((a, b) => Math.abs(a.start - d) - Math.abs(b.start - d))[0];
    windows = windows.filter((w) => w !== nearest);
    windows.push({ kind: 'spring', start: d, end: d, harvest: harvestFor(plant, d, d, zone) });
  }

  for (const w of windows) {
    mark(w.start, w.end, w.kind === 'indoor' ? 'indoor' : 'plant');
    if (w.harvest?.start) mark(w.harvest.start, w.harvest.end, 'harvest');
  }
  return months;
}

export function currentSeason(today = new Date()) {
  const m = today.getMonth();
  if (m <= 1 || m === 11) return 'winter';
  if (m <= 4) return 'spring';
  if (m <= 7) return 'summer';
  return 'fall';
}

const fmt = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });
const fmtYear = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export function formatDate(d, today = new Date()) {
  return d.getFullYear() === today.getFullYear() ? fmt.format(d) : fmtYear.format(d);
}

export function formatRange(start, end, today = new Date()) {
  if (!start) return '';
  if (!end || +start === +end) return formatDate(start, today);
  const sameYear = start.getFullYear() === end.getFullYear();
  const left = sameYear && start.getFullYear() !== today.getFullYear() ? fmt.format(start) : formatDate(start, today);
  return `${left} – ${formatDate(end, today)}`;
}

export function daysFromNow(d, today = new Date()) {
  return Math.round((startOfDay(d) - startOfDay(today)) / DAY);
}
