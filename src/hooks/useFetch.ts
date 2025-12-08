import { useCallback, useEffect, useRef, useState } from "react";

export type Status = "idle" | "loading" | "error" | "ready";

export type UseFetchResult<T> = {
  data: T | null;
  status: Status;
  error: string | null;
  reload: () => Promise<void>;
};

/**
 * Small helper hook for fetching JSON resources with minimal state wiring.
 */
export function useFetch<T>(url?: string | null): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [status, setStatus] = useState<Status>(url ? "loading" : "idle");
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const reload = useCallback(async () => {
    if (!url) {
      setError("No endpoint configured.");
      setStatus("error");
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setStatus("loading");
    setError(null);

    try {
      const response = await fetch(url, {
        headers: { Accept: "application/json" },
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const payload = (await response.json()) as T;
      setData(payload);
      setStatus("ready");
    } catch (err) {
      if (controller.signal.aborted) return;
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      setStatus("error");
    }
  }, [url]);

  useEffect(() => {
    reload();
    return () => abortRef.current?.abort();
  }, [reload]);

  return { data, status, error, reload };
}
