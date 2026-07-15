"use client";

import { useEffect, useState } from "react";

type ConnectionStatus = "loading" | "connected" | "unreachable";

export default function Home() {
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("loading");

  useEffect(() => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

    if (!backendUrl) {
      setConnectionStatus("unreachable");
      return;
    }

    const pingUrl = `${backendUrl.replace(/\/$/, "")}/api/ping`;
    const controller = new AbortController();

    async function pingBackend() {
      try {
        const response = await fetch(pingUrl, { signal: controller.signal });
        const data: unknown = await response.json();

        if (
          response.ok &&
          typeof data === "object" &&
          data !== null &&
          "status" in data &&
          data.status === "ok"
        ) {
          setConnectionStatus("connected");
          return;
        }

        setConnectionStatus("unreachable");
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setConnectionStatus("unreachable");
        }
      }
    }

    void pingBackend();

    return () => controller.abort();
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      {connectionStatus === "loading" ? (
        <div className="flex items-center gap-3 text-zinc-700 dark:text-zinc-300">
          <span
            aria-label="Checking backend connection"
            className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900 dark:border-zinc-700 dark:border-t-white"
            role="status"
          />
          <span>Checking backend connection</span>
        </div>
      ) : (
        <p className="text-zinc-900 dark:text-zinc-100">
          {connectionStatus === "connected"
            ? "Backend connected"
            : "Backend unreachable"}
        </p>
      )}
    </main>
  );
}
