import { NextResponse } from "next/server";
import { YoutubeTranscript } from "youtube-transcript";

function getVideoId(url: string) {
  const match = url.match(/(?:v=|youtu\.be\/)([^&\n?#]+)/);
  return match ? match[1] : null;
}

function getPromptForMode(mode: string, transcript: string, url: string) {

  switch (mode) {

    case "short":
      return `
Summarize this YouTube video in about 120 words.

Transcript:
${transcript}
`;

    case "detailed":
      return `
Create a detailed explanation of this YouTube video.

Include:
- Main topics
- Explanation of ideas
- Important examples

Transcript:
${transcript}
`;

    case "bullets":
      return `
Convert this YouTube video transcript into bullet point notes.

Transcript:
${transcript}
`;

    case "study":
      return `
Create study notes from this video.

Include:
- Key concepts
- Important definitions
- Key takeaways

Transcript:
${transcript}
`;

    case "timeline":
      return `
Create a timeline style summary of this YouTube video.

Format example:

00:00 - Introduction  
01:30 - Main topic explanation  
03:40 - Important example  
05:50 - Key conclusion

Transcript:
${transcript}
`;

    default:
      return `
Summarize this YouTube video.

Transcript:
${transcript}
`;
  }
}

export async function POST(req: Request) {
  try {

    const { url, mode = "short" } = await req.json();

    if (!url) {
      return NextResponse.json(
        { error: "YouTube URL is required" },
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

    let transcriptText = "";
    let isFallback = false;

    try {

      const transcriptData = await YoutubeTranscript.fetchTranscript(videoId);

      transcriptText = transcriptData
        .map((item) => item.text)
        .join(" ");

    } catch (error) {

      console.warn("Transcript unavailable. Using fallback.");

      isFallback = true;

      transcriptText = `
The transcript for this YouTube video could not be fetched.

Video URL:
${url}

Based on the video topic, generate a reasonable summary.
`;

    }

    const prompt = getPromptForMode(mode, transcriptText, url);

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

    return NextResponse.json({ summary });

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      { error: "Failed to summarize video" },
      { status: 500 }
    );

  }
}