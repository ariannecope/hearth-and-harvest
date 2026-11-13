// Transparent, rule-based recommendations. Every score comes with the plain-language
// reasons behind it so families can judge the fit themselves.
import { parseZone, plantingWindows, startOfDay, addDays } from './planting.js';

const GOAL_TO_PLANT_CATEGORY = { vegetables: 'vegetable', herbs: 'herb', fruit: 'fruit' };
const GOAL_TO_PURPOSE = { eggs: 'eggs', meat: 'meat', dairy: 'dairy', fiber: 'fiber' };

export function recommendPlants(plants, farm, { today = new Date(), exclude = new Set(), limit = 4 } = {}) {
  const zone = parseZone(farm?.growing_zone);
  const goals = farm?.farming_goals ?? [];
  const wantedCategories = goals.map((g) => GOAL_TO_PLANT_CATEGORY[g]).filter(Boolean);
  const t = startOfDay(today);
  const soon = addDays(t, 42);

  return plants
    .filter((p) => !exclude.has(p.id))
    .filter((p) => !zone || (zone >= p.zone_min && zone <= p.zone_max))
    .map((p) => {
      let score = 0;
      const reasons = [];
      if (zone) {
        score += 1;
        reasons.push(`Grows in zone ${zone}`);
        const next = plantingWindows(p, zone, t).find((w) => w.start <= soon);
        if (next) {
          score += 3;
          reasons.push(next.start <= t ? `${next.label} now` : `${next.label} within 6 weeks`);
        }
      }
      if (wantedCategories.includes(p.category)) {
        score += 2;
        reasons.push('Matches your goals');
      }
      if (p.beginner_friendly) {
        score += 1;
        reasons.push('Beginner friendly');
      }
      return { item: p, score, reasons };
    })
    .sort((a, b) => b.score - a.score || a.item.common_name.localeCompare(b.item.common_name))
    .slice(0, limit);
}

export function recommendBreeds(breeds, farm, { exclude = new Set(), limit = 4 } = {}) {
  const goals = farm?.farming_goals ?? [];
  const interests = farm?.farming_interests ?? [];
  const purposes = goals.map((g) => GOAL_TO_PURPOSE[g]).filter(Boolean);
  const zone = parseZone(farm?.growing_zone);
  const acres = farm?.acreage;

  return breeds
    .filter((b) => !exclude.has(b.id))
    .map((b) => {
      let score = 0;
      const reasons = [];
      const cautions = [];

      if (interests.includes(b.category)) {
        score += 3;
        reasons.push(`You're interested in ${b.category}`);
      }
      const matched = b.purposes.filter((p) => purposes.includes(p));
      if (matched.length) {
        score += 2 * matched.length;
        reasons.push(`Supports your ${matched.join(' & ')} goals`);
      }
      if (acres != null) {
        if (b.space_needs === 'small') {
          score += 1;
          if (acres < 1) reasons.push('Works on a small property');
        } else if (b.space_needs === 'moderate' && acres < 1) {
          score -= 2;
          cautions.push('Grazing animals—likely tight on under an acre');
        } else if (b.space_needs === 'large' && acres < 5) {
          score -= 3;
          cautions.push('Large grazers—usually need several acres of good pasture');
        }
      }
      if (zone && zone <= 5 && b.climate_tags.includes('cold-hardy')) {
        score += 1;
        reasons.push('Cold hardy');
      }
      if (zone && zone >= 8 && b.climate_tags.includes('heat-tolerant')) {
        score += 1;
        reasons.push('Handles heat');
      }
      if (b.experience_level === 'beginner') score += 0.5;
      return { item: b, score, reasons, cautions };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || a.item.breed_name.localeCompare(b.item.breed_name))
    .slice(0, limit);
}
