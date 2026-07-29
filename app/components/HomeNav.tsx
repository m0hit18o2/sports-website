"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { isAdmin } from "@/lib/admins";
import { supabase } from "@/lib/supabase";

export const BRAND_ORANGE = "#F2810D";

type User = {
  email: string | undefined;
  user_metadata: { full_name?: string; avatar_url?: string };
};

const NAV_LINKS = [
  { href: "/", label: "Home", icon: HomeIcon },
  { href: "/section-wars", label: "Section Wars", icon: ShieldIcon },
  { href: "/gallery", label: "Gallery", icon: ImageIcon },
  { href: "/contact", label: "Contact Us", icon: MailIcon },
];

export default function HomeNav() {
  const [user, setUser] = useState<User | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser((data.session?.user as User) ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser((session?.user as User) ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/` },
    });
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  const links = isAdmin(user?.email)
    ? [...NAV_LINKS, { href: "/admin", label: "Admin", icon: GearIcon }]
    : NAV_LINKS;

  return (
    <header className="bg-black">
      {/* Desktop */}
      <div className="hidden md:flex items-center justify-between px-10 py-5 max-w-7xl mx-auto">
        <Logo />
        <nav className="flex items-center gap-8">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs font-semibold tracking-[0.15em] uppercase pb-1 border-b-2 border-transparent transition-colors text-white/70 hover:text-white"
                style={active ? { color: BRAND_ORANGE, borderColor: BRAND_ORANGE } : undefined}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <AuthAction user={user} onSignIn={signInWithGoogle} onSignOut={signOut} />
      </div>

      {/* Mobile */}
      <div className="md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <Logo compact />
          <AuthAction user={user} onSignIn={signInWithGoogle} onSignOut={signOut} compact />
        </div>
        <nav className="flex border-t border-white/10">
          {links.map((link) => {
            const active = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex-1 flex flex-col items-center gap-1 py-2.5 text-[10px] font-semibold tracking-wider uppercase border-b-2 border-transparent text-white/50"
                style={active ? { color: BRAND_ORANGE, borderColor: BRAND_ORANGE } : undefined}
              >
                <Icon />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

function Logo({ compact }: { compact?: boolean }) {
  const size = compact ? 34 : 42;
  return (
    <Link href="/" className="flex items-center gap-3">
      <div
        className="rounded-full bg-zinc-900 bg-center bg-cover shrink-0 ring-1 ring-white/10"
        style={{ width: size, height: size, backgroundImage: "url('/iim-logo-white.png')" }}
      />
      <div className="leading-tight">
        <p className="text-[11px] sm:text-xs font-bold tracking-[0.1em] text-white">IIM CALCUTTA</p>
        <p className="text-[11px] sm:text-xs font-bold tracking-[0.1em]" style={{ color: BRAND_ORANGE }}>SPORTS</p>
      </div>
    </Link>
  );
}

function AuthAction({
  user, onSignIn, onSignOut,
}: {
  user: User | null;
  onSignIn: () => void;
  onSignOut: () => void;
  compact?: boolean;
}) {
  return (
    <button
      onClick={user ? onSignOut : onSignIn}
      className="flex items-center gap-2 px-4 py-2 rounded-full border text-[11px] font-semibold tracking-wider uppercase text-white hover:bg-white/5 transition-colors"
      style={{ borderColor: BRAND_ORANGE }}
    >
      {user ? "Sign Out" : "Sign In"}
    </button>
  );
}

function HomeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 11l9-8 9 8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 10v10h14V10" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="8.5" cy="9.5" r="1.5" />
      <path d="M21 16l-5-5-4 4-3-3-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function GearIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 00.3 1.9l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.9-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1-1.6 1.7 1.7 0 00-1.9.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.9 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.6-1 1.7 1.7 0 00-.3-1.9l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.9.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.9-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.9V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
