-- =====================================================================
--  ROLES: DUEÑO (uno solo) y CONTADOR
--  Dueño: ve, carga, modifica, anula y elimina; administra usuarios y parámetros.
--  Contador: ve y carga (transacciones, facturas, cheques, terceros, centros de costo),
--            pero NO modifica ni elimina nada ya cargado.
--  Aplicado en Supabase como migración "05_roles_dueno_y_contador".
-- =====================================================================
alter table perfiles drop constraint if exists perfiles_rol_check;
update perfiles set rol = 'dueno' where rol = 'admin';
alter table perfiles add constraint perfiles_rol_check check (rol in ('dueno','contador'));
create unique index un_solo_dueno on perfiles ((rol)) where rol = 'dueno';

create or replace function public.es_dueno() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from perfiles where id = auth.uid() and activo and rol = 'dueno');
$$;
create or replace function public.es_admin() returns boolean
language sql stable security definer set search_path = public as $$ select public.es_dueno(); $$;
revoke execute on function public.es_dueno() from public, anon;
grant execute on function public.es_dueno() to authenticated;

-- La regla para todas las operaciones (incluye modificar y borrar) queda solo para el dueño
-- (se repite para terceros, centros_costo, cuentas, parametros, cheques, facturas,
--  transacciones, transaccion_pagos, transaccion_retenciones, transaccion_facturas)
alter policy "solo_activos" on transacciones using (public.es_dueno()) with check (public.es_dueno());
-- ... (ídem resto de tablas)

-- Todos los usuarios activos pueden ver y cargar
create policy "activos_ven"    on transacciones for select to authenticated using (public.usuario_activo());
create policy "activos_cargan" on transacciones for insert to authenticated with check (public.usuario_activo());
-- ... (ídem resto de tablas; cuentas y parametros solo "activos_ven")

-- Cambio de estado de cheques permitido al contador solo en el uso diario
-- (endosar/depositar/cobrar/rechazar uno en cartera; debitar/rechazar uno emitido)
create or replace function public.cambiar_estado_cheque(p_id uuid, p_estado estado_cheque) returns void
language plpgsql security definer set search_path = public as $$
declare actual estado_cheque;
begin
  if not public.usuario_activo() then raise exception 'Usuario no habilitado'; end if;
  select estado into actual from cheques where id = p_id;
  if actual is null then raise exception 'Cheque inexistente'; end if;
  if not public.es_dueno() and not (
       (actual = 'en_cartera' and p_estado in ('endosado','depositado','cobrado','rechazado'))
    or (actual = 'emitido'    and p_estado in ('debitado','rechazado'))) then
    raise exception 'Ese cambio de estado del cheque solo lo puede hacer el dueño';
  end if;
  update cheques set estado = p_estado where id = p_id;
end $$;
revoke execute on function public.cambiar_estado_cheque(uuid, estado_cheque) from public, anon;
grant execute on function public.cambiar_estado_cheque(uuid, estado_cheque) to authenticated;
