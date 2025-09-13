import Image from "next/image";
import { useMemo, useState, useEffect } from "react";

export type Props = {
  /** Listează candidații în ordinea preferinței (ex: [cloudinaryUrl, cdnUrl, localUrl]) */
  srcList: string[];
  alt: string;
  /** Dacă e true, folosește Next/Image cu `fill`. Altfel width+height. */
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  /** IMPORTANT: permite Next/Image să calculeze corect layout-ul responsive. */
  sizes?: string;
  /** Poți marca anumite imagini ca prioritare (fold-ul inițial). */
  priority?: boolean;
  /** Calitatea pentru encoder (jpeg/webp/avif). */
  quality?: number;
};

export default function RawSafeImage(props: Props) {
  const {
    srcList,
    alt,
    fill = false,
    width,
    height,
    className,
    sizes,
    priority = false,
    quality,
  } = props;

  const candidates = useMemo(() => {
  const uniq = Array.from(new Set((srcList || []).filter(Boolean)));
  // fallback-uri locale (SVG + PNG)
  if (!uniq.includes("/no-image.svg")) uniq.push("/no-image.svg");
  if (!uniq.includes("/no-image.png")) uniq.push("/no-image.png");
  return uniq;
}, [srcList]);

  const [idx, setIdx] = useState(0);

  // dacă se schimbă lista, începe iar de la primul
  useEffect(() => {
    setIdx(0);
  }, [candidates.join("|")]);

  const handleError = () => {
    // încearcă următorul candidat până la fallback
    setIdx((i) => Math.min(i + 1, candidates.length - 1));
  };

  // atenție: pentru `fill`, containerul părinte trebuie să aibă position: relative
  return (
    <div className={fill ? "relative h-full w-full" : undefined}>
      <Image
        src={candidates[idx]}
        alt={alt || "image"}
        {...(fill
          ? { fill: true }
          : {
              width: width ?? 640,
              height: height ?? 480,
            })}
        className={className}
        sizes={sizes}
        priority={priority}
        quality={quality}
        onError={handleError}
      />
    </div>
  );
}
