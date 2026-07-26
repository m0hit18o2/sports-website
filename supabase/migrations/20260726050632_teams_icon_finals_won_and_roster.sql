-- Team icon (uploaded image, same pattern as the Gallery bucket) and
-- finals_won, editable only from the admin Leaderboard tab / direct DB,
-- with no derivation from events.
alter table public.teams
  add column icon_url text,
  add column finals_won integer not null default 0;

-- Reconcile the placeholder teams seeded from test event data with the
-- real section roster, preserving IDs so existing events.team_a_id/
-- team_b_id keep pointing at the right rows.
update public.teams set name = 'Section - A' where name = 'A';
update public.teams set name = 'Section - C' where name = 'C';
update public.teams set name = 'Section - D' where name = 'D';
update public.teams set name = 'Section - F' where name = 'F';

insert into public.teams (name) values
  ('Section - B'),
  ('Section - E'),
  ('MBA-EX'),
  ('PGDBA & VLMP');
