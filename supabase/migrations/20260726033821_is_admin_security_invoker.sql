-- is_admin() only reads auth.jwt(), which every role can already access,
-- so it doesn't need SECURITY DEFINER's elevated privileges.
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
      'jananis2027@email.iimcal.ac.in'
    ),
    false
  );
$$;
