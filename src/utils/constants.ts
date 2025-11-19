// Nigeria center coordinates
export const NIGERIA_CENTER: [number, number] = [9.0820, 8.6753];
export const NIGERIA_ZOOM = 6;

// Nigeria states with approximate coordinates
export const NIGERIA_STATES: Record<string, [number, number]> = {
  'Abia': [5.5320, 7.4860],
  'Adamawa': [9.3265, 12.3984],
  'Akwa Ibom': [5.1477, 7.9026],
  'Anambra': [6.2209, 7.0724],
  'Bauchi': [10.3103, 9.8439],
  'Bayelsa': [4.9269, 6.2644],
  'Benue': [7.3369, 8.7404],
  'Borno': [11.8333, 13.1500],
  'Cross River': [5.8702, 8.5988],
  'Delta': [5.7049, 5.9339],
  'Ebonyi': [6.2649, 8.0137],
  'Edo': [6.3400, 5.6170],
  'Ekiti': [7.6233, 5.2209],
  'Enugu': [6.4584, 7.5464],
  'Gombe': [10.2897, 11.1711],
  'Imo': [5.4836, 7.0266],
  'Jigawa': [12.5700, 9.7800],
  'Kaduna': [10.5264, 7.4381],
  'Kano': [12.0022, 8.5919],
  'Katsina': [12.9855, 7.6174],
  'Kebbi': [11.4942, 4.2333],
  'Kogi': [7.8000, 6.7333],
  'Kwara': [8.5000, 4.5500],
  'Lagos': [6.5244, 3.3792],
  'Nasarawa': [8.5474, 7.7098],
  'Niger': [9.6000, 6.5500],
  'Ogun': [7.1557, 3.3451],
  'Ondo': [7.2574, 5.2058],
  'Osun': [7.5624, 4.5200],
  'Oyo': [7.3775, 3.9470],
  'Plateau': [9.9285, 8.8921],
  'Rivers': [4.8156, 7.0498],
  'Sokoto': [13.0059, 5.2476],
  'Taraba': [8.8921, 11.3644],
  'Yobe': [11.7480, 11.9664],
  'Zamfara': [12.1222, 6.2236],
  'FCT': [9.0765, 7.3986],
};

// Keywords for incident classification
export const INCIDENT_KEYWORDS: Record<string, string[]> = {
  bandit_attack: [
    'bandit',
    'bandits',
    'banditry',
    'bandit attack',
    'armed bandits',
  ],
  fulani_herdsmen: [
    'fulani',
    'fulani herdsmen',
    'herdsmen',
    'herdsman',
    'herder',
    'cattle herder',
  ],
  boko_haram: [
    'boko haram',
    'bokoharam',
    'boko-haram',
  ],
  iswap: [
    'iswap',
    'iswap',
    'islamic state west africa',
    'islamic state west africa province',
  ],
  communal_clash: [
    'communal clash',
    'communal violence',
    'ethnic clash',
    'tribal clash',
  ],
  kidnapping: [
    'kidnap',
    'kidnapping',
    'abduct',
    'abduction',
    'hostage',
  ],
  terror_attack: [
    'terror',
    'terrorist',
    'terrorism',
    'terror attack',
    'terrorist attack',
  ],
};

// Keywords for religious identification
export const RELIGIOUS_KEYWORDS = {
  christian: [
    'christian',
    'christians',
    'church',
    'churches',
    'pastor',
    'priest',
    'christianity',
  ],
  muslim: [
    'muslim',
    'muslims',
    'mosque',
    'mosques',
    'islam',
    'islamic',
    'imam',
  ],
};

// Keywords for building destruction
export const BUILDING_KEYWORDS = {
  church: [
    'church',
    'churches',
    'church building',
    'worship center',
    'cathedral',
    'chapel',
  ],
  mosque: [
    'mosque',
    'mosques',
    'mosque building',
    'islamic center',
  ],
};

