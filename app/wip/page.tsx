"use client";

import { usePathname } from "next/navigation";

export default function WipPage() {
  const path = usePathname();
  return (
    <main className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-md rounded-2xl border p-6 text-center space-y-3">
        <h1 className="text-2xl font-bold">Pagina în lucru</h1>
        <p className="text-gray-600">
          Ruta <code className="px-1 py-0.5 rounded bg-gray-100">{path}</code> nu este finalizată încă.
        </p>
        <div className="flex gap-2 justify-center">
          <a href="/" className="rounded-xl border px-4 py-2">Acasă</a>
          <a href="/doctor" className="rounded-xl border px-4 py-2">Doctor</a>
          <a href="/health" className="rounded-xl border px-4 py-2">Health</a>
        </div>
        <p className="text-xs text-gray-500">
          Aceasta este o pagină placeholder temporară pentru rutele neterminate.
        </p>
      </div>
    </main>
  );
}
