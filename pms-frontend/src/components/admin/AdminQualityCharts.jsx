import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
);

export default function AdminQualityCharts({ co2History = [], co2Series = [] }) {
  const series = co2Series.length
    ? co2Series
    : (
        co2History.length
          ? co2History.map((v, i) => ({ value: v, timeLabel: `#${i + 1}` }))
          : [5.6, 5.4, 5.3, 5.5, 5.2, 5.7, 5.6, 5.4].map((v, i) => ({
              value: v,
              timeLabel: `#${i + 1}`,
            }))
      );

  const data = {
    labels: series.map((p) => p.timeLabel),
    datasets: [
      {
        label: 'CO₂ (%)',
        data: series.map((p) => p.value),
        borderColor: '#7ef3c3',
        borderWidth: 3,
        backgroundColor: 'rgba(126, 243, 195, 0.10)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: '#7ef3c3',
        pointBorderColor: '#7ef3c3',
        pointBorderWidth: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 8,
        bottom: 18,
        left: 8,
        right: 8,
      },
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#dbe8ff',
          usePointStyle: true,
          pointStyle: 'circle',
          boxWidth: 8,
          padding: 12,
        },
      },
      tooltip: {
        backgroundColor: '#111827',
        borderColor: '#2f4156',
        borderWidth: 1,
        titleColor: '#eaf2ff',
        bodyColor: '#dbe8ff',
        callbacks: {
          label: function (context) {
            return `CO₂: ${context.parsed.y}%`;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#bcd0ff',
          maxRotation: 45,
          minRotation: 0,
          autoSkip: true,
          maxTicksLimit: 8,
          padding: 6,
        },
        grid: {
          color: 'rgba(255,255,255,0.05)',
          drawBorder: false,
        },
        title: {
          display: true,
          text: 'Time / Reading #',
          color: '#9fb3c8',
          font: {
            size: 11,
            weight: 'normal',
          },
          padding: { top: 10, bottom: 0 },
        },
      },
      y: {
        ticks: {
          color: '#bcd0ff',
          stepSize: 0.5,
          callback: function (value) {
            return value + '%';
          },
        },
        grid: {
          color: 'rgba(255,255,255,0.08)',
          drawBorder: false,
        },
        title: {
          display: true,
          text: 'CO₂ Content (%)',
          color: '#9fb3c8',
          font: {
            size: 11,
            weight: 'normal',
          },
          padding: { bottom: 6 },
        },
        min: 4,
        max: 7,
      },
    },
    elements: {
      line: {
        borderJoinStyle: 'round',
        borderCapStyle: 'round',
      },
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
  };

  return (
    <div className="chart-card">
      <Line data={data} options={options} />
    </div>
  );
}