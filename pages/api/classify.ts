// pages/api/classify.ts
import type { NextApiRequest, NextApiResponse } from "next";

type HFResult = Array<{ label: string; score: number }>;

export const config = {
  api: { bodyParser: { sizeLimit: "10mb" } },
};

// ia primul sinonim din etichetele ImageNet (vin ca "foo, bar, baz")
function firstSynonym(s: string) {
  return s.split(",")[0].trim();
}
function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// Mapare EN -> RO pentru titluri prietenoase
function roLabel(label: string) {
  const L = label.toLowerCase();

  // audio
  if (L.includes("loudspeaker") || L.includes("speaker")) return "Boxe";
  if (L.includes("headphone") || L.includes("earphone") || L.includes("headset")) return "Căști";

  // mobil / electronice
  if (L.includes("laptop") || L.includes("notebook")) return "Laptop";
  if (L.includes("cellular telephone") || L.includes("mobile phone") || L.includes("smartphone")) return "Telefon";
  if (L.includes("television")) return "Televizor";
  if (L.includes("monitor")) return "Monitor";
  if (L.includes("camera")) return "Cameră foto";
  if (L.includes("printer")) return "Imprimantă";
  if (L.includes("keyboard")) return "Tastatură";
  if (L.includes("mouse")) return "Mouse";

  // casă / mobilier
  if (L.includes("bed") || L.includes("four-poster")) return "Pat";
  if (L.includes("sofa") || L.includes("couch") || L.includes("studio couch") || L.includes("futon")) return "Canapea";

  // fashion / sport / altele
  if (L.includes("t-shirt") || L.includes("jersey")) return "Tricou";
  if (L.includes("jean") || L.includes("denim")) return "Blugi";
  if (L.includes("bicycle") || L.includes("mountain bike")) return "Bicicletă";
  if (L.includes("book")) return "Carte";
  if (L.includes("shoe") || L.includes("sneaker") || L.includes("running shoe")) return "Pantofi";
  if (L.includes("backpack") || L.includes("rucksack")) return "Rucsac";

  return cap(firstSynonym(label));
}

async function downloadImageToBuffer(url: string, maxBytes = 10 * 1024 * 1024): Promise<Buffer> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Swaply/1.0 (+https://swaply.app)",
      Accept: "image/*;q=0.9,*/*;q=0.8",
    },
  });
  if (!res.ok) {
    throw new Error(`Download eșuat (${res.status}): ${await res.text()}`);
  }
  const len = res.headers.get("content-length");
  if (len && Number(len) > maxBytes) {
    throw new Error(`Imagine prea mare (${len} B). Limită: ${maxBytes} B.`);
  }
  const ab = await res.arrayBuffer();
  if (ab.byteLength > maxBytes) {
    throw new Error(`Imagine prea mare după descărcare (${ab.byteLength} B).`);
  }
  return Buffer.from(ab);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const token = process.env.HUGGINGFACE_API_TOKEN;
  if (!token) return res.status(500).json({ error: "Lipsește HUGGINGFACE_API_TOKEN" });

  try {
    const { imageBase64, imageUrl } = req.body as { imageBase64?: string; imageUrl?: string };
    let bytes: Buffer | null = null;

    if (imageUrl && /^https?:\/\//i.test(imageUrl)) {
      bytes = await downloadImageToBuffer(imageUrl);
    } else if (imageBase64) {
      const base64 = imageBase64.includes(",") ? imageBase64.split(",")[1] : imageBase64;
      bytes = Buffer.from(base64, "base64");
    } else {
      return res.status(400).json({ error: "Furnizează imageBase64 sau imageUrl" });
    }

    const hfRes = await fetch("https://api-inference.huggingface.co/models/microsoft/resnet-50", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/octet-stream",
        Accept: "application/json",
      },
      body: bytes,
    });

    if (!hfRes.ok) {
      const txt = await hfRes.text();
      return res.status(502).json({ error: `HuggingFace a răspuns cu eroare: ${txt}` });
    }

    const out = (await hfRes.json()) as HFResult;
    const top = Array.isArray(out) && out.length ? out[0] : null;
    if (!top) return res.status(200).json({ suggestion: null, raw: out });

    const suggestion = roLabel(top.label);
    return res.status(200).json({ suggestion, raw: out.slice(0, 5) });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || "Eroare internă la clasificare." });
  }
}
