"use client";

import { useEffect, useState } from "react";

type DoctorPayload = {
  status: "ok" | "issues";
  summary: { total_checks: number; failures: string[] };
  checks: Record<string, any>;
  meta: any;
  suggestions: string[];
};

export default function DoctorPage() {
  const [data, setData] = useState<DoctorPayload | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch("/api/doctor?deep=1", { cache: "no-store" });
      setData(await res.json());
    } catch (e: any) {
      setErr(e?.message ?? "Eroare la încărcare.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Swaply — Doctor</h1>
        <button
          onClick={load}
          disabled={loading}
          className="rounded-xl border px-3 py-1.5 text-sm font-medium disabled:opacity-60"
        >
          {loading ? "Reîncarcă…" : "Re-scan"}
        </button>
      </div>

      {err && (
        <div className="mb-4 rounded-xl border p-4 text-red-700 bg-red-50">{err}</div>
      )}

      {data && (
        <>
          <div
            className={`mb-4 rounded-xl border p-4 ${
              data.status === "ok" ? "bg-green-50 border-green-200" : "bg-yellow-50 border-yellow-200"
            }`}
          >
            <div className="font-semibold">Status: {data.status}</div>
            <div className="text-sm text-gray-600">
              Check-uri: {data.summary.total_checks} • Probleme: {data.summary.failures.length}
            </div>
          </div>

          <div className="space-y-3">
            {Object.entries(data.checks).map(([key, val]) => (
              <div key={key} className="rounded-xl border p-4">
                <div className="flex items-center justify-between">
                  <div className="font-semibold">{key}</div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      val.ok ? "bg-green-100 border border-green-200" : "bg-red-100 border border-red-200"
                    }`}
                  >
                    {String(val.ok)}
                  </span>
                </div>
                <pre className="mt-2 text-xs whitespace-pre-wrap">
                  {JSON.stringify(val, null, 2)}
                </pre>
              </div>
            ))}
          </div>

          {data.suggestions.length > 0 && (
            <div className="mt-4 rounded-xl border p-4 bg-amber-50 border-amber-200">
              <div className="font-semibold mb-1">Sugestii</div>
              <ul className="list-disc pl-5 text-sm">
                {data.suggestions.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      {!data && !err && <div>Se scanează proiectul…</div>}
    </main>
  );
}
