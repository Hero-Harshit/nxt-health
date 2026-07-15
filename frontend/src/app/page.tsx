"use client";

import { FormEvent, useState } from "react";

type Context = "term" | "prescription";

type ExplanationResult = {
  title: string;
  reference_id: string | null;
  explanation: string;
  why_not: string | null;
  alternatives: string | null;
  trade_offs: string | null;
  confidence_level: "high" | "medium" | "low" | null;
  confidence_note: string | null;
};

type ApiResponse =
  | { status: "ok" | "no_match"; results: ExplanationResult[] }
  | { status: "error"; message: string };

export default function Home() {
  const [context, setContext] = useState<Context>("term");
  const [input, setInput] = useState("");
  const [result, setResult] = useState<ExplanationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResult(null);
    setError(null);

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backendUrl) {
      setError("The backend URL is not configured.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `${backendUrl.replace(/\/$/, "")}/api/term-explainer`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ context, input }),
        },
      );
      const data: unknown = await response.json();

      if (
        response.ok &&
        typeof data === "object" &&
        data !== null &&
        "status" in data &&
        (data.status === "ok" || data.status === "no_match") &&
        "results" in data &&
        Array.isArray(data.results) &&
        data.results.length === 1
      ) {
        setResult(data.results[0] as ExplanationResult);
        return;
      }

      if (
        typeof data === "object" &&
        data !== null &&
        "message" in data &&
        typeof data.message === "string"
      ) {
        setError(data.message);
      } else {
        setError("We could not explain that right now. Please try again.");
      }
    } catch {
      setError("We could not reach the backend. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main>
      <h1>Term / Prescription Explainer</h1>

      <form onSubmit={handleSubmit}>
        <label>
          Context
          <select
            value={context}
            onChange={(event) => setContext(event.target.value as Context)}
          >
            <option value="term">Term</option>
            <option value="prescription">Prescription</option>
          </select>
        </label>

        <label>
          {context === "term" ? "Healthcare term" : "Prescription text"}
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            required
          />
        </label>

        <button disabled={isLoading} type="submit">
          Explain
        </button>
      </form>

      {isLoading && <p role="status">Loading…</p>}

      {error && <p role="alert">{error}</p>}

      {result && (
        <article>
          <h2>{result.title}</h2>
          <details open>
            <summary>Explanation</summary>
            <p>{result.explanation}</p>
          </details>
          {result.confidence_note && <p>{result.confidence_note}</p>}
        </article>
      )}
    </main>
  );
}
