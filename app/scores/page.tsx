"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Event = {
  id: number;
  name: string;
  date: string;
  start_time: string | null;
  court_id: number;
  sport_id: number | null;
  team_a: string;
  team_b: string;
  score_a: number;
  score_b: number;
  courts: { name: string };
  sports: { name: string } | null;
};

function formatTime(time: string) {
  const [h, m] = time.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  const display = hour == 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${display}:${m} ${ampm}`;
}

type Sport = { id: number; name: string };

const ANY = "any";

export default function ScoresPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [teams, setTeams] = useState<string[]>([]);

  const [dateFilter, setDateFilter] = useState("");
  const [sportFilter, setSportFilter] = useState(ANY);
  const [teamFilter, setTeamFilter] = useState(ANY);

  async function fetchFilterOptions() {
    const [{ data: sportsData }, { data: eventsData }] = await Promise.all([
      supabase.from("sports").select("*").order("name"),
      supabase.from("events").select("team_a, team_b"),
    ]);
    if (sportsData) setSports(sportsData as Sport[]);
    if (eventsData) {
      const teamSet = new Set<string>();
      eventsData.forEach((e: { team_a: string; team_b: string }) => {
        if (e.team_a) teamSet.add(e.team_a);
        if (e.team_b) teamSet.add(e.team_b);
      });
      setTeams(Array.from(teamSet).sort());
    }
  }

  async function fetchEvents() {
    let query = supabase
      .from("events")
      .select("*, courts(name), sports(name)")
      .order("date", { ascending: false });

    if (dateFilter) query = query.eq("date", dateFilter);
    if (sportFilter !== ANY) query = query.eq("sport_id", sportFilter);
    if (teamFilter !== ANY) query = query.or(`team_a.eq.${teamFilter},team_b.eq.${teamFilter}`);

    const { data } = await query;
    if (data) setEvents(data as Event[]);
  }

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    fetchEvents();
    const interval = setInterval(fetchEvents, 15000);
    return () => clearInterval(interval);
  }, [dateFilter, sportFilter, teamFilter]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6">
      <div className="max-w-2xl mx-auto">

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-zinc-800 dark:text-zinc-100">
            Events
          </h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full min-w-0 px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent text-sm text-zinc-800 dark:text-zinc-100 outline-none focus:border-blue-400 transition-colors [color-scheme:light] dark:[color-scheme:dark]"
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
              <option className="bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100" key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {events.length > 0 && (
          <div className="flex flex-col gap-3">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}

        {events.length === 0 && (
          <p className="text-sm text-zinc-400 text-center py-12">
            {dateFilter || sportFilter !== ANY || teamFilter !== ANY
              ? "No events match these filters"
              : "No events yet"}
          </p>
        )}

      </div>
    </div>
  );
}

function EventCard({ event }: { event: Event }) {
  const winner =
    event.score_a > event.score_b ? "a" :
    event.score_b > event.score_a ? "b" : null;

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-zinc-200 dark:border-zinc-800">
      <div className="mb-3">
        <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100">{event.name}</p>
        <p className="text-xs text-zinc-400">
          {event.sports?.name ? `${event.sports.name} · ` : ""}{event.courts.name} · {event.date}
          {event.start_time ? ` · ${formatTime(event.start_time)}` : ""}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className={`flex-1 flex items-center justify-between rounded-lg px-3 py-2
          ${winner === "a" ? "bg-blue-50 dark:bg-blue-900/20" : "bg-zinc-50 dark:bg-zinc-800"}`}>
          <span className="text-sm text-zinc-700 dark:text-zinc-300">{event.team_a}</span>
          <span className={`text-lg font-semibold
            ${winner === "a" ? "text-blue-600 dark:text-blue-400" : "text-zinc-800 dark:text-zinc-100"}`}>
            {event.score_a}
          </span>
        </div>

        <span className="text-xs text-zinc-400">vs</span>

        <div className={`flex-1 flex items-center justify-between rounded-lg px-3 py-2
          ${winner === "b" ? "bg-blue-50 dark:bg-blue-900/20" : "bg-zinc-50 dark:bg-zinc-800"}`}>
          <span className="text-sm text-zinc-700 dark:text-zinc-300">{event.team_b}</span>
          <span className={`text-lg font-semibold
            ${winner === "b" ? "text-blue-600 dark:text-blue-400" : "text-zinc-800 dark:text-zinc-100"}`}>
            {event.score_b}
          </span>
        </div>
      </div>
    </div>
  );
}