-- =====================================================================
--  04 · GUARDADO EN TIEMPO REAL (ya aplicado en Supabase: codes-gestion)
--  - tipos_centro: tipos de centro de costo propios (el enum queda de respaldo)
--  - centros_costo.tipo_id: tipo real; el enum `tipo` se completa solo
--  - Tercero ARCA (Impuesto D/C) para las transacciones automáticas
--  - guardar_transaccion(): inserta/actualiza una transacción con sus pagos,
--    retenciones e imputaciones en un solo paso. Si la transacción ya existe,
--    quien llama borra antes sus líneas (solo el dueño puede).
--  - Tiempo real (Realtime) en las tablas principales
-- =====================================================================
create table if not exists tipos_centro (
  id text primary key, nombre text not null,
  lleva_contrato boolean not null default false,
  activo boolean not null default true, created_at timestamptz not null default now());
insert into tipos_centro (id, nombre, lleva_contrato) values
  ('obra','Obra',true),('maquina','Máquina',false),('administracion','Administración',false),('otro','Otro',false)
on conflict (id) do nothing;
alter table tipos_centro enable row level security;
create policy activos_ven    on tipos_centro for select to authenticated using (usuario_activo());
create policy activos_cargan on tipos_centro for insert to authenticated with check (usuario_activo());
create policy solo_dueno     on tipos_centro for all    to authenticated using (es_dueno()) with check (es_dueno());
create trigger trg_audit_tipos_centro after insert or delete or update on tipos_centro
  for each row execute function registrar_auditoria();

alter table centros_costo add column if not exists tipo_id text references tipos_centro(id);
update centros_costo set tipo_id = tipo::text where tipo_id is null;
alter table centros_costo alter column tipo_id set not null;
create or replace function validar_centro_costo() returns trigger
language plpgsql set search_path = public as $$
declare v_obra boolean;
begin
  if new.tipo_id is null then new.tipo_id := new.tipo::text; end if;
  select lleva_contrato into v_obra from tipos_centro where id = new.tipo_id;
  if v_obra is null then raise exception 'Tipo de centro inexistente'; end if;
  if v_obra and (new.cliente_id is null or coalesce(new.valor_contrato,0) <= 0) then
    raise exception 'Este tipo de centro lleva cliente y valor de contrato';
  end if;
  new.tipo := case when new.tipo_id in ('obra','maquina','administracion','otro') then new.tipo_id::tipo_centro_costo else 'otro'::tipo_centro_costo end;
  return new;
end $$;
create or replace trigger trg_validar_centro before insert or update on centros_costo
  for each row execute function validar_centro_costo();

insert into terceros (razon_social, cuit, tipo)
select 'ARCA · Impuesto débitos y créditos', '33-69345023-9', 'proveedor'
where not exists (select 1 from terceros where cuit = '33-69345023-9');

alter publication supabase_realtime add table public.transacciones, public.cheques, public.facturas,
  public.centros_costo, public.terceros, public.cuentas, public.tipos_centro;

create or replace function guardar_transaccion(p jsonb) returns bigint
language plpgsql set search_path = public as $$
declare v_id uuid := (p->>'id')::uuid; v_num bigint; v_existe boolean; v_n int;
begin
  if not usuario_activo() then raise exception 'Usuario no habilitado'; end if;
  select exists(select 1 from transacciones where id = v_id) into v_existe;
  if not v_existe then
    insert into transacciones (id,tipo,fecha,concepto,tercero_id,centro_costo_id,moneda,tipo_cambio,total,observaciones,estado,auto_tipo,padre_id,created_by)
    values (v_id,(p->>'tipo')::tipo_transaccion,(p->>'fecha')::date,p->>'concepto',nullif(p->>'tercero_id','')::uuid,
      (p->>'centro_costo_id')::uuid,coalesce(p->>'moneda','ARS')::moneda,coalesce((p->>'tipo_cambio')::numeric,1),(p->>'total')::numeric,
      nullif(p->>'observaciones',''),coalesce(p->>'estado','activa')::estado_registro,nullif(p->>'auto_tipo',''),nullif(p->>'padre_id','')::uuid,auth.uid())
    returning numero into v_num;
  else
    update transacciones set tipo=(p->>'tipo')::tipo_transaccion, fecha=(p->>'fecha')::date, concepto=p->>'concepto',
      tercero_id=nullif(p->>'tercero_id','')::uuid, centro_costo_id=(p->>'centro_costo_id')::uuid,
      moneda=coalesce(p->>'moneda','ARS')::moneda, tipo_cambio=coalesce((p->>'tipo_cambio')::numeric,1), total=(p->>'total')::numeric,
      observaciones=nullif(p->>'observaciones',''), estado=coalesce(p->>'estado','activa')::estado_registro
    where id = v_id returning numero into v_num;
    get diagnostics v_n = row_count;
    if v_n = 0 then raise exception 'Solo el dueño puede modificar una transacción'; end if;
  end if;
  insert into transaccion_pagos (transaccion_id,medio,cuenta_origen_id,cuenta_destino_id,cheque_id,importe,referencia)
    select v_id,(x->>'medio')::medio_pago,nullif(x->>'cuenta_origen_id','')::uuid,nullif(x->>'cuenta_destino_id','')::uuid,
           nullif(x->>'cheque_id','')::uuid,(x->>'importe')::numeric,nullif(x->>'referencia','')
    from jsonb_array_elements(coalesce(p->'pagos','[]')) x;
  insert into transaccion_retenciones (transaccion_id,clase,impuesto,jurisdiccion,numero_certificado,importe)
    select v_id,(x->>'clase')::clase_impuesto,(x->>'impuesto')::impuesto,nullif(x->>'jurisdiccion',''),nullif(x->>'numero_certificado',''),(x->>'importe')::numeric
    from jsonb_array_elements(coalesce(p->'rets','[]')) x;
  insert into transaccion_facturas (transaccion_id,factura_id,importe_imputado)
    select v_id,(x->>'factura_id')::uuid,(x->>'importe')::numeric
    from jsonb_array_elements(coalesce(p->'facts','[]')) x;
  return v_num;
end $$;
grant execute on function guardar_transaccion(jsonb) to authenticated;
