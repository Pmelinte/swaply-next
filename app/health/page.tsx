"use client";

import { useEffect, useState } from "react";

type Health = {
  status: "ok" | "degraded";
  checks: {
    env: { ok: boolean };
    supabase: { ok: boolean | "skipped"; latency_ms: number | null };
    uptime_s: number;
  };
  meta: {
    timestamp: string;
    node_env?: string;
    vercel?: {
      commit?: string;
      branch?: string;
      region?: string;
      url?: string;
    };
  };
};

export default function HealthPage() {
  const [data, setData] = useState<Health | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/health?deep=1", { cache: "no-store" })
      .then((r) => r.json())
      .then(setData)
      .catch((e) => setErr(String(e)));
  }, []);

  return (
    <main className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Healthcheck</h1>

      {err && (
        <div className="mb-4 rounded-xl border p-4 text-red-700 bg-red-50">
          Eroare la încărcare: {err}
        </div>
      )}

      {!data && !err && <div>Se încarcă…</div>}

      {data && (
        <div className="space-y-4">
          <div
            className={`rounded-xl border p-4 ${
              data.status === "ok" ? "bg-green-50 border-green-200" : "bg-yellow-50 border-yellow-200"
            }`}
          >
            <div className="font-semibold">Status: {data.status}</div>
            <div className="text-sm text-gray-600">Uptime: {data.checks.uptime_s}s</div>
          </div>

          <div className="grid gap-3">
            <div className="rounded-xl border p-4">
              <div className="font-semibold mb-1">ENV</div>
              <div className="text-sm">ok: {String(data.checks.env.ok)}</div>
            </div>

            <div className="rounded-xl border p-4">
              <div className="font-semibold mb-1">Supabase</div>
              <div className="text-sm">ok: {String(data.checks.supabase.ok)}</div>
              <div className="text-sm">latency_ms: {data.checks.supabase.latency_ms ?? "n/a"}</div>
            </div>

            <div className="rounded-xl border p-4">
              <div className="font-semibold mb-1">Meta</div>
              <pre className="text-xs whitespace-pre-wrap">
                {JSON.stringify(data.meta, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
