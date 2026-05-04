import React, { useMemo } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend
);

export default function Charts({
  temperatureSeries = [],
  vibrationAxes = [],
  temperatureLabel = 'Temperature Trend',
  vibrationLabel = 'Vibration Analysis',
}) {
  const tempLabels = useMemo(() => {
    const n = temperatureSeries.length || 7;
    return Array.from({ length: n }, (_, i) => `T${i + 1}`);
  }, [temperatureSeries]);

  const tempValues = temperatureSeries.length
    ? temperatureSeries
    : [3.2, 3.5, 3.4, 3.7, 3.6, 3.8, 3.6];

  const vibValues = vibrationAxes.length === 3 ? vibrationAxes : [3.2, 4.2, 2.8];

  const lineData = {
    labels: tempLabels,
    datasets: [
      {
        label: 'Temperature (°C)',
        data: tempValues,
        borderColor: '#5ab3ff',
        backgroundColor: 'rgba(90, 179, 255, 0.18)',
        fill: true,
        tension: 0.35,
        pointRadius: 3,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#dbe8ff' },
      },
      tooltip: {
        backgroundColor: '#111827',
        borderColor: '#2f4156',
        borderWidth: 1,
        titleColor: '#eaf2ff',
        bodyColor: '#dbe8ff',
      },
    },
    scales: {
      x: {
        ticks: { color: '#bcd0ff' },
        grid: { color: 'rgba(255,255,255,0.05)' },
      },
      y: {
        ticks: { color: '#bcd0ff' },
        grid: { color: 'rgba(255,255,255,0.08)' },
      },
    },
  };

  const barData = {
    labels: ['X-axis', 'Y-axis', 'Z-axis'],
    datasets: [
      {
        label: 'Vibration (mm/s)',
        data: vibValues,
        backgroundColor: ['#60a5fa', '#f59e0b', '#34d399'],
        borderRadius: 8,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#dbe8ff' },
      },
      tooltip: {
        backgroundColor: '#111827',
        borderColor: '#2f4156',
        borderWidth: 1,
        titleColor: '#eaf2ff',
        bodyColor: '#dbe8ff',
      },
    },
    scales: {
      x: {
        ticks: { color: '#bcd0ff' },
        grid: { display: false },
      },
      y: {
        beginAtZero: true,
        ticks: { color: '#bcd0ff' },
        grid: { color: 'rgba(255,255,255,0.08)' },
      },
    },
  };

  return (
    <div className="charts">
      <div className="card">
        <div className="card-header">
          <div className="card-title">{temperatureLabel}</div>
        </div>
        <div className="chart-container">
          <Line data={lineData} options={lineOptions} />
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">{vibrationLabel}</div>
        </div>
        <div className="chart-container">
          <Bar data={barData} options={barOptions} />
        </div>
      </div>
    </div>
  );
}