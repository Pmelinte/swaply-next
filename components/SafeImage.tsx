// components/SafeImage.tsx
import RawSafeImage from "./RawSafeImage";
import type { ComponentProps } from "react";

/**
 * Wrapper simplu peste RawSafeImage – păstrăm aceeași semnătură de props.
 */
type Props = ComponentProps<typeof RawSafeImage>;

export default function SafeImage(props: Props) {
  return <RawSafeImage {...props} />;
}
