create or replace function public.apply_public_rate_limit(
  p_scope_key text,
  p_survey_link_id uuid,
  p_source text,
  p_window_start timestamptz,
  p_expires_at timestamptz,
  p_limit integer
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request_count integer;
begin
  if p_scope_key is null or length(trim(p_scope_key)) = 0 then
    raise exception 'invalid_scope_key';
  end if;

  if p_source not in ('qr', 'device') then
    raise exception 'invalid_source';
  end if;

  if p_limit <= 0 then
    raise exception 'invalid_limit';
  end if;

  insert into public.rate_limit_counters (
    scope_key,
    survey_link_id,
    source,
    window_start,
    request_count,
    expires_at,
    updated_at
  )
  values (
    p_scope_key,
    p_survey_link_id,
    p_source,
    p_window_start,
    1,
    p_expires_at,
    now()
  )
  on conflict (scope_key, window_start)
  do update set
    request_count = public.rate_limit_counters.request_count + 1,
    updated_at = now(),
    expires_at = greatest(public.rate_limit_counters.expires_at, excluded.expires_at)
  returning request_count into v_request_count;

  return v_request_count <= p_limit;
end;
$$;

revoke all on function public.apply_public_rate_limit(text, uuid, text, timestamptz, timestamptz, integer) from public;
grant execute on function public.apply_public_rate_limit(text, uuid, text, timestamptz, timestamptz, integer) to service_role;
