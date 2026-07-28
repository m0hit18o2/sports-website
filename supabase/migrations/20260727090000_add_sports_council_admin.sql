-- Keep is_admin() in sync with lib/admins.ts ADMIN_EMAILS.
create or replace function public.is_admin()
returns boolean
language sql
stable
security invoker
set search_path = public
as $$
  select coalesce(
    (auth.jwt() ->> 'email') in (
      'mohitabinavm2027@email.iimcal.ac.in',
      'jananis2027@email.iimcal.ac.in',
      'sportscouncil@email.iimcal.ac.in'
    ),
    false
  );
$$;
