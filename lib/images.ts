// lib/images.ts

/**
 * Returnează primul URL valid dintr-o listă (sau dintr-un string),
 * altfel fallback la placeholderul global.
 *
 * Acceptă: string[] | string | null | undefined
 * Curăță spațiile și ignoră valori goale/"null"/"undefined".
 */
export const PLACEHOLDER_IMAGE = "/no-image.png";

export function firstImage(input?: string[] | string | null): string {
  const list: string[] = Array.isArray(input)
    ? input
    : typeof input === "string"
    ? [input]
    : [];

  for (const raw of list) {
    const src = (raw ?? "").toString().trim();
    if (!src) continue;

    const lowered = src.toLowerCase();
    if (lowered === "null" || lowered === "undefined" || lowered === "#") continue;

    // Acceptăm orice: http(s), data:, relativ (/...), //cdn..., cloudinary etc.
    return src;
  }

  return PLACEHOLDER_IMAGE;
}

/**
 * Util pentru randare condiționată (ex. ascunde skeleton-ul dacă avem imagine).
 */
export function hasImage(input?: string[] | string | null): boolean {
  return firstImage(input) !== PLACEHOLDER_IMAGE;
}
