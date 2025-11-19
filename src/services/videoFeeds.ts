import axios from 'axios';
import type { Video } from '../types';
import { subDays } from 'date-fns';

// CORS proxy to fetch YouTube RSS feeds
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

// Security keywords for filtering videos
const SECURITY_KEYWORDS = [
  'security', 'insecurity', 'attack', 'violence', 'bandit', 'banditry',
  'fulani', 'herdsmen', 'terrorism', 'terrorist', 'kidnap', 'insurgency',
  'boko haram', 'iswap', 'kill', 'killed', 'death', 'casualty', 'massacre',
  'crisis', 'conflict', 'gunmen', 'gunman', 'shooting', 'bomb', 'bombing',
  'church', 'mosque', 'destroyed', 'burnt', 'burned', 'raid', 'raided',
  'militant', 'militants', 'insurgent', 'insurgents', 'abduct', 'abduction',
  'hostage', 'hostages', 'assault', 'assaulted', 'violence', 'violent'
];

// Helper function to detect if text is primarily in English
const isEnglishText = (text: string): boolean => {
  if (!text || text.trim().length === 0) return true;
  
  const englishPattern = /[a-zA-Z]/g;
  const nonEnglishPattern = /[^\x00-\x7F]/g;
  
  const englishChars = (text.match(englishPattern) || []).length;
  const nonEnglishChars = (text.match(nonEnglishPattern) || []).length;
  const totalChars = text.length;
  
  return englishChars / totalChars > 0.5 && nonEnglishChars / totalChars < 0.3;
};

// Helper function to check if video is security-related
const isSecurityRelated = (title: string, description: string = ''): boolean => {
  const text = `${title} ${description}`.toLowerCase();
  return SECURITY_KEYWORDS.some(keyword => text.includes(keyword));
};

// Extract YouTube video ID from URL
const extractVideoId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  return null;
};

// Parse YouTube RSS XML
const parseYouTubeRSS = (xmlText: string): any[] => {
  const videos: any[] = [];
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
  
  const entries = xmlDoc.querySelectorAll('entry');
  entries.forEach((entry) => {
    const title = entry.querySelector('title')?.textContent || '';
    const link = entry.querySelector('link')?.getAttribute('href') || '';
    const published = entry.querySelector('published')?.textContent || entry.querySelector('updated')?.textContent || '';
    const author = entry.querySelector('author name')?.textContent || '';
    const authorUri = entry.querySelector('author uri')?.textContent || '';
    
    // Get description from media:description or content
    const description = entry.querySelector('media\\:description, description')?.textContent || '';
    
    // Get thumbnail from media:thumbnail
    const thumbnail = entry.querySelector('media\\:thumbnail')?.getAttribute('url') || 
                     `https://img.youtube.com/vi/${extractVideoId(link) || 'default'}/maxresdefault.jpg`;
    
    // Get duration from media:content
    const duration = entry.querySelector('media\\:content')?.getAttribute('duration') || '';
    
    videos.push({
      title,
      link,
      description,
      published,
      author,
      authorUri,
      thumbnail,
      duration,
      videoId: extractVideoId(link),
    });
  });
  
  return videos;
};

// Convert RSS item to Video format
const convertRSSItemToVideo = (item: any): Video | null => {
  if (!item.title || !item.link) return null;

  const title = item.title.trim();
  const description = item.description || '';

  // Filter for security-related and English content
  if (!isEnglishText(title) && !isEnglishText(description)) {
    return null;
  }

  if (!isSecurityRelated(title, description)) {
    return null;
  }

  // Format duration if available
  let formattedDuration = undefined;
  if (item.duration) {
    const seconds = parseInt(item.duration);
    if (!isNaN(seconds)) {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      if (hours > 0) {
        formattedDuration = `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      } else {
        formattedDuration = `${minutes}:${secs.toString().padStart(2, '0')}`;
      }
    }
  }

  return {
    id: item.videoId || item.link,
    title,
    description: description.substring(0, 300),
    url: item.link,
    thumbnail: item.thumbnail,
    publishedAt: item.published,
    channelName: item.author || 'Unknown Channel',
    channelUrl: item.authorUri || '#',
    duration: formattedDuration,
  };
};

// Fetch videos from YouTube RSS search
const fetchYouTubeSearchRSS = async (query: string): Promise<Video[]> => {
  try {
    // YouTube RSS search URL
    const searchUrl = `https://www.youtube.com/feeds/videos.xml?search_query=${encodeURIComponent(query)}`;
    const proxyUrl = `${CORS_PROXY}${encodeURIComponent(searchUrl)}`;
    
    const response = await axios.get(proxyUrl, {
      timeout: 15000,
      headers: {
        'Accept': 'application/rss+xml, application/xml, text/xml',
      },
    });
    
    const items = parseYouTubeRSS(response.data);
    const videos: Video[] = [];

    for (const item of items) {
      const video = convertRSSItemToVideo(item);
      if (video) {
        videos.push(video);
      }
    }

    return videos;
  } catch (error) {
    console.error(`Error fetching YouTube search RSS for "${query}":`, error);
    return [];
  }
};

// Main function to fetch security-related videos
export const fetchSecurityVideos = async (maxDaysOld: number = 7): Promise<Video[]> => {
  try {
    const cutoffDate = subDays(new Date(), maxDaysOld);
    
    // Search queries for Nigeria security videos
    const searchQueries = [
      'Nigeria security attack',
      'Nigeria bandits attack',
      'Nigeria fulani herdsmen',
      'Nigeria Boko Haram',
      'Nigeria terrorism',
      'Nigeria kidnapping',
      'Nigeria insecurity',
      'Nigeria violence',
    ];

    // Fetch videos from all search queries in parallel
    const searchPromises = searchQueries.map(query => fetchYouTubeSearchRSS(query));
    const searchResults = await Promise.allSettled(searchPromises);

    // Combine all videos
    const allVideos: Video[] = [];
    
    searchResults.forEach((result) => {
      if (result.status === 'fulfilled') {
        allVideos.push(...result.value);
      }
    });

    // Filter by date and remove duplicates
    const filteredVideos = allVideos
      .filter((video) => {
        const videoDate = new Date(video.publishedAt);
        return videoDate >= cutoffDate;
      })
      .filter((video, index, self) => {
        // Remove duplicates based on video ID/URL
        return index === self.findIndex((v) => v.id === video.id || v.url === video.url);
      })
      .sort((a, b) => {
        // Sort by date, newest first
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      })
      .slice(0, 50); // Limit to 50 most recent videos

    return filteredVideos;
  } catch (error) {
    console.error('Error fetching security videos:', error);
    return [];
  }
};

