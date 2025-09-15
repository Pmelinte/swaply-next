"use client";
import { CSSProperties, useEffect, useMemo, useRef, useState } from "react";

type Props = {
  src?: string | null;
  alt?: string;
  fallbackSrc?: string;
  className?: string;
  style?: CSSProperties;
};

const DEFAULT_FALLBACK = "/no-image.svg";
const isUrlLike = (s?: string | null) =>
  !!s && !!String(s).trim() && /^https?:\/\/|^\/|^data:image\//i.test(String(s).trim());

export default function ImgFallback({
  src,
  alt,
  fallbackSrc = DEFAULT_FALLBACK,
  className,
  style,
}: Props) {
  const initial = useMemo(() => (isUrlLike(src) ? String(src) : fallbackSrc), [src, fallbackSrc]);
  const [current, setCurrent] = useState<string>(initial);
  const imgRef = useRef<HTMLImageElement>(null);

  // când se schimbă src-ul calculat, resetează
  useEffect(() => {
    setCurrent(initial);
  }, [initial]);

  // IMPORTANT: dacă eroarea a avut loc înainte de a se atașa onError (SSR),
  // verificăm după montare dacă imaginea e "broken" (naturalWidth === 0)
  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;
    if (img.complete && (img.naturalWidth === 0 || img.naturalHeight === 0)) {
      if (current !== fallbackSrc) setCurrent(fallbackSrc);
    }
  }, [current, fallbackSrc]);

  return (
    <img
      ref={imgRef}
      src={current}
      alt={alt ?? "image"}
      loading="lazy"
      onError={() => {
        if (current !== fallbackSrc) setCurrent(fallbackSrc);
      }}
      className={className}
      style={{ display: "block", width: "100%", height: "100%", objectFit: "cover", ...style }}
    />
  );
}
