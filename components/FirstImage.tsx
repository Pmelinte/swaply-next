// components/FirstImage.tsx
import RawSafeImage from "./RawSafeImage";
import type { ComponentProps } from "react";

/**
 * Alege prima sursă de imagine disponibilă din obiect (image_url / images etc.)
 * și o pasează către RawSafeImage, cu fallback la /no-image.png.
 */
type RawProps = ComponentProps<typeof RawSafeImage>;

type FirstImageProps = Omit<RawProps, "srcList" | "alt"> & {
  obj: any;
  alt?: string;
};

export default function FirstImage({ obj, alt, ...rest }: FirstImageProps) {
  const srcList: string[] = [];

  const add = (v?: unknown) => {
    if (!v) return;
    if (typeof v === "string") srcList.push(v);
    else if (Array.isArray(v)) (v as unknown[]).forEach(add);
  };

  // posibile câmpuri din DB / model
  add(obj?.image_url);
  add(obj?.imageUrl);
  add(obj?.first_image_url);
  add(obj?.thumbnail);
  add(obj?.images); // poate fi array de string-uri

  // fallback garantat
  srcList.push("/no-image.png");

  return (
    <RawSafeImage
      srcList={srcList.filter(Boolean)}
      alt={alt ?? obj?.title ?? "image"}
      {...rest}
    />
  );
}
