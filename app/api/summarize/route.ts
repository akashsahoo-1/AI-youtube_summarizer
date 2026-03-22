import { NextResponse } from "next/server";
import { YoutubeTranscript } from "youtube-transcript";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const rateLimits = new Map<string, { minuteHits: number[], dailyHits: { date: string, count: number } }>();

function checkRateLimit(userId: string) {
  const now = Date.now();
  const minuteAgo = now - 60 * 1000;
  const todayDate = new Date().toISOString().split('T')[0];

  let userData = rateLimits.get(userId);

  if (!userData) {
    userData = { minuteHits: [], dailyHits: { date: todayDate, count: 0 } };
  }

  // Reset daily limit if it's a new day
  if (userData.dailyHits.date !== todayDate) {
    userData.dailyHits = { date: todayDate, count: 0 };
  }

  // Check Daily limit (Max 20 per day)
  if (userData.dailyHits.count >= 20) {
    return { allowed: false, error: "Daily limit exceeded. Please try again tomorrow." };
  }

  // Check Minute limit (Max 10 per minute)
  userData.minuteHits = userData.minuteHits.filter(time => time > minuteAgo);
  if (userData.minuteHits.length >= 10) {
    return { allowed: false, error: "Too many requests. Please try again later." };
  }

  // Update counts
  userData.minuteHits.push(now);
  userData.dailyHits.count += 1;
  rateLimits.set(userId, userData);

  return { allowed: true };
}

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
  let user_id = "unknown";
  let vid_id = "unknown";
  try {
    // 1. Authenticate Request
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll() {} // Read-only for API validation
        }
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.log(`[AUTH] Unauthorized access attempt at ${new Date().toISOString()}`);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    user_id = user.id;

    // 2. Validate Rate Limiting
    const rateCheck = checkRateLimit(user_id);
    if (!rateCheck.allowed) {
      console.log(`[RATE_LIMIT] Limit hit for user: ${user_id} at ${new Date().toISOString()}`);
      return NextResponse.json({ error: rateCheck.error }, { status: 429 });
    }

    // Parse Body
    const { url, mode = "short", length = "Medium", language = "English", allowFallback = false } = await req.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
    }

    // 3. Validate & Sanitize YouTube URL
    const cleanUrl = url.trim();
    if (!cleanUrl.includes("youtube.com") && !cleanUrl.includes("youtu.be")) {
      return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 });
    }

    const videoId = getVideoId(cleanUrl);
    
    if (!videoId) {
      return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 });
    }
    vid_id = videoId;

    let context = "";
    let transcriptFetched = false;

    try {
      const transcript = await YoutubeTranscript.fetchTranscript(videoId);
      context = transcript.map((t) => t.text).join(" ");
      transcriptFetched = true;
    } catch {
      console.warn(`[TRANSCRIPT] Unavailable for video: ${videoId}`);
    }

    if (!transcriptFetched) {
      if (!allowFallback) {
        return NextResponse.json(
          { error: "Transcript not available for this video." },
          { status: 400 }
        );
      } else {
        try {
          const embedRes = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`);
          const embedData = await embedRes.json();
          context = embedData.title ? `Video Title: ${embedData.title}` : `Topic inferred from URL: ${cleanUrl}`;
        } catch {
          context = `Topic inferred from URL: ${cleanUrl}`;
        }
      }
    }

    const prompt = buildPrompt(mode, context, cleanUrl, transcriptFetched, length, language);

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

    console.log(`[SUCCESS] User: ${user_id} | Video: ${vid_id} | Time: ${new Date().toISOString()}`);

    return NextResponse.json({ summary, isEstimated: !transcriptFetched });

  } catch (error) {
    console.error(`[ERROR] User: ${user_id} | Video: ${vid_id} | Time: ${new Date().toISOString()} | Msg:`, error);

    // 4. Safe Error Handling
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}