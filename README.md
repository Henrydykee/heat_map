# Nigeria Security Tracker

A web application that visualizes insecurity incidents across Nigeria using an interactive map interface and real-time news feed. The app tracks attacks by bandits, Fulani herdsmen, and other security incidents, providing statistics on casualties and destroyed buildings.

## Features

- **Interactive Map**: Visual representation of security incidents across Nigeria with clickable markers
- **Real-time News Feed**: Latest insecurity-related news articles from NewsAPI
- **Statistics Dashboard**: Comprehensive metrics including:
  - Total death counts (daily, weekly, monthly)
  - Casualty breakdown by religion (Christians/Muslims)
  - Destroyed buildings (churches/mosques)
  - Attack classifications by type
- **Auto-refresh**: Daily automatic data updates with manual refresh option

## Technology Stack

- **React** + **TypeScript** - Frontend framework
- **Vite** - Build tool and dev server
- **Leaflet** + **React-Leaflet** - Interactive maps
- **Chart.js** - Data visualization
- **Axios** - HTTP client
- **date-fns** - Date utilities

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- NewsAPI account and API key ([Get one here](https://newsapi.org/))

### Installation

1. Clone or navigate to the project directory:
```bash
cd map
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```bash
VITE_NEWS_API_KEY=your_newsapi_key_here
```

Replace `your_newsapi_key_here` with your actual NewsAPI key.

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to the URL shown in the terminal (typically `http://localhost:5173`)

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
src/
├── components/          # React components
│   ├── MapView.tsx      # Main map component
│   ├── NewsFeed.tsx     # News article list
│   ├── StatisticsDashboard.tsx  # Statistics and charts
│   └── IncidentPopup.tsx # Map marker popup
├── hooks/               # Custom React hooks
│   ├── useNewsData.ts   # News data fetching
│   └── useDailyRefresh.ts  # Auto-refresh logic
├── services/            # API and data processing
│   ├── newsApi.ts       # NewsAPI integration
│   └── dataProcessor.ts # Article parsing and statistics
├── types/               # TypeScript type definitions
│   └── index.ts
└── utils/               # Utility functions and constants
    └── constants.ts     # Nigeria states, keywords, etc.
```

## How It Works

1. **Data Fetching**: The app fetches news articles from NewsAPI using a query focused on Nigeria security incidents
2. **Data Processing**: Articles are parsed to extract:
   - Location (Nigerian states)
   - Incident type (bandits, Fulani herdsmen, etc.)
   - Casualty counts
   - Building destruction
3. **Visualization**: Processed data is displayed on an interactive map and in statistical charts
4. **Auto-refresh**: Data is automatically refreshed every 24 hours, with a manual refresh option available

## API Limitations

- NewsAPI free tier allows 100 requests per day
- Data is limited to articles available through NewsAPI
- Statistics are derived from article text analysis and may not be 100% accurate

## Notes

- The app runs entirely client-side (no backend required)
- Statistics are calculated from news article content using keyword matching
- Map markers are positioned based on state-level coordinates
- All external links open in new tabs

## License

This project is for educational and informational purposes.
