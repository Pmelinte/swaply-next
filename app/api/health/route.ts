// app/api/health/route.ts
import { NextResponse } from "next/server";
import { validateEnv } from "../../../lib/env";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const startedAt = Date.now();

  const env = validateEnv();
  const checks: Array<Record<string, any>> = [];

  if (!env.ok) {
    return NextResponse.json(
      {
        ok: false,
        reason: "ENV_INVALID",
        missing: env.errors,
        node: process.version,
        uptime_s: Number(process.uptime().toFixed(2)),
      },
      { status: 500 }
    );
  }

  // Cloudinary: doar verificăm prezența variabilelor
  checks.push({
    name: "cloudinary_env",
    ok: Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET),
  });

  // Supabase: încercăm o interogare HEAD cu count pe tabela `objects` (dacă nu există, raportează eroarea)
  let supabaseOk = false;
  let supabaseLatencyMs: number | null = null;
  let supabaseCount: number | null = null;
  let supabaseError: string | null = null;

  try {
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL as string,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
      { auth: { persistSession: false } }
    );

    const t1 = Date.now();
    const { error, count } = await sb
      .from("objects")
      .select("id", { count: "exact", head: true });
    supabaseLatencyMs = Date.now() - t1;

    if (error) {
      supabaseError = `${(error as any).code ?? "ERR"}: ${error.message}`;
    } else {
      supabaseOk = true;
      if (typeof count === "number") supabaseCount = count;
    }
  } catch (e: any) {
    supabaseError = e?.message ?? String(e);
  }

  checks.push({
    name: "supabase",
    ok: supabaseOk,
    latency_ms: supabaseLatencyMs,
    count: supabaseCount,
    error: supabaseError,
  });

  const allOk = checks.every(c => c.ok !== false);

  return NextResponse.json(
    {
      ok: allOk,
      node: process.version,
      uptime_s: Number(process.uptime().toFixed(2)),
      mode: process.env.NODE_ENV,
      platform: process.env.VERCEL ? "vercel" : "local",
      took_ms: Date.now() - startedAt,
      checks,
    },
    { status: allOk ? 200 : 207 } // 207 = partial OK (de ex. env ok, dar supabase/objects indisponibil)
  );
}
