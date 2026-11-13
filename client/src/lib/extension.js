// Each state's land-grant university Cooperative Extension service. Every URL was
// checked to load the named service (Nov 2026); a few sites block automated checks
// (MI, MO, OK, PA, IA) or this network (GA) but are their official addresses.

export const EXTENSION = {
  AL: ['Alabama', 'Alabama Cooperative Extension System', 'https://www.aces.edu/'],
  AK: ['Alaska', 'UAF Cooperative Extension Service', 'https://www.uaf.edu/ces/'],
  AZ: ['Arizona', 'University of Arizona Cooperative Extension', 'https://extension.arizona.edu/'],
  AR: ['Arkansas', 'Arkansas Cooperative Extension Service', 'https://www.uaex.uada.edu/'],
  CA: ['California', 'UC Agriculture and Natural Resources', 'https://ucanr.edu/'],
  CO: ['Colorado', 'Colorado State University Extension', 'https://extension.colostate.edu/'],
  CT: ['Connecticut', 'UConn Extension', 'https://extension.uconn.edu/'],
  DE: ['Delaware', 'University of Delaware Cooperative Extension', 'https://www.udel.edu/canr/cooperative-extension/'],
  DC: ['District of Columbia', 'UDC College of Agriculture, Urban Sustainability and Environmental Sciences', 'https://www.udc.edu/causes/'],
  FL: ['Florida', 'UF/IFAS Extension (Solutions for Your Life)', 'https://sfyl.ifas.ufl.edu/'],
  GA: ['Georgia', 'University of Georgia Cooperative Extension', 'https://extension.uga.edu/'],
  HI: ['Hawaiʻi', 'UH College of Tropical Agriculture and Human Resources', 'https://cms.ctahr.hawaii.edu/'],
  ID: ['Idaho', 'University of Idaho Extension', 'https://www.uidaho.edu/extension'],
  IL: ['Illinois', 'University of Illinois Extension', 'https://extension.illinois.edu/'],
  IN: ['Indiana', 'Purdue Extension', 'https://extension.purdue.edu/'],
  IA: ['Iowa', 'Iowa State University Extension and Outreach', 'https://www.extension.iastate.edu/'],
  KS: ['Kansas', 'K-State Research and Extension', 'https://extension.k-state.edu/'],
  KY: ['Kentucky', 'University of Kentucky Cooperative Extension', 'https://extension.mgcafe.uky.edu/'],
  LA: ['Louisiana', 'LSU AgCenter', 'https://www.lsuagcenter.com/'],
  ME: ['Maine', 'University of Maine Cooperative Extension', 'https://extension.umaine.edu/'],
  MD: ['Maryland', 'University of Maryland Extension', 'https://extension.umd.edu/'],
  MA: ['Massachusetts', 'UMass Center for Agriculture, Food, and the Environment', 'https://www.umass.edu/agriculture-food-environment/'],
  MI: ['Michigan', 'Michigan State University Extension', 'https://www.canr.msu.edu/outreach/'],
  MN: ['Minnesota', 'University of Minnesota Extension', 'https://extension.umn.edu/'],
  MS: ['Mississippi', 'Mississippi State University Extension', 'https://extension.msstate.edu/'],
  MO: ['Missouri', 'University of Missouri Extension', 'https://extension.missouri.edu/'],
  MT: ['Montana', 'Montana State University Extension', 'https://www.montana.edu/extension/'],
  NE: ['Nebraska', 'Nebraska Extension', 'https://extension.unl.edu/'],
  NV: ['Nevada', 'University of Nevada, Reno Extension', 'https://extension.unr.edu/'],
  NH: ['New Hampshire', 'UNH Extension', 'https://extension.unh.edu/'],
  NJ: ['New Jersey', 'Rutgers NJ Agricultural Experiment Station', 'https://sebs.rutgers.edu/njaes'],
  NM: ['New Mexico', 'NMSU Cooperative Extension Service', 'https://extension.nmsu.edu/'],
  NY: ['New York', 'Cornell Cooperative Extension', 'https://cals.cornell.edu/cornell-cooperative-extension'],
  NC: ['North Carolina', 'NC State Extension', 'https://www.ces.ncsu.edu/'],
  ND: ['North Dakota', 'NDSU Extension', 'https://www.ndsu.edu/agriculture/extension'],
  OH: ['Ohio', 'Ohio State University Extension', 'https://extension.osu.edu/'],
  OK: ['Oklahoma', 'Oklahoma State University Extension', 'https://extension.okstate.edu/'],
  OR: ['Oregon', 'Oregon State University Extension Service', 'https://extension.oregonstate.edu/'],
  PA: ['Pennsylvania', 'Penn State Extension', 'https://extension.psu.edu/'],
  RI: ['Rhode Island', 'URI Cooperative Extension', 'https://web.uri.edu/coopext/'],
  SC: ['South Carolina', 'Clemson Cooperative Extension', 'https://www.clemson.edu/extension/'],
  SD: ['South Dakota', 'SDSU Extension', 'https://extension.sdstate.edu/'],
  TN: ['Tennessee', 'UT Extension', 'https://utextension.tennessee.edu/'],
  TX: ['Texas', 'Texas A&M AgriLife Extension', 'https://agrilifeextension.tamu.edu/'],
  UT: ['Utah', 'Utah State University Extension', 'https://extension.usu.edu/'],
  VT: ['Vermont', 'UVM Extension', 'https://www.uvm.edu/extension'],
  VA: ['Virginia', 'Virginia Cooperative Extension', 'https://ext.vt.edu/'],
  WA: ['Washington', 'WSU Extension', 'https://extension.wsu.edu/'],
  WV: ['West Virginia', 'WVU Extension', 'https://extension.wvu.edu/'],
  WI: ['Wisconsin', 'UW–Madison Extension', 'https://extension.wisc.edu/'],
  WY: ['Wyoming', 'University of Wyoming Extension', 'https://www.uwyo.edu/uwe/'],
};

export const STATE_OPTIONS = Object.entries(EXTENSION)
  .map(([code, [name]]) => ({ code, name }))
  .sort((a, b) => a.name.localeCompare(b.name));

const BY_NAME_LENGTH = [...STATE_OPTIONS].sort((a, b) => b.name.length - a.name.length);

export function extensionFor(state) {
  const e = EXTENSION[String(state ?? '').toUpperCase()];
  return e ? { state: e[0], name: e[1], url: e[2] } : null;
}

// "Asheville, NC", "Bozeman, Montana 59715" -> 'NC', 'MT'. Returns null when unsure.
export function guessState(location) {
  if (!location) return null;
  const text = location.trim();
  // Longest names first so "West Virginia" wins over "Virginia".
  const byName = BY_NAME_LENGTH.find((s) => new RegExp(`\\b${s.name}\\b`, 'i').test(text));
  if (byName) return byName.code;
  const code = text.match(/(?:,|\s)\s*([A-Za-z]{2})(?:\s+\d{5}(?:-\d{4})?)?\s*$/)?.[1]?.toUpperCase();
  return code && EXTENSION[code] ? code : null;
}
