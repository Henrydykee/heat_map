import './LoadingSkeleton.css';

interface LoadingSkeletonProps {
  type?: 'article' | 'video' | 'stat' | 'map';
  count?: number;
}

const LoadingSkeleton = ({ type = 'article', count = 1 }: LoadingSkeletonProps) => {
  if (type === 'article') {
    return (
      <>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="skeleton-article">
            <div className="skeleton-image"></div>
            <div className="skeleton-content">
              <div className="skeleton-line skeleton-title"></div>
              <div className="skeleton-line skeleton-meta"></div>
              <div className="skeleton-line"></div>
              <div className="skeleton-line skeleton-short"></div>
            </div>
          </div>
        ))}
      </>
    );
  }

  if (type === 'video') {
    return (
      <>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="skeleton-video">
            <div className="skeleton-thumbnail"></div>
            <div className="skeleton-content">
              <div className="skeleton-line skeleton-title"></div>
              <div className="skeleton-line skeleton-meta"></div>
            </div>
          </div>
        ))}
      </>
    );
  }

  if (type === 'stat') {
    return (
      <>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="skeleton-stat">
            <div className="skeleton-line skeleton-title"></div>
            <div className="skeleton-line skeleton-value"></div>
            <div className="skeleton-chart"></div>
          </div>
        ))}
      </>
    );
  }

  if (type === 'map') {
    return <div className="skeleton-map"></div>;
  }

  return null;
};

export default LoadingSkeleton;

