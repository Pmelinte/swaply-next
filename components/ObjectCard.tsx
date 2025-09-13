// components/ObjectCard.tsx
import Link from "next/link";
import RawSafeImage from "@/components/RawSafeImage";

type AnyObj = Record<string, any>;

function looksLikeUrl(s: string) {
  const t = (s ?? "").toString().trim();
  if (!/^https?:\/\//i.test(t)) return false;
  if (/\.(jpg|jpeg|png|webp|gif|avif|svg)(\?|#|$)/i.test(t)) return true;
  if (/(cloudinary|unsplash|imgur|googleusercontent|gstatic|wikimedia|cdn|jysk\.com)/i.test(t)) return true;
  return false;
}

function collectImageCandidates(obj: AnyObj): string[] {
  const out: string[] = [];
  const classic = ["image_url","first_image_url","image","img","photo","picture","thumbnail","cover","url"];
  for (const k of classic) {
    const v = obj?.[k];
    if (typeof v === "string" && v) out.push(v);
    if (Array.isArray(v)) out.push(...(v.filter(Boolean) as string[]));
  }
  const images = obj?.images;
  if (Array.isArray(images)) out.push(...(images.filter(Boolean) as string[]));
  else if (typeof images === "string" && images.includes(",")) out.push(...images.split(",").map(s=>s.trim()).filter(Boolean));
  else if (typeof images === "string" && images) out.push(images);

  for (const [k, v] of Object.entries(obj || {})) {
    if (/(image|photo|img|thumb|picture|pic)/i.test(k)) {
      if (typeof v === "string" && v) out.push(v);
      if (Array.isArray(v)) out.push(...(v.filter(Boolean) as string[]));
    }
  }
  for (const v of Object.values(obj || {})) {
    if (typeof v === "string" && looksLikeUrl(v)) out.push(v);
    if (Array.isArray(v)) for (const s of v) if (typeof s === "string" && looksLikeUrl(s)) out.push(s);
  }
  return Array.from(new Set(out.filter(Boolean)));
}

export default function ObjectCard({ obj }: { obj: AnyObj }) {
  const srcList = collectImageCandidates(obj);
  const title = (obj?.title as string) ?? "Fara titlu";
  const category = (obj?.category as string) || (obj?.categorie as string) || "";
  const id = obj?.id ?? "#";

  const cardStyle: React.CSSProperties = {
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(15,18,28,0.6)",
    padding: 16,
  };
  const imgBoxStyle: React.CSSProperties = {
    width: "100%",
    height: 220,
    overflow: "hidden",
    borderRadius: 12,
    background: "#0b0f19",
    marginBottom: 12,
  };
  const titleStyle: React.CSSProperties = { fontSize: 18, fontWeight: 600, margin: 0, lineHeight: 1.2 };
  const catStyle: React.CSSProperties = { fontSize: 13, color: "#b3b7c0", marginTop: 4 };

  return (
    <Link href={`/objects/${id}`} style={{ textDecoration: "none", color: "inherit" }}>
      <div style={cardStyle}>
        <div style={imgBoxStyle}>
          <RawSafeImage
            srcList={srcList}
            alt={title}
            width={800}
            height={600}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        </div>
        <h3 style={titleStyle}>{title}</h3>
        {category ? <p style={catStyle}>Categorie: <span style={{ color: "#e5e7eb" }}>{category}</span></p> : null}
      </div>
    </Link>
  );
}
