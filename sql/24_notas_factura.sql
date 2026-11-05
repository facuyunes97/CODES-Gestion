-- 24: las notas de crédito / débito apuntan a la factura que corrigen.
-- Sin clave foránea a propósito: la app sincroniza por lotes y la nota podría llegar antes que su factura.
alter table public.facturas add column if not exists factura_afectada_id uuid;
comment on column public.facturas.factura_afectada_id is 'Para notas de crédito/débito: la factura que corrigen.';
create index if not exists facturas_afectada_idx on public.facturas (factura_afectada_id) where factura_afectada_id is not null;
