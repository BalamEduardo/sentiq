# RLS permission matrix

Fuentes locales revisadas:

- `supabase/migrations/0002_roles_and_profile_helpers.sql`
- `supabase/migrations/0003_lock_down_role_helper_grants.sql`
- `supabase/migrations/0004_enable_rls_and_policies.sql`
- `supabase/migrations/0007_apply_public_rate_limit_function.sql`

Esta matriz describe lo verificable hoy en RLS. No reemplaza pruebas contra Supabase local; las consultas manuales estan en `docs/security/rls-test-queries.sql`.

Validacion Supabase realizada contra proyecto `sentiq` (`wdurjrzkfjnlaatenwnb`):

- `pg_policies` confirma las policies listadas en esta matriz para las tablas cubiertas.
- `anon` con `select count(*) from public.restaurants` observo `0` filas.
- `authenticated` sin perfil con `select count(*) from public.restaurants` observo `0` filas.
- `authenticated` sin perfil con `select count(*) from public.rate_limit_counters` observo `0` filas.
- La matriz multi-restaurante se ejecuto con fixtures dentro de una transaccion remota y `ROLLBACK` mediante `.codex-local/rls-matrix-runner.sql`.
- Verificacion posterior: `select count(*) from public.restaurants where slug in ('rls-restaurant-a','rls-restaurant-b')` devolvio `0`, confirmando que los fixtures no persistieron.
- Los casos `Anon no inserta feedback directo` y `No delete directo` no fueron parte de los 13 casos ejecutados en el runner; quedan documentados como pendientes de ejecucion manual.

Leyenda de celdas:

- `Permitido`: la policy permite la operacion cuando se cumple el alcance descrito.
- `Denegado`: RLS no tiene policy aplicable o el helper devuelve false.
- `Policy/helper`: nombre de policy o helper RLS relacionado.
- `Evidencia esperada`: query devuelve filas, cero filas o falla por RLS.

Actores:

- `public / anon`: request sin rol `authenticated`.
- `authenticated sin perfil`: usuario autenticado sin `user_profiles` activo.
- `platform_admin`: `user_profiles.role = 'platform_admin'`, `status = 'active'`, `restaurant_id is null`.
- `restaurant_admin`: `user_profiles.role = 'restaurant_admin'`, `status = 'active'`, scope por `restaurant_id`.
- `manager`: `user_profiles.role = 'manager'`, `status = 'active'`, scope por sucursales activas en `manager_branch_assignments`.

Helpers base:

| Helper | Intencion | Evidencia esperada |
| --- | --- | --- |
| `public.is_platform_admin()` | True solo para perfil activo `platform_admin`. | `select public.is_platform_admin()` true solo con JWT del platform admin. |
| `public.current_restaurant_id()` | Devuelve restaurante del perfil activo. | Para `restaurant_admin`/`manager`, devuelve su restaurante; para sin perfil, null. |
| `public.is_restaurant_admin(uuid)` | True solo si el usuario es admin activo del restaurante target. | True para restaurante propio; false para otro restaurante. |
| `public.is_manager_of_branch(uuid)` | True solo si el manager activo tiene asignacion activa a la sucursal target. | True para sucursal asignada; false para sucursal no asignada. |

## Matriz por tabla

### restaurants

| Actor | select | insert | update | delete |
| --- | --- | --- | --- | --- |
| public / anon | Denegado. Sin policy `anon`. Evidencia: cero filas o permiso denegado. | Denegado. Sin policy. Evidencia: falla por RLS. | Denegado. Sin policy. Evidencia: falla por RLS. | Denegado. No policy delete. Evidencia: falla por RLS. |
| authenticated sin perfil | Denegado. `is_platform_admin()` false y `current_restaurant_id()` null. Evidencia: cero filas. | Denegado. `restaurants_insert_platform_admin`. Evidencia: falla por RLS. | Denegado. `restaurants_update_platform_admin`. Evidencia: falla por RLS. | Denegado. No policy delete. |
| platform_admin | Permitido todos los restaurantes. `restaurants_select_authenticated` + `is_platform_admin()`. Evidencia: ve A y B. | Permitido. `restaurants_insert_platform_admin`. Evidencia: insert OK. | Permitido. `restaurants_update_platform_admin`. Evidencia: update OK. | Denegado. No policy delete. |
| restaurant_admin | Permitido solo su restaurante. `id = current_restaurant_id()`. Evidencia: admin A ve A, no B. | Denegado. Solo platform admin. | Denegado. Solo platform admin. | Denegado. No policy delete. |
| manager | Permitido solo su restaurante por `current_restaurant_id()`. Evidencia: manager A ve A, no B. | Denegado. Solo platform admin. | Denegado. Solo platform admin. | Denegado. No policy delete. |

### restaurant_accounts

| Actor | select | insert | update | delete |
| --- | --- | --- | --- | --- |
| public / anon | Denegado. Sin policy `anon`. | Denegado. Sin policy. | Denegado. Sin policy. | Denegado. No policy delete. |
| authenticated sin perfil | Denegado. Helpers false/null. | Denegado. Solo platform admin. | Denegado. Solo platform admin. | Denegado. No policy delete. |
| platform_admin | Permitido todos. `restaurant_accounts_select_authenticated`. Evidencia: ve cuentas A y B. | Permitido. `restaurant_accounts_insert_platform_admin`. | Permitido. `restaurant_accounts_update_platform_admin`. | Denegado. No policy delete. |
| restaurant_admin | Permitido solo cuenta de su restaurante. `is_restaurant_admin(restaurant_id)`. Evidencia: admin A ve A, no B. | Denegado. Solo platform admin. | Denegado. Solo platform admin. | Denegado. No policy delete. |
| manager | Denegado. No condicion manager. Evidencia: cero filas. | Denegado. | Denegado. | Denegado. |

### restaurant_settings

| Actor | select | insert | update | delete |
| --- | --- | --- | --- | --- |
| public / anon | Denegado. Sin policy `anon`. | Denegado. | Denegado. | Denegado. No policy delete. |
| authenticated sin perfil | Denegado. Helpers false/null. | Denegado. | Denegado. | Denegado. |
| platform_admin | Permitido todos. `restaurant_settings_select_authenticated`. | Permitido. `restaurant_settings_insert_admins`. | Permitido. `restaurant_settings_update_admins`. | Denegado. No policy delete. |
| restaurant_admin | Permitido solo su restaurante. `restaurant_id = current_restaurant_id()`. | Permitido solo su restaurante. `is_restaurant_admin(restaurant_id)`. | Permitido solo su restaurante. | Denegado. |
| manager | Select permitido para su restaurante por `current_restaurant_id()`. Insert/update denegado porque no es admin. Evidencia: puede leer settings A, no escribir. | Denegado. | Denegado. | Denegado. |

### branches

| Actor | select | insert | update | delete |
| --- | --- | --- | --- | --- |
| public / anon | Denegado. | Denegado. | Denegado. | Denegado. |
| authenticated sin perfil | Denegado. | Denegado. | Denegado. | Denegado. |
| platform_admin | Permitido todas. `branches_select_authenticated`. | Permitido. `branches_insert_admins`. | Permitido. `branches_update_admins`. | Denegado. |
| restaurant_admin | Permitido solo su restaurante. `is_restaurant_admin(restaurant_id)`. | Permitido solo su restaurante. | Permitido solo su restaurante. | Denegado. |
| manager | Permitido solo sucursales asignadas. `is_manager_of_branch(id)`. Evidencia: ve branch A1 asignada, no A2 ni B1. | Denegado. | Denegado. | Denegado. |

### zones

| Actor | select | insert | update | delete |
| --- | --- | --- | --- | --- |
| public / anon | Denegado. | Denegado. | Denegado. | Denegado. |
| authenticated sin perfil | Denegado. | Denegado. | Denegado. | Denegado. |
| platform_admin | Permitido todas. `zones_select_authenticated`. | Permitido si branch/restaurante existen y coinciden. `zones_insert_admins`. | Permitido si branch/restaurante existen y coinciden. `zones_update_admins`. | Denegado. |
| restaurant_admin | Permitido solo su restaurante. | Permitido solo su restaurante y branch consistente. | Permitido solo su restaurante y branch consistente. | Denegado. |
| manager | Permitido solo zonas de sucursales asignadas. `is_manager_of_branch(branch_id)`. | Denegado. | Denegado. | Denegado. |

### user_profiles

| Actor | select | insert | update | delete |
| --- | --- | --- | --- | --- |
| public / anon | Denegado. | Denegado. No insert policy. | Denegado. | Denegado. |
| authenticated sin perfil | Permitido solo si existe su propia fila por `id = auth.uid()`; si no tiene perfil, cero filas. | Denegado. | Denegado. | Denegado. |
| platform_admin | Permitido todos. `user_profiles_select_authenticated`. | Denegado. No insert policy. | Permitido todos. `user_profiles_update_platform_admin`. | Denegado. |
| restaurant_admin | Permitido perfiles de su restaurante y su propio perfil. `user_profiles_select_authenticated`. | Denegado. | Permitido solo actualizar perfiles `manager` de su restaurante. `user_profiles_update_restaurant_admin_managers`. | Denegado. |
| manager | Permitido su propio perfil por `id = auth.uid()`. No ve otros managers por sucursal. | Denegado. | Denegado. | Denegado. |

### manager_branch_assignments

| Actor | select | insert | update | delete |
| --- | --- | --- | --- | --- |
| public / anon | Denegado. | Denegado. | Denegado. | Denegado. |
| authenticated sin perfil | Denegado salvo filas donde `manager_user_id = auth.uid()`; sin perfil normalmente cero filas. | Denegado. | Denegado. | Denegado. |
| platform_admin | Permitido todas. `manager_branch_assignments_select_authenticated`. | Permitido si manager y branch pertenecen al restaurante indicado. | Permitido bajo misma consistencia. | Denegado. |
| restaurant_admin | Permitido asignaciones de su restaurante. | Permitido para managers/branches de su restaurante. | Permitido para managers/branches de su restaurante. | Denegado. |
| manager | Permitido solo sus asignaciones. `manager_user_id = auth.uid()`. | Denegado. | Denegado. | Denegado. |

### waiters

| Actor | select | insert | update | delete |
| --- | --- | --- | --- | --- |
| public / anon | Denegado. | Denegado. | Denegado. | Denegado. |
| authenticated sin perfil | Denegado. | Denegado. | Denegado. | Denegado. |
| platform_admin | Denegado actualmente. No condicion `is_platform_admin()` en `waiters_select_authenticated`. Evidencia: cero filas. | Denegado. | Denegado. | Denegado. |
| restaurant_admin | Permitido solo su restaurante. `waiters_select_authenticated`. | Permitido solo su restaurante y branch consistente. `waiters_insert_restaurant_admin`. | Permitido solo su restaurante y branch consistente. | Denegado. |
| manager | Permitido solo sucursal asignada. `is_manager_of_branch(branch_id)`. | Denegado. | Denegado. | Denegado. |

### devices

| Actor | select | insert | update | delete |
| --- | --- | --- | --- | --- |
| public / anon | Denegado. | Denegado. | Denegado. | Denegado. |
| authenticated sin perfil | Denegado. | Denegado. | Denegado. | Denegado. |
| platform_admin | Permitido todos. `devices_select_authenticated`. | Permitido si branch y zone coinciden con restaurante. `devices_insert_admins`. | Permitido bajo misma consistencia. `devices_update_admins`. | Denegado. |
| restaurant_admin | Permitido solo su restaurante. | Permitido solo su restaurante y branch/zone consistente. | Permitido solo su restaurante y branch/zone consistente. | Denegado. |
| manager | Permitido solo sucursal asignada. `is_manager_of_branch(branch_id)`. | Denegado. | Denegado. | Denegado. |

### survey_links

| Actor | select | insert | update | delete |
| --- | --- | --- | --- | --- |
| public / anon | Denegado. No lectura directa de tokens. | Denegado. | Denegado. | Denegado. |
| authenticated sin perfil | Denegado. | Denegado. | Denegado. | Denegado. |
| platform_admin | Permitido todos. `survey_links_select_authenticated`. | Denegado actualmente. No insert policy. | Denegado actualmente. No update policy. | Denegado. |
| restaurant_admin | Permitido solo su restaurante. | Denegado actualmente. | Denegado actualmente. | Denegado. |
| manager | Permitido solo sucursal asignada. | Denegado. | Denegado. | Denegado. |

### feedback_responses

| Actor | select | insert | update | delete |
| --- | --- | --- | --- | --- |
| public / anon | Denegado. Publico no inserta directo; entra por Edge Function `submit_feedback`. | Denegado. Sin policy insert. | Denegado. | Denegado. |
| authenticated sin perfil | Denegado. | Denegado. | Denegado. | Denegado. |
| platform_admin | Denegado por defecto. No condicion platform admin. Evidencia: cero filas. | Denegado. | Denegado. | Denegado. |
| restaurant_admin | Permitido solo respuestas de su restaurante. `feedback_responses_select_restaurant_roles`. Incluye `customer_phone` cuando existe y por alcance. | Denegado. Insercion publica debe pasar por Edge Function. | Denegado. | Denegado. |
| manager | Permitido solo respuestas de sucursal asignada. `is_manager_of_branch(branch_id)`. Incluye telefono por alcance si el rol conserva permiso funcional. | Denegado. | Denegado. | Denegado. |

### feedback_alerts

| Actor | select | insert | update | delete |
| --- | --- | --- | --- | --- |
| public / anon | Denegado. | Denegado. | Denegado. | Denegado. |
| authenticated sin perfil | Denegado. | Denegado. | Denegado. | Denegado. |
| platform_admin | Denegado por defecto. No condicion platform admin. | Denegado. | Denegado actualmente. | Denegado. |
| restaurant_admin | Permitido solo alertas de su restaurante. `feedback_alerts_select_restaurant_roles`. | Denegado. | Denegado actualmente. | Denegado. |
| manager | Permitido solo alertas de sucursal asignada. | Denegado. | Denegado actualmente. | Denegado. |

### rate_limit_counters

| Actor | select | insert | update | delete |
| --- | --- | --- | --- | --- |
| public / anon | Denegado. No accesible desde frontend. | Denegado. La mutacion debe ocurrir por `apply_public_rate_limit` con `service_role`. | Denegado. | Denegado. |
| authenticated sin perfil | Denegado. | Denegado. | Denegado. | Denegado. |
| platform_admin | Denegado. Sin policies. | Denegado. | Denegado. | Denegado. |
| restaurant_admin | Denegado. Sin policies. | Denegado. | Denegado. | Denegado. |
| manager | Denegado. Sin policies. | Denegado. | Denegado. | Denegado. |

## Casos criticos obligatorios

| Caso | Estado esperado | Evidencia minima |
| --- | --- | --- |
| Aislamiento entre dos restaurantes | Admin/manager de A no ve datos de B. | Queries con actor A contra `restaurants`, `branches`, `zones`, `devices`, `survey_links`, `feedback_responses`, `feedback_alerts` devuelven solo A o cero B. |
| `restaurant_admin` solo ve su restaurante | Permitido por `current_restaurant_id()` o `is_restaurant_admin(restaurant_id)`. | Admin A ve restaurante A, cuenta A, settings A, branches A, responses A; no ve B. |
| `manager` solo ve sucursales asignadas | Permitido por `is_manager_of_branch(branch_id)` o `id`. | Manager A ve branch A1, zone A1, response A1; no ve A2 ni B1. |
| `manager` no ve sucursales no asignadas | Debe devolver cero filas. | `select * from branches where id = branch_a2` devuelve cero filas. |
| `manager` no administra configuracion | `restaurant_settings` insert/update denegado; `branches/zones/devices/waiters/survey_links` insert/update denegado. | Mutaciones fallan por RLS. |
| `platform_admin` ve restaurantes/agregados, no respuestas individuales por defecto | Ve `restaurants`, `restaurant_accounts`, `settings`, `branches`, `zones`, `devices`, `survey_links`; no ve `feedback_responses` ni `feedback_alerts`. | Select platform admin: responses/alerts cero filas. |
| public/anon no puede leer tablas internas | Sin policies `anon` en tablas internas. | Select anon devuelve cero filas o permiso denegado. |
| public/anon no inserta feedback directo | No hay insert policy en `feedback_responses`. | Insert anon falla; la ruta valida es Edge Function `submit_feedback`. |
| `rate_limit_counters` no es accesible desde frontend | Sin policies; funcion `apply_public_rate_limit` solo `service_role`. | Select/insert authenticated fallan o devuelven cero. |
| Telefono del cliente final por alcance | `customer_phone` vive en `feedback_responses`; visible solo si el rol puede seleccionar esa respuesta. | Admin A/manager A1 ven telefono de A/A1; no ven telefonos B o A2 no asignada. |
| No delete directo en tablas de negocio | No hay policies `delete`. | Deletes fallan por RLS en todas las tablas listadas. |

## Hallazgos RLS / gaps documentados

1. `survey_links` no tiene policies de insert/update. Esto bloquea gestion directa de links desde configuracion hasta que exista policy o Edge Function especifica.
2. `feedback_alerts` no tiene policy de update. Atender alertas desde frontend requerira policy o Edge Function.
3. `user_profiles` no tiene insert policy. Alta de perfiles requiere flujo separado seguro; no debe asumirse desde pantallas.
4. `waiters` no incluye `platform_admin` en select. Puede ser intencional si platform admin no administra datos operativos finos; si se requiere soporte global, debe definirse en otro ticket.
5. `restaurant_settings` permite select a `manager` por `restaurant_id = current_restaurant_id()`, aunque T-009 oculta configuracion en frontend. Si la regla de seguridad buscada es "manager no lee configuracion", se requiere ajuste RLS en ticket separado.
6. Supabase advisor reporta `rate_limit_counters` con RLS habilitado y sin policies. Para este ticket coincide con "no accesible desde frontend"; mantenerlo documentado como intencional o crear comentario/migration futura que lo haga explicito.
7. Supabase advisor reporta helpers `SECURITY DEFINER` ejecutables por `authenticated`: `current_restaurant_id`, `is_manager_of_branch`, `is_platform_admin`, `is_restaurant_admin`. Estan usados por RLS y actualmente tienen grants intencionales a `authenticated`, pero Supabase recomienda revisar si deben moverse fuera del schema expuesto o dejar de ser RPC-callables.

## Checklist de evidencia

Completar al ejecutar `docs/security/rls-test-queries.sql` en Supabase local.

| Caso | Actor | Query | Resultado esperado | Resultado observado | Status |
| --- | --- | --- | --- | --- | --- |
| Admin A no ve restaurante B | restaurant_admin A | `select id from restaurants where id = :restaurant_b;` | 0 filas | 0 | OK |
| Admin A ve solo restaurante A | restaurant_admin A | `select count(*) from restaurants;` | 1 fila visible | 1 | OK |
| Manager ve sucursal asignada | manager A1 | `select id from branches where id = :branch_a1;` | 1 fila | 1 | OK |
| Manager no ve sucursal no asignada | manager A1 | `select id from branches where id = :branch_a2;` | 0 filas | 0 | OK |
| Manager no ve sucursal de otro restaurante | manager A1 | `select id from branches where id = :branch_b1;` | 0 filas | 0 | OK |
| Manager no administra settings | manager A1 | `update restaurant_settings set primary_color = '#111111' where restaurant_id = :restaurant_a;` | 0 filas actualizadas | 0 filas actualizadas | OK |
| Platform admin ve restaurantes | platform_admin | `select count(*) from restaurants;` | 2 filas visibles | 2 | OK |
| Platform admin no ve respuestas | platform_admin | `select id from feedback_responses;` | 0 filas | 0 | OK |
| Platform admin no ve alertas | platform_admin | `select id from feedback_alerts;` | 0 filas | 0 | OK |
| Anon no lee tablas internas | anon | `select count(*) from restaurants;` | 0 filas visibles | 0 | OK en Supabase remoto |
| Anon no inserta feedback directo | anon | `insert into feedback_responses (...) values (...);` | Falla por RLS | Pendiente; no fue parte de los 13 casos del runner | Pendiente de ejecucion manual |
| Auth sin perfil no ve restaurantes | authenticated sin perfil | `select count(*) from restaurants;` | 0 filas visibles | 0 | OK en Supabase remoto |
| Rate limit no accesible desde frontend | authenticated sin perfil | `select count(*) from rate_limit_counters;` | 0 filas visibles | 0 | OK en Supabase remoto |
| Telefono solo por alcance | manager A1 | `select customer_phone from feedback_responses;` | Solo telefono branch A1 | `1:5551110001` | OK |
| No delete directo | restaurant_admin A | `delete from branches where restaurant_id = :restaurant_a;` | Falla por RLS | Pendiente; no fue parte de los 13 casos del runner | Pendiente de ejecucion manual |

## Condicion antes de construir dashboard/respuestas/alertas/configuracion

Antes de considerar listas esas pantallas, mantener esta matriz como regresion manual cuando cambien policies. Cualquier divergencia debe convertirse en issue RLS antes de depender de la UI. En particular, dashboard/respuestas/alertas dependen del aislamiento por restaurante/sucursal; configuracion depende de decidir si `manager` puede leer `restaurant_settings` y de crear un flujo seguro para `survey_links`, perfiles y atencion de alertas.
