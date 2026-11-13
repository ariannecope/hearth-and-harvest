import { test } from 'node:test';
import assert from 'node:assert/strict';
import { plantingWindows, suggestedPlantingDate, upcomingActivities, monthActivity, toISO, parseZone } from './planting.js';

const tomato = {
  common_name: 'Tomato', sow_method: 'transplant', lifecycle: 'annual', frost_tolerance: 'tender',
  dtm_min: 60, dtm_max: 85, indoor_weeks_min: 6, indoor_weeks_max: 8, spring_start_week: 1, spring_end_week: 3,
};
const garlic = {
  common_name: 'Garlic', sow_method: 'direct', lifecycle: 'perennial', frost_tolerance: 'hardy',
  dtm_min: 240, dtm_max: 270, fall_start_week: -2, fall_end_week: -6,
};
const pea = {
  common_name: 'Pea', sow_method: 'direct', lifecycle: 'annual', frost_tolerance: 'hardy',
  dtm_min: 55, dtm_max: 70, spring_start_week: -6, spring_end_week: -3, fall_start_week: 10, fall_end_week: 8,
};

test('parseZone accepts half-zones and rejects unsupported values', () => {
  assert.equal(parseZone('6b'), 6);
  assert.equal(parseZone('13'), null);
  assert.equal(parseZone(null), null);
});

test('tomato in zone 6 (last frost Apr 15): indoor start, transplant, harvest', () => {
  const w = plantingWindows(tomato, 6, new Date(2026, 0, 10));
  const indoor = w.find((x) => x.kind === 'indoor');
  const spring = w.find((x) => x.kind === 'spring');
  assert.equal(toISO(indoor.start), '2026-02-18'); // 8 weeks before Apr 15
  assert.equal(toISO(indoor.end), '2026-03-04');
  assert.equal(toISO(spring.start), '2026-04-22');
  assert.equal(toISO(spring.end), '2026-05-06');
  assert.equal(toISO(spring.harvest.start), '2026-06-21'); // +60 days
});

test('windows that have passed roll to next year', () => {
  const w = plantingWindows(tomato, 6, new Date(2026, 6, 1));
  assert.ok(w.every((x) => x.start.getFullYear() === 2027));
});

test('garlic plants after first frost, harvest next summer', () => {
  const [fall] = plantingWindows(garlic, 6, new Date(2026, 8, 1));
  assert.equal(toISO(fall.start), '2026-11-08'); // Oct 25 + 2 weeks
  assert.equal(fall.harvest.start.getFullYear(), 2027);
});

test('tender crops planted too late get a frost warning', () => {
  const late = { ...tomato, spring_start_week: 20, spring_end_week: 20, indoor_weeks_max: null };
  const [w] = plantingWindows(late, 3, new Date(2026, 0, 1));
  assert.match(w.harvest.warning, /first frost/);
});

test('suggested date is today inside a window, else next window start', () => {
  assert.equal(suggestedPlantingDate(pea, 6, new Date(2026, 2, 10)), '2026-03-10');
  assert.equal(suggestedPlantingDate(pea, 6, new Date(2026, 5, 1)), '2026-08-16'); // fall: Oct 25 - 10 weeks
});

test('upcoming activities respect a user-chosen planting date', () => {
  const events = upcomingActivities([{ ...tomato, planting_date: '2026-05-01' }], 6, new Date(2026, 3, 20), 30);
  assert.deepEqual(events.map((e) => e.type), ['plant']);
});

test('monthActivity marks planting and harvest months', () => {
  const months = monthActivity(tomato, 6, new Date(2026, 0, 1));
  assert.ok(months[1].has('indoor'));
  assert.ok(months[3].has('plant'));
  assert.ok(months[6].has('harvest'));
  assert.ok(!months[11].size);
});

test('monthActivity rolls forward from the current month and honors saved dates', () => {
  const months = monthActivity({ ...tomato, planting_date: '2027-05-01' }, 6, new Date(2026, 10, 1));
  assert.ok(months[6].has('plant')); // Nov + 6 = May 2027
  assert.ok(months[8].has('harvest')); // ~Jun 30 + : July 2027
});
