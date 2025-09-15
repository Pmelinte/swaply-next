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
    <nav style={{ padding: "8px", borderBottom: "1px solid #555" }}>
      <Link href="/">Acasă</Link>
      <span> | </span>
      <Link href="/health">Health</Link>
      <span> | </span>
      <Link href="/doctor">Doctor</Link>
      <span> | </span>
      <Link href="/my-objects">Obiectele mele</Link>
      <span> | </span>

      {!user ? (
        <>
          <Link href="/signup">Signup</Link>
          <span> | </span>
          <Link href="/login">Login</Link>
        </>
      ) : (
        <>
          <Link href="/me">Me</Link>
          <span> | </span>
          <LogoutButton />
        </>
      )}
    </nav>
  );
}
