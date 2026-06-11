alter table public.restaurants enable row level security;
alter table public.restaurant_accounts enable row level security;
alter table public.restaurant_settings enable row level security;
alter table public.branches enable row level security;
alter table public.zones enable row level security;
alter table public.user_profiles enable row level security;
alter table public.manager_branch_assignments enable row level security;
alter table public.waiters enable row level security;
alter table public.devices enable row level security;
alter table public.survey_links enable row level security;
alter table public.feedback_responses enable row level security;
alter table public.feedback_alerts enable row level security;
alter table public.rate_limit_counters enable row level security;

create policy restaurants_select_authenticated
on public.restaurants
for select
to authenticated
using (public.is_platform_admin() or id = public.current_restaurant_id());

create policy restaurants_insert_platform_admin
on public.restaurants
for insert
to authenticated
with check (public.is_platform_admin());

create policy restaurants_update_platform_admin
on public.restaurants
for update
to authenticated
using (public.is_platform_admin())
with check (public.is_platform_admin());

create policy restaurant_accounts_select_authenticated
on public.restaurant_accounts
for select
to authenticated
using (
  public.is_platform_admin()
  or public.is_restaurant_admin(restaurant_id)
);

create policy restaurant_accounts_insert_platform_admin
on public.restaurant_accounts
for insert
to authenticated
with check (public.is_platform_admin());

create policy restaurant_accounts_update_platform_admin
on public.restaurant_accounts
for update
to authenticated
using (public.is_platform_admin())
with check (public.is_platform_admin());

create policy restaurant_settings_select_authenticated
on public.restaurant_settings
for select
to authenticated
using (
  public.is_platform_admin()
  or restaurant_id = public.current_restaurant_id()
);

create policy restaurant_settings_insert_admins
on public.restaurant_settings
for insert
to authenticated
with check (
  public.is_platform_admin()
  or public.is_restaurant_admin(restaurant_id)
);

create policy restaurant_settings_update_admins
on public.restaurant_settings
for update
to authenticated
using (
  public.is_platform_admin()
  or public.is_restaurant_admin(restaurant_id)
)
with check (
  public.is_platform_admin()
  or public.is_restaurant_admin(restaurant_id)
);

create policy branches_select_authenticated
on public.branches
for select
to authenticated
using (
  public.is_platform_admin()
  or public.is_restaurant_admin(restaurant_id)
  or public.is_manager_of_branch(id)
);

create policy branches_insert_admins
on public.branches
for insert
to authenticated
with check (
  public.is_platform_admin()
  or public.is_restaurant_admin(restaurant_id)
);

create policy branches_update_admins
on public.branches
for update
to authenticated
using (
  public.is_platform_admin()
  or public.is_restaurant_admin(restaurant_id)
)
with check (
  public.is_platform_admin()
  or public.is_restaurant_admin(restaurant_id)
);

create policy zones_select_authenticated
on public.zones
for select
to authenticated
using (
  public.is_platform_admin()
  or public.is_restaurant_admin(restaurant_id)
  or public.is_manager_of_branch(branch_id)
);

create policy zones_insert_admins
on public.zones
for insert
to authenticated
with check (
  (
    public.is_platform_admin()
    or public.is_restaurant_admin(restaurant_id)
  )
  and exists (
    select 1
    from public.branches b
    where b.id = zones.branch_id
      and b.restaurant_id = zones.restaurant_id
  )
);

create policy zones_update_admins
on public.zones
for update
to authenticated
using (
  public.is_platform_admin()
  or public.is_restaurant_admin(restaurant_id)
)
with check (
  (
    public.is_platform_admin()
    or public.is_restaurant_admin(restaurant_id)
  )
  and exists (
    select 1
    from public.branches b
    where b.id = zones.branch_id
      and b.restaurant_id = zones.restaurant_id
  )
);

create policy user_profiles_select_authenticated
on public.user_profiles
for select
to authenticated
using (
  id = auth.uid()
  or public.is_platform_admin()
  or public.is_restaurant_admin(restaurant_id)
);

create policy user_profiles_update_platform_admin
on public.user_profiles
for update
to authenticated
using (public.is_platform_admin())
with check (public.is_platform_admin());

create policy user_profiles_update_restaurant_admin_managers
on public.user_profiles
for update
to authenticated
using (
  role = 'manager'
  and public.is_restaurant_admin(restaurant_id)
)
with check (
  role = 'manager'
  and public.is_restaurant_admin(restaurant_id)
);

create policy manager_branch_assignments_select_authenticated
on public.manager_branch_assignments
for select
to authenticated
using (
  public.is_platform_admin()
  or public.is_restaurant_admin(restaurant_id)
  or manager_user_id = auth.uid()
);

create policy manager_branch_assignments_insert_admins
on public.manager_branch_assignments
for insert
to authenticated
with check (
  (
    public.is_platform_admin()
    or public.is_restaurant_admin(restaurant_id)
  )
  and exists (
    select 1
    from public.user_profiles up
    where up.id = manager_branch_assignments.manager_user_id
      and up.role = 'manager'
      and up.restaurant_id = manager_branch_assignments.restaurant_id
  )
  and exists (
    select 1
    from public.branches b
    where b.id = manager_branch_assignments.branch_id
      and b.restaurant_id = manager_branch_assignments.restaurant_id
  )
);

create policy manager_branch_assignments_update_admins
on public.manager_branch_assignments
for update
to authenticated
using (
  public.is_platform_admin()
  or public.is_restaurant_admin(restaurant_id)
)
with check (
  (
    public.is_platform_admin()
    or public.is_restaurant_admin(restaurant_id)
  )
  and exists (
    select 1
    from public.user_profiles up
    where up.id = manager_branch_assignments.manager_user_id
      and up.role = 'manager'
      and up.restaurant_id = manager_branch_assignments.restaurant_id
  )
  and exists (
    select 1
    from public.branches b
    where b.id = manager_branch_assignments.branch_id
      and b.restaurant_id = manager_branch_assignments.restaurant_id
  )
);

create policy waiters_select_authenticated
on public.waiters
for select
to authenticated
using (
  public.is_restaurant_admin(restaurant_id)
  or public.is_manager_of_branch(branch_id)
);

create policy waiters_insert_restaurant_admin
on public.waiters
for insert
to authenticated
with check (
  public.is_restaurant_admin(restaurant_id)
  and exists (
    select 1
    from public.branches b
    where b.id = waiters.branch_id
      and b.restaurant_id = waiters.restaurant_id
  )
);

create policy waiters_update_restaurant_admin
on public.waiters
for update
to authenticated
using (public.is_restaurant_admin(restaurant_id))
with check (
  public.is_restaurant_admin(restaurant_id)
  and exists (
    select 1
    from public.branches b
    where b.id = waiters.branch_id
      and b.restaurant_id = waiters.restaurant_id
  )
);

create policy devices_select_authenticated
on public.devices
for select
to authenticated
using (
  public.is_platform_admin()
  or public.is_restaurant_admin(restaurant_id)
  or public.is_manager_of_branch(branch_id)
);

create policy devices_insert_admins
on public.devices
for insert
to authenticated
with check (
  (
    public.is_platform_admin()
    or public.is_restaurant_admin(restaurant_id)
  )
  and exists (
    select 1
    from public.branches b
    where b.id = devices.branch_id
      and b.restaurant_id = devices.restaurant_id
  )
  and (
    zone_id is null
    or exists (
      select 1
      from public.zones z
      where z.id = devices.zone_id
        and z.branch_id = devices.branch_id
        and z.restaurant_id = devices.restaurant_id
    )
  )
);

create policy devices_update_admins
on public.devices
for update
to authenticated
using (
  public.is_platform_admin()
  or public.is_restaurant_admin(restaurant_id)
)
with check (
  (
    public.is_platform_admin()
    or public.is_restaurant_admin(restaurant_id)
  )
  and exists (
    select 1
    from public.branches b
    where b.id = devices.branch_id
      and b.restaurant_id = devices.restaurant_id
  )
  and (
    zone_id is null
    or exists (
      select 1
      from public.zones z
      where z.id = devices.zone_id
        and z.branch_id = devices.branch_id
        and z.restaurant_id = devices.restaurant_id
    )
  )
);

create policy survey_links_select_authenticated
on public.survey_links
for select
to authenticated
using (
  public.is_platform_admin()
  or public.is_restaurant_admin(restaurant_id)
  or public.is_manager_of_branch(branch_id)
);

create policy feedback_responses_select_restaurant_roles
on public.feedback_responses
for select
to authenticated
using (
  public.is_restaurant_admin(restaurant_id)
  or public.is_manager_of_branch(branch_id)
);

create policy feedback_alerts_select_restaurant_roles
on public.feedback_alerts
for select
to authenticated
using (
  public.is_restaurant_admin(restaurant_id)
  or public.is_manager_of_branch(branch_id)
);
