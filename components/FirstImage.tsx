// components/FirstImage.tsx

"use client";

import RawSafeImage from "@/components/RawSafeImage";
import { firstImage } from "@/lib/images";

type Props = {
  /** Poți pasa fie un string[], fie un string simplu, fie null/undefined */
  srcList?: string[] | string | null;
  /** Pentru compat: dacă ai deja un singur string, îl poți trece aici */
  src?: string | null;
  alt?: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  style?: React.CSSProperties;
};

export default function FirstImage({
  srcList,
  src: srcSingle,
  alt = "",
  className,
  fill,
  width,
  height,
  style,
}: Props) {
  const resolved = firstImage(srcList ?? srcSingle ?? null);
  return (
    <RawSafeImage
      src={resolved}
      alt={alt}
      className={className}
      fill={fill}
      width={width}
      height={height}
      style={style}
    />
  );
}
