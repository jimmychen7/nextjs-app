"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function Hero() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    
    setLoading(true);
    const symbol = input.trim();
    setInput("");
    
    // Navigate to /chart with the symbol query parameter
    router.push(`/chart?symbols=${encodeURIComponent(symbol)}`);
    setLoading(false);
  }

  return (
    <div className="flex flex-col gap-16 items-center">
      <p className="text-3xl lg:text-4xl !leading-tight mx-auto max-w-xl text-center">
        Price Tracker
      </p>
      
      {/* Search form */}
      <div className="w-full max-w-md">
        <form onSubmit={handleSubmit}>
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
