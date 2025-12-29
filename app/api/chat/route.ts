import { NextRequest } from "next/server";

const SAFEPIPE_API_URL = "https://safepipe.eu/api/v1/chat/completions";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatRequestBody {
  messages: ChatMessage[];
  model?: string;
  safeMode?: boolean;
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.SAFEPIPE_API_KEY;

  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "SAFEPIPE_API_KEY is not configured" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const body: ChatRequestBody = await request.json();

    const response = await fetch(SAFEPIPE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: body.model || "gpt-4o-mini",
        messages: body.messages,
        stream: true,
        safe_mode: body.safeMode ?? true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(
        JSON.stringify({ error: `SafePipe API error: ${response.status}`, details: errorText }),
        { status: response.status, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

