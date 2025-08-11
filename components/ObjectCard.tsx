import Link from 'next/link';
import { transformCloudinary } from '@/lib/cloudinary';

type Props = {
  id: number;
  title: string;
  image_url?: string | null;
  description?: string | null;
  owner?: string | null;
};

export default function ObjectCard({ id, title, image_url, description, owner }: Props) {
  const img = transformCloudinary(image_url || undefined, 400);
  return (
    <div className="card">
      {img && <img src={img} alt={title} style={{width:'100%', height: 160, objectFit:'cover', borderRadius: 12, marginBottom: 8}}/>}
      <h3 style={{marginBottom: 4}}>{title}</h3>
      {owner && <div className="small" style={{marginBottom: 6}}>by {owner}</div>}
      {description && <p className="small" style={{minHeight: 40}}>{description}</p>}
      <Link href={`/objects/${id}`}><button>View</button></Link>
    </div>
  );
}
