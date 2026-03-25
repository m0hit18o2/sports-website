import { supabase } from "@/lib/supabase";

async function getPhotos() {
  const { data } = await supabase
    .from("photos")
    .select("url")
    .eq("is_active", true)
    .order("uploaded_at", { ascending: false });
  return data ?? [];
}

export default async function GalleryPage() {
  const photos = await getPhotos();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6 pt-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold text-zinc-800 dark:text-zinc-100 mb-6">
          Gallery
        </h1>
        {photos.length === 0 ? (
          <p className="text-sm text-zinc-400 text-center py-12">No photos yet</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {photos.map((photo, i) => (
              <div key={i} className="rounded-xl overflow-hidden aspect-video bg-zinc-100 dark:bg-zinc-800">
                <img src={photo.url} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}