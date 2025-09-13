// components/SafeImage.tsx

"use client";

import Image, { ImageProps } from "next/image";
import { useEffect, useState } from "react";
import { PLACEHOLDER_IMAGE } from "@/lib/images";

type Props = Omit<ImageProps, "src"> & {
  src: string | null | undefined;
};

export default function SafeImage({ src, alt = "", ...rest }: Props) {
  const normalize = (s?: string | null) =>
    s && typeof s === "string" && s.trim() ? s.trim() : PLACEHOLDER_IMAGE;

  const [safeSrc, setSafeSrc] = useState<string>(normalize(src));

  // Actualizează când se schimbă prop-ul
  useEffect(() => {
    setSafeSrc(normalize(src));
  }, [src]);

  return (
    <Image
      {...rest}
      src={safeSrc}
      alt={alt}
      unoptimized
      onError={() => setSafeSrc(PLACEHOLDER_IMAGE)}
    />
  );
}
