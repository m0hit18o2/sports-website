// TEMPORARY — Supabase's public API is under a Fair Use restriction
// (exceed_cached_egress_quota) until ~Aug 22, so live fetches for Schedule,
// Leaderboard, and the homepage Announcement are all bypassed in favor of
// this hardcoded snapshot rather than showing broken/empty pages.
//
// To revert once Supabase is back: flip FINAL_DAY_MODE to false (or delete
// this file and the three `if (FINAL_DAY_MODE)` checks that reference it,
// in app/section-wars/page.tsx's ScheduleTab + LeaderboardTab and
// app/page.tsx). None of the underlying live-fetch code was touched or
// removed — it's only skipped while this flag is true.
export const FINAL_DAY_MODE = true;

// Snapshot taken directly from the DB on 2026-08-07 (pulled via direct SQL,
// since the public API — what the site itself uses — is the thing that's
// blocked). `finals` is genuinely 0 for every team in the DB; if finals
// have actually been decided since, these need a manual update here.
export const STATIC_LEADERBOARD = [
  { id: 5, name: "Section - B", total_points: 116, finals: 0, icon_url: null },
  { id: 6, name: "Section - E", total_points: 109, finals: 0, icon_url: null },
  { id: 1, name: "Section - A", total_points: 108, finals: 0, icon_url: null },
  { id: 2, name: "Section - C", total_points: 95, finals: 0, icon_url: null },
  { id: 4, name: "Section - F", total_points: 94, finals: 0, icon_url: null },
  { id: 7, name: "MBA-EX", total_points: 88, finals: 0, icon_url: null },
  { id: 3, name: "Section - D", total_points: 51, finals: 0, icon_url: null },
  { id: 8, name: "PGDBA & VLMP", total_points: 28, finals: 0, icon_url: null },
];

// Grand Finale schedule, 2026-08-07 (as given). Courts filled in from
// historical sport→court usage in the DB where the source text didn't map
// to an exact existing court name (Volleyball, and the Kabaddi(M) semifinal
// winner slot).
export const STATIC_SCHEDULE = [
  { id: -1, date: "2026-08-07", start_time: "16:30:00", sport: "CRICKET", court: "Multicourt", team_a: "Section - F", team_b: "MBA-EX" },
  { id: -2, date: "2026-08-07", start_time: "19:30:00", sport: "FUTSAL(M)", court: "Multicourt", team_a: "Section - B", team_b: "Section - C" },
  { id: -3, date: "2026-08-07", start_time: "20:00:00", sport: "VOLLEYBALL(M)", court: "OH", team_a: "Section - E", team_b: "MBA-EX" },
  { id: -4, date: "2026-08-07", start_time: "21:00:00", sport: "FUTSAL(W)", court: "Multicourt", team_a: "Section - E", team_b: "Section - F" },
  { id: -5, date: "2026-08-07", start_time: "21:00:00", sport: "TENNIS(M)", court: "Multicourt", team_a: "Section - E", team_b: "MBA-EX" },
  { id: -6, date: "2026-08-07", start_time: "21:00:00", sport: "CHESS(M)", court: "LVH / Tagore Mess", team_a: "Section - B", team_b: "Section - F" },
  { id: -7, date: "2026-08-07", start_time: "21:30:00", sport: "KABADDI(M)", court: "LVH (between MDC and LVH)", team_a: "Section - B / Section - C (TBD)", team_b: "Section - F" },
  { id: -8, date: "2026-08-07", start_time: "22:30:00", sport: "HOCKEY", court: "Multicourt", team_a: "MBA-EX", team_b: "PGDBA & VLMP" },
  { id: -9, date: "2026-08-07", start_time: "23:30:00", sport: "KABADDI(W)", court: "LVH (between MDC and LVH)", team_a: "Section - A", team_b: "Section - B" },
  { id: -10, date: "2026-08-08", start_time: "00:30:00", sport: "BASKETBALL(M)", court: "Multicourt", team_a: "Section - C", team_b: "Section - E" },
];

// Draft copy — edit freely, this is just a first pass.
export const STATIC_ANNOUNCEMENT = {
  id: -1,
  day_label: "7",
  month_label: "AUG",
  title: "Grand Finale — Today!",
  body: "It's the final day of Section Wars 2026! Catch every gold-medal match from 4:30 PM onwards — check the Schedule tab for match times and venues.",
};
