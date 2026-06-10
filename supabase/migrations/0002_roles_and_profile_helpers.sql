alter table public.user_profiles
  add constraint user_profiles_role_check
  check (role in ('platform_admin', 'restaurant_admin', 'manager'));

alter table public.user_profiles
  add constraint user_profiles_status_check
  check (status in ('active', 'invited', 'inactive'));

alter table public.user_profiles
  add constraint user_profiles_role_restaurant_scope_check
  check (
    (role = 'platform_admin' and restaurant_id is null)
    or (role in ('restaurant_admin', 'manager') and restaurant_id is not null)
  );

alter table public.manager_branch_assignments
  add constraint manager_branch_assignments_status_check
  check (status in ('active', 'inactive'));

create or replace function public.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_profiles up
    where up.id = auth.uid()
      and up.role = 'platform_admin'
      and up.status = 'active'
  );
$$;

create or replace function public.current_restaurant_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select up.restaurant_id
  from public.user_profiles up
  where up.id = auth.uid()
    and up.status = 'active'
  limit 1;
$$;

create or replace function public.is_restaurant_admin(target_restaurant_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_profiles up
    where up.id = auth.uid()
      and up.role = 'restaurant_admin'
      and up.status = 'active'
      and up.restaurant_id = target_restaurant_id
  );
$$;

create or replace function public.is_manager_of_branch(target_branch_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_profiles up
    join public.manager_branch_assignments mba
      on mba.manager_user_id = up.id
     and mba.restaurant_id = up.restaurant_id
     and mba.status = 'active'
    join public.branches b
      on b.id = mba.branch_id
     and b.restaurant_id = up.restaurant_id
    where up.id = auth.uid()
      and up.role = 'manager'
      and up.status = 'active'
      and mba.branch_id = target_branch_id
  );
$$;

revoke all on function public.is_platform_admin() from public;
revoke all on function public.current_restaurant_id() from public;
revoke all on function public.is_restaurant_admin(uuid) from public;
revoke all on function public.is_manager_of_branch(uuid) from public;

grant execute on function public.is_platform_admin() to authenticated;
grant execute on function public.current_restaurant_id() to authenticated;
grant execute on function public.is_restaurant_admin(uuid) to authenticated;
grant execute on function public.is_manager_of_branch(uuid) to authenticated;
