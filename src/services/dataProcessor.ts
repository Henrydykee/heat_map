import type { NewsArticle, Incident, IncidentType, Statistics } from '../types';
import { NIGERIA_STATES, INCIDENT_KEYWORDS, RELIGIOUS_KEYWORDS, BUILDING_KEYWORDS } from '../utils/constants';
import { subDays, startOfMonth } from 'date-fns';

export const processNewsToIncidents = (articles: NewsArticle[]): Incident[] => {
  return articles
    .map((article, index) => {
      const incident = extractIncidentFromArticle(article, index);
      return incident;
    })
    .filter((incident): incident is Incident => incident !== null);
};

const extractIncidentFromArticle = (
  article: NewsArticle,
  index: number
): Incident | null => {
  const text = `${article.title} ${article.description || ''} ${article.content || ''}`.toLowerCase();
  
  // Extract location
  const location = extractLocation(text);
  if (!location) return null;

  // Classify incident type
  const incidentType = classifyIncidentType(text);

  // Extract casualties
  const casualties = extractCasualties(text);

  // Extract building destruction
  const buildingsDestroyed = extractBuildingDestruction(text);

  return {
    id: `incident-${index}-${Date.now()}`,
    title: article.title,
    location: {
      state: location.state,
      coordinates: location.coordinates,
    },
    type: incidentType,
    date: article.publishedAt,
    casualties,
    buildingsDestroyed,
    source: article.source.name,
    url: article.url,
  };
};

const extractLocation = (
  text: string
): { state: string; coordinates: [number, number] } | null => {
  // Try to match state names
  for (const [state, coords] of Object.entries(NIGERIA_STATES)) {
    const stateLower = state.toLowerCase();
    if (
      text.includes(stateLower) ||
      text.includes(stateLower.replace(/\s+/g, ''))
    ) {
      return { state, coordinates: coords };
    }
  }

  // If no state found, return null (we need at least a state)
  return null;
};

const classifyIncidentType = (text: string): IncidentType => {
  for (const [type, keywords] of Object.entries(INCIDENT_KEYWORDS)) {
    if (keywords.some((keyword) => text.includes(keyword.toLowerCase()))) {
      return type as IncidentType;
    }
  }
  return 'unknown';
};

const extractCasualties = (text: string): {
  total: number;
  christians: number;
  muslims: number;
} => {
  // Extract numbers that might be death counts
  const deathPatterns = [
    /\b(\d+)\s*(?:killed|dead|died|death|casualties|casualty)\b/gi,
    /\b(?:killed|dead|died|death|casualties|casualty)\s*(?:were|was)?\s*(\d+)\b/gi,
    /\b(\d+)\s*(?:people|persons|individuals|victims)\s*(?:killed|dead|died)\b/gi,
  ];

  let total = 0;
  for (const pattern of deathPatterns) {
    const matches = text.match(pattern);
    if (matches) {
      const numbers = matches
        .map((match) => parseInt(match.match(/\d+/)![0]))
        .filter((num) => num > 0 && num < 10000); // Reasonable range
      if (numbers.length > 0) {
        total = Math.max(total, ...numbers);
      }
    }
  }

  // Try to identify religious affiliation
  let christians = 0;
  let muslims = 0;

  const christianText = RELIGIOUS_KEYWORDS.christian.some((kw) =>
    text.includes(kw)
  );
  const muslimText = RELIGIOUS_KEYWORDS.muslim.some((kw) =>
    text.includes(kw)
  );

  if (christianText && !muslimText && total > 0) {
    christians = total;
  } else if (muslimText && !christianText && total > 0) {
    muslims = total;
  } else if (total > 0) {
    // If both mentioned or unclear, split 50/50 as default
    // In a real app, you'd want more sophisticated parsing
    christians = Math.floor(total / 2);
    muslims = Math.ceil(total / 2);
  }

  return { total, christians, muslims };
};

const extractBuildingDestruction = (text: string): {
  churches: number;
  mosques: number;
} => {
  let churches = 0;
  let mosques = 0;

  // Check for church destruction
  const churchKeywords = BUILDING_KEYWORDS.church;
  const hasChurchMention = churchKeywords.some((kw) => text.includes(kw));
  const churchDestructionKeywords = ['burnt', 'burned', 'destroyed', 'razed', 'attacked', 'damaged'];
  const hasChurchDestruction = churchDestructionKeywords.some((kw) =>
    text.includes(kw)
  );

  if (hasChurchMention && hasChurchDestruction) {
    // Try to extract number
    const churchPattern = /(\d+)\s*(?:church|churches)/i;
    const match = text.match(churchPattern);
    churches = match ? parseInt(match[1]) : 1;
  }

  // Check for mosque destruction
  const mosqueKeywords = BUILDING_KEYWORDS.mosque;
  const hasMosqueMention = mosqueKeywords.some((kw) => text.includes(kw));
  const hasMosqueDestruction = churchDestructionKeywords.some((kw) =>
    text.includes(kw)
  );

  if (hasMosqueMention && hasMosqueDestruction) {
    const mosquePattern = /(\d+)\s*(?:mosque|mosques)/i;
    const match = text.match(mosquePattern);
    mosques = match ? parseInt(match[1]) : 1;
  }

  return { churches, mosques };
};

export const calculateStatistics = (incidents: Incident[]): Statistics => {
  if (!incidents || incidents.length === 0) {
    return {
      totalDeaths: { daily: 0, weekly: 0, monthly: 0 },
      casualties: { christians: 0, muslims: 0 },
      buildingsDestroyed: { churches: 0, mosques: 0 },
      attacks: { bandits: 0, fulaniHerdsmen: 0, bokoHaram: 0, iswap: 0, other: 0 },
    };
  }

  // Get current date and normalize to start of day for accurate comparisons
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = subDays(today, 7);
  const monthStart = startOfMonth(today);
  const thirtyDaysAgo = subDays(today, 30);

  // Helper function to normalize incident date to start of day
  const normalizeDate = (dateString: string): Date => {
    const date = new Date(dateString);
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  };

  // Filter incidents by date ranges with proper date normalization
  const dailyIncidents = incidents.filter((incident) => {
    const incidentDate = normalizeDate(incident.date);
    return incidentDate.getTime() === today.getTime();
  });

  const weeklyIncidents = incidents.filter((incident) => {
    const incidentDate = normalizeDate(incident.date);
    return incidentDate >= weekAgo && incidentDate <= today;
  });

  const monthlyIncidents = incidents.filter((incident) => {
    const incidentDate = normalizeDate(incident.date);
    return incidentDate >= monthStart && incidentDate <= today;
  });

  const recentIncidents = incidents.filter((incident) => {
    const incidentDate = normalizeDate(incident.date);
    return incidentDate >= thirtyDaysAgo && incidentDate <= today;
  });

  // Calculate death counts for each time period
  const totalDeaths = {
    daily: dailyIncidents.reduce((sum, i) => sum + (i.casualties?.total || 0), 0),
    weekly: weeklyIncidents.reduce((sum, i) => sum + (i.casualties?.total || 0), 0),
    monthly: monthlyIncidents.reduce((sum, i) => sum + (i.casualties?.total || 0), 0),
  };

  // Calculate total casualties from recent incidents (last 30 days)
  const casualties = {
    christians: recentIncidents.reduce((sum, i) => sum + (i.casualties?.christians || 0), 0),
    muslims: recentIncidents.reduce((sum, i) => sum + (i.casualties?.muslims || 0), 0),
  };

  // Calculate buildings destroyed from recent incidents
  const buildingsDestroyed = {
    churches: recentIncidents.reduce((sum, i) => sum + (i.buildingsDestroyed?.churches || 0), 0),
    mosques: recentIncidents.reduce((sum, i) => sum + (i.buildingsDestroyed?.mosques || 0), 0),
  };

  // Count attacks from recent incidents (last 30 days)
  const attacks = {
    bandits: recentIncidents.filter((i) => i.type === 'bandit_attack').length,
    fulaniHerdsmen: recentIncidents.filter((i) => i.type === 'fulani_herdsmen').length,
    bokoHaram: recentIncidents.filter((i) => i.type === 'boko_haram').length,
    iswap: recentIncidents.filter((i) => i.type === 'iswap').length,
    other: recentIncidents.filter((i) => 
      i.type === 'unknown' || 
      i.type === 'communal_clash' || 
      i.type === 'kidnapping' || 
      i.type === 'terror_attack'
    ).length,
  };

  return {
    totalDeaths,
    casualties,
    buildingsDestroyed,
    attacks,
  };
};

