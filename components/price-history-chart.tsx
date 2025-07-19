"use client";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register the components you need
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

import { Line } from "react-chartjs-2";
import type { ChartData, ChartOptions } from "chart.js";

export function PriceHistoryChart({
  data,
  symbol,
}: {
  data: { date: string; close: number }[];
  symbol: string;
}) {
  if (!data || data.length === 0) return <div>No data available.</div>;

  // Find indices for special points
  const closes = data.map((d) => d.close);
  const maxIdx = closes.indexOf(Math.max(...closes));
  const minIdx = closes.indexOf(Math.min(...closes));
  const firstIdx = 0;
  const lastIdx = data.length - 1;

  const chartData: ChartData<"line"> = {
    labels: data.map((d) => d.date),
    datasets: [
      {
        label: '',
        data: closes,
        fill: false,
        borderColor: "#3b82f0",
        backgroundColor: "#3b82f6",
        tension: 0.5,
        // Show bigger dot for special points
        pointRadius: (ctx) => {
          const i = ctx.dataIndex;
          if (i === maxIdx || i === minIdx || i === firstIdx || i === lastIdx) return 4;
          return 0;
        },
        pointHoverRadius: (ctx) => {
          const i = ctx.dataIndex;
          if (i === maxIdx || i === minIdx || i === firstIdx || i === lastIdx) return 4;
          return 0;
        },
      },
    ],
  };

  const options: ChartOptions<"line"> = {
    plugins: {
      legend: { display: false },
      title: { display: true, text: symbol }, // Show symbol as chart title
    },
    scales: {
      x: {
        title: { display: false }, // Hide x axis title
        ticks: { display: false }, // Hide x axis labels
        grid: { display: false }, // Remove x grid lines
        border: { display: false }, // Remove x axis line
      },
      y: {
        title: { display: false }, // Hide y axis title
        ticks: { display: false }, // Hide y axis labels
        grid: { display: false }, // Remove y grid lines
        border: { display: false }, // Remove y axis line
      },
    },
  };

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <Line data={chartData} options={options} />
    </div>
  );
} 