"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

type User = {
  email: string | undefined;
  user_metadata: { full_name?: string; avatar_url?: string };
};

const NAV_LINKS = [
  { href: "/booking", label: "Booking" },
  { href: "/scores", label: "Scores" },
  { href: "/gallery", label: "Gallery" },
];

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user as User ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user as User ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`
      }
    });
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <>
      {/* Hamburger button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed top-4 left-4 z-50 w-10 h-10 flex flex-col items-center justify-center gap-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-sm"
      >
        <span className="w-5 h-px bg-zinc-700 dark:bg-zinc-300" />
        <span className="w-5 h-px bg-zinc-700 dark:bg-zinc-300" />
        <span className="w-5 h-px bg-zinc-700 dark:bg-zinc-300" />
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-50"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-zinc-900 z-50 shadow-xl transform transition-transform duration-300 flex flex-col
        ${open ? "translate-x-0" : "-translate-x-full"}`}>

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-100 dark:border-zinc-800">
          <Link href="/" onClick={() => setOpen(false)}>
            <span className="text-sm font-medium tracking-widest text-zinc-800 dark:text-zinc-100">
              SPORTS VENUE
            </span>
          </Link>
          <button
            onClick={() => setOpen(false)}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-xl"
          >
            ✕
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex flex-col gap-1 p-4 flex-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors
                ${pathname === link.href
                  ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100"
                }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* User section at bottom */}
        <div className="p-4 border-t border-zinc-100 dark:border-zinc-800">
          {user ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                {user.user_metadata.avatar_url && (
                  <img src={user.user_metadata.avatar_url} className="w-8 h-8 rounded-full" alt="" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100 truncate">
                    {user.user_metadata.full_name}
                  </p>
                  <p className="text-xs text-zinc-400 truncate">{user.email}</p>
                </div>
              </div>
              <button
                onClick={signOut}
                className="w-full py-2 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 border border-zinc-200 dark:border-zinc-700 rounded-lg transition-colors"
              >
                Sign out
              </button>
            </div>
          ) : (
            <button
              onClick={signInWithGoogle}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
            </button>
          )}
        </div>

      </div>
    </>
  );
}