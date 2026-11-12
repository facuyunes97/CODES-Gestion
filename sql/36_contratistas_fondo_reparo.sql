-- Codes 1.85 (documentación; ya aplicado como migración 36)
alter table public.contratistas add column if not exists fondo_reparo_pct numeric(5,2) not null default 0 check (fondo_reparo_pct >= 0 and fondo_reparo_pct <= 100);
