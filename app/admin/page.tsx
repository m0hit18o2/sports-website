"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

type Event = {
  id: number;
  name: string;
  date: string;
  start_time: string;
  court_id: number;
  sport_id: number;
  team_a: string;
  team_b: string;
  score_a: number;
  score_b: number;
  is_active: boolean;
  courts: { name: string };
};

type Court = { id: number; name: string };

type Photo = {
  id: number;
  url: string;
  is_active: boolean;
};

type Booking = {
  id: number;
  court_id: number;
  date: string;
  start_time: string;
  end_time: string;
  booked_by: string;
  is_booked: boolean;
  courts: { name: string };
};

const TABS = ["Events", "Bookings", "Gallery"];

export default function AdminPage() {
  const [tab, setTab] = useState("Events");

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold text-zinc-800 dark:text-zinc-100 mb-6">
          Admin Panel
        </h1>
        <Link href="/" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
        <span>🏠</span> Home
        </Link>
        {/* Tabs */}
        <div className="flex gap-1 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl mb-8 w-fit">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors
                ${tab === t
                  ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "Events" && <EventsTab />}
        {tab === "Bookings" && <BookingsTab />}
        {tab === "Gallery" && <GalleryTab />}
      </div>
    </div>
  );
}

type Sport = { id: number; name: string };

function EventsTab() {
  const [events, setEvents] = useState<Event[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [courts, setCourts] = useState<Court[]>([]);
  const [form, setForm] = useState({
    name: "", date: "", start_time: "", court_id: "", sport_id: "", team_a: "", team_b: ""
  });

  useEffect(() => { fetchEvents(); fetchSports(); fetchCourts(); }, []);

  async function fetchEvents() {
    const { data } = await supabase
      .from("events")
      .select("*, courts(name)")
      .order("date", { ascending: false });
    if (data) setEvents(data);
  }

  async function fetchSports() {
    const { data } = await supabase.from("sports").select("*").order("name");
    if (data) setSports(data);
  }

  async function fetchCourts() {
    const { data } = await supabase.from("courts").select("*").order("id");
    if (data) {
      setCourts(data);
      setForm((f) => (f.court_id ? f : { ...f, court_id: data[0] ? String(data[0].id) : "" }));
    }
  }

  async function createEvent() {
    if (!form.name || !form.date || !form.court_id || !form.team_a || !form.team_b) return;
    await supabase.from("events").insert({
      ...form,
      court_id: parseInt(form.court_id),
      sport_id: form.sport_id ? parseInt(form.sport_id) : null,
      score_a: 0,
      score_b: 0,
      is_active: true,
    });
    setForm((f) => ({ name: "", date: "", start_time: "", court_id: f.court_id, sport_id: "", team_a: "", team_b: "" }));
    fetchEvents();
  }

  async function updateScore(id: number, team: "a" | "b", delta: number) {
    const event = events.find((e) => e.id === id)!;
    const field = team === "a" ? "score_a" : "score_b";
    const current = team === "a" ? event.score_a : event.score_b;
    const newScore = Math.max(0, current + delta);
    await supabase.from("events").update({ [field]: newScore }).eq("id", id);
    fetchEvents();
  }

  async function toggleActive(id: number, current: boolean) {
    await supabase.from("events").update({ is_active: !current }).eq("id", id);
    fetchEvents();
  }

  async function deleteEvent(id: number) {
    await supabase.from("events").delete().eq("id", id);
    fetchEvents();
  }

  return (
    <div className="flex flex-col gap-8">

      {/* Create Event */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-200 dark:border-zinc-800">
        <h2 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-4">Create Event</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input placeholder="Event name" value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="sm:col-span-2 w-full min-w-0 px-3 py-2 rounded-lg border border-zinc-200 bg-transparent text-sm outline-none focus:border-blue-400 transition-colors" />
          <input type="date" value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
                      className="w-full min-w-0 px-3 py-2 rounded-lg border border-zinc-200 bg-transparent text-sm outline-none focus:border-blue-400 transition-colors" />
          <input type="time" value={form.start_time}
            onChange={(e) => setForm({ ...form, start_time: e.target.value })}
            className="w-full min-w-0 px-3 py-2 rounded-lg border border-zinc-200 bg-transparent text-sm outline-none focus:border-blue-400 transition-colors" />
          <select value={form.court_id}
            onChange={(e) => setForm({ ...form, court_id: e.target.value })}
            className="w-full min-w-0 px-3 py-2 rounded-lg border border-zinc-200 bg-transparent text-sm text-zinc-800 dark:text-zinc-100 outline-none focus:border-blue-400 transition-colors [color-scheme:light] dark:[color-scheme:dark]">
            <option className="bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100" value="">Select court</option>
            {courts.map((c) => (
              <option className="bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100" key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select value={form.sport_id}
            onChange={(e) => setForm({ ...form, sport_id: e.target.value })}
            className="w-full min-w-0 px-3 py-2 rounded-lg border border-zinc-200 bg-transparent text-sm text-zinc-800 dark:text-zinc-100 outline-none focus:border-blue-400 transition-colors [color-scheme:light] dark:[color-scheme:dark]">
            <option className="bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100" value="">Select sport</option>
            {sports.map((s) => (
              <option className="bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100" key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <input placeholder="Team A" value={form.team_a}
            onChange={(e) => setForm({ ...form, team_a: e.target.value })}
            className="w-full min-w-0 px-3 py-2 rounded-lg border border-zinc-200 bg-transparent text-sm outline-none focus:border-blue-400 transition-colors" />
          <input placeholder="Team B" value={form.team_b}
            onChange={(e) => setForm({ ...form, team_b: e.target.value })}
            className="w-full min-w-0 px-3 py-2 rounded-lg border border-zinc-200 bg-transparent text-sm outline-none focus:border-blue-400 transition-colors" />
        </div>
        <button onClick={createEvent}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors">
          Create Event
        </button>
      </div>

      {/* Events List */}
      <div className="flex flex-col gap-3">
        {events.map((event) => (
          <div key={event.id}
            className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100">{event.name}</p>
                <p className="text-xs text-zinc-400">{event.date} {event.start_time ?? ""} · {event.courts?.name ?? "Unknown court"}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => toggleActive(event.id, event.is_active)}
                  className={`text-xs px-3 py-1 rounded-full font-medium transition-colors
                    ${event.is_active
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800"}`}>
                  {event.is_active ? "Live" : "Ended"}
                </button>
                <button onClick={() => deleteEvent(event.id)}
                  className="text-xs text-red-400 hover:text-red-600">
                  Delete
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Team A score */}
              <div className="flex-1 flex items-center justify-between bg-zinc-50 dark:bg-zinc-800 rounded-lg px-3 py-2">
                <span className="text-sm text-zinc-700 dark:text-zinc-300">{event.team_a}</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateScore(event.id, "a", -1)}
                    className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 text-sm hover:bg-zinc-300 dark:hover:bg-zinc-600">
                    −
                  </button>
                  <span className="text-lg font-semibold text-zinc-800 dark:text-zinc-100 w-6 text-center">
                    {event.score_a}
                  </span>
                  <button onClick={() => updateScore(event.id, "a", 1)}
                    className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 text-sm hover:bg-zinc-300 dark:hover:bg-zinc-600">
                    +
                  </button>
                </div>
              </div>

              <span className="text-xs text-zinc-400">vs</span>

              {/* Team B score */}
              <div className="flex-1 flex items-center justify-between bg-zinc-50 dark:bg-zinc-800 rounded-lg px-3 py-2">
                <span className="text-sm text-zinc-700 dark:text-zinc-300">{event.team_b}</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateScore(event.id, "b", -1)}
                    className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 text-sm hover:bg-zinc-300 dark:hover:bg-zinc-600">
                    −
                  </button>
                  <span className="text-lg font-semibold text-zinc-800 dark:text-zinc-100 w-6 text-center">
                    {event.score_b}
                  </span>
                  <button onClick={() => updateScore(event.id, "b", 1)}
                    className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 text-sm hover:bg-zinc-300 dark:hover:bg-zinc-600">
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BookingsTab() {
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => { fetchBookings(); }, []);

  async function fetchBookings() {
    const { data } = await supabase
      .from("slots")
      .select("*, courts(name)")
      .eq("is_booked", true)
      .order("date", { ascending: true });
    if (data) setBookings(data);
  }

  async function cancelBooking(id: number) {
    await supabase.from("slots")
      .update({ is_booked: false, booked_by: null })
      .eq("id", id);
    fetchBookings();
  }

  return (
    <div className="flex flex-col gap-3">
      {bookings.length === 0 && (
        <p className="text-sm text-zinc-400 text-center py-12">No active bookings</p>
      )}
      {bookings.map((b) => (
        <div key={b.id}
          className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100">{b.booked_by}</p>
            <p className="text-xs text-zinc-400">{b.courts.name} · {b.date} · {b.start_time} – {b.end_time}</p>
          </div>
          <button onClick={() => cancelBooking(b.id)}
            className="text-xs text-red-400 hover:text-red-600 font-medium">
            Cancel
          </button>
        </div>
      ))}
    </div>
  );
}

function GalleryTab() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchPhotos(); }, []);

  async function fetchPhotos() {
    const { data } = await supabase.from("photos").select("*").order("uploaded_at", { ascending: false });
    if (data) setPhotos(data);
  }

  async function uploadPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    const filename = `${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("Gallery").upload(filename, file);
    if (!error) {
      const { data: urlData } = supabase.storage.from("Gallery").getPublicUrl(filename);
      await supabase.from("photos").insert({ url: urlData.publicUrl, is_active: true });
      fetchPhotos();
    }
    setUploading(false);
  }

  async function togglePhoto(id: number, current: boolean) {
    await supabase.from("photos").update({ is_active: !current }).eq("id", id);
    fetchPhotos();
  }

  async function deletePhoto(id: number, url: string) {
    const filename = url.split("/").pop()!;
    await supabase.storage.from("Gallery").remove([filename]);
    await supabase.from("photos").delete().eq("id", id);
    fetchPhotos();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-zinc-500">Toggle photos to show/hide on landing page</p>
        <button onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          {uploading ? "Uploading..." : "Upload Photo"}
        </button>
        <input ref={fileRef} type="file" accept="image/*" onChange={uploadPhoto} className="hidden" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {photos.map((photo) => (
          <div key={photo.id} className="relative group rounded-xl overflow-hidden aspect-video bg-zinc-100 dark:bg-zinc-800">
            <img src={photo.url} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <button onClick={() => togglePhoto(photo.id, photo.is_active)}
                className={`text-xs px-3 py-1 rounded-full font-medium
                  ${photo.is_active
                    ? "bg-green-500 text-white"
                    : "bg-zinc-600 text-zinc-200"}`}>
                {photo.is_active ? "Showing" : "Hidden"}
              </button>
              <button onClick={() => deletePhoto(photo.id, photo.url)}
                className="text-xs px-3 py-1 rounded-full bg-red-500 text-white font-medium">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}