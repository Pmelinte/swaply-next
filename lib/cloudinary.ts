export function transformCloudinary(
  url?: string,
  width = 600
): string | undefined {
  if (!url) return undefined;

  const marker = "/upload/";

  // Dacă nu e un URL Cloudinary clasic, îl lăsăm neschimbat
  if (!url.includes(marker)) return url;

  // Evită dublarea transformărilor (dacă deja are /c_ în URL)
  if (url.includes("/upload/c_")) return url;

  // Aplică transformarea (crop fill, lățime, quality auto, format auto)
  return url.replace(
    marker,
    `/upload/c_fill,w_${width},q_auto,f_auto/`
  );
}
