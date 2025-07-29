import axios from 'axios';

const API_BASE_URL = 'https://5000-01k162ry3rtgr5fps94r5epb6z.cloudspaces.litng.ai';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Types based on API documentation
export interface Anime {
  id: string;
  title: {
    english: string;
    japanese: string;
  };
  slug: string;
  description: string;
  genres: string[];
  tags: string[];
  type: string;
  status: string;
  releaseDate: string;
  rating: number;
  thumbnail: string;
  coverImage: string;
  seasons: {
    id: string;
    seasonNumber: number;
    title: string;
    totalEpisodes: number;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface Episode {
  id: string;
  animeId: string;
  seasonNumber: number;
  slug: string;
  episodeNumber: number;
  order: number;
  title: string;
  description: string;
  episodeType: string;
  durationSeconds: number;
  thumbnail: string;
  masterPlaylistUrl: string;
  availableQualities: string[];
  availableAudios: string[];
  availableSubtitles: string[];
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface SearchResult extends Anime {
  relevanceScore?: number;
}

// API functions
export const animeAPI = {
  // Get anime by slug
  getBySlug: (slug: string) => 
    api.get<Anime>(`/api/v1/anime/${slug}`),

  // Get trending anime
  getTrending: (limit = 10) => 
    api.get<Anime[]>(`/api/v1/anime/trending?limit=${limit}`),

  // Filter anime with advanced options
  getFiltered: (params: {
    genres?: string[];
    status?: string;
    type?: string;
    sort_by?: string;
    sort_order?: number;
    limit?: number;
    skip?: number;
  } = {}) => {
    const query = new URLSearchParams();
    
    if (params.genres) {
      params.genres.forEach(genre => query.append('genres', genre));
    }
    if (params.status) query.append('status', params.status);
    if (params.type) query.append('type', params.type);
    if (params.sort_by) query.append('sort_by', params.sort_by);
    if (params.sort_order) query.append('sort_order', params.sort_order.toString());
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.skip) query.append('skip', params.skip.toString());

    return api.get<Anime[]>(`/api/v1/anime/?${query.toString()}`);
  },

  // Basic search
  search: (q: string, limit = 10, skip = 0) => 
    api.get<SearchResult[]>(`/api/v1/anime/search/?q=${encodeURIComponent(q)}&limit=${limit}&skip=${skip}`),

  // Advanced search with relevance scoring
  searchAdvanced: (q: string, params: {
    limit?: number;
    skip?: number;
    min_score?: number;
    fuzzy?: boolean;
  } = {}) => {
    const query = new URLSearchParams();
    query.append('q', q);
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.skip) query.append('skip', params.skip.toString());
    if (params.min_score) query.append('min_score', params.min_score.toString());
    if (params.fuzzy !== undefined) query.append('fuzzy', params.fuzzy.toString());

    return api.get<SearchResult[]>(`/api/v1/anime/search/advanced/?${query.toString()}`);
  },

  // Get search suggestions
  getSuggestions: (q: string, limit = 10) => 
    api.get<string[]>(`/api/v1/anime/search/suggest/?q=${encodeURIComponent(q)}&limit=${limit}`),
};

export const episodeAPI = {
  // Get trending episodes
  getTrending: (limit = 10) => 
    api.get<Episode[]>(`/api/v1/episodes/trending?limit=${limit}`),

  // Get episodes by anime ID and season
  getBySeason: (animeId: string, seasonNumber: number, limit = 100, skip = 0) => 
    api.get<Episode[]>(`/api/v1/episodes/anime/${animeId}/season/${seasonNumber}?limit=${limit}&skip=${skip}`),

  // Get episode by slug
  getBySlug: (slug: string) => 
    api.get<Episode>(`/api/v1/episodes/${slug}`),

  // Increment view count
  incrementView: (episodeId: string) => 
    api.post(`/api/v1/episodes/${episodeId}/view`),
};

// Health check
export const healthAPI = {
  check: () => api.get('/health'),
  root: () => api.get('/'),
};