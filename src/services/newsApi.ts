import axios from 'axios';
import type { NewsApiResponse, NewsArticle } from '../types';
import { format, subDays } from 'date-fns';

const NEWS_API_BASE_URL = 'https://newsapi.org/v2/everything';

// Helper function to detect if text is primarily in English
const isEnglishText = (text: string): boolean => {
  if (!text || text.trim().length === 0) return true;
  
  // Common English words and patterns
  const englishPattern = /[a-zA-Z]/g;
  const nonEnglishPattern = /[^\x00-\x7F]/g;
  
  const englishChars = (text.match(englishPattern) || []).length;
  const nonEnglishChars = (text.match(nonEnglishPattern) || []).length;
  const totalChars = text.length;
  
  // If more than 70% of characters are English letters, consider it English
  // Also check if non-ASCII characters are less than 30%
  return englishChars / totalChars > 0.5 && nonEnglishChars / totalChars < 0.3;
};

export const fetchNewsArticles = async (
  apiKey: string,
  date?: Date
): Promise<NewsArticle[]> => {
  try {
    const targetDate = date || new Date();
    const dateStr = format(targetDate, 'yyyy-MM-dd');
    // Use a 7-day window to ensure we get results
    const fromDate = subDays(targetDate, 7);
    const fromDateStr = format(fromDate, 'yyyy-MM-dd');
    
    const params = {
      q: 'Nigeria AND (security OR insecurity OR attack OR violence OR bandits OR banditry OR fulani herdsmen OR terrorism OR kidnapping OR insurgency OR Boko Haram OR ISWAP OR killing OR massacre OR crisis OR conflict)',
      language: 'en',
      from: fromDateStr,
      to: dateStr,
      sortBy: 'publishedAt' as const,
      pageSize: 100,
      apiKey,
    };

    const response = await axios.get<NewsApiResponse>(NEWS_API_BASE_URL, {
      params,
    });

    if (response.data.status === 'ok' && response.data.articles) {
      // Filter to only show security-related articles from the target date or recent days and in English
      const securityKeywords = [
        'security', 'insecurity', 'attack', 'violence', 'bandit', 'banditry',
        'fulani', 'herdsmen', 'terrorism', 'terrorist', 'kidnap', 'insurgency',
        'boko haram', 'iswap', 'kill', 'killed', 'death', 'casualty', 'massacre',
        'crisis', 'conflict', 'gunmen', 'gunman', 'shooting', 'bomb', 'bombing',
        'church', 'mosque', 'destroyed', 'burnt', 'burned', 'raid', 'raided'
      ];
      
      const filtered = response.data.articles.filter(
        (article) => {
          if (!article.title || !article.url) return false;
          
          // Additional English language check (backup filter)
          if (!isEnglishText(article.title) && !isEnglishText(article.description || '')) {
            return false;
          }
          
          // Ensure article is security-related
          const articleText = `${article.title} ${article.description || ''}`.toLowerCase();
          const isSecurityRelated = securityKeywords.some(keyword => 
            articleText.includes(keyword)
          );
          
          if (!isSecurityRelated) return false;
          
          const articleDate = new Date(article.publishedAt);
          const daysDiff = Math.floor(
            (targetDate.getTime() - articleDate.getTime()) / (1000 * 60 * 60 * 24)
          );
          // Include articles from the last 7 days, prioritizing today
          return daysDiff >= 0 && daysDiff <= 7;
        }
      );
      return filtered;
    }

    return [];
  } catch (error) {
    console.error('Error fetching news articles:', error);
    if (axios.isAxiosError(error)) {
      const errorData = error.response?.data;
      if (error.response?.status === 429) {
        throw new Error('API rate limit exceeded. Please try again later.');
      }
      if (error.response?.status === 401) {
        throw new Error('Invalid API key. Please check your configuration.');
      }
      if (error.response?.status === 400) {
        const message = errorData?.message || 'Invalid request parameters.';
        throw new Error(`API Error: ${message}`);
      }
    }
    throw error;
  }
};

export const fetchWeeklyNews = async (
  apiKey: string
): Promise<NewsArticle[]> => {
  try {
    const today = new Date();
    const weekAgo = subDays(today, 7);
    const dateStr = format(weekAgo, 'yyyy-MM-dd');
    const todayStr = format(today, 'yyyy-MM-dd');

    const params = {
      q: 'Nigeria AND (security OR insecurity OR attack OR violence OR bandits OR banditry OR fulani herdsmen OR terrorism OR kidnapping OR insurgency OR Boko Haram OR ISWAP OR killing OR massacre OR crisis OR conflict)',
      language: 'en',
      from: dateStr,
      to: todayStr,
      sortBy: 'publishedAt' as const,
      pageSize: 100,
      apiKey,
    };

    const response = await axios.get<NewsApiResponse>(NEWS_API_BASE_URL, {
      params,
    });

    if (response.data.status === 'ok' && response.data.articles) {
      const securityKeywords = [
        'security', 'insecurity', 'attack', 'violence', 'bandit', 'banditry',
        'fulani', 'herdsmen', 'terrorism', 'terrorist', 'kidnap', 'insurgency',
        'boko haram', 'iswap', 'kill', 'killed', 'death', 'casualty', 'massacre',
        'crisis', 'conflict', 'gunmen', 'gunman', 'shooting', 'bomb', 'bombing',
        'church', 'mosque', 'destroyed', 'burnt', 'burned', 'raid', 'raided'
      ];
      
      return response.data.articles.filter(
        (article) => {
          if (!article.title || !article.url) return false;
          // Additional English language check
          if (!isEnglishText(article.title) && !isEnglishText(article.description || '')) {
            return false;
          }
          // Ensure article is security-related
          const articleText = `${article.title} ${article.description || ''}`.toLowerCase();
          return securityKeywords.some(keyword => articleText.includes(keyword));
        }
      );
    }

    return [];
  } catch (error) {
    console.error('Error fetching weekly news:', error);
    throw error;
  }
};

