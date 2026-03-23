import LandingClient from "./components/LandingClient";
import { supabase } from "@/lib/supabase";

async function getPhotos() {
  const { data } = await supabase
    .from("photos")
    .select("url")
    .eq("is_active", true)
    .order("uploaded_at", { ascending: false });
  return data?.map((p) => p.url) ?? [];
}

export default async function Home() {
  const photos = await getPhotos();
  return <LandingClient photos={photos} />;
}