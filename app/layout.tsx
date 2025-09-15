export const metadata = {
  title: "Swaply",
  description: "App Router root layout",
};

function Nav() {
  return (
    <nav className="p-3 border-b flex gap-3 text-sm">
      <a href="/">Acasă</a>
      <a href="/health">Health</a>
      <a href="/doctor">Doctor</a>
      <span className="opacity-40">|</span>
      <a href="/my-objects">Obiectele mele</a>
      <span className="opacity-40">|</span>
      <a href="/signup">Signup</a>
      <a href="/login">Login</a>
      <a href="/me">Me</a>
      <a href="/logout">Logout</a>
    </nav>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro" suppressHydrationWarning>
      <body className="min-h-screen" suppressHydrationWarning>
        <Nav />
        {children}
      </body>
    </html>
  );
}
