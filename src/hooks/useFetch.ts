import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LoadingStatus } from "@/enums";

export type UseFetchResult<T> = {
  data: T | null;
  status: LoadingStatus;
  error: string | null;
  reload: () => Promise<void>;
};

type FetchTarget = string | { path: string; apiBaseUrl?: string };

/**
 * Small helper hook for fetching JSON resources with minimal state wiring.
 */
export function useFetch<T>(target?: FetchTarget | null): UseFetchResult<T> {
  const resolveUrl = useCallback((input?: FetchTarget | null) => {
    if (!input) return null;
    if (typeof input === "string") return input;

    const base = input.apiBaseUrl ?? "";
    const normalizedBase = base.replace(/\/$/, "");
    const normalizedPath = input.path.startsWith("/")
      ? input.path
      : `/${input.path}`;

    return `${normalizedBase}${normalizedPath}`;
  }, []);

  const url = useMemo(() => resolveUrl(target), [target, resolveUrl]);
  const [data, setData] = useState<T | null>(null);
  const [status, setStatus] = useState<LoadingStatus>(
    url ? LoadingStatus.LOADING : LoadingStatus.IDLE
  );
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const reload = useCallback(async () => {
    if (!url) {
      setError("No endpoint configured.");
      setStatus(LoadingStatus.ERROR);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setData(null);
    setStatus(LoadingStatus.LOADING);
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
      setStatus(LoadingStatus.READY);
    } catch (err) {
      if (controller.signal.aborted) return;
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      setStatus(LoadingStatus.ERROR);
    }
  }, [url]);

  useEffect(() => {
    reload();
    return () => abortRef.current?.abort();
  }, [reload]);

  return { data, status, error, reload };
}
