"use client";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  TimeScale,
  Tooltip,
  Title,
  Legend,
} from "chart.js";
import {
  CandlestickController,
  CandlestickElement,
} from "chartjs-chart-financial";
import "chartjs-adapter-date-fns";
import { Chart } from "react-chartjs-2";
import type { ChartOptions } from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  TimeScale,
  Tooltip,
  Title,
  Legend,
  CandlestickController,
  CandlestickElement,
);

export function PriceHistoryChart({
  data,
  symbol,
}: {
  data: {
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
  }[];
  symbol: string;
}) {
  if (!data || data.length === 0) return <div>No data available.</div>;

  // Map real data to candlestick format and filter invalid points
  const candleData = data.map((d) => ({
    x: new Date(d.date),
    o: d.open,
    h: d.high,
    l: d.low,
    c: d.close,
  }));

  const chartData = {
    datasets: [
      {
        label: symbol,
        data: candleData,
        type: "candlestick" as const,
        barPercentage: 0.05,
        categoryPercentage: 0.05,
        // width: 5, // Uncomment if supported by your plugin version
      },
    ],
  };

  const options: ChartOptions<"candlestick"> = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: symbol },
      tooltip: {
        displayColors: false,
        usePointStyle: false,
        callbacks: {
          label: function (context) {
            const v = context.raw as {
              o: number;
              h: number;
              l: number;
              c: number;
            };
            if (v && typeof v === "object") {
              return [
                `Open: ${v.o?.toFixed(2)}`,
                `High: ${v.h?.toFixed(2)}`,
                `Low: ${v.l?.toFixed(2)}`,
                `Close: ${v.c?.toFixed(2)}`,
              ];
            }
            return "";
          },
        },
      },
    },
    scales: {
      x: { type: "time", time: { unit: "day" } },
      y: { beginAtZero: false },
    },
  };

  return <Chart type="candlestick" data={chartData} options={options} />;
}
