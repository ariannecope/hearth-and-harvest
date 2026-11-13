import { extensionFor } from './extension.js';

// Curated further-reading links shown at the bottom of plant and breed pages.
// Every URL was checked to resolve to the named organization (Nov 2026).
// Run `npm run check-links` in server/ to re-check them.

const l = (name, url, note) => ({ name, url, note });

export const HERITAGE_CONSERVATION = [
  l('The Livestock Conservancy', 'https://livestockconservancy.org/', 'U.S. nonprofit protecting endangered heritage breeds; breeder directories and breed profiles'),
  l('Conservation Priority List', 'https://livestockconservancy.org/heritage-breeds/heritage-breeds-list/', 'Which breeds are Critical, Threatened, Watch, or Recovering'),
  l('Rare Breeds Canada', 'https://rarebreedscanada.ca/', 'Conservation of heritage livestock in Canada'),
  l('Rare Breeds Survival Trust (UK)', 'https://www.rbst.org.uk/', 'Watchlist for native British breeds, the origin of many homestead favorites'),
  l('FAO Domestic Animal Diversity Information System', 'https://www.fao.org/dad-is/en/', 'United Nations global database of livestock breeds and their risk status'),
];

const SMALL_RUMINANT_HEALTH = l('American Consortium for Small Ruminant Parasite Control', 'https://www.wormx.info/', 'Research-based parasite management, including FAMACHA scoring');
const APHIS = l('USDA APHIS Animal Health', 'https://www.aphis.usda.gov/', 'Federal programs such as scrapie identification for sheep and goats and poultry disease alerts');
const NPIP = l('National Poultry Improvement Plan', 'https://www.poultryimprovement.org/', 'Disease-testing program; buy chicks from NPIP-certified hatcheries');
const POULTRY_EXT = l('Small and Backyard Poultry (Cooperative Extension)', 'https://poultry.extension.org/', 'University-backed guides to housing, health, and egg production');

export const CATEGORY_RESOURCES = {
  sheep: [SMALL_RUMINANT_HEALTH, APHIS, l('American Sheep Industry Association', 'https://www.sheepusa.org/', 'Production resources, wool, and the Sheep Production Handbook')],
  goats: [SMALL_RUMINANT_HEALTH, APHIS, l('American Dairy Goat Association', 'https://adga.org/', 'Registry plus guides for new goat owners')],
  chickens: [NPIP, POULTRY_EXT, l('American Poultry Association', 'https://amerpoultryassn.com/', 'Breed standards and poultry shows')],
  ducks: [NPIP, POULTRY_EXT, l('American Poultry Association', 'https://amerpoultryassn.com/', 'Waterfowl breed standards')],
  cattle: [l('Beef Research (Beef Checkoff)', 'https://www.beefresearch.org/', 'Research summaries on cattle health, grazing, and beef quality'), APHIS],
  pigs: [l('National Pork Board', 'https://www.porkcheckoff.org/', 'Pig care, biosecurity, and producer education'), APHIS],
  rabbits: [l('American Rabbit Breeders Association', 'https://arba.net/', 'Breed standards, local clubs, and youth programs')],
};

export const FARM_HELP = [
  l('ATTRA Sustainable Agriculture', 'https://www.ncat.org/sustainable-agriculture/attra/', 'Free publications and expert help line for small and beginning farmers'),
  l('SARE: Sustainable Agriculture Research & Education', 'https://www.sare.org/', 'Free books and grant programs for farmers and ranchers'),
  l('Cooperative Extension (extension.org)', 'https://extension.org/', 'Connects you with land-grant university extension experts'),
];

export const GARDEN_RESOURCES = [
  l('USDA Plant Hardiness Zone Map', 'https://planthardiness.ars.usda.gov/', 'Confirm your zone by ZIP code'),
  l('NRCS Web Soil Survey', 'https://websoilsurvey.nrcs.usda.gov/', 'Free USDA soil maps for your property: drainage, texture, and suitability'),
  l('Seed Savers Exchange', 'https://www.seedsavers.org/', 'Heirloom seeds and how-to guides for saving your own seed'),
  l('Xerces Society', 'https://www.xerces.org/', 'Plant for pollinators and beneficial insects'),
];

// "Find local help" list, led by the farm's own state extension service when known.
export function localHelpLinks(farm) {
  const ext = extensionFor(farm?.state);
  if (!ext) return FARM_HELP;
  return [
    l(ext.name, ext.url, `Your state's land-grant extension service: find your county office, soil testing, and Master Gardeners`),
    ...FARM_HELP,
  ];
}

// Extension guides each come from one climate region. Put the closest match to the
// farm's USDA zone first: Upper Midwest (zones 3–4), Midwest (5–6), Southeast (7+).
const REGION_FOR_ZONE = (z) => (z <= 4 ? 'Upper Midwest' : z <= 6 ? 'Midwest' : 'Southeast');

export function orderGuides(guides, zone) {
  const list = (guides ?? []).map((g) => ({ ...g, note: `${g.org} · ${g.region}` }));
  if (!zone) return list;
  const best = REGION_FOR_ZONE(zone);
  const i = list.findIndex((g) => g.region === best);
  if (i < 0) return list;
  const [match] = list.splice(i, 1);
  return [{ ...match, note: `${match.note} · closest to zone ${zone}` }, ...list];
}
