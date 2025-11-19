export interface NewsArticle {
  title: string;
  description: string;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  source: {
    name: string;
    id: string | null;
  };
  content: string | null;
}

export interface NewsApiResponse {
  status: string;
  totalResults: number;
  articles: NewsArticle[];
}

export interface Video {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnail: string;
  publishedAt: string;
  channelName: string;
  channelUrl: string;
  duration?: string;
  viewCount?: string;
}

export interface Incident {
  id: string;
  title: string;
  location: {
    state: string;
    coordinates: [number, number];
  };
  type: IncidentType;
  date: string;
  casualties: {
    total: number;
    christians: number;
    muslims: number;
  };
  buildingsDestroyed: {
    churches: number;
    mosques: number;
  };
  source: string;
  url: string;
}

export type IncidentType = 
  | 'bandit_attack'
  | 'fulani_herdsmen'
  | 'boko_haram'
  | 'iswap'
  | 'communal_clash'
  | 'kidnapping'
  | 'terror_attack'
  | 'unknown';

export interface Statistics {
  totalDeaths: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  casualties: {
    christians: number;
    muslims: number;
  };
  buildingsDestroyed: {
    churches: number;
    mosques: number;
  };
  attacks: {
    bandits: number;
    fulaniHerdsmen: number;
    bokoHaram: number;
    iswap: number;
    other: number;
  };
}

export interface MapMarker {
  position: [number, number];
  incident: Incident;
}
