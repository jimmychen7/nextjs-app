"use client";
import useSWR from "swr";
import { PriceHistoryChart } from "./price-history-chart";

async function fetcher(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch");
  const json = await res.json();
  if (json.error) throw new Error(json.error);
  return json;
}

export default function PriceHistorySWR({ symbol }: { symbol: string }) {
  const { data, error, isLoading } = useSWR(
    symbol ? `/api/price-history?symbol=${encodeURIComponent(symbol)}` : null,
    fetcher
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">Error: {error.message}</div>;
  if (!data) return null;

  // Show both ticker and long name in the chart title
  const chartTitle = data.symbol && data.name ? `${data.symbol} – ${data.name}` : data.name || data.symbol;

  return <PriceHistoryChart data={data.data} symbol={chartTitle} />;
} 