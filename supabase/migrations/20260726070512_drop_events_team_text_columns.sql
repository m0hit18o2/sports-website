-- team_a_id/team_b_id (FKs to teams) fully replaced these; no code
-- references the raw text columns anymore.
alter table public.events
  drop column team_a,
  drop column team_b;
