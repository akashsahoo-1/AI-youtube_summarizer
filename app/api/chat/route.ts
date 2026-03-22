import { NextResponse } from "next/server";
import { YoutubeTranscript } from "youtube-transcript";

function getVideoId(url: string) {
  const match = url.match(/(?:v=|youtu\.be\/|embed\/)([^&\n?#]+)/);
  return match ? match[1] : null;
}

export async function POST(req: Request) {
  try {
    const { url, history } = await req.json();

    if (!url || !history) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const videoId = getVideoId(url);
    if (!videoId) {
      return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 });
    }

    let context = "";
    try {
      const transcript = await YoutubeTranscript.fetchTranscript(videoId);
      context = transcript.map((t) => t.text).join(" ");
    } catch {
      try {
        const embedRes = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`);
        const embedData = await embedRes.json();
        context = embedData.title ? `Video Title: ${embedData.title}` : `Topic inferred from URL: ${url}`;
      } catch {
        context = `Topic inferred from URL: ${url}`;
      }
    }

    const systemPrompt = `You are a helpful AI answering questions about a YouTube video.
Always be concise, accurate, and direct. 
Use the following context to answer the user's questions:

${context}
`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...history.map((h: any) => ({ role: h.role, content: h.content }))
    ];

    const aiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-chat",
        messages,
      }),
    });

    const data = await aiResponse.json();
    const answer = data?.choices?.[0]?.message?.content;

    if (!answer) {
      throw new Error("AI returned empty response");
    }

    return NextResponse.json({ answer });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to answer question" }, { status: 500 });
  }
}
