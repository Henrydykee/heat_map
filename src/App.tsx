import { useState } from 'react';
import MapView from './components/MapView';
import NewsFeed from './components/NewsFeed';
import VideoFeed from './components/VideoFeed';
import StatisticsDashboard from './components/StatisticsDashboard';
import FilterPanel from './components/FilterPanel';
import ActionBar from './components/ActionBar';
import { useNewsData } from './hooks/useNewsData';
import { useVideoData } from './hooks/useVideoData';
import { useDailyRefresh } from './hooks/useDailyRefresh';
import useFilters from './hooks/useFilters';
import useDarkMode from './hooks/useDarkMode';
import './App.css';

function App() {
  const apiKey = import.meta.env.VITE_NEWS_API_KEY || null;
  const { articles, incidents, statistics, loading, error, refresh } = useNewsData(apiKey);
  const { videos, loading: videosLoading, refresh: refreshVideos } = useVideoData();
  const { manualRefresh } = useDailyRefresh(refresh, true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showHeatMap, setShowHeatMap] = useState(false);
  
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const {
    filters,
    updateFilter,
    clearFilters,
    filterArticles,
    filterVideos,
    filterIncidents,
    activeFilterCount,
  } = useFilters();

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([manualRefresh(), refreshVideos()]);
    setIsRefreshing(false);
  };

  // Apply filters
  const filteredArticles = filterArticles(articles);
  const filteredVideos = filterVideos(videos);
  const filteredIncidents = filterIncidents(incidents);

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>Nigeria Security Tracker</h1>
          <p className="subtitle">Real-time monitoring of insecurity incidents across Nigeria</p>
        </div>
        <button
          className="refresh-button"
          onClick={handleManualRefresh}
          disabled={isRefreshing || loading}
        >
          {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </header>

      {error && (
        <div className="error-banner">
          <strong>Error:</strong> {error}
          {error.includes('API key') && (
            <span className="error-hint">
              {' '}Note: RSS feeds are still being loaded. NewsAPI key is optional.
            </span>
          )}
        </div>
      )}

      <main className="app-main">
        <ActionBar
          incidents={filteredIncidents}
          articles={filteredArticles}
          onToggleDarkMode={toggleDarkMode}
          isDarkMode={isDarkMode}
        />

        <FilterPanel
          filters={filters}
          onFilterChange={updateFilter}
          onClearFilters={clearFilters}
          activeFilterCount={activeFilterCount}
        />

        <section className="map-section">
          <div className="section-header">
            <h2>Incident Map</h2>
            <div className="section-header-right">
              <button
                className={`heat-map-toggle ${showHeatMap ? 'active' : ''}`}
                onClick={() => setShowHeatMap(!showHeatMap)}
                title="Toggle Heat Map"
              >
                🔥 Heat Map
              </button>
              <span className="incident-count">
                {filteredIncidents.length} incident{filteredIncidents.length !== 1 ? 's' : ''} detected
              </span>
            </div>
          </div>
          <div className="map-wrapper">
            {loading ? (
              <div className="loading-overlay">
                <div className="spinner"></div>
                <p>Loading map data...</p>
              </div>
            ) : (
              <MapView incidents={filteredIncidents} showHeatMap={showHeatMap} />
            )}
          </div>
        </section>

        <section className="news-section">
          <NewsFeed articles={filteredArticles} loading={loading} />
        </section>

        <section className="video-section">
          <VideoFeed videos={filteredVideos} loading={videosLoading || isRefreshing} />
        </section>

        <section className="statistics-section">
          <StatisticsDashboard statistics={statistics} />
        </section>
      </main>

      <footer className="app-footer">
        <p>
          Data sourced from RSS feeds (Premium Times, Channels TV, Vanguard, Punch, Daily Trust, Guardian, This Day)
          {apiKey && ' and NewsAPI.org'} | Videos from YouTube | Last updated: {new Date().toLocaleString()}
        </p>
        <p className="footer-note">
          Statistics are derived from news article analysis and may not represent complete data.
        </p>
      </footer>
    </div>
  );
}

export default App;
