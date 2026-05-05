import { useState } from "react";
import type { SetlistSummary } from "../types";

interface Props {
  onSelectSetlist: (setlist: SetlistSummary) => void;
}

function formatDate(ddMMyyyy: string): string {
  const [day, month, year] = ddMMyyyy.split("-");
  return new Date(`${year}-${month}-${day}`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function SearchForm({ onSelectSetlist }: Props) {
  const [artist, setArtist] = useState("");
  const [date, setDate] = useState("");
  const [results, setResults] = useState<SetlistSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!artist.trim()) return;

    setLoading(true);
    setError("");
    setResults([]);
    setSearched(false);

    try {
      const params = new URLSearchParams({ artist: artist.trim() });
      if (date) params.set("date", date);

      const res = await fetch(`/api/search?${params}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Search failed");

      setResults(data.setlists || []);
      setSearched(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="search-section">
      <form onSubmit={handleSearch} className="search-form">
        <div className="input-group">
          <label htmlFor="artist">Artist</label>
          <input
            id="artist"
            type="text"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            placeholder="e.g. Chappell Roan, Radiohead, Beyoncé"
            required
          />
        </div>
        <div className="input-group">
          <label htmlFor="date">
            Date <span className="optional">(optional)</span>
          </label>
          <input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <button type="submit" disabled={loading} className="search-btn">
          {loading ? "Searching…" : "Find shows"}
        </button>
      </form>

      {error && <p className="error-msg">{error}</p>}

      {searched && results.length === 0 && !loading && (
        <p className="no-results">
          No setlists found. Try a different artist name or remove the date
          filter.
        </p>
      )}

      {results.length > 0 && (
        <ul className="results-list">
          {results.map((s) => (
            <li key={s.id}>
              <button
                className="result-item"
                onClick={() => onSelectSetlist(s)}
              >
                <div className="result-main">
                  <span className="result-artist">{s.artist}</span>
                  <span className="result-venue">{s.venue}</span>
                </div>
                <div className="result-meta">
                  <span className="result-date">{formatDate(s.date)}</span>
                  {s.tour && <span className="result-tour">{s.tour}</span>}
                  <span className="result-songs">{s.songCount} songs</span>
                  <span className="result-arrow">→</span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}