// components/FirstImage.tsx
import RawSafeImage from "./RawSafeImage";
import React from "react";

/**
 * Wrapper subțire peste RawSafeImage.
 * Nu mai importăm un tip inexistent; derivăm tipul din componentă.
 */
type Props = React.ComponentProps<typeof RawSafeImage>;

export default function FirstImage(props: Props) {
  // RawSafeImage deja alege primul URL valid/fallback,
  // deci doar pasăm prop-urile mai departe.
  return <RawSafeImage {...props} />;
}
