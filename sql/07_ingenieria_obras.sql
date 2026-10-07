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

-- 5) Segunda tanda (migraciones ingenieria_v2_tablas, ingenieria_v2_reglas e ingenieria_v2_quita_check_obra)
alter table combustible_cargas
  add column if not exists tipo_combustible text check (tipo_combustible in ('nafta','diesel_500','diesel_premium')),
  add column if not exists obra_id uuid references centros_costo(id),
  add column if not exists precio_litro numeric check (precio_litro is null or precio_litro >= 0);
create table precios_combustible (id text primary key check (id in ('nafta','diesel_500','diesel_premium')),
  precio numeric not null default 0 check (precio >= 0), updated_at timestamptz not null default now());
insert into precios_combustible (id) values ('nafta'),('diesel_500'),('diesel_premium');
alter table precios_combustible enable row level security;
create policy ver on precios_combustible for select using (usuario_activo());          -- todos los activos (el operario ve el total)
create policy cargar on precios_combustible for insert with check (puede_cargar());    -- solo dueño y contador
create policy editar on precios_combustible for update using (puede_cargar()) with check (puede_cargar());
create trigger trg_audit_precios after insert or update or delete on precios_combustible for each row execute function registrar_auditoria();
create table anticipos_obra (
  id uuid primary key default gen_random_uuid(),
  contratista_id uuid not null references contratistas(id),
  fecha date not null, monto numeric not null check (monto > 0), observaciones text,
  created_by uuid references perfiles(id), iniciales varchar, created_at timestamptz not null default now());
alter table anticipos_obra enable row level security;
create policy ver on anticipos_obra for select using (ve_ingenieria());
create policy cargar on anticipos_obra for insert with check (maneja_ingenieria());
create policy editar on anticipos_obra for update using (maneja_ingenieria()) with check (maneja_ingenieria());
create policy borrar on anticipos_obra for delete using (maneja_ingenieria());
create trigger trg_autor_anticipos before insert on anticipos_obra for each row execute function poner_autor();
create trigger trg_audit_anticipos after insert or update or delete on anticipos_obra for each row execute function registrar_auditoria();
alter publication supabase_realtime add table anticipos_obra, precios_combustible;
alter table certificaciones add column if not exists descuento_anticipo numeric not null default 0 check (descuento_anticipo >= 0);
-- el precio por litro lo fija el servidor al cargar (el operario no puede alterarlo)
create function fijar_precio_combustible() returns trigger language plpgsql security definer set search_path = public as
$$ begin new.precio_litro := coalesce((select precio from precios_combustible where id = new.tipo_combustible), 0); return new; end $$;
create trigger trg_precio_combustible before insert on combustible_cargas for each row execute function fijar_precio_combustible();
-- el Ingeniero no ve ni cambia el valor de contrato: crea obras sin contrato y no puede modificarlo
alter table centros_costo drop constraint chk_obra_contrato;   -- lo reemplaza el trigger validar_centro_costo()
create or replace function validar_centro_costo() returns trigger language plpgsql set search_path = public as
$$ declare v_obra boolean; v_ing boolean;
begin
  v_ing := coalesce(public.rol_actual() = 'ingeniero', false);
  if new.tipo_id is null then new.tipo_id := new.tipo::text; end if;
  select lleva_contrato into v_obra from tipos_centro where id = new.tipo_id;
  if v_obra is null then raise exception 'Tipo de centro inexistente'; end if;
  if v_ing then
    if tg_op = 'INSERT' then new.valor_contrato := null; else new.valor_contrato := old.valor_contrato; new.cliente_id := old.cliente_id; end if;
  elsif v_obra and (new.cliente_id is null or coalesce(new.valor_contrato,0) <= 0) then
    raise exception 'Este tipo de centro lleva cliente y valor de contrato';
  end if;
  new.tipo := case when new.tipo_id in ('obra','maquina','administracion','otro') then new.tipo_id::tipo_centro_costo else 'otro'::tipo_centro_costo end;
  return new;
end $$;
-- el Operario ve máquinas y obras (código y nombre; la pantalla no muestra el contrato)
alter policy operario_ve_maquinas on centros_costo using (rol_actual() = 'operario' and tipo_id in ('maquina','obra'));
alter policy limite_por_rol on centros_costo using (es_admin_lectura()
  or (rol_actual() = 'ingeniero' and tipo_id in ('obra','maquina')) or (rol_actual() = 'operario' and tipo_id in ('maquina','obra')));

-- 6) Contratistas como proveedores (migración contratistas_como_proveedores)
alter table contratistas add column if not exists tercero_id uuid references terceros(id);
create function contratista_proveedor() returns trigger language plpgsql security definer set search_path = public as
$$ begin
  if new.tercero_id is null then
    if new.cuit is not null and btrim(new.cuit) <> '' then select id into new.tercero_id from terceros where cuit = new.cuit limit 1; end if;
    if new.tercero_id is null then
      insert into terceros (razon_social, cuit, tipo) values (new.nombre, nullif(btrim(coalesce(new.cuit,'')),''), 'proveedor') returning id into new.tercero_id;
    end if;
  end if;
  return new;
end $$;
create trigger trg_contratista_proveedor before insert on contratistas for each row execute function contratista_proveedor();
-- (además se creó el proveedor de cada contratista que ya existía)
create function pagos_contratistas() returns table (contratista_id uuid, total numeric, cantidad integer)
language sql stable security definer set search_path = public as
$$ select c.id, coalesce(sum(t.total * t.tipo_cambio), 0), count(t.id)::integer
   from contratistas c left join transacciones t on t.tercero_id = c.tercero_id and t.tipo = 'salida' and t.estado = 'activa'
   where public.ve_ingenieria() group by c.id $$;
revoke all on function pagos_contratistas() from public, anon;
grant execute on function pagos_contratistas() to authenticated;

-- v3: adjuntos en certificaciones (foto/PDF por avance) -----------------------
alter table public.certificaciones add column if not exists adjuntos jsonb not null default '[]'::jsonb;
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('adjuntos-obra','adjuntos-obra',false,10485760,array['application/pdf','image/jpeg','image/png','image/webp','image/heic'])
on conflict (id) do nothing;
create policy adjuntos_obra_select on storage.objects for select to authenticated using (bucket_id='adjuntos-obra' and public.ve_ingenieria());
create policy adjuntos_obra_insert on storage.objects for insert to authenticated with check (bucket_id='adjuntos-obra' and public.maneja_ingenieria());
create policy adjuntos_obra_delete on storage.objects for delete to authenticated using (bucket_id='adjuntos-obra' and public.maneja_ingenieria());

-- v4: backups semanales (tablas, funciones y cron aplicados en producción) -----
-- tablas public.backups (metadatos: lee admin) y public.backups_datos (JSON completo: lee solo el dueño)
-- funciones hacer_backup_interno(tipo) (solo cron/servidor) y hacer_backup_manual() (solo dueño)
-- select cron.schedule('backup-semanal','0 6 * * 0',$$select public.hacer_backup_interno('automatico')$$);  -- domingos 03:00 Argentina
