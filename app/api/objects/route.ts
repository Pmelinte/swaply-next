import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export async function GET() {
  const items = [
    { id: "1", title: "Fără imagine deloc" },
    { id: "2", title: "URL local inexistent", image_url: "/does-not-exist.jpg" },
    { id: "3", title: "Array images gol/invalid", images: [{ url: "" }] },
    { id: "4", title: "Placeholder explicit", image_url: "/no-image.svg" }
  ];
  return NextResponse.json(items, { headers: { "Cache-Control": "no-store" } });
}