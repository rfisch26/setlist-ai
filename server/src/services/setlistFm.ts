import axios from "axios";

const BASE_URL = "https://api.setlist.fm/rest/1.0";

export interface SetlistSong {
  name: string;
  tape?: boolean;
  cover?: { name: string };
  info?: string;
}

export interface Setlist {
  id: string;
  artist: { name: string };
  venue: { name: string; city: { name: string; country: { name: string } } };
  eventDate: string;
  sets: { set: Array<{ song: SetlistSong[]; encore?: number }> };
  url: string;
  tour?: { name: string };
}

export interface SearchResult {
  setlist: Setlist[];
  total: number;
  page: number;
  itemsPerPage: number;
}

function getClient() {
  return axios.create({
    baseURL: BASE_URL,
    headers: {
      Accept: "application/json",
      "x-api-key": process.env.SETLIST_FM_API_KEY || "",
    },
  });
}

async function withRetry<T>(fn: () => Promise<T>, maxAttempts = 3): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err: unknown) {
      lastError = err;
      if (axios.isAxiosError(err) && err.response?.status === 429) {
        const delay = 1000 * attempt;
        console.warn(`Setlist.fm 429 on attempt ${attempt}/${maxAttempts}, retrying in ${delay}ms…`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

export async function searchSetlists(artistName: string, date?: string): Promise<SearchResult> {
  const params: Record<string, string | number> = { artistName, p: 1 };
  if (date) {
    const [year, month, day] = date.split("-");
    params.date = `${day}-${month}-${year}`;
  }
  try {
    return await withRetry(async () => {
      const client = getClient();
      const response = await client.get<SearchResult>("/search/setlists", { params });
      return response.data;
    });
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && [400, 404].includes(err.response?.status ?? 0)) {
      return { setlist: [], total: 0, page: 1, itemsPerPage: 0 };
    }
    throw err;
  }
}

export async function getSetlistById(setlistId: string): Promise<Setlist> {
  return withRetry(async () => {
    const client = getClient();
    const response = await client.get<Setlist>(`/setlist/${setlistId}`);
    return response.data;
  });
}

export function flattenSongs(setlist: Setlist): SetlistSong[] {
  return setlist.sets.set.flatMap((s) => s.song);
}