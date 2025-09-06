// components/ObjectCard.tsx

import Link from "next/link";
import FirstImage from "@/components/FirstImage";

export type ObjectItem = {
  id: string;
  title: string;
  images?: string[] | null;
  category?: string | null;
  price?: number | null;
  currency?: string | null; // ex: "RON" sau "EUR"
  owner?: {
    username?: string | null;
    displayName?: string | null;
  } | null;
  // Adaugă aici câmpuri suplimentare dacă le ai în modelul tău
};

type Props = {
  item: ObjectItem;
};

export default function ObjectCard({ item }: Props) {
  const href = `/object/${item.id}`;
  const priceLabel =
    item?.price != null
      ? `${item.price}${item.currency ? " " + item.currency : ""}`
      : null;

  return (
    <Link
      href={href}
      className="group block overflow-hidden rounded-xl border border-gray-200 hover:shadow-md transition-shadow bg-white"
    >
      <div className="relative aspect-square w-full bg-gray-50">
        <FirstImage
          srcList={item.images ?? []}
          alt={item.title ?? ""}
          fill
          className="object-cover transition-transform group-hover:scale-[1.02]"
          sizes="(max-width: 768px) 100vw, 33vw"
          priority={false}
        />
      </div>

      <div className="p-3 sm:p-4">
        <h3 className="line-clamp-1 text-sm sm:text-base font-medium text-gray-900">
          {item.title}
        </h3>

        <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
          {item.category ? (
            <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5">
              {item.category}
            </span>
          ) : null}

          {item?.owner?.username ? (
            <span className="truncate">
              de @{item.owner.username}
            </span>
          ) : null}
        </div>

        <div className="mt-2 flex items-center justify-between">
          {priceLabel ? (
            <span className="text-sm font-semibold text-gray-900">
              {priceLabel}
            </span>
          ) : (
            <span className="text-sm text-gray-500">Schimb</span>
          )}

          <span className="text-xs text-blue-600 group-hover:underline">
            Vezi detalii
          </span>
        </div>
      </div>
    </Link>
  );
}
