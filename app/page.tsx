// app/page.tsx
import { createClient } from "@/lib/supabase/server";

export const revalidate = 10;

export default async function Home() {
  const supabase = await createClient();

  const { data: objects, error } = await supabase
    .from("objects")
    .select("id,label,title,description")
    .limit(12);

  return (
    <main className="p-4 space-y-4">
      <h1 className="text-2xl font-semibold">Swaply</h1>

      {error && (
        <p className="text-red-600">
          Eroare la încărcarea obiectelor: {error.message}
        </p>
      )}

      <ul className="list-disc pl-6">
        {(objects ?? []).map((o: any) => (
          <li key={o.id}>{o.label ?? o.title ?? `Obiect ${o.id}`}</li>
        ))}
      </ul>
    </main>
  );
}
