-- =====================================================================
--  05 · ROL LECTOR Y ADMINISTRACIÓN DE USUARIOS (ya aplicado en codes-gestion)
--  - perfiles.rol admite 'lector' (solo consulta)
--  - puede_cargar(): dueño y contador; las políticas de alta y las funciones
--    guardar_transaccion / cambiar_estado_cheque la usan, así el lector no escribe
--  - El dueño puede eliminar usuarios (políticas de borrado de perfiles);
--    si cargaron movimientos la base lo impide (hay que desactivarlos)
--  - solicitar_acceso(): quien fue eliminado y vuelve a ingresar queda pendiente de aprobación
-- =====================================================================
alter table perfiles drop constraint perfiles_rol_check;
alter table perfiles add constraint perfiles_rol_check check (rol in ('dueno','contador','lector'));

create or replace function public.puede_cargar() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from perfiles where id = auth.uid() and activo and rol in ('dueno','contador'));
$$;
alter policy activos_cargan on terceros                with check (puede_cargar());
alter policy activos_cargan on centros_costo           with check (puede_cargar());
alter policy activos_cargan on cheques                 with check (puede_cargar());
alter policy activos_cargan on facturas                with check (puede_cargar());
alter policy activos_cargan on transacciones           with check (puede_cargar());
alter policy activos_cargan on transaccion_pagos       with check (puede_cargar());
alter policy activos_cargan on transaccion_retenciones with check (puede_cargar());
alter policy activos_cargan on transaccion_facturas    with check (puede_cargar());
alter policy activos_cargan on tipos_centro            with check (puede_cargar());
-- (cambiar_estado_cheque y guardar_transaccion: ahora validan puede_cargar() en vez de usuario_activo())

create policy dueno_elimina_perfiles on perfiles for delete to authenticated
  using (es_dueno() and id <> auth.uid() and rol <> 'dueno');
create or replace trigger trg_audit_perfiles after update or delete on perfiles
  for each row execute function registrar_auditoria();

create or replace function public.solicitar_acceso() returns void
language plpgsql security definer set search_path = public, auth as $$
declare u auth.users%rowtype;
begin
  if exists (select 1 from perfiles where id = auth.uid()) then return; end if;
  select * into u from auth.users where id = auth.uid();
  if u.id is null then raise exception 'Sin sesión'; end if;
  insert into perfiles (id, nombre, apellido, iniciales, email, rol, activo)
  values (u.id, coalesce(nullif(trim(u.raw_user_meta_data->>'nombre'), ''), split_part(u.email, '@', 1)),
    nullif(trim(u.raw_user_meta_data->>'apellido'), ''),
    upper(coalesce(nullif(trim(u.raw_user_meta_data->>'iniciales'), ''), left(u.email, 2))), u.email, 'contador', false);
end $$;
revoke all on function public.solicitar_acceso() from public, anon;
grant execute on function public.solicitar_acceso() to authenticated;
