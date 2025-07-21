"use client";
import { useState, useEffect } from "react";
import PriceHistorySWR from "@/components/price-history-swr";
import { createClient } from "@/lib/supabase/client";
import type { SupabaseClient } from "@supabase/supabase-js";

interface LLMChatChartProps {
  initialSymbols?: string[];
}

export default function LLMChatChart({
  initialSymbols = [],
}: LLMChatChartProps) {
  // Ensure we have a valid initial symbol
  const defaultSymbols = initialSymbols.length > 0 ? initialSymbols : ["SPY"];
  const [symbols, setSymbols] = useState<string[]>(defaultSymbols);
  const [currentSymbolIndex, setCurrentSymbolIndex] = useState(0);
  const [symbol, setSymbol] = useState(defaultSymbols[0]);
  const [messages, setMessages] = useState<{ role: string; content: string }[]>(
    [],
  );
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [trackLoading, setTrackLoading] = useState(false);
  const [isTracked, setIsTracked] = useState<boolean | null>(null);
  const [trackId, setTrackId] = useState<number | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Update current symbol when index changes
  useEffect(() => {
    if (symbols.length > 0 && currentSymbolIndex < symbols.length) {
      setSymbol(symbols[currentSymbolIndex]);
    }
  }, [currentSymbolIndex, symbols]);

  // Handle initial symbols prop changes
  useEffect(() => {
    console.log("LLMChatChart initialSymbols:", initialSymbols);
    if (initialSymbols.length > 0) {
      setSymbols(initialSymbols);
      setCurrentSymbolIndex(0);
      setSymbol(initialSymbols[0]);
    }
  }, [initialSymbols]);

  // Fetch user id on mount
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id ?? null);
    });
  }, []);

  // Helper to check if symbol is tracked for the user
  async function checkTracked(
    supabase: SupabaseClient,
    symbol: string,
    userId: string | null,
  ) {
    if (!userId) {
      setIsTracked(false);
      setTrackId(null);
      return;
    }
    setIsTracked(null); // loading state
    const { data: existing, error: selectError } = await supabase
      .from("tracked_symbols")
      .select("id, symbol")
      .eq("user_id", userId)
      .eq("symbol", symbol.toUpperCase()) // Check for exact symbol match (case-insensitive by storing uppercase)
      .maybeSingle();

    if (selectError) {
      setIsTracked(false);
      setTrackId(null);
    } else if (existing) {
      setIsTracked(true);
      setTrackId(existing.id);
    } else {
      setIsTracked(false);
      setTrackId(null);
    }
  }

  // Check if symbol is tracked when symbol changes
  useEffect(() => {
    if (symbol && userId !== undefined) {
      const supabase = createClient();
      checkTracked(supabase, symbol, userId);
    } else {
      setIsTracked(false);
      setTrackId(null);
    }
  }, [symbol, userId]);

  async function handleSend() {
    if (!input.trim()) return;
    setMessages([...messages, { role: "user", content: input }]);
    setLoading(true);

    try {
      const response = await fetch("/api/get-symbols", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: input }),
      });

      if (response.ok) {
        const { symbols } = await response.json();
        if (symbols) {
          const symbolList = symbols.split(",").map((s: string) => s.trim().toUpperCase()).filter((s: string) => s.length > 0);
          if (symbolList.length > 0) {
            setSymbols(symbolList);
            setCurrentSymbolIndex(0);
            setSymbol(symbolList[0]);
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch symbols", error);
    } finally {
      setLoading(false);
      setInput("");
    }
  }

  return (
    <div className="flex flex-col w-full items-center">
      {/* Symbol selector and save button */}
      <div className="w-full max-w-4xl flex justify-center mb-4">
        <div className="flex flex-col items-center gap-2">
          {/* Symbol selector for multiple symbols */}
          {symbols.length > 1 && (
            <div className="flex gap-2 flex-wrap justify-center">
              {symbols.map((sym, index) => (
                <button
                  key={sym}
                  onClick={() => setCurrentSymbolIndex(index)}
                  className={`px-4 py-2 rounded-lg font-semibold transition ${
                    index === currentSymbolIndex
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {sym}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chart area */}
      <div className="w-full max-w-4xl flex-1 flex items-center justify-center bg-background p-4">
        <div className="w-full flex justify-center">
          <div className="w-full">
            <PriceHistorySWR
              symbol={symbol}
              toggleComponent={
                <div className="relative group">
                  <button
                    className={`relative inline-flex h-6 w-12 items-center rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 shadow-sm ${
                      trackLoading
                        ? "opacity-75 cursor-not-allowed"
                        : "cursor-pointer"
                    } ${
                      isTracked
                        ? "bg-green-600"
                        : "bg-gray-300 dark:bg-gray-600"
                    }`}
                    disabled={
                      trackLoading || userId === undefined || isTracked === null
                    }
                    onClick={async () => {
                      const supabase = createClient();
                      setTrackLoading(true);

                      if (!isTracked) {
                        // Track - store symbol in uppercase for consistency
                        const { error } = await supabase
                          .from("tracked_symbols")
                          .insert([
                            {
                              symbol: symbol.toUpperCase(),
                              user_id: userId,
                            },
                          ]);
                        if (!error) {
                          await checkTracked(supabase, symbol, userId);

                          // Send tracking notification email
                          try {
                            await fetch("/api/send-tracking-email", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ symbol }),
                            });
                          } catch (emailError) {
                            console.error(
                              "Failed to send tracking email:",
                              emailError,
                            );
                            // Don't fail the tracking operation if email fails
                          }
                        }
                      } else {
                        // Untrack
                        if (!trackId) return;
                        const { error } = await supabase
                          .from("tracked_symbols")
                          .delete()
                          .eq("id", trackId)
                          .eq("user_id", userId);
                        if (!error) {
                          await checkTracked(supabase, symbol, userId);
                        }
                      }
                      setTrackLoading(false);
                    }}
                  >
                    {/* Toggle handle */}
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-300 ease-in-out ${
                        isTracked ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>

                  {/* Custom tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-20">
                    {isTracked ? "Stop tracking" : "Track"}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-3 border-r-3 border-t-3 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              }
            />
          </div>
        </div>
      </div>

      {/* Search input below */}
      <div className="w-full max-w-md p-4 flex flex-col items-center">
        <form
          className="w-full max-w-md"
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full border border-input rounded-xl px-4 py-4 text-xl font-bold bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow text-center"
            placeholder="Search"
            disabled={loading}
            autoComplete="off"
          />
        </form>
      </div>
    </div>
  );
}
