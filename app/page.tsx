import LandingClient from "./components/LandingClient";
import { supabase } from "@/lib/supabase";

// Without this, Next.js statically bakes the announcements list in at build
// time (Supabase's client uses fetch() under the hood, which Next.js caches
// by default) — admin edits wouldn't show up on the live site until the
// next deploy. Same class of bug as the old photo-carousel staleness issue.
export const dynamic = "force-dynamic";

async function getAnnouncements() {
  const { data } = await supabase
    .from("announcements")
    .select("*")
    .order("created_at", { ascending: true });
  return data ?? [];
}

export default async function Home() {
  const announcements = await getAnnouncements();
  return <LandingClient announcements={announcements} />;
}
