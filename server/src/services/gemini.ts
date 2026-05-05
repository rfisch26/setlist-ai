import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Setlist, SetlistSong } from "./setlistFm";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Models tried in order — each has its own separate free tier quota
const MODEL_FALLBACKS = [
  "gemini-2.0-flash-lite",   // cheapest, highest free limits, try first
  "gemini-2.0-flash",         // separate quota from lite
  "gemini-1.5-flash",         // fallback (requires updated SDK)
];

export interface RecapResult {
  headline: string;
  openingVibe: string;
  songHighlights: Array<{ songName: string; commentary: string }>;
  closingThought: string;
  concertRating: string;
  tags: string[];
}

function buildPrompt(setlist: Setlist, songs: SetlistSong[]): string {
  const songList = songs
    .map((s, i) => {
      let entry = `${i + 1}. "${s.name}"`;
      if (s.cover) entry += ` (cover of ${s.cover.name})`;
      if (s.tape) entry += ` [tape/pre-recorded]`;
      if (s.info) entry += ` — ${s.info}`;
      return entry;
    })
    .join("\n");

  const venue = `${setlist.venue.name}, ${setlist.venue.city.name}, ${setlist.venue.city.country.name}`;
  const [day, month, year] = setlist.eventDate.split("-");
  const dateStr = new Date(`${year}-${month}-${day}`).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });

  return `You are a music journalist who attended this concert and is writing a vivid, personal recap for a fan publication.

Artist: ${setlist.artist.name}
Venue: ${venue}
Date: ${dateStr}
${setlist.tour ? `Tour: ${setlist.tour.name}` : ""}

Setlist (${songs.length} songs):
${songList}

Write a concert recap in JSON format with this exact structure:
{
  "headline": "A punchy, evocative headline for the show (under 12 words)",
  "openingVibe": "2-3 sentences setting the scene — the energy, the crowd, the moment the lights went down",
  "songHighlights": [
    {
      "songName": "exact song name from the setlist",
      "commentary": "1-2 sentences of vivid commentary — why this moment mattered, crowd reaction, musical context"
    }
  ],
  "closingThought": "2-3 sentences wrapping up the night — the lasting impression, what fans are saying walking out",
  "concertRating": "A short evocative phrase rating the show (e.g. 'An all-time night', 'Career-defining set')",
  "tags": ["3-5 short tags, e.g. 'career-spanning', 'emotional', 'rare deep cuts', 'euphoric'"]
}

Pick 4-6 of the most interesting songs for songHighlights.
Be specific and enthusiastic. Respond with valid JSON only — no markdown fences, no preamble.`;
}

function extractJson(text: string): string {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return text;
  return text.slice(start, end + 1)
    .replace(/[""]/g, '"')
    .replace(/['']/g, "'")
    .replace(/,\s*([}\]])/g, "$1");
}

function getRetryDelayMs(error: unknown, fallbackMs: number): number {
  try {
    const details = (error as { errorDetails?: Array<{ retryDelay?: string }> })?.errorDetails;
    if (details) {
      for (const d of details) {
        if (d.retryDelay) {
          const secs = parseFloat(d.retryDelay.replace("s", ""));
          if (!isNaN(secs)) return Math.ceil(secs) * 1000 + 500;
        }
      }
    }
  } catch { /* ignore */ }
  return fallbackMs;
}

function isDailyQuotaExhausted(error: unknown): boolean {
  return JSON.stringify(error).includes("GenerateRequestsPerDayPerProjectPerModel");
}

async function generateWithFallback(prompt: string): Promise<string> {
  for (const modelName of MODEL_FALLBACKS) {
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        responseMimeType: "application/json",
        maxOutputTokens: 1500,
        temperature: 0.9,
      },
    });

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`Trying ${modelName} (attempt ${attempt}/3)…`);
        const result = await model.generateContent(prompt);
        return result.response.text();
      } catch (error: unknown) {
        const status = (error as { status?: number })?.status;

        if (status === 404) {
          console.warn(`${modelName}: not found, skipping…`);
          break; // try next model
        }

        if (status === 429) {
          if (isDailyQuotaExhausted(error)) {
            console.warn(`${modelName}: daily quota exhausted, skipping…`);
            break; // try next model immediately
          }
          const delay = getRetryDelayMs(error, 2000 * attempt);
          console.warn(`${modelName}: rate limited, retrying in ${delay}ms…`);
          await new Promise((r) => setTimeout(r, delay));
          continue;
        }

        if (status === 503) {
          const delay = getRetryDelayMs(error, 2000 * attempt);
          console.warn(`${modelName}: overloaded, retrying in ${delay}ms…`);
          await new Promise((r) => setTimeout(r, delay));
          continue;
        }

        throw error; // unexpected error — surface it
      }
    }
  }

  throw new Error(
    "All Gemini models exhausted their quotas. Wait until tomorrow or add billing at https://ai.dev"
  );
}

export async function generateRecap(setlist: Setlist, songs: SetlistSong[]): Promise<RecapResult> {
  const rawText = await generateWithFallback(buildPrompt(setlist, songs));

  try {
    return JSON.parse(rawText) as RecapResult;
  } catch {
    const cleaned = extractJson(rawText);
    try {
      return JSON.parse(cleaned) as RecapResult;
    } catch (err) {
      console.error("Failed to parse Gemini JSON.\nRaw:", rawText, "\nCleaned:", cleaned);
      throw err;
    }
  }
}