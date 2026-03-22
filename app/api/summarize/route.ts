import { NextResponse } from "next/server";
import { YoutubeTranscript } from "youtube-transcript";

function getVideoId(url: string) {
  const match = url.match(/(?:v=|youtu\.be\/|embed\/)([^&\n?#]+)/);
  return match ? match[1] : null;
}

function buildPrompt(mode: string, context: string, url: string, transcriptFetched: boolean, length: string, language: string) {
  const baseInstruction = transcriptFetched 
    ? `Analyze the transcript and generate accurate summary. Make the response length: ${length}. Generate response in ${language}.`
    : `Transcript unavailable. Generate a best-effort summary based on likely topic. Make the response length: ${length}. Generate response in ${language}.`;
  switch (mode) {
    case "short":
      return `
You are an AI that summarizes YouTube videos.
${baseInstruction}

Write a concise summary (~120 words).

Video URL:
${url}

Context:
${context}
`;

    case "detailed":
      return `
You are an AI that explains YouTube videos.
${baseInstruction}

Provide a detailed explanation with headings.

Video URL:
${url}

Context:
${context}
`;

    case "bullets":
      return `
Convert this video into bullet point notes.
${baseInstruction}

Video URL:
${url}

Context:
${context}
`;

    case "study":
      return `
Create study notes from this video.
${baseInstruction}

Include:
• Key concepts
• Important ideas
• Takeaways

Video URL:
${url}

Context:
${context}
`;

    case "timeline":
      return `
Create a timeline style breakdown of the video.
${baseInstruction}

Format example:
00:00 - Introduction
01:20 - Main concept
03:40 - Example

Video URL:
${url}

Context:
${context}
`;

    default:
      return `
Summarize this YouTube video.
${baseInstruction}

Video URL:
${url}

Context:
${context}
`;
  }
}

export async function POST(req: Request) {
  try {
    const { url, mode = "short", length = "Medium", language = "English", allowFallback = false } = await req.json();

    if (!url) {
      return NextResponse.json(
        { error: "YouTube URL required" },
        { status: 400 }
      );
    }

    const videoId = getVideoId(url);

    if (!videoId) {
      return NextResponse.json(
        { error: "Invalid YouTube URL" },
        { status: 400 }
      );
    }

    let context = "";
    let transcriptFetched = false;

    try {
      const transcript = await YoutubeTranscript.fetchTranscript(videoId);

      context = transcript.map((t) => t.text).join(" ");
      transcriptFetched = true;

    } catch (error) {
      console.warn("Transcript unavailable");
    }

    if (!transcriptFetched) {
      if (!allowFallback) {
        return NextResponse.json(
          { error: "Transcript not available for this video. Please try another video with captions enabled." },
          { status: 400 }
        );
      } else {
        try {
          const embedRes = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`);
          const embedData = await embedRes.json();
          context = embedData.title ? `Video Title: ${embedData.title}` : `Topic inferred from URL: ${url}`;
        } catch {
          context = `Topic inferred from URL: ${url}`;
        }
      }
    }

    const prompt = buildPrompt(mode, context, url, transcriptFetched, length, language);

    const aiResponse = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "deepseek/deepseek-chat",
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        }),
      }
    );

    const data = await aiResponse.json();

    const summary = data?.choices?.[0]?.message?.content;

    if (!summary) {
      throw new Error("AI returned empty response");
    }

    return NextResponse.json({ summary, isEstimated: !transcriptFetched });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to summarize video" },
      { status: 500 }
    );
  }
}