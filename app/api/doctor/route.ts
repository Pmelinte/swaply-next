import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

export const runtime = "nodejs";

function exists(relativePath: string) {
  const full = path.join(process.cwd(), relativePath);
  return fs.existsSync(full);
}

function existsAny(paths: string[]) {
  return paths.some((p) => exists(p));
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const deep = url.searchParams.get("deep") === "1";

  // Detectăm rădăcina App Router
  const hasApp = existsAny(["app/layout.tsx", "app/page.tsx"]);
  const hasSrcApp = existsAny(["src/app/layout.tsx", "src/app/page.tsx"]);
  const appRoot = hasApp ? "app" : hasSrcApp ? "src/app" : null;

  // Verificări fișiere/structură
  const checks: Record<string, any> = {
    app_root: { ok: !!appRoot, value: appRoot, hint: "Trebuie să existe `app/` sau `src/app/` cu layout.tsx." },
    root_layout: {
      ok: existsAny(["app/layout.tsx", "src/app/layout.tsx"]),
      where: ["app/layout.tsx", "src/app/layout.tsx"].find(exists) ?? null,
      hint: "Adaugă un Root Layout minimal (layout.tsx).",
    },
    home_page: {
      ok: existsAny(["app/page.tsx", "src/app/page.tsx"]),
      where: ["app/page.tsx", "src/app/page.tsx"].find(exists) ?? null,
      hint: "Pagina / (page.tsx) este utilă pentru confirmare rapidă.",
    },
    health_page: {
      ok: existsAny(["app/health/page.tsx", "src/app/health/page.tsx"]),
      where: ["app/health/page.tsx", "src/app/health/page.tsx"].find(exists) ?? null,
    },
    health_api: {
      ok: existsAny(["app/api/health/route.ts", "src/app/api/health/route.ts"]),
      where: ["app/api/health/route.ts", "src/app/api/health/route.ts"].find(exists) ?? null,
    },
    signup_page: {
      ok: existsAny(["app/signup/page.tsx", "src/app/signup/page.tsx"]),
      where: ["app/signup/page.tsx", "src/app/signup/page.tsx"].find(exists) ?? null,
    },
    env_schema: {
      ok: exists("lib/env/schema.ts"),
      where: exists("lib/env/schema.ts") ? "lib/env/schema.ts" : null,
    },
    env_server: {
      ok: exists("lib/env/server.ts"),
      where: exists("lib/env/server.ts") ? "lib/env/server.ts" : null,
    },
    env_client: {
      ok: exists("lib/env/client.ts"),
      where: exists("lib/env/client.ts") ? "lib/env/client.ts" : null,
    },
    plopfile: {
      ok: exists("plopfile.cjs"),
      where: exists("plopfile.cjs") ? "plopfile.cjs" : null,
    },
    plop_templates: {
      ok: exists("plop-templates") && fs.lstatSync(path.join(process.cwd(), "plop-templates")).isDirectory(),
      where: exists("plop-templates") ? "plop-templates/" : null,
    },
  };

  // Verificări ENV publice
  const envChecks = {
    NEXT_PUBLIC_SITE_URL: !!process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: !!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET: !!process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
  };

  checks.env_public = {
    ok: Object.values(envChecks).every(Boolean),
    vars: envChecks,
    hint: "Completează .env.local conform .env.local.example",
  };

  // (opțional) ping către Supabase
  let supabaseOk: boolean | "skipped" = "skipped";
  let supabaseMs: number | null = null;
  if (deep && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const t0 = Date.now();
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/settings`, {
        headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY },
        cache: "no-store",
      });
      supabaseOk = res.ok;
    } catch {
      supabaseOk = false;
    } finally {
      supabaseMs = Date.now() - t0;
    }
  }

  checks.supabase_connectivity = {
    ok: supabaseOk === true || supabaseOk === "skipped",
    mode: deep ? "deep" : "shallow",
    result: supabaseOk,
    latency_ms: supabaseMs,
  };

  // Agregare status + recomandări
  const failures = Object.entries(checks).filter(([, v]) => !v.ok);
  const suggestions = failures
    .map(([k, v]) => v.hint ? `· ${k}: ${v.hint}` : null)
    .filter(Boolean) as string[];

  const payload = {
    status: failures.length === 0 ? "ok" : "issues",
    summary: {
      total_checks: Object.keys(checks).length,
      failures: failures.map(([k]) => k),
    },
    checks,
    meta: {
      timestamp: new Date().toISOString(),
      appRootDetected: appRoot,
      node_env: process.env.NODE_ENV,
      vercel_region: process.env.VERCEL_REGION ?? null,
    },
    suggestions,
  };

  return NextResponse.json(payload, { status: 200 });
}
