import type { NewsArticle } from '../types';
import { format } from 'date-fns';
import ShareButton from './ShareButton';
import LoadingSkeleton from './LoadingSkeleton';

interface NewsFeedProps {
  articles: NewsArticle[];
  loading?: boolean;
}

const NewsFeed = ({ articles, loading }: NewsFeedProps) => {
  if (loading) {
    return (
      <div className="news-feed loading">
        <h2>Latest News</h2>
        <div className="news-grid">
          <LoadingSkeleton type="article" count={6} />
        </div>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="news-feed">
        <h2>Latest News</h2>
        <div className="no-articles">No news articles found for today.</div>
      </div>
    );
  }

  return (
    <div className="news-feed">
      <h2>Latest News</h2>
      <div className="news-grid">
        {articles.map((article, index) => (
          <article key={index} className="news-card">
            {article.urlToImage && (
              <div className="news-image">
                <img src={article.urlToImage} alt={article.title} />
              </div>
            )}
            <div className="news-content">
              <h3>{article.title}</h3>
              <div className="news-meta">
                <span className="news-source">{article.source.name}</span>
                <span className="news-date">
                  {format(new Date(article.publishedAt), 'MMM dd, yyyy HH:mm')}
                </span>
              </div>
              {article.description && (
                <p className="news-snippet">{article.description}</p>
              )}
              <div className="news-actions">
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="news-link"
                >
                  Read Full Article →
                </a>
                <ShareButton
                  title={article.title}
                  url={article.url}
                  text={article.description}
                  variant="icon"
                />
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default NewsFeed;

