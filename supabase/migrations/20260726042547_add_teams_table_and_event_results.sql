-- 1. teams table: mirrors courts/sports (id, name) plus total_points
create table public.teams (
  id serial primary key,
  name text not null unique,
  total_points integer not null default 0
);

alter table public.teams enable row level security;

create policy "teams_public_read" on public.teams
  for select using (true);
create policy "teams_admin_insert" on public.teams
  for insert with check (is_admin());
create policy "teams_admin_update" on public.teams
  for update using (is_admin()) with check (is_admin());
create policy "teams_admin_delete" on public.teams
  for delete using (is_admin());

-- 2. Seed teams from existing distinct team_a/team_b text values in events
insert into public.teams (name)
select distinct t.name from (
  select team_a as name from public.events where team_a is not null
  union
  select team_b as name from public.events where team_b is not null
) t
on conflict (name) do nothing;

-- 3. Add team_a_id/team_b_id FK columns to events, backfilled from teams.
--    team_a/team_b text columns are kept for now until the codebase is
--    migrated to use the IDs, then they can be dropped.
alter table public.events
  add column team_a_id integer references public.teams(id),
  add column team_b_id integer references public.teams(id);

update public.events e set team_a_id = t.id from public.teams t where e.team_a = t.name;
update public.events e set team_b_id = t.id from public.teams t where e.team_b = t.name;

-- 4. winner (FK to the winning team) + points awarded for the event
alter table public.events
  add column winner integer references public.teams(id),
  add column points integer;
