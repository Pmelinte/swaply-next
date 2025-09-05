// pages/api/categorize.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

type MatchRow = { id: number; path: string; name_en: string; name_ro: string | null; score: number };

async function embedTextHF(text: string): Promise<number[]> {
  const token = process.env.HUGGINGFACE_API_TOKEN;
  if (!token) throw new Error("HUGGINGFACE_API_TOKEN missing");
  const res = await fetch("https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(text),
  });
  if (!res.ok) throw new Error(`HF embed failed: ${await res.text()}`);
  const vec = await res.json();
  // API poate returna [384] sau [[384]]; normalizăm:
  return Array.isArray(vec[0]) ? vec[0] : vec;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { title, description, hint } = req.body as { title?: string; description?: string; hint?: string };
    const text = [title, description, hint].filter(Boolean).join(". ").trim();
    if (!text) return res.status(400).json({ error: "Missing text to categorize" });

    const embedding = await embedTextHF(text);

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
    );

    const { data, error } = await supabase.rpc("match_taxonomy", { query_embedding: embedding, match_count: 5 });
    if (error) throw error;

    const matches = (data as MatchRow[]).map((m) => ({
      id: m.id,
      path: m.path,
      name: m.name_ro || m.name_en,
      score: m.score,
    }));

    res.status(200).json({ best: matches[0] ?? null, candidates: matches });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "categorize failed" });
  }
}
