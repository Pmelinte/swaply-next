// components/Header.tsx
import Link from "next/link";
import LogoutButton from "./LogoutButton";
import { createClient } from "../lib/supabase/server";

export default async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <nav className="flex flex-wrap gap-4 p-4 border-b">
      <Link href="/">Acasă</Link>
      <Link href="/health">Health</Link>
      <Link href="/doctor">Doctor</Link>
      <Link href="/my-objects">Obiectele mele</Link>

      {!user ? (
        <>
          <Link href="/signup">Signup</Link>
          <Link href="/login">Login</Link>
        </>
      ) : (
        <>
          <Link href="/me">Me</Link>
          <LogoutButton />
        </>
      )}
    </nav>
  );
}
