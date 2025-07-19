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
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-6">
      <div className="mb-4">
        <div className="border rounded-lg bg-card text-foreground p-3 h-40 overflow-y-auto mb-2 shadow-sm">
          {messages.length === 0 && (
            <div className="text-muted-foreground italic">Ask the LLM to show a stock or crypto chart (e.g. &quot;Show AAPL&quot;)</div>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={msg.role === "user" ? "text-primary" : "text-accent-foreground"}>
              <b>{msg.role === "user" ? "You" : "LLM"}:</b> {msg.content}
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            className="flex-1 border rounded-lg px-3 py-2 text-lg bg-background text-foreground focus:outline-none focus:ring focus:ring-primary/40"
            placeholder="Type a message (e.g. &quot;Show AAPL&quot;)"
            onKeyDown={e => e.key === "Enter" && handleSend()}
            disabled={loading}
            autoComplete="off"
          />
          <button
            onClick={handleSend}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg border border-primary hover:bg-primary/90 transition disabled:opacity-50"
            disabled={loading}
          >
            Send
          </button>
        </div>
      </div>
      <PriceHistorySWR symbol={symbol} />
    </div>
  );
} 