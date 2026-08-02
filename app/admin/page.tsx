"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { resizeImage } from "@/lib/resizeImage";

type Event = {
  id: number;
  date: string;
  start_time: string;
  court_id: number;
  sport_id: number;
  team_a_id: number | null;
  team_b_id: number | null;
  team_a: { name: string } | null;
  team_b: { name: string } | null;
  winner: number | null;
  points: number | null;
  score_a: number;
  score_b: number;
  courts: { name: string };
  sports: { name: string } | null;
};

type Court = { id: number; name: string };

type Team = {
  id: number;
  name: string;
  total_points: number;
  finals: number;
  icon_url: string | null;
};

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

const TABS = ["Events", "Bookings", "Gallery", "Leaderboard", "Announcements"];

export default function AdminPage() {
  const [tab, setTab] = useState("Events");

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold text-zinc-800 dark:text-zinc-100 mb-6">
          Admin Panel
        </h1>
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
        {tab === "Leaderboard" && <LeaderboardTab />}
        {tab === "Announcements" && <AnnouncementsTab />}
      </div>
    </div>
  );
}

type Sport = { id: number; name: string };

const ANY = "any";

function EventsTab() {
  const [events, setEvents] = useState<Event[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [courts, setCourts] = useState<Court[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [form, setForm] = useState({
    date: "", start_time: "", court_id: "", sport_id: "", team_a_id: "", team_b_id: "", points: ""
  });

  const [dateFilter, setDateFilter] = useState("");
  const [sportFilter, setSportFilter] = useState(ANY);
  const [teamFilter, setTeamFilter] = useState(ANY);

  useEffect(() => { fetchSports(); fetchCourts(); fetchTeams(); }, []);

  useEffect(() => {
    fetchEvents();
  }, [dateFilter, sportFilter, teamFilter]);

  async function fetchEvents() {
    let query = supabase
      .from("events")
      .select("*, courts(name), sports(name), team_a:teams!events_team_a_id_fkey(name), team_b:teams!events_team_b_id_fkey(name)")
      .order("date", { ascending: false });

    if (dateFilter) query = query.eq("date", dateFilter);
    if (sportFilter !== ANY) query = query.eq("sport_id", sportFilter);
    if (teamFilter !== ANY) query = query.or(`team_a_id.eq.${teamFilter},team_b_id.eq.${teamFilter}`);

    const { data } = await query;
    if (data) setEvents(data as unknown as Event[]);
  }

  async function fetchTeams() {
    const { data } = await supabase.from("teams").select("*").order("name");
    if (data) setTeams(data);
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
    if (!form.date || !form.court_id || !form.team_a_id || !form.team_b_id) return;
    if (form.team_a_id === form.team_b_id) return;
    await supabase.from("events").insert({
      date: form.date,
      start_time: form.start_time || null,
      court_id: parseInt(form.court_id),
      sport_id: form.sport_id ? parseInt(form.sport_id) : null,
      team_a_id: parseInt(form.team_a_id),
      team_b_id: parseInt(form.team_b_id),
      points: form.points ? parseInt(form.points) : null,
      score_a: 0,
      score_b: 0,
    });
    setForm((f) => ({ date: "", start_time: "", court_id: f.court_id, sport_id: "", team_a_id: "", team_b_id: "", points: "" }));
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

  // Reads the team's current total_points fresh from the DB (rather than
  // trusting local state, which may be stale) before writing the new value.
  async function adjustTeamTotal(teamId: number, delta: number) {
    if (!delta) return;
    const { data } = await supabase.from("teams").select("total_points").eq("id", teamId).single();
    if (data) {
      const newTotal = Math.max(0, data.total_points + delta);
      await supabase.from("teams").update({ total_points: newTotal }).eq("id", teamId);
    }
  }

  async function updateWinner(id: number, winner: string) {
    const event = events.find((e) => e.id === id)!;
    const newWinner = winner ? parseInt(winner) : null;
    const pts = event.points ?? 0;
    if (event.winner && event.winner !== newWinner) await adjustTeamTotal(event.winner, -pts);
    if (newWinner && newWinner !== event.winner) await adjustTeamTotal(newWinner, pts);
    await supabase.from("events").update({ winner: newWinner }).eq("id", id);
    fetchEvents();
    fetchTeams();
  }

  async function updatePoints(id: number, points: string) {
    const event = events.find((e) => e.id === id)!;
    const newPoints = points ? parseInt(points) : null;
    const delta = (newPoints ?? 0) - (event.points ?? 0);
    if (event.winner) await adjustTeamTotal(event.winner, delta);
    await supabase.from("events").update({ points: newPoints }).eq("id", id);
    fetchEvents();
    fetchTeams();
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
          <div className="grid grid-cols-2 gap-3 sm:col-span-2">
            <input type="date" value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full min-w-0 px-3 py-2 rounded-lg border border-zinc-200 bg-transparent text-sm outline-none focus:border-blue-400 transition-colors [color-scheme:light] dark:[color-scheme:dark]" />
            <input type="time" value={form.start_time}
              onChange={(e) => setForm({ ...form, start_time: e.target.value })}
              className="w-full min-w-0 px-3 py-2 rounded-lg border border-zinc-200 bg-transparent text-sm outline-none focus:border-blue-400 transition-colors [color-scheme:light] dark:[color-scheme:dark]" />
          </div>
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
          <select value={form.team_a_id}
            onChange={(e) => setForm({ ...form, team_a_id: e.target.value })}
            className="w-full min-w-0 px-3 py-2 rounded-lg border border-zinc-200 bg-transparent text-sm text-zinc-800 dark:text-zinc-100 outline-none focus:border-blue-400 transition-colors [color-scheme:light] dark:[color-scheme:dark]">
            <option className="bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100" value="">Select team A</option>
            {teams.map((t) => (
              <option className="bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100" key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          <select value={form.team_b_id}
            onChange={(e) => setForm({ ...form, team_b_id: e.target.value })}
            className="w-full min-w-0 px-3 py-2 rounded-lg border border-zinc-200 bg-transparent text-sm text-zinc-800 dark:text-zinc-100 outline-none focus:border-blue-400 transition-colors [color-scheme:light] dark:[color-scheme:dark]">
            <option className="bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100" value="">Select team B</option>
            {teams.map((t) => (
              <option className="bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100" key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          <input type="number" placeholder="Points (optional)" value={form.points}
            onChange={(e) => setForm({ ...form, points: e.target.value })}
            className="w-full min-w-0 px-3 py-2 rounded-lg border border-zinc-200 bg-transparent text-sm outline-none focus:border-blue-400 transition-colors" />
        </div>
        <button onClick={createEvent}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors">
          Create Event
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="w-full min-w-0 max-w-[10rem] px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent text-sm text-zinc-800 dark:text-zinc-100 outline-none focus:border-blue-400 transition-colors [color-scheme:light] dark:[color-scheme:dark]"
        />
        <select
          value={sportFilter}
          onChange={(e) => setSportFilter(e.target.value)}
          className="w-full min-w-0 px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent text-sm text-zinc-800 dark:text-zinc-100 outline-none focus:border-blue-400 transition-colors [color-scheme:light] dark:[color-scheme:dark]"
        >
          <option className="bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100" value={ANY}>Any sport</option>
          {sports.map((s) => (
            <option className="bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100" key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        <select
          value={teamFilter}
          onChange={(e) => setTeamFilter(e.target.value)}
          className="w-full min-w-0 px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent text-sm text-zinc-800 dark:text-zinc-100 outline-none focus:border-blue-400 transition-colors [color-scheme:light] dark:[color-scheme:dark]"
        >
          <option className="bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100" value={ANY}>Any team</option>
          {teams.map((t) => (
            <option className="bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100" key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </div>

      {/* Events List */}
      <div className="flex flex-col gap-3">
        {events.map((event) => (
          <div key={event.id}
            className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-start justify-between gap-3 mb-3">
              <p className="flex-1 min-w-0 text-sm font-medium text-zinc-800 dark:text-zinc-100">
                {event.sports?.name ? `${event.sports.name} · ` : ""}{event.courts?.name ?? "Unknown court"} · {event.date}{event.start_time ? ` · ${event.start_time}` : ""}
              </p>
              <button onClick={() => deleteEvent(event.id)}
                className="shrink-0 text-xs text-red-400 hover:text-red-600">
                Delete
              </button>
            </div>

            <div className="flex items-center gap-3">
              {/* Team A score */}
              <div className="flex-1 min-w-0 flex items-center justify-between gap-2 bg-zinc-50 dark:bg-zinc-800 rounded-lg px-3 py-2">
                <span className="text-sm text-zinc-700 dark:text-zinc-300 truncate">{event.team_a?.name ?? "TBD"}</span>
                <div className="flex items-center gap-2 shrink-0">
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
              <div className="flex-1 min-w-0 flex items-center justify-between gap-2 bg-zinc-50 dark:bg-zinc-800 rounded-lg px-3 py-2">
                <span className="text-sm text-zinc-700 dark:text-zinc-300 truncate">{event.team_b?.name ?? "TBD"}</span>
                <div className="flex items-center gap-2 shrink-0">
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

            {/* Result: setting a winner credits its points to teams.total_points;
                changing/removing the winner or editing points afterward keeps
                that total in sync. finals stays admin/DB-only, untouched here. */}
            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
              <select
                value={event.winner ?? ""}
                onChange={(e) => updateWinner(event.id, e.target.value)}
                className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent text-sm text-zinc-800 dark:text-zinc-100 outline-none focus:border-blue-400 transition-colors [color-scheme:light] dark:[color-scheme:dark]">
                <option className="bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100" value="">No winner</option>
                {event.team_a_id && (
                  <option className="bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100" value={event.team_a_id}>
                    {event.team_a?.name ?? "Team A"} won
                  </option>
                )}
                {event.team_b_id && (
                  <option className="bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100" value={event.team_b_id}>
                    {event.team_b?.name ?? "Team B"} won
                  </option>
                )}
              </select>
              <input
                type="number"
                placeholder="Points"
                defaultValue={event.points ?? ""}
                onBlur={(e) => updatePoints(event.id, e.target.value)}
                className="w-24 px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent text-sm text-zinc-800 dark:text-zinc-100 outline-none focus:border-blue-400 transition-colors"
              />
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

    const resized = await resizeImage(file, 1600, "image/jpeg", 0.82);
    const filename = `${Date.now()}-${file.name.replace(/\.[^.]+$/, "")}.jpg`;
    const { error } = await supabase.storage.from("Gallery").upload(filename, resized, {
      cacheControl: "31536000",
      contentType: "image/jpeg",
    });
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

function LeaderboardTab() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const fileRefs = useRef<Record<number, HTMLInputElement | null>>({});

  useEffect(() => { fetchTeams(); }, []);

  async function fetchTeams() {
    const { data } = await supabase.from("teams").select("*").order("name");
    if (data) setTeams(data);
  }

  async function uploadIcon(teamId: number, file: File) {
    setUploadingId(teamId);
    // Icons only ever render at ~50px, so 256px is generous headroom even
    // for retina displays — no reason to store/serve multi-MB originals.
    const resized = await resizeImage(file, 256, "image/png");
    const filename = `${teamId}-${Date.now()}-${file.name.replace(/\.[^.]+$/, "")}.png`;
    const previousUrl = teams.find((t) => t.id === teamId)?.icon_url;
    const { error } = await supabase.storage.from("TeamIcons").upload(filename, resized, {
      cacheControl: "31536000",
      contentType: "image/png",
    });
    if (!error) {
      const { data: urlData } = supabase.storage.from("TeamIcons").getPublicUrl(filename);
      await supabase.from("teams").update({ icon_url: urlData.publicUrl }).eq("id", teamId);
      // Clean up the old file so repeated re-uploads don't leave orphaned
      // blobs behind — this is exactly how the bucket ended up bloated before.
      if (previousUrl) {
        const previousPath = decodeURIComponent(previousUrl.split("/TeamIcons/")[1] ?? "");
        if (previousPath) await supabase.storage.from("TeamIcons").remove([previousPath]);
      }
      fetchTeams();
    }
    setUploadingId(null);
  }

  async function adjustPoints(id: number, delta: number) {
    const team = teams.find((t) => t.id === id)!;
    const newPoints = Math.max(0, team.total_points + delta);
    await supabase.from("teams").update({ total_points: newPoints }).eq("id", id);
    fetchTeams();
  }

  async function adjustFinals(id: number, delta: number) {
    const team = teams.find((t) => t.id === id)!;
    const newVal = Math.max(0, team.finals + delta);
    await supabase.from("teams").update({ finals: newVal }).eq("id", id);
    fetchTeams();
  }

  return (
    <div className="flex flex-col gap-3">
      {teams.map((team) => (
        <div key={team.id}
          className="flex flex-col sm:flex-row sm:items-center gap-4 bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-zinc-200 dark:border-zinc-800">
          <div className="relative group w-12 h-12 shrink-0">
            {team.icon_url ? (
              <img src={team.icon_url} alt="" className="w-12 h-12 rounded-full object-cover" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800" />
            )}
            <button
              onClick={() => fileRefs.current[team.id]?.click()}
              disabled={uploadingId === team.id}
              className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-medium">
              {uploadingId === team.id ? "..." : "Edit"}
            </button>
            <input
              ref={(el) => { fileRefs.current[team.id] = el; }}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) uploadIcon(team.id, file);
              }}
            />
          </div>

          <span className="flex-1 text-sm font-medium text-zinc-800 dark:text-zinc-100">{team.name}</span>

          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400 w-20">Finals</span>
            <button onClick={() => adjustFinals(team.id, -1)}
              className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 text-sm hover:bg-zinc-300 dark:hover:bg-zinc-600">
              −
            </button>
            <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 w-6 text-center">
              {team.finals}
            </span>
            <button onClick={() => adjustFinals(team.id, 1)}
              className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 text-sm hover:bg-zinc-300 dark:hover:bg-zinc-600">
              +
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400 w-14">Points</span>
            <button onClick={() => adjustPoints(team.id, -1)}
              className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 text-sm hover:bg-zinc-300 dark:hover:bg-zinc-600">
              −
            </button>
            <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 w-8 text-center">
              {team.total_points}
            </span>
            <button onClick={() => adjustPoints(team.id, 1)}
              className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 text-sm hover:bg-zinc-300 dark:hover:bg-zinc-600">
              +
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

type Announcement = {
  id: number;
  day_label: string;
  month_label: string;
  title: string;
  body: string;
};

function AnnouncementsTab() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [form, setForm] = useState({ day_label: "", month_label: "", title: "", body: "" });

  useEffect(() => { fetchAnnouncements(); }, []);

  async function fetchAnnouncements() {
    const { data } = await supabase.from("announcements").select("*").order("created_at", { ascending: true });
    if (data) setAnnouncements(data);
  }

  async function createAnnouncement() {
    if (!form.day_label || !form.month_label || !form.title || !form.body) return;
    await supabase.from("announcements").insert(form);
    setForm({ day_label: "", month_label: "", title: "", body: "" });
    fetchAnnouncements();
  }

  async function updateField(id: number, field: keyof Omit<Announcement, "id">, value: string) {
    await supabase.from("announcements").update({ [field]: value }).eq("id", id);
    fetchAnnouncements();
  }

  async function deleteAnnouncement(id: number) {
    await supabase.from("announcements").delete().eq("id", id);
    fetchAnnouncements();
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Create */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-200 dark:border-zinc-800">
        <h2 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-4">Create Announcement</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input placeholder="Day (e.g. 24 or 24-26)" value={form.day_label}
            onChange={(e) => setForm({ ...form, day_label: e.target.value })}
            className="w-full min-w-0 px-3 py-2 rounded-lg border border-zinc-200 bg-transparent text-sm outline-none focus:border-blue-400 transition-colors" />
          <input placeholder="Month (e.g. JUL)" value={form.month_label}
            onChange={(e) => setForm({ ...form, month_label: e.target.value })}
            className="w-full min-w-0 px-3 py-2 rounded-lg border border-zinc-200 bg-transparent text-sm outline-none focus:border-blue-400 transition-colors" />
          <input placeholder="Title" value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="sm:col-span-2 w-full min-w-0 px-3 py-2 rounded-lg border border-zinc-200 bg-transparent text-sm outline-none focus:border-blue-400 transition-colors" />
          <textarea placeholder="Body" value={form.body} rows={2}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
            className="sm:col-span-2 w-full min-w-0 px-3 py-2 rounded-lg border border-zinc-200 bg-transparent text-sm outline-none focus:border-blue-400 transition-colors resize-none" />
        </div>
        <button onClick={createAnnouncement}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors">
          Create Announcement
        </button>
      </div>

      {/* List — each field autosaves on blur */}
      <div className="flex flex-col gap-3">
        {announcements.map((a) => (
          <div key={a.id}
            className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-zinc-200 dark:border-zinc-800">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <input defaultValue={a.day_label} onBlur={(e) => updateField(a.id, "day_label", e.target.value)}
                className="w-full min-w-0 px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent text-sm outline-none focus:border-blue-400 transition-colors" />
              <input defaultValue={a.month_label} onBlur={(e) => updateField(a.id, "month_label", e.target.value)}
                className="w-full min-w-0 px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent text-sm outline-none focus:border-blue-400 transition-colors" />
              <input defaultValue={a.title} onBlur={(e) => updateField(a.id, "title", e.target.value)}
                className="sm:col-span-2 w-full min-w-0 px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent text-sm font-medium outline-none focus:border-blue-400 transition-colors" />
              <textarea defaultValue={a.body} rows={2} onBlur={(e) => updateField(a.id, "body", e.target.value)}
                className="sm:col-span-2 w-full min-w-0 px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent text-sm outline-none focus:border-blue-400 transition-colors resize-none" />
            </div>
            <button onClick={() => deleteAnnouncement(a.id)}
              className="text-xs text-red-400 hover:text-red-600">
              Delete
            </button>
          </div>
        ))}
        {announcements.length === 0 && (
          <p className="text-sm text-zinc-400 text-center py-12">No announcements yet</p>
        )}
      </div>
    </div>
  );
}
