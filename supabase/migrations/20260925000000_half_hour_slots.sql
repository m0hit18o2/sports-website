-- Switch the daily slot-generation job (jobid 4) from hourly to half-hourly
-- blocks, and align its window to 4 PM–4 AM (dropping the previously
-- inconsistent extra 04:00–05:00 hour that never matched the manual
-- backfill or observed data).
select cron.alter_job(
  4,
  command := $$
  insert into slots (court_id, date, start_time, end_time, is_booked)
  select
    c.id,
    current_date,
    (time '16:00' + (n * 30 || ' minutes')::interval)::time,
    (time '16:30' + (n * 30 || ' minutes')::interval)::time,
    false
  from courts c
  cross join generate_series(0, 15) as n
  where c.name in ('Multicourt - Basketball', 'Multicourt - Futsal', 'Multicourt - Tennis')
  on conflict do nothing;

  insert into slots (court_id, date, start_time, end_time, is_booked)
  select
    c.id,
    current_date + 1,
    (time '00:00' + (n * 30 || ' minutes')::interval)::time,
    (time '00:30' + (n * 30 || ' minutes')::interval)::time,
    false
  from courts c
  cross join generate_series(0, 7) as n
  where c.name in ('Multicourt - Basketball', 'Multicourt - Futsal', 'Multicourt - Tennis')
  on conflict do nothing;
  $$
);
