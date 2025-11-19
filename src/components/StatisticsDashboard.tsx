import { useMemo } from 'react';
import type { Statistics } from '../types';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface StatisticsDashboardProps {
  statistics: Statistics;
}

const StatisticsDashboard = ({ statistics }: StatisticsDashboardProps) => {
  // Memoize chart data to prevent unnecessary re-renders and ensure updates
  const { deathCountData, casualtyData, buildingData, attackTypeData } = useMemo(() => {
    const deathCount = {
      labels: ['Daily', 'Weekly', 'Monthly'],
      datasets: [
        {
          label: 'Total Deaths',
          data: [
            statistics.totalDeaths.daily,
            statistics.totalDeaths.weekly,
            statistics.totalDeaths.monthly,
          ],
          backgroundColor: ['#ef4444', '#f97316', '#dc2626'],
          borderColor: ['#dc2626', '#ea580c', '#b91c1c'],
          borderWidth: 1,
        },
      ],
    };

    const casualty = {
      labels: ['Christians', 'Muslims'],
      datasets: [
        {
          data: [
            statistics.casualties.christians,
            statistics.casualties.muslims,
          ],
          backgroundColor: ['#dc2626', '#991b1b'],
          borderColor: ['#b91c1c', '#7f1d1d'],
          borderWidth: 2,
        },
      ],
    };

    const building = {
      labels: ['Churches', 'Mosques'],
      datasets: [
        {
          data: [
            statistics.buildingsDestroyed.churches,
            statistics.buildingsDestroyed.mosques,
          ],
          backgroundColor: ['#ef4444', '#dc2626'],
          borderColor: ['#dc2626', '#b91c1c'],
          borderWidth: 2,
        },
      ],
    };

    const attackType = {
      labels: ['Bandits', 'Fulani Herdsmen', 'Boko Haram', 'ISWAP', 'Other'],
      datasets: [
        {
          label: 'Number of Attacks',
          data: [
            statistics.attacks.bandits,
            statistics.attacks.fulaniHerdsmen,
            statistics.attacks.bokoHaram,
            statistics.attacks.iswap,
            statistics.attacks.other,
          ],
          backgroundColor: [
            '#ef4444',
            '#f97316',
            '#dc2626',
            '#991b1b',
            '#6b7280',
          ],
          borderColor: [
            '#dc2626',
            '#ea580c',
            '#b91c1c',
            '#7f1d1d',
            '#4b5563',
          ],
          borderWidth: 1,
        },
      ],
    };

    return {
      deathCountData: deathCount,
      casualtyData: casualty,
      buildingData: building,
      attackTypeData: attackType,
    };
  }, [statistics]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 750,
      easing: 'easeInOutQuart' as const,
    },
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
      tooltip: {
        enabled: true,
      },
    },
  }), []);

  return (
    <div className="statistics-dashboard">
      <h2>Security Statistics</h2>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Deaths</h3>
          <div className="stat-numbers">
            <div className="stat-item">
              <span className="stat-label">Daily</span>
              <span className="stat-value">{statistics.totalDeaths.daily}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Weekly</span>
              <span className="stat-value">{statistics.totalDeaths.weekly}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Monthly</span>
              <span className="stat-value">{statistics.totalDeaths.monthly}</span>
            </div>
          </div>
          <div className="chart-container">
            <Bar data={deathCountData} options={chartOptions} />
          </div>
        </div>

        <div className="stat-card">
          <h3>Casualties by Religion</h3>
          <div className="stat-numbers">
            <div className="stat-item">
              <span className="stat-label">Christians</span>
              <span className="stat-value">{statistics.casualties.christians}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Muslims</span>
              <span className="stat-value">{statistics.casualties.muslims}</span>
            </div>
          </div>
          <div className="chart-container">
            <Doughnut data={casualtyData} options={chartOptions} />
          </div>
        </div>

        <div className="stat-card">
          <h3>Buildings Destroyed</h3>
          <div className="stat-numbers">
            <div className="stat-item">
              <span className="stat-label">Churches</span>
              <span className="stat-value">{statistics.buildingsDestroyed.churches}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Mosques</span>
              <span className="stat-value">{statistics.buildingsDestroyed.mosques}</span>
            </div>
          </div>
          <div className="chart-container">
            <Doughnut data={buildingData} options={chartOptions} />
          </div>
        </div>

        <div className="stat-card">
          <h3>Attacks by Type</h3>
          <div className="chart-container">
            <Bar data={attackTypeData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsDashboard;

