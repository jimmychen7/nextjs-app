import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENROUTER_API_KEY;

  try {
    const { query } = await req.json();

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
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
          model: "deepseek/deepseek-chat-v3-0324",
          messages: [
            {
              role: 'system',
              content: `You are an expert in financial markets. Your task is to identify and extract stock ticker symbols from the user's query. Return a comma-separated list of symbols. If no symbols are found, return an empty string. Only return the comma-separated symbols, nothing else. For example, if the user asks for "Apple and Google", you should return AAPL,GOOG`,
            },
            { role: 'user', content: query },
          ],
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', errorText);
      return NextResponse.json({ error: `Failed to fetch symbols: ${response.statusText}`, details: errorText }, { status: response.status });
    }

    const completion = await response.json();
    const symbols = completion.choices[0].message.content?.trim() ?? '';

    return NextResponse.json({ symbols });
  } catch (error: unknown) {
    console.error('Error fetching symbols from OpenRouter:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: `Failed to fetch symbols: ${error.message}` }, { status: 500 });
    } else {
      return NextResponse.json({ error: 'Failed to fetch symbols: An unknown error occurred' }, { status: 500 });
    }
  }
}