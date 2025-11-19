import { exportIncidentsToCSV, exportArticlesToCSV, printPage } from '../utils/exportUtils';
import type { Incident, NewsArticle } from '../types';
import './ActionBar.css';

interface ActionBarProps {
  incidents: Incident[];
  articles: NewsArticle[];
  onToggleDarkMode: () => void;
  isDarkMode: boolean;
}

const ActionBar = ({
  incidents,
  articles,
  onToggleDarkMode,
  isDarkMode,
}: ActionBarProps) => {
  return (
    <div className="action-bar">
      <div className="action-bar-left">
        <button
          className="action-btn"
          onClick={onToggleDarkMode}
          title="Toggle Dark Mode"
        >
          {isDarkMode ? '☀️' : '🌙'}
        </button>
        <button
          className="action-btn"
          onClick={() => exportIncidentsToCSV(incidents)}
          title="Export Incidents to CSV"
          disabled={incidents.length === 0}
        >
          📥 Export Incidents
        </button>
        <button
          className="action-btn"
          onClick={() => exportArticlesToCSV(articles)}
          title="Export Articles to CSV"
          disabled={articles.length === 0}
        >
          📥 Export Articles
        </button>
        <button
          className="action-btn"
          onClick={printPage}
          title="Print Page"
        >
          🖨️ Print
        </button>
      </div>
    </div>
  );
};

export default ActionBar;

