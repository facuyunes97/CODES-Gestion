-- 24: notas de crédito / débito asociadas a facturas (criterio ARCA, RG 4540/2019).
-- Una nota se asocia a una o más facturas del mismo cliente/proveedor, o al período que ajusta.
-- Sin clave foránea a propósito: la app sincroniza por lotes y la nota podría llegar antes que su factura.
alter table public.facturas add column if not exists facturas_afectadas uuid[] not null default '{}';
alter table public.facturas add column if not exists periodo_ajustado text;
alter table public.facturas add column if not exists afecta_previa boolean not null default false;
alter table public.facturas drop constraint if exists facturas_periodo_ajustado_formato;
alter table public.facturas add constraint facturas_periodo_ajustado_formato check (periodo_ajustado is null or periodo_ajustado ~ '^[0-9]{4}-(0[1-9]|1[0-2])$');
