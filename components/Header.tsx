import Link from "next/link";
import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import LogoutButton from "./LogoutButton";

export default async function Header() {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { user }
  } = await supabase.auth.getUser();

  return (
    <header className="header">
      <Link href="/" className="brand">
        <span className="brand-badge">Swaply</span>
        <span>schimb de obiecte</span>
      </Link>

      {user ? (
        <div className="hstack">
          <Link href="/add" className="btn">Add</Link>
          <Link href="/my-objects" className="btn">My Objects</Link>
          <span className="small">{user.email}</span>
          <LogoutButton />
        </div>
      ) : (
        <div className="hstack">
          <Link href="/login" className="btn">Login</Link>
        </div>
      )}
    </header>
  );
}
