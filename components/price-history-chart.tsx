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

interface PricePoint {
  date: string;
  close: number;
}

export function PriceHistoryChart({
  data,
  symbol,
}: {
  data: PricePoint[];
  symbol: string;
}) {
  if (!data || data.length === 0) return <div>No data available.</div>;

  const chartData: ChartData<"line"> = {
    labels: data.map((d) => d.date),
    datasets: [
      {
        label: `${symbol} Close Price`,
        data: data.map((d) => d.close),
        fill: false,
        borderColor: "#3b82f6",
        backgroundColor: "#3b82f6",
        tension: 0.5,
        pointRadius: 0,
        pointHoverRadius: 0,
      },
    ],
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false, // allow chart to fill container
    layout: { padding: 0 }, // Remove all padding
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