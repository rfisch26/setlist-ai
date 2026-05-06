# Setlist AI 🎵

AI-powered concert recap generator. Enter an artist and show date, and Setlist AI pulls the real setlist then uses Groq to write a personalized, journalist-style recap of the night.

![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178C6?style=flat-square&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js&logoColor=white)
![Groq](https://img.shields.io/badge/Groq-AI-F55036?style=flat-square&logo=groq&logoColor=white)

## Features

- Search any artist's concert history via the [Setlist.fm API](https://api.setlist.fm)
- Filter by date to find a specific show you attended
- AI-generated recap with headline, song-by-song highlights, and closing thoughts
- Shareable recap card with concert tags and rating
- Clean editorial UI built with React + TypeScript

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite |
| Backend | Node.js, Express, TypeScript |
| AI | Groq |
| Data | Setlist.fm REST API |
| Styling | Custom CSS |

## Getting Started

### Prerequisites
- Node.js 18+
- [Setlist.fm API key](https://api.setlist.fm/docs/1.0/index.html) (free)
- [Groq API key](https://console.groq.com/keys)

### Setup

```bash
git clone https://github.com/rfisch26/setlist-ai
cd setlist-ai

# Set up environment variables
cp .env server/.env
# Edit server/.env with your API keys

# Install and run the server
cd server
npm install
npm run dev

# In a new terminal, install and run the client
cd ../client
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Mock Mode
 
If you don't have a Setlist.fm API key yet, you can run the app with built-in mock data to test the full AI recap flow.
 
Add this to `server/.env`:
 
```bash
MOCK_SETLIST=true
```
 
Restart the server — you'll see `⚠️  MOCK MODE` in the logs. Search for any artist name and you'll get a set of sample Chappell Roan Chicago shows to generate recaps from. The Groq AI integration runs normally in mock mode.
 
To switch back to the real Setlist.fm API, set `MOCK_SETLIST=false` or remove the line entirely.

## How it Works

1. User searches for an artist (+ optional date)
2. Client calls `GET /api/search` → server queries Setlist.fm API
3. User selects a show from the results
4. Client calls `POST /api/recap` → server fetches full setlist, builds a prompt, and sends it to Groq
5. Groq returns structured JSON: headline, song highlights, tags, and rating
6. Frontend renders the recap card with share functionality

## Project Structure

```
setlist-ai/
├── client/          # React + TypeScript (Vite)
│   └── src/
│       ├── components/   # SearchForm, RecapCard, LoadingState
│       ├── types/        # Shared TypeScript interfaces
│       └── App.tsx
└── server/          # Node.js + Express
    └── src/
        ├── routes/       # /api/search, /api/recap
        └── services/     # setlistFm.ts, groq.ts
```

## License

© 2026 Rachel Fischmar. All rights reserved.
