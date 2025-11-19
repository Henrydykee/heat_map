import type { Video } from '../types';
import { format } from 'date-fns';
import ShareButton from './ShareButton';
import LoadingSkeleton from './LoadingSkeleton';

interface VideoFeedProps {
  videos: Video[];
  loading?: boolean;
}

const VideoFeed = ({ videos, loading }: VideoFeedProps) => {
  if (loading) {
    return (
      <div className="video-feed loading">
        <h2>Latest Videos</h2>
        <div className="video-grid">
          <LoadingSkeleton type="video" count={6} />
        </div>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="video-feed">
        <h2>Latest Videos</h2>
        <div className="no-videos">No security-related videos found.</div>
      </div>
    );
  }

  return (
    <div className="video-feed">
      <h2>Latest Videos</h2>
      <div className="video-grid">
        {videos.map((video) => (
          <article key={video.id} className="video-card">
            <a
              href={video.url}
              target="_blank"
              rel="noopener noreferrer"
              className="video-link"
            >
              <div className="video-thumbnail">
                <img src={video.thumbnail} alt={video.title} />
                {video.duration && (
                  <span className="video-duration">{video.duration}</span>
                )}
                <div className="video-play-overlay">
                  <svg
                    width="64"
                    height="64"
                    viewBox="0 0 64 64"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="32" cy="32" r="32" fill="rgba(0, 0, 0, 0.6)" />
                    <path
                      d="M24 20L44 32L24 44V20Z"
                      fill="white"
                    />
                  </svg>
                </div>
              </div>
            </a>
            <div className="video-content">
              <h3>
                <a
                  href={video.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="video-title-link"
                >
                  {video.title}
                </a>
              </h3>
              <div className="video-meta">
                <a
                  href={video.channelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="video-channel"
                >
                  {video.channelName}
                </a>
                <span className="video-date">
                  {format(new Date(video.publishedAt), 'MMM dd, yyyy')}
                </span>
              </div>
              {video.description && (
                <p className="video-description">{video.description}</p>
              )}
              <div className="video-actions">
                <ShareButton
                  title={video.title}
                  url={video.url}
                  text={video.description}
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

export default VideoFeed;

