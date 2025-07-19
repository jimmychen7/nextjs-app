"use client";
import { useState, useEffect } from "react";
import PriceHistorySWR from "@/components/price-history-swr";
import useSWR from "swr";
import { createClient } from "@/lib/supabase/client";
import type { SupabaseClient } from "@supabase/supabase-js";

export default function LLMChatChart() {
  const [symbol, setSymbol] = useState("SPY");
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [trackLoading, setTrackLoading] = useState(false);
  const [isTracked, setIsTracked] = useState<boolean | null>(null);
  const [trackId, setTrackId] = useState<number | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [inputFocused, setInputFocused] = useState(false);

  // Fetch user id on mount
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id ?? null);
    });
  }, []);

  // SWR logic lifted to parent
  const { data, error, isLoading } = useSWR(
    symbol ? `/api/price-history?symbol=${encodeURIComponent(symbol)}` : null,
    async (url: string) => {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      return json;
    },
    { shouldRetryOnError: false }
  );

  // Helper to check if symbol is tracked for the user
  async function checkTracked(supabase: SupabaseClient, symbol: string, userId: string | null) {
    if (!userId) {
      setIsTracked(false);
      setTrackId(null);
      return;
    }
    setIsTracked(null); // loading state
    const { data: existing, error: selectError } = await supabase
      .from('tracked_symbols')
      .select('id')
      .eq('symbol', symbol)
      .eq('user_id', userId)
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

  // Check if symbol is tracked after chart loads or symbol changes
  useEffect(() => {
    if (!isLoading && !error && data && symbol && userId !== undefined) {
      const supabase = createClient();
      checkTracked(supabase, symbol, userId);
    } else {
      setIsTracked(false);
      setTrackId(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbol, isLoading, error, data, userId]);

  async function handleSend() {
    if (!input.trim()) return;
    setMessages([...messages, { role: "user", content: input }]);
    setLoading(true);
    // No need to manage chartLoaded state

    // Call your OpenRouter API route
    const res = await fetch("/api/openrouter-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Give a ticker for: " + input + ". Dont say anything else."}),
    });
    const data = await res.json();

    // If error, show as assistant message with error code only
    if (data.error) {
      setMessages((msgs) => [
        ...msgs,
        { role: "assistant", content: `Error: ${data.error.code}` },
      ]);
      setInput("");
      setLoading(false);
      setSymbol(input);
      return;
    }

    // Extract the LLM's reply
    const reply = data.choices?.[0]?.message?.content || "";
    setMessages((msgs) => [...msgs, { role: "assistant", content: reply }]);
    setInput("");
    setLoading(false);
    setSymbol(reply);
  }

  return (
    <div className="flex flex-col w-full items-center">
      {/* Chart on top */}
      <div className="w-full max-w-4xl flex-1 flex items-center justify-center bg-background p-4">
        <div className="w-full flex justify-center">
          <div className="w-full">
            <PriceHistorySWR symbol={symbol} />
          </div>
        </div>
      </div>
      {/* Prompt below */}
      <div className="w-full max-w-md p-4 flex flex-col items-center">
        <form
          className="w-full max-w-md"
          onSubmit={e => {
            e.preventDefault();
            handleSend();
          }}
        >
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            className="w-full border border-input rounded-xl px-4 py-4 text-xl font-bold bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow text-center"
            placeholder="Search"
            disabled={loading}
            autoComplete="off"
          />
        </form>
        {/* Toggle Track/Untrack button below form, always stable: show spinner placeholder when isTracked is null */}
        {!(inputFocused || input !== "") && !isLoading && !error && data && (
          isTracked === null ? (
            <button
              className="w-full max-w-md mt-4 px-4 py-4 text-xl font-bold rounded-xl shadow bg-muted text-muted-foreground cursor-not-allowed"
              style={{ minHeight: 56 }}
              disabled
            >
              <svg className="animate-spin h-6 w-6 mx-auto" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
            </button>
          ) : (
            <button
              className={`w-full max-w-md mt-4 px-4 py-4 text-xl font-bold rounded-xl shadow transition ${
                isTracked
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "bg-green-600 text-white hover:bg-green-700"
              }`}
              style={{ minHeight: 56 }}
              disabled={trackLoading}
              onClick={async () => {
                const supabase = createClient();
                setTrackLoading(true);
                if (!isTracked) {
                  // Track
                  const { error } = await supabase.from('tracked_symbols').insert([{ symbol, user_id: userId }]);
                  if (!error) {
                    await checkTracked(supabase, symbol, userId);
                  }
                } else {
                  // Untrack
                  if (!trackId) return;
                  const { error } = await supabase.from('tracked_symbols').delete().eq('id', trackId).eq('user_id', userId);
                  if (!error) {
                    await checkTracked(supabase, symbol, userId);
                  }
                }
                setTrackLoading(false);
              }}
            >
              {trackLoading ? (
                <svg className="animate-spin h-6 w-6 mx-auto" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
              ) : isTracked ? "Untrack" : "Track"}
            </button>
          )
        )}
      </div>
    </div>
  );
} 