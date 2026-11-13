// The Livestock Conservancy's Conservation Priority List categories, summarized
// from its published definitions (thresholds shown are for large livestock;
// rabbits and poultry use their own counts).
export const CPL_URL = 'https://livestockconservancy.org/heritage-breeds/heritage-breeds-list/';

export const STATUS_INFO = {
  Critical: {
    tone: 'critical',
    summary: 'Fewer than 200 annual U.S. registrations and an estimated global population under 500.',
  },
  Threatened: {
    tone: 'threatened',
    summary: 'Fewer than 1,000 annual U.S. registrations and an estimated global population under 5,000.',
  },
  Watch: {
    tone: 'watch',
    summary: 'Genetic or numerical concerns or a limited range, with fewer than 2,500 annual U.S. registrations.',
  },
  Recovering: {
    tone: 'recovering',
    summary: 'Previously listed and now above Watch numbers, but still monitored.',
  },
  Study: {
    tone: 'study',
    summary: 'Under research to decide whether the breed should be listed.',
  },
};

export const NOT_LISTED =
  'Not on the Conservation Priority List. The list tracks historic breeds with small U.S. populations, so common, commercial, and recently developed breeds aren\'t included.';
