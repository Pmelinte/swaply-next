// components/FirstImage.tsx

"use client";

import { ImageProps } from "next/image";
import SafeImage from "@/components/SafeImage";
import { firstImage } from "@/lib/images";

type Props = Omit<ImageProps, "src"> & {
  /** Poți pasa fie un string[], fie un string simplu, fie null/undefined */
  srcList?: string[] | string | null;
  /** Pentru compat: dacă ai deja un singur string, îl poți trece aici */
  src?: string | null;
};

export default function FirstImage({
  srcList,
  src: srcSingle,
  alt = "",
  ...rest
}: Props) {
  const resolved = firstImage(srcList ?? srcSingle ?? null);
  return <SafeImage src={resolved} alt={alt} {...rest} />;
}
