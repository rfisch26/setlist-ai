# Setlist AI 🎵

AI-powered concert recap generator with an end-to-end retrieval + generation workflow. Enter an artist and show date, and Setlist AI retrieves real setlist data, grounds the prompt in that context, and uses an LLM to produce a structured, journalist-style recap.

![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178C6?style=flat-square&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js&logoColor=white)
![Groq](https://img.shields.io/badge/Groq-AI-F55036?style=flat-square&logo=groq&logoColor=white)

## Features

- Retrieval-first workflow using real concert data from the [Setlist.fm API](https://api.setlist.fm)
- Prompt-engineered LLM generation with structured JSON output for headline, highlights, tags, and rating
- End-to-end AI demo flow: search → retrieve → summarize → render
- Shareable recap card with editorial styling for a polished presentation
- Clean full-stack UI built with React + TypeScript and an Express backend

## Why this fits the DTN AI Core role

- Agentic-style workflow: the app chains multiple steps (search, retrieve, summarize) instead of relying on a single static response.
- Retrieval-grounded generation: the LLM is grounded in real setlist data rather than responding from memory alone.
- Prompt engineering and structured outputs: the backend builds a domain-specific prompt and validates JSON output.
- Full-stack AI delivery: React frontend + Express backend demonstrates end-to-end product thinking.
- Observability-friendly architecture: the pipeline is easy to instrument with logging, tracing, and evaluation hooks for production AI systems.

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

## Demo Narrative

Use this 2-minute story when you present it live:

1. Start with the problem: concert recaps are usually written from memory or static metadata, which makes them shallow and inconsistent.
2. Show the solution: this app retrieves real setlist data first, then uses an LLM to generate a structured recap grounded in that context.
3. Emphasize the engineering choices: prompt design, structured JSON outputs, API integration, and a clean full-stack flow that can be extended with observability and evaluation.
4. Close with impact: it demonstrates real product thinking for an AI platform team, not just a demo widget.

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
