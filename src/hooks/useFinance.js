// src/hooks/useFinance.js
import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const API_BASE = "http://localhost:5000/api"; // keep consistent with your other pages

async function apiGet(path) {
  const r = await fetch(`${API_BASE}${path}`);
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

/**
 * Live finance overview
 * - Initial fetch with React Query
 * - Subscribes to SSE (/api/finance/events) and refetches on events
 */
export function useFinanceOverview() {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["finance_overview"],
    queryFn: () => apiGet("/finance/overview"),
    staleTime: 15_000,
  });

  useEffect(() => {
    const src = new EventSource(`${API_BASE}/finance/events`, { withCredentials: false });
    const onMsg = () => qc.invalidateQueries({ queryKey: ["finance_overview"] });

    src.addEventListener("finance", onMsg);
    src.onerror = () => {
      // Try to reconnect by closing; browser will retry on next mount/open
      src.close();
    };

    return () => {
      src.removeEventListener("finance", onMsg);
      src.close();
    };
  }, [qc]);

  return query;
}
