revoke execute on function public.is_platform_admin() from anon;
revoke execute on function public.current_restaurant_id() from anon;
revoke execute on function public.is_restaurant_admin(uuid) from anon;
revoke execute on function public.is_manager_of_branch(uuid) from anon;

revoke execute on function public.is_platform_admin() from service_role;
revoke execute on function public.current_restaurant_id() from service_role;
revoke execute on function public.is_restaurant_admin(uuid) from service_role;
revoke execute on function public.is_manager_of_branch(uuid) from service_role;

grant execute on function public.is_platform_admin() to authenticated;
grant execute on function public.current_restaurant_id() to authenticated;
grant execute on function public.is_restaurant_admin(uuid) to authenticated;
grant execute on function public.is_manager_of_branch(uuid) to authenticated;
