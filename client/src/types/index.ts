export interface SetlistSummary {
  id: string;
  artist: string;
  venue: string;
  date: string; // dd-MM-yyyy
  songCount: number;
  url: string;
  tour?: string;
}

export interface SongHighlight {
  songName: string;
  commentary: string;
}

export interface RecapData {
  headline: string;
  openingVibe: string;
  songHighlights: SongHighlight[];
  closingThought: string;
  concertRating: string;
  tags: string[];
}

export interface RecapMeta {
  artist: string;
  venue: string;
  date: string; // dd-MM-yyyy
  tour?: string;
  setlistUrl: string;
}

export interface RecapResponse {
  recap: RecapData;
  meta: RecapMeta;
}