"use client";
import LLMChatChart from "@/components/llm-chat-chart";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ChartPageContent() {
  const searchParams = useSearchParams();
  const symbolsParam = searchParams.get("symbols");

  // Parse symbols from query parameter - can be comma-separated or multiple symbols= parameters
  let symbols: string[] = [];
  if (symbolsParam) {
    // Handle comma-separated values
    symbols = symbolsParam
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  } else {
    // Handle multiple symbols= parameters
    const allSymbols = searchParams.getAll("symbols");
    symbols = allSymbols.map((s) => s.trim()).filter((s) => s.length > 0);
  }

  console.log("Chart page symbols:", symbols);
  return <LLMChatChart initialSymbols={symbols} />;
}

export default function ChartPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ChartPageContent />
    </Suspense>
  );
}
