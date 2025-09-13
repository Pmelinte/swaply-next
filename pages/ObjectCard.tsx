// components/ObjectCard.tsx
import Link from "next/link";
import FirstImage from "@/components/FirstImage";

export type ObjectCardProps = {
  obj: Record<string, any>; // schema poate varia; îl tratăm generic
};

function looksLikeUrl(s: string) {
  const t = (s ?? "").toString().trim();
  if (!/^https?:\/\//i.test(t)) return false;
  if (/\.(jpg|jpeg|png|webp|gif|avif|svg)(\?|#|$)/i.test(t)) return true;
  if (/(cloudinary|unsplash|imgur|googleusercontent|gstatic|wikimedia|cdn)/i.test(t))
    return true;
  return false;
}

function collectImageCandidates(obj: Record<string, any>): string[] {
  const out: string[] = [];

  // 1) câmpuri „clasice”
  const classicKeys = [
    "first_image_url",
    "image_url",
    "image",
    "img",
    "photo",
    "picture",
    "thumbnail",
    "cover",
    "url",
  ];
  for (const k of classicKeys) {
    const v = obj?.[k];
    if (typeof v === "string" && v) out.push(v);
    if (Array.isArray(v)) out.push(...(v.filter(Boolean) as string[]));
  }

  // 2) câmpul `images` (string[] sau string cu virgule)
  const images = obj?.images;
  if (Array.isArray(images)) out.push(...(images.filter(Boolean) as string[]));
  else if (typeof images === "string" && images.includes(",")) {
    out.push(...images.split(",").map((s: string) => s.trim()).filter(Boolean));
  } else if (typeof images === "string" && images) {
    out.push(images);
  }

  // 3) alte câmpuri care „sună” a imagine după nume
  for (const [k, v] of Object.entries(obj || {})) {
    if (/(image|photo|img|thumb|picture|pic)/i.test(k)) {
      if (typeof v === "string" && v) out.push(v);
      if (Array.isArray(v)) out.push(...(v.filter(Boolean) as string[]));
    }
  }

  // 4) orice string din obiect care arată a URL de imagine
  for (const v of Object.values(obj || {})) {
    if (typeof v === "string" && looksLikeUrl(v)) out.push(v);
    if (Array.isArray(v)) {
      for (const s of v) {
        if (typeof s === "string" && looksLikeUrl(s)) out.push(s);
      }
    }
  }

  return Array.from(new Set(out.filter(Boolean)));
}

export default function ObjectCard({ obj }: ObjectCardProps) {
  const srcList = collectImageCandidates(obj);
  const title = (obj?.title as string) ?? "Fără titlu";
  const category =
    (obj?.category as string) || (obj?.categorie as string) || null;
  const id = obj?.id ?? "#";

  return (
    <Link href={`/objects/${id}`} className="group block">
      <div className="rounded-2xl border border-white/5 bg-zinc-900/30 p-4 transition hover:border-white/10">
        <div className="relative w-full aspect-[4/3] overflow-hidden rounded-2xl bg-zinc-900">
          <FirstImage
            srcList={srcList}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            sizes="(max-width: 768px) 100vw, 33vw"
            priority={false}
          />
        </div>

        <div className="mt-3 space-y-1">
          <h3 className="text-lg font-semibold leading-tight">{title}</h3>
          {category && (
            <p className="text-sm text-zinc-400">
              Categorie: <span className="text-zinc-200">{category}</span>
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
