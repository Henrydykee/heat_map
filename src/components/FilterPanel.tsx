import { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import type { FilterState } from '../hooks/useFilters';
import { NIGERIA_STATES } from '../utils/constants';
import './FilterPanel.css';

interface FilterPanelProps {
  filters: FilterState;
  onFilterChange: (key: keyof FilterState, value: any) => void;
  onClearFilters: () => void;
  activeFilterCount: number;
}

const INCIDENT_TYPES = [
  { value: 'all', label: 'All Types' },
  { value: 'bandit_attack', label: 'Bandit Attack' },
  { value: 'fulani_herdsmen', label: 'Fulani Herdsmen' },
  { value: 'boko_haram', label: 'Boko Haram' },
  { value: 'iswap', label: 'ISWAP' },
  { value: 'communal_clash', label: 'Communal Clash' },
  { value: 'kidnapping', label: 'Kidnapping' },
  { value: 'terror_attack', label: 'Terror Attack' },
];

const FilterPanel = ({
  filters,
  onFilterChange,
  onClearFilters,
  activeFilterCount,
}: FilterPanelProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleDatePreset = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    onFilterChange('dateRange', { start, end });
  };

  return (
    <div className="filter-panel">
      <div className="filter-panel-header">
        <button
          className="filter-toggle"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
        >
          <span>🔍 Filters</span>
          {activeFilterCount > 0 && (
            <span className="filter-badge">{activeFilterCount}</span>
          )}
          <span className="filter-arrow">{isExpanded ? '▲' : '▼'}</span>
        </button>
        {activeFilterCount > 0 && (
          <button className="clear-filters-btn" onClick={onClearFilters}>
            Clear All
          </button>
        )}
      </div>

      {isExpanded && (
        <div className="filter-panel-content">
          <div className="filter-row">
            <div className="filter-group">
              <label>Search</label>
              <input
                type="text"
                placeholder="Search articles, videos, incidents..."
                value={filters.searchQuery}
                onChange={(e) => onFilterChange('searchQuery', e.target.value)}
                className="filter-input"
              />
            </div>
          </div>

          <div className="filter-row">
            <div className="filter-group">
              <label>State</label>
              <select
                value={filters.selectedState}
                onChange={(e) => onFilterChange('selectedState', e.target.value)}
                className="filter-select"
              >
                <option value="all">All States</option>
                {Object.keys(NIGERIA_STATES).map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Incident Type</label>
              <select
                value={filters.incidentType}
                onChange={(e) => onFilterChange('incidentType', e.target.value)}
                className="filter-select"
              >
                {INCIDENT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="filter-row">
            <div className="filter-group">
              <label>Date Range</label>
              <div className="date-presets">
                <button
                  type="button"
                  className="date-preset-btn"
                  onClick={() => handleDatePreset(0)}
                >
                  Today
                </button>
                <button
                  type="button"
                  className="date-preset-btn"
                  onClick={() => handleDatePreset(7)}
                >
                  Last 7 Days
                </button>
                <button
                  type="button"
                  className="date-preset-btn"
                  onClick={() => handleDatePreset(30)}
                >
                  Last 30 Days
                </button>
              </div>
              <div className="date-picker-group">
                <DatePicker
                  selected={filters.dateRange.start || undefined}
                  onChange={(date) =>
                    onFilterChange('dateRange', {
                      ...filters.dateRange,
                      start: date || null,
                    })
                  }
                  selectsStart
                  startDate={filters.dateRange.start || undefined}
                  endDate={filters.dateRange.end || undefined}
                  placeholderText="Start Date"
                  className="date-picker-input"
                />
                <span className="date-separator">to</span>
                <DatePicker
                  selected={filters.dateRange.end || undefined}
                  onChange={(date) =>
                    onFilterChange('dateRange', {
                      ...filters.dateRange,
                      end: date || null,
                    })
                  }
                  selectsEnd
                  startDate={filters.dateRange.start || undefined}
                  endDate={filters.dateRange.end || undefined}
                  minDate={filters.dateRange.start || undefined}
                  placeholderText="End Date"
                  className="date-picker-input"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;

