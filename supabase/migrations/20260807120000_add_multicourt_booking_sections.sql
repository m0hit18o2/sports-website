-- Booking is being restricted to just Multicourt, which is physically split
-- into 3 independently usable sections. Added as new rows rather than
-- touching the existing "Multicourt" row so historical slots/events keep
-- pointing at what they already point at. The existing cron job (jobid 4)
-- that generates daily slots cross-joins `courts` dynamically, so these
-- automatically start getting slots generated with no cron changes needed.
insert into public.courts (name) values
  ('Multicourt - Basketball'),
  ('Multicourt - Futsal'),
  ('Multicourt - Tennis');
