"use client";
export default function GlobalError({
  error,
  reset,
}: { error: Error; reset: () => void }) {
  return (
    <html lang="ro">
      <body style={{ padding: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600 }}>A apărut o eroare</h1>
        <pre style={{ whiteSpace: "pre-wrap", marginTop: 12 }}>{String(error)}</pre>
        <button onClick={() => reset()} style={{ marginTop: 16 }}>
          Reîncearcă
        </button>
      </body>
    </html>
  );
}