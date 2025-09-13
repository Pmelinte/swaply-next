import RawSafeImage, { type Props } from "./RawSafeImage";

/**
 * În multe proiecte `FirstImage` alegea doar primul URL.
 * Ca să nu stricăm apelurile existente, păstrăm aceeași interfață ca SafeImage.
 * Dacă în codul tău `FirstImage` primește altă formă de date, poți continua să-i
 * trimiți `srcList` exact ca în ObjectCard.
 */
export default function FirstImage(props: Props) {
  return <RawSafeImage {...props} />;
}
