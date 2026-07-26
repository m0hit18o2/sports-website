"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

type Event = {
  id: number;
  date: string;
  start_time: string | null;
  court_id: number;
  sport_id: number | null;
  team_a_id: number | null;
  team_b_id: number | null;
  score_a: number;
  score_b: number;
  courts: { name: string };
  sports: { name: string } | null;
  team_a: { name: string } | null;
  team_b: { name: string } | null;
};

type Team = {
  id: number;
  name: string;
  total_points: number;
  finals: number;
  icon_url: string | null;
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
const TABS = ["Schedule", "Leaderboard"];

export default function SectionWarsPage() {
  const [tab, setTab] = useState("Schedule");

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-zinc-800 dark:text-zinc-100">
            Section Wars
          </h1>
        </div>

        <div className="flex gap-1 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl mb-6 w-fit">
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

        {tab === "Schedule" && <ScheduleTab />}
        {tab === "Leaderboard" && <LeaderboardTab />}
      </div>
    </div>
  );
}

function ScheduleTab() {
  const [events, setEvents] = useState<Event[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);

  const [dateFilter, setDateFilter] = useState("");
  const [sportFilter, setSportFilter] = useState(ANY);
  const [teamFilter, setTeamFilter] = useState(ANY);

  async function fetchFilterOptions() {
    const [{ data: sportsData }, { data: teamsData }] = await Promise.all([
      supabase.from("sports").select("*").order("name"),
      supabase.from("teams").select("*").order("name"),
    ]);
    if (sportsData) setSports(sportsData as Sport[]);
    if (teamsData) setTeams(teamsData as Team[]);
  }

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

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    fetchEvents();
    const interval = setInterval(fetchEvents, 15000);
    return () => clearInterval(interval);
  }, [dateFilter, sportFilter, teamFilter]);

  return (
    <>
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
            <option className="bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100" key={t.id} value={t.id}>{t.name}</option>
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
    </>
  );
}

function EventCard({ event }: { event: Event }) {
  const winner =
    event.score_a > event.score_b ? "a" :
    event.score_b > event.score_a ? "b" : null;

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-zinc-200 dark:border-zinc-800">
      <div className="mb-3">
        <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100">
          {event.sports?.name ? `${event.sports.name} · ` : ""}{event.courts.name} · {event.date}
          {event.start_time ? ` · ${formatTime(event.start_time)}` : ""}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className={`flex-1 flex items-center justify-between rounded-lg px-3 py-2
          ${winner === "a" ? "bg-blue-50 dark:bg-blue-900/20" : "bg-zinc-50 dark:bg-zinc-800"}`}>
          <span className="text-sm text-zinc-700 dark:text-zinc-300">{event.team_a?.name ?? "TBD"}</span>
          <span className={`text-lg font-semibold
            ${winner === "a" ? "text-blue-600 dark:text-blue-400" : "text-zinc-800 dark:text-zinc-100"}`}>
            {event.score_a}
          </span>
        </div>

        <span className="text-xs text-zinc-400">vs</span>

        <div className={`flex-1 flex items-center justify-between rounded-lg px-3 py-2
          ${winner === "b" ? "bg-blue-50 dark:bg-blue-900/20" : "bg-zinc-50 dark:bg-zinc-800"}`}>
          <span className="text-sm text-zinc-700 dark:text-zinc-300">{event.team_b?.name ?? "TBD"}</span>
          <span className={`text-lg font-semibold
            ${winner === "b" ? "text-blue-600 dark:text-blue-400" : "text-zinc-800 dark:text-zinc-100"}`}>
            {event.score_b}
          </span>
        </div>
      </div>
    </div>
  );
}

// Standard competition ranking (1, 2, 2, 4): tied teams share a rank,
// and the next distinct rank skips ahead. `teams` must already be sorted
// by total_points descending.
function computeRanks(teams: Team[]): number[] {
  const ranks: number[] = [];
  teams.forEach((team, i) => {
    if (i > 0 && team.total_points === teams[i - 1].total_points) {
      ranks.push(ranks[i - 1]);
    } else {
      ranks.push(i + 1);
    }
  });
  return ranks;
}

// Actual medal hex colors rather than named Tailwind shades — gold/silver/
// bronze need to stay clearly distinct from each other and visible against
// both light and dark backgrounds, which nearby named shades (amber/slate/
// orange) didn't reliably give us.
const MEDAL_STYLES: Record<number, { row: string; badge: string }> = {
  1: {
    row: "bg-[#FFD700]/15 dark:bg-[#FFD700]/10 border-[#FFD700]/60 dark:border-[#FFD700]/50",
    badge: "bg-[#FFD700] text-zinc-900",
  },
  2: {
    row: "bg-[#C0C0C0]/25 dark:bg-[#C0C0C0]/15 border-[#C0C0C0] dark:border-[#C0C0C0]/70",
    badge: "bg-[#C0C0C0] text-zinc-900",
  },
  3: {
    row: "bg-[#CD7F32]/15 dark:bg-[#CD7F32]/15 border-[#CD7F32]/70 dark:border-[#CD7F32]/60",
    badge: "bg-[#CD7F32] text-zinc-900",
  },
};

function LeaderboardTab() {
  const [teams, setTeams] = useState<Team[]>([]);

  useEffect(() => {
    fetchTeams();
  }, []);

  async function fetchTeams() {
    const { data } = await supabase
      .from("teams")
      .select("*")
      .order("total_points", { ascending: false });
    if (data) setTeams(data);
  }

  const ranks = computeRanks(teams);

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-[2.5rem_2.5rem_1fr_5rem_5rem] gap-3 px-4 py-2 text-xs font-medium text-zinc-400">
        <span />
        <span />
        <span>Team</span>
        <span className="text-center">Finals</span>
        <span className="text-center">Points</span>
      </div>
      {teams.map((team, i) => {
        const rank = ranks[i];
        const medal = MEDAL_STYLES[rank];
        return (
          <div key={team.id}
            className={`grid grid-cols-[2.5rem_2.5rem_1fr_5rem_5rem] items-center gap-3 rounded-2xl p-3 border
              ${medal ? medal.row : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"}`}>
            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold
              ${medal ? medal.badge : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"}`}>
              {rank}
            </span>
            {team.icon_url ? (
              <img src={team.icon_url} alt="" className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800" />
            )}
            <span className="text-sm font-medium text-zinc-800 dark:text-zinc-100">{team.name}</span>
            <span className="text-sm text-zinc-600 dark:text-zinc-300 text-center">{team.finals}</span>
            <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 text-center">{team.total_points}</span>
          </div>
        );
      })}
      {teams.length === 0 && (
        <p className="text-sm text-zinc-400 text-center py-12">No teams yet</p>
      )}
    </div>
  );
}
