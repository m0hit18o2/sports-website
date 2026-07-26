-- Enable Row Level Security and add policies for the sports-website Supabase project.
-- Mirrors current app behavior (see lib/admins.ts for the admin allowlist) so no
-- legitimate app functionality should change; it only blocks direct anon-key access
-- that bypasses the app.

-- 1. Reusable admin check, matches lib/admins.ts ADMIN_EMAILS
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (auth.jwt() ->> 'email') in (
      'mohitabinavm2027@email.iimcal.ac.in',
      'jananis2027@email.iimcal.ac.in'
    ),
    false
  );
$$;

grant execute on function public.is_admin() to anon, authenticated;

-- 2. Enable RLS
alter table public.courts enable row level security;
alter table public.sports enable row level security;
alter table public.events enable row level security;
alter table public.slots  enable row level security;
alter table public.photos enable row level security;

-- 3. courts: public read, admin write
create policy "courts_public_read" on public.courts
  for select using (true);
create policy "courts_admin_insert" on public.courts
  for insert with check (is_admin());
create policy "courts_admin_update" on public.courts
  for update using (is_admin()) with check (is_admin());
create policy "courts_admin_delete" on public.courts
  for delete using (is_admin());

-- 4. sports: public read, admin write
create policy "sports_public_read" on public.sports
  for select using (true);
create policy "sports_admin_insert" on public.sports
  for insert with check (is_admin());
create policy "sports_admin_update" on public.sports
  for update using (is_admin()) with check (is_admin());
create policy "sports_admin_delete" on public.sports
  for delete using (is_admin());

-- 5. events: public read, admin write
create policy "events_public_read" on public.events
  for select using (true);
create policy "events_admin_insert" on public.events
  for insert with check (is_admin());
create policy "events_admin_update" on public.events
  for update using (is_admin()) with check (is_admin());
create policy "events_admin_delete" on public.events
  for delete using (is_admin());

-- 6. photos: public read only active photos (admins see all), admin write
create policy "photos_public_read" on public.photos
  for select using (is_active = true or is_admin());
create policy "photos_admin_insert" on public.photos
  for insert with check (is_admin());
create policy "photos_admin_update" on public.photos
  for update using (is_admin()) with check (is_admin());
create policy "photos_admin_delete" on public.photos
  for delete using (is_admin());

-- 7. slots: public read; signed-in users may book a free slot for themselves
--    or cancel their own booking; admins may update any slot.
--    Kept as ONE policy (not three) so a user booking a free slot can't
--    piggyback on the looser WITH CHECK of the "cancel own" or "admin" cases.
create policy "slots_public_read" on public.slots
  for select using (true);

create policy "slots_update" on public.slots
  for update
  using (
    is_admin()
    or (is_booked = false and auth.uid() is not null)
    or (user_id = auth.uid())
  )
  with check (
    is_admin()
    or user_id = auth.uid()
    or user_id is null
  );

-- No insert/delete policies for slots: the app never inserts or deletes rows
-- in this table client-side (slots are seeded some other way). If that's
-- wrong, tell me and I'll add the appropriate policy.
