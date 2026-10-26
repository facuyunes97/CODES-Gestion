-- Facturas recopiladas: emitidas por CODES (debito) y recibidas (credito). Ya aplicado en codes-gestion.
alter table public.facturas_recopiladas add column if not exists lado text not null default 'credito' check (lado in ('credito','debito'));
comment on column public.facturas_recopiladas.lado is 'credito = recibida (compra, genera crédito fiscal); debito = emitida por CODES (venta, genera débito fiscal). En debito, emisor_cuit/emisor_razon son los del cliente.';
