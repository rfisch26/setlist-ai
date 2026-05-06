import { Router, Request, Response } from "express";
import { searchSetlists, getSetlistById, flattenSongs } from "../services/setlistFm";
import { generateRecap } from "../services/groq";
import { MOCK_SEARCH_RESULTS, getMockSetlistById } from "../services/mockSetlist";

const router = Router();

function isMock(): boolean {
  return process.env.MOCK_SETLIST === "true";
}

function sanitizeError(err: unknown): string {
  const raw = JSON.stringify(err, Object.getOwnPropertyNames(err as object));
  return raw
    .replace(/x-api-key[^,}\]"]*/gi, "x-api-key: [REDACTED]")
    .replace(/Authorization[^,}\]"]*/gi, "Authorization: [REDACTED]");
}

router.get("/search", async (req: Request, res: Response) => {
  const { artist, date } = req.query;

  if (!artist || typeof artist !== "string") {
    res.status(400).json({ error: "artist query param is required" });
    return;
  }

  if (isMock()) {
    console.log("⚠️  MOCK MODE — returning fake setlist data");
    const setlists = MOCK_SEARCH_RESULTS.setlist.map((s) => ({
      id: s.id,
      artist: s.artist.name,
      venue: `${s.venue.name}, ${s.venue.city.name}`,
      date: s.eventDate,
      songCount: s.sets.set.flatMap((set) => set.song).length,
      url: s.url,
      tour: s.tour?.name,
    }));
    res.json({ setlists, total: MOCK_SEARCH_RESULTS.total });
    return;
  }

  try {
    const results = await searchSetlists(artist, date as string | undefined);
    const setlists = (results.setlist || []).slice(0, 5).map((s) => ({
      id: s.id,
      artist: s.artist.name,
      venue: `${s.venue.name}, ${s.venue.city.name}`,
      date: s.eventDate,
      songCount: s.sets.set.flatMap((set) => set.song).length,
      url: s.url,
      tour: s.tour?.name,
    }));
    res.json({ setlists, total: results.total });
  } catch (err: unknown) {
    console.error("Setlist search error:", sanitizeError(err));
    const status = (err as { response?: { status?: number } })?.response?.status || 500;
    res.status(status).json({ error: "Failed to search setlists" });
  }
});

router.post("/recap", async (req: Request, res: Response) => {
  const { setlistId } = req.body;

  if (!setlistId || typeof setlistId !== "string") {
    res.status(400).json({ error: "setlistId is required" });
    return;
  }

  try {
    const setlist = isMock() ? getMockSetlistById(setlistId) : await getSetlistById(setlistId);
    const songs = flattenSongs(setlist);

    if (songs.length === 0) {
      res.status(422).json({ error: "This setlist has no songs recorded yet." });
      return;
    }

    const recap = await generateRecap(setlist, songs);
    res.json({
      recap,
      meta: {
        artist: setlist.artist.name,
        venue: `${setlist.venue.name}, ${setlist.venue.city.name}`,
        date: setlist.eventDate,
        songCount: songs.length,
        setlistUrl: setlist.url,
        tour: setlist.tour?.name,
      },
    });
  } catch (err: unknown) {
    console.error("Recap generation error:", sanitizeError(err));
    const status = (err as { response?: { status?: number } })?.response?.status || 500;
    res.status(status).json({ error: "Failed to generate recap" });
  }
});

export default router;
