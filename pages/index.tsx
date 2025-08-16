// pages/index.tsx
import Head from "next/head";
import Nav from "../components/Nav";

export default function Home() {
  return (
    <>
      <Head><title>Swaply</title></Head>
      <main style={{ minHeight: "100vh", background: "#0f172a", color: "white" }}>
        <Nav />
        <section style={{ maxWidth: 1080, margin: "0 auto", padding: "2rem" }}>
          <h1 style={{ marginTop: 0 }}>Bine ai venit la Swaply</h1>
          <p style={{ color: "#cbd5e1" }}>
            Folosește meniul de sus pentru a adăuga și gestiona obiecte.
          </p>
        </section>
      </main>
    </>
  );
}
