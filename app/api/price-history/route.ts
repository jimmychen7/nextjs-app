import { NextRequest } from "next/server";
import yahooFinance from "yahoo-finance2";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get("symbols");
  if (!symbol) {
    return new Response(JSON.stringify({ error: "Missing symbols" }), {
      status: 400,
    });
  }
  try {
    const today = new Date();
    const from = new Date(today);
    from.setDate(today.getDate() - 365);
    const result = await yahooFinance.historical(symbol, {
      period1: from,
      period2: today,
      interval: "1d",
    });
    const data = result
      .filter((d) => d.close !== null)
      .map((d) => ({
        date: d.date.toISOString(),
        open: d.open as number,
        high: d.high as number,
        low: d.low as number,
        close: d.close as number,
      }));
    // Get detailed information about the symbol
    let name = symbol;
    let ticker = symbol;
    let description = "";
    let sector = "";
    let industry = "";

    try {
      const quote = await yahooFinance.quoteSummary(symbol, {
        modules: ["price", "assetProfile", "summaryDetail"],
      });

      name = quote.price?.longName || quote.price?.shortName || symbol;
      ticker = quote.price?.symbol || symbol;
      description = quote.assetProfile?.longBusinessSummary || "";
      sector = quote.assetProfile?.sector || "";
      industry = quote.assetProfile?.industry || "";
    } catch {}

    return new Response(
      JSON.stringify({
        data,
        name,
        symbol: ticker,
        description,
        sector,
        industry,
      }),
      { status: 200 },
    );
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to fetch data";
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
}
