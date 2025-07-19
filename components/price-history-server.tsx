import { PriceHistoryChart } from "./price-history-chart";
import yahooFinance from "yahoo-finance2";

export default async function PriceHistoryServer({ symbol }: { symbol: string }) {
  try {
    const today = new Date();
    const from = new Date(today);
    from.setDate(today.getDate() - 365); // fetch past year

    const result = await yahooFinance.historical(symbol, {
      period1: from,
      period2: today,
      interval: "1d",
    });

    const data = result
      .filter((d) => d.close !== null)
      .map((d) => ({
        date: d.date.toISOString().slice(0, 10),
        close: d.close as number,
      }));

    return <PriceHistoryChart data={data} symbol={symbol} />;
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to fetch data";
    return <div className="text-red-500">Error: {message}</div>;
  }
} 