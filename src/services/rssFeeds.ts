import axios from 'axios';
import type { NewsArticle } from '../types';
import { subDays } from 'date-fns';

// CORS proxy to fetch RSS feeds (free public proxy)
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

// Nigerian news sources RSS feeds
const RSS_FEEDS = [
  {
    name: 'Premium Times',
    url: 'https://www.premiumtimesng.com/feed',
  },
  {
    name: 'Channels TV',
    url: 'https://www.channelstv.com/feed/',
  },
  {
    name: 'Vanguard',
    url: 'https://www.vanguardngr.com/feed/',
  },
  {
    name: 'Punch Nigeria',
    url: 'https://punchng.com/feed/',
  },
  {
    name: 'Daily Trust',
    url: 'https://dailytrust.com/feed/',
  },
  {
    name: 'The Guardian Nigeria',
    url: 'https://guardian.ng/feed/',
  },
  {
    name: 'This Day',
    url: 'https://www.thisdaylive.com/index.php/feed/',
  },
];

// Security keywords for filtering
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

// Helper function to check if article is security-related
const isSecurityRelated = (title: string, description: string = ''): boolean => {
  const text = `${title} ${description}`.toLowerCase();
  return SECURITY_KEYWORDS.some(keyword => text.includes(keyword));
};

// Convert RSS item to NewsArticle format
const convertRSSItemToArticle = (
  item: any,
  sourceName: string
): NewsArticle | null => {
  if (!item.title || !item.link) return null;

  const title = item.title.trim();
  const description = item.contentSnippet || item.content || item.description || '';
  const content = item.content || description;

  // Filter for security-related and English content
  if (!isEnglishText(title) && !isEnglishText(description)) {
    return null;
  }

  if (!isSecurityRelated(title, description)) {
    return null;
  }

  // Extract image URL
  let imageUrl: string | null = null;
  if (item.enclosure?.url) {
    imageUrl = item.enclosure.url;
  } else if (content) {
    // Try to extract image from HTML content
    const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (imgMatch) {
      imageUrl = imgMatch[1];
    }
  }

  // Clean HTML from description
  const cleanDescription = description
    .replace(/<[^>]*>/g, '')
    .replace(/&[^;]+;/g, ' ')
    .trim()
    .substring(0, 500);

  return {
    title,
    description: cleanDescription,
    url: item.link,
    urlToImage: imageUrl,
    publishedAt: item.pubDate || item.isoDate || new Date().toISOString(),
    source: {
      name: sourceName,
      id: null,
    },
    content: content ? content.replace(/<[^>]*>/g, '').substring(0, 2000) : null,
  };
};

// Parse RSS XML to extract items
const parseRSSXML = (xmlText: string): any[] => {
  const items: any[] = [];
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
  
  // Handle RSS 2.0 format
  const rssItems = xmlDoc.querySelectorAll('item');
  rssItems.forEach((item) => {
    const title = item.querySelector('title')?.textContent || '';
    const link = item.querySelector('link')?.textContent || '';
    const description = item.querySelector('description')?.textContent || '';
    const pubDate = item.querySelector('pubDate')?.textContent || '';
    const content = item.querySelector('content\\:encoded')?.textContent || description;
    const enclosure = item.querySelector('enclosure');
    const imageUrl = enclosure?.getAttribute('url') || null;
    
    items.push({
      title,
      link,
      description,
      contentSnippet: description,
      content,
      pubDate,
      enclosure: imageUrl ? { url: imageUrl } : null,
    });
  });
  
  // Handle Atom format if RSS format didn't work
  if (items.length === 0) {
    const atomEntries = xmlDoc.querySelectorAll('entry');
    atomEntries.forEach((entry) => {
      const title = entry.querySelector('title')?.textContent || '';
      const link = entry.querySelector('link')?.getAttribute('href') || '';
      const summary = entry.querySelector('summary')?.textContent || entry.querySelector('content')?.textContent || '';
      const published = entry.querySelector('published')?.textContent || entry.querySelector('updated')?.textContent || '';
      
      items.push({
        title,
        link,
        description: summary,
        contentSnippet: summary,
        content: summary,
        pubDate: published,
        isoDate: published,
        enclosure: null,
      });
    });
  }
  
  return items;
};

// Fetch articles from a single RSS feed
const fetchRSSFeed = async (feed: { name: string; url: string }): Promise<NewsArticle[]> => {
  try {
    // Use CORS proxy to fetch RSS feed
    const proxyUrl = `${CORS_PROXY}${encodeURIComponent(feed.url)}`;
    const response = await axios.get(proxyUrl, {
      timeout: 10000,
      headers: {
        'Accept': 'application/rss+xml, application/xml, text/xml',
      },
    });
    
    const items = parseRSSXML(response.data);
    const articles: NewsArticle[] = [];

    for (const item of items) {
      const article = convertRSSItemToArticle(item, feed.name);
      if (article) {
        articles.push(article);
      }
    }

    return articles;
  } catch (error) {
    console.error(`Error fetching RSS feed from ${feed.name}:`, error);
    return [];
  }
};

// Fetch all RSS feeds and combine results
export const fetchRSSArticles = async (maxDaysOld: number = 7): Promise<NewsArticle[]> => {
  try {
    const cutoffDate = subDays(new Date(), maxDaysOld);
    
    // Fetch all feeds in parallel
    const feedPromises = RSS_FEEDS.map(feed => fetchRSSFeed(feed));
    const feedResults = await Promise.allSettled(feedPromises);

    // Combine all articles
    const allArticles: NewsArticle[] = [];
    
    feedResults.forEach((result) => {
      if (result.status === 'fulfilled') {
        allArticles.push(...result.value);
      }
    });

    // Filter by date and remove duplicates
    const filteredArticles = allArticles
      .filter((article) => {
        const articleDate = new Date(article.publishedAt);
        return articleDate >= cutoffDate;
      })
      .filter((article, index, self) => {
        // Remove duplicates based on URL
        return index === self.findIndex((a) => a.url === article.url);
      })
      .sort((a, b) => {
        // Sort by date, newest first
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      });

    return filteredArticles;
  } catch (error) {
    console.error('Error fetching RSS articles:', error);
    return [];
  }
};

