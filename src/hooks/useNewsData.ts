import { useState, useEffect, useMemo, useCallback } from 'react';
import type { NewsArticle, Incident, Statistics } from '../types';
import { fetchNewsArticles } from '../services/newsApi';
import { fetchRSSArticles } from '../services/rssFeeds';
import { processNewsToIncidents, calculateStatistics } from '../services/dataProcessor';

interface UseNewsDataReturn {
  articles: NewsArticle[];
  incidents: Incident[];
  statistics: Statistics;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useNewsData = (apiKey: string | null): UseNewsDataReturn => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Calculate statistics reactively whenever incidents change
  const statistics = useMemo<Statistics>(() => {
    if (incidents.length === 0) {
      return {
        totalDeaths: { daily: 0, weekly: 0, monthly: 0 },
        casualties: { christians: 0, muslims: 0 },
        buildingsDestroyed: { churches: 0, mosques: 0 },
        attacks: { bandits: 0, fulaniHerdsmen: 0, bokoHaram: 0, iswap: 0, other: 0 },
      };
    }
    return calculateStatistics(incidents);
  }, [incidents, lastUpdate]); // Recalculate when incidents or lastUpdate changes

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch from multiple sources in parallel
      const fetchPromises: Promise<NewsArticle[]>[] = [
        // Always fetch RSS feeds (no API key needed)
        fetchRSSArticles(7),
      ];

      // Optionally fetch from NewsAPI if key is provided
      if (apiKey) {
        fetchPromises.push(
          fetchNewsArticles(apiKey).catch((err) => {
            console.warn('NewsAPI fetch failed, continuing with RSS feeds:', err);
            return [];
          })
        );
      }

      // Wait for all sources to complete
      const results = await Promise.allSettled(fetchPromises);
      
      // Combine all articles
      const allArticles: NewsArticle[] = [];
      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          allArticles.push(...result.value);
        }
      });

      // Remove duplicates based on URL and title similarity
      const uniqueArticles = allArticles.filter((article, index, self) => {
        // Remove exact URL duplicates
        const urlIndex = self.findIndex((a) => a.url === article.url);
        if (urlIndex !== index) return false;

        // Remove similar titles (likely same article from different sources)
        const titleLower = article.title.toLowerCase().trim();
        const similarIndex = self.findIndex((a, i) => {
          if (i >= index) return false;
          const otherTitle = a.title.toLowerCase().trim();
          // Check if titles are very similar (80% match)
          const similarity = calculateSimilarity(titleLower, otherTitle);
          return similarity > 0.8;
        });
        
        return similarIndex === -1;
      });

      // Sort by date, newest first
      uniqueArticles.sort((a, b) => {
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      });

      setArticles(uniqueArticles);

      const processedIncidents = processNewsToIncidents(uniqueArticles);
      setIncidents(processedIncidents);
      
      // Update timestamp to trigger statistics recalculation
      setLastUpdate(new Date());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch news data';
      setError(errorMessage);
      console.error('Error loading news data:', err);
    } finally {
      setLoading(false);
    }
  }, [apiKey]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    articles,
    incidents,
    statistics,
    loading,
    error,
    refresh: loadData,
  };
};

// Helper function to calculate string similarity (simple Levenshtein-based)
const calculateSimilarity = (str1: string, str2: string): number => {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
};

// Simple Levenshtein distance calculation
const levenshteinDistance = (str1: string, str2: string): number => {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
};

