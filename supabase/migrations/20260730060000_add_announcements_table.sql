create table public.announcements (
  id serial primary key,
  day_label text not null,
  month_label text not null,
  title text not null,
  body text not null,
  created_at timestamptz not null default now()
);

alter table public.announcements enable row level security;

create policy "announcements_public_read" on public.announcements
  for select using (true);
create policy "announcements_admin_insert" on public.announcements
  for insert with check (is_admin());
create policy "announcements_admin_update" on public.announcements
  for update using (is_admin()) with check (is_admin());
create policy "announcements_admin_delete" on public.announcements
  for delete using (is_admin());

-- Seed with the announcements currently hardcoded on the homepage.
insert into public.announcements (day_label, month_label, title, body) values
  ('24', 'JUL', 'Opening Ceremony', 'Join us for the grand opening ceremony at Multicourt from 5:30 PM onwards.'),
  ('24-7', 'JUL-AUG', 'Section Wars', 'The battlefield is set! Let the games begin. May the best section win.'),
  ('7', 'AUG', 'Final Day', 'Finals, closing ceremony and much more. Don''t miss out!');
