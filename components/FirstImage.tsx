// components/FirstImage.tsx
import RawSafeImage from "./RawSafeImage";
import type { ComponentProps } from "react";

/** Wrapper subțire: păstrează EXACT aceleași props ca RawSafeImage. */
type Props = ComponentProps<typeof RawSafeImage>;

export default function FirstImage(props: Props) {
  return <RawSafeImage {...props} />;
}
