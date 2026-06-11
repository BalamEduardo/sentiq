create unique index rate_limit_counters_scope_key_window_start_unique_idx
  on public.rate_limit_counters (scope_key, window_start);
