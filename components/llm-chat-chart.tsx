"use client";
import { useState } from "react";
import PriceHistorySWR from "@/components/price-history-swr";

export default function LLMChatChart() {
  const [symbol, setSymbol] = useState("SPY");
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSend() {
    if (!input.trim()) return;
    setMessages([...messages, { role: "user", content: input }]);
    setLoading(true);

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
      <div className="w-full flex-1 flex items-center justify-center bg-background p-4">
        <div className="w-full h-[400px]">
          <PriceHistorySWR symbol={symbol} />
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