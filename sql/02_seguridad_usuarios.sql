-- =====================================================================
--  SEGURIDAD Y USUARIOS (Supabase Auth)
--  - Cualquiera puede registrarse; queda INACTIVO hasta que un admin lo habilita.
--  - Sin usuario activo no se puede leer ni escribir ningún dato.
-- =====================================================================

alter table perfiles
  add column if not exists apellido text,
  add column if not exists email    text,
  add column if not exists rol      text not null default 'contador' check (rol in ('admin','contador'));
alter table perfiles alter column activo set default false;
alter table perfiles add constraint perfiles_iniciales_unicas unique (iniciales);

-- ¿El usuario logueado está habilitado? ¿Es administrador?
create or replace function public.usuario_activo() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from perfiles where id = auth.uid() and activo);
$$;
create or replace function public.es_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from perfiles where id = auth.uid() and activo and rol = 'admin');
$$;

-- Al registrarse alguien, se crea su perfil (inactivo, rol contador)
create or replace function public.crear_perfil_nuevo_usuario() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into perfiles (id, nombre, apellido, iniciales, email, rol, activo)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data->>'nombre'), ''), split_part(new.email, '@', 1)),
    nullif(trim(new.raw_user_meta_data->>'apellido'), ''),
    upper(coalesce(nullif(trim(new.raw_user_meta_data->>'iniciales'), ''), left(new.email, 2))),
    new.email,
    'contador',
    false
  );
  return new;
end $$;
drop trigger if exists trg_crear_perfil on auth.users;
create trigger trg_crear_perfil after insert on auth.users
  for each row execute function public.crear_perfil_nuevo_usuario();

-- Para el formulario de registro: ¿están libres esas iniciales?
create or replace function public.iniciales_disponibles(p text) returns boolean
language sql stable security definer set search_path = public as $$
  select not exists (select 1 from perfiles where iniciales = upper(trim(p)));
$$;
grant execute on function public.iniciales_disponibles(text) to anon, authenticated;

-- Un admin no puede quitarse a sí mismo el rol ni desactivarse (para no quedar sin administradores)
create or replace function public.proteger_admin() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if old.id = auth.uid() and (new.rol <> old.rol or new.activo <> old.activo) then
    raise exception 'No podés cambiar tu propio rol ni desactivarte';
  end if;
  return new;
end $$;
create trigger trg_proteger_admin before update on perfiles
  for each row execute function public.proteger_admin();

-- ---------------------------------------------------------------------
-- Reglas de acceso (RLS): reemplaza "cualquier logueado" por "usuario activo"
-- ---------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array['terceros','centros_costo','cuentas','cheques','facturas',
                           'transacciones','transaccion_pagos','transaccion_retenciones',
                           'transaccion_facturas','parametros']
  loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists "usuarios_autenticados" on %I', t);
    execute format('create policy "solo_usuarios_activos" on %I for all to authenticated using (public.usuario_activo()) with check (public.usuario_activo())', t);
  end loop;
end $$;

drop policy if exists "auditoria_lectura" on auditoria;
create policy "auditoria_lectura" on auditoria for select to authenticated using (public.usuario_activo());

drop policy if exists "usuarios_autenticados" on perfiles;
create policy "perfil_propio_o_activos" on perfiles for select to authenticated
  using (id = auth.uid() or public.usuario_activo());
create policy "admin_edita_perfiles" on perfiles for update to authenticated
  using (public.es_admin()) with check (public.es_admin());

-- Las vistas respetan los permisos de quien consulta
alter view v_cuadre_transacciones   set (security_invoker = on);
alter view v_saldo_cuentas          set (security_invoker = on);
alter view v_facturas_pendientes    set (security_invoker = on);
alter view v_resultado_centro_costo set (security_invoker = on);
alter view v_cheques_vigentes       set (security_invoker = on);
