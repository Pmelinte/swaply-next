import { getSupabaseServerAnon } from "@/lib/supabase/server";
import ObjectCard from "@/components/ObjectCard";

export const revalidate = 10;

export default async function HomePage() {
  const supabase = getSupabaseServerAnon();

  const { data, error } = await supabase
    .from("objects")
    .select("id,label,notes,category,score,created_at,image_url")
    .order("created_at", { ascending: false })
    .limit(24);

  if (error) {
    return (
      <div>
        <h2>Eroare la încărcarea obiectelor</h2>
        <pre className="small">{error.message}</pre>
        <p className="small">Verifică RLS/policies pentru <code>objects</code>: <b>select</b> public.</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div>
        <h2>Nu sunt (încă) obiecte</h2>
        <p className="small">Adaugă unul din pagina <code>/add</code> sau rulează seed.</p>
      </div>
    );
  }

  return (
    <div className="grid">
      {data.map((o) => (
        <ObjectCard key={o.id} object={o} />
      ))}
    </div>
  );
}
