"use client";
export default function Error({
  error, reset,
}: { error: Error; reset: () => void }) {
  return (
    <main style={{ padding: 24 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700 }}>A apărut o eroare</h1>
      <pre style={{ whiteSpace: "pre-wrap", marginTop: 12 }}>{String(error)}</pre>
      <button onClick={() => reset()} style={{ marginTop: 12 }}>Reîncearcă</button>
    </main>
  );
}