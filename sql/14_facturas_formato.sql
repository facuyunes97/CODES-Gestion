-- Cómo está la factura entregada a la empresa: fisica | digital | arca (solo en ARCA). Lo completa el contador.
alter table public.facturas add column if not exists formato text check (formato in ('fisica','digital','arca'));
alter table public.facturas_recopiladas add column if not exists formato text check (formato in ('fisica','digital','arca'));
alter table public.facturas_recopiladas alter column formato set default 'digital';
