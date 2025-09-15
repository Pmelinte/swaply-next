type Obj = {
  id: string;
  label: string | null;
  notes: string | null;
  category: string | null;
  score: number | null;
  created_at: string | null;
  image_url?: string | null;
};

export default function ObjectCard({ object }: { object: Obj }) {
  const title = object.label ?? "Obiect fără nume";
  const notes = object.notes ?? "—";
  const cat = object.category ?? "fără categorie";
  const score = object.score ?? 0;

  const src =
    object.image_url && object.image_url.length > 0
      ? object.image_url
      : `https://placehold.co/600x400?text=${encodeURIComponent(title)}`;

  return (
    <article className="card">
      <img alt={title} src={src} />
      <div className="pad">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 8 }}>
          <h3 style={{ margin: 0, fontSize: 16 }}>{title}</h3>
          <span className="small">score {score}</span>
        </div>
        <p className="small" style={{ marginTop: 8 }}>{notes}</p>
        <div className="kv">
          <span>categorie: {cat}</span>
        </div>
      </div>
    </article>
  );
}
