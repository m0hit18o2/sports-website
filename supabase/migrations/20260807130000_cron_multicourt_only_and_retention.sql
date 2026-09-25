-- 1. Restrict the daily slot-generation job (jobid 4, "generate-daily-slots")
--    to just the 3 bookable Multicourt sections instead of cross-joining
--    all courts.
select cron.alter_job(
  4,
  command := $$
  insert into slots (court_id, date, start_time, end_time, is_booked)
  select
    c.id,
    current_date,
    (time '16:00' + (n || ' hours')::interval)::time,
    (time '17:00' + (n || ' hours')::interval)::time,
    false
  from courts c
  cross join generate_series(0, 7) as n
  where c.name in ('Multicourt - Basketball', 'Multicourt - Futsal', 'Multicourt - Tennis')
  on conflict do nothing;

  insert into slots (court_id, date, start_time, end_time, is_booked)
  select
    c.id,
    current_date + 1,
    (time '00:00' + (n || ' hours')::interval)::time,
    (time '01:00' + (n || ' hours')::interval)::time,
    false
  from courts c
  cross join generate_series(0, 4) as n
  where c.name in ('Multicourt - Basketball', 'Multicourt - Futsal', 'Multicourt - Tennis')
  on conflict do nothing;
  $$
);

-- 2. New daily job: prune slots older than a rolling 7-day window, so the
--    table doesn't grow unbounded now that generation runs indefinitely.
select cron.schedule(
  'delete_old_slots',
  '0 4 * * *',
  $$ delete from public.slots where date < (current_date - interval '7 days'); $$
);

-- 3. One-time cleanup: apply that same 7-day retention to the existing
--    backlog right now, instead of waiting a week for it to age out.
delete from public.slots where date < (current_date - interval '7 days');
