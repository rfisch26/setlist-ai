import { useState, useEffect } from "react";
import SearchForm from "./components/SearchForm";
import RecapCard from "./components/RecapCard";
import LoadingState from "./components/LoadingState";
import type { SetlistSummary, RecapResponse } from "./types";

type AppState = "search" | "loading" | "recap" | "error";

export default function App() {
  const [state, setState] = useState<AppState>("search");
  const [recap, setRecap] = useState<RecapResponse | null>(null);
  const [error, setError] = useState("");
  const [loadingStep, setLoadingStep] = useState(0);

  // Cycle through loading messages
  useEffect(() => {
    if (state !== "loading") return;
    setLoadingStep(0);
    const interval = setInterval(() => {
      setLoadingStep((s) => Math.min(s + 1, 3));
    }, 1800);
    return () => clearInterval(interval);
  }, [state]);

  async function handleSelectSetlist(setlist: SetlistSummary) {
    setState("loading");
    setError("");

    try {
      const res = await fetch("/api/recap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ setlistId: setlist.id }),
      });
      const data = await res.json().catch(() => ({ error: "The server returned an invalid response." }));
      if (!res.ok) throw new Error(data.error || "Failed to generate recap");
      setRecap(data as RecapResponse);
      setState("recap");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setState("error");
    }
  }

  function handleReset() {
    setRecap(null);
    setError("");
    setState("search");
  }

  return (
    <div className="app">
      <div className="app-inner">
        {(state === "search" || state === "error") && (
          <>
            <header className="app-header">
              <div className="logo-mark">♪</div>
              <h1 className="app-title">Setlist AI</h1>
              <p className="app-subtitle">
                AI-powered concert recap generator with an end-to-end retrieval + generation workflow. Enter an artist and show date, and Setlist AI retrieves real setlist data, grounds the prompt in that context, and uses an LLM to produce a structured, journalist-style recap.
              </p>
            </header>
            <SearchForm onSelectSetlist={handleSelectSetlist} />
            {state === "error" && (
              <p className="error-msg top-error">{error}</p>
            )}
          </>
        )}

        {state === "loading" && <LoadingState step={loadingStep} />}

        {state === "recap" && recap && (
          <RecapCard data={recap} onReset={handleReset} />
        )}
      </div>
    </div>
  );
}