import type { Setlist, SearchResult } from "./setlistFm";

// Set MOCK_SETLIST=true in .env to use these instead of the real API
export const MOCK_SEARCH_RESULTS: SearchResult = {
  total: 3,
  page: 1,
  itemsPerPage: 3,
  setlist: [
    {
      id: "mock-001",
      artist: { name: "Chappell Roan" },
      venue: {
        name: "United Center",
        city: { name: "Chicago", country: { name: "United States" } },
      },
      eventDate: "15-08-2024",
      tour: { name: "The Rise and Fall of a Midwest Princess Tour" },
      url: "https://www.setlist.fm",
      sets: {
        set: [
          {
            song: [
              { name: "Femininomenon" },
              { name: "Casual" },
              { name: "Super Graphic Ultra Modern Girl" },
              { name: "Red Wine Supernova" },
              { name: "Naked in Manhattan" },
              { name: "Kaleidoscope" },
              { name: "After Midnight" },
              { name: "My Kink Is Karma" },
              { name: "念珠 (Rosary)" },
              { name: "Hot to Go!" },
              { name: "Good Luck, Babe!" },
              { name: "Pink Pony Club" },
            ],
          },
          {
            encore: 1,
            song: [{ name: "Guilty Pleasure" }, { name: "Coffee" }],
          },
        ],
      },
    },
    {
      id: "mock-002",
      artist: { name: "Chappell Roan" },
      venue: {
        name: "Lollapalooza",
        city: { name: "Chicago", country: { name: "United States" } },
      },
      eventDate: "04-08-2024",
      url: "https://www.setlist.fm",
      sets: {
        set: [
          {
            song: [
              { name: "Femininomenon" },
              { name: "Red Wine Supernova" },
              { name: "Hot to Go!" },
              { name: "Good Luck, Babe!" },
              { name: "Pink Pony Club" },
            ],
          },
        ],
      },
    },
    {
      id: "mock-003",
      artist: { name: "Chappell Roan" },
      venue: {
        name: "Riviera Theatre",
        city: { name: "Chicago", country: { name: "United States" } },
      },
      eventDate: "10-03-2024",
      tour: { name: "The Rise and Fall of a Midwest Princess Tour" },
      url: "https://www.setlist.fm",
      sets: {
        set: [
          {
            song: [
              { name: "Femininomenon" },
              { name: "Casual" },
              { name: "Red Wine Supernova" },
              { name: "Good Luck, Babe!" },
              { name: "Pink Pony Club" },
            ],
          },
        ],
      },
    },
  ],
};

export function getMockSetlistById(id: string): Setlist {
  const found = MOCK_SEARCH_RESULTS.setlist.find((s) => s.id === id);
  if (!found) throw new Error(`Mock setlist ${id} not found`);
  return found;
}