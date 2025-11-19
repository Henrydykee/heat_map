import { useState, useEffect, useCallback } from 'react';
import type { Video } from '../types';
import { fetchSecurityVideos } from '../services/videoFeeds';

interface UseVideoDataReturn {
  videos: Video[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useVideoData = (): UseVideoDataReturn => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const fetchedVideos = await fetchSecurityVideos(7);
      setVideos(fetchedVideos);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch videos';
      setError(errorMessage);
      console.error('Error loading videos:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    videos,
    loading,
    error,
    refresh: loadData,
  };
};

