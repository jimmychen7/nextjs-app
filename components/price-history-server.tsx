import { PriceHistoryChart } from "./price-history-chart";
import yahooFinance from "yahoo-finance2";

export default async function PriceHistoryServer({
  symbol,
}: {
  symbol: string;
}) {
  try {
    const today = new Date();
    const from = new Date(today);
    from.setDate(today.getDate() - 30); // fetch past year

    const result = await yahooFinance.chart(symbol, {
      period1: from,
      period2: today,
      interval: "1d",
    });

    const data = result.quotes
      .filter((d) => d.close !== null)
      .map((d) => ({
        date: d.date.toISOString(),
        open: d.open as number,
        high: d.high as number,
        low: d.low as number,
        close: d.close as number,
      }));

    return <PriceHistoryChart data={data} symbol={symbol} />;
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to fetch data";
    return <div className="text-red-500">Error: {message}</div>;
  }
}
