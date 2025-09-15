"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase/client";

export default function AddQuickButton() {
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function addOne() {
    if (busy) return;
    setBusy(true);
    try {
      const supabase = getSupabaseBrowser();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = "/login";
        return;
      }

      const baseTitle = "Obiectul meu nou";
      const payload = {
        // Pentru scheme care cer `title` NOT NULL
        title: baseTitle,
        // Pentru UI-ul nostru care folosește `label`
        label: baseTitle,
        notes: "Creat rapid din UI",
        category: "altele",
        score: 50,
        user_id: user.id
      };

      const { error } = await supabase.from("objects").insert(payload);
      if (error) {
        alert("Eroare la inserare: " + error.message);
        return;
      }

      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <button className="btn" onClick={addOne} disabled={busy}>
      {busy ? "Se adaugă..." : "Adaugă rapid"}
    </button>
  );
}
