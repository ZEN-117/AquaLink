// src/hooks/useFinance.js
import { useQuery } from "@tanstack/react-query";

const API_BASE = "/api";

function authHeader() {
  const token = localStorage.getItem("demo_token") || "OWNER:owner1";
  return { Authorization: `Bearer ${token}` };
}

async function apiGet(path) {
  const r = await fetch(`${API_BASE}${path}`, { headers: { ...authHeader() } });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

// React Query hook to load finance statements
export function useStatements() {
  return useQuery({
    queryKey: ["statements"],
    queryFn: () => apiGet("/finance/statements"),
    staleTime: 60_000, // 1 minute
  });
}