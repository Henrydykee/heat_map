import { useState, useMemo } from 'react';
import type { NewsArticle, Incident, Video } from '../types';

export interface FilterState {
  searchQuery: string;
  selectedState: string;
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  incidentType: string;
}

const useFilters = () => {
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    selectedState: 'all',
    dateRange: {
      start: null,
      end: null,
    },
    incidentType: 'all',
  });

  const updateFilter = (key: keyof FilterState, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      searchQuery: '',
      selectedState: 'all',
      dateRange: {
        start: null,
        end: null,
      },
      incidentType: 'all',
    });
  };

  const filterArticles = (articles: NewsArticle[]): NewsArticle[] => {
    return articles.filter((article) => {
      // Search filter
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const matchesSearch =
          article.title.toLowerCase().includes(query) ||
          article.description?.toLowerCase().includes(query) ||
          article.source.name.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Date range filter
      if (filters.dateRange.start || filters.dateRange.end) {
        const articleDate = new Date(article.publishedAt);
        if (filters.dateRange.start && articleDate < filters.dateRange.start) {
          return false;
        }
        if (filters.dateRange.end) {
          const endDate = new Date(filters.dateRange.end);
          endDate.setHours(23, 59, 59, 999);
          if (articleDate > endDate) {
            return false;
          }
        }
      }

      return true;
    });
  };

  const filterVideos = (videos: Video[]): Video[] => {
    return videos.filter((video) => {
      // Search filter
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const matchesSearch =
          video.title.toLowerCase().includes(query) ||
          video.description?.toLowerCase().includes(query) ||
          video.channelName.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Date range filter
      if (filters.dateRange.start || filters.dateRange.end) {
        const videoDate = new Date(video.publishedAt);
        if (filters.dateRange.start && videoDate < filters.dateRange.start) {
          return false;
        }
        if (filters.dateRange.end) {
          const endDate = new Date(filters.dateRange.end);
          endDate.setHours(23, 59, 59, 999);
          if (videoDate > endDate) {
            return false;
          }
        }
      }

      return true;
    });
  };

  const filterIncidents = (incidents: Incident[]): Incident[] => {
    return incidents.filter((incident) => {
      // Search filter
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const matchesSearch =
          incident.title.toLowerCase().includes(query) ||
          incident.location.state.toLowerCase().includes(query) ||
          incident.type.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // State filter
      if (filters.selectedState !== 'all') {
        if (incident.location.state !== filters.selectedState) {
          return false;
        }
      }

      // Incident type filter
      if (filters.incidentType !== 'all') {
        if (incident.type !== filters.incidentType) {
          return false;
        }
      }

      // Date range filter
      if (filters.dateRange.start || filters.dateRange.end) {
        const incidentDate = new Date(incident.date);
        if (filters.dateRange.start && incidentDate < filters.dateRange.start) {
          return false;
        }
        if (filters.dateRange.end) {
          const endDate = new Date(filters.dateRange.end);
          endDate.setHours(23, 59, 59, 999);
          if (incidentDate > endDate) {
            return false;
          }
        }
      }

      return true;
    });
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.searchQuery) count++;
    if (filters.selectedState !== 'all') count++;
    if (filters.dateRange.start || filters.dateRange.end) count++;
    if (filters.incidentType !== 'all') count++;
    return count;
  }, [filters]);

  return {
    filters,
    updateFilter,
    clearFilters,
    filterArticles,
    filterVideos,
    filterIncidents,
    activeFilterCount,
  };
};

export default useFilters;

