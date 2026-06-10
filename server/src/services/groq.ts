import type { Setlist, SetlistSong } from "./setlistFm";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile"; // best free Groq model for creative writing
const PROMPT_VERSION = "prompt-v1.1";

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

export async function generateRecap(setlist: Setlist, songs: SetlistSong[]): Promise<RecapResult> {
  console.info("[AI pipeline] prompt_build", {
    promptVersion: PROMPT_VERSION,
    artist: setlist.artist.name,
    venue: `${setlist.venue.name}, ${setlist.venue.city.name}`,
    songCount: songs.length,
    eventDate: setlist.eventDate,
  });

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.GROQ_API_KEY || process.env.Groq_API_KEY || ""}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: "user", content: buildPrompt(setlist, songs) }],
      max_tokens: 1500,
      temperature: 0.9,
      response_format: { type: "json_object" }, // forces clean JSON — no fences
    }),
  });

  console.info("[AI pipeline] llm_request", {
    promptVersion: PROMPT_VERSION,
    model: MODEL,
    responseFormat: "json_object",
    songCount: songs.length,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw Object.assign(new Error(`Groq API error: ${response.status}`), { status: response.status, details: err });
  }

  const data = await response.json() as {
    choices: Array<{ message: { content: string } }>;
  };

  const text = data.choices[0]?.message?.content ?? "";

  try {
    return JSON.parse(text) as RecapResult;
  } catch (err) {
    console.error("Failed to parse Groq JSON.\nRaw:", text);
    throw err;
  }
}