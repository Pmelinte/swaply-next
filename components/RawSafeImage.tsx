// components/RawSafeImage.tsx
import React, { useEffect, useMemo, useState } from "react";

type Props = {
  srcList?: string[];
  alt?: string;
  width?: number | string;
  height?: number | string;
  className?: string;
  style?: React.CSSProperties;
};

const FALLBACK = "/no-image.png";

// Acceptă doar URL-uri http(s) valide și respinge TLD-uri problematice (ex. .invalid)
function isProbablyValidImageUrl(url: string): boolean {
  try {
    const u = new URL(url);
    if (!/^https?:$/.test(u.protocol)) return false;
    const tld = (u.hostname.split(".").pop() || "").toLowerCase();
    if (/(invalid|example|test|localhost)$/i.test(tld)) return false;
    return true;
  } catch {
    return false;
  }
}

export default function RawSafeImage({
  srcList = [],
  alt = "",
  width,
  height,
  className,
  style,
}: Props) {
  // 1) filtrăm agresiv URL-urile ciudate
  const candidates = useMemo(
    () =>
      Array.from(
        new Set(
          (srcList || [])
            .filter((s): s is string => !!s && typeof s === "string")
            .map((s) => s.trim())
            .filter(isProbablyValidImageUrl)
        )
      ),
    [srcList]
  );

  // 2) fallback logic
  const [index, setIndex] = useState(0);
  const [useFallback, setUseFallback] = useState(candidates.length === 0);

  useEffect(() => {
    setIndex(0);
    setUseFallback(candidates.length === 0);
  }, [candidates.length]);

  const handleError = () => {
    if (!useFallback && index < candidates.length - 1) {
      setIndex((i) => i + 1); // încearcă următorul candidat valid
    } else {
      setUseFallback(true); // ultimă plasă de siguranță -> fallback local
    }
  };

  const currentSrc = useFallback ? FALLBACK : candidates[index] ?? FALLBACK;
  const isFallback = useFallback || currentSrc === FALLBACK;

  const imgStyle: React.CSSProperties = isFallback
    ? {
        // FALLBACK: arată întreaga imagine, centrată (fără tăiere)
        maxWidth: "100%",
        maxHeight: "100%",
        width: "auto",
        height: "auto",
        objectFit: "contain",
        objectPosition: "center",
        display: "block",
        background: "#0b0f19",
        ...style,
      }
    : {
        // IMAGINE VALIDĂ: umple cardul frumos
        width: "100%",
        height: "100%",
        objectFit: "cover",
        objectPosition: "center",
        display: "block",
        background: "#0b0f19",
        ...style,
      };

  return (
    <img
      src={currentSrc}
      alt={alt}
      width={width}
      height={height}
      onError={handleError}
      style={imgStyle}
      className={className}
      loading="lazy"
      decoding="async"
    />
  );
}
