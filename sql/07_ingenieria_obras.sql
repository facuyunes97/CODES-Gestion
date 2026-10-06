-- Ingeniería / Obras: roles Ingeniero y Operario, contratistas, certificaciones, combustible y arreglos.
-- (en la base real se aplicó en cinco migraciones: ingenieria_funciones_y_roles, ingenieria_tablas_nuevas,
--  ingenieria_politicas_nuevas, ingenieria_lectura_restringida, ingenieria_datos_maquina)

-- 1) Roles nuevos
alter table perfiles drop constraint perfiles_rol_check;
alter table perfiles add constraint perfiles_rol_check
  check (rol in ('dueno','contador','lector','ingeniero','operario'));

create or replace function rol_actual() returns text language sql stable security definer set search_path = public as
$$ select rol from perfiles where id = auth.uid() and activo; $$;
create or replace function es_admin_lectura() returns boolean language sql stable security definer set search_path = public as
$$ select coalesce(public.rol_actual() in ('dueno','contador','lector'), false); $$;          -- ve Administración
create or replace function ve_ingenieria() returns boolean language sql stable security definer set search_path = public as
$$ select coalesce(public.rol_actual() in ('dueno','contador','lector','ingeniero'), false); $$;  -- lee Ingeniería/Obras
create or replace function maneja_ingenieria() returns boolean language sql stable security definer set search_path = public as
$$ select coalesce(public.rol_actual() in ('dueno','ingeniero'), false); $$;                   -- modifica y elimina
create or replace function carga_maquinaria() returns boolean language sql stable security definer set search_path = public as
$$ select coalesce(public.rol_actual() in ('dueno','ingeniero','operario'), false); $$;        -- combustible y arreglos
create or replace function poner_autor() returns trigger language plpgsql security definer set search_path = public as
$$ begin new.created_by := auth.uid(); new.iniciales := (select iniciales from perfiles where id = auth.uid()); return new; end $$;

-- 2) Tablas (obras y máquinas son centros de costo de tipo 'obra' y 'maquina')
create table contratistas (
  id uuid primary key default gen_random_uuid(),
  nombre text not null, cuit text, telefono text,
  obra_id uuid not null references centros_costo(id),
  trabajo text, tiempo_estimado_dias integer check (tiempo_estimado_dias is null or tiempo_estimado_dias > 0),
  monto numeric not null check (monto > 0),
  estado text not null default 'activo' check (estado in ('activo','finalizado')),
  observaciones text,
  created_by uuid references perfiles(id), iniciales varchar, created_at timestamptz not null default now());
create table certificaciones (
  id uuid primary key default gen_random_uuid(),
  contratista_id uuid not null references contratistas(id),
  fecha date not null,
  avance_pct numeric not null check (avance_pct >= 0 and avance_pct <= 100),   -- avance acumulado
  monto numeric not null check (monto >= 0),
  observaciones text,
  created_by uuid references perfiles(id), iniciales varchar, created_at timestamptz not null default now());
create table combustible_cargas (
  id uuid primary key default gen_random_uuid(),
  maquina_id uuid not null references centros_costo(id),
  fecha_hora timestamptz not null,
  litros numeric not null check (litros > 0),
  observaciones text,
  created_by uuid references perfiles(id), iniciales varchar, created_at timestamptz not null default now());
create table maquinaria_arreglos (
  id uuid primary key default gen_random_uuid(),
  maquina_id uuid not null references centros_costo(id),
  fecha_hora timestamptz not null,
  descripcion text not null,
  costo numeric check (costo is null or costo >= 0),
  created_by uuid references perfiles(id), iniciales varchar, created_at timestamptz not null default now());

do $$ declare t text; begin
  foreach t in array array['contratistas','certificaciones','combustible_cargas','maquinaria_arreglos'] loop
    execute format('alter table %I enable row level security', t);
    execute format('create policy ver on %I for select using (%s)', t,
      case when t in ('combustible_cargas','maquinaria_arreglos') then $q$ve_ingenieria() or rol_actual() = 'operario'$q$ else 've_ingenieria()' end);
    execute format('create policy cargar on %I for insert with check (%s)', t,
      case when t in ('combustible_cargas','maquinaria_arreglos') then 'carga_maquinaria()' else 'maneja_ingenieria()' end);
    execute format('create policy editar on %I for update using (maneja_ingenieria()) with check (maneja_ingenieria())', t);
    execute format('create policy borrar on %I for delete using (maneja_ingenieria())', t);
  end loop;
end $$;
create trigger trg_autor_contratistas before insert on contratistas for each row execute function poner_autor();
create trigger trg_autor_certificaciones before insert on certificaciones for each row execute function poner_autor();
create trigger trg_autor_combustible before insert on combustible_cargas for each row execute function poner_autor();
create trigger trg_autor_arreglos before insert on maquinaria_arreglos for each row execute function poner_autor();
create trigger trg_audit_contratistas after insert or update or delete on contratistas for each row execute function registrar_auditoria();
create trigger trg_audit_certificaciones after insert or update or delete on certificaciones for each row execute function registrar_auditoria();
create trigger trg_audit_combustible after insert or update or delete on combustible_cargas for each row execute function registrar_auditoria();
create trigger trg_audit_arreglos after insert or update or delete on maquinaria_arreglos for each row execute function registrar_auditoria();
alter publication supabase_realtime add table contratistas, certificaciones, combustible_cargas, maquinaria_arreglos;

-- 3) Ingeniero y Operario no ven Administración: políticas RESTRICTIVAS de lectura
do $$ declare t text; begin
  foreach t in array array['transacciones','transaccion_pagos','transaccion_retenciones','transaccion_facturas','cheques','facturas','cuentas','parametros','auditoria'] loop
    execute format('create policy solo_administracion_lee on %I as restrictive for select using (es_admin_lectura())', t);
  end loop;
end $$;
create policy solo_administracion_lee on perfiles as restrictive for select using (id = auth.uid() or es_admin_lectura());
-- el Ingeniero ve clientes (para elegir el de cada obra) y solo obras y máquinas; el Operario solo máquinas
create policy limite_por_rol on terceros as restrictive for select using (
  es_admin_lectura() or (rol_actual() = 'ingeniero' and tipo::text in ('cliente','ambos')));
create policy limite_por_rol on centros_costo as restrictive for select using (
  es_admin_lectura()
  or (rol_actual() = 'ingeniero' and tipo_id in ('obra','maquina'))
  or (rol_actual() = 'operario' and tipo_id = 'maquina'));
create policy ing_ven_centros on centros_costo for select using (rol_actual() = 'ingeniero' and tipo_id in ('obra','maquina'));
create policy operario_ve_maquinas on centros_costo for select using (rol_actual() = 'operario' and tipo_id = 'maquina');
create policy ing_cargan_centros on centros_costo for insert with check (rol_actual() = 'ingeniero' and tipo_id in ('obra','maquina'));

-- 4) Datos de cada máquina y edición por el Ingeniero
alter table centros_costo add column if not exists marca text, add column if not exists modelo text,
  add column if not exists anio integer, add column if not exists patente text, add column if not exists notas text;
create policy ing_edita_centros on centros_costo for update
  using (rol_actual() = 'ingeniero' and tipo_id in ('obra','maquina'))
  with check (rol_actual() = 'ingeniero' and tipo_id in ('obra','maquina'));
