import RawSafeImage, { type Props } from "./RawSafeImage";

/**
 * Wrapper simplu peste RawSafeImage – ținem aceeași semnătură de props.
 * Dacă vrei să inserezi aici transformări Cloudinary pe viitor, o poți face
 * înainte de a trimite `srcList` mai departe.
 */
export default function SafeImage(props: Props) {
  return <RawSafeImage {...props} />;
}
