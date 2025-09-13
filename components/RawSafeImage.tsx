// components/RawSafeImage.tsx

"use client";

import React, { useEffect, useState } from "react";
import { PLACEHOLDER_IMAGE } from "@/lib/images";

type Props = {
  src?: string | null;
  alt?: string;
  className?: string;
  /** Dacă vrei comportament de `fill`, pune true și asigură-te că părintele are `relative` + dimensiuni. */
  fill?: boolean;
  width?: number;
  height?: number;
  style?: React.CSSProperties;
};

export default function RawSafeImage({
  src,
  alt = "",
  className = "",
  fill = false,
  width,
  height,
  style,
}: Props) {
  const normalize = (s?: string | null) =>
    s && typeof s === "string" && s.trim() ? s.trim() : PLACEHOLDER_IMAGE;

  const [safeSrc, setSafeSrc] = useState<string>(normalize(src));

  useEffect(() => {
    setSafeSrc(normalize(src));
  }, [src]);

  const combinedClass =
    (fill ? "absolute inset-0 w-full h-full object-cover " : "") +
    (className || "");

  return (
    <img
      src={safeSrc}
      alt={alt}
      className={combinedClass}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      style={style}
      loading="lazy"
      onError={() => setSafeSrc(PLACEHOLDER_IMAGE)}
    />
  );
}
