-- =====================================================================
--  SISTEMA DE GESTIÓN - CODES SRL
--  Módulo: Transacciones (entradas, salidas, movimientos internos)
--  Motor: PostgreSQL / Supabase
-- =====================================================================

-- ---------------------------------------------------------------------
-- 0. TIPOS (listas cerradas)
-- ---------------------------------------------------------------------
create type tipo_transaccion  as enum ('entrada', 'salida', 'interna');
create type tipo_tercero      as enum ('cliente', 'proveedor', 'ambos');
create type tipo_centro_costo as enum ('obra', 'maquina', 'administracion', 'otro');
create type tipo_cuenta       as enum ('caja', 'banco', 'billetera_virtual', 'cartera_cheques');
create type moneda            as enum ('ARS', 'USD', 'EUR');
create type medio_pago        as enum ('efectivo', 'transferencia', 'cheque', 'echeq',
                                       'deposito', 'extraccion', 'tarjeta', 'debito', 'otro');
create type tipo_cheque       as enum ('fisico', 'echeq');
create type origen_cheque     as enum ('propio', 'tercero');
create type estado_cheque     as enum ('en_cartera', 'depositado', 'endosado', 'cobrado',
                                       'emitido', 'debitado', 'rechazado', 'anulado');
create type tipo_factura      as enum ('A', 'B', 'C', 'M', 'E', 'NC_A', 'NC_B', 'NC_C',
                                       'ND_A', 'ND_B', 'ND_C', 'recibo', 'otro');
create type lado_fiscal       as enum ('debito', 'credito');   -- débito = emitida (venta), crédito = recibida (compra)
create type clase_impuesto    as enum ('retencion', 'percepcion');
create type impuesto          as enum ('iva', 'ganancias', 'iibb', 'suss', 'otro');
create type estado_registro   as enum ('activa', 'anulada');


-- ---------------------------------------------------------------------
-- 1. USUARIOS (perfil sobre auth.users de Supabase)
-- ---------------------------------------------------------------------
create table perfiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  nombre     text not null,
  iniciales  varchar(4) not null,
  activo     boolean not null default true,
  created_at timestamptz not null default now()
);


-- ---------------------------------------------------------------------
-- 2. MAESTROS
-- ---------------------------------------------------------------------
create table terceros (
  id              uuid primary key default gen_random_uuid(),
  razon_social    text not null,
  cuit            varchar(13) unique,              -- formato 30-12345678-9
  tipo            tipo_tercero not null,
  condicion_iva   text,                            -- RI, Monotributo, Exento, CF
  email           text,
  telefono        text,
  direccion       text,
  activo          boolean not null default true,
  created_by      uuid default auth.uid() references perfiles(id),
  created_at      timestamptz not null default now()
);

create table centros_costo (
  id          uuid primary key default gen_random_uuid(),
  codigo      varchar(20) unique,
  nombre      text not null,
  tipo        tipo_centro_costo not null,
  cliente_id  uuid,                                    -- obras: cliente al que se le factura
  valor_contrato numeric(15,2),                        -- obras: total a cobrar (con IVA)
  activo      boolean not null default true,
  created_at  timestamptz not null default now()
);

-- Cajas, bancos, billeteras y la "cartera de cheques" son todas cuentas:
-- así cualquier movimiento es "sale de una cuenta / entra a otra".
create table cuentas (
  id          uuid primary key default gen_random_uuid(),
  nombre      text not null unique,
  tipo        tipo_cuenta not null,
  moneda      moneda not null default 'ARS',
  cbu_alias   text,
  grava_idc   boolean not null default false,       -- paga impuesto a los débitos y créditos (Ley 25.413)
  activa      boolean not null default true,
  created_at  timestamptz not null default now()
);


alter table centros_costo add constraint fk_cc_cliente foreign key (cliente_id) references terceros(id);
alter table centros_costo add constraint chk_obra_contrato check (tipo <> 'obra' or (cliente_id is not null and valor_contrato > 0));

-- Parámetros generales (alícuota del impuesto D/C, etc.)
create table parametros (
  clave  text primary key,
  valor  numeric not null,
  nota   text
);
insert into parametros values ('alicuota_impuesto_dc', 0.6, 'Ley 25.413: % por cada débito y cada crédito bancario');

-- ---------------------------------------------------------------------
-- 3. CHEQUES Y ECHEQS (con estado y trazabilidad)
-- ---------------------------------------------------------------------
create table cheques (
  id              uuid primary key default gen_random_uuid(),
  tipo            tipo_cheque not null,
  origen          origen_cheque not null,
  numero          text not null,
  banco           text,
  librador        text,                          -- quien lo firma
  librador_cuit   varchar(13),
  fecha_emision   date,
  fecha_pago      date not null,                 -- fecha de cobro / vencimiento
  importe         numeric(15,2) not null check (importe > 0),
  moneda          moneda not null default 'ARS',
  estado          estado_cheque not null,
  cuenta_propia_id uuid references cuentas(id),  -- para cheques propios: de qué banco sale
  observaciones   text,
  created_by      uuid default auth.uid() references perfiles(id),
  created_at      timestamptz not null default now(),
  unique (tipo, banco, numero)
);


-- ---------------------------------------------------------------------
-- 4. FACTURAS (opcionales; se vinculan a transacciones)
-- ---------------------------------------------------------------------
create table facturas (
  id              uuid primary key default gen_random_uuid(),
  tercero_id      uuid not null references terceros(id),
  lado            lado_fiscal not null,
  tipo            tipo_factura not null,
  punto_venta     integer,
  numero          bigint,
  fecha           date not null,
  neto_gravado    numeric(15,2) not null default 0,
  no_gravado      numeric(15,2) not null default 0,
  iva             numeric(15,2) not null default 0,
  otros_tributos  numeric(15,2) not null default 0,
  total           numeric(15,2) not null,
  moneda          moneda not null default 'ARS',
  tipo_cambio     numeric(15,4) not null default 1,
  centro_costo_id uuid references centros_costo(id),
  archivo_url     text,                            -- PDF/imagen en Supabase Storage
  estado          estado_registro not null default 'activa',
  created_by      uuid default auth.uid() references perfiles(id),
  created_at      timestamptz not null default now(),
  unique (tercero_id, lado, tipo, punto_venta, numero)
);


-- ---------------------------------------------------------------------
-- 5. TRANSACCIONES (cabecera)
-- ---------------------------------------------------------------------
create table transacciones (
  id               uuid primary key default gen_random_uuid(),
  numero           bigint generated always as identity unique,   -- nro interno correlativo
  tipo             tipo_transaccion not null,
  fecha            date not null default current_date,
  concepto         text not null,
  tercero_id       uuid references terceros(id),
  centro_costo_id  uuid not null references centros_costo(id),   -- SIEMPRE obligatorio
  moneda           moneda not null default 'ARS',
  tipo_cambio      numeric(15,4) not null default 1 check (tipo_cambio > 0),
  total            numeric(15,2) not null check (total > 0),
  observaciones    text,
  estado           estado_registro not null default 'activa',
  anula_a_id       uuid references transacciones(id),            -- contra-asiento
  auto_tipo        text check (auto_tipo in ('impuesto_dc')),     -- generada por el sistema
  padre_id         uuid references transacciones(id),            -- transacción que la originó
  created_by       uuid default auth.uid() references perfiles(id),
  created_at       timestamptz not null default now(),

  -- entrada/salida llevan cliente o proveedor; interna no lleva tercero
  constraint chk_tercero_segun_tipo check (
    (tipo in ('entrada','salida') and tercero_id is not null)
    or (tipo = 'interna' and tercero_id is null)
  )
);

create index on transacciones (fecha);
create index on transacciones (tercero_id);
create index on transacciones (centro_costo_id);


-- ---------------------------------------------------------------------
-- 6. LÍNEAS DE PAGO (una transacción puede tener varias formas de pago)
--    Regla: entrada -> cuenta_destino ; salida -> cuenta_origen ;
--           interna -> origen y destino.
-- ---------------------------------------------------------------------
create table transaccion_pagos (
  id                 uuid primary key default gen_random_uuid(),
  transaccion_id     uuid not null references transacciones(id) on delete cascade,
  medio              medio_pago not null,
  cuenta_origen_id   uuid references cuentas(id),
  cuenta_destino_id  uuid references cuentas(id),
  cheque_id          uuid references cheques(id),
  importe            numeric(15,2) not null check (importe > 0),
  referencia         text,                      -- nro de transferencia, comprobante, etc.

  constraint chk_cheque_si_corresponde check (
    (medio in ('cheque','echeq') and cheque_id is not null)
    or (medio not in ('cheque','echeq'))
  ),
  constraint chk_alguna_cuenta check (
    cuenta_origen_id is not null or cuenta_destino_id is not null
  ),
  constraint chk_cuentas_distintas check (
    cuenta_origen_id is distinct from cuenta_destino_id
  )
);

-- Valida origen/destino según el tipo de transacción y la forma de pago:
--   efectivo -> solo cajas (Caja General / Caja Dólares)
--   transferencia, tarjeta, depósito de cliente -> bancos o Mercado Pago
--   cheque/echeq -> cartera de cheques (de terceros) o banco (propios / depósito)
--   extracción: banco -> caja ; depósito interno: caja -> banco
create or replace function validar_linea_pago() returns trigger
language plpgsql as $$
declare
  v_tipo tipo_transaccion;
  t_ori  tipo_cuenta;
  t_des  tipo_cuenta;
  es_banco_ori boolean; es_banco_des boolean;
begin
  select tipo into v_tipo from transacciones where id = new.transaccion_id;
  select tipo into t_ori from cuentas where id = new.cuenta_origen_id;
  select tipo into t_des from cuentas where id = new.cuenta_destino_id;
  es_banco_ori := t_ori in ('banco','billetera_virtual');
  es_banco_des := t_des in ('banco','billetera_virtual');

  if v_tipo = 'entrada' and new.cuenta_destino_id is null then
    raise exception 'En un INGRESO la línea de pago debe indicar la cuenta destino';
  elsif v_tipo = 'salida' and new.cuenta_origen_id is null then
    raise exception 'En un EGRESO la línea de pago debe indicar la cuenta origen';
  elsif v_tipo = 'interna' and (new.cuenta_origen_id is null or new.cuenta_destino_id is null) then
    raise exception 'En un MOVIMIENTO INTERNO hay que indicar cuenta origen y destino';
  end if;

  if new.medio = 'otro' then return new; end if;

  if new.medio = 'debito' and not es_banco_ori then
    raise exception 'El débito bancario sale de un banco o Mercado Pago';
  end if;

  if new.medio = 'extraccion' and v_tipo <> 'interna' then
    raise exception 'La extracción solo se usa en movimientos internos';
  end if;

  if new.medio = 'efectivo' and ((t_ori is not null and t_ori <> 'caja') or (t_des is not null and t_des <> 'caja')) then
    raise exception 'El efectivo solo puede moverse por Caja General o Caja Dólares';
  elsif new.medio in ('transferencia','tarjeta') and ((t_ori is not null and not es_banco_ori) or (t_des is not null and not es_banco_des)) then
    raise exception 'Las transferencias y tarjetas van por Banco Patagonia, Banco Santiago del Estero o Mercado Pago';
  elsif new.medio = 'extraccion' and not (es_banco_ori and t_des = 'caja') then
    raise exception 'La extracción va de un banco a una caja';
  elsif new.medio = 'deposito' and v_tipo = 'interna' and not (t_ori = 'caja' and es_banco_des) then
    raise exception 'El depósito interno va de una caja a un banco';
  elsif new.medio = 'deposito' and v_tipo = 'entrada' and not es_banco_des then
    raise exception 'El depósito de un cliente entra a un banco o Mercado Pago';
  elsif new.medio in ('cheque','echeq') and (
        (v_tipo = 'entrada' and t_des <> 'cartera_cheques')
     or (v_tipo = 'salida'  and not (t_ori = 'cartera_cheques' or es_banco_ori))
     or (v_tipo = 'interna' and not (t_ori = 'cartera_cheques' and es_banco_des))) then
    raise exception 'Los cheques recibidos entran a la cartera; los propios salen de un banco; el depósito va de la cartera a un banco';
  end if;
  return new;
end $$;

create trigger trg_validar_linea_pago
  before insert or update on transaccion_pagos
  for each row execute function validar_linea_pago();


-- ---------------------------------------------------------------------
-- 7. RETENCIONES Y PERCEPCIONES (carga MANUAL, opcional)
-- ---------------------------------------------------------------------
create table transaccion_retenciones (
  id                  uuid primary key default gen_random_uuid(),
  transaccion_id      uuid not null references transacciones(id) on delete cascade,
  clase               clase_impuesto not null,
  impuesto            impuesto not null,
  jurisdiccion        text,                    -- para IIBB: provincia
  numero_certificado  text,
  importe             numeric(15,2) not null check (importe > 0),
  observaciones       text
);


-- ---------------------------------------------------------------------
-- 8. IMPUTACIÓN TRANSACCIÓN <-> FACTURA (opcional, muchos a muchos)
-- ---------------------------------------------------------------------
create table transaccion_facturas (
  transaccion_id   uuid not null references transacciones(id) on delete cascade,
  factura_id       uuid not null references facturas(id),
  importe_imputado numeric(15,2) not null check (importe_imputado > 0),
  primary key (transaccion_id, factura_id)
);


-- ---------------------------------------------------------------------
-- 9. AUDITORÍA (quién hizo qué, con iniciales)
-- ---------------------------------------------------------------------
create table auditoria (
  id           bigint generated always as identity primary key,
  tabla        text not null,
  registro_id  text,
  accion       text not null,                 -- INSERT / UPDATE / DELETE
  datos_antes  jsonb,
  datos_despues jsonb,
  usuario_id   uuid,
  iniciales    varchar(4),
  fecha        timestamptz not null default now()
);

create or replace function registrar_auditoria() returns trigger
language plpgsql security definer set search_path = public as $$
declare v_ini varchar(4);
begin
  select iniciales into v_ini from perfiles where id = auth.uid();
  insert into auditoria (tabla, registro_id, accion, datos_antes, datos_despues, usuario_id, iniciales)
  values (
    tg_table_name,
    coalesce((to_jsonb(new)->>'id'), (to_jsonb(old)->>'id'),
             (to_jsonb(new)->>'transaccion_id'), (to_jsonb(old)->>'transaccion_id')),
    tg_op,
    case when tg_op in ('UPDATE','DELETE') then to_jsonb(old) end,
    case when tg_op in ('INSERT','UPDATE') then to_jsonb(new) end,
    auth.uid(),
    v_ini
  );
  return coalesce(new, old);
end $$;

do $$
declare t text;
begin
  foreach t in array array['terceros','centros_costo','cuentas','cheques','facturas',
                           'transacciones','transaccion_pagos','transaccion_retenciones',
                           'transaccion_facturas']
  loop
    execute format('create trigger trg_audit_%1$s after insert or update or delete on %1$s
                    for each row execute function registrar_auditoria()', t);
  end loop;
end $$;


-- ---------------------------------------------------------------------
-- 10. VISTAS DE CONTROL
-- ---------------------------------------------------------------------

-- Cuadre: total = pagos + retenciones/percepciones (marca diferencias, no bloquea)
create or replace view v_cuadre_transacciones as
select t.id, t.numero, t.fecha, t.tipo, t.concepto, t.total,
       coalesce(p.pagado, 0)    as total_pagos,
       coalesce(r.retenido, 0)  as total_retenciones,
       t.total - coalesce(p.pagado, 0) - coalesce(r.retenido, 0) as diferencia
from transacciones t
left join (select transaccion_id, sum(importe) pagado   from transaccion_pagos       group by 1) p on p.transaccion_id = t.id
left join (select transaccion_id, sum(importe) retenido from transaccion_retenciones group by 1) r on r.transaccion_id = t.id
where t.estado = 'activa';

-- Saldo de cada cuenta (caja, bancos, MP, cartera de cheques)
create or replace view v_saldo_cuentas as
select c.id, c.nombre, c.tipo, c.moneda,
       coalesce(sum(case when p.cuenta_destino_id = c.id then p.importe end), 0)
     - coalesce(sum(case when p.cuenta_origen_id  = c.id then p.importe end), 0) as saldo
from cuentas c
left join transaccion_pagos p on c.id in (p.cuenta_origen_id, p.cuenta_destino_id)
left join transacciones t on t.id = p.transaccion_id and t.estado = 'activa'
where p.id is null or t.id is not null
group by c.id, c.nombre, c.tipo, c.moneda;

-- Facturas con saldo pendiente (base de la cuenta corriente)
create or replace view v_facturas_pendientes as
select f.id, f.lado, f.tipo, f.punto_venta, f.numero, f.fecha,
       te.razon_social, f.total,
       coalesce(sum(tf.importe_imputado) filter (where t.estado = 'activa'), 0) as imputado,
       f.total - coalesce(sum(tf.importe_imputado) filter (where t.estado = 'activa'), 0) as saldo
from facturas f
join terceros te on te.id = f.tercero_id
left join transaccion_facturas tf on tf.factura_id = f.id
left join transacciones t on t.id = tf.transaccion_id
where f.estado = 'activa'
group by f.id, te.razon_social;

-- Gastos e ingresos por centro de costo (en pesos)
create or replace view v_resultado_centro_costo as
select cc.id, cc.codigo, cc.nombre, cc.tipo, cc.cliente_id, cc.valor_contrato,
       coalesce(sum(case when t.tipo = 'entrada' then t.total * t.tipo_cambio end), 0) as ingresos_ars,
       coalesce(sum(case when t.tipo = 'salida'  then t.total * t.tipo_cambio end), 0) as egresos_ars,
       cc.valor_contrato
         - coalesce(sum(case when t.tipo = 'entrada' then t.total * t.tipo_cambio end), 0) as saldo_pendiente
from centros_costo cc
left join transacciones t on t.centro_costo_id = cc.id and t.estado = 'activa'
group by cc.id;

-- Cheques en cartera / próximos vencimientos
create or replace view v_cheques_vigentes as
select * from cheques
where estado in ('en_cartera', 'emitido')
order by fecha_pago;


-- ---------------------------------------------------------------------
-- 11. SEGURIDAD (RLS): solo usuarios logueados
-- ---------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array['perfiles','terceros','centros_costo','cuentas','cheques','facturas',
                           'transacciones','transaccion_pagos','transaccion_retenciones',
                           'transaccion_facturas','auditoria']
  loop
    execute format('alter table %I enable row level security', t);
    execute format('create policy "usuarios_autenticados" on %I for all to authenticated using (true) with check (true)', t);
  end loop;
end $$;

-- La auditoría es de solo lectura para los usuarios
drop policy "usuarios_autenticados" on auditoria;
create policy "auditoria_lectura" on auditoria for select to authenticated using (true);


-- ---------------------------------------------------------------------
-- 12. DATOS INICIALES
-- ---------------------------------------------------------------------
insert into cuentas (nombre, tipo, moneda, grava_idc) values
  ('Caja General',               'caja',              'ARS', false),
  ('Caja Dólares',               'caja',              'USD', false),
  ('Banco Patagonia',            'banco',             'ARS', true),
  ('Banco Santiago del Estero',  'banco',             'ARS', true),
  ('Mercado Pago',               'billetera_virtual', 'ARS', false),
  ('Cartera de Cheques',         'cartera_cheques',   'ARS', false);

insert into centros_costo (codigo, nombre, tipo) values
  ('ADM', 'Administración general', 'administracion');
