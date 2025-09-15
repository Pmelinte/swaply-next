import { publicSchema, serverSchema } from "./schema";

// Validare pe server la runtime (în API routes, server components).
const serverParsed = serverSchema.safeParse(process.env);
if (!serverParsed.success) {
  console.error("❌ ENV server invalid:", serverParsed.error.flatten().fieldErrors);
  throw new Error("ENV server invalid. Verifică variabilele din .env.local");
}

const publicParsed = publicSchema.safeParse(process.env);
if (!publicParsed.success) {
  console.error("❌ ENV public invalid:", publicParsed.error.flatten().fieldErrors);
  throw new Error("ENV public invalid. Verifică variabilele NEXT_PUBLIC_*");
}

export const env = {
  ...serverParsed.data,
  ...publicParsed.data,
};
