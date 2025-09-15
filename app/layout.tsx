// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import Header from "../components/Header";

export const metadata: Metadata = {
  title: "Swaply",
  description: "Schimbă obiecte simplu și rapid",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ro">
      <body>
        <Header />
        {children}
      </body>
    </html>
  );
}
