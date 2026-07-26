insert into storage.buckets (id, name, public)
values ('TeamIcons', 'TeamIcons', true);

create policy "team_icons_public_read" on storage.objects
  for select using (bucket_id = 'TeamIcons');
create policy "team_icons_admin_insert" on storage.objects
  for insert with check (bucket_id = 'TeamIcons' and is_admin());
create policy "team_icons_admin_update" on storage.objects
  for update using (bucket_id = 'TeamIcons' and is_admin()) with check (bucket_id = 'TeamIcons' and is_admin());
create policy "team_icons_admin_delete" on storage.objects
  for delete using (bucket_id = 'TeamIcons' and is_admin());
