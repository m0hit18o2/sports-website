"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Event = {
  id: number;
  name: string;
  date: string;
  court_id: number;
  team_a: string;
  team_b: string;
  score_a: number;
  score_b: number;
  is_active: boolean;
  courts: { name: string };
};

export default function ScoresPage() {
  const [events, setEvents] = useState<Event[]>([]);

  async function fetchEvents() {
    const { data } = await supabase
      .from("events")
      .select("*, courts(name)")
      .order("date", { ascending: false });
    if (data) setEvents(data as Event[]);
  }

  useEffect(() => {
    fetchEvents();
    const interval = setInterval(fetchEvents, 15000);
    return () => clearInterval(interval);
  }, []);

  const active = events.filter((e) => e.is_active);
  const completed = events.filter((e) => !e.is_active);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6">
      <div className="max-w-2xl mx-auto">

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-zinc-800 dark:text-zinc-100">
            Events
          </h1>
        </div>

        {active.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">
              Live now
            </h2>
            <div className="flex flex-col gap-3">
              {active.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </section>
        )}

        {completed.length > 0 && (
          <section>
            <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">
              Completed
            </h2>
            <div className="flex flex-col gap-3">
              {completed.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </section>
        )}

        {events.length === 0 && (
          <p className="text-sm text-zinc-400 text-center py-12">No events yet</p>
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
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100">{event.name}</p>
          <p className="text-xs text-zinc-400">{event.courts.name} · {event.date}</p>
        </div>
        {event.is_active && (
          <span className="text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded-full">
            Live
          </span>
        )}
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