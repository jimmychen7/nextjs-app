import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { message } = await req.json();
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "Missing OpenRouter API key" }),
      { status: 500 },
    );
  }

  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-chat-v3-0324:free",
        messages: [
          {
            role: "user",
            content:
              "Get ticker for:" + message + ". Do not say anything else.",
          },
        ],
      }),
    },
  );

  const data = await response.json();
  return new Response(JSON.stringify(data), { status: 200 });
}
