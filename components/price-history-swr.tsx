"use client";
import useSWR from "swr";
import { useState } from "react";
import { PriceHistoryChart } from "./price-history-chart";

async function fetcher(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch");
  const json = await res.json();
  if (json.error) throw new Error(json.error);
  return json;
}

export default function PriceHistorySWR({
  symbol,
  toggleComponent,
}: {
  symbol: string;
  toggleComponent?: React.ReactNode;
}) {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const { data, error, isLoading } = useSWR(
    symbol ? `/api/price-history?symbols=${encodeURIComponent(symbol)}` : null,
    fetcher,
    { shouldRetryOnError: false },
  );

  if (isLoading)
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  if (error)
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-red-500">Error: {error.message}</div>
      </div>
    );
  if (!data) return null;

  // Show both ticker and long name in the chart title
  const chartTitle =
    data.symbol && data.name
      ? `${data.symbol} – ${data.name}`
      : data.name || data.symbol;

  return (
    <div className="w-full">
      {/* Symbol info header */}
      <div className="mb-4 p-4 bg-card rounded-lg border">
        <div className="flex items-start justify-between mb-2">
          <h2 className="text-xl font-bold text-foreground">{chartTitle}</h2>
          {toggleComponent && (
            <div className="flex-shrink-0 ml-4">{toggleComponent}</div>
          )}
        </div>
        {data.sector && (
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
            {data.sector && <span>📊 {data.sector}</span>}
            {data.industry && <span>🏭 {data.industry}</span>}
          </div>
        )}
        {data.description && (
          <div className="relative">
            <p
              className={`text-sm text-muted-foreground leading-relaxed transition-all duration-200 ${
                isDescriptionExpanded ? "" : "line-clamp-2"
              }`}
            >
              {data.description}
            </p>
            {data.description.length > 150 && (
              <button
                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                className="mt-2 text-xs text-primary hover:text-primary/80 font-medium transition-colors"
              >
                {isDescriptionExpanded ? "Show less" : "Read more"}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Chart */}
      <PriceHistoryChart data={data.data} symbol={chartTitle} />
    </div>
  );
}
