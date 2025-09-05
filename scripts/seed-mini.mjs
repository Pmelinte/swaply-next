// scripts/seed-mini.mjs
import fetch from "node-fetch";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY; // DOAR local (NU o comiți)
const HF_TOKEN     = process.env.HUGGINGFACE_API_TOKEN;

if (!SUPABASE_URL || !SERVICE_KEY || !HF_TOKEN) {
  console.error("Need NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, HUGGINGFACE_API_TOKEN");
  process.exit(1);
}

const sb = createClient(SUPABASE_URL, SERVICE_KEY);

async function embed(text) {
  const r = await fetch(
    "https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2",
    {
      method: "POST",
      headers: { Authorization: `Bearer ${HF_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify(text),
    }
  );
  if (!r.ok) throw new Error(await r.text());
  const v = await r.json();
  return Array.isArray(v[0]) ? v[0] : v; // [384]
}

// câteva categorii uzuale pentru test
const ROWS = [
  { id: 10001, path: "Office Supplies > Writing & Correction > Pens", name_en: "Pens" },
  { id: 10002, path: "Office Supplies > Writing & Correction > Pencils", name_en: "Pencils" },
  { id: 10003, path: "Office Supplies > Writing & Correction > Markers & Highlighters", name_en: "Markers & Highlighters" },
  { id: 20001, path: "Furniture > Bedroom Furniture > Beds & Headboards > Beds", name_en: "Beds" },
  { id: 20002, path: "Furniture > Living Room Furniture > Sofas", name_en: "Sofas" },
  { id: 30001, path: "Electronics > Computers > Laptops", name_en: "Laptops" },
  { id: 30002, path: "Electronics > Communications > Mobile Phones", name_en: "Mobile Phones" },
  { id: 40001, path: "Sporting Goods > Outdoor Recreation > Bicycles", name_en: "Bicycles" },
];

async function main() {
  for (const r of ROWS) {
    const embedding = await embed(r.path);
    const { error } = await sb.from("taxonomy").upsert({ ...r, embedding }, { onConflict: "id" });
    if (error) throw error;
    console.log("Upserted:", r.path);
  }
  console.log("Done mini seed.");
}

main().catch((e) => (console.error(e), process.exit(1)));
