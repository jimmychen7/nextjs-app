"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function Hero() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);

    try {
      const response = await fetch('/api/get-symbols', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: input }),
      });

      if (response.ok) {
        const { symbols, error } = await response.json();
        if (error) {
          console.error(error);
          // You can also set the error message in the state and display it to the user
        } else if (symbols) {
          router.push(`/chart?symbols=${encodeURIComponent(symbols)}`);
        }
      }
    } catch (error) {
      console.error('Failed to fetch symbols', error);
    } finally {
      setLoading(false);
      setInput('');
    }
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
